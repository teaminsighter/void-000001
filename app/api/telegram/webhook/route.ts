import { NextRequest, NextResponse } from 'next/server';
import { chat, chatWithTools } from '@/lib/anthropic';
import { search, buildContext } from '@/lib/khoj';
import { buildPrompt, buildPersonaPrompt } from '@/lib/prompts';
import { VOID_TOOLS } from '@/lib/tools';
import { sendTelegramMessage, downloadTelegramFile, isOwnerChat, sendTypingAction, CHAT_ID } from '@/lib/telegram';
import { appendToLog, writeFile, readFile, listFiles, moveFile, softDelete, listVersions, restoreVersion } from '@/lib/vault';
import { triggerWorkflow } from '@/lib/n8n';
import { addMessage, createConversation, getConversation, getMessages, upsertContact, getContactByName, getContactByTelegramId, listContacts } from '@/lib/db';
import { fetchWebPage, searchWeb } from '@/lib/web';
import fs from 'fs/promises';
import path from 'path';

const VAULT_PATH = process.env.VAULT_PATH || './vault-template';
const OWNER_CONV_ID = 'telegram-agent';

// ── Telegram Update types ────────────

interface TelegramFrom {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
}

interface TelegramUpdate {
  message?: {
    message_id: number;
    chat: { id: number };
    from?: TelegramFrom;
    text?: string;
    photo?: { file_id: string; width: number; height: number }[];
    document?: { file_id: string; file_name?: string; mime_type?: string };
    caption?: string;
  };
}

// ── Helpers ──────────────────────────

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

function ensureConversation(id: string, title: string): void {
  try {
    if (!getConversation(id)) createConversation(id, title);
  } catch {
    try { createConversation(id, title); } catch { /* already exists */ }
  }
}

// ── Tool Executor (owner mode — full tools) ─

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

      // ── Telegram Tools ──────────────
      case 'telegram_send': {
        const contact = getContactByName(input.contact_name as string);
        if (!contact) return { result: `No contact found matching "${input.contact_name}"`, success: false };
        const convId = `tg-${contact.telegram_id}`;
        ensureConversation(convId, `${contact.display_name} (Telegram)`);
        const sent = await sendTelegramMessage(contact.telegram_id, input.message as string);
        if (sent) {
          addMessage(convId, { id: `tg-${Date.now()}-out`, role: 'assistant', content: input.message as string });
        }
        return { result: sent ? `Message sent to ${contact.display_name}` : 'Failed to send message', success: sent };
      }
      case 'telegram_contacts': {
        const action = input.action as string;
        if (action === 'search' && input.query) {
          const contact = getContactByName(input.query as string);
          return { result: contact ? `Found: ${contact.display_name} (@${contact.username || 'no username'})` : `No contact matching "${input.query}"`, success: true };
        }
        const contacts = listContacts();
        if (!contacts.length) return { result: 'No Telegram contacts yet.', success: true };
        const list = contacts.map(c => `- ${c.display_name}${c.username ? ` (@${c.username})` : ''}`).join('\n');
        return { result: `${contacts.length} contact(s):\n${list}`, success: true };
      }
      case 'telegram_history': {
        const contact = getContactByName(input.contact_name as string);
        if (!contact) return { result: `No contact found matching "${input.contact_name}"`, success: false };
        const convId = `tg-${contact.telegram_id}`;
        const msgs = getMessages(convId);
        const limit = (input.limit as number) || 10;
        const recent = msgs.slice(-limit);
        if (!recent.length) return { result: `No conversation history with ${contact.display_name}`, success: true };
        const history = recent.map(m => `[${m.role}] ${m.content}`).join('\n');
        return { result: `Last ${recent.length} messages with ${contact.display_name}:\n${history}`, success: true };
      }

      // ── Web Tools ─────────────────────
      case 'web_fetch': {
        const metadata = await fetchWebPage(input.url as string);
        const parts = [
          `**${metadata.title}**`,
          metadata.siteName ? `Site: ${metadata.siteName}` : '',
          metadata.description ? `Description: ${metadata.description}` : '',
          metadata.author ? `Author: ${metadata.author}` : '',
          metadata.type ? `Type: ${metadata.type}` : '',
          `URL: ${metadata.url}`,
          '',
          'Content Preview:',
          metadata.contentPreview,
        ].filter(Boolean).join('\n');
        return { result: parts, success: true };
      }

      case 'web_search': {
        const limit = Math.min((input.limit as number) || 5, 10);
        const searchRes = await searchWeb(input.query as string, limit);
        if (searchRes.count === 0) {
          return { result: `No web results found for "${input.query}".`, success: false };
        }
        const resultList = searchRes.results.map((r, i) =>
          `${i + 1}. **${r.title}**\n   ${r.url}\n   ${r.content}`
        ).join('\n\n');
        return { result: `Web results for "${input.query}" (${searchRes.count}):\n\n${resultList}`, success: true };
      }

      default: return { result: `Unknown: ${name}`, success: false };
    }
  } catch (error) { return { result: `Error: ${String(error)}`, success: false }; }
}

// ── Handle owner messages (full VOID agent) ─

async function handleOwnerMessage(chatId: string, text: string, update: TelegramUpdate): Promise<void> {
  ensureConversation(OWNER_CONV_ID, 'Telegram Agent');

  // Handle photo attachments
  let messageText = text;
  if (update.message?.photo && update.message.photo.length > 0) {
    const photo = update.message.photo[update.message.photo.length - 1];
    const buffer = await downloadTelegramFile(photo.file_id);
    if (buffer) {
      messageText = `[User sent a photo${text ? `: ${text}` : ''}]\n(Image received but text-only processing available via Telegram)`;
    }
  }

  if (!messageText) return;

  addMessage(OWNER_CONV_ID, {
    id: `tg-${Date.now()}-u`,
    role: 'user',
    content: messageText,
  });

  // Search vault for context
  const searchResults = await search(messageText);
  const context = buildContext(searchResults.results);
  const systemPrompt = buildPrompt(context);

  // Load recent conversation history
  const recentMessages = getMessages(OWNER_CONV_ID).slice(-10);
  const history = recentMessages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  // Call Claude with all tools
  const { reply, toolResults } = await chatWithTools(
    history,
    systemPrompt,
    VOID_TOOLS,
    executeTool,
  );

  addMessage(OWNER_CONV_ID, {
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

  await sendTelegramMessage(chatId, responseText);
}

// ── Handle external messages (persona auto-reply) ─

async function handleExternalMessage(chatId: string, text: string, from: TelegramFrom): Promise<void> {
  // Show typing indicator
  await sendTypingAction(chatId);

  // Auto-register contact
  const displayName = [from.first_name, from.last_name].filter(Boolean).join(' ') || from.username || `User ${from.id}`;
  upsertContact({
    telegram_id: String(from.id),
    username: from.username ?? null,
    first_name: from.first_name ?? null,
    last_name: from.last_name ?? null,
    display_name: displayName,
  });

  // Ensure per-contact conversation
  const convId = `tg-${from.id}`;
  ensureConversation(convId, `${displayName} (Telegram)`);

  // Persist incoming message
  addMessage(convId, {
    id: `tg-${Date.now()}-u`,
    role: 'user',
    content: text,
  });

  // Read persona config from vault
  let persona = '';
  try {
    persona = await readFile('07-Agent-Memory/persona.md');
  } catch { /* use default */ }

  // Read today's schedule for context
  let schedule = '';
  try {
    const daily = await readFile(dailyPath());
    const planMatch = daily.match(/## (Plan|Tasks)\n[\s\S]*?(?=\n##|$)/g);
    if (planMatch) schedule = planMatch.join('\n');
  } catch { /* no daily note */ }

  // Get contact notes
  const contact = getContactByTelegramId(String(from.id));
  const contactNotes = contact?.notes || '';

  // Build persona prompt (no tools for external contacts)
  const systemPrompt = buildPersonaPrompt(persona, displayName, contactNotes, schedule);

  // Load recent conversation history with this contact
  const recentMessages = getMessages(convId).slice(-10);
  const history = recentMessages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  // Simple chat — NO tools for external contacts
  const reply = await chat(history, systemPrompt);

  // Persist reply
  addMessage(convId, {
    id: `tg-${Date.now()}-a`,
    role: 'assistant',
    content: reply,
  });

  // Send reply to external user
  await sendTelegramMessage(chatId, reply);

  // Notify owner about the conversation
  if (CHAT_ID) {
    const truncatedText = text.length > 200 ? text.slice(0, 200) + '...' : text;
    const truncatedReply = reply.length > 200 ? reply.slice(0, 200) + '...' : reply;
    await sendTelegramMessage(CHAT_ID, `📩 ${displayName}${from.username ? ` (@${from.username})` : ''}: ${truncatedText}\n💬 Reply: ${truncatedReply}`);
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
    const from = update.message.from;

    // Skip empty messages (unless photo)
    if (!text && !update.message.photo) {
      return NextResponse.json({ ok: true });
    }

    if (isOwnerChat(update.message.chat.id)) {
      // Owner → full VOID agent with all tools
      await handleOwnerMessage(chatId, text, update);
    } else if (from) {
      // External user → persona auto-reply
      await handleExternalMessage(chatId, text, from);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Telegram/webhook] Error:', error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}
