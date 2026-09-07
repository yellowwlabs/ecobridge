import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAppData } from '../../context/AppDataContext';
import { TrendingUp, TrendingDown, Minus, BarChart2, Volume2 } from 'lucide-react';
import PriceHistoryModal from './PriceHistoryModal';
import { triggerHaptic } from '../../utils/haptics';
import { speakText, stopSpeaking } from '../../utils/voiceAssistant';

export default function PriceBoardCard() {
  const { lang, t, getLangText } = useLanguage();
  const { materials, isOffline } = useAppData();
  const [selectedMaterial, setSelectedMaterial] = useState(materials[1]); // Default Copper
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showGraph, setShowGraph] = useState(false);

  const handleSelectMaterial = (mat) => {
    triggerHaptic('light');
    setSelectedMaterial(mat);
    setShowGraph(prev => prev && selectedMaterial?.id === mat.id ? false : true);
  };

  const handleSpeakPrice = (e, mat) => {
    e.stopPropagation();
    triggerHaptic('medium');
    stopSpeaking();
    const name = getLangText(mat.name);
    let spokenText = '';
    if (lang === 'hi') {
      spokenText = `${name} का आज का भाव ${mat.rate} रुपये प्रति ${mat.unit} है।`;
    } else if (lang === 'mr') {
      spokenText = `${name} चा आजचा दर ${mat.rate} रुपये प्रति ${mat.unit} आहे.`;
    } else {
      spokenText = `Today rate for ${name} is ${mat.rate} rupees per ${mat.unit}.`;
    }
    speakText(spokenText, lang);
  };

  return (
    <div className="card" style={{ marginBottom: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            📊 {t('todaysRates')}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {isOffline ? t('status_offline') : t('liveYardRates')}
          </span>
        </div>
        <button
          onClick={() => setShowHistoryModal(true)}
          style={{
            minHeight: '36px',
            padding: '4px 12px',
            borderRadius: '12px',
            backgroundColor: 'var(--primary-blue)',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '0.8rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <BarChart2 size={16} /> Price History & Trends
        </button>
      </div>

      {/* Horizontal Scroll Chips with Material Reference Photos + Speaker Icon */}
      <div style={{
        display: 'flex',
        gap: '10px',
        overflowX: 'auto',
        paddingBottom: '8px',
        scrollSnapType: 'x mandatory'
      }}>
        {materials.map(mat => {
          const isSelected = selectedMaterial.id === mat.id;
          return (
            <div
              key={mat.id}
              onClick={() => handleSelectMaterial(mat)}
              className="btn-press"
              style={{
                minWidth: '160px',
                padding: '10px',
                borderRadius: '14px',
                backgroundColor: isSelected ? 'rgba(0, 36, 107, 0.06)' : 'var(--bg-neutral)',
                border: isSelected ? '2px solid var(--primary-blue)' : '1px solid var(--border-subtle)',
                scrollSnapAlign: 'start',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img
                    src={mat.photo}
                    alt={getLangText(mat.name)}
                    style={{ width: '34px', height: '34px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {getLangText(mat.name)}
                  </span>
                </div>

                {/* Speaker TTS Action Button for Low-Literacy Users */}
                <button
                  onClick={(e) => handleSpeakPrice(e, mat)}
                  className="btn-press"
                  title="Listen price out loud"
                  aria-label={`Listen price for ${getLangText(mat.name)}`}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(59, 130, 246, 0.14)',
                    color: 'var(--primary-accent, #3B82F6)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  <Volume2 size={16} />
                </button>
              </div>

              <div>
                <div className="numeral-huge" style={{ fontSize: '1.45rem' }}>
                  ₹{mat.rate}<span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>/{mat.unit}</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: mat.trend === 'up' ? 'var(--success-green)' : mat.trend === 'down' ? 'var(--alert-red)' : 'var(--text-muted)'
                }}>
                  {mat.trend === 'up' && <TrendingUp size={14} />}
                  {mat.trend === 'down' && <TrendingDown size={14} />}
                  {mat.trend === 'flat' && <Minus size={14} />}
                  <span>{mat.trendValue}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sparkline Graph View */}
      {showGraph && selectedMaterial && selectedMaterial.sparkline && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: 'var(--bg-neutral)',
          borderRadius: '12px',
          borderLeft: '4px solid var(--primary-blue)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--primary-blue)' }}>
              📈 {getLangText(selectedMaterial.name)}: <span style={{ color: 'var(--success-green)' }}>इस हफ्ते ऊपर</span>
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              7 दिन ट्रेंड
            </span>
          </div>

          <div style={{ height: '48px', width: '100%', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            {selectedMaterial.sparkline.map((val, idx) => {
              const maxVal = Math.max(...selectedMaterial.sparkline);
              const minVal = Math.min(...selectedMaterial.sparkline);
              const heightPercent = maxVal === minVal ? 60 : Math.max(20, ((val - minVal) / (maxVal - minVal)) * 100);
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>₹{val}</span>
                  <div style={{
                    width: '100%',
                    height: `${heightPercent}%`,
                    backgroundColor: idx === selectedMaterial.sparkline.length - 1 ? 'var(--success-green)' : 'var(--primary-blue)',
                    borderRadius: '4px'
                  }} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Price History & Computed Trend Modal */}
      <PriceHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        category={selectedMaterial}
      />
    </div>
  );
}
