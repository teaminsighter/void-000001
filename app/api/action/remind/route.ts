import { NextRequest, NextResponse } from 'next/server';
import { triggerWorkflow } from '@/lib/n8n';

interface RemindRequest {
  message: string;
  time: string;
  channel?: 'telegram' | 'email' | 'both';
}

export async function POST(request: NextRequest) {
  try {
    const body: RemindRequest = await request.json();
    const { message, time, channel = 'telegram' } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!time) {
      return NextResponse.json(
        { error: 'Time is required' },
        { status: 400 }
      );
    }

    const result = await triggerWorkflow('remind', {
      message: message.trim(),
      time,
      channel,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: result.success,
      message: 'Reminder scheduled',
      scheduledFor: time,
      channel,
      data: result.data,
      mock: result.mock,
    });
  } catch (error) {
    console.error('[API/action/remind] Error:', error);
    return NextResponse.json(
      { error: 'Failed to schedule reminder', details: String(error) },
      { status: 500 }
    );
  }
}
