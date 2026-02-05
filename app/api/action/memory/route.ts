import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const VAULT_PATH = process.env.VAULT_PATH || './vault-template';

type MemoryType = 'preference' | 'goal' | 'context';

interface MemoryRequest {
  type: MemoryType;
  content: string;
}

const MEMORY_FILES: Record<MemoryType, string> = {
  preference: '07-Agent-Memory/preferences.md',
  goal: '07-Agent-Memory/goals.md',
  context: '07-Agent-Memory/agent-context.md',
};

const SECTION_MARKERS: Record<MemoryType, string> = {
  preference: '## Current Focus',
  goal: '## This Month',
  context: '## Important Decisions',
};

export async function POST(request: NextRequest) {
  try {
    const body: MemoryRequest = await request.json();
    const { type, content } = body;

    if (!type) {
      return NextResponse.json(
        { error: 'Type is required (preference, goal, or context)' },
        { status: 400 }
      );
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    if (!MEMORY_FILES[type]) {
      return NextResponse.json(
        { error: 'Invalid type. Use: preference, goal, or context' },
        { status: 400 }
      );
    }

    const filePath = path.join(VAULT_PATH, MEMORY_FILES[type]);

    // Read existing file
    let fileContent: string;
    try {
      fileContent = await fs.readFile(filePath, 'utf-8');
    } catch {
      fileContent = createDefaultFile(type);
    }

    // Update the file
    const updatedContent = addToMemoryFile(fileContent, type, content.trim());

    // Write back
    await fs.writeFile(filePath, updatedContent, 'utf-8');

    return NextResponse.json({
      success: true,
      type,
      message: `Saved to ${type}: ${content.trim()}`,
    });
  } catch (error) {
    console.error('[API/action/memory] Error:', error);
    return NextResponse.json(
      { error: 'Failed to save memory', details: String(error) },
      { status: 500 }
    );
  }
}

function createDefaultFile(type: MemoryType): string {
  const now = new Date().toISOString().split('T')[0];

  const templates: Record<MemoryType, string> = {
    preference: `---
updated: ${now}
type: agent-memory
---

# User Preferences

## Identity
- Name:
- Location: Bangladesh
- Timezone: Asia/Dhaka

## Work Style
- Office hours: 4-6 hours per day

## Current Focus
-

## Preferences
-

## Do Not
-
`,
    goal: `---
updated: ${now}
type: agent-memory
---

# Goals 2026

## This Month
- [ ]

## This Quarter
- [ ]

## Ongoing
-
`,
    context: `---
updated: ${now}
type: agent-memory
---

# Agent Context

## Important Decisions
-

## Patterns & Preferences
-

## Key People
-

## Notes
-
`,
  };

  return templates[type];
}

function addToMemoryFile(
  fileContent: string,
  type: MemoryType,
  newContent: string
): string {
  const lines = fileContent.split('\n');
  const sectionMarker = SECTION_MARKERS[type];

  // Update the "updated" date in frontmatter
  const now = new Date().toISOString().split('T')[0];
  const updatedLines = lines.map((line) => {
    if (line.startsWith('updated:')) {
      return `updated: ${now}`;
    }
    return line;
  });

  // Find the section to add to
  const sectionIndex = updatedLines.findIndex((line) =>
    line.includes(sectionMarker)
  );

  if (sectionIndex !== -1) {
    // Find the next line after the section header
    let insertIndex = sectionIndex + 1;

    // Skip empty lines
    while (
      insertIndex < updatedLines.length &&
      updatedLines[insertIndex].trim() === ''
    ) {
      insertIndex++;
    }

    // Format the new content
    const formattedContent =
      type === 'goal' ? `- [ ] ${newContent}` : `- ${newContent}`;

    // Insert the new content
    updatedLines.splice(insertIndex, 0, formattedContent);
  } else {
    // Section not found, append to end
    const formattedContent =
      type === 'goal' ? `- [ ] ${newContent}` : `- ${newContent}`;
    updatedLines.push('', formattedContent);
  }

  return updatedLines.join('\n');
}

// GET: Return current memory state
export async function GET() {
  try {
    const memories: Record<string, string> = {};

    for (const [type, relativePath] of Object.entries(MEMORY_FILES)) {
      const filePath = path.join(VAULT_PATH, relativePath);
      try {
        memories[type] = await fs.readFile(filePath, 'utf-8');
      } catch {
        memories[type] = '';
      }
    }

    return NextResponse.json({ memories });
  } catch (error) {
    console.error('[API/action/memory] Read error:', error);
    return NextResponse.json(
      { error: 'Failed to read memories' },
      { status: 500 }
    );
  }
}
