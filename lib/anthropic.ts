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
const MAX_TOOL_ROUNDS = 10;

/**
 * Send a chat message to Claude API (no tools — simple text response)
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

  const textBlock = response.content.find(block => block.type === 'text');
  return textBlock && textBlock.type === 'text' ? textBlock.text : '';
}

// ── Tool Use Types ───────────────────

export interface ToolResult {
  toolName: string;
  toolInput: Record<string, unknown>;
  result: string;
  success: boolean;
}

export interface ChatWithToolsResponse {
  reply: string;
  toolResults: ToolResult[];
}

type ToolExecutor = (
  name: string,
  input: Record<string, unknown>
) => Promise<{ result: string; success: boolean }>;

/**
 * Chat with native Claude tool use.
 * Handles the full loop: send → tool_use → execute → tool_result → final response.
 */
export async function chatWithTools(
  messages: Message[],
  systemPrompt: string,
  tools: Anthropic.Tool[],
  executeTool: ToolExecutor,
  options: ChatOptions = {}
): Promise<ChatWithToolsResponse> {
  const allToolResults: ToolResult[] = [];

  // Build the conversation as Anthropic message params
  const apiMessages: Anthropic.MessageParam[] = messages.map(m => ({
    role: m.role,
    content: m.content,
  }));

  let rounds = 0;

  while (rounds < MAX_TOOL_ROUNDS) {
    rounds++;

    const response = await client.messages.create({
      model: options.model || DEFAULT_MODEL,
      max_tokens: options.maxTokens || DEFAULT_MAX_TOKENS,
      system: systemPrompt,
      tools,
      messages: apiMessages,
    });

    // If Claude stopped because it's done (no more tool calls), extract text and return
    if (response.stop_reason === 'end_turn' || response.stop_reason === 'max_tokens') {
      const textBlock = response.content.find(b => b.type === 'text');
      const reply = textBlock && textBlock.type === 'text' ? textBlock.text : '';
      return { reply, toolResults: allToolResults };
    }

    // Claude wants to use tools
    if (response.stop_reason === 'tool_use') {
      // Add the assistant's response (with tool_use blocks) to the conversation
      apiMessages.push({ role: 'assistant', content: response.content });

      // Execute each tool call and collect results
      const toolResultBlocks: Anthropic.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type === 'tool_use') {
          const { result, success } = await executeTool(
            block.name,
            block.input as Record<string, unknown>
          );

          allToolResults.push({
            toolName: block.name,
            toolInput: block.input as Record<string, unknown>,
            result,
            success,
          });

          toolResultBlocks.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: result,
            is_error: !success,
          });
        }
      }

      // Send tool results back to Claude
      apiMessages.push({ role: 'user', content: toolResultBlocks });
      continue;
    }

    // Unexpected stop reason — extract whatever text we have
    const textBlock = response.content.find(b => b.type === 'text');
    const reply = textBlock && textBlock.type === 'text' ? textBlock.text : '';
    return { reply, toolResults: allToolResults };
  }

  // Safety: if we hit max rounds, return what we have
  return {
    reply: 'I reached the maximum number of tool calls. Here are the results so far.',
    toolResults: allToolResults,
  };
}

/**
 * Stream a chat response from Claude API (no tools)
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

// ── Streaming callbacks ─────────────

export interface StreamCallbacks {
  onToken: (text: string) => void;
  onToolStart: (toolName: string, toolInput: Record<string, unknown>) => void;
  onToolDone: (toolName: string, result: string, success: boolean) => void;
}

/**
 * Stream chat with tool use.
 * Streams text tokens via callbacks, executes tools synchronously between rounds.
 */
export async function streamChatWithTools(
  messages: Message[],
  systemPrompt: string,
  tools: Anthropic.Tool[],
  executeTool: ToolExecutor,
  callbacks: StreamCallbacks,
  options: ChatOptions = {}
): Promise<ChatWithToolsResponse> {
  const allToolResults: ToolResult[] = [];

  const apiMessages: Anthropic.MessageParam[] = messages.map(m => ({
    role: m.role,
    content: m.content,
  }));

  let rounds = 0;
  let finalReply = '';

  while (rounds < MAX_TOOL_ROUNDS) {
    rounds++;

    const stream = client.messages.stream({
      model: options.model || DEFAULT_MODEL,
      max_tokens: options.maxTokens || DEFAULT_MAX_TOKENS,
      system: systemPrompt,
      tools,
      messages: apiMessages,
    });

    // Collect the full response while streaming text tokens
    let currentText = '';
    const contentBlocks: Anthropic.ContentBlock[] = [];
    let stopReason: string | null = null;

    for await (const event of stream) {
      if (event.type === 'content_block_delta') {
        if (event.delta.type === 'text_delta') {
          currentText += event.delta.text;
          callbacks.onToken(event.delta.text);
        }
      } else if (event.type === 'content_block_stop') {
        // Block finished
      } else if (event.type === 'message_delta') {
        stopReason = event.delta.stop_reason || null;
      }
    }

    // Get the final message to access content blocks
    const finalMessage = await stream.finalMessage();
    contentBlocks.push(...finalMessage.content);
    stopReason = finalMessage.stop_reason;

    if (stopReason === 'end_turn' || stopReason === 'max_tokens') {
      finalReply = currentText;
      return { reply: finalReply, toolResults: allToolResults };
    }

    if (stopReason === 'tool_use') {
      // Add assistant response to conversation
      apiMessages.push({ role: 'assistant', content: contentBlocks });

      const toolResultBlocks: Anthropic.ToolResultBlockParam[] = [];

      for (const block of contentBlocks) {
        if (block.type === 'tool_use') {
          const toolInput = block.input as Record<string, unknown>;
          callbacks.onToolStart(block.name, toolInput);

          const { result, success } = await executeTool(block.name, toolInput);

          allToolResults.push({
            toolName: block.name,
            toolInput,
            result,
            success,
          });

          callbacks.onToolDone(block.name, result, success);

          toolResultBlocks.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: result,
            is_error: !success,
          });
        }
      }

      apiMessages.push({ role: 'user', content: toolResultBlocks });
      finalReply = currentText;
      continue;
    }

    // Unexpected stop reason
    finalReply = currentText;
    return { reply: finalReply, toolResults: allToolResults };
  }

  return {
    reply: finalReply || 'I reached the maximum number of tool calls.',
    toolResults: allToolResults,
  };
}

export { DEFAULT_MODEL, DEFAULT_MAX_TOKENS };
