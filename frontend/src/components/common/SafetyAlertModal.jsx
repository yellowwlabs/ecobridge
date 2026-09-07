import React, { useEffect } from 'react';
import ModalShell from './ModalShell';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import { ShieldAlert, CheckCircle2, Volume2 } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import { speakText, stopSpeaking } from '../../utils/voiceAssistant';

export default function SafetyAlertModal() {
  const { lang, t, getLangText } = useLanguage();
  const { safetyModalOpen, setSafetyModalOpen, activeSafetyItem } = useAppData();

  // Speak safety instructions aloud automatically when safety modal opens
  useEffect(() => {
    if (safetyModalOpen && activeSafetyItem) {
      stopSpeaking();
      const spokenText = getLangText(activeSafetyItem.audio) || getLangText(activeSafetyItem.description);
      speakText(spokenText, lang);
    } else {
      stopSpeaking();
    }
  }, [safetyModalOpen, activeSafetyItem, lang, getLangText]);

  if (!activeSafetyItem) return null;

  const handleDismiss = () => {
    triggerHaptic('light');
    stopSpeaking();
    setSafetyModalOpen(false);
  };

  const handleReListen = () => {
    stopSpeaking();
    const spokenText = getLangText(activeSafetyItem.audio) || getLangText(activeSafetyItem.description);
    speakText(spokenText, lang);
  };

  return (
    <ModalShell isOpen={safetyModalOpen} onClose={handleDismiss} zIndex={1100}>
      <div className="card safety-card" style={{
        width: '100%',
        maxWidth: '420px',
        position: 'relative',
        padding: '24px 20px',
        borderRadius: '24px',
        border: '3px solid var(--signal-red)',
        boxShadow: '0 0 30px rgba(178,58,58,0.4)',
        background: 'var(--bg-primary, #FFFFFF)'
      }}>
        {/* Header with Red Warning Icon & Re-Listen Speaker */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              backgroundColor: 'var(--signal-red)', color: '#FFFFFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ShieldAlert size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--signal-red)', margin: 0 }}>
                ⚠️ {getLangText(activeSafetyItem.title)}
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {t('safetyTips')}
              </span>
            </div>
          </div>

          {/* Re-Listen Speaker Icon Button */}
          <button
            onClick={handleReListen}
            className="btn-press"
            title="Read guidance aloud"
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              backgroundColor: 'var(--signal-red)',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <Volume2 size={16} />
            <span>Listen</span>
          </button>
        </div>

        {/* Pictorial Guidance Illustration (Section 3.1) */}
        <div className="photo-mount" style={{ marginBottom: '16px', maxHeight: '180px' }}>
          <img
            src={activeSafetyItem.image}
            alt="Safety instruction"
            style={{ width: '100%', height: '180px', objectFit: 'cover' }}
          />
        </div>

        {/* Instruction Guidance Box */}
        <div style={{
          backgroundColor: 'rgba(178,58,58,0.08)',
          borderLeft: '4px solid var(--signal-red)',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <p style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)', whiteSpace: 'pre-line', margin: 0 }}>
            {getLangText(activeSafetyItem.description)}
          </p>
        </div>

        {/* Accept/Dismiss Button */}
        <button
          onClick={handleDismiss}
          style={{
            width: '100%',
            backgroundColor: 'var(--emerald-success)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '16px',
            padding: '14px',
            fontWeight: 800,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          <CheckCircle2 size={20} />
          {t('understand_safety')}
        </button>
      </div>
    </ModalShell>
  );
}
