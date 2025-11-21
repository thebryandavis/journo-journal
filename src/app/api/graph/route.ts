import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getKnowledgeGraphData, rebuildUserKnowledgeGraph } from '@/lib/ai/knowledge-graph';

// GET /api/graph - Get knowledge graph data for visualization
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Validate and sanitize input parameters
    const limitParam = parseInt(request.nextUrl.searchParams.get('limit') || '100');
    const limit = Math.min(Math.max(limitParam, 1), 1000); // Clamp between 1 and 1000

    const minStrengthParam = parseFloat(
      request.nextUrl.searchParams.get('minStrength') || '0.5'
    );
    const minStrength = Math.min(Math.max(minStrengthParam, 0), 1); // Clamp between 0 and 1

    const graphData = await getKnowledgeGraphData(userId, {
      limit,
      minStrength,
    });

    return NextResponse.json({
      success: true,
      ...graphData,
    });
  } catch (error) {
    console.error('Error fetching knowledge graph:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge graph' },
      { status: 500 }
    );
  }
}

// POST /api/graph - Rebuild entire knowledge graph
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const result = await rebuildUserKnowledgeGraph(userId);

    return NextResponse.json({
      success: true,
      message: 'Knowledge graph rebuilt successfully',
      ...result,
    });
  } catch (error) {
    console.error('Error rebuilding knowledge graph:', error);
    return NextResponse.json(
      { error: 'Failed to rebuild knowledge graph' },
      { status: 500 }
    );
  }
}
