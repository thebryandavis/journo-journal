import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { query } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    const params: any[] = [userId];
    let whereClause = 'WHERE p.user_id = $1';

    if (statusFilter) {
      params.push(statusFilter);
      whereClause += ` AND p.status = $${params.length}`;
    }

    const result = await query(
      `SELECT
        p.*,
        COUNT(pn.note_id)::int AS note_count
      FROM projects p
      LEFT JOIN project_notes pn ON p.id = pn.project_id
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.updated_at DESC`,
      params
    );

    return NextResponse.json({
      success: true,
      projects: result.rows,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
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

    const { name, description } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO projects (user_id, workspace_id, name, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, workspaceId, name.trim(), description?.trim() || null]
    );

    return NextResponse.json(
      {
        success: true,
        project: { ...result.rows[0], note_count: 0 },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
