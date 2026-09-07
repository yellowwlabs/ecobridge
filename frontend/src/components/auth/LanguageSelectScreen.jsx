import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, ArrowRight, CheckCircle2 } from 'lucide-react';
import { speakText } from '../../utils/voiceAssistant';

export default function LanguageSelectScreen({ onSelectComplete }) {
  const { lang, setLang, t } = useLanguage();
  const [selectedLang, setSelectedLang] = useState(lang || 'hi');

  const options = [
    { code: 'hi', name: 'हिंदी', nativeName: 'Hindi', description: 'हिंदी में उपयोग करें', voiceGreeting: 'नमस्ते! हिंदी भाषा चुनी गई।' },
    { code: 'mr', name: 'मराठी', nativeName: 'Marathi', description: 'मराठीत वापरा', voiceGreeting: 'नमस्कार! मराठी भाषा निवडली.' },
    { code: 'en', name: 'English', nativeName: 'English', description: 'Use in English', voiceGreeting: 'English language selected.' }
  ];

  const handleConfirmLanguage = () => {
    const opt = options.find(o => o.code === selectedLang) || options[0];
    setLang(selectedLang);
    localStorage.setItem('kabadiwala_lang', selectedLang);
    speakText(opt.voiceGreeting, selectedLang);
    onSelectComplete();
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-neutral)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px 16px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div className="card fade-in-up" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '28px 20px',
        borderRadius: '20px',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#E0F2FE',
            color: '#00246B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px auto'
          }}>
            <Globe size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#00246B', margin: '0 0 6px 0' }}>
            Select Language
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0, fontWeight: 600 }}>
            Choose your preferred language / अपनी भाषा चुनें
          </p>
        </div>

        {/* Language Options List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {options.map((opt) => {
            const isSelected = selectedLang === opt.code;
            return (
              <button
                key={opt.code}
                onClick={() => setSelectedLang(opt.code)}
                className="touch-target"
                style={{
                  width: '100%',
                  padding: '16px 18px',
                  borderRadius: '14px',
                  backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                  border: isSelected ? '2px solid #00246B' : '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.18s ease'
                }}
              >
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>
                    {opt.name} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748B' }}>({opt.nativeName})</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                    {opt.description}
                  </span>
                </div>

                {isSelected ? (
                  <CheckCircle2 size={26} color="#00246B" />
                ) : (
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid #CBD5E1' }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Primary CTA to proceed to Home */}
        <button
          onClick={handleConfirmLanguage}
          className="btn-press"
          style={{
            width: '100%',
            minHeight: '52px',
            backgroundColor: '#00246B',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '12px',
            padding: '14px',
            fontWeight: 800,
            fontSize: '1.05rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          Continue to Home <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
