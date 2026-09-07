import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import { ShieldCheck, ShieldAlert, Star, Phone, MapPin, Search } from 'lucide-react';
import CallProxyModal from '../common/CallProxyModal';

export default function RecyclerDirectory({ onSwitchTab }) {
  const { lang, t, getLangText } = useLanguage();
  const { recyclers } = useAppData();
  const [filterAuth, setFilterAuth] = useState('all'); // 'all' | 'authorized'
  const [activeCallTarget, setActiveCallTarget] = useState(null);

  const filtered = recyclers.filter(r => {
    if (filterAuth === 'authorized') return r.authorization_status === 'authorized';
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <button
          onClick={() => setFilterAuth('all')}
          style={{
            padding: '6px 14px', borderRadius: '12px', border: 'none',
            backgroundColor: filterAuth === 'all' ? 'var(--primary-blue)' : 'var(--bg-neutral)',
            color: filterAuth === 'all' ? '#FFFFFF' : 'var(--text-primary)',
            fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer'
          }}
        >
          {t('allRecyclers')} ({recyclers.length})
        </button>
        <button
          onClick={() => setFilterAuth('authorized')}
          style={{
            padding: '6px 14px', borderRadius: '12px', border: 'none',
            backgroundColor: filterAuth === 'authorized' ? 'var(--success-green)' : 'var(--bg-neutral)',
            color: filterAuth === 'authorized' ? '#FFFFFF' : 'var(--text-primary)',
            fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '4px'
          }}
        >
          <ShieldCheck size={14} /> {t('onlyAuthorized')}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map(r => {
          const isAuthorized = r.authorization_status === 'authorized';
          return (
            <div key={r.id} style={{
              padding: '14px', borderRadius: '16px', backgroundColor: 'var(--bg-neutral)',
              border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div className="photo-mount" style={{ width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0 }}>
                  <img src={r.facilityPhoto || r.avatar || r.photo} alt={getLangText(r.name)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {getLangText(r.name)}
                    {isAuthorized ? <ShieldCheck size={16} color="var(--success-green)" /> : <ShieldAlert size={16} color="var(--text-muted)" />}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {getLangText(r.address)}</span>
                  <div style={{ fontSize: '0.72rem', color: 'var(--primary-blue)', fontWeight: 700, marginTop: '2px' }}>
                    {getLangText(r.ratesBonus)}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveCallTarget({ id: r.id, name: r.name, role: 'recycler' })}
                style={{
                  minHeight: '40px', padding: '6px 14px', borderRadius: '12px',
                  backgroundColor: 'var(--primary-blue)', color: '#FFFFFF', border: 'none',
                  fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer'
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
    </div>
  );
}
