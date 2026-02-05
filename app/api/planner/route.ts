import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, appendToLog } from '@/lib/vault';
import { chat } from '@/lib/anthropic';
import { search, buildContext } from '@/lib/khoj';

const today = () => new Date().toISOString().split('T')[0];
const dailyPath = () => `01-Daily/${today()}.md`;

interface Task {
  id: string;
  text: string;
  done: boolean;
  time?: string;
}

interface Schedule {
  time: string;
  title: string;
  type: 'focus' | 'meeting' | 'break' | 'admin';
}

// GET: Load today's plan from vault
export async function GET() {
  try {
    const content = await readFile(dailyPath());

    // Parse tasks from ## Tasks section
    const tasks: Task[] = [];
    const taskMatch = content.match(/## Tasks\n([\s\S]*?)(?=\n##|$)/);
    if (taskMatch) {
      const lines = taskMatch[1].split('\n').filter(l => l.trim().startsWith('- ['));
      lines.forEach((line, i) => {
        const done = line.includes('[x]') || line.includes('[X]');
        const text = line.replace(/^- \[.\]\s*/, '').trim();
        const timeMatch = text.match(/^(\d{1,2}:\d{2})\s*[—-]\s*/);
        tasks.push({
          id: `task-${i}`,
          text: timeMatch ? text.replace(timeMatch[0], '') : text,
          done,
          time: timeMatch ? timeMatch[1] : undefined,
        });
      });
    }

    // Parse schedule from ## Plan section
    const schedule: Schedule[] = [];
    const planMatch = content.match(/## Plan\n([\s\S]*?)(?=\n##|$)/);
    if (planMatch) {
      const lines = planMatch[1].split('\n').filter(l => /^\d{1,2}:\d{2}/.test(l.trim()));
      lines.forEach(line => {
        const match = line.match(/^(\d{1,2}:\d{2})\s*[—-]\s*(.+)/);
        if (match) {
          const title = match[2].trim();
          let type: Schedule['type'] = 'admin';
          if (/focus|deep|work/i.test(title)) type = 'focus';
          else if (/meeting|call|sync/i.test(title)) type = 'meeting';
          else if (/break|lunch|rest/i.test(title)) type = 'break';
          schedule.push({ time: match[1], title, type });
        }
      });
    }

    return NextResponse.json({ tasks, schedule, date: today() });
  } catch (error) {
    console.error('[API/planner] GET error:', error);
    return NextResponse.json({ tasks: [], schedule: [], date: today() });
  }
}

// POST: Generate AI plan or save tasks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, tasks, hours, priorities } = body;

    if (action === 'generate') {
      // Search for context
      const searchResults = await search('goals priorities tasks today');
      const context = buildContext(searchResults.results);

      const prompt = `Create a focused daily plan for today.

Available hours: ${hours || 4}
${priorities ? `Priorities: ${priorities}` : ''}

Context from vault:
${context}

Generate a time-blocked schedule starting from current time. Format:
## Plan
HH:MM — Task description
HH:MM — Task description

## Tasks
- [ ] Task 1
- [ ] Task 2

Be realistic with time blocks. Include breaks.`;

      const plan = await chat([{ role: 'user', content: prompt }]);

      // Save to vault
      await appendToLog(`Generated daily plan`);

      // Parse and return the plan
      const scheduleLines = plan.match(/\d{1,2}:\d{2}\s*[—-]\s*.+/g) || [];
      const schedule: Schedule[] = scheduleLines.map(line => {
        const match = line.match(/^(\d{1,2}:\d{2})\s*[—-]\s*(.+)/);
        if (match) {
          const title = match[2].trim();
          let type: Schedule['type'] = 'admin';
          if (/focus|deep|work/i.test(title)) type = 'focus';
          else if (/meeting|call|sync/i.test(title)) type = 'meeting';
          else if (/break|lunch|rest/i.test(title)) type = 'break';
          return { time: match[1], title, type };
        }
        return { time: '09:00', title: line, type: 'admin' as const };
      });

      const taskLines = plan.match(/- \[.\]\s*.+/g) || [];
      const newTasks: Task[] = taskLines.map((line, i) => ({
        id: `task-${Date.now()}-${i}`,
        text: line.replace(/^- \[.\]\s*/, '').trim(),
        done: false,
      }));

      return NextResponse.json({
        success: true,
        schedule,
        tasks: newTasks,
        raw: plan
      });
    }

    if (action === 'save' && tasks) {
      // Update tasks in daily note
      const taskLines = tasks.map((t: Task) =>
        `- [${t.done ? 'x' : ' '}] ${t.time ? `${t.time} — ` : ''}${t.text}`
      ).join('\n');

      const content = await readFile(dailyPath());
      let newContent = content;

      if (content.includes('## Tasks')) {
        newContent = content.replace(
          /## Tasks\n[\s\S]*?(?=\n##|$)/,
          `## Tasks\n${taskLines}\n`
        );
      } else {
        newContent = content + `\n## Tasks\n${taskLines}\n`;
      }

      await writeFile(dailyPath(), newContent, 'overwrite');
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[API/planner] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: String(error) },
      { status: 500 }
    );
  }
}
