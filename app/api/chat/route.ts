import { NextRequest, NextResponse } from 'next/server';
import { chat, chatWithTools } from '@/lib/anthropic';
import { search, buildContext, khojChat } from '@/lib/khoj';
import { buildPrompt } from '@/lib/prompts';
import { appendToLog, writeFile, readFile, listFiles, moveFile, softDelete, listVersions, restoreVersion } from '@/lib/vault';
import { triggerWorkflow } from '@/lib/n8n';
import { VOID_TOOLS } from '@/lib/tools';
import fs from 'fs/promises';
import path from 'path';

const VAULT_PATH = process.env.VAULT_PATH || './vault-template';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AttachmentData {
  type: 'image' | 'pdf';
  mimeType: string;
  path: string;
  name: string;
  extractedText?: string;
}

interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  attachments?: AttachmentData[];
}

// ── Helpers ──────────────────────────

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

// ── Tool Executor ────────────────────

async function executeTool(
  name: string,
  input: Record<string, unknown>
): Promise<{ result: string; success: boolean }> {
  try {
    switch (name) {
      // ── Task Tools ─────────────────
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
        if (filtered.length === before) {
          return { result: `No task found matching "${match}"`, success: false };
        }
        await writeTasks(filtered, content);
        return { result: `Removed ${before - filtered.length} task(s) matching "${match}" (${filtered.length} remaining)`, success: true };
      }

      case 'task_toggle': {
        const match = (input.match as string).toLowerCase();
        const { tasks, content } = await readTasks();
        const task = tasks.find(t => t.text.toLowerCase().includes(match));
        if (!task) {
          return { result: `No task found matching "${match}"`, success: false };
        }
        task.done = !task.done;
        await writeTasks(tasks, content);
        return { result: `Task "${task.text}" marked ${task.done ? 'done ✓' : 'undone'}`, success: true };
      }

      case 'task_list': {
        const { tasks } = await readTasks();
        if (tasks.length === 0) {
          return { result: 'No tasks found for today.', success: true };
        }
        const list = tasks.map((t, i) =>
          `${i + 1}. [${t.done ? 'x' : ' '}] ${t.time ? `${t.time} — ` : ''}${t.text}`
        ).join('\n');
        return { result: `Today's tasks (${tasks.length}):\n${list}`, success: true };
      }

      // ── Plan Tools ─────────────────
      case 'plan_generate': {
        const hours = (input.hours as number) || 4;
        const priorities = (input.priorities as string) || '';

        const searchResults = await search('goals priorities tasks today');
        const context = buildContext(searchResults.results);

        const prompt = `Create a focused daily plan for today.

Available hours: ${hours}
${priorities ? `Priorities: ${priorities}` : ''}

Context from vault:
${context}

Generate a time-blocked schedule starting from current time. Format:
## Plan
HH:MM — Task description

## Tasks
- [ ] Task 1
- [ ] Task 2

Be realistic with time blocks. Include breaks.`;

        const plan = await chat(
          [{ role: 'user', content: prompt }],
          'You are a personal productivity assistant. Create realistic, focused daily plans with time blocks. Be concise and practical.'
        );

        // Save to daily note
        let existing = '';
        try { existing = await readFile(dailyPath()); } catch { /* new file */ }

        let newContent = existing;
        const planSection = plan.match(/## Plan\n[\s\S]*?(?=\n## Tasks|$)/)?.[0];
        const tasksSection = plan.match(/## Tasks\n[\s\S]*/)?.[0];

        if (planSection) {
          if (newContent.includes('## Plan')) {
            newContent = newContent.replace(/## Plan\n[\s\S]*?(?=\n##|$)/, planSection + '\n');
          } else {
            newContent += '\n' + planSection + '\n';
          }
        }
        if (tasksSection) {
          if (newContent.includes('## Tasks')) {
            newContent = newContent.replace(/## Tasks\n[\s\S]*?(?=\n##|$)/, tasksSection + '\n');
          } else {
            newContent += '\n' + tasksSection + '\n';
          }
        }

        await writeFile(dailyPath(), newContent, 'overwrite');
        return { result: `Plan generated and saved:\n${plan}`, success: true };
      }

      case 'plan_set_schedule': {
        const items = input.items as { time: string; title: string; type?: string }[];
        let existing = '';
        try { existing = await readFile(dailyPath()); } catch { /* new file */ }

        const scheduleLines = items.map(i => `${i.time} — ${i.title}`).join('\n');
        const planBlock = `## Plan\n${scheduleLines}\n`;

        let newContent = existing;
        if (newContent.includes('## Plan')) {
          newContent = newContent.replace(/## Plan\n[\s\S]*?(?=\n##|$)/, planBlock);
        } else {
          newContent += '\n' + planBlock;
        }

        await writeFile(dailyPath(), newContent, 'overwrite');
        return { result: `Schedule set with ${items.length} time blocks`, success: true };
      }

      // ── Log & Notes Tools ──────────
      case 'log_entry': {
        const text = input.text as string;
        await appendToLog(text);
        return { result: `Logged to daily note: "${text}"`, success: true };
      }

      case 'save_note': {
        const notePath = input.path as string;
        const content = input.content as string;
        await writeFile(notePath, content, 'overwrite');
        return { result: `Saved note: ${notePath}`, success: true };
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

      // ── Vault File Tools ──────────
      case 'vault_read': {
        const filePath = input.path as string;
        let content = await readFile(filePath);
        if (content.length > 4000) {
          content = content.slice(0, 4000) + '\n\n... [truncated at 4000 chars]';
        }
        return { result: `Contents of ${filePath}:\n\n${content}`, success: true };
      }

      case 'vault_list': {
        const folder = (input.folder as string) || '';
        const files = await listFiles(folder);
        if (files.length === 0) {
          return { result: folder ? `No files found in ${folder}/` : 'No files found in vault.', success: true };
        }
        const listing = files.map(f => `  ${f.path} (${f.size}, ${f.modified})`).join('\n');
        return { result: `${files.length} file(s)${folder ? ` in ${folder}/` : ''}:\n${listing}`, success: true };
      }

      case 'vault_search': {
        const query = input.query as string;
        const limit = (input.limit as number) || 5;
        const searchRes = await search(query, 'markdown', limit);
        if (searchRes.count === 0) {
          return { result: `No results found for "${query}"`, success: true };
        }
        const resultList = searchRes.results.map((r, i) =>
          `${i + 1}. ${r.file} (${Math.round(r.score * 100)}%)\n   ${r.entry.slice(0, 200)}`
        ).join('\n');
        return { result: `Found ${searchRes.count} result(s) for "${query}":\n${resultList}`, success: true };
      }

      case 'vault_move': {
        const from = input.from as string;
        const to = input.to as string;
        await moveFile(from, to);
        return { result: `Moved ${from} → ${to}`, success: true };
      }

      case 'vault_delete': {
        const filePath = input.path as string;
        await softDelete(filePath);
        return { result: `Deleted ${filePath} (moved to .trash/)`, success: true };
      }

      // ── Vault Knowledge ──────────
      case 'vault_ask': {
        const query = input.query as string;
        const answer = await khojChat(query);
        return { result: answer, success: true };
      }

      // ── Version History Tools ──────
      case 'vault_versions': {
        const filePath = input.path as string;
        const versions = await listVersions(filePath);
        if (versions.length === 0) {
          return { result: `No version history found for ${filePath}`, success: true };
        }
        const list = versions.map((v, i) =>
          `${i + 1}. ${v.timestamp} (${v.size})`
        ).join('\n');
        return { result: `${versions.length} version(s) of ${filePath}:\n${list}`, success: true };
      }

      case 'vault_restore': {
        const filePath = input.path as string;
        const timestamp = input.timestamp as string;
        await restoreVersion(filePath, timestamp);
        return { result: `Restored ${filePath} to version from ${timestamp}`, success: true };
      }

      // ── File Attachment Tools ──────
      case 'save_attachment': {
        const { moveToVault } = await import('@/lib/uploads');
        const uploadPath = input.uploadPath as string;
        const vaultFolder = input.vaultFolder as string;
        const savedPath = await moveToVault(uploadPath, vaultFolder);
        return { result: `Saved to vault: ${savedPath}`, success: true };
      }

      // ── External Tools (n8n) ───────
      case 'send_email': {
        const result = await triggerWorkflow('email', input);
        return {
          result: result.success
            ? `Email action "${input.action}" completed`
            : `Email failed: ${result.error || 'unknown error'}`,
          success: result.success,
        };
      }

      case 'set_reminder': {
        const result = await triggerWorkflow('remind', input);
        return {
          result: result.success
            ? `Reminder set: "${input.text}" at ${input.time}`
            : `Reminder failed: ${result.error || 'unknown error'}`,
          success: result.success,
        };
      }

      case 'crm_update': {
        const result = await triggerWorkflow('crm', input);
        return {
          result: result.success
            ? `CRM ${input.action} completed`
            : `CRM failed: ${result.error || 'unknown error'}`,
          success: result.success,
        };
      }

      default:
        return { result: `Unknown tool: ${name}`, success: false };
    }
  } catch (error) {
    return { result: `Tool error: ${String(error)}`, success: false };
  }
}

// ── POST /api/chat ───────────────────

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, history = [], attachments = [] } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // 1. Search vault for relevant context
    const searchResults = await search(message);
    const context = buildContext(searchResults.results);

    // 2. Build system prompt with context
    const systemPrompt = buildPrompt(context);

    // 3. Prepare messages — include attachment context
    let augmentedMessage = message;

    for (const att of attachments) {
      if (att.type === 'pdf' && att.extractedText) {
        augmentedMessage = `[Attached PDF: ${att.name}]\n\n${att.extractedText}\n\n---\n\n${augmentedMessage}`;
      } else if (att.type === 'image') {
        augmentedMessage = `[Attached image: ${att.name}]\n\n${augmentedMessage}`;
      }
    }

    const messages: ChatMessage[] = [
      ...history,
      { role: 'user', content: augmentedMessage },
    ];

    // 4. Call Claude with native tool use
    const { reply, toolResults } = await chatWithTools(
      messages,
      systemPrompt,
      VOID_TOOLS,
      executeTool,
    );

    // 5. Return response
    return NextResponse.json({
      reply,
      actions: toolResults.length > 0
        ? toolResults.map(r => ({
            tool: r.toolName,
            input: r.toolInput,
            result: r.result,
            success: r.success,
          }))
        : undefined,
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
