import { NextResponse } from 'next/server';
import { health as khojHealth } from '@/lib/khoj';
import { health as n8nHealth } from '@/lib/n8n';

export async function GET() {
  // Check all services
  const [khoj, n8n] = await Promise.all([
    khojHealth().catch(() => ({ status: 'error', indexed: 0 })),
    n8nHealth().catch(() => ({ status: 'error', workflows: 0 })),
  ]);

  const allHealthy = khoj.status !== 'error' && n8n.status !== 'error';

  return NextResponse.json({
    status: allHealthy ? 'ok' : 'degraded',
    timestamp: Date.now(),
    version: '0.1.0',
    services: {
      dashboard: true,
      khoj: {
        status: khoj.status,
        indexed: khoj.indexed,
      },
      n8n: {
        status: n8n.status,
        workflows: n8n.workflows,
      },
    },
  });
}
