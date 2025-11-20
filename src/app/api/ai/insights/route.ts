import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { openai } from '@/lib/ai/openai';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const insights = await openai.extractInsights(title, content);
    const relatedTopics = await openai.suggestRelatedTopics(title, content);

    return NextResponse.json({
      success: true,
      insights,
      relatedTopics,
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
