import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import { speakText } from '../../utils/voiceAssistant';
import { Mic } from 'lucide-react';

export default function VoiceBotFAB() {
  const { lang, t } = useLanguage();
  const { setVoiceModalOpen } = useAppData();

  const handleFabClick = () => {
    setVoiceModalOpen(true);
    speakText(t('voiceBotPrompt'), lang);
  };

  return (
    <button
      onClick={handleFabClick}
      className="mic-pulse btn-press"
      title={t('callBot')}
      aria-label={t('callBot')}
      style={{
        position: 'fixed',
        bottom: '76px',
        right: '16px',
        width: '54px',
        height: '54px',
        borderRadius: '50%',
        backgroundColor: 'var(--primary-accent)',
        color: '#FFFFFF',
        border: '2px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 90,
        cursor: 'pointer'
      }}
    >
      <Mic size={26} color="#FFFFFF" />
    </button>
  );
}
