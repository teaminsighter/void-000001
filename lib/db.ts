// ══════════════════════════════════════
// VOID — SQLite Database Module
// Persistent storage for conversations
// ══════════════════════════════════════

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (db) return db;

  const dbPath = process.env.VOID_DB_PATH || "./data/void.db";
  const dir = path.dirname(dbPath);

  // Ensure directory exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(dbPath);

  // Enable WAL mode for better concurrent read performance
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS messages (
      id              TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      role            TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
      content         TEXT NOT NULL,
      created_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_messages_conversation
      ON messages(conversation_id, created_at ASC);

    CREATE TABLE IF NOT EXISTS telegram_contacts (
      telegram_id   TEXT PRIMARY KEY,
      username      TEXT,
      first_name    TEXT,
      last_name     TEXT,
      display_name  TEXT NOT NULL,
      notes         TEXT DEFAULT '',
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS discord_contacts (
      discord_id    TEXT PRIMARY KEY,
      username      TEXT,
      global_name   TEXT,
      display_name  TEXT NOT NULL,
      dm_channel_id TEXT,
      notes         TEXT DEFAULT '',
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS gmail_emails (
      gmail_id      TEXT PRIMARY KEY,
      from_email    TEXT NOT NULL,
      from_name     TEXT DEFAULT '',
      to_email      TEXT DEFAULT '',
      subject       TEXT NOT NULL,
      snippet       TEXT DEFAULT '',
      body_preview  TEXT DEFAULT '',
      category      TEXT DEFAULT 'other',
      priority      TEXT DEFAULT 'normal',
      action        TEXT DEFAULT 'read',
      summary       TEXT DEFAULT '',
      status        TEXT DEFAULT 'unread',
      vault_path    TEXT DEFAULT '',
      gmail_date    TEXT NOT NULL,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_gmail_emails_status
      ON gmail_emails(status, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_gmail_emails_category
      ON gmail_emails(category, priority);
  `);

  return db;
}

// ── Conversations ──────────────────────

export function createConversation(id: string, title: string) {
  const stmt = getDb().prepare(
    "INSERT INTO conversations (id, title) VALUES (?, ?)"
  );
  stmt.run(id, title);
}

export function listConversations(limit = 50) {
  const stmt = getDb().prepare(
    "SELECT * FROM conversations ORDER BY updated_at DESC LIMIT ?"
  );
  return stmt.all(limit) as {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
  }[];
}

export function getConversation(id: string) {
  const stmt = getDb().prepare("SELECT * FROM conversations WHERE id = ?");
  return stmt.get(id) as
    | { id: string; title: string; created_at: string; updated_at: string }
    | undefined;
}

export function updateConversationTitle(id: string, title: string) {
  const stmt = getDb().prepare(
    "UPDATE conversations SET title = ?, updated_at = datetime('now') WHERE id = ?"
  );
  stmt.run(title, id);
}

export function deleteConversation(id: string) {
  const stmt = getDb().prepare("DELETE FROM conversations WHERE id = ?");
  stmt.run(id);
}

// ── Messages ───────────────────────────

export function addMessage(
  conversationId: string,
  msg: { id: string; role: "user" | "assistant"; content: string }
) {
  const db = getDb();
  const insertMsg = db.prepare(
    "INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)"
  );
  const touchConv = db.prepare(
    "UPDATE conversations SET updated_at = datetime('now') WHERE id = ?"
  );

  const transaction = db.transaction(() => {
    insertMsg.run(msg.id, conversationId, msg.role, msg.content);
    touchConv.run(conversationId);
  });

  transaction();
}

export function getMessages(conversationId: string) {
  const stmt = getDb().prepare(
    "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC"
  );
  return stmt.all(conversationId) as {
    id: string;
    conversation_id: string;
    role: "user" | "assistant";
    content: string;
    created_at: string;
  }[];
}

// ── Telegram Contacts ─────────────────

export interface TelegramContact {
  telegram_id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  display_name: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export function upsertContact(contact: {
  telegram_id: string;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  display_name: string;
}) {
  const stmt = getDb().prepare(`
    INSERT INTO telegram_contacts (telegram_id, username, first_name, last_name, display_name)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(telegram_id) DO UPDATE SET
      username = excluded.username,
      first_name = excluded.first_name,
      last_name = excluded.last_name,
      updated_at = datetime('now')
  `);
  stmt.run(
    contact.telegram_id,
    contact.username ?? null,
    contact.first_name ?? null,
    contact.last_name ?? null,
    contact.display_name,
  );
}

export function getContactByName(name: string): TelegramContact | undefined {
  const stmt = getDb().prepare(`
    SELECT * FROM telegram_contacts
    WHERE display_name LIKE ? OR first_name LIKE ? OR username LIKE ?
    LIMIT 1
  `);
  const pattern = `%${name}%`;
  return stmt.get(pattern, pattern, pattern) as TelegramContact | undefined;
}

export function listContacts(): TelegramContact[] {
  const stmt = getDb().prepare(
    "SELECT * FROM telegram_contacts ORDER BY updated_at DESC"
  );
  return stmt.all() as TelegramContact[];
}

export function updateContactNotes(telegram_id: string, notes: string) {
  const stmt = getDb().prepare(
    "UPDATE telegram_contacts SET notes = ?, updated_at = datetime('now') WHERE telegram_id = ?"
  );
  stmt.run(notes, telegram_id);
}

export function getContactByTelegramId(telegram_id: string): TelegramContact | undefined {
  const stmt = getDb().prepare(
    "SELECT * FROM telegram_contacts WHERE telegram_id = ?"
  );
  return stmt.get(telegram_id) as TelegramContact | undefined;
}

// ── Discord Contacts ──────────────────

export interface DiscordContact {
  discord_id: string;
  username: string | null;
  global_name: string | null;
  display_name: string;
  dm_channel_id: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export function upsertDiscordContact(contact: {
  discord_id: string;
  username?: string | null;
  global_name?: string | null;
  display_name: string;
  dm_channel_id?: string | null;
}) {
  const stmt = getDb().prepare(`
    INSERT INTO discord_contacts (discord_id, username, global_name, display_name, dm_channel_id)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(discord_id) DO UPDATE SET
      username = excluded.username,
      global_name = excluded.global_name,
      dm_channel_id = COALESCE(excluded.dm_channel_id, discord_contacts.dm_channel_id),
      updated_at = datetime('now')
  `);
  stmt.run(
    contact.discord_id,
    contact.username ?? null,
    contact.global_name ?? null,
    contact.display_name,
    contact.dm_channel_id ?? null,
  );
}

export function getDiscordContactByName(name: string): DiscordContact | undefined {
  const stmt = getDb().prepare(`
    SELECT * FROM discord_contacts
    WHERE display_name LIKE ? OR global_name LIKE ? OR username LIKE ?
    LIMIT 1
  `);
  const pattern = `%${name}%`;
  return stmt.get(pattern, pattern, pattern) as DiscordContact | undefined;
}

export function listDiscordContacts(): DiscordContact[] {
  const stmt = getDb().prepare(
    "SELECT * FROM discord_contacts ORDER BY updated_at DESC"
  );
  return stmt.all() as DiscordContact[];
}

export function updateDiscordContactNotes(discord_id: string, notes: string) {
  const stmt = getDb().prepare(
    "UPDATE discord_contacts SET notes = ?, updated_at = datetime('now') WHERE discord_id = ?"
  );
  stmt.run(notes, discord_id);
}

export function getDiscordContactById(discord_id: string): DiscordContact | undefined {
  const stmt = getDb().prepare(
    "SELECT * FROM discord_contacts WHERE discord_id = ?"
  );
  return stmt.get(discord_id) as DiscordContact | undefined;
}

// ── Gmail Emails ─────────────────────

export interface GmailEmailRecord {
  gmail_id: string;
  from_email: string;
  from_name: string;
  to_email: string;
  subject: string;
  snippet: string;
  body_preview: string;
  category: string;
  priority: string;
  action: string;
  summary: string;
  status: string;
  vault_path: string;
  gmail_date: string;
  created_at: string;
  updated_at: string;
}

export function upsertGmailEmail(email: {
  gmail_id: string;
  from_email: string;
  from_name?: string;
  to_email?: string;
  subject: string;
  snippet?: string;
  body_preview?: string;
  category?: string;
  priority?: string;
  action?: string;
  summary?: string;
  status?: string;
  vault_path?: string;
  gmail_date: string;
}) {
  const stmt = getDb().prepare(`
    INSERT INTO gmail_emails (gmail_id, from_email, from_name, to_email, subject, snippet, body_preview, category, priority, action, summary, status, vault_path, gmail_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(gmail_id) DO UPDATE SET
      category = excluded.category,
      priority = excluded.priority,
      action = excluded.action,
      summary = excluded.summary,
      status = COALESCE(excluded.status, gmail_emails.status),
      vault_path = COALESCE(excluded.vault_path, gmail_emails.vault_path),
      updated_at = datetime('now')
  `);
  stmt.run(
    email.gmail_id,
    email.from_email,
    email.from_name ?? '',
    email.to_email ?? '',
    email.subject,
    email.snippet ?? '',
    email.body_preview ?? '',
    email.category ?? 'other',
    email.priority ?? 'normal',
    email.action ?? 'read',
    email.summary ?? '',
    email.status ?? 'unread',
    email.vault_path ?? '',
    email.gmail_date,
  );
}

export function getGmailEmails(filters: {
  category?: string;
  priority?: string;
  status?: string;
  limit?: number;
} = {}): GmailEmailRecord[] {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.category) { conditions.push('category = ?'); params.push(filters.category); }
  if (filters.priority) { conditions.push('priority = ?'); params.push(filters.priority); }
  if (filters.status) { conditions.push('status = ?'); params.push(filters.status); }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = filters.limit || 20;

  const stmt = getDb().prepare(
    `SELECT * FROM gmail_emails ${where} ORDER BY gmail_date DESC LIMIT ?`
  );
  return stmt.all(...params, limit) as GmailEmailRecord[];
}

export function getGmailEmailById(gmail_id: string): GmailEmailRecord | undefined {
  const stmt = getDb().prepare("SELECT * FROM gmail_emails WHERE gmail_id = ?");
  return stmt.get(gmail_id) as GmailEmailRecord | undefined;
}

export function updateGmailEmailStatus(gmail_id: string, status: string) {
  const stmt = getDb().prepare(
    "UPDATE gmail_emails SET status = ?, updated_at = datetime('now') WHERE gmail_id = ?"
  );
  stmt.run(status, gmail_id);
}

export function searchGmailEmails(query: string, limit = 10): GmailEmailRecord[] {
  const pattern = `%${query}%`;
  const stmt = getDb().prepare(`
    SELECT * FROM gmail_emails
    WHERE subject LIKE ? OR from_name LIKE ? OR from_email LIKE ? OR summary LIKE ?
    ORDER BY gmail_date DESC
    LIMIT ?
  `);
  return stmt.all(pattern, pattern, pattern, pattern, limit) as GmailEmailRecord[];
}

export function getGmailStats(sinceDays = 7): {
  total: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  unread: number;
  pendingReply: number;
} {
  const since = new Date(Date.now() - sinceDays * 86400000).toISOString();

  const total = (getDb().prepare(
    "SELECT COUNT(*) as count FROM gmail_emails WHERE created_at >= ?"
  ).get(since) as { count: number }).count;

  const unread = (getDb().prepare(
    "SELECT COUNT(*) as count FROM gmail_emails WHERE status = 'unread' AND created_at >= ?"
  ).get(since) as { count: number }).count;

  const pendingReply = (getDb().prepare(
    "SELECT COUNT(*) as count FROM gmail_emails WHERE action = 'reply' AND status != 'replied' AND created_at >= ?"
  ).get(since) as { count: number }).count;

  const catRows = getDb().prepare(
    "SELECT category, COUNT(*) as count FROM gmail_emails WHERE created_at >= ? GROUP BY category"
  ).all(since) as { category: string; count: number }[];
  const byCategory: Record<string, number> = {};
  for (const r of catRows) byCategory[r.category] = r.count;

  const priRows = getDb().prepare(
    "SELECT priority, COUNT(*) as count FROM gmail_emails WHERE created_at >= ? GROUP BY priority"
  ).all(since) as { priority: string; count: number }[];
  const byPriority: Record<string, number> = {};
  for (const r of priRows) byPriority[r.priority] = r.count;

  return { total, byCategory, byPriority, unread, pendingReply };
}
