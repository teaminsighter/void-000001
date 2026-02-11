// ══════════════════════════════════════
// VOID — TypeScript Types
// ══════════════════════════════════════

// Attachment types
export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'pdf';
  mimeType: string;
  path: string;
  url: string;
  size: number;
  extractedText?: string;
}

// Chat types
export interface ToolAction {
  tool: string;
  input: Record<string, unknown>;
  result: string;
  success: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: ToolAction[];
  attachments?: Attachment[];
  unsaved?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

// Task types
export type TaskPriority = 'high' | 'med' | 'low';
export type TaskTag = 'Office' | 'Project' | 'Learning' | 'Personal';

export interface Task {
  id: string;
  text: string;
  tag?: TaskTag;
  priority?: TaskPriority;
  done: boolean;
  time?: string;
  createdAt?: Date;
  dueDate?: Date;
}

// Schedule types
export type ScheduleType = 'focus' | 'meeting' | 'break' | 'admin';

export interface ScheduleItem {
  time: string;
  title: string;
  type: ScheduleType;
}

// Email types
export interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  time: string;
  urgent: boolean;
  read: boolean;
}

// Vault types
export interface VaultFile {
  name: string;
  folder: string;
  modified: string;
  size: string;
  path: string;
}

// Bot/Workflow types
export type BotStatus = 'ok' | 'warn' | 'error';
export type BotType = 'cron' | 'webhook' | 'both';

export interface Bot {
  id: string;
  name: string;
  schedule: string;
  lastRun: string;
  status: BotStatus;
  type: BotType;
}

// CRM types
export interface Deal {
  id: string;
  name: string;
  stage: string;
  value: string;
  probability: string;
  owner: string;
}

// Saved items types
export type SavedItemType = 'Article' | 'Tutorial' | 'Video' | 'Guide';

export interface SavedItem {
  id: string;
  title: string;
  type: SavedItemType;
  source: string;
  date: string;
  url: string;
}

// Conversation types
export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationWithMessages extends Conversation {
  messages: {
    id: string;
    conversation_id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
  }[];
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  timestamp: number;
  services: {
    dashboard: boolean;
    n8n: boolean;
    khoj: boolean;
    vault: boolean;
  };
}

// Search types
export interface SearchResult {
  entry: string;
  file: string;
  score: number;
}

// Page configuration
export interface PageConfig {
  id: string;
  path: string;
  icon: string;
  label: string;
}

// Graph types
export interface GraphNode {
  id: string;
  name: string;
  folder: string;
  type: 'file' | 'folder';
  val: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: 'wiki-link' | 'folder';
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const PAGES: PageConfig[] = [
  { id: 'home', path: '/', icon: '⌂', label: 'Home' },
  { id: 'agent', path: '/agent', icon: '◉', label: 'Agent' },
  { id: 'planner', path: '/planner', icon: '▦', label: 'Planner' },
  { id: 'vault', path: '/vault', icon: '◈', label: 'Vault' },
  { id: 'mail', path: '/mail', icon: '✉', label: 'Mail' },
  { id: 'research', path: '/research', icon: '◎', label: 'Research' },
  { id: 'saved', path: '/saved', icon: '◆', label: 'Saved' },
  { id: 'bots', path: '/bots', icon: '⚡', label: 'Bots' },
];
