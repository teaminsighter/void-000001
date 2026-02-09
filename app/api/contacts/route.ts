import { NextResponse } from 'next/server';
import { listContacts, getMessages } from '@/lib/db';

export async function GET() {
  try {
    const contacts = listContacts();

    // Attach last message preview for each contact
    const contactsWithPreview = contacts.map(c => {
      const convId = `tg-${c.telegram_id}`;
      const messages = getMessages(convId);
      const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
      return {
        ...c,
        last_message: lastMsg ? { role: lastMsg.role, content: lastMsg.content.slice(0, 100), created_at: lastMsg.created_at } : null,
      };
    });

    return NextResponse.json({ contacts: contactsWithPreview });
  } catch (error) {
    console.error('[API/contacts] Error:', error);
    return NextResponse.json({ error: 'Failed to list contacts' }, { status: 500 });
  }
}
