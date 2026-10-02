'use client';

import { LanguageProvider } from '@/hooks/useLanguage';
import ChatContainer from '@/components/ChatContainer';

export default function Home() {
  return (
    <LanguageProvider>
      <ChatContainer />
    </LanguageProvider>
  );
}
