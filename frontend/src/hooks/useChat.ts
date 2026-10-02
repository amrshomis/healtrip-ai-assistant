'use client';

import { useState, useCallback } from 'react';
import { ChatMessage, ToolResultDisplay } from '@/lib/types';
import { sendChatMessage } from '@/lib/api';

let messageIdCounter = 0;
function generateId() {
  return `msg-${Date.now()}-${messageIdCounter++}`;
}

export function useChat(lang: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>();

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        // Build message history for API (without ids/timestamps)
        const apiMessages = [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await sendChatMessage(apiMessages, lang, conversationId);

        const assistantMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: response.reply,
          toolResults: response.toolResults,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setConversationId(response.conversationId);
      } catch (err: any) {
        setError(err.message || 'Failed to send message');
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, lang, conversationId]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setConversationId(undefined);
  }, []);

  return { messages, isLoading, error, sendMessage, clearChat };
}
