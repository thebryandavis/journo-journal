import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { query } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const projectId = params.id;

    // Fetch the project
    const projectResult = await query(
      `SELECT p.*, COUNT(pn.note_id)::int AS note_count
       FROM projects p
       LEFT JOIN project_notes pn ON p.id = pn.project_id
       WHERE p.id = $1 AND p.user_id = $2
       GROUP BY p.id`,
      [projectId, userId]
    );

    if (projectResult.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Fetch notes in this project with tags
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
        ) as tags
      FROM notes n
      INNER JOIN project_notes pn ON n.id = pn.note_id
      LEFT JOIN tags t ON n.id = t.note_id
      WHERE pn.project_id = $1 AND n.user_id = $2
      GROUP BY n.id, pn.added_at
      ORDER BY pn.added_at DESC`,
      [projectId, userId]
    );

    return NextResponse.json({
      success: true,
      project: {
        ...projectResult.rows[0],
        notes: notesResult.rows,
      },
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const projectId = params.id;
    const body = await request.json();

    const { name, description, status } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name.trim());
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description?.trim() || null);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    values.push(projectId, userId);

    const result = await query(
      `UPDATE projects
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount++} AND user_id = $${paramCount++}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      project: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const projectId = params.id;

    const result = await query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id',
      [projectId, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
