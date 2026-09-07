import React, { useState, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export default function PullToRefresh({ onRefresh, children }) {
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const containerRef = useRef(null);

  const PULL_THRESHOLD = 70;

  const handleTouchStart = (e) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (startY === 0 || refreshing) return;
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;

    if (distance > 0 && containerRef.current && containerRef.current.scrollTop === 0) {
      setPullDistance(Math.min(distance * 0.45, 90));
      if (distance > PULL_THRESHOLD && pullDistance <= PULL_THRESHOLD) {
        triggerHaptic('light');
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > PULL_THRESHOLD && !refreshing) {
      setRefreshing(true);
      triggerHaptic('medium');
      setPullDistance(50);
      try {
        if (onRefresh) await onRefresh();
      } catch (err) {
        console.error(err);
      } finally {
        setTimeout(() => {
          setRefreshing(false);
          setPullDistance(0);
          setStartY(0);
        }, 500);
      }
    } else {
      setPullDistance(0);
      setStartY(0);
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ position: 'relative', minHeight: '100%' }}
    >
      {/* Pull Indicator Bar */}
      {pullDistance > 0 && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: `${pullDistance}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 80,
          overflow: 'hidden',
          transition: refreshing ? 'height 0.2s ease' : 'none'
        }}>
          <div className="card glass-card" style={{
            padding: '8px 16px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transform: `scale(${Math.min(pullDistance / PULL_THRESHOLD, 1)})`
          }}>
            <RefreshCw
              size={18}
              color="var(--primary-accent)"
              className={refreshing ? 'mic-pulse' : ''}
              style={{
                transform: refreshing ? 'rotate(360deg)' : `rotate(${pullDistance * 3}deg)`,
                transition: refreshing ? 'transform 1s linear infinite' : 'none'
              }}
            />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary-accent)' }}>
              {refreshing ? 'Updating data...' : pullDistance > PULL_THRESHOLD ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}

      <div style={{
        transform: `translateY(${pullDistance}px)`,
        transition: refreshing ? 'transform 0.2s ease' : 'none'
      }}>
        {children}
      </div>
    </div>
  );
}
