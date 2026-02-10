// ══════════════════════════════════════
// VOID — Gmail Helper Library
// n8n webhook callers + vault storage
// ══════════════════════════════════════

import { triggerWorkflow } from '@/lib/n8n';
import { writeFile } from '@/lib/vault';
import { upsertGmailEmail } from '@/lib/db';

// ── Types ─────────────────────────────

export interface ClassifiedEmail {
  gmail_id: string;
  from_email: string;
  from_name: string;
  to_email: string;
  subject: string;
  snippet: string;
  body: string;
  gmail_date: string;
  category: string;
  priority: string;
  action: string;
  summary: string;
}

// ── Store classified email ────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

export async function storeClassifiedEmail(email: ClassifiedEmail): Promise<string> {
  const datePrefix = email.gmail_date.split('T')[0] || new Date().toISOString().split('T')[0];
  const slug = slugify(email.subject);
  const vaultPath = `00-Inbox/emails/${datePrefix}-${slug}.md`;

  // Save to vault
  const note = formatEmailNote(email);
  await writeFile(vaultPath, note, 'overwrite');

  // Save to SQLite
  upsertGmailEmail({
    gmail_id: email.gmail_id,
    from_email: email.from_email,
    from_name: email.from_name,
    to_email: email.to_email,
    subject: email.subject,
    snippet: email.snippet,
    body_preview: email.body?.slice(0, 2000) || email.snippet,
    category: email.category,
    priority: email.priority,
    action: email.action,
    summary: email.summary,
    status: 'unread',
    vault_path: vaultPath,
    gmail_date: email.gmail_date,
  });

  return vaultPath;
}

// ── Format vault note ─────────────────

export function formatEmailNote(email: ClassifiedEmail): string {
  const body = email.body?.slice(0, 3000) || email.snippet || '';

  return `---
gmail_id: ${email.gmail_id}
from: ${email.from_email}
date: ${email.gmail_date}
category: ${email.category}
priority: ${email.priority}
action: ${email.action}
status: unread
---

# ${email.subject}

**From:** ${email.from_name ? `${email.from_name} <${email.from_email}>` : email.from_email}
**Date:** ${email.gmail_date}
**Category:** ${email.category} | **Priority:** ${email.priority} | **Action:** ${email.action}

## Summary
${email.summary}

## Email Body
${body}
`;
}

// ── n8n workflow callers ──────────────

export async function fetchInbox(limit = 10): Promise<unknown[]> {
  const result = await triggerWorkflow('email', { action: 'read', limit });
  if (!result.success || !result.data) return [];
  const data = result.data as { emails?: unknown[] };
  return data.emails || [];
}

export async function sendGmailReply(
  to: string,
  subject: string,
  body: string,
  replyToId?: string
): Promise<boolean> {
  const payload: Record<string, unknown> = { action: 'send', to, subject, body };
  if (replyToId) payload.replyToId = replyToId;
  const result = await triggerWorkflow('email', payload);
  return result.success;
}

export async function archiveGmailEmail(gmailId: string): Promise<boolean> {
  const result = await triggerWorkflow('email', { action: 'archive', gmailId });
  return result.success;
}

export async function searchGmail(query: string): Promise<unknown[]> {
  const result = await triggerWorkflow('email', { action: 'search', query });
  if (!result.success || !result.data) return [];
  const data = result.data as { emails?: unknown[] };
  return data.emails || [];
}
