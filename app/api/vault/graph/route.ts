import { NextResponse } from 'next/server';
import { listFiles, readFile } from '@/lib/vault';
import type { GraphNode, GraphEdge } from '@/lib/types';

export async function GET() {
  try {
    const files = await listFiles();

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const folderSet = new Set<string>();
    const fileIds = new Set<string>();

    // Build file nodes and collect folders
    for (const file of files) {
      const topFolder = file.folder.split('/')[0];
      folderSet.add(topFolder);
      fileIds.add(file.path);

      nodes.push({
        id: file.path,
        name: file.name.replace('.md', ''),
        folder: topFolder,
        type: 'file',
        val: 1,
      });
    }

    // Build folder nodes
    for (const folder of folderSet) {
      nodes.push({
        id: `folder:${folder}`,
        name: folder,
        folder,
        type: 'folder',
        val: 3,
      });
    }

    // Add folder membership edges
    for (const file of files) {
      const topFolder = file.folder.split('/')[0];
      edges.push({
        source: file.path,
        target: `folder:${topFolder}`,
        type: 'folder',
      });
    }

    // Parse wiki-links from file contents
    const wikiLinkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;

    for (const file of files) {
      try {
        const content = await readFile(file.path);
        let match: RegExpExecArray | null;

        while ((match = wikiLinkRegex.exec(content)) !== null) {
          const linkTarget = match[1].trim();

          // Try to resolve the link to an actual file
          const resolved = files.find(
            (f) =>
              f.name === `${linkTarget}.md` ||
              f.name === linkTarget ||
              f.path === linkTarget ||
              f.path === `${linkTarget}.md`
          );

          if (resolved && resolved.path !== file.path) {
            edges.push({
              source: file.path,
              target: resolved.path,
              type: 'wiki-link',
            });
          }
        }
      } catch {
        // Skip files that can't be read
      }
    }

    return NextResponse.json({ nodes, edges });
  } catch (error) {
    console.error('[API/vault/graph] Error:', error);
    return NextResponse.json(
      { error: 'Failed to build graph', details: String(error) },
      { status: 500 }
    );
  }
}
