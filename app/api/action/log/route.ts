import { NextRequest, NextResponse } from 'next/server';
import { triggerWorkflow } from '@/lib/n8n';

interface LogRequest {
  text: string;
  date?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LogRequest = await request.json();
    const { text, date } = body;

    if (!text?.trim()) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const result = await triggerWorkflow('log', {
      text: text.trim(),
      date: date || new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: result.success,
      message: 'Log entry added',
      data: result.data,
      mock: result.mock,
    });
  } catch (error) {
    console.error('[API/action/log] Error:', error);
    return NextResponse.json(
      { error: 'Failed to add log entry', details: String(error) },
      { status: 500 }
    );
  }
}
