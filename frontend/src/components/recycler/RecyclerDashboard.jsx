import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import { Building2, CheckCircle2, ShieldCheck, Truck, Banknote } from 'lucide-react';

import recyclerFacilityHeroImg from '../../assets/images/recycler_facility_hero.jpg';

export default function RecyclerDashboard() {
  const { t, getLangText } = useLanguage();
  const { transactions, updateTransactionStatus, setActiveRole, userProfile, bulkLots, claimBulkLot } = useAppData();
  const [quoteInputs, setQuoteInputs] = useState({});

  const recyclerNameObj = {
    hi: userProfile?.name || 'ग्रीन इंडिया रिसाइकलिंग',
    mr: userProfile?.name || 'ग्रीन इंडिया रिसायकलिंग',
    en: userProfile?.name || 'Green India Recycling'
  };

  const activeTxList = transactions.filter(tx => tx.status !== 'Paid' && tx.statusStep < 5);
  const completedTxList = transactions.filter(tx => tx.status === 'Paid' || tx.statusStep === 5);
  const openBulkLots = (bulkLots || []).filter(b => b.status === 'open');

  const handleSendQuote = (txId, defaultRate, weightKg) => {
    const customRate = parseFloat(quoteInputs[txId]) || defaultRate;
    const newTotal = Math.round(customRate * weightKg);

    updateTransactionStatus(txId, 'Quoted', 2, {
      estimatedRate: customRate,
      totalPrice: newTotal,
      recycler: {
        id: 'rec_01',
        name: recyclerNameObj,
        authorization: 'authorized'
      }
    });
  };

  const handleApproveHandover = (txId) => {
    updateTransactionStatus(txId, 'Handover', 4);
  };

  const handleReleasePayment = (txId, amount) => {
    updateTransactionStatus(txId, 'Paid', 5);
  };

  return (
    <div className="card" style={{ padding: '20px', backgroundColor: 'var(--surface-white)' }}>
      {/* Hero Photo Banner */}
      <div className="hero-photo-card" style={{ height: '130px', marginBottom: '16px', borderRadius: '16px', overflow: 'hidden' }}>
        <img
          src={recyclerFacilityHeroImg}
          alt="Recycling Facility Warehouse"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div className="hero-photo-overlay" style={{ justifyContent: 'flex-end', padding: '12px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
            🏬 {t('recyclerDashboardTitle') || 'Recycler Dashboard'}
          </span>
        </div>
      </div>

      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-deep) 0%, #163B6E 100%)',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '16px',
        color: '#FFFFFF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '50%',
            backgroundColor: '#FFFFFF', color: 'var(--primary-deep)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Building2 size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--emerald-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} /> {t('verifiedShield')}
            </span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
              {getLangText(recyclerNameObj)}
            </h3>
          </div>
        </div>

        <button
          onClick={() => setActiveRole('collector')}
          style={{
            minHeight: '36px',
            padding: '4px 12px',
            borderRadius: '10px',
            backgroundColor: '#FFFFFF',
            color: 'var(--primary-deep)',
            border: 'none',
            fontSize: '0.8rem',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          🔄 {t('switchRoleCollector')}
        </button>
      </div>

      {/* SECTION 0: AVAILABLE POOLED BULK LOTS */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-deep)', margin: 0 }}>
          📦 Available Bulk Lots ({openBulkLots.length})
        </h3>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-accent)', backgroundColor: 'rgba(59,130,246,0.12)', padding: '2px 8px', borderRadius: '6px' }}>
          Hard-to-Sell Batches
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
        {openBulkLots.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', backgroundColor: 'var(--bg-neutral)', borderRadius: '14px', color: 'var(--text-muted)', fontSize: '0.84rem', fontWeight: 700 }}>
            ✨ All pooled bulk lots have been claimed by recyclers!
          </div>
        ) : (
          openBulkLots.map(lot => (
            <div key={lot.id} style={{
              padding: '16px',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-neutral)',
              border: '2px solid var(--primary-accent)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-accent)', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                    #{lot.id} • Bulk Lot
                  </span>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
                    Shared E-Waste Bulk Batch ({lot.currentKg} kg)
                  </h4>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="numeral-huge" style={{ fontSize: '1.3rem', color: 'var(--emerald-success)' }}>
                    ₹{lot.totalValuation}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {lot.contributorsCount} Anonymized Contributors
                  </span>
                </div>
              </div>

              {/* Component Breakdown List */}
              <div style={{ backgroundColor: 'var(--surface-white)', borderRadius: '12px', padding: '10px', marginBottom: '12px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  COMPONENTS IN BATCH:
                </span>
                {lot.components.map(comp => (
                  <div key={comp.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '3px 0', borderBottom: '1px dashed var(--divider-hairline)' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      • {getLangText(comp.categoryName)}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                      {comp.weightKg} kg (Est. ₹{comp.estValue})
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Button: Take This Lot */}
              <button
                onClick={() => claimBulkLot(lot.id, { id: 'rec_01', name: recyclerNameObj })}
                className="btn-press"
                style={{
                  width: '100%',
                  minHeight: '44px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: 'var(--emerald-success)',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                }}
              >
                <CheckCircle2 size={18} /> Take This Lot (Claim Bulk Batch)
              </button>
            </div>
          ))
        )}
      </div>

      {/* SECTION 1: ACTIVE & INCOMING TRANSACTIONS */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-deep)', margin: 0 }}>
          📥 {t('activeTx')} ({activeTxList.length})
        </h3>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--amber-pending)', backgroundColor: 'rgba(201,122,43,0.12)', padding: '2px 8px', borderRadius: '6px' }}>
          Awaiting Action
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
        {activeTxList.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', backgroundColor: 'var(--bg-neutral)', borderRadius: '14px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700 }}>
            ✨ No pending active lots awaiting recycler action right now.
          </div>
        ) : (
          activeTxList.map(tx => (
            <div key={tx.id} style={{
              padding: '14px',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-neutral)',
              border: '1.5px solid var(--primary-accent)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className="photo-mount" style={{ width: '60px', height: '60px', flexShrink: 0 }}>
                    <img src={tx.photo} alt={tx.id} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-accent)' }}>
                      #{tx.id} • {tx.timestamp}
                    </span>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      {getLangText(tx.materialName)} • {tx.weightKg} kg
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {tx.gps}</span>
                  </div>
                </div>

                <span style={{
                  fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px',
                  backgroundColor: 'rgba(201,122,43,0.15)',
                  color: 'var(--amber-pending)'
                }}>
                  {tx.status}
                </span>
              </div>

              {/* Actions depending on step */}
              {tx.statusStep === 1 && (
                <div style={{
                  display: 'flex', gap: '8px', alignItems: 'center',
                  backgroundColor: 'var(--surface-white)', padding: '10px', borderRadius: '12px'
                }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>₹/kg:</span>
                  <input
                    type="number"
                    placeholder={tx.estimatedRate}
                    value={quoteInputs[tx.id] || ''}
                    onChange={(e) => setQuoteInputs({ ...quoteInputs, [tx.id]: e.target.value })}
                    style={{
                      width: '70px', padding: '6px', borderRadius: '8px',
                      border: '1px solid var(--divider-hairline)', fontWeight: 800, fontSize: '0.9rem'
                    }}
                  />
                  <button
                    onClick={() => handleSendQuote(tx.id, tx.estimatedRate, tx.weightKg)}
                    style={{
                      flex: 1, minHeight: '38px', borderRadius: '8px', border: 'none',
                      backgroundColor: 'var(--primary-accent)', color: '#FFFFFF', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer'
                    }}
                  >
                    Submit Recycler Offer
                  </button>
                </div>
              )}

              {tx.statusStep === 3 && (
                <button
                  onClick={() => handleApproveHandover(tx.id)}
                  style={{
                    width: '100%', minHeight: '40px', borderRadius: '10px', border: 'none',
                    backgroundColor: 'var(--amber-pending)', color: '#FFFFFF', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <Truck size={16} /> {t('confirm_handover')}
                </button>
              )}

              {tx.statusStep === 4 && (
                <button
                  onClick={() => handleReleasePayment(tx.id, tx.totalPrice)}
                  style={{
                    width: '100%', minHeight: '40px', borderRadius: '10px', border: 'none',
                    backgroundColor: 'var(--emerald-success)', color: '#FFFFFF', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <Banknote size={16} /> ₹{tx.totalPrice} Confirm & Release Payment
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* SECTION 2: COMPLETED HISTORY */}
      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '12px' }}>
        ✅ {t('completedTx')} ({completedTxList.length})
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {completedTxList.map(tx => (
          <div key={tx.id} style={{
            padding: '12px',
            borderRadius: '14px',
            backgroundColor: 'var(--bg-neutral)',
            border: '1px solid var(--divider-hairline)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div className="photo-mount" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                  <img src={tx.photo} alt={tx.id} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {getLangText(tx.materialName)} • {tx.weightKg} kg
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>#{tx.id} • ₹{tx.totalPrice}</span>
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--emerald-success)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={16} /> Paid (Digital Certificate Generated)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
