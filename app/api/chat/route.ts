import { NextRequest, NextResponse } from 'next/server';
import { chat } from '@/lib/anthropic';
import { search, buildContext } from '@/lib/khoj';
import { buildPrompt, parseActions } from '@/lib/prompts';
import { appendToLog, writeFile } from '@/lib/vault';
import { triggerWorkflow } from '@/lib/n8n';
import fs from 'fs/promises';
import path from 'path';

const VAULT_PATH = process.env.VAULT_PATH || './vault-template';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

/**
 * Handle an action directly without n8n
 * Returns { success, data } or null if action type isn't handled locally
 */
async function handleActionDirect(
  type: string,
  payload: Record<string, unknown>
): Promise<{ success: boolean; data?: unknown } | null> {
  switch (type) {
    case 'log': {
      const text = (payload.text || payload.entry || payload.content) as string;
      if (text) {
        await appendToLog(text);
        return { success: true, data: { message: 'Logged to daily note' } };
      }
      return { success: false, data: { error: 'No text provided' } };
    }

    case 'memory': {
      const memType = (payload.type || 'context') as string;
      const content = (payload.content || payload.text) as string;
      if (content) {
        const memFiles: Record<string, string> = {
          preference: '07-Agent-Memory/preferences.md',
          goal: '07-Agent-Memory/goals.md',
          context: '07-Agent-Memory/agent-context.md',
        };
        const filePath = memFiles[memType] || memFiles.context;
        const fullPath = path.join(VAULT_PATH, filePath);

        try {
          await fs.access(fullPath);
          await fs.appendFile(fullPath, `\n- ${content}`, 'utf-8');
        } catch {
          await fs.mkdir(path.dirname(fullPath), { recursive: true });
          await fs.writeFile(fullPath, `# ${memType}\n\n- ${content}`, 'utf-8');
        }
        return { success: true, data: { message: `Saved to ${memType}` } };
      }
      return { success: false, data: { error: 'No content provided' } };
    }

    case 'save': {
      // Save a new note to vault
      const notePath = (payload.path || payload.file) as string;
      const content = (payload.content || payload.text) as string;
      if (notePath && content) {
        await writeFile(notePath, content, 'overwrite');
        return { success: true, data: { message: `Saved ${notePath}` } };
      }
      return { success: false, data: { error: 'Path and content required' } };
    }

    default:
      return null; // Not handled locally
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, history = [] } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // 1. Search Khoj for relevant context
    const searchResults = await search(message);
    const context = buildContext(searchResults.results);

    // 2. Build system prompt with context
    const systemPrompt = buildPrompt(context);

    // 3. Prepare messages for Claude
    const messages: ChatMessage[] = [
      ...history,
      { role: 'user', content: message },
    ];

    // 4. Call Claude API
    const reply = await chat(messages, systemPrompt);

    // 5. Parse any actions from the response
    const actions = parseActions(reply);

    // 6. Execute actions — try direct first, fall back to n8n
    const actionResults = [];
    for (const action of actions) {
      try {
        // Try handling directly (log, memory, save)
        const directResult = await handleActionDirect(
          action.type,
          action.payload as Record<string, unknown>
        );

        if (directResult) {
          actionResults.push({
            action: action.type,
            success: directResult.success,
            data: directResult.data,
          });
        } else {
          // Fall back to n8n for other action types
          const result = await triggerWorkflow(
            action.type as 'plan' | 'log' | 'email' | 'remind' | 'crm' | 'memory',
            action.payload as Record<string, unknown>
          );
          actionResults.push({
            action: action.type,
            success: result.success,
            data: result.data,
          });
        }
      } catch (error) {
        actionResults.push({
          action: action.type,
          success: false,
          error: String(error),
        });
      }
    }

    return NextResponse.json({
      reply,
      actions: actionResults.length > 0 ? actionResults : undefined,
      context: {
        searchResults: searchResults.count,
        files: searchResults.results.map(r => r.file),
      },
    });
  } catch (error) {
    console.error('[API/chat] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message', details: String(error) },
      { status: 500 }
    );
  }
}
