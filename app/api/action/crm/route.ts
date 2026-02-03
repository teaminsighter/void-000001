import { NextRequest, NextResponse } from 'next/server';
import { triggerWorkflow } from '@/lib/n8n';

interface CrmRequest {
  action: 'list' | 'update' | 'add';
  dealId?: string;
  stage?: string;
  data?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const body: CrmRequest = await request.json();
    const { action = 'list', dealId, stage, data } = body;

    const result = await triggerWorkflow('crm', {
      action,
      dealId,
      stage,
      data,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: result.success,
      action,
      message: action === 'list' ? 'Deals retrieved' :
               action === 'update' ? 'Deal updated' :
               'Deal added',
      data: result.data,
      mock: result.mock,
    });
  } catch (error) {
    console.error('[API/action/crm] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process CRM action', details: String(error) },
      { status: 500 }
    );
  }
}
