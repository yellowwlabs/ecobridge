import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import { SAFETY_DATA } from '../../data/safetyData';
import { ShieldAlert, Volume2 } from 'lucide-react';
import { speakText, stopSpeaking } from '../../utils/voiceAssistant';
import { triggerHaptic } from '../../utils/haptics';

export default function SafetyTipsCarousel() {
  const { lang, t, getLangText } = useLanguage();
  const { triggerSafetyWarning } = useAppData();

  const handleSpeakTip = (e, item) => {
    e.stopPropagation();
    triggerHaptic('medium');
    stopSpeaking();
    const text = getLangText(item.audio) || getLangText(item.description);
    speakText(text, lang);
  };

  return (
    <div className="card" style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--alert-red)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          🛡️ {t('safetyTips')}
        </h2>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {t('viewAll')}
        </span>
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        overflowX: 'auto',
        paddingBottom: '8px'
      }}>
        {SAFETY_DATA.map(item => (
          <div
            key={item.id}
            onClick={() => triggerSafetyWarning(item.id)}
            style={{
              minWidth: '210px',
              borderRadius: '14px',
              backgroundColor: 'var(--bg-neutral)',
              border: '2px solid var(--alert-red)',
              overflow: 'hidden',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}
          >
            {/* 3-Image Photo Sequence Card Mount */}
            <div className="photo-mount" style={{ height: '110px', borderRadius: 0, position: 'relative' }}>
              <img
                src={item.image}
                alt="Safety illustration"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Speaker TTS Icon Button */}
              <button
                onClick={(e) => handleSpeakTip(e, item)}
                className="btn-press"
                title="Listen tip aloud"
                aria-label={`Listen tip ${getLangText(item.title)}`}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(239, 68, 68, 0.9)',
                  color: '#FFFFFF',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  zIndex: 2
                }}
              >
                <Volume2 size={16} />
              </button>
            </div>

            <div style={{ padding: '10px 12px' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--alert-red)', marginBottom: '4px' }}>
                ⚠️ {getLangText(item.title)}
              </h4>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                {t('listening_required')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
