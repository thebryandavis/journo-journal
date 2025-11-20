import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { note_id, shared_with_email, permissions = 'view' } = body;

    if (!note_id || !shared_with_email) {
      return NextResponse.json(
        { error: 'note_id and shared_with_email are required' },
        { status: 400 }
      );
    }

    // Verify note ownership
    const noteCheck = await query(
      'SELECT id FROM notes WHERE id = $1 AND user_id = $2',
      [note_id, userId]
    );

    if (noteCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Find user by email
    const userResult = await query(
      'SELECT id FROM users WHERE email = $1',
      [shared_with_email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found with that email' },
        { status: 404 }
      );
    }

    const sharedWithId = userResult.rows[0].id;

    // Create share
    const shareResult = await query(
      `INSERT INTO shares (note_id, shared_by, shared_with, permissions)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (note_id, shared_with) DO UPDATE
       SET permissions = $4
       RETURNING *`,
      [note_id, userId, sharedWithId, permissions]
    );

    return NextResponse.json(
      {
        success: true,
        share: shareResult.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating share:', error);
    return NextResponse.json(
      { error: 'Failed to share note' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Get notes shared with this user
    const result = await query(
      `SELECT
        n.*,
        u.name as shared_by_name,
        u.email as shared_by_email,
        s.permissions
      FROM shares s
      INNER JOIN notes n ON s.note_id = n.id
      INNER JOIN users u ON s.shared_by = u.id
      WHERE s.shared_with = $1
      ORDER BY s.created_at DESC`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      sharedNotes: result.rows,
    });
  } catch (error) {
    console.error('Error fetching shared notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared notes' },
      { status: 500 }
    );
  }
}
