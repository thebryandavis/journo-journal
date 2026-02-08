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
    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get('type');
    const unassigned = searchParams.get('unassigned');
    const projectId = searchParams.get('project_id');

    // Build query with optional filters
    const params: any[] = [userId];
    let whereClause = 'WHERE n.user_id = $1';
    if (typeFilter) {
      params.push(typeFilter);
      whereClause += ` AND n.type = $${params.length}`;
    }
    if (unassigned === 'true') {
      whereClause += ` AND NOT EXISTS (SELECT 1 FROM project_notes pn WHERE pn.note_id = n.id)`;
    }
    if (projectId) {
      params.push(projectId);
      whereClause += ` AND EXISTS (SELECT 1 FROM project_notes pn WHERE pn.note_id = n.id AND pn.project_id = $${params.length})`;
    }

    // Fetch notes with tags and attachments
    const notesResult = await query(
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
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', a.id,
              'file_name', a.file_name,
              'file_url', a.file_url,
              'file_type', a.file_type,
              'metadata', a.metadata
            )
          ) FILTER (WHERE a.id IS NOT NULL),
          '[]'
        ) as attachments
      FROM notes n
      LEFT JOIN tags t ON n.id = t.note_id
      LEFT JOIN attachments a ON n.id = a.note_id
      ${whereClause}
      GROUP BY n.id
      ORDER BY n.updated_at DESC`,
      params
    );

    return NextResponse.json({
      success: true,
      notes: notesResult.rows,
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const workspaceId = (session.user as any).workspaceId;
    const body = await request.json();

    const { title, content, type = 'note', tags = [], project_id } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Calculate word count
    const wordCount = content
      ? content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
      : 0;

    // Create note
    const noteResult = await query(
      `INSERT INTO notes (user_id, workspace_id, title, content, type, word_count)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, workspaceId, title.trim(), content || '', type, wordCount]
    );

    const note = noteResult.rows[0];

    // Add manual tags
    if (tags.length > 0) {
      for (const tagName of tags) {
        await query(
          `INSERT INTO tags (note_id, tag_name, auto_generated)
           VALUES ($1, $2, $3)`,
          [note.id, tagName, false]
        );
      }
    }

    // If project_id provided, link note to project
    if (project_id) {
      await query(
        `INSERT INTO project_notes (project_id, note_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [project_id, note.id]
      );
      await query(
        'UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [project_id]
      );
    }

    // Fetch note with tags
    const fullNoteResult = await query(
      `SELECT
        n.*,
        COALESCE(
          json_agg(
            jsonb_build_object(
              'id', t.id,
              'tag_name', t.tag_name,
              'auto_generated', t.auto_generated
            )
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) as tags
      FROM notes n
      LEFT JOIN tags t ON n.id = t.note_id
      WHERE n.id = $1
      GROUP BY n.id`,
      [note.id]
    );

    return NextResponse.json(
      {
        success: true,
        note: fullNoteResult.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}
