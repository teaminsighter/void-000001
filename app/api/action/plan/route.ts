import { NextRequest, NextResponse } from 'next/server';
import { triggerWorkflow } from '@/lib/n8n';

interface PlanRequest {
  date?: string;
  input?: string;
  hours?: number;
  meetings?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: PlanRequest = await request.json();
    const { date, input, hours, meetings } = body;

    const result = await triggerWorkflow('plan', {
      date: date || new Date().toISOString().split('T')[0],
      input: input || '',
      hours: hours || 8,
      meetings: meetings || [],
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: result.success,
      message: 'Daily plan workflow triggered',
      data: result.data,
      mock: result.mock,
    });
  } catch (error) {
    console.error('[API/action/plan] Error:', error);
    return NextResponse.json(
      { error: 'Failed to trigger plan workflow', details: String(error) },
      { status: 500 }
    );
  }
}
