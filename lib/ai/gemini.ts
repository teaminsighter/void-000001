// ══════════════════════════════════════
// VOID — Google Gemini Provider
// ══════════════════════════════════════

import {
  GoogleGenerativeAI,
  FunctionCallingMode,
  SchemaType,
} from '@google/generative-ai';
import type {
  Content,
  Part,
  FunctionCall,
  FunctionDeclaration,
  FunctionDeclarationSchema,
} from '@google/generative-ai';
import { BaseProvider } from './base-provider';
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

export class GeminiProvider extends BaseProvider {
  readonly name: ProviderType = 'gemini';
  readonly displayName = 'Gemini (Google)';
  readonly defaultModel = 'gemini-1.5-pro';

  private client: GoogleGenerativeAI;

  constructor() {
    super();
    this.client = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
  }

  async checkStatus(): Promise<ProviderStatus> {
    if (!process.env.GOOGLE_AI_API_KEY) {
      return {
        connected: false,
        error: 'API key not configured',
        errorType: 'auth',
      };
    }

    try {
      const model = this.client.getGenerativeModel({ model: this.defaultModel });
      await model.generateContent('hi');
      return { connected: true, model: this.defaultModel };
    } catch (error) {
      const err = error as { status?: number; message?: string };

      if (err.message?.includes('API_KEY_INVALID') || err.status === 401) {
        return { connected: false, error: 'Invalid API key', errorType: 'auth' };
      }
      if (err.message?.includes('QUOTA') || err.status === 429) {
        return { connected: false, error: 'Quota exceeded', errorType: 'billing' };
      }
      if (err.message?.includes('RATE_LIMIT')) {
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
    const model = this.client.getGenerativeModel({
      model: this.getModel(options),
      systemInstruction: systemPrompt,
    });

    const contents = this.toGeminiContents(messages);
    const result = await model.generateContent({ contents });
    return result.response.text();
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

    // Convert tools to Gemini function declarations
    const functionDeclarations: FunctionDeclaration[] = tools.map(t => ({
      name: t.name,
      description: t.description,
      parameters: this.convertSchema(t.inputSchema),
    }));

    const model = this.client.getGenerativeModel({
      model: this.getModel(options),
      systemInstruction: systemPrompt,
      tools: [{ functionDeclarations }],
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingMode.AUTO,
        },
      },
    });

    let contents = this.toGeminiContents(messages);
    let rounds = 0;
    let finalReply = '';

    while (rounds < MAX_TOOL_ROUNDS) {
      rounds++;

      const result = await model.generateContentStream({ contents });

      let currentText = '';
      const functionCalls: FunctionCall[] = [];

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          currentText += text;
          callbacks.onToken(text);
        }

        // Check for function calls in candidates
        const candidate = chunk.candidates?.[0];
        if (candidate?.content?.parts) {
          for (const part of candidate.content.parts) {
            if ('functionCall' in part && part.functionCall) {
              functionCalls.push(part.functionCall);
            }
          }
        }
      }

      // If no function calls, we're done
      if (functionCalls.length === 0) {
        finalReply = currentText;
        return { reply: finalReply, toolResults: allToolResults };
      }

      // Add model response to history
      const modelParts: Part[] = [];
      if (currentText) {
        modelParts.push({ text: currentText });
      }
      for (const fc of functionCalls) {
        modelParts.push({ functionCall: fc });
      }
      contents.push({ role: 'model', parts: modelParts });

      // Execute function calls
      const functionResponseParts: Part[] = [];

      for (const fc of functionCalls) {
        const toolInput = (fc.args || {}) as Record<string, unknown>;
        callbacks.onToolStart(fc.name, toolInput);

        const { result, success } = await executeTool(fc.name, toolInput);

        allToolResults.push({
          toolName: fc.name,
          toolInput,
          result,
          success,
        });

        callbacks.onToolDone(fc.name, result, success);

        functionResponseParts.push({
          functionResponse: {
            name: fc.name,
            response: { result, success },
          },
        });
      }

      // Add function responses
      contents.push({ role: 'user', parts: functionResponseParts });
      finalReply = currentText;
    }

    return {
      reply: finalReply || 'I reached the maximum number of tool calls.',
      toolResults: allToolResults,
    };
  }

  private toGeminiContents(messages: AIMessage[]): Content[] {
    return messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
  }

  private convertSchema(schema: ToolDefinition['inputSchema']): FunctionDeclarationSchema {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const properties: Record<string, any> = {};

    for (const [key, value] of Object.entries(schema.properties)) {
      const prop = value as { type?: string; description?: string; enum?: string[] };
      properties[key] = {
        type: this.mapType(prop.type || 'string'),
        description: prop.description,
        enum: prop.enum,
      };
    }

    return {
      type: SchemaType.OBJECT,
      properties,
      required: schema.required,
    };
  }

  private mapType(type: string): SchemaType {
    switch (type) {
      case 'string':
        return SchemaType.STRING;
      case 'number':
      case 'integer':
        return SchemaType.NUMBER;
      case 'boolean':
        return SchemaType.BOOLEAN;
      case 'array':
        return SchemaType.ARRAY;
      case 'object':
        return SchemaType.OBJECT;
      default:
        return SchemaType.STRING;
    }
  }
}
