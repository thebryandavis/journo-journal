import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const result = await query(
      `SELECT
        f.*,
        COUNT(n.id) as note_count
      FROM folders f
      LEFT JOIN notes n ON f.id = n.folder_id
      WHERE f.user_id = $1
      GROUP BY f.id
      ORDER BY f.created_at ASC`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      folders: result.rows,
    });
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const workspaceId = (session.user as any).workspaceId;
    const body = await request.json();

    const { name, color = '#FFB800', parent_id } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO folders (user_id, workspace_id, name, color, parent_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, workspaceId, name.trim(), color, parent_id || null]
    );

    return NextResponse.json(
      {
        success: true,
        folder: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    );
  }
}
