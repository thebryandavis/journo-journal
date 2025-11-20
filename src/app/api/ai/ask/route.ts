import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { openai } from '@/lib/ai/openai';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { question, note_id, use_all_notes = false } = body;

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    let context = '';

    if (note_id) {
      // Get specific note
      const noteResult = await query(
        'SELECT title, content FROM notes WHERE id = $1 AND user_id = $2',
        [note_id, userId]
      );

      if (noteResult.rows.length === 0) {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 });
      }

      const note = noteResult.rows[0];
      context = `Title: ${note.title}\n\nContent: ${note.content}`;
    } else if (use_all_notes) {
      // Get all notes for context (limited to recent ones)
      const notesResult = await query(
        `SELECT title, content FROM notes
         WHERE user_id = $1
         ORDER BY updated_at DESC
         LIMIT 10`,
        [userId]
      );

      context = notesResult.rows
        .map((note: any) => `Title: ${note.title}\n\nContent: ${note.content.slice(0, 500)}`)
        .join('\n\n---\n\n');
    } else {
      return NextResponse.json(
        { error: 'Must provide note_id or set use_all_notes to true' },
        { status: 400 }
      );
    }

    const answer = await openai.askQuestion(question, context);

    return NextResponse.json({
      success: true,
      answer,
    });
  } catch (error) {
    console.error('Error answering question:', error);
    return NextResponse.json(
      { error: 'Failed to answer question' },
      { status: 500 }
    );
  }
}
