import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import { Home, Camera, FileText, Users } from 'lucide-react';

export default function BottomNav() {
  const { t } = useLanguage();
  const { activeTab, setActiveTab } = useAppData();

  const tabs = [
    { id: 'home', label: t('tabHome'), icon: Home },
    { id: 'sell', label: t('tabSell'), icon: Camera, highlight: true },
    { id: 'history', label: t('tabHistory'), icon: FileText },
    { id: 'community', label: t('tabCommunity'), icon: Users }
  ];

  return (
    <nav className="glass-nav" style={{
      position: 'sticky',
      bottom: 0,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '6px 0 10px 0',
      zIndex: 100
    }}>
      {tabs.map(tab => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="btn-press"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              minWidth: '64px',
              minHeight: '56px',
              color: isActive ? 'var(--primary-accent)' : 'var(--text-muted)',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            {tab.highlight ? (
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-accent)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '-18px',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                border: '3px solid var(--surface-white)'
              }}>
                <IconComponent size={24} />
              </div>
            ) : (
              <IconComponent size={22} color={isActive ? 'var(--primary-accent)' : 'var(--text-muted)'} />
            )}
            
            <span style={{
              fontSize: '0.75rem',
              fontWeight: isActive ? 800 : 600,
              marginTop: tab.highlight ? '2px' : '4px',
              color: isActive ? 'var(--primary-accent)' : 'var(--text-muted)'
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
