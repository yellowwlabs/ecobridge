// Native Haptics Engine Helper
export const triggerHaptic = (type = 'light') => {
  if (typeof window === 'undefined' || !('navigator' in window)) return;
  
  try {
    if (navigator.vibrate) {
      switch (type) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(25);
          break;
        case 'heavy':
          navigator.vibrate([40, 30, 40]);
          break;
        case 'success':
          navigator.vibrate([15, 50, 20]);
          break;
        case 'warning':
          navigator.vibrate([30, 40, 30]);
          break;
        default:
          navigator.vibrate(15);
      }
    }
  } catch {
    // Graceful fallback if haptics unavailable
  }
};
