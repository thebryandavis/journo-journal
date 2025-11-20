import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { query, transaction } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Create user and workspace in a transaction
    const result = await transaction(async (client) => {
      // Create workspace first
      const workspaceResult = await client.query(
        `INSERT INTO workspaces (name, settings)
         VALUES ($1, $2)
         RETURNING id`,
        [`${name}'s Workspace`, '{}']
      );

      const workspaceId = workspaceResult.rows[0].id;

      // Create user
      const userResult = await client.query(
        `INSERT INTO users (email, name, password_hash, workspace_id)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, name, workspace_id`,
        [email.toLowerCase(), name, passwordHash, workspaceId]
      );

      // Update workspace owner_id
      await client.query(
        'UPDATE workspaces SET owner_id = $1 WHERE id = $2',
        [userResult.rows[0].id, workspaceId]
      );

      // Create default folder
      await client.query(
        `INSERT INTO folders (user_id, workspace_id, name, color)
         VALUES ($1, $2, $3, $4)`,
        [userResult.rows[0].id, workspaceId, 'Getting Started', '#FFB800']
      );

      return userResult.rows[0];
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: result.id,
          email: result.email,
          name: result.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
