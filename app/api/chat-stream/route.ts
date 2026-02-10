import { NextRequest } from 'next/server';
import { streamChatWithTools } from '@/lib/anthropic';
import { search, buildContext } from '@/lib/khoj';
import { buildPrompt } from '@/lib/prompts';
import { appendToLog, writeFile, readFile, listFiles, moveFile, softDelete, listVersions, restoreVersion } from '@/lib/vault';
import { triggerWorkflow } from '@/lib/n8n';
import { VOID_TOOLS } from '@/lib/tools';
import { sendTelegramMessage } from '@/lib/telegram';
import { sendDiscordDM } from '@/lib/discord';
import { getContactByName, listContacts, getMessages as getDbMessages, addMessage as addDbMessage, createConversation, getConversation, getDiscordContactByName, listDiscordContacts, getGmailEmails, getGmailEmailById, updateGmailEmailStatus, searchGmailEmails } from '@/lib/db';
import { sendGmailReply, archiveGmailEmail } from '@/lib/gmail';
import { fetchWebPage, searchWeb } from '@/lib/web';
import fs from 'fs/promises';
import path from 'path';

const VAULT_PATH = process.env.VAULT_PATH || './vault-template';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ── Helpers (same as /api/chat) ──────

function dailyPath(): string {
  return `01-Daily/${new Date().toISOString().split('T')[0]}.md`;
}

interface TaskItem {
  text: string;
  done: boolean;
  time?: string;
}

async function readTasks(): Promise<{ tasks: TaskItem[]; content: string }> {
  let content = '';
  try { content = await readFile(dailyPath()); } catch { /* file may not exist */ }
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
    newContent = existingContent.replace(
      /## Tasks\n[\s\S]*?(?=\n##|$)/,
      `## Tasks\n${taskLines}\n`
    );
  } else {
    newContent = existingContent + `\n## Tasks\n${taskLines}\n`;
  }
  await writeFile(dailyPath(), newContent, 'overwrite');
}

// ── Tool Executor (same as /api/chat) ──

async function executeTool(
  name: string,
  input: Record<string, unknown>
): Promise<{ result: string; success: boolean }> {
  try {
    switch (name) {
      case 'task_add': {
        const text = input.text as string;
        const { tasks, content } = await readTasks();
        tasks.push({ text, done: false, time: input.time as string | undefined });
        await writeTasks(tasks, content);
        return { result: `Added task: "${text}" (${tasks.length} total)`, success: true };
      }
      case 'task_remove': {
        const match = (input.match as string).toLowerCase();
        const { tasks, content } = await readTasks();
        const before = tasks.length;
        const filtered = tasks.filter(t => !t.text.toLowerCase().includes(match));
        if (filtered.length === before) return { result: `No task found matching "${match}"`, success: false };
        await writeTasks(filtered, content);
        return { result: `Removed ${before - filtered.length} task(s) matching "${match}"`, success: true };
      }
      case 'task_toggle': {
        const match = (input.match as string).toLowerCase();
        const { tasks, content } = await readTasks();
        const task = tasks.find(t => t.text.toLowerCase().includes(match));
        if (!task) return { result: `No task found matching "${match}"`, success: false };
        task.done = !task.done;
        await writeTasks(tasks, content);
        return { result: `Task "${task.text}" marked ${task.done ? 'done ✓' : 'undone'}`, success: true };
      }
      case 'task_list': {
        const { tasks } = await readTasks();
        if (tasks.length === 0) return { result: 'No tasks found for today.', success: true };
        const list = tasks.map((t, i) => `${i + 1}. [${t.done ? 'x' : ' '}] ${t.time ? `${t.time} — ` : ''}${t.text}`).join('\n');
        return { result: `Today's tasks (${tasks.length}):\n${list}`, success: true };
      }
      case 'plan_generate': {
        const hours = (input.hours as number) || 4;
        const priorities = (input.priorities as string) || '';
        const searchResults = await search('goals priorities tasks today');
        const context = buildContext(searchResults.results);
        const { chat } = await import('@/lib/anthropic');
        const plan = await chat(
          [{ role: 'user', content: `Create a focused daily plan for today.\nAvailable hours: ${hours}\n${priorities ? `Priorities: ${priorities}` : ''}\nContext:\n${context}\nGenerate a time-blocked schedule. Format:\n## Plan\nHH:MM — Task\n\n## Tasks\n- [ ] Task 1` }],
          'You are a personal productivity assistant. Create realistic, focused daily plans with time blocks.'
        );
        let existing = '';
        try { existing = await readFile(dailyPath()); } catch { /* */ }
        let newContent = existing;
        const planSection = plan.match(/## Plan\n[\s\S]*?(?=\n## Tasks|$)/)?.[0];
        const tasksSection = plan.match(/## Tasks\n[\s\S]*/)?.[0];
        if (planSection) {
          if (newContent.includes('## Plan')) newContent = newContent.replace(/## Plan\n[\s\S]*?(?=\n##|$)/, planSection + '\n');
          else newContent += '\n' + planSection + '\n';
        }
        if (tasksSection) {
          if (newContent.includes('## Tasks')) newContent = newContent.replace(/## Tasks\n[\s\S]*?(?=\n##|$)/, tasksSection + '\n');
          else newContent += '\n' + tasksSection + '\n';
        }
        await writeFile(dailyPath(), newContent, 'overwrite');
        return { result: `Plan generated and saved:\n${plan}`, success: true };
      }
      case 'plan_set_schedule': {
        const items = input.items as { time: string; title: string; type?: string }[];
        let existing = '';
        try { existing = await readFile(dailyPath()); } catch { /* */ }
        const scheduleLines = items.map(i => `${i.time} — ${i.title}`).join('\n');
        const planBlock = `## Plan\n${scheduleLines}\n`;
        let newContent = existing;
        if (newContent.includes('## Plan')) newContent = newContent.replace(/## Plan\n[\s\S]*?(?=\n##|$)/, planBlock);
        else newContent += '\n' + planBlock;
        await writeFile(dailyPath(), newContent, 'overwrite');
        return { result: `Schedule set with ${items.length} time blocks`, success: true };
      }
      case 'log_entry': {
        await appendToLog(input.text as string);
        return { result: `Logged: "${input.text}"`, success: true };
      }
      case 'save_note': {
        await writeFile(input.path as string, input.content as string, 'overwrite');
        return { result: `Saved note: ${input.path}`, success: true };
      }
      case 'save_memory': {
        const memType = (input.memory_type as string) || 'context';
        const content = input.content as string;
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
        return { result: `Saved to ${memType} memory: "${content}"`, success: true };
      }
      case 'vault_read': {
        let content = await readFile(input.path as string);
        if (content.length > 4000) content = content.slice(0, 4000) + '\n\n... [truncated]';
        return { result: `Contents of ${input.path}:\n\n${content}`, success: true };
      }
      case 'vault_list': {
        const folder = (input.folder as string) || '';
        const files = await listFiles(folder);
        if (files.length === 0) return { result: folder ? `No files in ${folder}/` : 'No files in vault.', success: true };
        const listing = files.map(f => `  ${f.path} (${f.size}, ${f.modified})`).join('\n');
        return { result: `${files.length} file(s):\n${listing}`, success: true };
      }
      case 'vault_search': {
        const query = input.query as string;
        const limit = (input.limit as number) || 5;
        const searchRes = await search(query, 'markdown', limit);
        if (searchRes.count === 0) return { result: `No results for "${query}"`, success: true };
        const resultList = searchRes.results.map((r, i) => `${i + 1}. ${r.file} (${Math.round(r.score * 100)}%)\n   ${r.entry.slice(0, 200)}`).join('\n');
        return { result: `Found ${searchRes.count} result(s) for "${query}":\n${resultList}`, success: true };
      }
      case 'vault_move': {
        await moveFile(input.from as string, input.to as string);
        return { result: `Moved ${input.from} → ${input.to}`, success: true };
      }
      case 'vault_delete': {
        await softDelete(input.path as string);
        return { result: `Deleted ${input.path} (moved to .trash/)`, success: true };
      }
      case 'vault_versions': {
        const versions = await listVersions(input.path as string);
        if (versions.length === 0) return { result: `No version history for ${input.path}`, success: true };
        const list = versions.map((v, i) => `${i + 1}. ${v.timestamp} (${v.size})`).join('\n');
        return { result: `${versions.length} version(s):\n${list}`, success: true };
      }
      case 'vault_restore': {
        await restoreVersion(input.path as string, input.timestamp as string);
        return { result: `Restored ${input.path} to ${input.timestamp}`, success: true };
      }
      case 'vault_ask': {
        const { khojChat } = await import('@/lib/khoj');
        const answer = await khojChat(input.query as string);
        return { result: answer, success: true };
      }
      case 'save_attachment': {
        const { moveToVault } = await import('@/lib/uploads');
        const result = await moveToVault(input.uploadPath as string, input.vaultFolder as string);
        return { result: `Saved to vault: ${result}`, success: true };
      }
      // ── Gmail Tools ─────────────────
      case 'gmail_inbox': {
        const emails = getGmailEmails({
          category: input.category as string | undefined,
          priority: input.priority as string | undefined,
          status: input.status as string | undefined,
          limit: (input.limit as number) || 10,
        });
        if (!emails.length) return { result: 'No emails matching filters', success: true };
        const emailList = emails.map(e =>
          `${e.priority === 'urgent' ? '🔴' : e.priority === 'normal' ? '🟡' : '⚪'} [${e.category}] ${e.from_name || e.from_email}: ${e.subject}\n  → ${e.summary} (${e.status}) [id: ${e.gmail_id}]`
        ).join('\n\n');
        return { result: `${emails.length} email(s):\n\n${emailList}`, success: true };
      }
      case 'gmail_read': {
        const emails = searchGmailEmails(input.query as string);
        if (!emails.length) return { result: `No email matching "${input.query}"`, success: false };
        const e = emails[0];
        let body = e.body_preview;
        if (e.vault_path) {
          try { body = await readFile(e.vault_path); } catch { /* use preview */ }
        }
        if (e.status === 'unread') updateGmailEmailStatus(e.gmail_id, 'read');
        return { result: `From: ${e.from_name} <${e.from_email}>\nSubject: ${e.subject}\nDate: ${e.gmail_date}\nCategory: ${e.category} | Priority: ${e.priority}\nGmail ID: ${e.gmail_id}\n\n${body}`, success: true };
      }
      case 'gmail_reply': {
        const email = getGmailEmailById(input.gmail_id as string);
        if (!email) return { result: 'Email not found by that ID', success: false };
        const sent = await sendGmailReply(email.from_email, `Re: ${email.subject}`, input.reply_text as string, email.gmail_id);
        if (sent) updateGmailEmailStatus(email.gmail_id, 'replied');
        return { result: sent ? `Reply sent to ${email.from_name || email.from_email}` : 'Failed to send reply via n8n', success: sent };
      }
      case 'gmail_archive': {
        const emails = searchGmailEmails(input.query as string);
        if (!emails.length) return { result: `No emails matching "${input.query}"`, success: false };
        const toArchive = (input.archive_all as boolean) ? emails : [emails[0]];
        let archivedCount = 0;
        for (const e of toArchive) {
          const ok = await archiveGmailEmail(e.gmail_id);
          if (ok) { updateGmailEmailStatus(e.gmail_id, 'archived'); archivedCount++; }
        }
        return { result: `Archived ${archivedCount} email(s)`, success: archivedCount > 0 };
      }
      case 'gmail_search': {
        const emails = searchGmailEmails(input.query as string, (input.limit as number) || 10);
        if (!emails.length) return { result: `No emails matching "${input.query}"`, success: true };
        const resultList = emails.map(e =>
          `${e.from_name || e.from_email}: ${e.subject}\n  ${e.summary} [${e.category}/${e.priority}] [id: ${e.gmail_id}]`
        ).join('\n\n');
        return { result: `${emails.length} result(s):\n\n${resultList}`, success: true };
      }

      case 'set_reminder': {
        const result = await triggerWorkflow('remind', input);
        return { result: result.success ? `Reminder set: "${input.text}" at ${input.time}` : `Failed: ${result.error}`, success: result.success };
      }
      case 'crm_update': {
        const result = await triggerWorkflow('crm', input);
        return { result: result.success ? `CRM ${input.action} completed` : `Failed: ${result.error}`, success: result.success };
      }

      // ── Telegram Tools ──────────────
      case 'telegram_send': {
        const contact = getContactByName(input.contact_name as string);
        if (!contact) return { result: `No contact found matching "${input.contact_name}"`, success: false };
        const convId = `tg-${contact.telegram_id}`;
        if (!getConversation(convId)) createConversation(convId, `${contact.display_name} (Telegram)`);
        const sent = await sendTelegramMessage(contact.telegram_id, input.message as string);
        if (sent) {
          addDbMessage(convId, { id: `tg-${Date.now()}-out`, role: 'assistant', content: input.message as string });
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
        const messages = getDbMessages(convId);
        const limit = (input.limit as number) || 10;
        const recent = messages.slice(-limit);
        if (!recent.length) return { result: `No conversation history with ${contact.display_name}`, success: true };
        const history = recent.map(m => `[${m.role}] ${m.content}`).join('\n');
        return { result: `Last ${recent.length} messages with ${contact.display_name}:\n${history}`, success: true };
      }

      // ── Discord Tools ──────────────
      case 'discord_send': {
        const contact = getDiscordContactByName(input.contact_name as string);
        if (!contact) return { result: `No Discord contact matching "${input.contact_name}"`, success: false };
        const convId = `dc-${contact.discord_id}`;
        if (!getConversation(convId)) createConversation(convId, `${contact.display_name} (Discord)`);
        const sent = await sendDiscordDM(contact.discord_id, input.message as string);
        if (sent) addDbMessage(convId, { id: `dc-${Date.now()}-out`, role: 'assistant', content: input.message as string });
        return { result: sent ? `Sent to ${contact.display_name}` : 'Failed to send', success: sent };
      }
      case 'discord_contacts': {
        const action = input.action as string;
        if (action === 'search' && input.query) {
          const contact = getDiscordContactByName(input.query as string);
          return { result: contact ? `Found: ${contact.display_name} (@${contact.username || 'no username'})` : `No Discord contact matching "${input.query}"`, success: true };
        }
        const contacts = listDiscordContacts();
        if (!contacts.length) return { result: 'No Discord contacts yet.', success: true };
        const list = contacts.map(c => `- ${c.display_name}${c.username ? ` (@${c.username})` : ''}`).join('\n');
        return { result: `${contacts.length} Discord contact(s):\n${list}`, success: true };
      }
      case 'discord_history': {
        const contact = getDiscordContactByName(input.contact_name as string);
        if (!contact) return { result: `No Discord contact matching "${input.contact_name}"`, success: false };
        const convId = `dc-${contact.discord_id}`;
        const messages = getDbMessages(convId);
        const limit = (input.limit as number) || 10;
        const recent = messages.slice(-limit);
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
          metadata.image ? `Image: ${metadata.image}` : '',
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
          return { result: `No web results found for "${input.query}". SearXNG may be unavailable.`, success: false };
        }
        const resultList = searchRes.results.map((r, i) =>
          `${i + 1}. **${r.title}**\n   ${r.url}\n   ${r.content}`
        ).join('\n\n');
        return { result: `Web results for "${input.query}" (${searchRes.count}):\n\n${resultList}`, success: true };
      }

      default:
        return { result: `Unknown tool: ${name}`, success: false };
    }
  } catch (error) {
    return { result: `Tool error: ${String(error)}`, success: false };
  }
}

// ── POST /api/chat-stream ────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [] }: { message: string; history?: ChatMessage[] } = body;

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Search vault for context
    const searchResults = await search(message);
    const context = buildContext(searchResults.results);

    // 2. Build system prompt
    const systemPrompt = buildPrompt(context);

    // 3. Prepare messages
    const messages: ChatMessage[] = [...history, { role: 'user', content: message }];

    // 4. Create SSE stream
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        try {
          const { toolResults } = await streamChatWithTools(
            messages,
            systemPrompt,
            VOID_TOOLS,
            executeTool,
            {
              onToken: (text) => send('token', { text }),
              onToolStart: (tool, input) => send('tool_start', { tool, input }),
              onToolDone: (tool, result, success) => send('tool_done', { tool, result, success }),
            },
          );

          // Send final done event with actions
          const actions = toolResults.length > 0
            ? toolResults.map(r => ({ tool: r.toolName, input: r.toolInput, result: r.result, success: r.success }))
            : undefined;

          send('done', { actions: actions || [] });
        } catch (error) {
          send('error', { message: String(error) });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[API/chat-stream] Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
