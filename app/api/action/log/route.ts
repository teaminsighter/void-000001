import { NextRequest, NextResponse } from 'next/server';
import { appendToLog } from '@/lib/vault';

interface LogRequest {
  text: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LogRequest = await request.json();
    const { text } = body;

    if (!text?.trim()) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Write directly to vault daily note
    await appendToLog(text.trim());

    return NextResponse.json({
      success: true,
      message: 'Log entry added',
    });
  } catch (error) {
    console.error('[API/action/log] Error:', error);
    return NextResponse.json(
      { error: 'Failed to add log entry', details: String(error) },
      { status: 500 }
    );
  }
}
