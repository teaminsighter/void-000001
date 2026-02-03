import { NextRequest, NextResponse } from 'next/server';
import { readFile } from '@/lib/vault';

interface ReadRequest {
  path: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ReadRequest = await request.json();
    const { path } = body;

    if (!path?.trim()) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      );
    }

    const content = await readFile(path);

    // Extract frontmatter if present
    let metadata: Record<string, string> = {};
    let body_content = content;

    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      body_content = frontmatterMatch[2];

      // Parse simple key: value pairs
      frontmatter.split('\n').forEach(line => {
        const match = line.match(/^(\w+):\s*(.+)$/);
        if (match) {
          metadata[match[1]] = match[2];
        }
      });
    }

    return NextResponse.json({
      path,
      content: body_content,
      metadata,
      raw: content,
    });
  } catch (error) {
    console.error('[API/vault/read] Error:', error);
    return NextResponse.json(
      { error: 'Failed to read file', details: String(error) },
      { status: 500 }
    );
  }
}
