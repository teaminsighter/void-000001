// ══════════════════════════════════════
// VOID — AI Provider Factory
// Multi-provider support with runtime switching
// ══════════════════════════════════════

import { getSetting } from '@/lib/db';
import { BaseProvider } from './base-provider';
import { ClaudeProvider } from './claude';
import type { ProviderType, ProviderStatus } from './types';

// Lazy-loaded providers to avoid import errors when SDKs aren't installed
let openaiProvider: BaseProvider | null = null;
let geminiProvider: BaseProvider | null = null;
let claudeProvider: BaseProvider | null = null;

function getClaudeProvider(): BaseProvider {
  if (!claudeProvider) {
    claudeProvider = new ClaudeProvider();
  }
  return claudeProvider;
}

async function getOpenAIProvider(): Promise<BaseProvider> {
  if (!openaiProvider) {
    const { OpenAIProvider } = await import('./openai');
    openaiProvider = new OpenAIProvider();
  }
  return openaiProvider;
}

async function getGeminiProvider(): Promise<BaseProvider> {
  if (!geminiProvider) {
    const { GeminiProvider } = await import('./gemini');
    geminiProvider = new GeminiProvider();
  }
  return geminiProvider;
}

/**
 * Get a provider instance by type
 */
export async function getProvider(type?: ProviderType): Promise<BaseProvider> {
  const providerType = type || (getSetting('ai_provider') as ProviderType) || 'claude';

  switch (providerType) {
    case 'openai':
      return getOpenAIProvider();
    case 'gemini':
      return getGeminiProvider();
    case 'claude':
    default:
      return getClaudeProvider();
  }
}

/**
 * Get the currently configured provider
 */
export async function getCurrentProvider(): Promise<BaseProvider> {
  return getProvider();
}

/**
 * Get the current provider type from settings
 */
export function getCurrentProviderType(): ProviderType {
  return (getSetting('ai_provider') as ProviderType) || 'claude';
}

/**
 * Check status of all providers
 */
export async function checkAllProviders(): Promise<Record<ProviderType, ProviderStatus>> {
  const results: Record<ProviderType, ProviderStatus> = {
    claude: { connected: false, error: 'Not checked' },
    openai: { connected: false, error: 'Not checked' },
    gemini: { connected: false, error: 'Not checked' },
  };

  // Check Claude
  try {
    const claude = getClaudeProvider();
    results.claude = await claude.checkStatus();
  } catch (error) {
    results.claude = { connected: false, error: String(error), errorType: 'unknown' };
  }

  // Check OpenAI
  try {
    const openai = await getOpenAIProvider();
    results.openai = await openai.checkStatus();
  } catch (error) {
    results.openai = { connected: false, error: 'SDK not installed', errorType: 'unknown' };
  }

  // Check Gemini
  try {
    const gemini = await getGeminiProvider();
    results.gemini = await gemini.checkStatus();
  } catch (error) {
    results.gemini = { connected: false, error: 'SDK not installed', errorType: 'unknown' };
  }

  return results;
}

// Re-export types and utilities
export type { ProviderType, ProviderStatus } from './types';
export { PROVIDER_CONFIGS } from './types';
export { BaseProvider } from './base-provider';
