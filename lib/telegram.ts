// ══════════════════════════════════════
// VOID — Telegram Bot API Helpers
// ══════════════════════════════════════

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

/**
 * Send a text message via Telegram Bot API
 * Automatically splits messages >4096 chars
 */
export async function sendTelegramMessage(chatId: string, text: string): Promise<boolean> {
  if (!BOT_TOKEN) {
    console.error('[Telegram] BOT_TOKEN not configured');
    return false;
  }

  const MAX_LENGTH = 4096;
  const chunks: string[] = [];

  // Split into chunks if needed
  if (text.length <= MAX_LENGTH) {
    chunks.push(text);
  } else {
    let remaining = text;
    while (remaining.length > 0) {
      if (remaining.length <= MAX_LENGTH) {
        chunks.push(remaining);
        break;
      }
      // Try to split at newline
      let splitAt = remaining.lastIndexOf('\n', MAX_LENGTH);
      if (splitAt <= 0) splitAt = MAX_LENGTH;
      chunks.push(remaining.slice(0, splitAt));
      remaining = remaining.slice(splitAt);
    }
  }

  for (const chunk of chunks) {
    try {
      const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: chunk,
          parse_mode: 'Markdown',
        }),
      });

      if (!response.ok) {
        // Retry without Markdown if parse fails
        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: chunk }),
        });
      }
    } catch (err) {
      console.error('[Telegram] Send error:', err);
      return false;
    }
  }

  return true;
}

/**
 * Download a file from Telegram (e.g., photos)
 */
export async function downloadTelegramFile(fileId: string): Promise<Buffer | null> {
  if (!BOT_TOKEN) return null;

  try {
    // Get file path
    const fileResponse = await fetch(`${TELEGRAM_API}/getFile?file_id=${fileId}`);
    const fileData = await fileResponse.json();

    if (!fileData.ok || !fileData.result?.file_path) return null;

    // Download file
    const downloadUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`;
    const response = await fetch(downloadUrl);
    const buffer = Buffer.from(await response.arrayBuffer());

    return buffer;
  } catch (err) {
    console.error('[Telegram] Download error:', err);
    return null;
  }
}

/**
 * Set the webhook URL for this bot
 */
export async function setWebhook(url: string): Promise<{ success: boolean; message: string }> {
  if (!BOT_TOKEN) {
    return { success: false, message: 'BOT_TOKEN not configured' };
  }

  try {
    const response = await fetch(`${TELEGRAM_API}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();
    return {
      success: data.ok,
      message: data.description || 'Webhook set',
    };
  } catch (err) {
    return { success: false, message: String(err) };
  }
}

/**
 * Verify that a Telegram update comes from the expected chat
 */
export function verifyTelegramUpdate(chatId: string | number): boolean {
  if (!CHAT_ID) return true; // No restriction if not configured
  return String(chatId) === String(CHAT_ID);
}

export { BOT_TOKEN, CHAT_ID };
