import { NextResponse } from 'next/server';
import { registerSlashCommand, DISCORD_APPLICATION_ID } from '@/lib/discord';

export { handler as GET, handler as POST };

async function handler() {
  // Register the /void slash command globally
  const result = await registerSlashCommand(
    'void',
    "Talk to Imran's AI assistant",
    [
      {
        name: 'message',
        description: 'Your message',
        type: 3, // STRING
        required: true,
      },
    ],
  );

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const interactionsUrl = `${baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`}/api/discord/interactions`;

  return NextResponse.json({
    ...result,
    interactionsUrl,
    note: 'Set the Interactions Endpoint URL in Discord Developer Portal → General Information',
    applicationId: DISCORD_APPLICATION_ID,
  });
}
