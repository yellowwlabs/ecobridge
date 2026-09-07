import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import { ChevronRight } from 'lucide-react';
import TraceabilityDetail from './TraceabilityDetail';
import PassbookLedger from './PassbookLedger';

export default function TransactionList() {
  const { t, getLangText } = useLanguage();
  const { transactions } = useAppData();
  const [selectedTx, setSelectedTx] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('list'); // 'list' | 'ledger'

  if (selectedTx) {
    return <TraceabilityDetail transaction={selectedTx} onBack={() => setSelectedTx(null)} />;
  }

  if (activeSubTab === 'ledger') {
    return <PassbookLedger onSwitchTab={() => setActiveSubTab('list')} />;
  }

  return (
    <div className="card" style={{ padding: '20px' }}>
      {/* Sub tab toggle bar with locale-driven keys */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setActiveSubTab('list')}
          style={{
            flex: 1,
            minHeight: '40px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: activeSubTab === 'list' ? 'var(--primary-accent)' : 'var(--bg-neutral)',
            color: activeSubTab === 'list' ? '#FFFFFF' : 'var(--text-primary)',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          📋 {t('history')}
        </button>
        <button
          onClick={() => setActiveSubTab('ledger')}
          style={{
            flex: 1,
            minHeight: '40px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: activeSubTab === 'ledger' ? 'var(--primary-accent)' : 'var(--bg-neutral)',
            color: activeSubTab === 'ledger' ? '#FFFFFF' : 'var(--text-primary)',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          📒 {t('totalEarnings')}
        </button>
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-deep)', marginBottom: '14px' }}>
        📜 {t('history')}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {transactions.map(tx => (
          <div
            key={tx.id}
            onClick={() => setSelectedTx(tx)}
            style={{
              padding: '14px',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-neutral)',
              border: '1px solid var(--divider-hairline)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="photo-mount" style={{ width: '56px', height: '56px', flexShrink: 0 }}>
                <img src={tx.photo} alt={tx.id} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary-accent)' }}>
                    #{tx.id}
                  </span>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: '6px',
                    backgroundColor: tx.status === 'Paid' ? 'rgba(30, 122, 95, 0.12)' : 'rgba(201, 122, 43, 0.15)',
                    color: tx.status === 'Paid' ? 'var(--emerald-success)' : 'var(--amber-pending)'
                  }}>
                    {tx.status === 'Paid' ? '✓ ' + t('completedTx') : '⏳ ' + t('pendingTx')}
                  </span>
                </div>

                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {getLangText(tx.materialName)} • {tx.weightKg} kg
                </h4>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📍 {tx.gps.split('(')[0]}</span>
                  <span>•</span>
                  <span>{tx.timestamp}</span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div>
                <div className="numeral-huge" style={{ fontSize: '1.25rem', color: 'var(--emerald-success)' }}>
                  ₹{tx.totalPrice}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {tx.paymentMethod === 'Cash' ? t('cash') : t('upi')}
                </span>
              </div>
              <ChevronRight size={18} color="var(--text-muted)" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
