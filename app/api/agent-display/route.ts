import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DISPLAY_FILE = path.join(process.cwd(), 'data', 'agent-display.json');

export interface AgentDisplayContent {
  type: 'quote' | 'image' | 'note' | 'graph' | 'motivation' | 'empty';
  title?: string;
  content?: string;
  imageUrl?: string;
  author?: string;
  updatedAt: string;
}

const DEFAULT_CONTENT: AgentDisplayContent = {
  type: 'quote',
  title: 'Daily Wisdom',
  content: 'The only way to do great work is to love what you do.',
  author: 'Steve Jobs',
  updatedAt: new Date().toISOString(),
};

async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

export async function GET() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DISPLAY_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json(DEFAULT_CONTENT);
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDataDir();
    const body = await request.json();
    const content: AgentDisplayContent = {
      ...body,
      updatedAt: new Date().toISOString(),
    };
    await fs.writeFile(DISPLAY_FILE, JSON.stringify(content, null, 2));
    return NextResponse.json({ success: true, content });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save display content' },
      { status: 500 }
    );
  }
}
