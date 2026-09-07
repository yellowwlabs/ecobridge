import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import { Cpu, Leaf, ShieldCheck, ArrowRight, BatteryCharging } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

import ewasteImpactHandsImg from '../../assets/images/ewaste_impact_hands.jpg';

export default function EWasteImpactCard() {
  const { t } = useLanguage();
  const { setActiveTab } = useAppData();

  const handleAction = () => {
    triggerHaptic('light');
    setActiveTab('sell');
  };

  return (
    <div
      className="card fade-in-up"
      style={{
        backgroundColor: '#14213D',
        color: '#FFFFFF',
        borderRadius: '20px',
        padding: '20px',
        marginBottom: '16px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(20, 33, 61, 0.25)',
        border: '1px solid rgba(59, 130, 246, 0.2)'
      }}
    >
      {/* Background Subtle Mesh / Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(20, 33, 61, 0) 70%)',
          pointerEvents: 'none'
        }}
      />

      {/* Header Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3B82F6'
            }}
          >
            <Cpu size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
              {t('eWasteImpactTitle')}
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0 }}>
              {t('eWasteImpactDesc')}
            </p>
          </div>
        </div>
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 800,
            padding: '4px 8px',
            borderRadius: '12px',
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            color: '#22C55E',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <ShieldCheck size={12} />
          {t('verified')}
        </span>
      </div>

      {/* Supporting Photo Header */}
      <div className="photo-mount" style={{ height: '90px', borderRadius: '12px', marginBottom: '14px' }}>
        <img
          src={ewasteImpactHandsImg}
          alt="E-Waste Sorting & Recycling"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Environmental Impact Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginBottom: '16px'
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60A5FA'
            }}
          >
            <BatteryCharging size={18} />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>
              {t('eWasteDiverted')}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
              {t('eWasteLabel')}
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(34, 197, 94, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4ADE80'
            }}
          >
            <Leaf size={18} />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>
              {t('co2Saved')}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
              {t('co2Label')}
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleAction}
        style={{
          width: '100%',
          backgroundColor: '#3B82F6',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '12px',
          padding: '12px',
          fontWeight: 700,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
          transition: 'all 0.2s ease'
        }}
      >
        <span>{t('scheduleEWastePickup')}</span>
        <ArrowRight size={18} />
      </button>
    </div>
  );
}
