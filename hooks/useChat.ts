// ══════════════════════════════════════
// VOID — Chat State Hook
// ══════════════════════════════════════

import { useState, useCallback } from 'react';
import type { Message, ChatState } from '@/lib/types';

interface UseChatOptions {
  initialMessages?: Message[];
}

interface UseChatReturn extends ChatState {
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  setError: (error: string | null) => void;
}

/**
 * Hook for managing chat state and interactions
 */
export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>(options.initialMessages || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // In Layer 4, this will call the real API
      // For now, simulate a response
      await new Promise(resolve => setTimeout(resolve, 1000));

      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `Processing: "${content.substring(0, 50)}..."

I've analyzed your request. Here's what I'll do:

1. Search vault for related context via Khoj
2. Execute the appropriate n8n workflow
3. Save results to your vault
4. Confirm completion

✓ Action queued. (This is a mock response - real API in Layer 4)`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    setError,
  };
}

export default useChat;
