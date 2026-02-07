import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { query } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { deepgram } from '@/lib/ai/deepgram';
import { validateAudioFile, saveUploadedFile } from '@/lib/uploads';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const workspaceId = (session.user as any).workspaceId;

    const formData = await request.formData();
    const file = formData.get('audio') as File | null;
    const customTitle = formData.get('title') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    const validation = validateAudioFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Save file to disk
    const { relativePath } = await saveUploadedFile(file, userId);

    // Transcribe with Deepgram
    const audioBuffer = Buffer.from(await file.arrayBuffer());
    const transcription = await deepgram.transcribeAudio(audioBuffer, file.type);

    // Generate title
    const title = customTitle?.trim()
      || `Interview - ${new Date().toLocaleDateString('en-US', {
           month: 'short', day: 'numeric', year: 'numeric'
         })}`;

    const wordCount = transcription.transcript
      .split(/\s+/)
      .filter(Boolean).length;

    // Create interview note
    const noteResult = await query(
      `INSERT INTO notes (user_id, workspace_id, title, content, content_html, type, word_count)
       VALUES ($1, $2, $3, $4, $5, 'interview', $6)
       RETURNING *`,
      [userId, workspaceId, title, transcription.transcript, transcription.formattedHtml, wordCount]
    );

    const note = noteResult.rows[0];

    // Create attachment record
    await query(
      `INSERT INTO attachments (note_id, file_url, file_name, file_type, file_size, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        note.id,
        `/api/uploads/${relativePath}`,
        file.name,
        file.type,
        file.size,
        JSON.stringify({
          duration: transcription.duration,
          speakers: transcription.speakers,
          confidence: transcription.confidence,
          segments_count: transcription.segments.length,
        }),
      ]
    );

    return NextResponse.json(
      {
        success: true,
        note,
        transcription: {
          duration: transcription.duration,
          speakers: transcription.speakers,
          confidence: transcription.confidence,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
