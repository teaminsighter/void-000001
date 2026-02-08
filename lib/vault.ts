// ══════════════════════════════════════
// VOID — Vault File Operations Helper
// ══════════════════════════════════════

import fs from 'fs/promises';
import path from 'path';
import { syncFileToKhoj } from '@/lib/khoj';

const VAULT_PATH = process.env.VAULT_PATH || './vault-template';
const PROTECTED_FOLDERS = ['99-System'];

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
 * Save a version snapshot before overwriting a file
 */
async function saveVersion(filePath: string): Promise<void> {
  const fullPath = path.join(VAULT_PATH, filePath);
  try {
    const existing = await fs.readFile(fullPath, 'utf-8');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const versionDir = path.join(VAULT_PATH, '.versions', filePath);
    await fs.mkdir(versionDir, { recursive: true });
    await fs.writeFile(path.join(versionDir, `${timestamp}.md`), existing, 'utf-8');
  } catch {
    // File doesn't exist yet — no version to save
  }
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

  // Auto-version: save snapshot before overwriting
  if (mode === 'overwrite') {
    await saveVersion(filePath);
  }

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
 * Move or rename a file within the vault
 */
export async function moveFile(from: string, to: string): Promise<void> {
  const fullFrom = path.join(VAULT_PATH, from);
  const fullTo = path.join(VAULT_PATH, to);

  // Security: ensure both paths stay inside vault
  const resolvedFrom = path.resolve(fullFrom);
  const resolvedTo = path.resolve(fullTo);
  const resolvedVault = path.resolve(VAULT_PATH);

  if (!resolvedFrom.startsWith(resolvedVault)) {
    throw new Error('Invalid source path: cannot access files outside vault');
  }
  if (!resolvedTo.startsWith(resolvedVault)) {
    throw new Error('Invalid destination path: cannot access files outside vault');
  }

  // Ensure destination directory exists
  await fs.mkdir(path.dirname(fullTo), { recursive: true });

  // Try atomic rename first, fallback to copy+delete for cross-mount
  try {
    await fs.rename(fullFrom, fullTo);
  } catch {
    await fs.copyFile(fullFrom, fullTo);
    await fs.unlink(fullFrom);
  }

  // Sync new path to Khoj
  const content = await fs.readFile(fullTo, 'utf-8');
  const fileName = path.basename(to);
  syncFileToKhoj(fileName, content).catch(err =>
    console.error('[Vault] Khoj sync after move failed:', err)
  );
}

/**
 * Soft delete a file by moving it to .trash/
 */
export async function softDelete(filePath: string): Promise<void> {
  const fullPath = path.join(VAULT_PATH, filePath);

  // Security check
  const resolvedPath = path.resolve(fullPath);
  const resolvedVault = path.resolve(VAULT_PATH);

  if (!resolvedPath.startsWith(resolvedVault)) {
    throw new Error('Invalid path: cannot access files outside vault');
  }

  // Check protected folders
  for (const folder of PROTECTED_FOLDERS) {
    if (filePath.startsWith(folder + '/') || filePath === folder) {
      throw new Error(`Cannot delete files in protected folder: ${folder}`);
    }
  }

  // Build trash path: .trash/<original-folder>/<timestamp>_<filename>
  const originalFolder = path.dirname(filePath);
  const timestamp = Date.now();
  const fileName = path.basename(filePath);
  const trashDir = path.join(VAULT_PATH, '.trash', originalFolder);
  const trashPath = path.join(trashDir, `${timestamp}_${fileName}`);

  await fs.mkdir(trashDir, { recursive: true });

  // Move to trash (rename first, fallback copy+delete)
  try {
    await fs.rename(fullPath, trashPath);
  } catch {
    await fs.copyFile(fullPath, trashPath);
    await fs.unlink(fullPath);
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

/**
 * List version history of a file
 * Returns the raw filename stem as the timestamp identifier
 */
export async function listVersions(filePath: string): Promise<{ timestamp: string; size: string }[]> {
  const versionDir = path.join(VAULT_PATH, '.versions', filePath);
  const resolvedDir = path.resolve(versionDir);
  const resolvedVault = path.resolve(VAULT_PATH);

  if (!resolvedDir.startsWith(resolvedVault)) {
    throw new Error('Invalid path');
  }

  try {
    const entries = await fs.readdir(versionDir);
    const versions: { timestamp: string; size: string }[] = [];

    for (const entry of entries) {
      if (!entry.endsWith('.md')) continue;
      const stat = await fs.stat(path.join(versionDir, entry));
      // Use the filename stem directly as the identifier (e.g. "2026-02-08T06-14-53-069Z")
      const stem = entry.replace('.md', '');
      versions.push({
        timestamp: stem,
        size: formatFileSize(stat.size),
      });
    }

    // Newest first
    versions.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    return versions;
  } catch {
    return [];
  }
}

/**
 * Restore a previous version of a file
 */
export async function restoreVersion(filePath: string, timestamp: string): Promise<void> {
  const resolvedVault = path.resolve(VAULT_PATH);

  // Security check
  const fullPath = path.join(VAULT_PATH, filePath);
  if (!path.resolve(fullPath).startsWith(resolvedVault)) {
    throw new Error('Invalid path');
  }

  // Find the version file matching the timestamp
  const versionDir = path.join(VAULT_PATH, '.versions', filePath);
  const entries = await fs.readdir(versionDir);

  // Match by exact filename stem, or partial match
  const match = entries.find(e => {
    const stem = e.replace('.md', '');
    return stem === timestamp || stem.includes(timestamp) || timestamp.includes(stem);
  });

  if (!match) {
    throw new Error(`No version found matching: ${timestamp}`);
  }

  const versionContent = await fs.readFile(path.join(versionDir, match), 'utf-8');

  // Save current as a new version before restoring
  await saveVersion(filePath);

  // Restore
  await fs.writeFile(fullPath, versionContent, 'utf-8');

  // Sync to Khoj
  const fileName = path.basename(filePath);
  syncFileToKhoj(fileName, versionContent).catch(err =>
    console.error('[Vault] Khoj sync after restore failed:', err)
  );
}

export { VAULT_PATH };
