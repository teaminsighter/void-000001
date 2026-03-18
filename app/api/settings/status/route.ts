// ══════════════════════════════════════
// VOID — Provider Status API
// Check connectivity status of all AI providers
// ══════════════════════════════════════

import { NextResponse } from 'next/server';
import { checkAllProviders } from '@/lib/ai';

export async function GET() {
  try {
    const statuses = await checkAllProviders();

    return NextResponse.json({
      statuses,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API/settings/status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to check provider status' },
      { status: 500 }
    );
  }
}
