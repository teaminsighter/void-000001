// ══════════════════════════════════════
// VOID — Khoj API Helper
// ══════════════════════════════════════

const KHOJ_BASE = process.env.KHOJ_BASE_URL || 'http://localhost:42110';

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
 * Search the vault using Khoj semantic search
 * @param query - Search query
 * @param type - Content type (markdown, org, etc.)
 * @param limit - Maximum results to return
 * @returns Search results
 */
export async function search(
  query: string,
  type: string = 'markdown',
  limit: number = 5
): Promise<SearchResponse> {
  // This will be implemented in Layer 7 when we connect to real Khoj
  // For now, return mock data

  console.log('[Khoj] Would search:', { query, type, limit, baseUrl: KHOJ_BASE });

  return {
    query,
    count: 2,
    results: [
      {
        entry: `Mock search result for: "${query}"\n\nThis would contain relevant content from your vault that semantically matches your query.`,
        file: '01-Daily/2026-02-02.md',
        score: 0.95,
      },
      {
        entry: `Another relevant result for: "${query}"\n\nKhoj uses vector embeddings to find semantically similar content.`,
        file: '07-Agent-Memory/preferences.md',
        score: 0.82,
      },
    ],
  };
}

/**
 * Trigger Khoj to re-index the vault
 * @returns Success status
 */
export async function reindex(): Promise<{ success: boolean; message: string }> {
  // This will be implemented in Layer 7
  console.log('[Khoj] Would trigger reindex at:', KHOJ_BASE);

  return {
    success: true,
    message: 'Reindex triggered (mock)',
  };
}

/**
 * Get Khoj health status
 * @returns Health status
 */
export async function health(): Promise<{ status: string; indexed: number }> {
  // This will be implemented in Layer 7
  console.log('[Khoj] Would check health at:', KHOJ_BASE);

  return {
    status: 'mock',
    indexed: 247,
  };
}

/**
 * Build context string from search results
 * @param results - Search results from Khoj
 * @returns Formatted context string for Claude
 */
export function buildContext(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No relevant context found in vault.';
  }

  return results
    .map((r, i) => `[${i + 1}] From ${r.file} (relevance: ${Math.round(r.score * 100)}%):\n${r.entry}`)
    .join('\n\n---\n\n');
}

export { KHOJ_BASE };
