'use client';

import { useLanguage } from '@/hooks/useLanguage';

export default function LanguageToggle() {
  const { lang, toggleLanguage } = useLanguage();

  return (
    <button onClick={toggleLanguage} className="lang-toggle" title="Switch Language">
      {lang === 'en' ? 'عربي' : 'EN'}
    </button>
  );
}
