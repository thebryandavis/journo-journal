import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { query } from '@/lib/db';
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const noteId = request.nextUrl.searchParams.get('note_id');

    if (!noteId) {
      return NextResponse.json(
        { error: 'note_id is required' },
        { status: 400 }
      );
    }

    // Get the current note's tags
    const tagsResult = await query(
      'SELECT tag_name FROM tags WHERE note_id = $1',
      [noteId]
    );

    if (tagsResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        relatedNotes: [],
      });
    }

    const tags = tagsResult.rows.map((row: any) => row.tag_name);

    // Find notes with similar tags
    const relatedResult = await query(
      `SELECT DISTINCT
        n.id,
        n.title,
        n.type,
        n.created_at,
        n.updated_at,
        COUNT(t.id) as matching_tags
      FROM notes n
      INNER JOIN tags t ON n.id = t.note_id
      WHERE n.user_id = $1
        AND n.id != $2
        AND t.tag_name = ANY($3)
      GROUP BY n.id
      ORDER BY matching_tags DESC, n.updated_at DESC
      LIMIT 5`,
      [userId, noteId, tags]
    );

    return NextResponse.json({
      success: true,
      relatedNotes: relatedResult.rows,
    });
  } catch (error) {
    console.error('Error finding related notes:', error);
    return NextResponse.json(
      { error: 'Failed to find related notes' },
      { status: 500 }
    );
  }
}
