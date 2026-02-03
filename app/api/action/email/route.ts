import { NextRequest, NextResponse } from 'next/server';
import { triggerWorkflow } from '@/lib/n8n';

interface EmailRequest {
  action: 'read' | 'send' | 'summarize';
  to?: string;
  subject?: string;
  body?: string;
  count?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequest = await request.json();
    const { action, to, subject, body: emailBody, count = 10 } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required (read, send, or summarize)' },
        { status: 400 }
      );
    }

    if (action === 'send') {
      if (!to || !subject || !emailBody) {
        return NextResponse.json(
          { error: 'To, subject, and body are required for sending' },
          { status: 400 }
        );
      }
    }

    const result = await triggerWorkflow('email', {
      action,
      to,
      subject,
      body: emailBody,
      count,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: result.success,
      action,
      message: action === 'send' ? 'Email sent' :
               action === 'read' ? 'Emails retrieved' :
               'Inbox summarized',
      data: result.data,
      mock: result.mock,
    });
  } catch (error) {
    console.error('[API/action/email] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process email action', details: String(error) },
      { status: 500 }
    );
  }
}
