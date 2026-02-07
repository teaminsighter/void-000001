// ══════════════════════════════════════
// VOID — Vault File Operations Helper
// ══════════════════════════════════════

import fs from 'fs/promises';
import path from 'path';
import { syncFileToKhoj } from '@/lib/khoj';

const VAULT_PATH = process.env.VAULT_PATH || './vault-template';

interface VaultFile {
  name: string;
  folder: string;
  modified: string;
  size: string;
  path: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return `Today ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days} days ago`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Read a file from the vault
 */
export async function readFile(filePath: string): Promise<string> {
  const fullPath = path.join(VAULT_PATH, filePath);

  // Security: ensure path doesn't escape vault
  const resolvedPath = path.resolve(fullPath);
  const resolvedVault = path.resolve(VAULT_PATH);

  if (!resolvedPath.startsWith(resolvedVault)) {
    throw new Error('Invalid path: cannot access files outside vault');
  }

  return await fs.readFile(fullPath, 'utf-8');
}

/**
 * Write a file to the vault and sync to Khoj
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

  // Ensure directory exists
  await fs.mkdir(path.dirname(fullPath), { recursive: true });

  if (mode === 'append') {
    await fs.appendFile(fullPath, '\n' + content, 'utf-8');
  } else {
    await fs.writeFile(fullPath, content, 'utf-8');
  }

  // Sync to Khoj for indexing
  const finalContent = await fs.readFile(fullPath, 'utf-8');
  const fileName = path.basename(filePath);
  syncFileToKhoj(fileName, finalContent).catch(err =>
    console.error('[Vault] Khoj sync failed:', err)
  );
}

/**
 * List files in a vault folder
 */
export async function listFiles(folder: string = ''): Promise<VaultFile[]> {
  const targetDir = folder ? path.join(VAULT_PATH, folder) : VAULT_PATH;
  const resolvedTarget = path.resolve(targetDir);
  const resolvedVault = path.resolve(VAULT_PATH);

  if (!resolvedTarget.startsWith(resolvedVault)) {
    throw new Error('Invalid folder path');
  }

  const files: VaultFile[] = [];

  try {
    await collectFiles(targetDir, folder, files);
  } catch {
    // Directory doesn't exist yet — return empty
  }

  // Sort by modified date, newest first
  files.sort((a, b) => {
    const da = new Date(a.modified).getTime() || 0;
    const db = new Date(b.modified).getTime() || 0;
    return db - da;
  });

  return files;
}

async function collectFiles(dir: string, baseFolder: string, results: VaultFile[]): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const subFolder = baseFolder ? `${baseFolder}/${entry.name}` : entry.name;
      await collectFiles(fullPath, subFolder, results);
    } else if (entry.name.endsWith('.md')) {
      const stat = await fs.stat(fullPath);
      const folder = baseFolder || path.basename(path.dirname(fullPath));

      results.push({
        name: entry.name,
        folder,
        modified: formatDate(stat.mtime),
        size: formatFileSize(stat.size),
        path: baseFolder ? `${baseFolder}/${entry.name}` : entry.name,
      });
    }
  }
}

/**
 * Get today's daily note path
 */
export function getTodayNotePath(): string {
  const today = new Date().toISOString().split('T')[0];
  return `01-Daily/${today}.md`;
}

/**
 * Append to today's log section
 */
export async function appendToLog(text: string): Promise<void> {
  const today = getTodayNotePath();
  const timestamp = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const entry = `- ${timestamp} — ${text}`;
  await writeFile(today, entry, 'append');
}

export { VAULT_PATH };
