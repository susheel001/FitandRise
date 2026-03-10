const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => {
  try { return JSON.parse(localStorage.getItem('befit-auth'))?.token || null; }
  catch { return null; }
};

const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });

const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

export const authAPI = {
  register: (body) => fetch(`${BASE}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(handle),
  login:    (body) => fetch(`${BASE}/auth/login`,    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(handle),
};

export const profileAPI = {
  get:         ()     => fetch(`${BASE}/profile`,       { headers: headers() }).then(handle),
  update:      (body) => fetch(`${BASE}/profile`,       { method: 'PUT', headers: headers(), body: JSON.stringify(body) }).then(handle),
  updateGoals: (body) => fetch(`${BASE}/profile/goals`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) }).then(handle),
};

export const statsAPI = {
  get:    ()     => fetch(`${BASE}/stats`,        { headers: headers() }).then(handle),
  update: (body) => fetch(`${BASE}/stats`,        { method: 'PUT', headers: headers(), body: JSON.stringify(body) }).then(handle),
  weekly: ()     => fetch(`${BASE}/stats/weekly`, { headers: headers() }).then(handle),
};

export const mealsAPI = {
  get:    ()     => fetch(`${BASE}/meals`,       { headers: headers() }).then(handle),
  add:    (body) => fetch(`${BASE}/meals`,       { method: 'POST',   headers: headers(), body: JSON.stringify(body) }).then(handle),
  remove: (id)   => fetch(`${BASE}/meals/${id}`, { method: 'DELETE', headers: headers() }).then(handle),
};

export const workoutsAPI = {
  get:    ()     => fetch(`${BASE}/workouts`,        { headers: headers() }).then(handle),
  toggle: (body) => fetch(`${BASE}/workouts/toggle`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),
};