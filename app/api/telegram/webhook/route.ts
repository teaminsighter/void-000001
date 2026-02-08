import { NextRequest, NextResponse } from 'next/server';
import { chatWithTools } from '@/lib/anthropic';
import { search, buildContext } from '@/lib/khoj';
import { buildPrompt } from '@/lib/prompts';
import { VOID_TOOLS } from '@/lib/tools';
import { sendTelegramMessage, downloadTelegramFile, verifyTelegramUpdate } from '@/lib/telegram';
import { appendToLog, writeFile, readFile, listFiles, moveFile, softDelete, listVersions, restoreVersion } from '@/lib/vault';
import { triggerWorkflow } from '@/lib/n8n';
import { addMessage, createConversation, getConversation, getMessages } from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';

const VAULT_PATH = process.env.VAULT_PATH || './vault-template';
const TELEGRAM_CONV_ID = 'telegram-agent';

// ── Telegram Update types ────────────

interface TelegramUpdate {
  message?: {
    message_id: number;
    chat: { id: number };
    from?: { id: number; first_name?: string };
    text?: string;
    photo?: { file_id: string; width: number; height: number }[];
    document?: { file_id: string; file_name?: string; mime_type?: string };
    caption?: string;
  };
}

// ── Tool Executor (reused from chat) ─

function dailyPath(): string {
  return `01-Daily/${new Date().toISOString().split('T')[0]}.md`;
}

interface TaskItem { text: string; done: boolean; time?: string; }

async function readTasks(): Promise<{ tasks: TaskItem[]; content: string }> {
  let content = '';
  try { content = await readFile(dailyPath()); } catch { /* */ }
  const tasks: TaskItem[] = [];
  const taskMatch = content.match(/## Tasks\n([\s\S]*?)(?=\n##|$)/);
  if (taskMatch) {
    const lines = taskMatch[1].split('\n').filter((l: string) => l.trim().startsWith('- ['));
    for (const line of lines) {
      const done = line.includes('[x]') || line.includes('[X]');
      const text = line.replace(/^- \[.\]\s*/, '').trim();
      const timeMatch = text.match(/^(\d{1,2}:\d{2})\s*[—-]\s*/);
      tasks.push({
        text: timeMatch ? text.replace(timeMatch[0], '') : text,
        done,
        time: timeMatch ? timeMatch[1] : undefined,
      });
    }
  }
  return { tasks, content };
}

async function writeTasks(tasks: TaskItem[], existingContent: string): Promise<void> {
  const taskLines = tasks.map(t =>
    `- [${t.done ? 'x' : ' '}] ${t.time ? `${t.time} — ` : ''}${t.text}`
  ).join('\n');
  let newContent = existingContent;
  if (existingContent.includes('## Tasks')) {
    newContent = existingContent.replace(/## Tasks\n[\s\S]*?(?=\n##|$)/, `## Tasks\n${taskLines}\n`);
  } else {
    newContent = existingContent + `\n## Tasks\n${taskLines}\n`;
  }
  await writeFile(dailyPath(), newContent, 'overwrite');
}

async function executeTool(
  name: string,
  input: Record<string, unknown>
): Promise<{ result: string; success: boolean }> {
  try {
    switch (name) {
      case 'task_add': {
        const { tasks, content } = await readTasks();
        tasks.push({ text: input.text as string, done: false, time: input.time as string | undefined });
        await writeTasks(tasks, content);
        return { result: `Added: "${input.text}" (${tasks.length} total)`, success: true };
      }
      case 'task_remove': {
        const match = (input.match as string).toLowerCase();
        const { tasks, content } = await readTasks();
        const filtered = tasks.filter(t => !t.text.toLowerCase().includes(match));
        if (filtered.length === tasks.length) return { result: `No task matching "${match}"`, success: false };
        await writeTasks(filtered, content);
        return { result: `Removed task matching "${match}"`, success: true };
      }
      case 'task_toggle': {
        const match = (input.match as string).toLowerCase();
        const { tasks, content } = await readTasks();
        const task = tasks.find(t => t.text.toLowerCase().includes(match));
        if (!task) return { result: `No task matching "${match}"`, success: false };
        task.done = !task.done;
        await writeTasks(tasks, content);
        return { result: `"${task.text}" → ${task.done ? 'done ✓' : 'undone'}`, success: true };
      }
      case 'task_list': {
        const { tasks } = await readTasks();
        if (!tasks.length) return { result: 'No tasks today.', success: true };
        return { result: tasks.map((t, i) => `${i + 1}. [${t.done ? 'x' : ' '}] ${t.text}`).join('\n'), success: true };
      }
      case 'log_entry': {
        await appendToLog(input.text as string);
        return { result: `Logged: "${input.text}"`, success: true };
      }
      case 'save_note': {
        await writeFile(input.path as string, input.content as string, 'overwrite');
        return { result: `Saved: ${input.path}`, success: true };
      }
      case 'save_memory': {
        const memType = (input.memory_type as string) || 'context';
        const content = input.content as string;
        const memFiles: Record<string, string> = { preference: '07-Agent-Memory/preferences.md', goal: '07-Agent-Memory/goals.md', context: '07-Agent-Memory/agent-context.md' };
        const filePath = memFiles[memType] || memFiles.context;
        const fullPath = path.join(VAULT_PATH, filePath);
        try { await fs.access(fullPath); await fs.appendFile(fullPath, `\n- ${content}`, 'utf-8'); }
        catch { await fs.mkdir(path.dirname(fullPath), { recursive: true }); await fs.writeFile(fullPath, `# ${memType}\n\n- ${content}`, 'utf-8'); }
        return { result: `Saved to ${memType}: "${content}"`, success: true };
      }
      case 'vault_read': {
        let content = await readFile(input.path as string);
        if (content.length > 4000) content = content.slice(0, 4000) + '\n...';
        return { result: content, success: true };
      }
      case 'vault_list': {
        const files = await listFiles((input.folder as string) || '');
        return { result: files.length ? files.map(f => f.path).join('\n') : 'No files.', success: true };
      }
      case 'vault_search': {
        const res = await search(input.query as string, 'markdown', (input.limit as number) || 5);
        if (!res.count) return { result: `No results for "${input.query}"`, success: true };
        return { result: res.results.map((r, i) => `${i + 1}. ${r.file}`).join('\n'), success: true };
      }
      case 'vault_move': { await moveFile(input.from as string, input.to as string); return { result: `Moved`, success: true }; }
      case 'vault_delete': { await softDelete(input.path as string); return { result: `Deleted`, success: true }; }
      case 'vault_versions': {
        const versions = await listVersions(input.path as string);
        if (!versions.length) return { result: 'No versions.', success: true };
        return { result: versions.map((v, i) => `${i + 1}. ${v.timestamp}`).join('\n'), success: true };
      }
      case 'vault_restore': {
        await restoreVersion(input.path as string, input.timestamp as string);
        return { result: `Restored`, success: true };
      }
      case 'vault_ask': {
        const { khojChat } = await import('@/lib/khoj');
        return { result: await khojChat(input.query as string), success: true };
      }
      case 'send_email': { const r = await triggerWorkflow('email', input); return { result: r.success ? 'Done' : `Failed: ${r.error}`, success: r.success }; }
      case 'set_reminder': { const r = await triggerWorkflow('remind', input); return { result: r.success ? `Reminder set` : `Failed: ${r.error}`, success: r.success }; }
      case 'crm_update': { const r = await triggerWorkflow('crm', input); return { result: r.success ? 'Done' : `Failed: ${r.error}`, success: r.success }; }
      default: return { result: `Unknown: ${name}`, success: false };
    }
  } catch (error) { return { result: `Error: ${String(error)}`, success: false }; }
}

// ── Ensure Telegram conversation exists ─

async function ensureTelegramConversation(): Promise<void> {
  try {
    const conv = getConversation(TELEGRAM_CONV_ID);
    if (!conv) {
      createConversation(TELEGRAM_CONV_ID, 'Telegram Agent');
    }
  } catch {
    try { createConversation(TELEGRAM_CONV_ID, 'Telegram Agent'); } catch { /* already exists */ }
  }
}

// ── POST /api/telegram/webhook ───────

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json();

    if (!update.message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = String(update.message.chat.id);
    const text = update.message.text || update.message.caption || '';

    // Security: verify sender
    if (!verifyTelegramUpdate(update.message.chat.id)) {
      console.warn('[Telegram] Unauthorized chat:', chatId);
      return NextResponse.json({ ok: true });
    }

    // Skip empty messages
    if (!text && !update.message.photo) {
      return NextResponse.json({ ok: true });
    }

    // Ensure conversation exists
    await ensureTelegramConversation();

    // Handle photo attachments
    let messageText = text;
    if (update.message.photo && update.message.photo.length > 0) {
      // Get the largest photo
      const photo = update.message.photo[update.message.photo.length - 1];
      const buffer = await downloadTelegramFile(photo.file_id);
      if (buffer) {
        messageText = `[User sent a photo${text ? `: ${text}` : ''}]\n(Image received but text-only processing available via Telegram)`;
      }
    }

    if (!messageText) {
      return NextResponse.json({ ok: true });
    }

    // Persist user message
    addMessage(TELEGRAM_CONV_ID, {
      id: `tg-${Date.now()}-u`,
      role: 'user',
      content: messageText,
    });

    // Search vault for context
    const searchResults = await search(messageText);
    const context = buildContext(searchResults.results);
    const systemPrompt = buildPrompt(context);

    // Load recent conversation history (last 10 messages)
    const recentMessages = getMessages(TELEGRAM_CONV_ID).slice(-10);
    const history = recentMessages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Call Claude with tools
    const { reply, toolResults } = await chatWithTools(
      history,
      systemPrompt,
      VOID_TOOLS,
      executeTool,
    );

    // Persist assistant message
    addMessage(TELEGRAM_CONV_ID, {
      id: `tg-${Date.now()}-a`,
      role: 'assistant',
      content: reply,
    });

    // Build response with tool results
    let responseText = reply;
    if (toolResults.length > 0) {
      const toolSummary = toolResults
        .map(r => `${r.success ? '✓' : '✗'} ${r.toolName}`)
        .join('\n');
      responseText = `${reply}\n\n_Actions:_\n${toolSummary}`;
    }

    // Send response to Telegram
    await sendTelegramMessage(chatId, responseText);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Telegram/webhook] Error:', error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}
