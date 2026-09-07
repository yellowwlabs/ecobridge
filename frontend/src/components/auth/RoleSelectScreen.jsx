import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import { UserCheck, Truck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { speakText } from '../../utils/voiceAssistant';
import { api } from '../../utils/apiClient';

export default function RoleSelectScreen({ onRoleComplete }) {
  const { lang, t } = useLanguage();
  const { setActiveRole } = useAppData();
  const [selectedRole, setSelectedRole] = useState(''); // 'collector' (Vendor/Seller) | 'recycler' (Buyer)

  const roles = [
    {
      id: 'collector',
      title: "I'm a Vendor / Seller",
      titleHi: 'मैं स्क्रैप विक्रेता हूँ',
      desc: 'Sell scrap, e-waste & batteries for doorstep pickup and instant cash.',
      descHi: 'कबाड़, ई-वेस्ट और बैटरी बेचें - डोरस्टेप पिकअप और तुरंत भुगतान पाएँ',
      icon: UserCheck,
      color: '#3B82F6',
      badge: 'Seller View'
    },
    {
      id: 'recycler',
      title: "I'm a Recycler / Collector",
      titleHi: 'मैं रिसाइक्लर / ख़रीदार हूँ',
      desc: 'Buy scrap lots, verify weights & issue digital recycling certificates.',
      descHi: 'स्क्रैप खरीदें, वज़न सत्यापित करें और डिजिटल सर्टिफिकेट जारी करें',
      icon: Truck,
      color: '#10B981',
      badge: 'Buyer View'
    }
  ];

  const handleConfirmRole = () => {
    if (!selectedRole) return;

    setActiveRole(selectedRole);
    localStorage.setItem('kabadiwala_user_role', selectedRole);

    // Call backend profile update
    api.updateProfile({ active_role: selectedRole }).catch(err => console.warn('Profile role update fallback:', err));

    const voiceMsg = selectedRole === 'recycler'
      ? 'Welcome! Recycler Dashboard selected.'
      : 'Welcome! Vendor Seller Dashboard selected.';
    speakText(voiceMsg, lang);

    onRoleComplete(selectedRole);
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
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            color: 'var(--primary-blue, #3B82F6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px auto'
          }}>
            <UserCheck size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary, #0F172A)', margin: '0 0 6px 0' }}>
            Who are you?
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted, #64748B)', margin: 0, fontWeight: 600 }}>
            Tell us how you'll be using EcoBridge
          </p>
        </div>

        {/* Role Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
          {roles.map((role) => {
            const isSelected = selectedRole === role.id;
            const IconComp = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className="touch-target btn-press"
                style={{
                  width: '100%',
                  padding: '18px',
                  borderRadius: '16px',
                  backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-neutral, #F8FAFC)',
                  border: isSelected ? `2.5px solid ${role.color}` : '1.5px solid var(--border-subtle, #E2E8F0)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.18s ease'
                }}
              >
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: isSelected ? role.color : 'rgba(100, 116, 139, 0.1)',
                  color: isSelected ? '#FFFFFF' : role.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <IconComp size={24} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary, #0F172A)' }}>
                      {role.title}
                    </span>
                    {isSelected && <CheckCircle2 size={22} color={role.color} />}
                  </div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted, #64748B)', fontWeight: 600, display: 'block', lineHeight: 1.35 }}>
                    {role.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Primary CTA Button */}
        <button
          onClick={handleConfirmRole}
          disabled={!selectedRole}
          className="btn-press"
          style={{
            width: '100%',
            minHeight: '52px',
            backgroundColor: selectedRole ? 'var(--primary-blue, #3B82F6)' : 'var(--border-subtle, #CBD5E1)',
            color: selectedRole ? '#FFFFFF' : 'var(--text-muted, #64748B)',
            border: 'none',
            borderRadius: '12px',
            padding: '14px',
            fontWeight: 800,
            fontSize: '1.05rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: selectedRole ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.2s'
          }}
        >
          Continue <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
