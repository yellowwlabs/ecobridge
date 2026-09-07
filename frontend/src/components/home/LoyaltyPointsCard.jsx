import React, { useState } from 'react';
import ModalShell from '../common/ModalShell';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import { Award, Zap, ArrowRight, CheckCircle2, X } from 'lucide-react';

export default function LoyaltyPointsCard() {
  const { t } = useLanguage();
  const { loyalty, convertLoyaltyPoints } = useAppData();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const handleConvertClick = () => {
    if (loyalty.points < 100 || isConverting) return;
    setShowConfirmModal(true);
  };

  const confirmConversion = () => {
    setShowConfirmModal(false);
    setIsConverting(true);

    setTimeout(() => {
      const convertedPts = loyalty.points;
      const convertedAmt = loyalty.rupeesEquivalent;
      convertLoyaltyPoints();
      setIsConverting(false);

      setReceiptData({
        pointsConverted: convertedPts,
        amountCredited: convertedAmt,
        txId: `CNV-${Math.floor(100000 + Math.random() * 900000)}`,
        upiId: 'raju.kabadi@upi',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setShowReceiptModal(true);
    }, 1000);
  };

  return (
    <>
      <div className="card glass-card card-hover" style={{
        marginBottom: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                color: 'var(--primary-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Award size={18} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-accent)' }}>
                ⭐ {t('loyaltyPoints')}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span className="numeral-huge" style={{ color: 'var(--text-primary)', fontSize: '2rem' }}>
                {loyalty.points}
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--emerald-success)' }}>
                (= ₹{loyalty.rupeesEquivalent})
              </span>
            </div>
          </div>

          {/* Shimmer Skeleton or Interactive Convert CTA Button */}
          {isConverting ? (
            <div style={{
              width: '140px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'var(--border-subtle)',
              animation: 'pulse-glow 1.5s infinite',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: 700
            }}>
              ⏳ {t('status_syncing')}...
            </div>
          ) : (
            <button
              onClick={handleConvertClick}
              disabled={loyalty.points < 100}
              className="btn-press"
              style={{
                minHeight: '46px',
                padding: '10px 16px',
                borderRadius: '12px',
                backgroundColor: loyalty.points >= 100 ? 'var(--primary-accent)' : 'var(--border-subtle)',
                color: loyalty.points >= 100 ? '#FFFFFF' : 'var(--text-muted)',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: loyalty.points >= 100 ? 'pointer' : 'not-allowed',
                boxShadow: loyalty.points >= 100 ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
              }}
            >
              <Zap size={16} fill="#FFFFFF" />
              {t('convertToUpi')} <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Bottom Sheet Modal */}
      <ModalShell isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
        <div className="card glass-card" style={{
          width: '100%',
          maxWidth: '480px',
          borderRadius: '20px',
          padding: '24px',
          backgroundColor: 'var(--surface-white)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⭐ {t('convertConfirmTitle')}
            </h3>
            <button onClick={() => setShowConfirmModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
          </div>

          <div style={{
            backgroundColor: 'rgba(59, 130, 246, 0.06)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <span className="numeral-huge" style={{ fontSize: '1.8rem', display: 'block', marginBottom: '4px' }}>
              {loyalty.points} Points ➔ ₹{loyalty.rupeesEquivalent}
            </span>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
              {t('convertConfirmDesc')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowConfirmModal(false)}
              className="btn-press"
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              {t('cancel')}
            </button>

            <button
              onClick={confirmConversion}
              className="btn-press"
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: 'var(--emerald-success)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              {t('confirm')}
            </button>
          </div>
        </div>
      </ModalShell>

      {/* Success Receipt Modal */}
      <ModalShell isOpen={showReceiptModal && !!receiptData} onClose={() => setShowReceiptModal(false)}>
        <div className="card glass-card" style={{
          width: '100%',
          maxWidth: '380px',
          borderRadius: '18px',
          padding: '24px',
          backgroundColor: 'var(--surface-white)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            color: 'var(--emerald-success)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px auto'
          }}>
            <CheckCircle2 size={36} />
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--emerald-success)', marginBottom: '4px' }}>
            {t('convertSuccessToast')}
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            {t('convertPointsReceipt')}
          </p>

          {receiptData && (
            <div style={{
              backgroundColor: 'var(--bg-neutral)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '20px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Amount Credited:</span>
                <strong style={{ color: 'var(--emerald-success)', fontSize: '1.1rem' }}>₹{receiptData.amountCredited}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Points Converted:</span>
                <strong>{receiptData.pointsConverted} pts</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>UPI ID:</span>
                <strong>{receiptData.upiId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tx Reference ID:</span>
                <strong style={{ fontFamily: 'monospace' }}>#{receiptData.txId}</strong>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowReceiptModal(false)}
            className="btn-press"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary-deep)',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            Done
          </button>
        </div>
      </ModalShell>
    </>
  );
}
