import { NextRequest, NextResponse } from 'next/server';
import { saveUpload, cleanOldUploads } from '@/lib/uploads';

// Clean old uploads on first request (lazy startup cleanup)
let cleanupDone = false;

export async function POST(request: NextRequest) {
  try {
    // Lazy cleanup
    if (!cleanupDone) {
      cleanupDone = true;
      cleanOldUploads().catch(err => console.error('[Upload] Cleanup error:', err));
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await saveUpload(buffer, file.name, file.type);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API/upload] Error:', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
