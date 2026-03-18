// ══════════════════════════════════════
// VOID — Settings API
// GET/POST settings configuration
// ══════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { getSetting, setSetting, getAllSettings } from '@/lib/db';
import { PROVIDER_CONFIGS } from '@/lib/ai/types';
import type { ProviderType } from '@/lib/ai/types';

export async function GET() {
  try {
    const settings = getAllSettings();
    const currentProvider = (settings.ai_provider as ProviderType) || 'claude';
    const currentModel = settings.ai_model || PROVIDER_CONFIGS[currentProvider].defaultModel;

    return NextResponse.json({
      provider: currentProvider,
      model: currentModel,
      providers: Object.values(PROVIDER_CONFIGS).map(p => ({
        type: p.type,
        displayName: p.displayName,
        models: p.models,
        defaultModel: p.defaultModel,
        hasApiKey: !!process.env[p.apiKeyEnvVar],
      })),
    });
  } catch (error) {
    console.error('[API/settings] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to get settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, model } = body as { provider?: ProviderType; model?: string };

    if (provider) {
      if (!PROVIDER_CONFIGS[provider]) {
        return NextResponse.json(
          { error: 'Invalid provider' },
          { status: 400 }
        );
      }
      setSetting('ai_provider', provider);
    }

    if (model) {
      setSetting('ai_model', model);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API/settings] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
