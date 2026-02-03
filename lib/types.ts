// ══════════════════════════════════════
// VOID — TypeScript Types
// ══════════════════════════════════════

// Chat types
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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
  tag: TaskTag;
  priority: TaskPriority;
  done: boolean;
  createdAt: Date;
  dueDate?: Date;
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
