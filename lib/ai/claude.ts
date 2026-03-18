// ══════════════════════════════════════
// VOID — Claude (Anthropic) Provider
// ══════════════════════════════════════

import Anthropic from '@anthropic-ai/sdk';
import { BaseProvider } from './base-provider';
import { toAnthropicTools } from './tool-adapter';
import type {
  ProviderType,
  AIMessage,
  ToolDefinition,
  ChatResponse,
  ChatOptions,
  StreamCallbacks,
  ProviderStatus,
  ToolResult,
  ToolExecutor,
} from './types';

const MAX_TOOL_ROUNDS = 10;

export class ClaudeProvider extends BaseProvider {
  readonly name: ProviderType = 'claude';
  readonly displayName = 'Claude (Anthropic)';
  readonly defaultModel = 'claude-sonnet-4-20250514';

  private client: Anthropic;

  constructor() {
    super();
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async checkStatus(): Promise<ProviderStatus> {
    if (!process.env.ANTHROPIC_API_KEY) {
      return {
        connected: false,
        error: 'API key not configured',
        errorType: 'auth',
      };
    }

    try {
      // Make a minimal API call to verify connectivity
      await this.client.messages.create({
        model: this.defaultModel,
        max_tokens: 1,
        messages: [{ role: 'user', content: 'hi' }],
      });
      return { connected: true, model: this.defaultModel };
    } catch (error) {
      const err = error as { status?: number; message?: string };

      if (err.status === 401) {
        return { connected: false, error: 'Invalid API key', errorType: 'auth' };
      }
      if (err.status === 402 || err.message?.includes('credit')) {
        return { connected: false, error: 'Credit balance too low', errorType: 'billing' };
      }
      if (err.status === 429) {
        return { connected: false, error: 'Rate limited', errorType: 'rate_limit' };
      }

      return {
        connected: false,
        error: err.message || 'Unknown error',
        errorType: 'unknown',
      };
    }
  }

  async chat(
    messages: AIMessage[],
    systemPrompt: string,
    options?: ChatOptions
  ): Promise<string> {
    const response = await this.client.messages.create({
      model: this.getModel(options),
      max_tokens: this.getMaxTokens(options),
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    });

    const textBlock = response.content.find(block => block.type === 'text');
    return textBlock && textBlock.type === 'text' ? textBlock.text : '';
  }

  async streamChatWithTools(
    messages: AIMessage[],
    systemPrompt: string,
    tools: ToolDefinition[],
    executeTool: ToolExecutor,
    callbacks: StreamCallbacks,
    options?: ChatOptions
  ): Promise<ChatResponse> {
    const allToolResults: ToolResult[] = [];

    // Convert tools to Anthropic format
    const anthropicTools = toAnthropicTools(
      tools.map(t => ({
        name: t.name,
        description: t.description,
        input_schema: {
          type: 'object' as const,
          properties: t.inputSchema.properties,
          required: t.inputSchema.required,
        },
      }))
    );

    const apiMessages: Anthropic.MessageParam[] = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    let rounds = 0;
    let finalReply = '';

    while (rounds < MAX_TOOL_ROUNDS) {
      rounds++;

      const stream = this.client.messages.stream({
        model: this.getModel(options),
        max_tokens: this.getMaxTokens(options),
        system: systemPrompt,
        tools: anthropicTools,
        messages: apiMessages,
      });

      let currentText = '';
      const contentBlocks: Anthropic.ContentBlock[] = [];
      let stopReason: string | null = null;

      for await (const event of stream) {
        if (event.type === 'content_block_delta') {
          if (event.delta.type === 'text_delta') {
            currentText += event.delta.text;
            callbacks.onToken(event.delta.text);
          }
        } else if (event.type === 'message_delta') {
          stopReason = event.delta.stop_reason || null;
        }
      }

      const finalMessage = await stream.finalMessage();
      contentBlocks.push(...finalMessage.content);
      stopReason = finalMessage.stop_reason;

      if (stopReason === 'end_turn' || stopReason === 'max_tokens') {
        finalReply = currentText;
        return { reply: finalReply, toolResults: allToolResults };
      }

      if (stopReason === 'tool_use') {
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

      finalReply = currentText;
      return { reply: finalReply, toolResults: allToolResults };
    }

    return {
      reply: finalReply || 'I reached the maximum number of tool calls.',
      toolResults: allToolResults,
    };
  }
}
