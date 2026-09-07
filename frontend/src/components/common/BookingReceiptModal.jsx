import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { speakText } from '../../utils/voiceAssistant';
import { triggerHaptic } from '../../utils/haptics';
import { X, Download, Share2, ShieldCheck, CheckCircle2, QrCode, Printer, MapPin, Calendar, Volume2 } from 'lucide-react';

import ModalShell from './ModalShell';

export default function BookingReceiptModal({ isOpen, onClose, bookingData }) {
  const { lang, t, getLangText } = useLanguage();

  if (!bookingData) return null;

  const refNumber = bookingData.id || 'BK-2026-9821';
  const materialTitle = getLangText(bookingData.materialName) || t('sellLot');
  const weight = bookingData.weightKg || 10;
  const rate = bookingData.estimatedRate || 680;
  const total = bookingData.totalPrice || weight * rate;
  const recyclerName = getLangText(bookingData.recycler?.name) || 'Green Recycling Hub';
  const timestamp = getLangText(bookingData.pickupDate) || bookingData.timestamp || 'Today at 2:30 PM';
  const location = bookingData.gps || 'Okhla Phase 2, New Delhi';
  const paymentMode = bookingData.paymentMethod || 'UPI Instant';
  const co2Saved = (weight * 1.8).toFixed(1);

  const handleDownload = () => {
    triggerHaptic('medium');
    const element = document.createElement('a');
    const file = new Blob([
      `ECOBRIDGE — OFFICIAL DIGITAL RECEIPT\n` +
      `---------------------------------------------\n` +
      `Receipt Ref: ${refNumber}\n` +
      `Date & Time: ${new Date().toLocaleString()}\n` +
      `Material: ${materialTitle}\n` +
      `Weight: ${weight} kg @ ₹${rate}/kg\n` +
      `Total Value: ₹${total}\n` +
      `Recycler: ${recyclerName}\n` +
      `Location: ${location}\n` +
      `Payment Mode: ${paymentMode}\n` +
      `CO2 Emissions Saved: ${co2Saved} kg\n` +
      `---------------------------------------------\n` +
      `Govt. Authorized Eco-Recycling System`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Receipt_${refNumber}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleShareWhatsApp = () => {
    triggerHaptic('light');
    const text = encodeURIComponent(
      `📄 *EcoBridge Official Receipt*\nRef: ${refNumber}\nMaterial: ${materialTitle} (${weight} kg)\nTotal Amount: ₹${total}\nRecycler: ${recyclerName}\nStatus: Verified Pickup Scheduled ✅`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleSpeakReceipt = () => {
    triggerHaptic('light');
    const speechText = `${t('receiptTitle')}. ${materialTitle}, ${weight} kg, ${t('totalAmount')} ${total} rupees. ${recyclerName}.`;
    speakText(speechText, lang);
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} maxWidth="420px">
      {/* Receipt Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0A2540 0%, #1A365D 100%)',
          color: '#FFFFFF',
          padding: '20px',
          position: 'relative'
        }}
      >
        <button
          onClick={() => {
            triggerHaptic('light');
            onClose();
          }}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.15)',
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            color: '#4ADE80',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <ShieldCheck size={14} /> {t('authorizedSeal')}
          </span>
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '4px 0', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
          {t('receiptTitle')}
        </h2>
        <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: 0 }}>
          {t('bookingRef')}: <strong style={{ color: '#FFFFFF' }}>#{refNumber}</strong>
        </p>
      </div>

      {/* Paper Receipt Content Body */}
      <div style={{ padding: '20px', backgroundColor: '#FAFAFA', overflowY: 'auto' }}>
        
        {/* QR Code & Digital Stamp Row */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            border: '1px dashed #CBD5E1',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              {t('pickupSlot')}
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} color="var(--primary-blue)" /> {timestamp}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} color="var(--emerald-success)" /> {location}
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '6px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <QrCode size={44} color="#0F172A" />
            <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#475569', letterSpacing: '0.5px', marginTop: '2px' }}>
              VERIFIED
            </div>
          </div>
        </div>

        {/* Itemized Valuation Table */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '16px', marginBottom: '16px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            📋 {t('itemDetails')}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {materialTitle}
            </span>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {weight} kg
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {t('unitRate')}
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              ₹{rate} / kg
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Recycler Partner
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-blue)' }}>
              🏢 {recyclerName}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 4px 0', marginTop: '4px' }}>
            <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              {t('totalAmount')}
            </span>
            <span className="numeral-huge" style={{ fontSize: '1.4rem', color: 'var(--emerald-success)' }}>
              ₹{total}
            </span>
          </div>
        </div>

        {/* Environmental Impact Green Stamp */}
        <div
          style={{
            backgroundColor: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '14px',
            padding: '12px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <CheckCircle2 size={24} color="#16A34A" />
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#15803D' }}>
              🌱 {t('ecoImpactCert')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#166534' }}>
              +{co2Saved} kg {t('co2Diverted')}
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleDownload}
              className="btn-press"
              style={{
                flex: 1,
                minHeight: '44px',
                backgroundColor: 'var(--primary-blue)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Download size={16} /> {t('downloadReceipt')}
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="btn-press"
              style={{
                flex: 1,
                minHeight: '44px',
                backgroundColor: '#25D366',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Share2 size={16} /> {t('shareWhatsapp')}
            </button>
          </div>

          <button
            onClick={handleSpeakReceipt}
            className="btn-press"
            style={{
              width: '100%',
              minHeight: '40px',
              backgroundColor: 'var(--bg-neutral)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Volume2 size={16} color="var(--primary-blue)" /> 🔊 Audio Receipt Summary
          </button>
        </div>

      </div>
    </ModalShell>
  );
}
