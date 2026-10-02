'use client';

import { useLanguage } from '@/hooks/useLanguage';
import { HospitalInfo } from '@/lib/types';

interface HospitalCardProps {
  hospital: HospitalInfo;
}

export default function HospitalCard({ hospital }: HospitalCardProps) {
  const { lang, t } = useLanguage();
  const isAr = lang === 'ar';

  return (
    <div className="hospital-card">
      <div className="card-header">
        <div className="card-avatar">🏥</div>
        <div>
          <h4 className="card-name">{isAr ? hospital.nameAr : hospital.name}</h4>
          <span className="card-location">
            {isAr ? hospital.cityAr : hospital.city}, {isAr ? hospital.countryAr : hospital.country}
          </span>
        </div>
        <div className="card-rating">⭐ {hospital.rating}</div>
      </div>
      <div className="card-details">
        {hospital.accreditation && (
          <div className="card-detail">
            <span className="detail-label">{t('accreditation')}:</span>
            <span className="badge">{hospital.accreditation}</span>
          </div>
        )}
        <div className="card-detail">
          <span className="detail-label">{t('specialty')}:</span>
          <span>{hospital.specialties.join(', ')}</span>
        </div>
        <div className="card-detail">
          <span className="detail-label">{t('doctors')}:</span>
          <span>{hospital.doctorCount} {isAr ? 'أطباء' : 'doctors available'}</span>
        </div>
      </div>
    </div>
  );
}
