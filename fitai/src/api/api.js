import { supabase } from '../lib/supabase';

// ── BASE URL ───────────────────────────────────────────────────
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── GET SUPABASE JWT TOKEN ─────────────────────────────────────
const getToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
};

// ── HEADERS ────────────────────────────────────────────────────
const headers = async (includeAuth = true) => {
  const h = { 'Content-Type': 'application/json' };
  if (includeAuth) {
    const token = await getToken();
    if (token) h.Authorization = `Bearer ${token}`;
  }
  return h;
};

// ── HANDLE FETCH RESPONSE ──────────────────────────────────────
const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

// ── PROFILE API ────────────────────────────────────────────────
export const profileAPI = {
  get: async () => {
    const h = await headers();
    return fetch(`${BASE}/profile`, { headers: h }).then(handle);
  },
  update: async (body) => {
    const h = await headers();
    return fetch(`${BASE}/profile`, { method: 'PUT', headers: h, body: JSON.stringify(body) }).then(handle);
  },
  updateGoals: async (body) => {
    const h = await headers();
    return fetch(`${BASE}/profile/goals`, { method: 'PUT', headers: h, body: JSON.stringify(body) }).then(handle);
  },
};

// ── STATS API ──────────────────────────────────────────────────
export const statsAPI = {
  get: async () => {
    const h = await headers();
    return fetch(`${BASE}/stats`, { headers: h }).then(handle);
  },
  update: async (body) => {
    const h = await headers();
    return fetch(`${BASE}/stats`, { method: 'PUT', headers: h, body: JSON.stringify(body) }).then(handle);
  },
  weekly: async () => {
    const h = await headers();
    return fetch(`${BASE}/stats/weekly`, { headers: h }).then(handle);
  },
};

// ── MEALS API ──────────────────────────────────────────────────
export const mealsAPI = {
  get: async () => {
    const h = await headers();
    return fetch(`${BASE}/meals`, { headers: h }).then(handle);
  },
  add: async (body) => {
    const h = await headers();
    return fetch(`${BASE}/meals`, { method: 'POST', headers: h, body: JSON.stringify(body) }).then(handle);
  },
  remove: async (id) => {
    const h = await headers();
    return fetch(`${BASE}/meals/${id}`, { method: 'DELETE', headers: h }).then(handle);
  },
};

// ── WORKOUTS API ───────────────────────────────────────────────
export const workoutsAPI = {
  get: async () => {
    const h = await headers();
    return fetch(`${BASE}/workouts`, { headers: h }).then(handle);
  },
  toggle: async (body) => {
    const h = await headers();
    return fetch(`${BASE}/workouts/toggle`, { method: 'POST', headers: h, body: JSON.stringify(body) }).then(handle);
  },
};