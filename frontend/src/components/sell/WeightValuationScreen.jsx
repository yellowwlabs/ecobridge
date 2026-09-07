import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Delete, ArrowRight, ArrowLeft } from 'lucide-react';

export default function WeightValuationScreen({ material, photoUrl, onBack, onProceed }) {
  const { t, getLangText } = useLanguage();
  const [weightStr, setWeightStr] = useState('12.5');

  const weightNum = parseFloat(weightStr) || 0;
  const totalValuation = Math.round(weightNum * material.rate);

  const handleKeyPress = (val) => {
    if (val === 'backspace') {
      setWeightStr(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else if (val === '.') {
      if (!weightStr.includes('.')) setWeightStr(prev => prev + '.');
    } else {
      setWeightStr(prev => (prev === '0' ? val : prev + val));
    }
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
        ⚖️ {t('enterWeightBtn')}
      </h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
        {getLangText(material.name)} • ₹{material.rate}/{material.unit}
      </p>

      {/* Large Numerical Weight Display Card */}
      <div style={{
        backgroundColor: 'var(--bg-neutral)',
        borderRadius: '16px',
        padding: '16px',
        textAlign: 'center',
        marginBottom: '20px',
        border: '2px solid var(--primary-blue)'
      }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
          {t('gross_weight')}
        </div>
        <div className="numeral-huge" style={{ fontSize: '3rem', margin: '4px 0' }}>
          {weightStr} <span style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-muted)' }}>kg</span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: '10px',
          borderTop: '1px dashed var(--border-subtle)'
        }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success-green)' }}>
            {t('estimated_value')}: ₹{totalValuation.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Touch Keypad */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        marginBottom: '20px'
      }}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'].map((key) => (
          <button
            key={key}
            onClick={() => handleKeyPress(key)}
            className="touch-target"
            style={{
              height: '58px',
              borderRadius: '14px',
              backgroundColor: key === 'backspace' ? 'rgba(211,47,47,0.1)' : 'var(--surface)',
              border: '1.5px solid var(--border-subtle)',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: key === 'backspace' ? 'var(--alert-red)' : 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              cursor: 'pointer'
            }}
          >
            {key === 'backspace' ? <Delete size={24} /> : key}
          </button>
        ))}
      </div>

      {/* E-Waste / Battery Pickup Scheduling Section */}
      {(material.isHardToSell || material.category === 'battery' || material.id?.includes('ewaste')) && (
        <div style={{
          backgroundColor: 'rgba(59, 130, 246, 0.06)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: '16px',
          padding: '14px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            📅 {t('scheduleDetailsTitle')}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                {t('pickupDateLabel')}
              </label>
              <input
                type="date"
                defaultValue={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.85rem',
                  marginTop: '2px',
                  backgroundColor: 'var(--surface-white)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                {t('operatingAreaLabel')}
              </label>
              <input
                type="text"
                defaultValue="Okhla Phase 2, New Delhi"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.85rem',
                  marginTop: '2px',
                  backgroundColor: 'var(--surface-white)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => onProceed(weightNum, totalValuation)}
        disabled={weightNum <= 0}
        style={{
          width: '100%',
          backgroundColor: weightNum > 0 ? 'var(--primary-blue)' : 'var(--border-subtle)',
          color: weightNum > 0 ? '#FFFFFF' : 'var(--text-muted)',
          border: 'none',
          borderRadius: '16px',
          padding: '14px',
          fontWeight: 800,
          fontSize: '1.05rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: weightNum > 0 ? 'pointer' : 'not-allowed'
        }}
      >
        {(material.isHardToSell || material.category === 'battery') ? `${t('scheduleEwastePickupBtn')} →` : `${t('viewRecyclerOffers')} →`}
      </button>
    </div>
  );
}
