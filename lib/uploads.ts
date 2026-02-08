// ══════════════════════════════════════
// VOID — File Upload Helpers
// ══════════════════════════════════════

import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const VAULT_PATH = process.env.VAULT_PATH || './vault-template';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_AGE_DAYS = 30;

const ALLOWED_TYPES: Record<string, 'image' | 'pdf'> = {
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/webp': 'image',
  'image/gif': 'image',
  'application/pdf': 'pdf',
};

export interface UploadResult {
  id: string;
  path: string;
  url: string;
  type: 'image' | 'pdf';
  mimeType: string;
  name: string;
  size: number;
  extractedText?: string;
}

/**
 * Save an uploaded file to the uploads directory
 */
export async function saveUpload(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<UploadResult> {
  // Validate type
  const fileType = ALLOWED_TYPES[mimeType];
  if (!fileType) {
    throw new Error(`File type not allowed: ${mimeType}. Allowed: ${Object.keys(ALLOWED_TYPES).join(', ')}`);
  }

  // Validate size
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`File too large: ${(buffer.length / 1024 / 1024).toFixed(1)}MB. Max: 10MB`);
  }

  // Build path: uploads/YYYY-MM-DD/uuid_filename
  const date = new Date().toISOString().split('T')[0];
  const id = randomUUID();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const dir = path.join(UPLOAD_DIR, date);
  const filePath = path.join(dir, `${id}_${safeName}`);

  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, buffer);

  // Extract text from PDFs
  let extractedText: string | undefined;
  if (fileType === 'pdf') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      extractedText = data.text;
    } catch (err) {
      console.error('[Upload] PDF parse error:', err);
    }
  }

  const relativePath = path.relative('.', filePath);

  return {
    id,
    path: relativePath,
    url: `/api/upload/${date}/${id}_${safeName}`,
    type: fileType,
    mimeType,
    name: fileName,
    size: buffer.length,
    extractedText,
  };
}

/**
 * Clean up uploads older than maxAgeDays
 */
export async function cleanOldUploads(maxAgeDays: number = MAX_AGE_DAYS): Promise<number> {
  let deleted = 0;
  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;

  try {
    const entries = await fs.readdir(UPLOAD_DIR, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      // Parse date from directory name (YYYY-MM-DD)
      const dirDate = new Date(entry.name);
      if (isNaN(dirDate.getTime()) || dirDate.getTime() >= cutoff) continue;

      const dirPath = path.join(UPLOAD_DIR, entry.name);
      await fs.rm(dirPath, { recursive: true });
      deleted++;
    }
  } catch {
    // Upload directory may not exist yet
  }

  return deleted;
}

/**
 * Move an upload into the vault permanently
 */
export async function moveToVault(uploadPath: string, vaultFolder: string): Promise<string> {
  const resolvedUpload = path.resolve(uploadPath);
  const resolvedVault = path.resolve(VAULT_PATH);
  const destDir = path.join(VAULT_PATH, vaultFolder);
  const resolvedDest = path.resolve(destDir);

  // Security: destination must be inside vault
  if (!resolvedDest.startsWith(resolvedVault)) {
    throw new Error('Destination must be inside vault');
  }

  const fileName = path.basename(uploadPath);
  // Strip UUID prefix
  const cleanName = fileName.replace(/^[a-f0-9-]{36}_/, '');
  const destPath = path.join(destDir, cleanName);

  await fs.mkdir(destDir, { recursive: true });

  try {
    await fs.rename(resolvedUpload, destPath);
  } catch {
    await fs.copyFile(resolvedUpload, destPath);
    await fs.unlink(resolvedUpload);
  }

  return path.join(vaultFolder, cleanName);
}

export { UPLOAD_DIR, MAX_FILE_SIZE, ALLOWED_TYPES };
