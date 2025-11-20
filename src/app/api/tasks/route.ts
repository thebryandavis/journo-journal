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
        t.*,
        n.title as note_title
      FROM tasks t
      LEFT JOIN notes n ON t.note_id = n.id
      WHERE t.user_id = $1
      ORDER BY
        CASE WHEN t.status = 'pending' THEN 1
             WHEN t.status = 'in-progress' THEN 2
             ELSE 3 END,
        t.due_date ASC NULLS LAST,
        t.created_at DESC`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      tasks: result.rows,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
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
    const body = await request.json();
    const {
      title,
      description,
      due_date,
      priority = 'medium',
      note_id,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO tasks (user_id, title, description, due_date, priority, note_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, title, description || null, due_date || null, priority, note_id || null]
    );

    return NextResponse.json(
      {
        success: true,
        task: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
