import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ArrowLeft, MapPin, Clock, ShieldCheck, CheckCircle2, QrCode, Truck, Banknote, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import BookingReceiptModal from '../common/BookingReceiptModal';

export default function TraceabilityDetail({ transaction, onBack }) {
  const { lang, t, getLangText } = useLanguage();
  const [showReceipt, setShowReceipt] = useState(false);
  const [showStepper, setShowStepper] = useState(false);

  const statusStep = transaction.statusStep || (transaction.status === 'Paid' ? 5 : 3);
  const steps = [
    { step: 1, label: t('posted'), icon: Clock },
    { step: 2, label: t('offer'), icon: ShieldCheck },
    { step: 3, label: t('accepted'), icon: CheckCircle2 },
    { step: 4, label: t('handover'), icon: Truck },
    { step: 5, label: t('paid'), icon: Banknote }
  ];
  const currentStepObj = steps.find(s => s.step === statusStep) || steps[0];

  return (
    <div className="card" style={{ padding: '20px' }}>
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer',
          marginBottom: '14px', fontSize: '0.9rem', fontWeight: 700
        }}
      >
        <ArrowLeft size={18} /> {t('back')}
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <span style={{
            fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-blue)',
            backgroundColor: 'rgba(0, 36, 107, 0.08)', padding: '2px 8px', borderRadius: '6px'
          }}>
            #{transaction.id}
          </span>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {getLangText(transaction.materialName)}
          </h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="numeral-huge" style={{ fontSize: '1.8rem', color: 'var(--success-green)' }}>
            ₹{transaction.totalPrice}
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            {transaction.weightKg} kg @ ₹{transaction.estimatedRate}/kg
          </span>
        </div>
      </div>

      {/* Proof Photo Mount */}
      <div className="photo-mount" style={{ height: '200px', marginBottom: '16px' }}>
        <img
          src={transaction.photo}
          alt={transaction.id}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
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
          marginBottom: '16px'
        }}
        title="Toggle status stepper breakdown"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800 }}>
          <span style={{ color: 'var(--text-muted)' }}>
            {lang === 'hi' ? 'स्थिति:' : lang === 'mr' ? 'स्थिती:' : 'Status:'}
          </span>
          <span style={{ color: 'var(--emerald-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {currentStepObj.label}
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              ({statusStep}/5)
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

      {/* 5-Stage Stepper (Expanded on Demand) */}
      {showStepper && (
        <div style={{
          position: 'relative',
          marginBottom: '16px',
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
              const isCompleted = s.step <= statusStep;
              const isCurrent = s.step === statusStep;
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

      {/* Immutable Blockchain/GPS Traceability Box */}
      <div style={{
        backgroundColor: 'var(--bg-neutral)',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '16px',
        border: '1.5px solid var(--border-subtle)'
      }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '10px' }}>
          🛡️ {t('verifiedShield')}
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16} color="var(--success-green)" />
            <span>GPS: {transaction.gps}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="var(--accent-cyan)" />
            <span>{transaction.timestamp}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="var(--success-green)" />
            <span>{getLangText(transaction.recycler.name)} ({t('verifiedShield')})</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="var(--success-green)" />
            <span>{transaction.paymentMethod === 'Cash' ? t('cashPayment') : t('upiPayment')} ({t('paid')})</span>
          </div>
        </div>
      </div>

      {/* Official Receipt Action Button */}
      <button
        onClick={() => setShowReceipt(true)}
        className="btn-press"
        style={{
          width: '100%',
          minHeight: '48px',
          backgroundColor: 'var(--primary-blue)',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '14px',
          fontWeight: 800,
          fontSize: '0.92rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: 'pointer',
          boxShadow: 'var(--card-shadow)'
        }}
      >
        <FileText size={20} /> {t('viewReceipt')}
      </button>

      <BookingReceiptModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        bookingData={transaction}
      />
    </div>
  );
}
