import React, { createContext, useContext, useState } from 'react';
import { MATERIALS_DATA } from '../data/materialsData';
import { RECYCLERS_DATA } from '../data/recyclersData';
import { SAFETY_DATA } from '../data/safetyData';
import { INITIAL_TRANSACTIONS, INITIAL_LOYALTY, INITIAL_COMMUNITY_POSTS } from '../data/mockTransactions';
import confetti from 'canvas-confetti';

const AppDataContext = createContext();

export function AppDataProvider({ children }) {
  const [activeRole, setActiveRoleState] = useState(() => {
    return localStorage.getItem('ecobridge_user_role') || localStorage.getItem('kabadiwala_user_role') || 'collector';
  });

  const setActiveRole = (role) => {
    localStorage.setItem('ecobridge_user_role', role);
    setActiveRoleState(role);
  };

  const [userProfile, setUserProfileState] = useState(() => {
    const saved = localStorage.getItem('ecobridge_user_profile') || localStorage.getItem('kabadiwala_user_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      name: '',
      operatingArea: '',
      storeAddress: '',
      mobileNumber: localStorage.getItem('ecobridge_verified_mobile') || localStorage.getItem('kabadiwala_verified_mobile') || '+91 9871234567'
    };
  });

  const updateUserProfile = (profileData) => {
    setUserProfileState(prev => {
      const updated = { ...prev, ...profileData };
      localStorage.setItem('ecobridge_user_profile', JSON.stringify(updated));
      localStorage.setItem('ecobridge_profile_setup_done', 'true');
      return updated;
    });
  };

  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'sell' | 'history' | 'community'
  
  const [materials] = useState(MATERIALS_DATA);
  const [recyclers] = useState(RECYCLERS_DATA);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [loyalty, setLoyalty] = useState(INITIAL_LOYALTY);
  const [communityPosts, setCommunityPosts] = useState(INITIAL_COMMUNITY_POSTS);

  const [isOffline, setIsOffline] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  const [activeSafetyItem, setActiveSafetyItem] = useState(null);

  // Filter active transaction
  const activeTx = transactions.find(t => t.status !== 'Paid') || null;

  // Add new lot transaction
  const createNewTransaction = (newLot) => {
    const created = {
      id: `LOT-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleString(),
      status: 'Posted',
      statusStep: 1,
      gps: 'Okhla Phase 2, New Delhi · 0.8 km away',
      ...newLot
    };
    setTransactions(prev => [created, ...prev]);
    setActiveTab('home');
    return created;
  };

  // Update existing lot transaction status (e.g. from Recycler view or Collector handover)
  const updateTransactionStatus = (id, newStatus, newStep, extraProps = {}) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: newStatus,
          statusStep: newStep,
          ...extraProps
        };
      }
      return t;
    }));
  };

  // Loyalty Conversion to UPI
  const convertLoyaltyPoints = () => {
    if (loyalty.points < 100) return;

    const rupeesAdded = Math.floor(loyalty.points / 10);
    const newHistoryItem = {
      id: `CNV-${Math.floor(100 + Math.random() * 900)}`,
      points: loyalty.points,
      amountRupees: rupeesAdded,
      date: 'आज (' + new Date().toLocaleDateString() + ')',
      upiId: 'raju@upi'
    };

    setLoyalty(prev => ({
      points: 0,
      rupeesEquivalent: 0,
      conversionHistory: [newHistoryItem, ...prev.conversionHistory]
    }));

    // Trigger confetti micro-animation (Section 5 component notes)
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Open Safety Modal with restricted dismiss audio requirement
  const triggerSafetyWarning = (safetyId) => {
    const item = SAFETY_DATA.find(s => s.id === safetyId) || SAFETY_DATA[0];
    setActiveSafetyItem(item);
    setSafetyModalOpen(true);
  };

  const [hardToSellModalOpen, setHardToSellModalOpen] = useState(false);
  const [bulkLots, setBulkLots] = useState([
    {
      id: 'BULK-8092',
      targetKg: 100,
      currentKg: 84.5,
      status: 'open', // 'open' | 'claimed'
      claimedBy: null,
      contributorsCount: 12,
      totalValuation: 4235,
      createdAt: 'Today, 11:30 AM',
      components: [
        { id: 'c1', categoryKey: 'mixed_pcb', categoryName: { hi: 'मिश्रित पीसीबी टुकड़े', mr: 'मिश्रित पीसीबी तुकडे', en: 'Mixed PCB Fragments' }, weightKg: 30.0, estRate: 70, estValue: 2100, count: 4, photo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80' },
        { id: 'c2', categoryKey: 'old_wiring', categoryName: { hi: 'पुराने तार के बंडल', mr: 'जुने वायर बंडल', en: 'Old Wiring Bundles' }, weightKg: 25.0, estRate: 50, estValue: 1250, count: 5, photo: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80' },
        { id: 'c3', categoryKey: 'broken_appliances', categoryName: { hi: 'टूटे छोटे उपकरण', mr: 'मोडके छोटे उपकरणे', en: 'Broken Small Appliances' }, weightKg: 29.5, estRate: 30, estValue: 885, count: 3, photo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80' }
      ]
    }
  ]);

  const [userHardToSellItems, setUserHardToSellItems] = useState([
    {
      id: 'h2s_sub_1',
      bulkLotId: 'BULK-8092',
      categoryName: { hi: 'पुराने केबल व चार्जर', mr: 'जुने केबल्स आणि चार्जर', en: 'Obsolete Cables & Chargers' },
      weightKg: 4.5,
      estValue: 180,
      timestamp: 'Today, 10:15 AM'
    }
  ]);

  const submitHardToSellItem = (item) => {
    const weight = parseFloat(item.weightKg) || 5;
    const rate = parseFloat(item.estRate) || 40;
    const estVal = Math.round(weight * rate);

    const newSub = {
      id: `h2s_${Date.now()}`,
      bulkLotId: 'BULK-8092',
      categoryName: item.categoryName,
      weightKg: weight,
      estValue: estVal,
      timestamp: 'Just now'
    };

    setUserHardToSellItems(prev => [newSub, ...prev]);

    setBulkLots(prev => prev.map(lot => {
      if (lot.id === 'BULK-8092') {
        const newWeight = Math.min(lot.targetKg, parseFloat((lot.currentKg + weight).toFixed(1)));
        const existingComp = lot.components.find(c => c.categoryKey === item.categoryKey);
        let updatedComponents = [];

        if (existingComp) {
          updatedComponents = lot.components.map(c => c.categoryKey === item.categoryKey ? {
            ...c,
            weightKg: parseFloat((c.weightKg + weight).toFixed(1)),
            estValue: c.estValue + estVal,
            count: c.count + 1
          } : c);
        } else {
          updatedComponents = [
            ...lot.components,
            {
              id: `c_${Date.now()}`,
              categoryKey: item.categoryKey,
              categoryName: item.categoryName,
              weightKg: weight,
              estRate: rate,
              estValue: estVal,
              count: 1,
              photo: item.photo || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'
            }
          ];
        }

        return {
          ...lot,
          currentKg: newWeight,
          contributorsCount: lot.contributorsCount + 1,
          totalValuation: lot.totalValuation + estVal,
          components: updatedComponents
        };
      }
      return lot;
    }));
  };

  const claimBulkLot = (bulkLotId, recyclerObj) => {
    const defaultRecycler = recyclerObj || {
      id: 'rec_01',
      name: { hi: 'ग्रीन इंडिया रिसाइक्लिंग Hub', mr: 'ग्रीन इंडिया रिसायकलिंग Hub', en: 'Green India Recycling Hub' },
      authorization: 'authorized'
    };

    setBulkLots(prev => prev.map(lot => {
      if (lot.id === bulkLotId) {
        return {
          ...lot,
          status: 'claimed',
          claimedBy: defaultRecycler
        };
      }
      return lot;
    }));

    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.5 }
    });
  };

  return (
    <AppDataContext.Provider value={{
      activeRole, setActiveRole,
      userProfile, updateUserProfile,
      activeTab, setActiveTab,
      materials,
      recyclers,
      transactions,
      activeTx,
      createNewTransaction,
      updateTransactionStatus,
      loyalty,
      convertLoyaltyPoints,
      communityPosts,
      setCommunityPosts,
      isOffline, setIsOffline,
      voiceModalOpen, setVoiceModalOpen,
      safetyModalOpen, setSafetyModalOpen,
      activeSafetyItem, triggerSafetyWarning,
      hardToSellModalOpen, setHardToSellModalOpen,
      bulkLots, submitHardToSellItem, claimBulkLot, userHardToSellItems
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export const useAppData = () => useContext(AppDataContext);
