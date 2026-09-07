// REST API Client for Kabadiwala Connect Master Backend

const BASE_URL = '/api/v1';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('ecobridge_auth_token') || localStorage.getItem('kabadiwala_auth_token');
  const lang = localStorage.getItem('ecobridge_lang') || localStorage.getItem('kabadiwala_lang') || 'hi';

  const headers = {
    'Content-Type': 'application/json',
    'Accept-Language': lang,
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  requestOtp: (mobile_number) => request('/auth/otp/request', { method: 'POST', body: JSON.stringify({ mobile_number }) }),
  verifyOtp: (mobile_number, otp) => request('/auth/otp/verify', { method: 'POST', body: JSON.stringify({ mobile_number, otp }) }),
  getProfile: () => request('/me'),
  updateProfile: (data) => request('/me', { method: 'PUT', body: JSON.stringify(data) }),

  // Rates
  getRates: () => request('/rates'),
  getRateHistory: (categoryId) => request(`/rates/${categoryId}/history`),

  // Lots
  createLot: (data) => request('/lots', { method: 'POST', body: JSON.stringify(data) }),
  getLots: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/lots?${query}`);
  },
  getLotById: (id) => request(`/lots/${id}`),
  scanPhoto: (lotId, photoUrl) => request(`/lots/${lotId}/photo-scan`, { method: 'POST', body: JSON.stringify({ photoUrl }) }),

  // Offers
  getOffers: (lotId) => request(`/lots/${lotId}/offers`),
  submitOffer: (lotId, ratePerKg) => request(`/lots/${lotId}/offers`, { method: 'POST', body: JSON.stringify({ rate_per_kg_offered: ratePerKg }) }),
  selectOffer: (offerId) => request(`/offers/${offerId}/select`, { method: 'POST' }),

  // Transactions
  getTransaction: (id) => request(`/transactions/${id}`),
  confirmHandover: (id) => request(`/transactions/${id}/confirm-handover`, { method: 'POST' }),
  confirmPayment: (id, paymentMethod, paymentReference) => request(`/transactions/${id}/confirm-payment`, {
    method: 'POST',
    body: JSON.stringify({ payment_method: paymentMethod, payment_reference: paymentReference })
  }),

  // Recyclers Directory
  getNearbyRecyclers: (authorizedOnly = false) => request(`/recyclers/nearby?authorized_only=${authorizedOnly ? '1' : '0'}`),

  // Digital Certificates
  getCertificate: (txId) => request(`/certificates/${txId}`),
  getAllCertificates: () => request('/certificates'),

  // Loyalty Points
  getLoyaltyBalance: () => request('/loyalty/balance'),
  convertToUpi: (points, upiId) => request('/loyalty/convert-to-upi', { method: 'POST', body: JSON.stringify({ points, upi_id: upiId }) }),

  // E-Waste
  getEwasteImpact: () => request('/ewaste/impact-summary'),
  scheduleEwastePickup: (data) => request('/ewaste/pickups', { method: 'POST', body: JSON.stringify(data) }),
  getEwastePickups: () => request('/ewaste/pickups'),

  // AI Call Sessions
  startAiCall: (data) => request('/ai-calls', { method: 'POST', body: JSON.stringify(data) }),
  getAiCallStatus: (id) => request(`/ai-calls/${id}`),
  endAiCall: (id) => request(`/ai-calls/${id}/end`, { method: 'POST' }),

  // Telephony Call-Masking (Proxy Calling)
  initiateProxyCall: (lotId, targetId, targetRole) => request('/calls/initiate-proxy', {
    method: 'POST',
    body: JSON.stringify({ lot_id: lotId, target_id: targetId, target_role: targetRole })
  }),
  getProxyCallSession: (sessionId) => request(`/calls/proxy-session/${sessionId}`),
  logProxyCall: (sessionId, durationSeconds, status) => request('/calls/log-proxy-call', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId, duration_seconds: durationSeconds, status })
  }),

  // Gemini 2.5 Flash AI Assistant Proxy & Multimodal Scan
  queryAi: (prompt, lang = 'hi', context = {}) => request('/ai/query', {
    method: 'POST',
    body: JSON.stringify({ prompt, lang, context })
  }),
  scanPhotoMultimodal: (photoData, lang = 'hi') => request('/ai/scan', {
    method: 'POST',
    body: JSON.stringify(typeof photoData === 'object' ? photoData : { photoUrl: photoData, lang })
  }),

  // FAQ & Community
  getFaq: (category) => request(`/faq${category ? `?category=${category}` : ''}`),
  getCommunityFeed: () => request('/community/feed'),
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'POST' })
};

