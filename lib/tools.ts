// ══════════════════════════════════════
// VOID — Native Tool Definitions
// Claude API function calling schemas
// ══════════════════════════════════════

import type Anthropic from '@anthropic-ai/sdk';

type Tool = Anthropic.Tool;

export const VOID_TOOLS: Tool[] = [
  // ── Task Management ────────────────
  {
    name: 'task_add',
    description: 'Add a new task to today\'s planner on the dashboard. Use when the user wants to create, add, or schedule a task.',
    input_schema: {
      type: 'object' as const,
      properties: {
        text: {
          type: 'string',
          description: 'The task description',
        },
        time: {
          type: 'string',
          description: 'Optional time block in HH:MM format (e.g. "09:00", "14:30")',
        },
        priority: {
          type: 'string',
          enum: ['high', 'med', 'low'],
          description: 'Task priority level',
        },
        tag: {
          type: 'string',
          enum: ['Office', 'Project', 'Learning', 'Personal'],
          description: 'Task category tag',
        },
      },
      required: ['text'],
    },
  },
  {
    name: 'task_remove',
    description: 'Remove a task from today\'s planner by matching its text. Use when the user wants to delete or remove a task.',
    input_schema: {
      type: 'object' as const,
      properties: {
        match: {
          type: 'string',
          description: 'Partial text to match against task descriptions (case-insensitive)',
        },
      },
      required: ['match'],
    },
  },
  {
    name: 'task_toggle',
    description: 'Toggle a task between done and undone. Use when the user wants to mark a task as complete/incomplete.',
    input_schema: {
      type: 'object' as const,
      properties: {
        match: {
          type: 'string',
          description: 'Partial text to match against task descriptions (case-insensitive)',
        },
      },
      required: ['match'],
    },
  },
  {
    name: 'task_list',
    description: 'List all tasks from today\'s planner. Use to see current tasks before modifying them.',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },

  // ── Plan & Schedule ────────────────
  {
    name: 'plan_generate',
    description: 'Generate an AI-powered daily plan with time blocks and tasks. Searches the vault for goals/priorities to create a personalized schedule.',
    input_schema: {
      type: 'object' as const,
      properties: {
        hours: {
          type: 'number',
          description: 'Available working hours for today (default: 4)',
        },
        priorities: {
          type: 'string',
          description: 'Optional focus areas or priorities for the day',
        },
      },
    },
  },
  {
    name: 'plan_set_schedule',
    description: 'Set specific time blocks in today\'s schedule. Replaces the current schedule.',
    input_schema: {
      type: 'object' as const,
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              time: { type: 'string', description: 'Time in HH:MM format' },
              title: { type: 'string', description: 'Block description' },
              type: {
                type: 'string',
                enum: ['focus', 'meeting', 'break', 'admin'],
                description: 'Type of time block',
              },
            },
            required: ['time', 'title'],
          },
          description: 'Array of schedule time blocks',
        },
      },
      required: ['items'],
    },
  },

  // ── Logging & Notes ────────────────
  {
    name: 'log_entry',
    description: 'Append a timestamped entry to today\'s daily note. Use for quick thoughts, logs, or journal entries.',
    input_schema: {
      type: 'object' as const,
      properties: {
        text: {
          type: 'string',
          description: 'The text to log',
        },
      },
      required: ['text'],
    },
  },
  {
    name: 'save_note',
    description: 'Save a new note file to the vault. Use when the user wants to create or save a document.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description: 'File path within the vault (e.g. "02-Learning/react-patterns.md")',
        },
        content: {
          type: 'string',
          description: 'Markdown content of the note',
        },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: 'save_memory',
    description: 'Save information to agent memory for future reference. Use when the user shares a preference, goal, or important context you should remember.',
    input_schema: {
      type: 'object' as const,
      properties: {
        memory_type: {
          type: 'string',
          enum: ['preference', 'goal', 'context'],
          description: 'Type of memory to save',
        },
        content: {
          type: 'string',
          description: 'The information to remember',
        },
      },
      required: ['memory_type', 'content'],
    },
  },

  // ── Vault File Management ─────────
  {
    name: 'vault_read',
    description: 'Read the contents of a file from the vault. Use when the user wants to see, show, or read a specific file.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description: 'File path within the vault (e.g. "02-Learning/react-patterns.md")',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'vault_list',
    description: 'List files in a vault folder or the entire vault. Use when the user wants to see what files exist.',
    input_schema: {
      type: 'object' as const,
      properties: {
        folder: {
          type: 'string',
          description: 'Folder path to list (e.g. "02-Learning"). Omit or leave empty to list all files.',
        },
      },
    },
  },
  {
    name: 'vault_search',
    description: 'Search the vault for content matching a query. Use when the user wants to find notes about a topic.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search query (natural language or keywords)',
        },
        limit: {
          type: 'number',
          description: 'Max results to return (default: 5)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'vault_move',
    description: 'Move or rename a file within the vault. Use when the user wants to reorganize files.',
    input_schema: {
      type: 'object' as const,
      properties: {
        from: {
          type: 'string',
          description: 'Current file path (e.g. "00-Inbox/draft.md")',
        },
        to: {
          type: 'string',
          description: 'New file path (e.g. "04-Projects/draft.md")',
        },
      },
      required: ['from', 'to'],
    },
  },
  {
    name: 'vault_delete',
    description: 'Soft-delete a file by moving it to .trash/. Cannot delete files in protected folders (99-System).',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description: 'File path to delete (e.g. "00-Inbox/old-draft.md")',
        },
      },
      required: ['path'],
    },
  },

  // ── Vault Knowledge ─────────────────
  {
    name: 'vault_ask',
    description: 'Ask a deep knowledge question about the vault contents. Uses semantic search and RAG to find and synthesize information from multiple notes. Good for questions like "summarize my Q1 notes" or "what are my current project priorities?"',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'The question to ask about vault contents',
        },
      },
      required: ['query'],
    },
  },

  // ── Version History ─────────────────
  {
    name: 'vault_versions',
    description: 'List the version history of a vault file. Shows previous saved versions with timestamps.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description: 'File path within the vault (e.g. "07-Agent-Memory/goals.md")',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'vault_restore',
    description: 'Restore a previous version of a vault file. Saves current version before restoring.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description: 'File path within the vault',
        },
        timestamp: {
          type: 'string',
          description: 'Version timestamp to restore (from vault_versions results)',
        },
      },
      required: ['path', 'timestamp'],
    },
  },

  // ── File Attachments ────────────────
  {
    name: 'save_attachment',
    description: 'Move a temporary file upload into the vault permanently. Use when the user wants to save an attached file to their vault.',
    input_schema: {
      type: 'object' as const,
      properties: {
        uploadPath: {
          type: 'string',
          description: 'The path of the uploaded file (from the attachment data)',
        },
        vaultFolder: {
          type: 'string',
          description: 'Vault folder to save to (e.g. "08-Attachments" or "04-Projects")',
        },
      },
      required: ['uploadPath', 'vaultFolder'],
    },
  },

  // ── External Integrations ──────────
  {
    name: 'send_email',
    description: 'Send or read email via workflow automation. Use when the user asks about email.',
    input_schema: {
      type: 'object' as const,
      properties: {
        action: {
          type: 'string',
          enum: ['read', 'send', 'reply'],
          description: 'Email action to perform',
        },
        to: {
          type: 'string',
          description: 'Recipient email address (for send/reply)',
        },
        subject: {
          type: 'string',
          description: 'Email subject line',
        },
        body: {
          type: 'string',
          description: 'Email body content',
        },
      },
      required: ['action'],
    },
  },
  {
    name: 'set_reminder',
    description: 'Set a reminder for a specific time. Triggers a notification workflow.',
    input_schema: {
      type: 'object' as const,
      properties: {
        text: {
          type: 'string',
          description: 'Reminder text',
        },
        time: {
          type: 'string',
          description: 'When to remind (e.g. "in 30 minutes", "at 15:00", "tomorrow 9am")',
        },
      },
      required: ['text', 'time'],
    },
  },
  {
    name: 'crm_update',
    description: 'Query or update CRM deals and contacts. Use for sales pipeline management.',
    input_schema: {
      type: 'object' as const,
      properties: {
        action: {
          type: 'string',
          enum: ['list', 'update', 'add'],
          description: 'CRM action to perform',
        },
        deal: {
          type: 'string',
          description: 'Deal name or ID',
        },
        stage: {
          type: 'string',
          description: 'New deal stage',
        },
        notes: {
          type: 'string',
          description: 'Notes to add to the deal',
        },
      },
      required: ['action'],
    },
  },

  // ── Telegram Messaging ──────────────
  {
    name: 'telegram_send',
    description: 'Send a Telegram message to a saved contact by name. Use when the user wants to message someone on Telegram.',
    input_schema: {
      type: 'object' as const,
      properties: {
        contact_name: {
          type: 'string',
          description: 'Name of the contact to send to (matches display_name, first_name, or username)',
        },
        message: {
          type: 'string',
          description: 'The message text to send',
        },
      },
      required: ['contact_name', 'message'],
    },
  },
  {
    name: 'telegram_contacts',
    description: 'List or search Telegram contacts. Use when the user wants to see who they can message on Telegram.',
    input_schema: {
      type: 'object' as const,
      properties: {
        action: {
          type: 'string',
          enum: ['list', 'search'],
          description: 'Whether to list all contacts or search by name',
        },
        query: {
          type: 'string',
          description: 'Search query (for action "search")',
        },
      },
      required: ['action'],
    },
  },
  {
    name: 'telegram_history',
    description: 'Read recent conversation history with a Telegram contact. Use when the user wants to see past messages with someone.',
    input_schema: {
      type: 'object' as const,
      properties: {
        contact_name: {
          type: 'string',
          description: 'Name of the contact to look up history for',
        },
        limit: {
          type: 'number',
          description: 'Number of recent messages to return (default: 10)',
        },
      },
      required: ['contact_name'],
    },
  },
];
