// ══════════════════════════════════════
// VOID — Base AI Provider
// Abstract class for AI provider implementations
// ══════════════════════════════════════

import type {
  ProviderType,
  AIMessage,
  ToolDefinition,
  ChatResponse,
  ChatOptions,
  StreamCallbacks,
  ProviderStatus,
  ToolExecutor,
} from './types';

export abstract class BaseProvider {
  abstract readonly name: ProviderType;
  abstract readonly displayName: string;
  abstract readonly defaultModel: string;

  /**
   * Check if the provider is properly configured and accessible
   */
  abstract checkStatus(): Promise<ProviderStatus>;

  /**
   * Simple chat without tools (for internal use like plan generation)
   */
  abstract chat(
    messages: AIMessage[],
    systemPrompt: string,
    options?: ChatOptions
  ): Promise<string>;

  /**
   * Streaming chat with tool use support
   * This is the main method used by the chat-stream API
   */
  abstract streamChatWithTools(
    messages: AIMessage[],
    systemPrompt: string,
    tools: ToolDefinition[],
    executeTool: ToolExecutor,
    callbacks: StreamCallbacks,
    options?: ChatOptions
  ): Promise<ChatResponse>;

  /**
   * Get the model to use (from options or default)
   */
  protected getModel(options?: ChatOptions): string {
    return options?.model || this.defaultModel;
  }

  /**
   * Get max tokens (from options or default 4096)
   */
  protected getMaxTokens(options?: ChatOptions): number {
    return options?.maxTokens || 4096;
  }
}
