import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AppDataProvider, useAppData } from './context/AppDataContext';
import Header from './components/common/Header';
import BottomNav from './components/common/BottomNav';
import VoiceModal from './components/common/VoiceModal';
import SafetyAlertModal from './components/common/SafetyAlertModal';
import HardToSellModal from './components/sell/HardToSellModal';
import PullToRefresh from './components/common/PullToRefresh';
import ErrorBoundary from './components/common/ErrorBoundary';

// Onboarding & Account
import SplashScreen from './components/auth/SplashScreen';
import LoginScreen from './components/auth/LoginScreen';
import RoleSelectScreen from './components/auth/RoleSelectScreen';
import UserInfoScreen from './components/auth/UserInfoScreen';
import LanguageSelectScreen from './components/auth/LanguageSelectScreen';
import AccountScreen from './components/account/AccountScreen';

// Home components
import PrimaryActionRow from './components/home/PrimaryActionRow';
import PriceBoardCard from './components/home/PriceBoardCard';
import ActiveTxCard from './components/home/ActiveTxCard';
import LoyaltyPointsCard from './components/home/LoyaltyPointsCard';
import EWasteImpactCard from './components/home/EWasteImpactCard';
import HardToSellCard from './components/home/HardToSellCard';
import BatteryRecoveryCard from './components/home/BatteryRecoveryCard';
import NearbyRecyclers from './components/home/NearbyRecyclers';
import SafetyTipsCarousel from './components/home/SafetyTipsCarousel';
import CommunityPreview from './components/home/CommunityPreview';

// Other tab views
import SellFlowManager from './components/sell/SellFlowManager';
import TransactionList from './components/history/TransactionList';
import CommunityFeed from './components/community/CommunityFeed';
import RecyclerDashboard from './components/recycler/RecyclerDashboard';

function MainAppContent() {
  const { activeRole, activeTab, isOffline } = useAppData();
  const { t } = useLanguage();

  // Onboarding stage state: 'splash' -> 'login' -> 'role_select' -> 'user_info' -> 'language_select' -> 'main'
  const [onboardingStage, setOnboardingStage] = useState(() => {
    const token = localStorage.getItem('ecobridge_auth_token') || localStorage.getItem('kabadiwala_auth_token');
    const role = localStorage.getItem('ecobridge_user_role') || localStorage.getItem('kabadiwala_user_role');
    const profileDone = localStorage.getItem('ecobridge_profile_setup_done') || localStorage.getItem('kabadiwala_profile_setup_done');
    return (token && role && profileDone === 'true') ? 'main' : 'splash';
  });
  const [showAccount, setShowAccount] = useState(false);

  if (onboardingStage === 'splash') {
    return (
      <ErrorBoundary onReset={() => setOnboardingStage('login')}>
        <SplashScreen onComplete={() => setOnboardingStage('login')} />
      </ErrorBoundary>
    );
  }

  if (onboardingStage === 'login') {
    return (
      <ErrorBoundary onReset={() => setOnboardingStage('login')}>
        <LoginScreen onLoginSuccess={(mobile) => {
          const formattedMobile = mobile ? `+91 ${mobile.slice(-10)}` : 'Enter the mobile number';
          localStorage.setItem('ecobridge_verified_mobile', formattedMobile);
          localStorage.setItem('kabadiwala_verified_mobile', formattedMobile);
          if (!localStorage.getItem('ecobridge_auth_token')) {
            const newToken = `jwt_token_${mobile}_${Date.now()}`;
            localStorage.setItem('ecobridge_auth_token', newToken);
            localStorage.setItem('kabadiwala_auth_token', newToken);
          }
          const savedRole = localStorage.getItem('ecobridge_user_role') || localStorage.getItem('kabadiwala_user_role');
          const profileDone = localStorage.getItem('ecobridge_profile_setup_done') || localStorage.getItem('kabadiwala_profile_setup_done');

          if (!savedRole) {
            setOnboardingStage('role_select');
          } else if (profileDone !== 'true') {
            setOnboardingStage('user_info');
          } else {
            setOnboardingStage('language_select');
          }
        }} />
      </ErrorBoundary>
    );
  }

  if (onboardingStage === 'role_select') {
    return (
      <ErrorBoundary onReset={() => setOnboardingStage('user_info')}>
        <RoleSelectScreen onRoleComplete={() => {
          const profileDone = localStorage.getItem('ecobridge_profile_setup_done') || localStorage.getItem('kabadiwala_profile_setup_done');
          if (profileDone === 'true') {
            setOnboardingStage('language_select');
          } else {
            setOnboardingStage('user_info');
          }
        }} />
      </ErrorBoundary>
    );
  }

  if (onboardingStage === 'user_info') {
    return (
      <ErrorBoundary onReset={() => setOnboardingStage('language_select')}>
        <UserInfoScreen onUserInfoComplete={() => setOnboardingStage('language_select')} />
      </ErrorBoundary>
    );
  }

  if (onboardingStage === 'language_select') {
    return (
      <ErrorBoundary onReset={() => setOnboardingStage('main')}>
        <LanguageSelectScreen onSelectComplete={() => setOnboardingStage('main')} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary onReset={() => setOnboardingStage('main')}>
      {/* Ambient Background */}
      <div className="ambient-mesh-bg">
        <div className="ambient-blob ambient-blob-1" />
        <div className="ambient-blob ambient-blob-2" />
      </div>

      <div style={{
        maxWidth: '480px',
        margin: '0 auto',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-neutral)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <Header onOpenAccount={() => setShowAccount(true)} />

        {/* Offline Banner */}
        {isOffline && (
          <div style={{
            backgroundColor: 'var(--warning-amber)',
            color: '#FFFFFF',
            padding: '6px 14px',
            fontSize: '0.78rem',
            fontWeight: 800,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            ⚠️ {t('offlineStatus') || 'Offline Mode'}
          </div>
        )}

        {/* Main View Area */}
        <main key={activeTab} className="fade-in-up" style={{ flex: 1, padding: '16px 12px 90px 12px' }}>
          <ErrorBoundary>
            {activeRole === 'recycler' ? (
              <RecyclerDashboard />
            ) : (
              <>
                {activeTab === 'home' && (
                  <PullToRefresh onRefresh={async () => new Promise(res => setTimeout(res, 800))}>
                    <PrimaryActionRow />
                    <ActiveTxCard />
                    <EWasteImpactCard />
                    <PriceBoardCard />
                    <LoyaltyPointsCard />
                    <HardToSellCard />
                    <BatteryRecoveryCard />
                    <NearbyRecyclers />
                    <SafetyTipsCarousel />
                    <CommunityPreview />
                  </PullToRefresh>
                )}

                {activeTab === 'sell' && <SellFlowManager />}
                {activeTab === 'history' && <TransactionList />}
                {activeTab === 'community' && <CommunityFeed />}
              </>
            )}
          </ErrorBoundary>
        </main>

        {/* Account Profile Modal */}
        {showAccount && (
          <AccountScreen
            onClose={() => setShowAccount(false)}
            onChangeLanguageClick={() => {
              setShowAccount(false);
              setOnboardingStage('language_select');
            }}
            onLogout={() => {
              localStorage.removeItem('kabadiwala_auth_token');
              setShowAccount(false);
              setOnboardingStage('login');
            }}
          />
        )}

        {/* Modals */}
        <VoiceModal />
        <SafetyAlertModal />
        <HardToSellModal />

        {/* Bottom Navigation Bar */}
        <BottomNav />
      </div>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AppDataProvider>
            <MainAppContent />
          </AppDataProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
