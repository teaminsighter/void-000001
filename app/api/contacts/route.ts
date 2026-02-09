import { NextResponse } from 'next/server';
import { listContacts, listDiscordContacts, getMessages } from '@/lib/db';

export async function GET() {
  try {
    // Telegram contacts
    const telegramContacts = listContacts().map(c => {
      const convId = `tg-${c.telegram_id}`;
      const messages = getMessages(convId);
      const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
      return {
        ...c,
        platform: 'telegram' as const,
        last_message: lastMsg ? { role: lastMsg.role, content: lastMsg.content.slice(0, 100), created_at: lastMsg.created_at } : null,
      };
    });

    // Discord contacts
    const discordContacts = listDiscordContacts().map(c => {
      const convId = `dc-${c.discord_id}`;
      const messages = getMessages(convId);
      const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
      return {
        ...c,
        platform: 'discord' as const,
        last_message: lastMsg ? { role: lastMsg.role, content: lastMsg.content.slice(0, 100), created_at: lastMsg.created_at } : null,
      };
    });

    return NextResponse.json({ contacts: [...telegramContacts, ...discordContacts] });
  } catch (error) {
    console.error('[API/contacts] Error:', error);
    return NextResponse.json({ error: 'Failed to list contacts' }, { status: 500 });
  }
}
