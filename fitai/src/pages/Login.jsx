import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/api';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authAPI.login(form);
      localStorage.setItem('befit-auth', JSON.stringify({ token: data.token, ...data.user }));
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1920&auto=format&fit=crop&q=80"
          alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(0,0,0,0.4),rgba(0,0,0,0.75))' }} />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 rounded-3xl p-8 shadow-2xl"
        style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(28px)', border: '1px solid rgba(255,255,255,0.15)' }}>

        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center shadow">
            <span className="text-white font-black text-lg">B</span>
          </div>
          <h1 className="text-white text-xl font-black">FitandRise</h1>
        </div>

        <h2 className="text-white text-2xl font-black mb-1">Welcome back</h2>
        <p className="text-white/60 text-sm mb-6">Sign in to continue your fitness journey</p>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/20 border border-red-500/40 rounded-xl">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          {[
            { label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com' },
            { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-white/70 text-xs font-semibold block mb-1.5">{f.label}</label>
              <input type={f.type} value={form[f.key]} placeholder={f.placeholder} required
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} />
            </div>
          ))}
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-blue-400 text-xs font-semibold hover:text-blue-300">
              Forgot password?
            </Link>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl font-black text-white text-sm mt-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#22c55e)' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-white/50 text-sm mt-6">
          No account?{' '}
          <Link to="/signup" className="text-blue-400 font-bold hover:text-blue-300">Create one</Link>
        </p>
      </div>
    </div>
  );
}