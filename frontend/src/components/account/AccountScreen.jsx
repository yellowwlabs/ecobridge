import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import { useTheme } from '../../context/ThemeContext';
import {
  MapPin, Globe, Phone, Edit2, ArrowLeft, Moon, Sun, Bell, CreditCard,
  HelpCircle, Info, LogOut, Trash2, ShieldCheck, ChevronRight
} from 'lucide-react';
import ModalShell from '../common/ModalShell';

export default function AccountScreen({ onClose, onChangeLanguageClick, onLogout }) {
  const { lang, t } = useLanguage();
  const { transactions, activeRole, setActiveRole, userProfile, updateUserProfile } = useAppData();
  const { theme, toggleTheme } = useTheme();

  // Profile State synced with userProfile context & localStorage
  const [isEditing, setIsEditing] = useState(false);
  const [profileName, setProfileName] = useState(() => userProfile?.name || 'Raju Collector');
  const [operatingArea, setOperatingArea] = useState(() => userProfile?.operatingArea || 'Okhla Phase 2, New Delhi');
  const [storeAddress, setStoreAddress] = useState(() => userProfile?.storeAddress || 'Shop No. 12, Okhla Industrial Area');

  // Keep local state synced if userProfile context updates
  React.useEffect(() => {
    if (userProfile?.name) setProfileName(userProfile.name);
    if (userProfile?.operatingArea) setOperatingArea(userProfile.operatingArea);
    if (userProfile?.storeAddress) setStoreAddress(userProfile.storeAddress);
  }, [userProfile]);

  const mobileNumber = userProfile?.mobileNumber || localStorage.getItem('kabadiwala_verified_mobile') || '+91 9871234567';

  // Initials generator for neutral avatar (no stock photo)
  const getInitials = (nameStr) => {
    if (!nameStr) return 'EB';
    const parts = nameStr.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return nameStr.slice(0, 2).toUpperCase();
  };

  // Linked UPI State
  const [upiId, setUpiId] = useState('raju@upi');
  const [isEditingUpi, setIsEditingUpi] = useState(false);

  // Notification Toggles State
  const [pushEnabled, setPushEnabled] = useState(true);
  const [pickupAlerts, setPickupAlerts] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [communityAlerts, setCommunityAlerts] = useState(false);

  // Confirmation Modals State
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  // Stats
  const totalEarned = transactions.reduce((acc, tr) => acc + (tr.status === 'Paid' ? tr.totalPrice : 0), 0);
  const completedCount = transactions.filter(tr => tr.status === 'Paid').length;
  const pendingCount = transactions.filter(tr => tr.status !== 'Paid').length;
  const totalLots = transactions.length;

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    localStorage.removeItem('kabadiwala_auth_token');
    localStorage.removeItem('kabadiwala_user_profile');
    localStorage.removeItem('kabadiwala_profile_setup_done');
    localStorage.removeItem('kabadiwala_user_role');
    localStorage.removeItem('kabadiwala_verified_mobile');
    updateUserProfile({ name: '', operatingArea: '', storeAddress: '', mobileNumber: '' });
    if (onLogout) {
      onLogout();
    } else {
      onClose();
    }
  };

  const handleConfirmDeleteAccount = () => {
    setShowDeleteConfirm(false);
    localStorage.removeItem('kabadiwala_auth_token');
    localStorage.removeItem('kabadiwala_user_profile');
    localStorage.removeItem('kabadiwala_profile_setup_done');
    localStorage.removeItem('kabadiwala_user_role');
    localStorage.removeItem('kabadiwala_verified_mobile');
    updateUserProfile({ name: '', operatingArea: '', storeAddress: '', mobileNumber: '' });
    if (onLogout) {
      onLogout();
    } else {
      onClose();
    }
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    updateUserProfile({
      name: profileName,
      operatingArea: operatingArea,
      storeAddress: storeAddress
    });
  };

  return (
    <div className="fade-in-up" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'var(--bg-neutral)',
      color: 'var(--text-primary)',
      zIndex: 1500,
      overflowY: 'auto',
      padding: '0 0 50px 0'
    }}>
      {/* Header */}
      <div className="glass-header" style={{
        backgroundColor: 'var(--primary-deep)',
        color: '#FFFFFF',
        height: '56px',
        padding: '0 16px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 10px rgba(17, 24, 39, 0.12)'
      }}>
        <button
          onClick={onClose}
          className="btn-press"
          aria-label="Back"
          style={{
            background: 'rgba(255,255,255,0.12)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={20} />
        </button>

        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
          ⚙️ Settings & Account
        </h2>

        <div style={{ width: '36px' }} />
      </div>

      <div style={{ maxWidth: '440px', margin: '16px auto', padding: '0 12px' }}>

        {/* 1. Profile Section Card */}
        <div className="card" style={{ marginBottom: '16px', position: 'relative' }}>
          <button
            onClick={() => setIsEditing(!isEditing)}
            style={{
              position: 'absolute', top: '14px', right: '14px',
              backgroundColor: 'var(--bg-neutral)', border: '1px solid var(--divider-hairline)',
              borderRadius: '10px', padding: '6px 12px', fontSize: '0.78rem', fontWeight: 800,
              color: 'var(--primary-accent)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer'
            }}
          >
            <Edit2 size={14} /> {isEditing ? t('tab_view') || 'View' : t('tab_edit') || 'Edit'}
          </button>

          {!isEditing ? (
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              {/* Neutral Initials Badge Avatar */}
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-accent)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.5rem',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                border: '2px solid #FFFFFF'
              }}>
                {getInitials(profileName)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {profileName}
                  </h3>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '8px',
                    backgroundColor: activeRole === 'recycler' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                    color: activeRole === 'recycler' ? 'var(--emerald-success)' : 'var(--primary-accent)'
                  }}>
                    {activeRole === 'recycler' ? 'Recycler / Collector' : 'Vendor / Seller'}
                  </span>
                </div>

                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={14} /> {mobileNumber} <span style={{ fontSize: '0.7rem', color: 'var(--emerald-success)', fontWeight: 800 }}>✓ Verified</span>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} color="var(--primary-accent)" /> <strong>Serving Zone:</strong> {operatingArea}
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.3 }}>
                  🏬 <strong>Store Address:</strong> {storeAddress}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Full Name:</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '10px',
                    border: '1.5px solid var(--primary-accent)', fontWeight: 800, fontSize: '0.95rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Account Role:</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveRole('collector')}
                    style={{
                      flex: 1, padding: '8px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800,
                      backgroundColor: activeRole === 'collector' ? 'var(--primary-accent)' : 'var(--bg-neutral)',
                      color: activeRole === 'collector' ? '#FFFFFF' : 'var(--text-muted)',
                      border: '1px solid var(--border-subtle)', cursor: 'pointer'
                    }}
                  >
                    Vendor / Seller
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveRole('recycler')}
                    style={{
                      flex: 1, padding: '8px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800,
                      backgroundColor: activeRole === 'recycler' ? 'var(--emerald-success)' : 'var(--bg-neutral)',
                      color: activeRole === 'recycler' ? '#FFFFFF' : 'var(--text-muted)',
                      border: '1px solid var(--border-subtle)', cursor: 'pointer'
                    }}
                  >
                    Recycler / Collector
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Phone Number (View-only):</label>
                <input
                  type="text"
                  disabled
                  value="+91 9871234567"
                  style={{
                    width: '100%', padding: '10px', borderRadius: '10px',
                    border: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: '0.95rem',
                    backgroundColor: 'var(--bg-neutral)', color: 'var(--text-muted)'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Operating Area / Serving Zone:</label>
                <input
                  type="text"
                  value={operatingArea}
                  onChange={(e) => setOperatingArea(e.target.value)}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '10px',
                    border: '1.5px solid var(--primary-accent)', fontWeight: 800, fontSize: '0.95rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Store / Pickup Location Address:</label>
                <input
                  type="text"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  placeholder="e.g. Shop No. 12, Okhla Industrial Area, New Delhi"
                  style={{
                    width: '100%', padding: '10px', borderRadius: '10px',
                    border: '1.5px solid var(--primary-accent)', fontWeight: 800, fontSize: '0.95rem'
                  }}
                />
              </div>

              <button
                onClick={handleSaveProfile}
                style={{
                  width: '100%', backgroundColor: 'var(--primary-accent)', color: '#FFFFFF',
                  border: 'none', borderRadius: '12px', padding: '12px', fontWeight: 800, cursor: 'pointer'
                }}
              >
                Save Profile Changes
              </button>
            </div>
          )}
        </div>

        {/* Stat Overview Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div className="card" style={{ borderLeft: '4px solid var(--emerald-success)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{t('totalEarnings') || 'Total Earnings'}</span>
            <div className="numeral-huge" style={{ fontSize: '1.5rem', color: 'var(--emerald-success)', marginTop: '4px' }}>
              ₹{totalEarned.toLocaleString()}
            </div>
          </div>

          <div className="card" style={{ borderLeft: '4px solid var(--primary-accent)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{t('totalLots') || 'Lots Sold'}</span>
            <div className="numeral-huge" style={{ fontSize: '1.5rem', color: 'var(--primary-accent)', marginTop: '4px' }}>
              {totalLots}
            </div>
          </div>
        </div>

        {/* 2. App Theme & Appearance Section */}
        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '8px', paddingLeft: '4px' }}>
          APPEARANCE & LANGUAGE
        </span>

        <div className="card" style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Dark Mode Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {theme === 'dark' ? <Moon size={22} color="#3B82F6" /> : <Sun size={22} color="#F59E0B" />}
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Dark Mode
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {theme === 'dark' ? 'Dark theme enabled' : 'Light theme enabled'}
                </span>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="btn-press"
              style={{
                width: '52px',
                height: '30px',
                borderRadius: '16px',
                backgroundColor: theme === 'dark' ? '#3B82F6' : '#CBD5E1',
                border: 'none',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background-color 0.25s'
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                position: 'absolute',
                top: '3px',
                left: theme === 'dark' ? '25px' : '3px',
                transition: 'left 0.25s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--divider-hairline)' }} />

          {/* Language Change Selector */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Globe size={22} color="var(--primary-accent)" />
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  App Language
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {lang === 'hi' ? 'हिंदी (Hindi)' : lang === 'mr' ? 'मराठी (Marathi)' : 'English'}
                </span>
              </div>
            </div>

            <button
              onClick={onChangeLanguageClick}
              style={{
                padding: '6px 14px', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: 'var(--primary-accent)', border: 'none', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer'
              }}
            >
              Change
            </button>
          </div>
        </div>

        {/* 3. Linked UPI ID Payment Settings */}
        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '8px', paddingLeft: '4px' }}>
          PAYMENT & WALLET
        </span>

        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CreditCard size={22} color="var(--emerald-success)" />
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Linked UPI ID
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Used for instant cash-outs & loyalty conversion
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsEditingUpi(!isEditingUpi)}
              style={{
                padding: '6px 14px', borderRadius: '10px', backgroundColor: 'rgba(34, 197, 94, 0.1)',
                color: 'var(--emerald-success)', border: 'none', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer'
              }}
            >
              {isEditingUpi ? 'Done' : 'Edit'}
            </button>
          </div>

          {!isEditingUpi ? (
            <div style={{ marginTop: '10px', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', backgroundColor: 'var(--bg-neutral)', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{upiId}</span>
              <ShieldCheck size={18} color="var(--emerald-success)" />
            </div>
          ) : (
            <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@upi"
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: '8px',
                  border: '1.5px solid var(--primary-accent)', fontWeight: 700
                }}
              />
              <button
                onClick={() => setIsEditingUpi(false)}
                style={{
                  padding: '8px 14px', backgroundColor: 'var(--primary-accent)', color: '#FFFFFF',
                  border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer'
                }}
              >
                Save
              </button>
            </div>
          )}
        </div>

        {/* 4. Notifications Section */}
        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '8px', paddingLeft: '4px' }}>
          NOTIFICATION PREFERENCES
        </span>

        <div className="card" style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bell size={20} color="var(--primary-accent)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>Push Notifications</span>
            </div>
            <input
              type="checkbox"
              checked={pushEnabled}
              onChange={(e) => setPushEnabled(e.target.checked)}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '30px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Pickup Updates</span>
            <input
              type="checkbox"
              disabled={!pushEnabled}
              checked={pushEnabled && pickupAlerts}
              onChange={(e) => setPickupAlerts(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '30px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Daily Price Alerts</span>
            <input
              type="checkbox"
              disabled={!pushEnabled}
              checked={pushEnabled && priceAlerts}
              onChange={(e) => setPriceAlerts(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '30px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Community Posts</span>
            <input
              type="checkbox"
              disabled={!pushEnabled}
              checked={pushEnabled && communityAlerts}
              onChange={(e) => setCommunityAlerts(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* 5. Support & About Section */}
        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '8px', paddingLeft: '4px' }}>
          SUPPORT & ABOUT
        </span>

        <div className="card" style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => setShowHelpModal(true)}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <HelpCircle size={20} color="var(--primary-accent)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>Help & Support</span>
            </div>
            <ChevronRight size={18} color="var(--text-muted)" />
          </button>

          <div style={{ height: '1px', backgroundColor: 'var(--divider-hairline)' }} />

          <button
            onClick={() => setShowAboutModal(true)}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Info size={20} color="var(--primary-accent)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>About & Version (v1.0.4)</span>
            </div>
            <ChevronRight size={18} color="var(--text-muted)" />
          </button>
        </div>

        {/* 6. Destructive Actions: Logout & Delete Account */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="btn-press"
            style={{
              width: '100%',
              minHeight: '48px',
              backgroundColor: '#FEF2F2',
              border: '1.5px solid #FCA5A5',
              borderRadius: '12px',
              color: '#DC2626',
              fontWeight: 800,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <LogOut size={18} /> Log Out
          </button>

          {/* Delete Account Button */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn-press"
            style={{
              width: '100%',
              minHeight: '44px',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Trash2 size={15} color="#DC2626" /> Delete Account
          </button>
        </div>

      </div>

      {/* Logout Confirmation Dialog */}
      <ModalShell isOpen={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} zIndex={1600}>
        <div className="card" style={{ width: '100%', maxWidth: '380px', padding: '24px', textAlign: 'center', backgroundColor: 'var(--surface-white)' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            backgroundColor: '#FEF2F2', color: '#DC2626',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px auto'
          }}>
            <LogOut size={28} />
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Are you sure you want to log out?
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Logging out will end your active session on this device. You will need to verify with OTP to log in again.
          </p>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowLogoutConfirm(false)}
              style={{
                flex: 1, minHeight: '44px', borderRadius: '10px',
                border: '1px solid var(--border-subtle)', background: 'none',
                fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmLogout}
              style={{
                flex: 1, minHeight: '44px', borderRadius: '10px',
                border: 'none', backgroundColor: '#DC2626',
                color: '#FFFFFF', fontWeight: 800, cursor: 'pointer'
              }}
            >
              Log Out
            </button>
          </div>
        </div>
      </ModalShell>

      {/* Delete Account Confirmation Dialog */}
      <ModalShell isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} zIndex={1600}>
        <div className="card" style={{ width: '100%', maxWidth: '380px', padding: '24px', textAlign: 'center', backgroundColor: 'var(--surface-white)' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            backgroundColor: '#FEF2F2', color: '#DC2626',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px auto'
          }}>
            <Trash2 size={28} />
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#DC2626', marginBottom: '8px' }}>
            Delete Account Permanently?
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            This action is permanent. All your lot records, transaction history, and loyalty points balance will be deleted.
          </p>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              style={{
                flex: 1, minHeight: '44px', borderRadius: '10px',
                border: '1px solid var(--border-subtle)', background: 'none',
                fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDeleteAccount}
              style={{
                flex: 1, minHeight: '44px', borderRadius: '10px',
                border: 'none', backgroundColor: '#DC2626',
                color: '#FFFFFF', fontWeight: 800, cursor: 'pointer'
              }}
            >
              Delete Account
            </button>
          </div>
        </div>
      </ModalShell>

      {/* Help & Support Modal */}
      <ModalShell isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} zIndex={1600}>
        <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '20px', backgroundColor: 'var(--surface-white)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
            📞 Help & Support
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.4 }}>
            Need help with rate calculations, recycler handovers, or loyalty payouts?
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--bg-neutral)', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Toll-Free Helpline</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-accent)' }}>+91 1800 123 4567</div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--bg-neutral)', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Support Email</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>support@ecobridge.org</div>
            </div>
          </div>

          <button
            onClick={() => setShowHelpModal(false)}
            style={{
              width: '100%', padding: '12px', backgroundColor: 'var(--primary-accent)',
              color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </ModalShell>

      {/* About Modal */}
      <ModalShell isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} zIndex={1600}>
        <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '20px', backgroundColor: 'var(--surface-white)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            ℹ️ About EcoBridge
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Version 1.0.4 (Build 8921)
          </p>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '16px' }}>
            EcoBridge is a smart recycling platform that connects informal scrap collectors with verified formal recyclers through AI-powered scrap valuation, live pricing, smart matching, and end-to-end digital traceability.
          </p>

          <button
            onClick={() => setShowAboutModal(false)}
            style={{
              width: '100%', padding: '12px', backgroundColor: 'var(--primary-accent)',
              color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </ModalShell>
    </div>
  );
}
