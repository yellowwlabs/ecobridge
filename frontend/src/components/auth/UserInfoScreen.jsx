import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import { User, MapPin, Store, Phone, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { speakText } from '../../utils/voiceAssistant';
import { api } from '../../utils/apiClient';

export default function UserInfoScreen({ onUserInfoComplete }) {
  const { lang, t } = useLanguage();
  const { activeRole, updateUserProfile } = useAppData();

  const [name, setName] = useState('');
  const [operatingArea, setOperatingArea] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Phone number is read-only from verified session
  const verifiedPhone = localStorage.getItem('kabadiwala_verified_mobile') || '+91 9871234567';
  const isRecycler = activeRole === 'recycler';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!name.trim()) {
      setValidationError('Please enter your full name');
      return;
    }

    if (!operatingArea.trim()) {
      setValidationError('Please enter your operating area or serving zone');
      return;
    }

    if (isRecycler && !storeAddress.trim()) {
      setValidationError('Store / Pickup location address is required for Recycler/Collector accounts');
      return;
    }

    setIsSubmitting(true);

    const profileData = {
      name: name.trim(),
      operatingArea: operatingArea.trim(),
      storeAddress: storeAddress.trim(),
      mobileNumber: verifiedPhone
    };

    // Save profile in state and localStorage
    updateUserProfile(profileData);

    // Call API backend profile update
    try {
      await api.updateProfile({
        name: name.trim(),
        operating_area: operatingArea.trim(),
        store_address: storeAddress.trim()
      }).catch(err => console.warn('Profile backend sync fallback:', err));
    } catch (err) {
      console.warn('Backend update error:', err);
    } finally {
      setIsSubmitting(false);
    }

    speakText(t('loginSuccessVoice') || 'Profile setup complete', lang);
    onUserInfoComplete();
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-neutral)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px 16px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div className="card fade-in-up" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '28px 20px',
        borderRadius: '20px',
        backgroundColor: 'var(--surface-white, #FFFFFF)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            color: 'var(--primary-blue, #3B82F6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto'
          }}>
            <User size={30} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-primary, #0F172A)', margin: '0 0 4px 0' }}>
            Complete Your Profile
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748B)', margin: 0, fontWeight: 600 }}>
            Enter your details to get started on EcoBridge
          </p>
        </div>

        {validationError && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '0.84rem',
            color: '#DC2626',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} color="#DC2626" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Verified Phone Number (Read-only context) */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted, #64748B)', display: 'block', marginBottom: '4px' }}>
              Verified Mobile Number (Read-Only):
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-neutral, #F8FAFC)',
              border: '1px solid var(--border-subtle, #CBD5E1)',
              borderRadius: '10px',
              padding: '10px 12px',
              gap: '8px',
              color: 'var(--text-muted, #64748B)',
              fontWeight: 800,
              fontSize: '0.95rem'
            }}>
              <Phone size={16} color="var(--emerald-success, #10B981)" />
              <span style={{ flex: 1 }}>{verifiedPhone}</span>
              <ShieldCheck size={18} color="var(--emerald-success, #10B981)" />
            </div>
          </div>

          {/* Full Name Input (Empty by default) */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary, #0F172A)', display: 'block', marginBottom: '4px' }}>
              Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setValidationError('');
                }}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 38px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--primary-accent, #3B82F6)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  outline: 'none',
                  backgroundColor: 'var(--surface-white, #FFFFFF)',
                  color: 'var(--text-primary, #0F172A)'
                }}
              />
              <User size={18} color="var(--text-muted, #64748B)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
          </div>

          {/* Operating Area / Serving Zone Input (Empty by default) */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary, #0F172A)', display: 'block', marginBottom: '4px' }}>
              Operating Area / Serving Zone *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                placeholder="e.g. Okhla Phase 2, New Delhi"
                value={operatingArea}
                onChange={(e) => {
                  setOperatingArea(e.target.value);
                  setValidationError('');
                }}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 38px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--primary-accent, #3B82F6)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  outline: 'none',
                  backgroundColor: 'var(--surface-white, #FFFFFF)',
                  color: 'var(--text-primary, #0F172A)'
                }}
              />
              <MapPin size={18} color="var(--text-muted, #64748B)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
          </div>

          {/* Store / Pickup Location Address Input (Empty by default) */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary, #0F172A)', display: 'block', marginBottom: '4px' }}>
              Store / Pickup Location Address {isRecycler ? '*' : '(Optional)'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required={isRecycler}
                placeholder="e.g. Shop No. 12, Okhla Industrial Area, New Delhi"
                value={storeAddress}
                onChange={(e) => {
                  setStoreAddress(e.target.value);
                  setValidationError('');
                }}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 38px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--primary-accent, #3B82F6)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  outline: 'none',
                  backgroundColor: 'var(--surface-white, #FFFFFF)',
                  color: 'var(--text-primary, #0F172A)'
                }}
              />
              <Store size={18} color="var(--text-muted, #64748B)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !name.trim() || !operatingArea.trim()}
            className="btn-press"
            style={{
              width: '100%',
              minHeight: '52px',
              backgroundColor: (name.trim() && operatingArea.trim()) ? 'var(--primary-blue, #3B82F6)' : 'var(--border-subtle, #CBD5E1)',
              color: (name.trim() && operatingArea.trim()) ? '#FFFFFF' : 'var(--text-muted, #64748B)',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              fontWeight: 800,
              fontSize: '1.05rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: (name.trim() && operatingArea.trim()) ? 'pointer' : 'not-allowed',
              marginTop: '8px',
              transition: 'background-color 0.2s'
            }}
          >
            {isSubmitting ? 'Saving Profile...' : 'Save & Continue'} <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
