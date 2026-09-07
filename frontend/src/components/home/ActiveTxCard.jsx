import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import { CheckCircle2, Clock, Truck, Banknote, ShieldCheck, PhoneCall, ChevronDown, ChevronUp, FileText } from 'lucide-react';

import BookingReceiptModal from '../common/BookingReceiptModal';
import CallProxyModal from '../common/CallProxyModal';

export default function ActiveTxCard() {
  const { lang, t, getLangText } = useLanguage();
  const { activeTx, updateTransactionStatus, setActiveTab } = useAppData();
  const [showReceipt, setShowReceipt] = useState(false);
  const [showCallProxy, setShowCallProxy] = useState(false);
  const [showStepper, setShowStepper] = useState(false); // Collapsed by default

  if (!activeTx) return null;

  const steps = [
    { step: 1, label: t('posted'), icon: Clock },
    { step: 2, label: t('offer'), icon: ShieldCheck },
    { step: 3, label: t('accepted'), icon: CheckCircle2 },
    { step: 4, label: t('handover'), icon: Truck },
    { step: 5, label: t('paid'), icon: Banknote }
  ];

  const currentStepObj = steps.find(s => s.step === activeTx.statusStep) || steps[0];

  const handleAdvanceStep = () => {
    if (activeTx.statusStep === 3) {
      setActiveTab('sell');
    } else if (activeTx.statusStep === 4) {
      updateTransactionStatus(activeTx.id, 'Paid', 5);
    }
  };

  return (
    <div className="card" style={{
      marginBottom: '16px',
      borderLeft: '4px solid var(--primary-accent)',
      position: 'relative'
    }}>
      {/* Active Transaction Badge Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="pulse-dot" style={{ backgroundColor: 'var(--amber-pending)' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-accent)' }}>
            #{activeTx.id} • {getLangText(activeTx.materialName)}
          </span>
        </div>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 800,
          color: 'var(--emerald-success)',
          backgroundColor: 'rgba(30, 122, 95, 0.12)',
          padding: '2px 8px',
          borderRadius: '8px'
        }}>
          ₹{activeTx.totalPrice} ({activeTx.weightKg} kg)
        </span>
      </div>

      {/* Recycler Info Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        backgroundColor: 'var(--bg-neutral)',
        borderRadius: '12px',
        marginBottom: '12px'
      }}>
        <div>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-accent)' }}>
            🏢 {getLangText(activeTx.recycler?.name)}
          </span>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {getLangText(activeTx.pickupDate)}
          </div>
        </div>
        <button
          onClick={() => setShowCallProxy(true)}
          style={{
            minHeight: '38px',
            padding: '4px 12px',
            borderRadius: '10px',
            backgroundColor: 'var(--emerald-success)',
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
          <PhoneCall size={16} color="#FFFFFF" /> {t('callNow')}
        </button>
      </div>

      {/* Compact Status Indicator Bar (Collapsed by Default) */}
      <div
        onClick={() => setShowStepper(prev => !prev)}
        className="btn-press"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderRadius: '10px',
          backgroundColor: 'var(--bg-neutral)',
          border: '1px solid var(--border-subtle, #E2E8F0)',
          cursor: 'pointer',
          marginBottom: '14px'
        }}
        title="Toggle status stepper breakdown"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800 }}>
          <span style={{ color: 'var(--text-muted)' }}>
            {lang === 'hi' ? 'स्थिति:' : lang === 'mr' ? 'स्थिती:' : 'Status:'}
          </span>
          <span style={{ color: 'var(--amber-pending)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {currentStepObj.label}
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              ({activeTx.statusStep}/5)
            </span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-accent)' }}>
          <span>
            {showStepper 
              ? (lang === 'hi' ? 'छिपाएं' : lang === 'mr' ? 'लपवा' : 'Hide Details') 
              : (lang === 'hi' ? 'प्रगति देखें' : lang === 'mr' ? 'प्रगती पहा' : 'View Progress')}
          </span>
          {showStepper ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* 5-Stage Stepper (Only rendered when user expands) */}
      {showStepper && (
        <div style={{
          position: 'relative',
          marginBottom: '14px',
          padding: '12px 6px',
          backgroundColor: 'var(--bg-neutral)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle, #E2E8F0)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 1
          }}>
            {steps.map((s) => {
              const isCompleted = s.step <= activeTx.statusStep;
              const isCurrent = s.step === activeTx.statusStep;
              const StepIcon = s.icon;

              return (
                <div key={s.step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: isCompleted ? 'var(--emerald-success)' : 'var(--bg-neutral)',
                    color: isCompleted ? '#FFFFFF' : 'var(--text-muted)',
                    border: isCurrent ? '3px solid var(--amber-pending)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <StepIcon size={16} color={isCompleted ? '#FFFFFF' : 'var(--text-muted)'} />
                  </div>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: isCurrent ? 800 : 500,
                    marginTop: '4px',
                    textAlign: 'center',
                    color: isCurrent ? 'var(--amber-pending)' : isCompleted ? 'var(--emerald-success)' : 'var(--text-muted)'
                  }}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Handover / Payment Action button & Receipt Trigger */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleAdvanceStep}
          style={{
            flex: 2,
            backgroundColor: 'var(--primary-accent)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '12px',
            padding: '12px',
            fontWeight: 800,
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
        >
          {activeTx.statusStep === 3 ? '📸 ' + t('confirm_handover') : '💰 ' + t('cash')}
        </button>

        <button
          onClick={() => setShowReceipt(true)}
          className="btn-press"
          style={{
            flex: 1,
            backgroundColor: 'var(--bg-neutral)',
            color: 'var(--primary-blue)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '12px',
            fontWeight: 800,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            cursor: 'pointer'
          }}
        >
          <FileText size={16} /> Receipt
        </button>
      </div>

      <BookingReceiptModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        bookingData={activeTx}
      />

      <CallProxyModal
        isOpen={showCallProxy}
        onClose={() => setShowCallProxy(false)}
        targetId={activeTx.recycler?.id}
        targetName={activeTx.recycler?.name}
        targetRole="recycler"
        lotId={activeTx.id}
      />
    </div>
  );
}
