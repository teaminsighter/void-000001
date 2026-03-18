// ══════════════════════════════════════
// VOID — AI Provider Types
// Shared interfaces for multi-provider support
// ══════════════════════════════════════

export type ProviderType = 'claude' | 'openai' | 'gemini';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResult {
  toolName: string;
  toolInput: Record<string, unknown>;
  result: string;
  success: boolean;
}

export interface StreamCallbacks {
  onToken: (text: string) => void;
  onToolStart: (toolName: string, toolInput: Record<string, unknown>) => void;
  onToolDone: (toolName: string, result: string, success: boolean) => void;
}

export interface ChatResponse {
  reply: string;
  toolResults: ToolResult[];
}

export interface ChatOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export type ProviderErrorType = 'auth' | 'billing' | 'rate_limit' | 'network' | 'unknown';

export interface ProviderStatus {
  connected: boolean;
  error?: string;
  errorType?: ProviderErrorType;
  model?: string;
}

export interface ProviderConfig {
  type: ProviderType;
  displayName: string;
  defaultModel: string;
  models: { id: string; name: string }[];
  apiKeyEnvVar: string;
}

export const PROVIDER_CONFIGS: Record<ProviderType, ProviderConfig> = {
  claude: {
    type: 'claude',
    displayName: 'Claude (Anthropic)',
    defaultModel: 'claude-sonnet-4-20250514',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
      { id: 'claude-opus-4-20250514', name: 'Claude Opus 4' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' },
    ],
    apiKeyEnvVar: 'ANTHROPIC_API_KEY',
  },
  openai: {
    type: 'openai',
    displayName: 'GPT (OpenAI)',
    defaultModel: 'gpt-4o',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
    ],
    apiKeyEnvVar: 'OPENAI_API_KEY',
  },
  gemini: {
    type: 'gemini',
    displayName: 'Gemini (Google)',
    defaultModel: 'gemini-1.5-pro',
    models: [
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    ],
    apiKeyEnvVar: 'GOOGLE_AI_API_KEY',
  },
};

export type ToolExecutor = (
  name: string,
  input: Record<string, unknown>
) => Promise<{ result: string; success: boolean }>;
