// ══════════════════════════════════════
// VOID — Vault File Operations Helper
// ══════════════════════════════════════

import fs from 'fs/promises';
import path from 'path';

const VAULT_PATH = process.env.VAULT_PATH || './vault';

interface VaultFile {
  name: string;
  folder: string;
  modified: string;
  size: string;
  path: string;
}

/**
 * Read a file from the vault
 * @param filePath - Relative path within the vault
 * @returns File content
 */
export async function readFile(filePath: string): Promise<string> {
  const fullPath = path.join(VAULT_PATH, filePath);

  // Security: ensure path doesn't escape vault
  const resolvedPath = path.resolve(fullPath);
  const resolvedVault = path.resolve(VAULT_PATH);

  if (!resolvedPath.startsWith(resolvedVault)) {
    throw new Error('Invalid path: cannot access files outside vault');
  }

  try {
    return await fs.readFile(fullPath, 'utf-8');
  } catch (error) {
    // For development, return mock content
    console.log('[Vault] Would read:', fullPath);
    return `# Mock File Content

This is mock content for: ${filePath}

Real vault integration will be added in Layer 7.

---

The actual file would contain your notes from Obsidian.`;
  }
}

/**
 * Write a file to the vault
 * @param filePath - Relative path within the vault
 * @param content - Content to write
 * @param mode - 'overwrite' or 'append'
 */
export async function writeFile(
  filePath: string,
  content: string,
  mode: 'overwrite' | 'append' = 'overwrite'
): Promise<void> {
  const fullPath = path.join(VAULT_PATH, filePath);

  // Security check
  const resolvedPath = path.resolve(fullPath);
  const resolvedVault = path.resolve(VAULT_PATH);

  if (!resolvedPath.startsWith(resolvedVault)) {
    throw new Error('Invalid path: cannot write files outside vault');
  }

  try {
    // Ensure directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    if (mode === 'append') {
      await fs.appendFile(fullPath, '\n' + content, 'utf-8');
    } else {
      await fs.writeFile(fullPath, content, 'utf-8');
    }
  } catch (error) {
    console.log('[Vault] Would write:', { fullPath, mode, contentLength: content.length });
  }
}

/**
 * List files in a vault folder
 * @param folder - Folder path (empty for root)
 * @returns Array of file info
 */
export async function listFiles(folder: string = ''): Promise<VaultFile[]> {
  // For development, return mock data
  // Real implementation in Layer 7

  console.log('[Vault] Would list files in:', folder || 'root');

  return [
    { name: '2026-02-02.md', folder: '01-Daily', modified: 'Today 6:30 PM', size: '2.1 KB', path: '01-Daily/2026-02-02.md' },
    { name: '2026-02-01.md', folder: '01-Daily', modified: 'Yesterday', size: '3.4 KB', path: '01-Daily/2026-02-01.md' },
    { name: 'embeddings-vectors.md', folder: '02-Learning', modified: 'Yesterday', size: '5.2 KB', path: '02-Learning/embeddings-vectors.md' },
    { name: 'q1-marketing-plan.md', folder: '03-Office', modified: 'Jan 30', size: '8.7 KB', path: '03-Office/q1-marketing-plan.md' },
    { name: 'void-os-architecture.md', folder: '04-Projects', modified: 'Today 3:00 PM', size: '12.1 KB', path: '04-Projects/void-os-architecture.md' },
    { name: 'nexus-deal-notes.md', folder: '03-Office', modified: 'Jan 28', size: '1.8 KB', path: '03-Office/nexus-deal-notes.md' },
    { name: 'preferences.md', folder: '07-Agent-Memory', modified: 'Jan 25', size: '0.9 KB', path: '07-Agent-Memory/preferences.md' },
    { name: 'goals-2026.md', folder: '07-Agent-Memory', modified: 'Jan 20', size: '1.2 KB', path: '07-Agent-Memory/goals-2026.md' },
  ];
}

/**
 * Get today's daily note path
 * @returns Path to today's daily note
 */
export function getTodayNotePath(): string {
  const today = new Date().toISOString().split('T')[0];
  return `01-Daily/${today}.md`;
}

/**
 * Append to today's log section
 * @param text - Text to append
 */
export async function appendToLog(text: string): Promise<void> {
  const today = getTodayNotePath();
  const timestamp = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const entry = `- ${timestamp} — ${text}`;

  // In production, this would find the ## Log section and append
  // For now, just append to file
  await writeFile(today, entry, 'append');
}

export { VAULT_PATH };
