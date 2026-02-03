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
  // This will be implemented in Layer 7 when we connect to real n8n
  // For now, return mock response

  console.log(`[n8n] Would trigger ${workflow} at ${N8N_BASE}/${workflow}:`, payload);

  // Mock responses based on workflow type
  switch (workflow) {
    case 'plan':
      return {
        success: true,
        mock: true,
        data: {
          message: 'Daily plan created',
          file: `01-Daily/${new Date().toISOString().split('T')[0]}.md`,
        },
      };

    case 'log':
      return {
        success: true,
        mock: true,
        data: {
          message: 'Log entry added',
          timestamp: new Date().toISOString(),
        },
      };

    case 'email':
      return {
        success: true,
        mock: true,
        data: {
          action: payload.action || 'read',
          count: 5,
        },
      };

    case 'remind':
      return {
        success: true,
        mock: true,
        data: {
          message: 'Reminder scheduled',
          scheduledFor: payload.time,
        },
      };

    case 'crm':
      return {
        success: true,
        mock: true,
        data: {
          deals: 3,
          pipeline: 'mock',
        },
      };

    case 'memory':
      return {
        success: true,
        mock: true,
        data: {
          message: 'Memory saved',
          type: payload.type,
        },
      };

    case 'health':
      return {
        success: true,
        mock: true,
        data: {
          n8n: 'healthy',
          workflows: 13,
        },
      };

    default:
      return {
        success: true,
        mock: true,
        data: { workflow, payload },
      };
  }
}

/**
 * Check n8n health status
 * @returns Health status
 */
export async function health(): Promise<{ status: string; workflows: number }> {
  console.log('[n8n] Would check health at:', N8N_BASE);

  return {
    status: 'mock',
    workflows: 13,
  };
}

export { N8N_BASE };
