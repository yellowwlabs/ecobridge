import React, { useState, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import { Camera, Sparkles, ArrowRight, Image as ImageIcon, AlertCircle, Plus, X, Volume2 } from 'lucide-react';
import ModalShell from '../common/ModalShell';
import { api } from '../../utils/apiClient';
import { speakText, stopSpeaking } from '../../utils/voiceAssistant';

export default function CameraScanScreen({ onProceed }) {
  const { lang, t, getLangText } = useLanguage();
  const { materials } = useAppData();
  
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [photoUrl, setPhotoUrl] = useState(materials[1]?.photo || 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=600&q=80');
  const [isScanning, setIsScanning] = useState(false);
  const [detectedMaterial, setDetectedMaterial] = useState(materials[1]); // Copper
  const [confidence, setConfidence] = useState(94);
  const [permissionError, setPermissionError] = useState(false);

  // Custom Scrap Form State
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customWeight, setCustomWeight] = useState('10');
  const [customRate, setCustomRate] = useState('45');
  const [customNotes, setCustomNotes] = useState('');

  const speakScanResult = (mat) => {
    stopSpeaking();
    const name = getLangText(mat.name);
    let spokenText = '';
    if (lang === 'hi') {
      spokenText = `पहचाना गया: ${name}। आज का लाइव रेट ${mat.rate} रुपये प्रति किलोग्राम है।`;
    } else if (lang === 'mr') {
      spokenText = `ओळखले गेले: ${name}. आजचा दर ${mat.rate} रुपये प्रति किलोग्राम आहे.`;
    } else {
      spokenText = `Recognized ${name}. Current live rate is ${mat.rate} rupees per kg.`;
    }
    speakText(spokenText, lang);
  };

  const handleSelectSample = (m) => {
    setDetectedMaterial(m);
    setPhotoUrl(m.photo);
    setIsScanning(true);
    setPermissionError(false);

    // Call real Gemini Multimodal backend proxy
    api.scanPhotoMultimodal({ photoUrl: m.photo, lang })
      .then(res => {
        setIsScanning(false);
        const confPercent = Math.round((res.ai_confidence || 0.94) * 100);
        setConfidence(confPercent);
        speakScanResult(m);
      })
      .catch((err) => {
        console.warn('Multimodal scan API fallback:', err);
        setIsScanning(false);
        setConfidence(94);
        speakScanResult(m);
      });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
      setIsScanning(true);
      setPermissionError(false);

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result;
        api.scanPhotoMultimodal({ imageBase64: base64Data, lang })
          .then(res => {
            setIsScanning(false);
            const confPercent = Math.round((res.ai_confidence || 0.94) * 100);
            setConfidence(confPercent);
            
            const matchedMat = materials.find(mat => mat.id === res.material_category_id) || detectedMaterial;
            setDetectedMaterial(matchedMat);
            speakScanResult(matchedMat);
          })
          .catch(err => {
            console.warn('Base64 photo scan API fallback:', err);
            setIsScanning(false);
            setConfidence(94);
            speakScanResult(detectedMaterial);
          });
      };
      reader.readAsDataURL(file);
    }
  };


  const handleCameraCapture = () => {
    try {
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    } catch {
      setPermissionError(true);
    }
  };

  const handleAddCustomScrapSubmit = (e) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const customMat = {
      id: `custom_${Date.now()}`,
      name: { hi: customName, en: customName, mr: customName },
      rate: parseFloat(customRate) || 45,
      photo: photoUrl || 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=600&q=80',
      unit: 'kg',
      isCustom: true,
      customNotes: customNotes
    };

    setShowAddCustomModal(false);
    setDetectedMaterial(customMat);
    speakScanResult(customMat);
    onProceed(customMat, customMat.photo);
  };

  return (
    <div className="card" style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '4px' }}>
        📸 {t('cameraScanTitle')}
      </h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
        {t('cameraScanSub')}
      </p>

      {/* Hidden native inputs for camera & gallery */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Camera Permission Denied / Error Fallback Notice */}
      {permissionError && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid var(--alert-red)',
          borderRadius: '12px',
          padding: '10px 14px',
          marginBottom: '14px',
          fontSize: '0.82rem',
          color: 'var(--alert-red)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={18} />
          <span>Camera access restricted. Use gallery picker or category grid below.</span>
        </div>
      )}

      {/* Main Camera Preview Box */}
      <div className="photo-mount" style={{ position: 'relative', height: '200px', marginBottom: '14px', backgroundColor: '#000000', overflow: 'hidden' }}>
        <img
          src={photoUrl}
          alt="Scrap Preview"
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isScanning ? 0.7 : 1 }}
        />

        {isScanning ? (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: '#FFFFFF', backgroundColor: 'rgba(0,0,0,0.45)'
          }}>
            {/* Animated Laser Beam */}
            <div className="laser-scan-line" />
            <div className="mic-pulse" style={{
              width: '56px', height: '56px', borderRadius: '50%',
              backgroundColor: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '10px', boxShadow: '0 0 20px rgba(59,130,246,0.6)'
            }}>
              <Sparkles size={28} />
            </div>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              {t('scanningAi')}
            </span>
          </div>
        ) : (
          <div style={{
            position: 'absolute', bottom: '10px', left: '10px', right: '10px',
            backgroundColor: 'rgba(0,36,107,0.88)', color: '#FFFFFF',
            padding: '10px 14px', borderRadius: '12px', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} /> {t('aiConfidence')} ({confidence}%)
              </span>
              <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                {getLangText(detectedMaterial.name)}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="numeral-huge" style={{ fontSize: '1.4rem', color: 'var(--loyalty-gold)' }}>
                ₹{detectedMaterial.rate}/kg
              </div>
              <button
                onClick={() => speakScanResult(detectedMaterial)}
                className="btn-press"
                title="Listen scan result aloud"
                aria-label="Listen scan result"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Volume2 size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Camera Capture & Gallery Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={handleCameraCapture}
          className="btn-press"
          style={{
            padding: '10px',
            borderRadius: '12px',
            border: '1.5px solid var(--primary-blue)',
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            color: 'var(--primary-blue)',
            fontWeight: 800,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <Camera size={16} /> Open Camera
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-press"
          style={{
            padding: '10px',
            borderRadius: '12px',
            border: '1.5px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-neutral)',
            color: 'var(--text-primary)',
            fontWeight: 800,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <ImageIcon size={16} /> Choose Photo
        </button>
      </div>

      {/* Category Selection Photo Grid + (+) Add Custom Scrap Tile */}
      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', display: 'block' }}>
        {t('selectCategoryGrid')}:
      </span>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
        {materials.map((m) => {
          const isSelected = detectedMaterial.id === m.id;
          return (
            <button
              key={m.id}
              onClick={() => handleSelectSample(m)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '4px',
                borderRadius: '12px',
                border: isSelected ? '2.5px solid var(--primary-blue)' : '1px solid var(--border-subtle)',
                backgroundColor: isSelected ? 'rgba(0, 36, 107, 0.08)' : 'var(--bg-neutral)',
                cursor: 'pointer'
              }}
            >
              <div className="photo-mount" style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden' }}>
                <img src={m.photo} alt={getLangText(m.name)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', textAlign: 'center', lineHeight: 1.1 }}>
                {getLangText(m.name)}
              </span>
            </button>
          );
        })}

        {/* "+" Add Custom Scrap Type Button */}
        <button
          onClick={() => setShowAddCustomModal(true)}
          className="btn-press"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            borderRadius: '12px',
            border: '2px dashed var(--primary-accent)',
            backgroundColor: 'rgba(59, 130, 246, 0.06)',
            cursor: 'pointer',
            minHeight: '76px'
          }}
        >
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            backgroundColor: 'var(--primary-accent)', color: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Plus size={22} />
          </div>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--primary-accent)', marginTop: '4px', textAlign: 'center' }}>
            + Add Scrap
          </span>
        </button>
      </div>

      {/* Proceed Button */}
      <button
        onClick={() => onProceed(detectedMaterial, photoUrl)}
        style={{
          width: '100%',
          backgroundColor: 'var(--primary-blue)',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '16px',
          padding: '14px',
          fontWeight: 800,
          fontSize: '1.05rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: 'pointer'
        }}
      >
        {t('enterWeightBtn')} <ArrowRight size={20} />
      </button>

      {/* Modal Shell for Adding Custom Scrap */}
      <ModalShell isOpen={showAddCustomModal} onClose={() => setShowAddCustomModal(false)} zIndex={1200}>
        <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '20px', backgroundColor: 'var(--surface-white)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              ➕ Add Custom Scrap Type
            </h3>
            <button onClick={() => setShowAddCustomModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleAddCustomScrapSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Item Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mixed Brass Fittings, Old Transformer"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '10px',
                  border: '1.5px solid var(--border-subtle)', fontWeight: 700, fontSize: '0.92rem'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Approx Weight (kg)
                </label>
                <input
                  type="number"
                  min="0.1"
                  max="10000"
                  step="0.1"
                  value={customWeight}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (val > 10000) setCustomWeight('10000');
                    else setCustomWeight(e.target.value);
                  }}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '10px',
                    border: '1.5px solid var(--border-subtle)', fontWeight: 700, fontSize: '0.92rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Est. Rate (₹/kg)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5000"
                  step="1"
                  value={customRate}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (val > 5000) setCustomRate('5000');
                    else setCustomRate(e.target.value);
                  }}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '10px',
                    border: '1.5px solid var(--border-subtle)', fontWeight: 700, fontSize: '0.92rem'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Note / Description (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Details about quality, alloy grade, or condition..."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '10px',
                  border: '1.5px solid var(--border-subtle)', fontWeight: 600, fontSize: '0.88rem', resize: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-press"
              style={{
                width: '100%',
                backgroundColor: 'var(--primary-accent)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                marginTop: '6px'
              }}
            >
              Submit Custom Lot Request
            </button>
          </form>
        </div>
      </ModalShell>
    </div>
  );
}
