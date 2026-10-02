'use client';

import { useLanguage } from '@/hooks/useLanguage';
import { DoctorInfo } from '@/lib/types';

interface DoctorCardProps {
  doctor: DoctorInfo;
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const { lang, t } = useLanguage();
  const isAr = lang === 'ar';

  return (
    <div className="doctor-card">
      <div className="card-header">
        <div className="card-avatar">👨‍⚕️</div>
        <div>
          <h4 className="card-name">{isAr ? doctor.nameAr : doctor.name}</h4>
          <span className="card-specialty">
            {isAr ? doctor.specialtyAr : doctor.specialty}
          </span>
        </div>
        <div className="card-rating">⭐ {doctor.rating}</div>
      </div>
      <div className="card-details">
        <div className="card-detail">
          <span className="detail-label">{t('experience')}:</span>
          <span>{doctor.yearsExperience} {isAr ? 'سنة' : 'years'}</span>
        </div>
        <div className="card-detail">
          <span className="detail-label">{t('languages')}:</span>
          <span>{doctor.languages.join(', ')}</span>
        </div>
        {doctor.consultationFee && (
          <div className="card-detail">
            <span className="detail-label">{t('fee')}:</span>
            <span>${doctor.consultationFee}</span>
          </div>
        )}
        {doctor.hospitals && doctor.hospitals.length > 0 && (
          <div className="card-detail">
            <span className="detail-label">{t('hospital')}:</span>
            <span>
              {doctor.hospitals
                .map((h) => `${isAr ? h.nameAr : h.name}, ${isAr ? h.cityAr : h.city}`)
                .join(' | ')}
            </span>
          </div>
        )}
      </div>
      <p className="card-bio">{isAr ? doctor.bioAr : doctor.bio}</p>
    </div>
  );
}
