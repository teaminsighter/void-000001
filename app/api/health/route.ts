import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: Date.now(),
    version: '0.1.0',
    services: {
      dashboard: true,
      n8n: false,      // Will be true after Layer 5
      khoj: false,     // Will be true after Layer 5
      vault: false,    // Will be true after Layer 5
    },
  });
}
