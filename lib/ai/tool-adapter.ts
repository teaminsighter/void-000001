// ══════════════════════════════════════
// VOID — Tool Format Adapter
// Converts VOID_TOOLS to each provider's format
// ══════════════════════════════════════

import type Anthropic from '@anthropic-ai/sdk';
import type { ToolDefinition } from './types';

// ── Anthropic/Claude Format ──────────────
// Already in the correct format, just pass through
export function toAnthropicTools(tools: Anthropic.Tool[]): Anthropic.Tool[] {
  return tools;
}

// ── OpenAI Format ────────────────────────
// OpenAI uses { type: "function", function: { name, description, parameters } }
export interface OpenAITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
}

export function toOpenAITools(tools: Anthropic.Tool[]): OpenAITool[] {
  return tools.map(tool => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description || '',
      parameters: {
        type: 'object' as const,
        properties: (tool.input_schema.properties || {}) as Record<string, unknown>,
        required: tool.input_schema.required ?? undefined,
      },
    },
  }));
}

// ── Gemini Format ────────────────────────
// Gemini uses functionDeclarations array
export interface GeminiToolDeclaration {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface GeminiTools {
  functionDeclarations: GeminiToolDeclaration[];
}

export function toGeminiTools(tools: Anthropic.Tool[]): GeminiTools {
  return {
    functionDeclarations: tools.map(tool => ({
      name: tool.name,
      description: tool.description || '',
      parameters: {
        type: 'object' as const,
        properties: (tool.input_schema.properties || {}) as Record<string, unknown>,
        required: tool.input_schema.required ?? undefined,
      },
    })),
  };
}

// ── Convert from VOID internal format ────
// If we ever switch VOID_TOOLS to a neutral format
export function fromToolDefinitions(tools: ToolDefinition[]): Anthropic.Tool[] {
  return tools.map(tool => ({
    name: tool.name,
    description: tool.description,
    input_schema: {
      type: 'object' as const,
      properties: tool.inputSchema.properties,
      required: tool.inputSchema.required,
    },
  }));
}
