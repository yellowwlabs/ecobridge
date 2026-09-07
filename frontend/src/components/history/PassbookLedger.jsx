import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import { Wallet, Award } from 'lucide-react';

export default function PassbookLedger({ onSwitchTab }) {
  const { t } = useLanguage();
  const { transactions, loyalty } = useAppData();

  const totalEarned = transactions.reduce((acc, t) => acc + (t.status === 'Paid' ? t.totalPrice : 0), 0);
  const pendingAmount = transactions.reduce((acc, t) => acc + (t.status !== 'Paid' ? t.totalPrice : 0), 0);

  return (
    <div>
      {/* Top Ledger Hero Card */}
      <div className="hero-card" style={{
        padding: '20px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.85, fontSize: '0.85rem' }}>
          <Wallet size={18} /> {t('totalEarnings')}
        </div>

        <div className="numeral-huge" style={{ color: '#FFFFFF', fontSize: '2.8rem', margin: '8px 0' }}>
          ₹{totalEarned.toLocaleString()}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255,255,255,0.2)',
          fontSize: '0.82rem'
        }}>
          <div>
            <span style={{ opacity: 0.8 }}>{t('pendingTx')}:</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--metallic-gold)' }}>
              ₹{pendingAmount.toLocaleString()}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ opacity: 0.8 }}>{t('loyaltyPoints')}:</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>
              {loyalty.points} pts
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Entries */}
      <div className="card" style={{ padding: '16px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-deep)', marginBottom: '12px' }}>
          📒 {t('history')}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {loyalty.conversionHistory.map(cnv => (
            <div key={cnv.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 12px', borderRadius: '12px', backgroundColor: 'var(--surface-ivory)',
              border: '1px solid var(--metallic-gold)'
            }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--metallic-gold)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Award size={16} /> {t('loyaltyPoints')} ({cnv.points} pts)
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{cnv.date}</span>
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--emerald-success)' }}>
                +₹{cnv.amountRupees}
              </span>
            </div>
          ))}

          {transactions.map(tx => (
            <div key={tx.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 12px', borderRadius: '12px', backgroundColor: 'var(--bg-neutral)',
              border: '1px solid var(--divider-hairline)'
            }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  #{tx.id} ({tx.paymentMethod === 'Cash' ? t('cash') : t('upi')})
                </span>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{tx.timestamp}</div>
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: tx.status === 'Paid' ? 'var(--emerald-success)' : 'var(--amber-pending)' }}>
                {tx.status === 'Paid' ? `+₹${tx.totalPrice}` : `⏳ ₹${tx.totalPrice}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
