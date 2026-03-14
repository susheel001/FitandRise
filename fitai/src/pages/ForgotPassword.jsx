import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw new Error(error.message);
      setSent(true);
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
          src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1920&auto=format&fit=crop&q=80"
          alt="" className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 rounded-3xl p-8 shadow-2xl"
        style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(28px)', border: '1px solid rgba(255,255,255,0.15)' }}>

        {/* Logo — fixed from BeFit to FitandRise */}
        <div className="flex items-center gap-3 mb-8">
          <img src="/fitandrise.jpeg" alt="FitandRise" className="w-10 h-10 rounded-xl object-cover" />
          <h1 className="text-white text-xl font-black">FitandRise</h1>
        </div>

        {!sent ? (
          <>
            <h2 className="text-white text-2xl font-black mb-1">Forgot Password?</h2>
            <p className="text-white/60 text-sm mb-6">
              Enter your email and we'll send you a reset link.
            </p>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-500/20 border border-red-500/40 rounded-xl">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-white/70 text-xs font-semibold block mb-1.5">Email Address</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                />
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl font-black text-white text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#22c55e)' }}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-500/20 border border-green-500/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="text-white text-xl font-black mb-2">Check Your Email</h3>
            <p className="text-white/60 text-sm mb-1">We sent a reset link to</p>
            <p className="text-blue-400 font-bold text-sm mb-6">{email}</p>
            <p className="text-white/40 text-xs">
              Didn't get it? Check your spam folder or{' '}
              <button onClick={() => { setSent(false); setEmail(''); }}
                className="text-blue-400 hover:text-blue-300 font-semibold underline">
                try again
              </button>
            </p>
          </div>
        )}

        <p className="text-center text-white/50 text-sm mt-6">
          Remember it?{' '}
          <Link to="/login" className="text-blue-400 font-bold hover:text-blue-300">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}