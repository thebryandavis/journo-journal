import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { query } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export async function POST(
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
    const { note_ids } = body;

    if (!Array.isArray(note_ids) || note_ids.length === 0) {
      return NextResponse.json(
        { error: 'note_ids array is required' },
        { status: 400 }
      );
    }

    // Verify project belongs to user
    const projectCheck = await query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (projectCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Bulk insert with ON CONFLICT DO NOTHING
    const placeholders = note_ids
      .map((_, i) => `($1, $${i + 2})`)
      .join(', ');

    await query(
      `INSERT INTO project_notes (project_id, note_id)
       VALUES ${placeholders}
       ON CONFLICT DO NOTHING`,
      [projectId, ...note_ids]
    );

    // Touch project updated_at
    await query(
      'UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [projectId]
    );

    return NextResponse.json({
      success: true,
      message: `Added ${note_ids.length} note(s) to project`,
    });
  } catch (error) {
    console.error('Error adding notes to project:', error);
    return NextResponse.json(
      { error: 'Failed to add notes to project' },
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
    const body = await request.json();
    const { note_ids } = body;

    if (!Array.isArray(note_ids) || note_ids.length === 0) {
      return NextResponse.json(
        { error: 'note_ids array is required' },
        { status: 400 }
      );
    }

    // Verify project belongs to user
    const projectCheck = await query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (projectCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const placeholders = note_ids
      .map((_, i) => `$${i + 2}`)
      .join(', ');

    await query(
      `DELETE FROM project_notes
       WHERE project_id = $1 AND note_id IN (${placeholders})`,
      [projectId, ...note_ids]
    );

    // Touch project updated_at
    await query(
      'UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [projectId]
    );

    return NextResponse.json({
      success: true,
      message: `Removed ${note_ids.length} note(s) from project`,
    });
  } catch (error) {
    console.error('Error removing notes from project:', error);
    return NextResponse.json(
      { error: 'Failed to remove notes from project' },
      { status: 500 }
    );
  }
}
