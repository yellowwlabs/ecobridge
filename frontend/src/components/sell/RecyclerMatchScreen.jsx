import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import { ShieldCheck, ShieldAlert, Star, AlertTriangle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { speakText } from '../../utils/voiceAssistant';

export default function RecyclerMatchScreen({ material, weightKg, totalValuation, photoUrl, onBack, onSelectRecycler }) {
  const { lang, t, getLangText } = useLanguage();
  const { recyclers } = useAppData();

  const [selectedRecyclerId, setSelectedRecyclerId] = useState(recyclers[0].id);

  // Generate customized live quotes from recyclers for this specific material
  const quotes = recyclers.map((rec, idx) => {
    let rateOffer = material.rate;
    if (idx === 0) rateOffer = material.rate + 5; // Best offer
    if (idx === 3) rateOffer = material.rate + 45; // Anomaly offer (too high)

    const isAnomaly = rateOffer > material.rate + 30;

    return {
      ...rec,
      offeredRate: rateOffer,
      offeredTotal: Math.round(rateOffer * weightKg),
      isAnomaly
    };
  });

  const handleChoose = (q) => {
    speakText(`${t('selectOffer')} - ${q.name}`, lang);
    onSelectRecycler(q);
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
        🏬 {t('recyclerMatchingTitle')} ({t('bestOffers')})
      </h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
        {getLangText(material.name)} • {weightKg} kg {t('forWeight')} 4 {t('offersReceived')}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        {quotes.map((q) => {
          const isSelected = selectedRecyclerId === q.id;
          const isAuthorized = q.authorization_status === 'authorized';

          return (
            <div
              key={q.id}
              onClick={() => setSelectedRecyclerId(q.id)}
              style={{
                padding: '14px',
                borderRadius: '16px',
                backgroundColor: isSelected ? 'rgba(0, 36, 107, 0.06)' : 'var(--bg-neutral)',
                border: isSelected ? '2px solid var(--primary-blue)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Anomaly Notice Flag */}
              {q.isAnomaly && (
                <div style={{
                  backgroundColor: 'rgba(245, 166, 35, 0.15)',
                  border: '1px solid var(--warning-amber)',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  marginBottom: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#B45309',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <AlertTriangle size={14} color="var(--warning-amber)" />
                  ⚠️ {t('rateAnomalyWarning')}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={q.avatar}
                    alt={q.name}
                    style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {q.name}
                      {isAuthorized ? (
                        <ShieldCheck size={16} color="var(--success-green)" title={t('verifiedShield')} />
                      ) : (
                        <ShieldAlert size={16} color="var(--text-muted)" title={t('unverifiedShield')} />
                      )}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ⭐ {q.rating} • 📍 {q.distance} • {q.pickupAvailable ? `🚚 ${t('pickupAvailable')}` : ''}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="numeral-huge" style={{ fontSize: '1.4rem', color: 'var(--success-green)' }}>
                    ₹{q.offeredTotal}
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    ₹{q.offeredRate}/kg
                  </span>
                </div>
              </div>

              {/* Accept choice button */}
              <div style={{ marginTop: '10px', textAlign: 'right' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChoose(q);
                  }}
                  style={{
                    minHeight: '38px',
                    padding: '6px 16px',
                    borderRadius: '10px',
                    backgroundColor: isSelected ? 'var(--primary-blue)' : 'var(--surface)',
                    color: isSelected ? '#FFFFFF' : 'var(--primary-blue)',
                    border: '1.5px solid var(--primary-blue)',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <CheckCircle2 size={16} /> {t('selectOffer')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
