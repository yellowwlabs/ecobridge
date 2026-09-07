import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { MapPin, Camera, Clock, QrCode, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { speakText } from '../../utils/voiceAssistant';

export default function HandoverScreen({ material, weightKg, totalValuation, recycler, photoUrl, onBack, onProceedPayment }) {
  const { lang, t, getLangText } = useLanguage();
  const [otp, setOtp] = useState('8921');
  const [isGpsVerified, setIsGpsVerified] = useState(true);

  const timestampStr = new Date().toLocaleString(lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN');
  const gpsCoords = `Okhla Phase 2 (${t('verifiedShield')} GPS)`;

  const handleConfirmHandover = () => {
    speakText(`${t('confirm_handover')} - ${t('accepted')}`, lang);
    onProceedPayment({
      gps: gpsCoords,
      timestamp: timestampStr,
      otpVerified: true
    });
  };

  return (
    <div className="card" style={{ padding: '20px' }}>
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer',
          marginBottom: '10px', fontSize: '0.9rem', fontWeight: 700
        }}
      >
        <ArrowLeft size={18} /> {t('back')}
      </button>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '2px' }}>
        🤝 {t('handoverChecklistTitle')}
      </h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
        {t('confirm_handover')}
      </p>

      {/* Handover Details Box */}
      <div style={{
        backgroundColor: 'var(--bg-neutral)',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '20px',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', gap: '14px', marginBottom: '14px' }}>
          <div className="photo-mount" style={{ width: '80px', height: '80px', flexShrink: 0 }}>
            <img src={photoUrl} alt="Scrap Handover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-blue)' }}>
              #LOT-{Math.floor(1000 + Math.random() * 9000)}
            </span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {getLangText(material.name)} • {weightKg} kg
            </h3>
            <div className="numeral-huge" style={{ fontSize: '1.3rem', color: 'var(--success-green)', marginTop: '2px' }}>
              ₹{totalValuation.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Traceability Metadata Stamps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 700 }}>
            <MapPin size={16} color="var(--success-green)" />
            <span>GPS: {gpsCoords}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 700 }}>
            <Clock size={16} color="var(--accent-cyan)" />
            <span>{timestampStr}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 700 }}>
            <ShieldCheck size={16} color="var(--success-green)" />
            <span>{recycler.name} ({t('verifiedShield')})</span>
          </div>
        </div>
      </div>

      {/* OTP / QR Code Verification Box */}
      <div style={{
        padding: '16px',
        borderRadius: '16px',
        backgroundColor: 'rgba(0, 185, 241, 0.08)',
        border: '2px dashed var(--accent-cyan)',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <QrCode size={20} /> Handover OTP:
        </div>
        <div className="numeral-huge" style={{ fontSize: '2.5rem', letterSpacing: '6px', color: 'var(--primary-blue)' }}>
          {otp}
        </div>
      </div>

      {/* Confirm Button */}
      <button
        onClick={handleConfirmHandover}
        style={{
          width: '100%',
          backgroundColor: 'var(--success-green)',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '16px',
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
        {t('confirm_handover')} <ArrowRight size={20} />
      </button>
    </div>
  );
}
