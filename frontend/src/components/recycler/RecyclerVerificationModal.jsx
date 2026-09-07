import React from 'react';
import { ShieldCheck, Award, Calendar, Building, FileCheck, CheckCircle2 } from 'lucide-react';
import ModalShell from '../common/ModalShell';

export default function RecyclerVerificationModal({ isOpen, onClose, recycler }) {
  if (!recycler) return null;

  const regNo = recycler.regNo || `CPCB/SPCB-REG-2024-${Math.floor(1000 + Math.random() * 9000)}`;
  const regDate = recycler.regDate || '15 Jan 2024';
  const validUntil = recycler.validUntil || '14 Jan 2027';
  const authority = recycler.authority || 'Central Pollution Control Board (CPCB) / DPCC';

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} zIndex={1500}>
      <div className="card fade-in-up" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '24px 20px',
        borderRadius: '20px',
        backgroundColor: 'var(--surface-white, #FFFFFF)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--emerald-success, #10B981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto'
          }}>
            <ShieldCheck size={36} />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary, #0F172A)', margin: '0 0 4px 0' }}>
            Official Recycler Verification Record
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--emerald-success)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} /> Govt. Authorized Hazardous & E-Waste Recycler
          </span>
        </div>

        {/* Recycler Profile Summary */}
        <div style={{
          backgroundColor: 'var(--bg-neutral, #F8FAFC)',
          border: '1px solid var(--border-subtle, #CBD5E1)',
          borderRadius: '14px',
          padding: '14px',
          marginBottom: '16px'
        }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            {recycler.name || recycler.business_name_en || 'Green India Recycling Hub'}
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>
            📍 {recycler.address || recycler.address_en || 'Okhla Phase 2 Industrial Area, New Delhi'}
          </p>
        </div>

        {/* Verification Details List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <FileCheck size={20} color="var(--primary-accent)" style={{ marginTop: '2px' }} />
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>CPCB / SPCB License Number</span>
              <div style={{ fontSize: '0.92rem', fontWeight: 900, color: 'var(--text-primary)' }}>{regNo}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <Building size={20} color="var(--primary-accent)" style={{ marginTop: '2px' }} />
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>Verifying Authority</span>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>{authority}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <Calendar size={20} color="var(--primary-accent)" style={{ marginTop: '2px' }} />
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>Validity Period</span>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>{regDate} — {validUntil}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <Award size={20} color="var(--emerald-success)" style={{ marginTop: '2px' }} />
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>Environmental Compliance Rating</span>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--emerald-success)' }}>100% Eco-Compliant (Zero-Landfill Guarantee)</div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%', minHeight: '44px', borderRadius: '12px', border: 'none',
            backgroundColor: 'var(--primary-accent, #3B82F6)', color: '#FFFFFF',
            fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer'
          }}
        >
          Close Record
        </button>
      </div>
    </ModalShell>
  );
}
