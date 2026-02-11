// ══════════════════════════════════════
// VOID — n8n Webhook Helper
// ══════════════════════════════════════

const N8N_BASE = process.env.N8N_WEBHOOK_BASE || 'http://localhost:5678/webhook';

type WorkflowType =
  | 'plan'
  | 'log'
  | 'search'
  | 'email'
  | 'remind'
  | 'crm'
  | 'memory'
  | 'health';

interface WorkflowResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  mock?: boolean;
}

/**
 * Trigger an n8n workflow via webhook
 * @param workflow - Workflow name/endpoint
 * @param payload - Data to send to the workflow
 * @returns Workflow response
 */
export async function triggerWorkflow(
  workflow: WorkflowType,
  payload: Record<string, unknown>
): Promise<WorkflowResponse> {
  const url = `${N8N_BASE}/${workflow}`;

  // Transform payload to match workflow expectations
  let transformedPayload = payload;
  if (workflow === 'log' && payload.entry) {
    transformedPayload = { text: payload.entry };
  }

  console.log(`[n8n] Triggering ${workflow} at ${url}:`, transformedPayload);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transformedPayload),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      console.error(`[n8n] ${workflow} failed:`, response.status);
      return {
        success: false,
        error: `HTTP ${response.status}`,
      };
    }

    const data = await response.json().catch(() => ({}));
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(`[n8n] ${workflow} error:`, error);
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Check n8n health status
 * @returns Health status
 */
export async function health(): Promise<{ status: string; workflows?: number }> {
  try {
    const response = await fetch(`${N8N_BASE}/health-check`, {
      signal: AbortSignal.timeout(5_000),
    });
    if (response.ok) {
      const data = await response.json();
      return {
        status: 'healthy',
        workflows: data.services ? 3 : 0,
      };
    }
    return { status: 'unhealthy' };
  } catch {
    return { status: 'unreachable' };
  }
}

export { N8N_BASE };
