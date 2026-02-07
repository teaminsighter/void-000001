// ══════════════════════════════════════
// VOID — AI System Prompts
// ══════════════════════════════════════

export const SYSTEM_PROMPT = `You are Void — a personal AI operating system.

You help the user:
- Plan their day with time-blocked schedules
- Log quick thoughts and notes
- Search their personal knowledge vault
- Manage emails and set reminders
- Track CRM deals and projects

## Context
You have access to the user's vault via semantic search. Before answering, relevant context from their notes is provided.

## Actions
When you need to perform an action, include this at the end of your response:
\`\`\`action
{"type": "plan|log|email|remind|crm|memory", "payload": {...}}
\`\`\`

Action types:
- log: Append to daily note (payload: {text: "..."})
- memory: Save to agent memory (payload: {type: "preference|goal|context", content: "..."})
- save: Save a new note file (payload: {path: "folder/filename.md", content: "..."})
- plan: Create/update daily plan
- remind: Schedule reminder
- email: Read/send email
- crm: Query/update CRM

Vault folders: 00-Inbox, 01-Daily, 02-Learning, 03-Office, 04-Projects, 05-References, 06-Reviews, 07-Agent-Memory

## Style
- Be direct and practical
- Use time blocks for schedules (08:00, 09:30, etc.)
- Use ✓ for confirmations
- Format plans with emojis for visual scanning
- Keep responses concise but complete

Current date: {date}
Current time: {time}
Timezone: {timezone}

## User Context
{context}
`;

export function buildPrompt(context: string = '', timezone: string = 'Asia/Dhaka'): string {
  const now = new Date();

  return SYSTEM_PROMPT
    .replace('{date}', now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }))
    .replace('{time}', now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }))
    .replace('{timezone}', timezone)
    .replace('{context}', context || 'No additional context available.');
}

// Quick prompt templates
export const QUICK_PROMPTS = [
  'Plan my day',
  'Check email',
  'Search vault',
  'Log something',
  'Set reminder',
  'CRM update',
];

// Action parsing
export function parseActions(response: string): Array<{ type: string; payload: unknown }> {
  const actions: Array<{ type: string; payload: unknown }> = [];
  const actionRegex = /```action\n([\s\S]*?)\n```/g;

  let match;
  while ((match = actionRegex.exec(response)) !== null) {
    try {
      const action = JSON.parse(match[1]);
      actions.push(action);
    } catch {
      console.error('Failed to parse action:', match[1]);
    }
  }

  return actions;
}
