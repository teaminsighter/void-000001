// ══════════════════════════════════════
// VOID — Discord Bot API Helpers
// HTTP Interactions (slash commands)
// ══════════════════════════════════════

import crypto from 'node:crypto';

export const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || '';
export const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY || '';
export const DISCORD_APPLICATION_ID = process.env.DISCORD_APPLICATION_ID || '';
export const DISCORD_OWNER_ID = process.env.DISCORD_OWNER_ID || '';

const DISCORD_API = 'https://discord.com/api/v10';

// ── Signature Verification ──────────

/**
 * Verify Discord interaction signature (ed25519)
 * Required for all interaction endpoint requests
 */
export function verifyDiscordSignature(
  rawBody: string,
  signature: string,
  timestamp: string,
): boolean {
  if (!DISCORD_PUBLIC_KEY) return false;
  try {
    const key = Buffer.from(DISCORD_PUBLIC_KEY, 'hex');
    const sig = Buffer.from(signature, 'hex');
    const msg = Buffer.from(timestamp + rawBody);
    return crypto.verify(null, msg, { key: crypto.createPublicKey({ key: Buffer.concat([Buffer.from('302a300506032b6570032100', 'hex'), key]), format: 'der', type: 'spki' }), dsaEncoding: undefined as unknown as 'ieee-p1363' }, sig);
  } catch {
    return false;
  }
}

// ── API Helpers ─────────────────────

/**
 * Send a message to a Discord channel
 * Auto-splits messages >2000 chars
 */
export async function sendDiscordMessage(channelId: string, text: string): Promise<boolean> {
  if (!DISCORD_BOT_TOKEN) {
    console.error('[Discord] BOT_TOKEN not configured');
    return false;
  }

  const MAX_LENGTH = 2000;
  const chunks: string[] = [];

  if (text.length <= MAX_LENGTH) {
    chunks.push(text);
  } else {
    let remaining = text;
    while (remaining.length > 0) {
      if (remaining.length <= MAX_LENGTH) {
        chunks.push(remaining);
        break;
      }
      let splitAt = remaining.lastIndexOf('\n', MAX_LENGTH);
      if (splitAt <= 0) splitAt = MAX_LENGTH;
      chunks.push(remaining.slice(0, splitAt));
      remaining = remaining.slice(splitAt);
    }
  }

  for (const chunk of chunks) {
    try {
      const response = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: chunk }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) {
        console.error('[Discord] Send error:', response.status, await response.text());
        return false;
      }
    } catch (err) {
      console.error('[Discord] Send error:', err);
      return false;
    }
  }

  return true;
}

/**
 * Create a DM channel with a user
 * Returns the channel ID for sending DMs
 */
export async function createDMChannel(userId: string): Promise<string | null> {
  if (!DISCORD_BOT_TOKEN) return null;
  try {
    const response = await fetch(`${DISCORD_API}/users/@me/channels`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipient_id: userId }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.id || null;
  } catch {
    return null;
  }
}

/**
 * Send a DM to a Discord user by their user ID
 */
export async function sendDiscordDM(userId: string, text: string): Promise<boolean> {
  const channelId = await createDMChannel(userId);
  if (!channelId) return false;
  return sendDiscordMessage(channelId, text);
}

/**
 * Edit the original deferred interaction response
 * Used after returning DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
 */
export async function editInteractionResponse(interactionToken: string, content: string): Promise<boolean> {
  if (!DISCORD_APPLICATION_ID) return false;

  // Truncate to 2000 chars if needed
  const truncated = content.length > 2000 ? content.slice(0, 1997) + '...' : content;

  try {
    const response = await fetch(
      `${DISCORD_API}/webhooks/${DISCORD_APPLICATION_ID}/${interactionToken}/messages/@original`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: truncated }),
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!response.ok) {
      console.error('[Discord] Edit response error:', response.status, await response.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Discord] Edit response error:', err);
    return false;
  }
}

/**
 * Check if a Discord user ID belongs to the owner
 */
export function isDiscordOwner(userId: string): boolean {
  if (!DISCORD_OWNER_ID) return true; // No restriction if not configured
  return userId === DISCORD_OWNER_ID;
}

/**
 * Register a global slash command
 */
export async function registerSlashCommand(
  name: string,
  description: string,
  options?: { name: string; description: string; type: number; required?: boolean }[],
): Promise<{ success: boolean; message: string }> {
  if (!DISCORD_BOT_TOKEN || !DISCORD_APPLICATION_ID) {
    return { success: false, message: 'DISCORD_BOT_TOKEN or DISCORD_APPLICATION_ID not configured' };
  }

  try {
    const response = await fetch(
      `${DISCORD_API}/applications/${DISCORD_APPLICATION_ID}/commands`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description, options }),
        signal: AbortSignal.timeout(10_000),
      },
    );
    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data.message || `HTTP ${response.status}` };
    }
    return { success: true, message: `Command /${name} registered (ID: ${data.id})` };
  } catch (err) {
    return { success: false, message: String(err) };
  }
}
