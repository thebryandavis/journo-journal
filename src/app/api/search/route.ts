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
    const searchQuery = request.nextUrl.searchParams.get('q');

    if (!searchQuery) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Full-text search using PostgreSQL
    const result = await query(
      `SELECT
        n.*,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', t.id,
              'tag_name', t.tag_name,
              'auto_generated', t.auto_generated
            )
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) as tags,
        ts_rank(
          to_tsvector('english', n.title || ' ' || COALESCE(n.content, '')),
          plainto_tsquery('english', $2)
        ) as rank
      FROM notes n
      LEFT JOIN tags t ON n.id = t.note_id
      WHERE n.user_id = $1
        AND (
          to_tsvector('english', n.title || ' ' || COALESCE(n.content, ''))
          @@ plainto_tsquery('english', $2)
          OR n.title ILIKE $3
          OR n.content ILIKE $3
          OR EXISTS (
            SELECT 1 FROM tags
            WHERE tags.note_id = n.id
            AND tags.tag_name ILIKE $3
          )
        )
      GROUP BY n.id
      ORDER BY rank DESC, n.updated_at DESC
      LIMIT 50`,
      [userId, searchQuery, `%${searchQuery}%`]
    );

    return NextResponse.json({
      success: true,
      results: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error searching notes:', error);
    return NextResponse.json(
      { error: 'Failed to search notes' },
      { status: 500 }
    );
  }
}
