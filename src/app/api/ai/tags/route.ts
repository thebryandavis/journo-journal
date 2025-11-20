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

    const body = await request.json();
    const { note_id, title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Generate tags using AI
    const tags = await openai.generateTags(title, content);

    // If note_id is provided, save tags to database
    if (note_id) {
      const userId = (session.user as any).id;

      // Verify note ownership
      const noteCheck = await query(
        'SELECT id FROM notes WHERE id = $1 AND user_id = $2',
        [note_id, userId]
      );

      if (noteCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 });
      }

      // Save tags
      for (const tagName of tags) {
        await query(
          `INSERT INTO tags (note_id, tag_name, auto_generated, confidence_score)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [note_id, tagName, true, 0.9]
        );
      }
    }

    return NextResponse.json({
      success: true,
      tags,
    });
  } catch (error) {
    console.error('Error generating tags:', error);
    return NextResponse.json(
      { error: 'Failed to generate tags' },
      { status: 500 }
    );
  }
}
