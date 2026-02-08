// ══════════════════════════════════════
// VOID — Lightweight Event Bus
// Uses window.CustomEvent for cross-component data refresh
// ══════════════════════════════════════

export type DataChangeType = 'tasks' | 'vault' | 'plan' | 'memory' | 'all';

const EVENT_NAME = 'void:data-changed';

interface DataChangedDetail {
  type: DataChangeType;
  source: string;
}

/**
 * Emit a data-changed event so dashboards can refresh
 */
export function emitDataChanged(type: DataChangeType, source: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<DataChangedDetail>(EVENT_NAME, {
      detail: { type, source },
    })
  );
}

/**
 * Subscribe to data-changed events. Returns a cleanup function.
 */
export function onDataChanged(
  callback: (type: DataChangeType, source: string) => void,
  filter?: DataChangeType
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: Event) => {
    const detail = (e as CustomEvent<DataChangedDetail>).detail;
    if (!filter || filter === 'all' || detail.type === filter || detail.type === 'all') {
      callback(detail.type, detail.source);
    }
  };

  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}

/**
 * Map a tool name to a DataChangeType
 */
export function toolToEventType(toolName: string): DataChangeType | null {
  if (toolName.startsWith('task_')) return 'tasks';
  if (toolName.startsWith('plan_')) return 'plan';
  if (toolName.startsWith('vault_')) return 'vault';
  if (toolName === 'save_note' || toolName === 'log_entry') return 'vault';
  if (toolName === 'save_memory') return 'memory';
  return null;
}
