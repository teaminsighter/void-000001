import { NextRequest, NextResponse } from 'next/server';
import { writeFile, appendToLog } from '@/lib/vault';

interface WriteRequest {
  path: string;
  content: string;
  mode?: 'overwrite' | 'append' | 'log';
}

export async function POST(request: NextRequest) {
  try {
    const body: WriteRequest = await request.json();
    const { path, content, mode = 'overwrite' } = body;

    if (!path?.trim()) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Special mode for logging to daily note
    if (mode === 'log') {
      await appendToLog(content);
      return NextResponse.json({
        success: true,
        message: 'Log entry added',
        mode: 'log',
      });
    }

    await writeFile(path, content, mode);

    return NextResponse.json({
      success: true,
      path,
      mode,
      message: mode === 'append' ? 'Content appended' : 'File written',
    });
  } catch (error) {
    console.error('[API/vault/write] Error:', error);
    return NextResponse.json(
      { error: 'Failed to write file', details: String(error) },
      { status: 500 }
    );
  }
}
