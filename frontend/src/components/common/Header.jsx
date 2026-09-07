import React, { useState } from 'react';
import ModalShell from './ModalShell';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import { Sun, Moon, RefreshCw, X, ShieldCheck, UserCheck, Mic, Volume2 } from 'lucide-react';
import ecobridgeIcon from '../../assets/images/ecobridge_icon.png';
import { speakText, stopSpeaking } from '../../utils/voiceAssistant';

export default function Header({ onOpenAccount }) {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const { activeRole, setActiveRole, isOffline, setIsOffline, userProfile, setVoiceModalOpen } = useAppData();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
  const [targetRoleLabel, setTargetRoleLabel] = useState('');

  const displayName = userProfile?.name || (activeRole === 'collector' ? 'Raju (Vendor)' : 'Green Recycler');
  const displayArea = userProfile?.operatingArea || 'Okhla Phase 2';
  const initialChar = displayName ? displayName.charAt(0).toUpperCase() : 'E';
  const userPhoto = userProfile?.photo || userProfile?.avatar || userProfile?.avatarUrl;

  const handleRoleSwitch = (newRole) => {
    if (newRole === activeRole) return;
    setTargetRoleLabel(newRole === 'recycler' ? t('switchRoleRecycler') : t('switchRoleCollector'));
    setIsSwitchingRole(true);
    setShowSettingsModal(false);

    setTimeout(() => {
      setActiveRole(newRole);
      setIsSwitchingRole(false);
    }, 750);
  };

  return (
    <>
      <header className="app-header glass-header" style={{
        backgroundColor: 'var(--primary-deep)',
        color: '#FFFFFF',
        height: '56px',
        padding: '0 16px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 10px rgba(17, 24, 39, 0.12)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Left Side: EcoBridge Icon + Tappable Profile Avatar + Greeting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* 1. EcoBridge Icon Mark (Farthest Left) */}
          <img
            src={ecobridgeIcon}
            alt="EcoBridge"
            style={{
              height: '32px',
              width: '32px',
              objectFit: 'contain',
              borderRadius: '6px',
              flexShrink: 0
            }}
          />

          {/* 2. Tappable Profile Avatar (Opens My Account / Settings & Account) */}
          <div
            onClick={onOpenAccount}
            className="btn-press"
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            title={t('myAccount')}
            aria-label={t('myAccount')}
          >
            {userPhoto ? (
              <img
                src={userPhoto}
                alt={displayName}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--primary-accent)',
                  flexShrink: 0
                }}
              />
            ) : (
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                color: 'var(--primary-deep)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1rem',
                border: '2px solid var(--primary-accent)',
                flexShrink: 0
              }}>
                {initialChar}
              </div>
            )}
          </div>

          {/* 3. Middle: Greeting & Location */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h1 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
                {displayName}
              </h1>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isOffline ? 'var(--amber-pending)' : 'var(--emerald-success)',
                display: 'inline-block'
              }} title={isOffline ? t('status_offline') : t('status_online')} />
            </div>
            <span style={{ fontSize: '0.72rem', opacity: 0.8, display: 'block' }}>
              📍 {displayArea}
            </span>
          </div>
        </div>

        {/* Right Side: Microphone AI Assistant Button (Opens Unified AI Assistant) */}
        <button
          onClick={() => setVoiceModalOpen(true)}
          className="btn-press"
          title="EcoBridge AI Assistant"
          aria-label="Open AI Assistant"
          style={{
            width: '36px',
            height: '36px',
            minWidth: '36px',
            minHeight: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.16)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <Mic size={18} color="#FFFFFF" />
        </button>
      </header>

      {/* Role Switching Overlay Transition */}
      {isSwitchingRole && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          zIndex: 2500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="card fade-in-up" style={{
            width: '100%',
            maxWidth: '320px',
            padding: '24px 20px',
            borderRadius: '20px',
            backgroundColor: 'var(--surface-white, #FFFFFF)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              color: 'var(--primary-accent, #3B82F6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px'
            }}>
              <RefreshCw className="animate-spin" size={28} />
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary, #0F172A)', margin: '0 0 4px 0' }}>
              {targetRoleLabel}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #64748B)', margin: 0, fontWeight: 600 }}>
              Updating workspace & rates...
            </p>
          </div>
        </div>
      )}

      {/* Settings Bottom Sheet Modal */}
      <ModalShell isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)}>
        <div className="card glass-card" style={{
          width: '100%',
          maxWidth: '480px',
          borderRadius: '20px',
          padding: '20px 20px 28px 20px',
          backgroundColor: 'var(--surface-white)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              ⚙️ {t('appSettingsTitle')}
            </h3>
            <button onClick={() => setShowSettingsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
          </div>

          {/* Language Selector */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              🌐 {t('appLanguageLabel')}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { code: 'hi', label: t('langNameHi') },
                { code: 'mr', label: t('langNameMr') },
                { code: 'en', label: t('langNameEn') }
              ].map(item => (
                <button
                  key={item.code}
                  onClick={() => setLang(item.code)}
                  className="btn-press"
                  style={{
                    padding: '10px 4px',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: lang === item.code ? 'var(--primary-accent)' : 'var(--bg-neutral)',
                    color: lang === item.code ? '#FFFFFF' : 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Role Switcher Segmented Control */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              🔄 {t('activeModeLabel')}
            </label>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
              backgroundColor: 'var(--bg-neutral)', padding: '4px', borderRadius: '14px'
            }}>
              <button
                onClick={() => handleRoleSwitch('collector')}
                className="btn-press"
                style={{
                  padding: '10px',
                  borderRadius: '12px',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  backgroundColor: activeRole === 'collector' ? 'var(--surface-white)' : 'transparent',
                  color: activeRole === 'collector' ? 'var(--primary-accent)' : 'var(--text-muted)',
                  boxShadow: activeRole === 'collector' ? 'var(--card-shadow)' : 'none',
                  cursor: 'pointer'
                }}
              >
                🧺 {t('switchRoleCollector')}
              </button>

              <button
                onClick={() => handleRoleSwitch('recycler')}
                className="btn-press"
                style={{
                  padding: '10px',
                  borderRadius: '12px',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  backgroundColor: activeRole === 'recycler' ? 'var(--surface-white)' : 'transparent',
                  color: activeRole === 'recycler' ? 'var(--primary-accent)' : 'var(--text-muted)',
                  boxShadow: activeRole === 'recycler' ? 'var(--card-shadow)' : 'none',
                  cursor: 'pointer'
                }}
              >
                🏭 {t('switchRoleRecycler')}
              </button>
            </div>
          </div>

          {/* FAQ & Guidelines Accordion Trigger */}
          <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <button
              onClick={() => {
                setShowSettingsModal(false);
                setShowFaqModal(true);
              }}
              className="btn-press"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid var(--primary-accent)',
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                color: 'var(--primary-accent)',
                fontWeight: 800,
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              {t('faqSettingsButton')}
            </button>
          </div>
        </div>
      </ModalShell>

      {/* FAQ Interactive Accordion Modal (Section A4.4) */}
      <ModalShell isOpen={showFaqModal} onClose={() => setShowFaqModal(false)} zIndex={1100}>
        <div className="card glass-card" style={{
          width: '100%',
          maxWidth: '440px',
          borderRadius: '20px',
          padding: '20px',
          backgroundColor: 'var(--surface-white)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--primary-accent)', margin: 0 }}>
              💡 {t('faqTitle')}
            </h3>
            <button onClick={() => setShowFaqModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { q: t('faqQ1'), a: t('faqA1') },
              { q: t('faqQ2'), a: t('faqA2') },
              { q: t('faqQ3'), a: t('faqA3') },
              { q: t('faqQ4'), a: t('faqA4') }
            ].map((faq, idx) => (
              <details
                key={idx}
                style={{
                  backgroundColor: 'var(--bg-neutral)',
                  borderRadius: '12px',
                  padding: '12px',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <summary style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{faq.q}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      stopSpeaking();
                      speakText(`${faq.q}। ${faq.a}`, lang);
                    }}
                    className="btn-press"
                    title="Listen aloud"
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(59, 130, 246, 0.12)',
                      color: 'var(--primary-accent)',
                      border: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                      marginLeft: '8px'
                    }}
                  >
                    <Volume2 size={15} />
                  </button>
                </summary>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '8px', marginBottom: 0, lineHeight: 1.4 }}>
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </ModalShell>
    </>
  );
}
