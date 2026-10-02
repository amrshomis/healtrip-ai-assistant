'use client';

import React, { useState, SyntheticEvent } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const { t } = useLanguage();

  function handleSubmit(e?: SyntheticEvent) {
    if (e) e.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  }

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="chat-input"
        placeholder={t('placeholder')}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        // Removed autoFocus as it can cause keyboard issues on some mobile browsers
      />
      <button
        type="button" // Changed from submit to button for explicit touch handling
        className="send-button"
        disabled={disabled || !input.trim()}
        onClick={handleSubmit} // Explicit click handler for mobile
        onTouchEnd={(e) => { // Explicit touch handler for mobile
          e.preventDefault();
          handleSubmit();
        }}
      >
        {disabled ? t('thinking') : t('send')}
      </button>
    </form>
  );
}
