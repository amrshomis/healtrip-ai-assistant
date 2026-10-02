'use client';

import { useRef, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useChat } from '@/hooks/useChat';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import LanguageToggle from './LanguageToggle';
import Disclaimer from './Disclaimer';

export default function ChatContainer() {
  const { lang, t, dir } = useLanguage();
  const { messages, isLoading, error, sendMessage, clearChat } = useChat(lang);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="chat-app" dir={dir}>
      {/* Header */}
      <header className="chat-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">🏥</span>
            <div>
              <h1 className="logo-title">HealTrip AI</h1>
              <p className="logo-subtitle">{t('subtitle')}</p>
            </div>
          </div>
        </div>
        <div className="header-right">
          <button className="new-chat-btn" onClick={clearChat}>
            {t('newChat')}
          </button>
          <LanguageToggle />
        </div>
      </header>

      {/* Disclaimer */}
      <Disclaimer />

      {/* Messages Area */}
      <main className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-screen">
            <div className="welcome-icon">🏥</div>
            <h2>{t('welcome')}</h2>
            <p>{t('subtitle')}</p>
            <div className="example-prompts">
              <button
                className="example-prompt"
                onClick={() => sendMessage('I have chest pain and I\'m not sure whether I should see a cardiologist, go to the ER, or seek a second opinion.')}
              >
                💓 Chest pain — should I see a cardiologist or go to the ER?
              </button>
              <button
                className="example-prompt"
                onClick={() => sendMessage('I have been having persistent headaches for the past week and some numbness in my left hand.')}
              >
                🧠 Persistent headaches with numbness
              </button>
              <button
                className="example-prompt"
                onClick={() => sendMessage('عندي ألم في الركبة من شهر ومحتاج أعرف أفضل دكتور عظام')}
              >
                🦴 ألم في الركبة — أفضل دكتور عظام
              </button>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && <TypingIndicator />}

        {error && (
          <div className="error-banner">
            <p>❌ {error}</p>
            <button className="retry-btn" onClick={() => {}}>
              {t('retry')}
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <footer className="chat-footer">
        <ChatInput onSend={sendMessage} disabled={isLoading} />
        <p className="powered-by">{t('poweredBy')}</p>
      </footer>
    </div>
  );
}
