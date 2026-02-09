import { NextRequest } from 'next/server';
import { chat, chatWithTools } from '@/lib/anthropic';
import { search, buildContext } from '@/lib/khoj';
import { buildPrompt, buildPersonaPrompt } from '@/lib/prompts';
import { VOID_TOOLS } from '@/lib/tools';
import {
  verifyDiscordSignature,
  editInteractionResponse,
  sendDiscordDM,
  sendDiscordMessage,
  isDiscordOwner,
  DISCORD_OWNER_ID,
} from '@/lib/discord';
import { sendTelegramMessage } from '@/lib/telegram';
import { appendToLog, writeFile, readFile, listFiles, moveFile, softDelete, listVersions, restoreVersion } from '@/lib/vault';
import { triggerWorkflow } from '@/lib/n8n';
import {
  addMessage, createConversation, getConversation, getMessages,
  upsertContact, getContactByName, listContacts, getContactByTelegramId,
  upsertDiscordContact, getDiscordContactByName, getDiscordContactById, listDiscordContacts,
} from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';

const VAULT_PATH = process.env.VAULT_PATH || './vault-template';
const OWNER_CONV_ID = 'discord-agent';

// ── Discord Interaction Types ────────

interface DiscordUser {
  id: string;
  username: string;
  global_name?: string | null;
}

interface DiscordInteraction {
  type: number; // 1=PING, 2=APPLICATION_COMMAND
  id: string;
  token: string;
  data?: {
    name: string;
    options?: { name: string; type: number; value: string }[];
  };
  member?: { user: DiscordUser };
  user?: DiscordUser; // Present in DM interactions
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

// ── Tool Executor (full tools for owner) ─

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
      case 'log_entry': { await appendToLog(input.text as string); return { result: `Logged: "${input.text}"`, success: true }; }
      case 'save_note': { await writeFile(input.path as string, input.content as string, 'overwrite'); return { result: `Saved: ${input.path}`, success: true }; }
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
      case 'vault_read': { let content = await readFile(input.path as string); if (content.length > 4000) content = content.slice(0, 4000) + '\n...'; return { result: content, success: true }; }
      case 'vault_list': { const files = await listFiles((input.folder as string) || ''); return { result: files.length ? files.map(f => f.path).join('\n') : 'No files.', success: true }; }
      case 'vault_search': { const res = await search(input.query as string, 'markdown', (input.limit as number) || 5); if (!res.count) return { result: `No results for "${input.query}"`, success: true }; return { result: res.results.map((r, i) => `${i + 1}. ${r.file}`).join('\n'), success: true }; }
      case 'vault_move': { await moveFile(input.from as string, input.to as string); return { result: `Moved`, success: true }; }
      case 'vault_delete': { await softDelete(input.path as string); return { result: `Deleted`, success: true }; }
      case 'vault_versions': { const versions = await listVersions(input.path as string); if (!versions.length) return { result: 'No versions.', success: true }; return { result: versions.map((v, i) => `${i + 1}. ${v.timestamp}`).join('\n'), success: true }; }
      case 'vault_restore': { await restoreVersion(input.path as string, input.timestamp as string); return { result: `Restored`, success: true }; }
      case 'vault_ask': { const { khojChat } = await import('@/lib/khoj'); return { result: await khojChat(input.query as string), success: true }; }
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
        if (sent) addMessage(convId, { id: `tg-${Date.now()}-out`, role: 'assistant', content: input.message as string });
        return { result: sent ? `Message sent to ${contact.display_name}` : 'Failed to send message', success: sent };
      }
      case 'telegram_contacts': {
        const action = input.action as string;
        if (action === 'search' && input.query) { const contact = getContactByName(input.query as string); return { result: contact ? `Found: ${contact.display_name} (@${contact.username || 'no username'})` : `No contact matching "${input.query}"`, success: true }; }
        const contacts = listContacts();
        if (!contacts.length) return { result: 'No Telegram contacts yet.', success: true };
        return { result: contacts.map(c => `- ${c.display_name}${c.username ? ` (@${c.username})` : ''}`).join('\n'), success: true };
      }
      case 'telegram_history': {
        const contact = getContactByName(input.contact_name as string);
        if (!contact) return { result: `No contact found matching "${input.contact_name}"`, success: false };
        const msgs = getMessages(`tg-${contact.telegram_id}`);
        const recent = msgs.slice(-(input.limit as number || 10));
        if (!recent.length) return { result: `No conversation history with ${contact.display_name}`, success: true };
        return { result: recent.map(m => `[${m.role}] ${m.content}`).join('\n'), success: true };
      }

      // ── Discord Tools ──────────────
      case 'discord_send': {
        const contact = getDiscordContactByName(input.contact_name as string);
        if (!contact) return { result: `No Discord contact matching "${input.contact_name}"`, success: false };
        const convId = `dc-${contact.discord_id}`;
        ensureConversation(convId, `${contact.display_name} (Discord)`);
        const sent = await sendDiscordDM(contact.discord_id, input.message as string);
        if (sent) addMessage(convId, { id: `dc-${Date.now()}-out`, role: 'assistant', content: input.message as string });
        return { result: sent ? `Sent to ${contact.display_name}` : 'Failed to send', success: sent };
      }
      case 'discord_contacts': {
        const action = input.action as string;
        if (action === 'search' && input.query) { const contact = getDiscordContactByName(input.query as string); return { result: contact ? `Found: ${contact.display_name} (@${contact.username || 'no username'})` : `No Discord contact matching "${input.query}"`, success: true }; }
        const contacts = listDiscordContacts();
        if (!contacts.length) return { result: 'No Discord contacts yet.', success: true };
        return { result: contacts.map(c => `- ${c.display_name}${c.username ? ` (@${c.username})` : ''}`).join('\n'), success: true };
      }
      case 'discord_history': {
        const contact = getDiscordContactByName(input.contact_name as string);
        if (!contact) return { result: `No Discord contact matching "${input.contact_name}"`, success: false };
        const msgs = getMessages(`dc-${contact.discord_id}`);
        const recent = msgs.slice(-(input.limit as number || 10));
        if (!recent.length) return { result: `No conversation history with ${contact.display_name}`, success: true };
        return { result: recent.map(m => `[${m.role}] ${m.content}`).join('\n'), success: true };
      }

      default: return { result: `Unknown: ${name}`, success: false };
    }
  } catch (error) { return { result: `Error: ${String(error)}`, success: false }; }
}

// ── Handle owner interaction (full VOID agent) ─

async function handleOwnerInteraction(userId: string, text: string, interactionToken: string): Promise<void> {
  ensureConversation(OWNER_CONV_ID, 'Discord Agent');

  addMessage(OWNER_CONV_ID, { id: `dc-${Date.now()}-u`, role: 'user', content: text });

  const searchResults = await search(text);
  const context = buildContext(searchResults.results);
  const systemPrompt = buildPrompt(context);

  const recentMessages = getMessages(OWNER_CONV_ID).slice(-10);
  const history = recentMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

  const { reply, toolResults } = await chatWithTools(history, systemPrompt, VOID_TOOLS, executeTool);

  addMessage(OWNER_CONV_ID, { id: `dc-${Date.now()}-a`, role: 'assistant', content: reply });

  let responseText = reply;
  if (toolResults.length > 0) {
    const toolSummary = toolResults.map(r => `${r.success ? '✓' : '✗'} ${r.toolName}`).join('\n');
    responseText = `${reply}\n\n_Actions:_\n${toolSummary}`;
  }

  await editInteractionResponse(interactionToken, responseText);
}

// ── Handle external interaction (persona auto-reply) ─

async function handleExternalInteraction(
  userId: string,
  text: string,
  user: DiscordUser,
  interactionToken: string,
): Promise<void> {
  const displayName = user.global_name || user.username || `User ${userId}`;
  upsertDiscordContact({
    discord_id: userId,
    username: user.username,
    global_name: user.global_name ?? null,
    display_name: displayName,
  });

  const convId = `dc-${userId}`;
  ensureConversation(convId, `${displayName} (Discord)`);

  addMessage(convId, { id: `dc-${Date.now()}-u`, role: 'user', content: text });

  // Read persona + schedule
  let persona = '';
  try { persona = await readFile('07-Agent-Memory/persona.md'); } catch { /* default */ }

  let schedule = '';
  try {
    const daily = await readFile(dailyPath());
    const planMatch = daily.match(/## (Plan|Tasks)\n[\s\S]*?(?=\n##|$)/g);
    if (planMatch) schedule = planMatch.join('\n');
  } catch { /* */ }

  const contact = getDiscordContactById(userId);
  const systemPrompt = buildPersonaPrompt(persona, displayName, contact?.notes || '', schedule);

  const recentMessages = getMessages(convId).slice(-10);
  const history = recentMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

  const reply = await chat(history, systemPrompt);

  addMessage(convId, { id: `dc-${Date.now()}-a`, role: 'assistant', content: reply });

  await editInteractionResponse(interactionToken, reply);

  // Notify owner via Discord DM
  if (DISCORD_OWNER_ID) {
    const truncText = text.length > 200 ? text.slice(0, 200) + '...' : text;
    const truncReply = reply.length > 200 ? reply.slice(0, 200) + '...' : reply;
    await sendDiscordDM(DISCORD_OWNER_ID, `📩 ${displayName} (@${user.username}): ${truncText}\n💬 Reply: ${truncReply}`);
  }
}

// ── POST /api/discord/interactions ───

export async function POST(request: NextRequest) {
  try {
    // Read raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-signature-ed25519') || '';
    const timestamp = request.headers.get('x-signature-timestamp') || '';

    // Verify signature
    if (!verifyDiscordSignature(rawBody, signature, timestamp)) {
      return new Response('Invalid signature', { status: 401 });
    }

    const interaction: DiscordInteraction = JSON.parse(rawBody);

    // Handle PING (type 1) — Discord verification
    if (interaction.type === 1) {
      return Response.json({ type: 1 }); // PONG
    }

    // Handle APPLICATION_COMMAND (type 2)
    if (interaction.type === 2 && interaction.data) {
      const user = interaction.member?.user || interaction.user;
      if (!user) return Response.json({ type: 4, data: { content: 'Could not identify user.' } });

      const messageOption = interaction.data.options?.find(o => o.name === 'message');
      const text = messageOption?.value || '';

      if (!text) {
        return Response.json({ type: 4, data: { content: 'Please provide a message.' } });
      }

      // Return DEFERRED response immediately (Discord requires <3 sec)
      // Then process async
      const token = interaction.token;

      // Fire-and-forget the async processing
      if (isDiscordOwner(user.id)) {
        handleOwnerInteraction(user.id, text, token).catch(err => {
          console.error('[Discord] Owner handler error:', err);
          editInteractionResponse(token, 'Something went wrong. Please try again.').catch(() => {});
        });
      } else {
        handleExternalInteraction(user.id, text, user, token).catch(err => {
          console.error('[Discord] External handler error:', err);
          editInteractionResponse(token, 'Something went wrong. Please try again.').catch(() => {});
        });
      }

      // Deferred response with source (type 5) — shows "thinking..."
      return Response.json({ type: 5 });
    }

    // Unknown interaction type
    return Response.json({ type: 4, data: { content: 'Unknown interaction.' } });
  } catch (error) {
    console.error('[Discord/interactions] Error:', error);
    return new Response('Internal error', { status: 500 });
  }
}
