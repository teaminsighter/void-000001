// ══════════════════════════════════════
// VOID — Gmail Stats API
// Returns email statistics for reports
// ══════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { getGmailStats, searchGmailEmails } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7', 10);

    const stats = getGmailStats(days);

    // Top senders
    const allEmails = searchGmailEmails('', 100);
    const senderCounts: Record<string, number> = {};
    for (const e of allEmails) {
      const name = e.from_name || e.from_email;
      senderCounts[name] = (senderCounts[name] || 0) + 1;
    }
    const topSenders = Object.entries(senderCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      days,
      ...stats,
      topSenders,
    });
  } catch (error) {
    console.error('[API/gmail/stats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get stats', details: String(error) },
      { status: 500 }
    );
  }
}
