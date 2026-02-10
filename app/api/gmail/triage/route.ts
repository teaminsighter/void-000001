// ══════════════════════════════════════
// VOID — Gmail Triage API
// Receives classified emails from n8n
// ══════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { storeClassifiedEmail, ClassifiedEmail } from '@/lib/gmail';
import { archiveGmailEmail } from '@/lib/gmail';
import { sendTelegramMessage } from '@/lib/telegram';

const TRIAGE_SECRET = process.env.GMAIL_TRIAGE_SECRET || '';
const OWNER_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

export async function POST(request: NextRequest) {
  try {
    // Verify shared secret
    if (TRIAGE_SECRET) {
      const secret = request.headers.get('x-triage-secret');
      if (secret !== TRIAGE_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await request.json();
    const emails: ClassifiedEmail[] = Array.isArray(body.emails) ? body.emails : [body];

    let processed = 0;
    let urgent = 0;
    let archived = 0;

    for (const email of emails) {
      if (!email.gmail_id || !email.subject) continue;

      // Store in vault + database
      await storeClassifiedEmail(email);
      processed++;

      // Urgent + action needed → Telegram notification
      if (email.priority === 'urgent' && email.action !== 'ignore' && OWNER_CHAT_ID) {
        const actionLabel = email.action === 'reply' ? 'Reply needed'
          : email.action === 'pay' ? 'Payment needed'
          : 'Action needed';

        await sendTelegramMessage(
          OWNER_CHAT_ID,
          `📧 *URGENT EMAIL*\n\n` +
          `*From:* ${email.from_name || email.from_email}\n` +
          `*Subject:* ${email.subject}\n` +
          `*Summary:* ${email.summary}\n\n` +
          `⚡ ${actionLabel}`
        );
        urgent++;
      }

      // Spam/newsletter + low priority → auto-archive
      if (
        (email.category === 'spam' || email.category === 'newsletter') &&
        email.priority === 'low'
      ) {
        await archiveGmailEmail(email.gmail_id);
        archived++;
      }
    }

    return NextResponse.json({ processed, urgent, archived });
  } catch (error) {
    console.error('[API/gmail/triage] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process triage', details: String(error) },
      { status: 500 }
    );
  }
}
