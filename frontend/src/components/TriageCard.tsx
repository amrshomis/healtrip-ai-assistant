'use client';

import { useLanguage } from '@/hooks/useLanguage';
import { TriageInfo } from '@/lib/types';

interface TriageCardProps {
  triage: TriageInfo;
}

export default function TriageCard({ triage }: TriageCardProps) {
  const { t } = useLanguage();

  const urgencyClass =
    triage.urgencyLevel === 'EMERGENCY'
      ? 'urgency-emergency'
      : triage.urgencyLevel === 'URGENT'
      ? 'urgency-urgent'
      : 'urgency-routine';

  return (
    <div className={`triage-card ${urgencyClass}`}>
      <div className="triage-header">
        <span className="triage-icon">
          {triage.urgencyLevel === 'EMERGENCY' ? '🚨' : triage.urgencyLevel === 'URGENT' ? '⚠️' : '✅'}
        </span>
        <span className="triage-level">
          {t('urgency')}: {t(triage.urgencyLevel.toLowerCase())}
        </span>
      </div>
      <div className="triage-details">
        <p><strong>{t('recommended')}:</strong> {triage.recommendedSpecialty}</p>
        {triage.shouldVisitER && (
          <p className="er-warning">🚑 {t('visitER')}</p>
        )}
        <p className="triage-reasoning">{triage.reasoning}</p>
      </div>
    </div>
  );
}
