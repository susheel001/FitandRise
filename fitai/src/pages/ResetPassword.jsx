import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [validSession, setValidSession] = useState(false);

  // Supabase puts the token in the URL hash — this picks it up automatically
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setValidSession(true); // user arrived via reset link ✅
      }
    });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6)
      return setError('Password must be at least 6 characters.');
    if (password !== confirm)
      return setError('Passwords do not match.');

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(error.message);

      // Redirect to login with success message
      navigate('/login', { state: { message: '✅ Password updated! Please sign in.' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1920&auto=format&fit=crop&q=80"
          alt="" className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(0,0,0,0.4),rgba(0,0,0,0.75))' }} />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 rounded-3xl p-8 shadow-2xl"
        style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(28px)', border: '1px solid rgba(255,255,255,0.15)' }}>

        <div className="flex items-center gap-3 mb-8">
          <img src="/fitandrise.jpeg" alt="FitandRise" className="w-10 h-10 rounded-xl object-cover" />
          <h1 className="text-white text-xl font-black">FitandRise</h1>
        </div>

        {!validSession ? (
          // Invalid / expired link
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-500/20 border border-red-500/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </div>
            <h2 className="text-white text-xl font-black mb-2">Invalid or Expired Link</h2>
            <p className="text-white/60 text-sm mb-6">This reset link has expired. Please request a new one.</p>
            <a href="/forgot-password"
              className="inline-block px-6 py-3 rounded-xl font-black text-white text-sm"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#22c55e)' }}>
              Request New Link
            </a>
          </div>
        ) : (
          <>
            <h2 className="text-white text-2xl font-black mb-1">Set New Password</h2>
            <p className="text-white/60 text-sm mb-6">Choose a strong password for your account.</p>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-500/20 border border-red-500/40 rounded-xl">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-white/70 text-xs font-semibold block mb-1.5">New Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required
                    className="w-full px-4 py-3 pr-12 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 text-xs font-semibold">
                    {showPw ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-white/70 text-xs font-semibold block mb-1.5">Confirm Password</label>
                <input type={showPw ? 'text' : 'password'} value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} />
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl font-black text-white text-sm mt-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#22c55e)' }}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}