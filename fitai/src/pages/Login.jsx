import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const successMsg = location.state?.message;

  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email:    form.email,
        password: form.password,
      });
      if (error) throw new Error(error.message);
      navigate('/dashboard');
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

        <div className="flex items-center gap-3 mb-8">
          <img src="/fitandrise.jpeg" alt="FitandRise" className="w-10 h-10 rounded-xl object-cover" />
          <h1 className="text-white text-xl font-black">FitandRise</h1>
        </div>

        <h2 className="text-white text-2xl font-black mb-1">Welcome back</h2>
        <p className="text-white/60 text-sm mb-6">Sign in to continue your fitness journey</p>

        {successMsg && (
          <div className="mb-4 px-4 py-3 bg-green-500/20 border border-green-500/40 rounded-xl">
            <p className="text-green-300 text-sm">{successMsg}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/20 border border-red-500/40 rounded-xl">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-white/70 text-xs font-semibold block mb-1.5">Email</label>
            <input type="email" value={form.email} placeholder="you@example.com" required
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} />
          </div>

          <div>
            <label className="text-white/70 text-xs font-semibold block mb-1.5">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={form.password} placeholder="••••••••" required
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="w-full px-4 py-3 pr-12 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 text-xs font-semibold">
                {showPw ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

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