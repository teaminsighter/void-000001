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
