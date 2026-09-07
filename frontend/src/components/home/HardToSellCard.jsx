import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import { Sparkles, Cpu, ArrowUpRight } from 'lucide-react';

export default function HardToSellCard() {
  const { t } = useLanguage();
  const { setHardToSellModalOpen } = useAppData();

  return (
    <div
      onClick={() => setHardToSellModalOpen(true)}
      className="card hard-to-sell-card btn-press"
      style={{ marginBottom: '16px', cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '12px',
            backgroundColor: 'var(--metallic-gold)', color: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <Cpu size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--metallic-gold)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={14} /> Shared Bulk Pool
            </span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {t('hardToSellTitle')}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {t('hardToSellDesc')}
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setHardToSellModalOpen(true);
          }}
          style={{
            minHeight: '44px',
            minWidth: '44px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-accent)',
            color: '#FFFFFF',
            border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <ArrowUpRight size={22} />
        </button>
      </div>
    </div>
  );
}
