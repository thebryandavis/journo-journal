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

    const result = await query(
      `SELECT * FROM sources
       WHERE user_id = $1
       ORDER BY name ASC`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      sources: result.rows,
    });
  } catch (error) {
    console.error('Error fetching sources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sources' },
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

    const { name, title, organization, email, phone, notes } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO sources (user_id, workspace_id, name, title, organization, email, phone, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, workspaceId, name, title || null, organization || null, email || null, phone || null, notes || null]
    );

    return NextResponse.json(
      {
        success: true,
        source: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating source:', error);
    return NextResponse.json(
      { error: 'Failed to create source' },
      { status: 500 }
    );
  }
}
