// ══════════════════════════════════════
// VOID — Anthropic Claude API Helper
// ══════════════════════════════════════

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
  const response = await client.messages.create({
    model: options.model || DEFAULT_MODEL,
    max_tokens: options.maxTokens || DEFAULT_MAX_TOKENS,
    system: systemPrompt,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content,
    })),
  });

  // Extract text from response
  const textBlock = response.content.find(block => block.type === 'text');
  return textBlock && textBlock.type === 'text' ? textBlock.text : '';
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
): Promise<string> {
  const stream = await client.messages.stream({
    model: options.model || DEFAULT_MODEL,
    max_tokens: options.maxTokens || DEFAULT_MAX_TOKENS,
    system: systemPrompt,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content,
    })),
  });

  let fullResponse = '';

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      const text = event.delta.text;
      fullResponse += text;
      onChunk(text);
    }
  }

  return fullResponse;
}

export { DEFAULT_MODEL, DEFAULT_MAX_TOKENS };
