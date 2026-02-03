// ══════════════════════════════════════
// VOID — Anthropic Claude API Helper
// ══════════════════════════════════════

// Note: Install @anthropic-ai/sdk before Layer 4
// npm install @anthropic-ai/sdk

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';
const DEFAULT_MAX_TOKENS = 4096;

/**
 * Send a chat message to Claude API
 * @param messages - Array of conversation messages
 * @param systemPrompt - System prompt for the conversation
 * @param options - Optional configuration
 * @returns The assistant's response text
 */
export async function chat(
  messages: Message[],
  systemPrompt: string,
  options: ChatOptions = {}
): Promise<string> {
  // This will be implemented in Layer 4 when we connect to real APIs
  // For now, return a mock response

  const lastMessage = messages[messages.length - 1]?.content || '';

  console.log('[Anthropic] Would send:', {
    model: options.model || DEFAULT_MODEL,
    maxTokens: options.maxTokens || DEFAULT_MAX_TOKENS,
    systemPrompt: systemPrompt.substring(0, 100) + '...',
    messageCount: messages.length,
  });

  // Mock response for development
  return `I received your message: "${lastMessage.substring(0, 50)}..."

This is a mock response. Real Claude API integration will be added in Layer 4.

✓ Message received
✓ Context would be injected from Khoj
✓ Actions would be parsed and executed via n8n`;
}

/**
 * Stream a chat response from Claude API
 * @param messages - Array of conversation messages
 * @param systemPrompt - System prompt for the conversation
 * @param onChunk - Callback for each streamed chunk
 * @param options - Optional configuration
 */
export async function streamChat(
  messages: Message[],
  systemPrompt: string,
  onChunk: (chunk: string) => void,
  options: ChatOptions = {}
): Promise<void> {
  // Streaming will be implemented in Layer 4
  const response = await chat(messages, systemPrompt, options);

  // Simulate streaming for development
  const words = response.split(' ');
  for (const word of words) {
    onChunk(word + ' ');
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

export { DEFAULT_MODEL, DEFAULT_MAX_TOKENS };
