import { NextRequest, NextResponse } from 'next/server';
import { listFiles } from '@/lib/vault';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || '';

    const files = await listFiles(folder);

    return NextResponse.json({
      folder: folder || 'root',
      count: files.length,
      files,
    });
  } catch (error) {
    console.error('[API/vault/list] Error:', error);
    return NextResponse.json(
      { error: 'Failed to list files', details: String(error) },
      { status: 500 }
    );
  }
}
