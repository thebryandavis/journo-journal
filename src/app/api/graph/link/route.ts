import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createManualRelationship } from '@/lib/ai/knowledge-graph';
import { query } from '@/lib/db';
import { authOptions } from "@/lib/auth";

// POST /api/graph/link - Create manual link between notes
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { sourceNoteId, targetNoteId, relationshipType, metadata } = body;

    if (!sourceNoteId || !targetNoteId) {
      return NextResponse.json(
        { error: 'sourceNoteId and targetNoteId are required' },
        { status: 400 }
      );
    }

    // Verify both notes belong to user
    const notesCheck = await query(
      `SELECT id FROM notes
       WHERE id = ANY($1) AND user_id = $2`,
      [[sourceNoteId, targetNoteId], userId]
    );

    if (notesCheck.rows.length !== 2) {
      return NextResponse.json(
        { error: 'One or both notes not found' },
        { status: 404 }
      );
    }

    await createManualRelationship(
      sourceNoteId,
      targetNoteId,
      relationshipType || 'manual',
      metadata || {}
    );

    return NextResponse.json({
      success: true,
      message: 'Link created successfully',
    });
  } catch (error) {
    console.error('Error creating manual link:', error);
    return NextResponse.json(
      { error: 'Failed to create link' },
      { status: 500 }
    );
  }
}

// DELETE /api/graph/link - Remove link between notes
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { sourceNoteId, targetNoteId } = await request.json();

    if (!sourceNoteId || !targetNoteId) {
      return NextResponse.json(
        { error: 'sourceNoteId and targetNoteId are required' },
        { status: 400 }
      );
    }

    // Verify notes belong to user and delete relationship
    const result = await query(
      `DELETE FROM note_relationships
       WHERE (
         (source_note_id = $1 AND target_note_id = $2)
         OR (source_note_id = $2 AND target_note_id = $1)
       )
       AND EXISTS (
         SELECT 1 FROM notes
         WHERE id = $1 AND user_id = $3
       )
       RETURNING id`,
      [sourceNoteId, targetNoteId, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Relationship not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Link removed successfully',
    });
  } catch (error) {
    console.error('Error removing link:', error);
    return NextResponse.json(
      { error: 'Failed to remove link' },
      { status: 500 }
    );
  }
}
