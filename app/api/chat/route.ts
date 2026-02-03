import { NextRequest, NextResponse } from 'next/server';
import { chat } from '@/lib/anthropic';
import { search, buildContext } from '@/lib/khoj';
import { buildPrompt, parseActions } from '@/lib/prompts';
import { triggerWorkflow } from '@/lib/n8n';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  history?: ChatMessage[];
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

    // 6. Execute actions if present
    const actionResults = [];
    for (const action of actions) {
      try {
        const result = await triggerWorkflow(
          action.type as 'plan' | 'log' | 'email' | 'remind' | 'crm' | 'memory',
          action.payload as Record<string, unknown>
        );
        actionResults.push({ action: action.type, success: result.success, data: result.data });
      } catch (error) {
        actionResults.push({ action: action.type, success: false, error: String(error) });
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
