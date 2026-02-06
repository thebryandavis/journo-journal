import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { query } from '@/lib/db';
import { authOptions } from "@/lib/auth";

// GET /api/graph/connections/:id - Get related notes for a specific note
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
    const noteId = params.id;
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
    const minStrength = parseFloat(
      request.nextUrl.searchParams.get('minStrength') || '0.3'
    );

    // Verify note belongs to user
    const noteCheck = await query(
      'SELECT id FROM notes WHERE id = $1 AND user_id = $2',
      [noteId, userId]
    );

    if (noteCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Get related notes using the database function
    const result = await query(
      'SELECT * FROM get_related_notes($1, $2, $3)',
      [noteId, limit, minStrength]
    );

    return NextResponse.json({
      success: true,
      relatedNotes: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching related notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related notes' },
      { status: 500 }
    );
  }
}
