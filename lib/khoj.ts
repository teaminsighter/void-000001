// ══════════════════════════════════════
// VOID — Vault Search Helper
// ══════════════════════════════════════
// Works WITHOUT Khoj — uses local file search + Claude
// Can connect to Khoj later for semantic search

import { promises as fs } from 'fs';
import path from 'path';

const KHOJ_BASE = process.env.KHOJ_BASE_URL || 'http://localhost:42110';
const KHOJ_API_KEY = process.env.KHOJ_API_KEY || '';
const VAULT_PATH = process.env.VAULT_PATH || './vault-template';
const USE_KHOJ = process.env.USE_KHOJ === 'true'; // Set to 'true' to enable Khoj

function khojHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  if (KHOJ_API_KEY) {
    headers['Authorization'] = `Bearer ${KHOJ_API_KEY}`;
  }
  return headers;
}

interface SearchResult {
  entry: string;
  file: string;
  score: number;
}

interface SearchResponse {
  results: SearchResult[];
  query: string;
  count: number;
}

/**
 * Search the vault
 * - If USE_KHOJ=true: Uses Khoj semantic search
 * - Otherwise: Uses local file search with keyword matching
 */
export async function search(
  query: string,
  type: string = 'markdown',
  limit: number = 5
): Promise<SearchResponse> {

  // If Khoj is enabled, use it
  if (USE_KHOJ) {
    return searchWithKhoj(query, type, limit);
  }

  // Otherwise, use local file search
  return searchLocal(query, limit);
}

/**
 * Local file search (no Khoj needed)
 * Searches vault files for keyword matches
 */
async function searchLocal(query: string, limit: number = 5): Promise<SearchResponse> {
  const results: SearchResult[] = [];
  const queryLower = query.toLowerCase();
  const keywords = queryLower.split(/\s+/).filter(k => k.length > 2);

  try {
    // Get all markdown files from vault
    const files = await getVaultFiles(VAULT_PATH);

    for (const filePath of files) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const contentLower = content.toLowerCase();
        const relativePath = path.relative(VAULT_PATH, filePath);

        // Calculate relevance score based on keyword matches
        let score = 0;
        let matchedContent = '';

        for (const keyword of keywords) {
          if (contentLower.includes(keyword)) {
            score += 0.2;

            // Extract snippet around the keyword
            const index = contentLower.indexOf(keyword);
            const start = Math.max(0, index - 100);
            const end = Math.min(content.length, index + 200);
            matchedContent = content.substring(start, end).trim();
          }
        }

        // Also match file path
        if (relativePath.toLowerCase().includes(queryLower)) {
          score += 0.3;
        }

        if (score > 0) {
          results.push({
            entry: matchedContent || content.substring(0, 300),
            file: relativePath,
            score: Math.min(score, 1),
          });
        }
      } catch {
        // Skip files that can't be read
      }
    }

    // Sort by score and limit results
    results.sort((a, b) => b.score - a.score);
    const topResults = results.slice(0, limit);

    return {
      query,
      count: topResults.length,
      results: topResults,
    };
  } catch (error) {
    console.error('[Search] Error searching vault:', error);
    return { query, count: 0, results: [] };
  }
}

/**
 * Get all markdown files from vault directory
 */
async function getVaultFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        // Recursively search subdirectories
        const subFiles = await getVaultFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }

  return files;
}

/**
 * Search using Khoj API (when enabled)
 */
async function searchWithKhoj(
  query: string,
  type: string = 'markdown',
  limit: number = 8
): Promise<SearchResponse> {
  try {
    // Use 'markdown' type for vault-specific searches, increased default limit to 8
    const searchType = type === 'all' ? 'all' : 'markdown';
    const url = `${KHOJ_BASE}/api/search?q=${encodeURIComponent(query)}&t=${searchType}&n=${limit}`;
    const response = await fetch(url, { headers: khojHeaders() });

    if (!response.ok) {
      throw new Error(`Khoj API error: ${response.status}`);
    }

    const data = await response.json();

    // Format Khoj response
    const results: SearchResult[] = Array.isArray(data)
      ? data.map((r: { entry?: string; content?: string; file?: string; source?: string; score?: number; additional?: { file?: string; source?: string } }) => ({
          entry: r.entry || r.content || '',
          file: r.additional?.file || r.file || r.source || 'unknown',
          score: r.score || 0.5,
        }))
      : [];

    // Deduplicate by file path, keep highest score per file
    const seen = new Map<string, SearchResult>();
    for (const r of results) {
      const existing = seen.get(r.file);
      if (!existing || r.score > existing.score) {
        seen.set(r.file, r);
      }
    }

    // Sort by score descending
    const deduped = Array.from(seen.values()).sort((a, b) => b.score - a.score);

    return {
      query,
      count: deduped.length,
      results: deduped,
    };
  } catch (error) {
    console.error('[Khoj] Search error:', error);
    // Fallback to local search
    return searchLocal(query, limit);
  }
}

/**
 * Trigger vault re-index
 */
export async function reindex(): Promise<{ success: boolean; message: string }> {
  if (!USE_KHOJ) {
    return {
      success: true,
      message: 'Local search - no reindex needed',
    };
  }

  try {
    const response = await fetch(`${KHOJ_BASE}/api/update`, { headers: khojHeaders() });
    return {
      success: response.ok,
      message: response.ok ? 'Reindex triggered' : 'Reindex failed',
    };
  } catch (error) {
    return {
      success: false,
      message: `Reindex error: ${error}`,
    };
  }
}

/**
 * Get search health status
 */
export async function health(): Promise<{ status: string; indexed: number }> {
  if (!USE_KHOJ) {
    // Count local vault files
    try {
      const files = await getVaultFiles(VAULT_PATH);
      return {
        status: 'local',
        indexed: files.length,
      };
    } catch {
      return { status: 'local', indexed: 0 };
    }
  }

  try {
    const response = await fetch(`${KHOJ_BASE}/api/health`, { headers: khojHeaders() });
    if (response.ok) {
      const data = await response.json();
      return {
        status: 'khoj',
        indexed: data.indexed || 0,
      };
    }
    return { status: 'khoj-error', indexed: 0 };
  } catch {
    return { status: 'khoj-offline', indexed: 0 };
  }
}

/**
 * Build context string from search results
 */
export function buildContext(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No relevant context found in vault.';
  }

  return results
    .map((r, i) => `[${i + 1}] From ${r.file} (relevance: ${Math.round(r.score * 100)}%):\n${r.entry}`)
    .join('\n\n---\n\n');
}

/**
 * Sync a file to Khoj for indexing
 * Called after writing to vault
 */
export async function syncFileToKhoj(fileName: string, content: string): Promise<boolean> {
  if (!USE_KHOJ) return true;

  try {
    const formData = new FormData();
    const blob = new Blob([content], { type: 'text/markdown' });
    formData.append('files', blob, fileName);

    const response = await fetch(`${KHOJ_BASE}/api/content`, {
      method: 'PATCH',
      headers: khojHeaders(),
      body: formData,
    });

    return response.ok;
  } catch (error) {
    console.error('[Khoj] Sync error:', error);
    return false;
  }
}

/**
 * Chat with Khoj's RAG endpoint for deep vault knowledge queries
 * Khoj retrieves relevant docs and generates an answer
 */
export async function khojChat(query: string): Promise<string> {
  if (!USE_KHOJ) {
    // Fallback: do a local search and return raw results
    const results = await searchLocal(query, 5);
    if (results.count === 0) return 'No relevant information found in vault.';
    return results.results
      .map(r => `From ${r.file}:\n${r.entry.slice(0, 500)}`)
      .join('\n\n---\n\n');
  }

  try {
    const url = `${KHOJ_BASE}/api/chat?q=${encodeURIComponent(query)}&stream=false`;
    const response = await fetch(url, { headers: khojHeaders() });

    if (!response.ok) {
      throw new Error(`Khoj chat error: ${response.status}`);
    }

    const data = await response.json();
    // Khoj returns { response: "...", context: [...] } or similar
    return data.response || data.message || JSON.stringify(data);
  } catch (error) {
    console.error('[Khoj] Chat error:', error);
    // Fallback to local search
    const results = await searchLocal(query, 5);
    if (results.count === 0) return 'No relevant information found in vault.';
    return results.results
      .map(r => `From ${r.file}:\n${r.entry.slice(0, 500)}`)
      .join('\n\n---\n\n');
  }
}

export { KHOJ_BASE, KHOJ_API_KEY, USE_KHOJ };
