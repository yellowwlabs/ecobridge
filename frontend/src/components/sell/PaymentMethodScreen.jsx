import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Banknote, QrCode, CheckCircle2, ArrowLeft } from 'lucide-react';
import { speakText } from '../../utils/voiceAssistant';

export default function PaymentMethodScreen({ material, weightKg, totalValuation, recycler, onBack, onCompletePayment }) {
  const { lang, t, getLangText } = useLanguage();
  const [selectedMethod, setSelectedMethod] = useState('Cash');

  const handleFinish = () => {
    speakText(`${t('convertSuccessToast')} ₹${totalValuation}`, lang);
    onCompletePayment(selectedMethod);
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
        💰 {t('paymentMethodTitle')}
      </h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
        {getLangText(material.name)} • {weightKg} kg • ₹{totalValuation.toLocaleString()}
      </p>

      {/* Two Equal-Weight Payment Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        {/* Cash Option */}
        <button
          onClick={() => setSelectedMethod('Cash')}
          className="touch-target"
          style={{
            padding: '16px',
            borderRadius: '16px',
            backgroundColor: selectedMethod === 'Cash' ? 'rgba(46, 125, 50, 0.08)' : 'var(--surface)',
            border: selectedMethod === 'Cash' ? '2.5px solid var(--success-green)' : '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: selectedMethod === 'Cash' ? '0 4px 14px rgba(46, 125, 50, 0.2)' : 'none'
          }}
        >
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            backgroundColor: 'var(--success-green)', color: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Banknote size={26} />
          </div>
          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            💵 {t('cashPayment')}
          </span>
        </button>

        {/* UPI Option */}
        <button
          onClick={() => setSelectedMethod('UPI')}
          className="touch-target"
          style={{
            padding: '16px',
            borderRadius: '16px',
            backgroundColor: selectedMethod === 'UPI' ? 'rgba(0, 185, 241, 0.08)' : 'var(--surface)',
            border: selectedMethod === 'UPI' ? '2.5px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: selectedMethod === 'UPI' ? '0 4px 14px rgba(0, 185, 241, 0.2)' : 'none'
          }}
        >
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            backgroundColor: 'var(--accent-cyan)', color: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <QrCode size={26} />
          </div>
          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            📱 {t('upiPayment')}
          </span>
        </button>
      </div>

      <div style={{
        padding: '14px',
        borderRadius: '12px',
        backgroundColor: 'var(--bg-neutral)',
        marginBottom: '20px',
        fontSize: '0.88rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <CheckCircle2 size={20} color="var(--success-green)" />
        <span>
          {selectedMethod === 'Cash' ? t('cashPayment') : t('upiPayment')}
        </span>
      </div>

      <button
        onClick={handleFinish}
        style={{
          width: '100%',
          backgroundColor: 'var(--success-green)',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '16px',
          padding: '14px',
          fontWeight: 800,
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: 'pointer'
        }}
      >
        🎉 {t('confirm')}
      </button>
    </div>
  );
}
