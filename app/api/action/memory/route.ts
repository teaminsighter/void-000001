import { NextRequest, NextResponse } from 'next/server';
import { triggerWorkflow } from '@/lib/n8n';

interface MemoryRequest {
  type: 'preference' | 'goal' | 'context' | 'decision';
  content: string;
  category?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: MemoryRequest = await request.json();
    const { type, content, category } = body;

    if (!type) {
      return NextResponse.json(
        { error: 'Type is required (preference, goal, context, or decision)' },
        { status: 400 }
      );
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const result = await triggerWorkflow('memory', {
      type,
      content: content.trim(),
      category,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: result.success,
      type,
      message: 'Memory saved to agent context',
      data: result.data,
      mock: result.mock,
    });
  } catch (error) {
    console.error('[API/action/memory] Error:', error);
    return NextResponse.json(
      { error: 'Failed to save memory', details: String(error) },
      { status: 500 }
    );
  }
}
