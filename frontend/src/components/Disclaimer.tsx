'use client';

import { useLanguage } from '@/hooks/useLanguage';

export default function Disclaimer() {
  const { t } = useLanguage();

  return (
    <div className="disclaimer">
      <p>{t('disclaimer')}</p>
    </div>
  );
}
