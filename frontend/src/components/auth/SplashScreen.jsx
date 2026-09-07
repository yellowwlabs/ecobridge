import React, { useEffect } from 'react';
import ecobridgeLogoFull from '../../assets/images/ecobridge_logo_full.png';

export default function SplashScreen({ onComplete }) {
  useEffect(() => {
    // Fixed brief duration (1.2s), then auto-navigates to Login
    const timer = setTimeout(() => {
      onComplete();
    }, 1200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: '#0F172A',
      color: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '24px'
    }}>
      {/* Brand Full Lockup Logo */}
      <img
        src={ecobridgeLogoFull}
        alt="EcoBridge"
        style={{
          width: '260px',
          maxWidth: '80%',
          height: 'auto',
          objectFit: 'contain',
          marginBottom: '24px',
          filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.5))'
        }}
      />
      
      <p style={{ fontSize: '0.95rem', opacity: 0.9, fontWeight: 700, letterSpacing: '0.3px', textAlign: 'center', maxWidth: '320px', color: '#94A3B8', marginTop: 0 }}>
        From Informal Collection to Formal Recycling
      </p>

      {/* Subtle bottom indicator */}
      <div style={{
        position: 'absolute',
        bottom: '50px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: '#00A896'
        }} />
        <span style={{ fontSize: '0.85rem', opacity: 0.8, fontWeight: 600 }}>Loading...</span>
      </div>
    </div>
  );
}
