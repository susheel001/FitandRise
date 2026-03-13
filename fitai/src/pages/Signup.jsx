import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// ── PASSWORD STRENGTH ─────────────────────────────────────────
function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8)          score++;
  if (pw.length >= 12)         score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak',        color: '#ef4444', bg: 'bg-red-500' };
  if (score <= 2) return { score, label: 'Fair',        color: '#f97316', bg: 'bg-orange-500' };
  if (score <= 3) return { score, label: 'Good',        color: '#eab308', bg: 'bg-yellow-500' };
  if (score <= 4) return { score, label: 'Strong',      color: '#22c55e', bg: 'bg-green-500' };
  return             { score, label: 'Very Strong', color: '#3b82f6', bg: 'bg-blue-500' };
}

function PasswordStrengthBar({ password }) {
  const { score, label, color, bg } = getStrength(password);
  if (!password) return null;
  const checks = [
    { text: 'At least 8 characters',        pass: password.length >= 8 },
    { text: 'One uppercase letter (A-Z)',    pass: /[A-Z]/.test(password) },
    { text: 'One number (0-9)',              pass: /[0-9]/.test(password) },
    { text: 'One special character (!@#$)', pass: /[^A-Za-z0-9]/.test(password) },
  ];
  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {[1,2,3,4,5].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= score ? bg : 'bg-white/20'}`} />
          ))}
        </div>
        <span className="text-xs font-bold" style={{ color }}>{label}</span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map(c => (
          <div key={c.text} className="flex items-center gap-1.5">
            <span className={`text-xs ${c.pass ? 'text-green-400' : 'text-white/30'}`}>{c.pass ? '✓' : '○'}</span>
            <span className={`text-xs ${c.pass ? 'text-white/70' : 'text-white/30'}`}>{c.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────
export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm]         = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [showCon, setShowCon]   = useState(false);

  const { score } = getStrength(form.password);
  const passwordsMatch    = form.confirm && form.password === form.confirm;
  const passwordsMismatch = form.confirm && form.password !== form.confirm;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6)       return setError('Password must be at least 6 characters');
    if (score < 2)                       return setError('Please choose a stronger password');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email:    form.email,
        password: form.password,
        options:  { data: { name: form.name } },
      });
      if (error) throw new Error(error.message);
      navigate('/login', { state: { message: 'Account created! Please check your email to confirm.' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&auto=format&fit=crop&q=80"
          alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/65" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 rounded-3xl p-8 shadow-2xl my-8"
        style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(28px)', border: '1px solid rgba(255,255,255,0.15)' }}>

        <div className="flex items-center gap-3 mb-6">
          <img src="/fitandrise.jpeg" alt="FitandRise" className="w-10 h-10 rounded-xl object-cover" />
          <h1 className="text-white text-xl font-black">FitandRise</h1>
        </div>

        <h2 className="text-white text-2xl font-black mb-1">Create Account</h2>
        <p className="text-white/60 text-sm mb-6">Start your fitness journey today</p>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/20 border border-red-500/40 rounded-xl">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-white/70 text-xs font-semibold block mb-1.5">Full Name</label>
            <input type="text" value={form.name} placeholder="Alex Johnson" required
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} />
          </div>

          {/* Email */}
          <div>
            <label className="text-white/70 text-xs font-semibold block mb-1.5">Email</label>
            <input type="email" value={form.email} placeholder="you@example.com" required
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }} />
          </div>

          {/* Password + strength */}
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
            <PasswordStrengthBar password={form.password} />
          </div>

          {/* Confirm password */}
          <div>
            <label className="text-white/70 text-xs font-semibold block mb-1.5">Confirm Password</label>
            <div className="relative">
              <input type={showCon ? 'text' : 'password'} value={form.confirm} placeholder="••••••••" required
                onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                className="w-full px-4 py-3 pr-12 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                style={{ background: 'rgba(255,255,255,0.1)', border: `1px solid ${passwordsMismatch ? 'rgba(239,68,68,0.6)' : passwordsMatch ? 'rgba(34,197,94,0.6)' : 'rgba(255,255,255,0.2)'}` }} />
              <button type="button" onClick={() => setShowCon(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 text-xs font-semibold">
                {showCon ? 'HIDE' : 'SHOW'}
              </button>
            </div>
            {passwordsMatch    && <p className="text-green-400 text-xs mt-1">✓ Passwords match</p>}
            {passwordsMismatch && <p className="text-red-400  text-xs mt-1">✗ Passwords do not match</p>}
          </div>

          <button type="submit" disabled={loading || score < 2}
            className="w-full py-3.5 rounded-xl font-black text-white text-sm mt-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#22c55e)' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          {score < 2 && form.password && (
            <p className="text-center text-white/40 text-xs">Strengthen your password to continue</p>
          )}
        </form>

        <p className="text-center text-white/50 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 font-bold hover:text-blue-300">Sign In</Link>
        </p>
      </div>
    </div>
  );
}