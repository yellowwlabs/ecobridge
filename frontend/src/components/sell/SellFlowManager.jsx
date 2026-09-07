import React, { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import CameraScanScreen from './CameraScanScreen';
import WeightValuationScreen from './WeightValuationScreen';
import RecyclerMatchScreen from './RecyclerMatchScreen';
import HandoverScreen from './HandoverScreen';
import PaymentMethodScreen from './PaymentMethodScreen';

export default function SellFlowManager() {
  const { createNewTransaction, materials, recyclers } = useAppData();

  const [step, setStep] = useState(1); // 1: Scan, 2: Weight, 3: Match, 4: Handover, 5: Payment
  const [selectedMaterial, setSelectedMaterial] = useState(materials[1]); // Default Copper
  const [photoUrl, setPhotoUrl] = useState('');
  const [weightKg, setWeightKg] = useState(12.5);
  const [totalValuation, setTotalValuation] = useState(8500);
  const [chosenRecycler, setChosenRecycler] = useState(recyclers[0]);

  // Step 1 -> 2
  const handleProceedScan = (material, photo) => {
    setSelectedMaterial(material);
    setPhotoUrl(photo);
    setStep(2);
  };

  // Step 2 -> 3
  const handleProceedWeight = (weight, valuation) => {
    setWeightKg(weight);
    setTotalValuation(valuation);
    setStep(3);
  };

  // Step 3 -> 4
  const handleSelectRecycler = (recyclerOffer) => {
    setChosenRecycler(recyclerOffer);
    setTotalValuation(recyclerOffer.offeredTotal);
    setStep(4);
  };

  // Step 4 -> 5
  const handleProceedPayment = (handoverDetails) => {
    setStep(5);
  };

  // Step 5 -> Finish
  const handleCompletePayment = (paymentMethod) => {
    createNewTransaction({
      materialId: selectedMaterial.id,
      materialName: selectedMaterial.name,
      photo: photoUrl || 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=400&q=80',
      weightKg: weightKg,
      estimatedRate: selectedMaterial.rate,
      totalPrice: totalValuation,
      recycler: {
        id: chosenRecycler.id,
        name: chosenRecycler.name,
        authorization: chosenRecycler.authorization_status,
        phone: chosenRecycler.phoneMasked
      },
      paymentMethod: paymentMethod
    });
    setStep(1);
  };

  return (
    <div>
      {step === 1 && (
        <CameraScanScreen onProceed={handleProceedScan} />
      )}

      {step === 2 && (
        <WeightValuationScreen
          material={selectedMaterial}
          photoUrl={photoUrl}
          onBack={() => setStep(1)}
          onProceed={handleProceedWeight}
        />
      )}

      {step === 3 && (
        <RecyclerMatchScreen
          material={selectedMaterial}
          weightKg={weightKg}
          totalValuation={totalValuation}
          photoUrl={photoUrl}
          onBack={() => setStep(2)}
          onSelectRecycler={handleSelectRecycler}
        />
      )}

      {step === 4 && (
        <HandoverScreen
          material={selectedMaterial}
          weightKg={weightKg}
          totalValuation={totalValuation}
          recycler={chosenRecycler}
          photoUrl={photoUrl}
          onBack={() => setStep(3)}
          onProceedPayment={handleProceedPayment}
        />
      )}

      {step === 5 && (
        <PaymentMethodScreen
          material={selectedMaterial}
          weightKg={weightKg}
          totalValuation={totalValuation}
          recycler={chosenRecycler}
          onBack={() => setStep(4)}
          onCompletePayment={handleCompletePayment}
        />
      )}
    </div>
  );
}
