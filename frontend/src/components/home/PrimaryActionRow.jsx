import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import { speakText } from '../../utils/voiceAssistant';
import heroEwastePickupImg from '../../assets/images/hero_ewaste_pickup.jpg';

export default function PrimaryActionRow() {
  const { lang, t } = useLanguage();
  const { setActiveTab, setVoiceModalOpen } = useAppData();

  const actions = [
    {
      id: 'sell_lot',
      label: t('sellLot'),
      icon: '📦',
      onClick: () => setActiveTab('sell')
    },
    {
      id: 'call_bot',
      label: t('callBot'),
      icon: '🎙️',
      onClick: () => {
        setVoiceModalOpen(true);
        speakText(t('voiceBotPrompt'), lang);
      }
    },
    {
      id: 'history',
      label: t('history'),
      icon: '📋',
      onClick: () => setActiveTab('history')
    },
    {
      id: 'nearby',
      label: t('nearbyRecyclers'),
      icon: '🏬',
      onClick: () => setActiveTab('community')
    }
  ];

  return (
    <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Real-world Hero Photo Banner for Immediate Visual Understanding */}
      <div 
        onClick={() => setActiveTab('sell')}
        className="hero-photo-card btn-press card-hover"
        style={{ height: '150px', cursor: 'pointer' }}
      >
        <img
          src={heroEwastePickupImg}
          alt="Scrap Doorstep Collection Service"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div className="hero-photo-overlay">
          <div style={{
            alignSelf: 'flex-start',
            backgroundColor: 'var(--primary-blue)',
            color: '#FFFFFF',
            padding: '3px 10px',
            borderRadius: '20px',
            fontSize: '0.72rem',
            fontWeight: 800,
            marginBottom: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {t('heroFastPickup')}
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 900, textShadow: '0 2px 4px rgba(0,0,0,0.5)', margin: 0 }}>
            {t('heroBannerTitle')}
          </h3>
          <p style={{ fontSize: '0.8rem', opacity: 0.95, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
            {t('heroBannerSub')}
          </p>
        </div>
      </div>

      {/* Primary Action Buttons Grid */}
      <div className="card glass-card" style={{
        padding: '12px 8px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px'
      }}>
        {actions.map(act => (
          <button
            key={act.id}
            onClick={act.onClick}
            className="btn-press"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(59, 130, 246, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              cursor: 'pointer',
              padding: '10px 4px',
              minHeight: '64px'
            }}
          >
            <span style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{act.icon}</span>
            <span style={{
              fontSize: '0.76rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              textAlign: 'center',
              lineHeight: 1.1
            }}>
              {act.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
