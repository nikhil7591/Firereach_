import axios from 'axios';

const LOCAL_API_URL = 'http://localhost:10000';

const isLocalHostname = (hostname) => ['localhost', '127.0.0.1', '::1'].includes(String(hostname || '').toLowerCase());

const getRuntimeDefaultApiUrl = () => {
  if (typeof window === 'undefined') {
    return LOCAL_API_URL;
  }

  if (isLocalHostname(window.location.hostname)) {
    return LOCAL_API_URL;
  }

  return String(import.meta.env.VITE_API_URL || '').trim() || LOCAL_API_URL;
};

const normalizeApiUrl = (rawApiUrl) => {
  const raw = String(rawApiUrl || '').trim();

  if (!raw) {
    return getRuntimeDefaultApiUrl();
  }

  if (/^:\d+/.test(raw)) {
    return `http://localhost${raw}`;
  }

  if (/^localhost:\d+$/i.test(raw)) {
    return `http://${raw}`;
  }

  if (/^https?:\/\//i.test(raw)) {
    return raw.replace(/\/+$/, '');
  }

  return `http://${raw}`;
};

const isDev = import.meta.env.DEV;
const configuredApiUrl = normalizeApiUrl(
  import.meta.env.VITE_API_URL || (isDev ? LOCAL_API_URL : '')
);
export const API_URL = configuredApiUrl;
export const getApiUrl = async () => configuredApiUrl;

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

export const runAgent = async (payload) => {
  const apiUrl = await getApiUrl();
  const response = await axios.post(`${apiUrl}/run-agent?stream=false`, payload);
  return response.data;
};

export const runAgentStream = async (payload, onEvent) => {
  const apiUrl = await getApiUrl();
  let response;
  try {
    response = await fetch(`${apiUrl}/run-agent?stream=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/x-ndjson',
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      `Cannot reach backend at ${apiUrl}. For local, start API on ${LOCAL_API_URL}. For Vercel deploy, set VITE_API_URL to your Render backend URL.`,
    );
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (!response.body) {
    throw new Error('Streaming is not available in this browser.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }

      onEvent(JSON.parse(trimmed));
    }
  }

  if (buffer.trim()) {
    onEvent(JSON.parse(buffer.trim()));
  }
};

export const selectCompany = async (payload) => {
  const apiUrl = await getApiUrl();
  const response = await axios.post(`${apiUrl}/select-company`, payload);
  return response.data;
};

export const sendGeneratedEmail = async (payload) => {
  const apiUrl = await getApiUrl();
  const response = await axios.post(`${apiUrl}/send-email`, payload);
  return response.data;
};

export const signup = async (payload) => {
  const apiUrl = await getApiUrl();
  const response = await axios.post(`${apiUrl}/auth/signup`, payload);
  return response.data;
};

export const login = async (payload) => {
  const apiUrl = await getApiUrl();
  const response = await axios.post(`${apiUrl}/auth/login`, payload);
  return response.data;
};

export const getCurrentUserProfile = async (token) => {
  const apiUrl = await getApiUrl();
  const response = await axios.get(`${apiUrl}/auth/me`, { headers: authHeaders(token) });
  return response.data;
};

export const updateUserProfile = async (token, payload) => {
  const apiUrl = await getApiUrl();
  const response = await axios.patch(`${apiUrl}/auth/me`, payload, { headers: authHeaders(token) });
  return response.data;
};

export const updateAccountPlan = async (token, plan) => {
  const apiUrl = await getApiUrl();
  const response = await axios.post(`${apiUrl}/auth/plan`, { plan }, { headers: authHeaders(token) });
  return response.data;
};

export const getAccountPlan = async (token) => {
  const apiUrl = await getApiUrl();
  const response = await axios.get(`${apiUrl}/auth/plan`, { headers: authHeaders(token) });
  return response.data;
};

export const getCreditsStatus = async (token) => {
  const apiUrl = await getApiUrl();
  const response = await axios.get(`${apiUrl}/credits`, { headers: authHeaders(token) });
  return response.data;
};

export const consumeCredits = async (token, amount = 5, reason = 'ICP_RUN') => {
  const apiUrl = await getApiUrl();
  const response = await axios.post(
    `${apiUrl}/credits/consume`,
    { amount, reason },
    { headers: authHeaders(token) },
  );
  return response.data;
};

export const createDemoPaymentSession = async (token, plan) => {
  const apiUrl = await getApiUrl();
  const frontendBaseUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
  const response = await axios.post(
    `${apiUrl}/payments/demo/create`,
    { plan, frontendBaseUrl },
    { headers: authHeaders(token) },
  );
  return response.data;
};

export const getDemoPaymentSession = async (sessionId) => {
  const apiUrl = await getApiUrl();
  const response = await axios.get(`${apiUrl}/payments/demo/${encodeURIComponent(sessionId)}`);
  return response.data;
};

export const submitDemoPayment = async (sessionId, paymentCode) => {
  const apiUrl = await getApiUrl();
  const response = await axios.post(
    `${apiUrl}/payments/demo/${encodeURIComponent(sessionId)}/submit`,
    { paymentCode },
  );
  return response.data;
};

export const getDemoPaymentStatus = async (token, sessionId) => {
  const apiUrl = await getApiUrl();
  const response = await axios.get(
    `${apiUrl}/payments/demo/${encodeURIComponent(sessionId)}/status`,
    { headers: authHeaders(token) },
  );
  return response.data;
};

export const getPaymentHistory = async (token, limit = 20) => {
  const apiUrl = await getApiUrl();
  const response = await axios.get(`${apiUrl}/payments`, {
    headers: authHeaders(token),
    params: { limit },
  });
  return response.data;
};

export const saveSearchHistory = async (token, payload) => {
  const apiUrl = await getApiUrl();
  const response = await axios.post(`${apiUrl}/history`, payload, { headers: authHeaders(token) });
  return response.data;
};

export const getSearchHistoryList = async (token, limit = 15) => {
  const apiUrl = await getApiUrl();
  const response = await axios.get(`${apiUrl}/history`, {
    headers: authHeaders(token),
    params: { limit },
  });
  return response.data;
};

export const getSearchHistoryItem = async (token, historyId) => {
  const apiUrl = await getApiUrl();
  const response = await axios.get(`${apiUrl}/history/${encodeURIComponent(historyId)}`, {
    headers: authHeaders(token),
  });
  return response.data;
};

export const renameSearchHistoryItem = async (token, historyId, icp) => {
  const apiUrl = await getApiUrl();
  const response = await axios.patch(
    `${apiUrl}/history/${encodeURIComponent(historyId)}`,
    { icp },
    { headers: authHeaders(token) },
  );
  return response.data;
};

export const deleteSearchHistoryItem = async (token, historyId) => {
  const apiUrl = await getApiUrl();
  const response = await axios.delete(`${apiUrl}/history/${encodeURIComponent(historyId)}`, {
    headers: authHeaders(token),
  });
  return response.data;
};

const api = {
  runAgent,
  runAgentStream,
  selectCompany,
  sendGeneratedEmail,
  signup,
  login,
  getCurrentUserProfile,
  updateUserProfile,
  updateAccountPlan,
  getAccountPlan,
  getCreditsStatus,
  consumeCredits,
  createDemoPaymentSession,
  getDemoPaymentSession,
  submitDemoPayment,
  getDemoPaymentStatus,
  getPaymentHistory,
  saveSearchHistory,
  getSearchHistoryList,
  getSearchHistoryItem,
  renameSearchHistoryItem,
  deleteSearchHistoryItem,
};

export default api;
