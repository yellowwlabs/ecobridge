import React, { useState } from 'react';
import ModalShell from '../common/ModalShell';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import { Cpu, X, Plus, Sparkles, CheckCircle2, Layers, ShieldCheck, Scale, Camera } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export default function HardToSellModal() {
  const { lang, t, getLangText } = useLanguage();
  const { hardToSellModalOpen, setHardToSellModalOpen, bulkLots, submitHardToSellItem, userHardToSellItems } = useAppData();

  const [activeTab, setActiveTab] = useState('submit'); // 'submit' | 'manifest'
  const [selectedCategory, setSelectedCategory] = useState('old_wiring');
  const [weightKg, setWeightKg] = useState('5.0');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const categories = [
    {
      key: 'old_wiring',
      icon: '🔌',
      rate: 50,
      name: { hi: 'पुराने तार के बंडल', mr: 'जुने वायर बंडल', en: 'Old Wiring Bundles' },
      photo: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'
    },
    {
      key: 'broken_appliances',
      icon: '📺',
      rate: 30,
      name: { hi: 'टूटे छोटे उपकरण', mr: 'मोडके छोटे उपकरणे', en: 'Broken Small Appliances' },
      photo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80'
    },
    {
      key: 'mixed_pcb',
      icon: '💻',
      rate: 70,
      name: { hi: 'मिश्रित पीसीबी टुकड़े', mr: 'मिश्रित पीसीबी तुकडे', en: 'Mixed PCB Fragments' },
      photo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80'
    },
    {
      key: 'obsolete_cables',
      icon: '🔋',
      rate: 40,
      name: { hi: 'पुराने केबल व चार्जर', mr: 'जुने केबल्स आणि चार्जर', en: 'Obsolete Cables & Chargers' },
      photo: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80'
    }
  ];

  const currentCategoryObj = categories.find(c => c.key === selectedCategory) || categories[0];
  const activeBulkLot = bulkLots[0] || {
    id: 'BULK-8092',
    targetKg: 100,
    currentKg: 84.5,
    status: 'open',
    contributorsCount: 12,
    totalValuation: 4235,
    components: []
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    triggerHaptic('medium');

    submitHardToSellItem({
      categoryKey: currentCategoryObj.key,
      categoryName: currentCategoryObj.name,
      weightKg: parseFloat(weightKg) || 5,
      estRate: currentCategoryObj.rate,
      photo: currentCategoryObj.photo
    });

    setSubmittedSuccess(true);
    setTimeout(() => {
      setActiveTab('manifest');
    }, 1200);
  };

  const handleClose = () => {
    setSubmittedSuccess(false);
    setHardToSellModalOpen(false);
  };

  if (!hardToSellModalOpen) return null;

  return (
    <ModalShell isOpen={hardToSellModalOpen} onClose={handleClose} maxWidth="480px" zIndex={1050}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '86vh',
        backgroundColor: 'var(--surface-white, #FFFFFF)',
        borderRadius: '24px',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          backgroundColor: 'var(--primary-deep, #0F172A)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'var(--metallic-gold, #D97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}>
              <Cpu size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, margin: 0, color: '#FFFFFF' }}>
                🧩 Hard-to-Sell Bulk Pool
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                Pool low-value items into bulk recycler batches
              </span>
            </div>
          </div>

          <button
            onClick={handleClose}
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Toggle Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          padding: '8px 16px',
          backgroundColor: '#F1F5F9',
          borderBottom: '1px solid #E2E8F0'
        }}>
          <button
            onClick={() => setActiveTab('submit')}
            style={{
              padding: '8px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: activeTab === 'submit' ? '#3B82F6' : 'transparent',
              color: activeTab === 'submit' ? '#FFFFFF' : '#64748B',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} /> {lang === 'hi' ? 'आइटम जोड़ें' : lang === 'mr' ? 'आयटम जोडा' : 'Submit Item'}
          </button>

          <button
            onClick={() => setActiveTab('manifest')}
            style={{
              padding: '8px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: activeTab === 'manifest' ? '#3B82F6' : 'transparent',
              color: activeTab === 'manifest' ? '#FFFFFF' : '#64748B',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Layers size={16} /> {lang === 'hi' ? 'थोक लॉट मेनिफेस्ट' : lang === 'mr' ? 'थोक मेनिफेस्ट' : 'Bulk Manifest'}
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '16px', overflowY: 'auto', flex: 1, backgroundColor: '#F8FAFC' }}>
          {activeTab === 'submit' ? (
            <div>
              {/* Submission Form */}
              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>
                  1. {lang === 'hi' ? 'मुश्किल स्क्रैप की श्रेणी चुनें' : lang === 'mr' ? 'स्क्रॅप श्रेणी निवडा' : 'Select Hard-to-Sell Category'}:
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {categories.map(cat => {
                    const isSelected = selectedCategory === cat.key;
                    return (
                      <div
                        key={cat.key}
                        onClick={() => setSelectedCategory(cat.key)}
                        className="btn-press"
                        style={{
                          padding: '12px',
                          borderRadius: '14px',
                          border: isSelected ? '2.5px solid #3B82F6' : '1px solid #CBD5E1',
                          backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '1.4rem' }}>{cat.icon}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', backgroundColor: 'rgba(5, 150, 105, 0.1)', padding: '2px 6px', borderRadius: '6px' }}>
                            ₹{cat.rate}/kg
                          </span>
                        </div>
                        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                          {getLangText(cat.name)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Weight Input & Preview Box */}
                <div style={{
                  padding: '14px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #CBD5E1',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>
                      2. {lang === 'hi' ? 'अनुमानित वजन (किग्रा)' : lang === 'mr' ? 'अंदाजित वजन (किलो)' : 'Approx Weight (kg)'}
                    </label>
                    <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#059669' }}>
                      Est. ₹{Math.round((parseFloat(weightKg) || 0) * currentCategoryObj.rate)}
                    </span>
                  </div>

                  <input
                    type="number"
                    min="0.5"
                    max="1000"
                    step="0.5"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '1rem',
                      fontWeight: 800,
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Success Banner */}
                {submittedSuccess && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: 'rgba(34, 197, 94, 0.12)',
                    border: '1px solid #22C55E',
                    borderRadius: '12px',
                    color: '#15803D',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CheckCircle2 size={20} />
                    <span>Added to Bulk Pool! Redirecting to manifest breakdown...</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-press"
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '16px',
                    backgroundColor: '#3B82F6',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <Plus size={20} /> Submit to Shared Bulk Pool
                </button>
              </form>

              {/* Pool Status Preview Banner */}
              <div style={{
                marginTop: '16px',
                padding: '14px',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Bulk Pool #{activeBulkLot.id} Status
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: activeBulkLot.status === 'claimed' ? '#15803D' : '#D97706' }}>
                    {activeBulkLot.status === 'claimed' ? 'Matched' : 'Pooling in Progress'}
                  </span>
                </div>

                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                  Added to Bulk Pool — {activeBulkLot.currentKg} kg collected of {activeBulkLot.targetKg} kg target for pickup
                </div>

                <div style={{ height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, (activeBulkLot.currentKg / activeBulkLot.targetKg) * 100)}%`,
                    height: '100%',
                    backgroundColor: activeBulkLot.status === 'claimed' ? '#22C55E' : '#3B82F6',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>
            </div>
          ) : (
            /* Screen 2: Bulk Lot Component Breakdown Manifest */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Manifest Header Summary Card */}
              <div style={{
                padding: '16px',
                backgroundColor: '#FFFFFF',
                borderRadius: '18px',
                border: '1.5px solid #3B82F6',
                boxShadow: '0 2px 10px rgba(59, 130, 246, 0.08)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                      #{activeBulkLot.id} • Batch Manifest
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: '4px 0 0 0' }}>
                      Shared Bulk Scrap Batch
                    </h3>
                  </div>

                  <span style={{
                    fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px',
                    backgroundColor: activeBulkLot.status === 'claimed' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(217, 119, 6, 0.15)',
                    color: activeBulkLot.status === 'claimed' ? '#15803D' : '#D97706'
                  }}>
                    {activeBulkLot.status === 'claimed' ? `✓ Matched — Pickup by ${getLangText(activeBulkLot.claimedBy?.name)}` : `Open Pool (${activeBulkLot.currentKg}/${activeBulkLot.targetKg} kg)`}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', paddingTop: '10px', borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>Contributors</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>{activeBulkLot.contributorsCount} Vendors</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>Combined Weight</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>{activeBulkLot.currentKg} kg</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block' }}>Est. Valuation</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#15803D' }}>₹{activeBulkLot.totalValuation}</span>
                  </div>
                </div>
              </div>

              {/* Component Breakdown Table */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '18px',
                padding: '14px',
                border: '1px solid #E2E8F0'
              }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>
                  📋 Component Breakdown Manifest
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeBulkLot.components.map((comp) => (
                    <div key={comp.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={comp.photo}
                          alt={getLangText(comp.categoryName)}
                          style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                        <div>
                          <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                            {getLangText(comp.categoryName)}
                          </h5>
                          <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                            {comp.count} pooled submissions @ ₹{comp.estRate}/kg
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', display: 'block' }}>
                          {comp.weightKg} kg
                        </span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#15803D' }}>
                          ₹{comp.estValue}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Portion Status List */}
              {userHardToSellItems.length > 0 && (
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '18px',
                  padding: '14px',
                  border: '1px solid #CBD5E1'
                }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                    📦 Your Pooled Submissions
                  </h4>

                  {userHardToSellItems.map(sub => (
                    <div key={sub.id} style={{
                      padding: '10px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(59, 130, 246, 0.06)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      marginBottom: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
                          {getLangText(sub.categoryName)} ({sub.weightKg} kg)
                        </span>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          Status: {activeBulkLot.status === 'claimed' 
                            ? `Matched — Pickup by ${getLangText(activeBulkLot.claimedBy?.name)}` 
                            : `Added to Bulk Pool — ${activeBulkLot.currentKg} kg / ${activeBulkLot.targetKg} kg`}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#15803D' }}>
                        ₹{sub.estValue}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
}
