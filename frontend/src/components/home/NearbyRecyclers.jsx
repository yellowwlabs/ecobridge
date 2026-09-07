import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import { ShieldCheck, ShieldAlert, Star, Phone, MapPin, Truck } from 'lucide-react';
import recyclerVendorImg from '../../assets/images/recycler_vendor.jpg';
import CallProxyModal from '../common/CallProxyModal';
import RecyclerVerificationModal from '../recycler/RecyclerVerificationModal';

export default function NearbyRecyclers({ onBack, showHeader = false }) {
  const { t, getLangText } = useLanguage();
  const { recyclers } = useAppData();
  const [filter, setFilter] = useState('all'); // 'all' | 'authorized' | 'pickup'
  const [activeCallTarget, setActiveCallTarget] = useState(null);
  const [activeVerificationRecycler, setActiveVerificationRecycler] = useState(null);

  const filteredRecyclers = recyclers.filter(r => {
    if (filter === 'authorized') return r.authorization_status === 'authorized';
    if (filter === 'pickup') return r.pickupAvailable;
    return true;
  });

  return (
    <div className="card glass-card" style={{ marginBottom: '16px' }}>
      {showHeader && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              ←
            </button>
          )}
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-blue)', margin: 0 }}>
            📍 {t('nearbyRecyclers')}
          </h2>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        {!showHeader && (
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🏬 {t('nearbyRecyclers')}
          </h2>
        )}

        {/* Standardized Filter Chips */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'all', label: t('filterAll') },
            { id: 'authorized', label: t('filterAuthorized') },
            { id: 'pickup', label: t('filterPickup') }
          ].map(chip => {
            const isSelected = filter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setFilter(chip.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: isSelected ? '1px solid #3B82F6' : '1px solid var(--border-subtle)',
                  backgroundColor: isSelected ? '#3B82F6' : 'var(--surface-white)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredRecyclers.map(rec => {
          const isAuthorized = rec.authorization_status === 'authorized';
          return (
            <div
              key={rec.id}
              className="card-hover"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                backgroundColor: 'var(--surface-white)',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              {/* Left: Storefront Facility Photo & Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="photo-mount" style={{ width: '56px', height: '56px', borderRadius: '12px', flexShrink: 0, position: 'relative' }}>
                  <img
                    src={rec.facilityPhoto || rec.avatar || rec.photo}
                    alt={getLangText(rec.name)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveVerificationRecycler(rec);
                    }}
                    title="Tap to view verification details"
                    style={{
                      position: 'absolute',
                      bottom: '-4px', right: '-4px',
                      backgroundColor: isAuthorized ? 'var(--success-green)' : 'var(--text-muted)',
                      color: '#FFFFFF',
                      borderRadius: '50%',
                      padding: '3px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                    }}
                  >
                    {isAuthorized ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {getLangText(rec.name)}
                  </h4>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    <span style={{ color: '#D97706', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <Star size={12} fill="#D97706" /> {rec.rating} ({rec.reviewsCount})
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <MapPin size={12} /> {rec.distance}
                    </span>
                  </div>

                  {rec.pickupAvailable && (
                    <span style={{
                      display: 'inline-block',
                      marginTop: '4px',
                      backgroundColor: 'rgba(46, 125, 50, 0.1)',
                      color: 'var(--success-green)',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      padding: '1px 6px',
                      borderRadius: '6px'
                    }}>
                      <Truck size={10} style={{ display: 'inline', marginRight: '2px' }} /> {t('pickupAvailable')}
                    </span>
                  )}
                </div>
              </div>

              {/* Masked Anonymized Call Action */}
              <button
                onClick={() => setActiveCallTarget({ id: rec.id, name: rec.name, role: 'recycler' })}
                style={{
                  minHeight: '40px',
                  padding: '6px 14px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--primary-blue)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Phone size={14} /> {t('callNow')}
              </button>
            </div>
          );
        })}
      </div>

      <CallProxyModal
        isOpen={Boolean(activeCallTarget)}
        onClose={() => setActiveCallTarget(null)}
        targetId={activeCallTarget?.id}
        targetName={activeCallTarget?.name}
        targetRole={activeCallTarget?.role}
      />

      <RecyclerVerificationModal
        isOpen={Boolean(activeVerificationRecycler)}
        onClose={() => setActiveVerificationRecycler(null)}
        recycler={activeVerificationRecycler}
      />
    </div>
  );
}
