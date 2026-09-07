// Local Storage Offline Queue for Doorstep Pickup Lots & Offline Submissions

const OFFLINE_QUEUE_KEY = 'ecobridge_offline_pending_queue';

export const offlineStore = {
  getQueue: () => {
    try {
      const data = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  enqueue: (item) => {
    const queue = offlineStore.getQueue();
    const newItem = {
      id: `OFFLINE-${Date.now()}`,
      queuedAt: new Date().toISOString(),
      ...item
    };
    queue.push(newItem);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    return newItem;
  },

  clearQueue: () => {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  },

  syncPendingItems: async (syncApiFn) => {
    const queue = offlineStore.getQueue();
    if (queue.length === 0) return { syncedCount: 0 };

    let syncedCount = 0;
    const remaining = [];

    for (const item of queue) {
      try {
        if (syncApiFn) {
          await syncApiFn(item);
        }
        syncedCount++;
      } catch (err) {
        console.warn('Failed to sync offline item:', item.id, err);
        remaining.push(item);
      }
    }

    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
    return { syncedCount, remainingCount: remaining.length };
  }
};

// Automatic online event listener to trigger auto-sync
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('🌐 EcoBridge network reconnected! Processing offline queued items...');
    offlineStore.syncPendingItems();
  });
}
