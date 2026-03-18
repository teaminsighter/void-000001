// ══════════════════════════════════════
// VOID — OpenAI GPT Provider
// ══════════════════════════════════════

import OpenAI from 'openai';
import { BaseProvider } from './base-provider';
import { toOpenAITools } from './tool-adapter';
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

export class OpenAIProvider extends BaseProvider {
  readonly name: ProviderType = 'openai';
  readonly displayName = 'GPT (OpenAI)';
  readonly defaultModel = 'gpt-4o';

  private client: OpenAI;

  constructor() {
    super();
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async checkStatus(): Promise<ProviderStatus> {
    if (!process.env.OPENAI_API_KEY) {
      return {
        connected: false,
        error: 'API key not configured',
        errorType: 'auth',
      };
    }

    try {
      // Make a minimal API call to verify connectivity
      await this.client.chat.completions.create({
        model: this.defaultModel,
        max_tokens: 1,
        messages: [{ role: 'user', content: 'hi' }],
      });
      return { connected: true, model: this.defaultModel };
    } catch (error) {
      const err = error as { status?: number; message?: string; code?: string };

      if (err.status === 401 || err.code === 'invalid_api_key') {
        return { connected: false, error: 'Invalid API key', errorType: 'auth' };
      }
      if (err.status === 402 || err.code === 'insufficient_quota') {
        return { connected: false, error: 'Insufficient quota', errorType: 'billing' };
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
    const response = await this.client.chat.completions.create({
      model: this.getModel(options),
      max_tokens: this.getMaxTokens(options),
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
    });

    return response.choices[0]?.message?.content || '';
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

    // Convert tools to OpenAI format
    const openaiTools = toOpenAITools(
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

    const apiMessages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    let rounds = 0;
    let finalReply = '';

    while (rounds < MAX_TOOL_ROUNDS) {
      rounds++;

      const stream = await this.client.chat.completions.create({
        model: this.getModel(options),
        max_tokens: this.getMaxTokens(options),
        messages: apiMessages,
        tools: openaiTools,
        stream: true,
      });

      let currentText = '';
      const toolCalls: Map<number, { id: string; name: string; arguments: string }> = new Map();
      let finishReason: string | null = null;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        finishReason = chunk.choices[0]?.finish_reason || finishReason;

        if (delta?.content) {
          currentText += delta.content;
          callbacks.onToken(delta.content);
        }

        // Handle tool calls
        if (delta?.tool_calls) {
          for (const tc of delta.tool_calls) {
            const existing = toolCalls.get(tc.index) || { id: '', name: '', arguments: '' };
            if (tc.id) existing.id = tc.id;
            if (tc.function?.name) existing.name = tc.function.name;
            if (tc.function?.arguments) existing.arguments += tc.function.arguments;
            toolCalls.set(tc.index, existing);
          }
        }
      }

      // If no tool calls, we're done
      if (finishReason === 'stop' || toolCalls.size === 0) {
        finalReply = currentText;
        return { reply: finalReply, toolResults: allToolResults };
      }

      // Process tool calls
      if (finishReason === 'tool_calls' || toolCalls.size > 0) {
        // Add assistant message with tool calls
        const toolCallsArray = Array.from(toolCalls.values()).map(tc => ({
          id: tc.id,
          type: 'function' as const,
          function: { name: tc.name, arguments: tc.arguments },
        }));

        apiMessages.push({
          role: 'assistant',
          content: currentText || null,
          tool_calls: toolCallsArray,
        });

        // Execute each tool and collect results
        for (const tc of toolCallsArray) {
          let toolInput: Record<string, unknown> = {};
          try {
            toolInput = JSON.parse(tc.function.arguments);
          } catch {
            toolInput = {};
          }

          callbacks.onToolStart(tc.function.name, toolInput);

          const { result, success } = await executeTool(tc.function.name, toolInput);

          allToolResults.push({
            toolName: tc.function.name,
            toolInput,
            result,
            success,
          });

          callbacks.onToolDone(tc.function.name, result, success);

          // Add tool result to messages
          apiMessages.push({
            role: 'tool',
            tool_call_id: tc.id,
            content: result,
          });
        }

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
