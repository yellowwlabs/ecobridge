import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import { BatteryCharging, ShieldAlert, ArrowRight } from 'lucide-react';
import ewasteHeroBannerImg from '../../assets/images/ewaste_hero_banner.jpg';

export default function BatteryRecoveryCard() {
  const { t } = useLanguage();
  const { setActiveTab, triggerSafetyWarning } = useAppData();

  const handleStartBatteryFlow = () => {
    triggerSafetyWarning('battery_acid');
    setActiveTab('sell');
  };

  return (
    <div className="hero-photo-card card-hover btn-press" style={{ marginBottom: '16px', height: '140px', cursor: 'pointer' }} onClick={handleStartBatteryFlow}>
      <img
        src={ewasteHeroBannerImg}
        alt="Safe Battery & E-Waste Recovery"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <div className="hero-photo-overlay">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }}>
          <div>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              backgroundColor: 'var(--signal-red)',
              color: '#FFFFFF',
              padding: '2px 8px',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              marginBottom: '4px'
            }}>
              <ShieldAlert size={12} /> {t('batteryTitle')}
            </span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
              {t('batteryCardHeadline')}
            </h3>
            <p style={{ fontSize: '0.78rem', opacity: 0.95, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
              {t('batteryDesc')}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStartBatteryFlow();
            }}
            className="btn-press"
            style={{
              minHeight: '38px',
              minWidth: '40px',
              padding: '6px 12px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary-accent)',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            {t('tabSell')} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
