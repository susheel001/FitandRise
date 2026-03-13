import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';


function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = Math.ceil(target / 60);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(start);
        }, 20);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}


function ScreenCard({ src, label, desc, accent }) {
  return (
    <div className="group relative rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
      style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="relative overflow-hidden">
        <img src={src} alt={label} className="w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(to top, ${accent}44, transparent)` }} />
      </div>
      <div className="p-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <p className="font-black text-white text-sm mb-1">{label}</p>
        <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
      </div>
      <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
    </div>
  );
}


function TestimonialCard({ name, role, text, avatar }) {
  return (
    <div className="rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex gap-1 mb-4">
        {[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400 text-sm">★</span>)}
      </div>
      <p className="text-white/60 text-sm leading-relaxed mb-4">"{text}"</p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-white"
          style={{ background: 'linear-gradient(135deg,#3b82f6,#22c55e)' }}>
          {avatar}
        </div>
        <div>
          <p className="text-white font-bold text-sm">{name}</p>
          <p className="text-white/40 text-xs">{role}</p>
        </div>
      </div>
    </div>
  );
}


export default function Landing() {
  const [scrolled, setScrolled]       = useState(false);
  const [menuOpen, setMenuOpen]       = useState(false);
  const [activeScreen, setActiveScreen] = useState(0);

  const screens = [
    { src: '/fit1.png', label: 'Dashboard',   accent: '#3b82f6' },
    { src: '/fit2.png', label: 'Workouts',    accent: '#ef4444' },
    { src: '/fit3.png', label: 'Nutrition',   accent: '#22c55e' },
    { src: '/fit5.png', label: 'Progress',    accent: '#f97316' },
    { src: '/fit4.png', label: 'BMI & Tools', accent: '#a855f7' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveScreen(p => (p + 1) % screens.length), 3000);
    return () => clearInterval(t);
  }, []);

  const features = [
    { icon: '🔥', title: 'Calorie Tracking',   color: '#f97316', desc: 'Log every meal with detailed macros — calories, protein, carbs and fat.' },
    { icon: '💪', title: 'Workout Logger',      color: '#3b82f6', desc: 'Track exercises by muscle group. Mark sets done and build consistency.' },
    { icon: '📊', title: 'Weekly Progress',     color: '#22c55e', desc: 'Beautiful charts showing calorie and protein trends over 7 days.' },
    { icon: '🎯', title: 'Personal Goals',      color: '#a855f7', desc: 'Set custom targets for calories, protein, water and weekly workouts.' },
    { icon: '💧', title: 'Water Tracker',       color: '#06b6d4', desc: 'Log glasses of water and never miss your daily hydration goal.' },
    { icon: '⚖️', title: 'BMI & Calorie Tools', color: '#f59e0b', desc: 'Calculate BMI and estimate calories burned from 10 activities.' },
  ];

  const steps = [
    { num: '01', title: 'Create your account', desc: 'Sign up in seconds. Set your goal, experience level and body metrics.' },
    { num: '02', title: 'Set your goals',       desc: 'Define daily targets for calories, protein, water and workouts.' },
    { num: '03', title: 'Log daily activity',   desc: 'Add meals, track workouts and log water intake throughout the day.' },
    { num: '04', title: 'Watch yourself grow',  desc: 'Check weekly charts and progress stats to see your journey come to life.' },
  ];

  const stats = [
    { value: 6,   suffix: '',  label: 'Core Features' },
    { value: 10,  suffix: '+', label: 'Muscle Groups' },
    { value: 100, suffix: '+', label: 'Exercises' },
    { value: 100, suffix: '%', label: 'Free to Use' },
  ];

  const testimonials = [
    { name: 'Rahul M.',    role: 'Gym enthusiast',    avatar: 'R', text: 'FitandRise completely changed how I track my workouts. The interface is clean and super easy to use every day.' },
    { name: 'Priya S.',    role: 'Fitness beginner',  avatar: 'P', text: 'As someone just starting out, the goal setting and progress charts really keep me motivated to stay on track.' },
    { name: 'Aditya K.',   role: 'Personal trainer',  avatar: 'A', text: 'I recommend FitandRise to all my clients. The meal logging and BMI tools are exactly what beginners need.' },
  ];

  return (
    <div className="min-h-screen bg-[#080c14] text-white overflow-x-hidden">

      
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#080c14]/90 backdrop-blur-xl border-b border-white/5 py-3' : 'py-5'}`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/fitandrise.jpeg" alt="FitandRise" className="w-9 h-9 rounded-xl object-cover" />
            <span className="font-black text-lg">FitandRise</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {[['Features','#features'],['Screenshots','#screenshots'],['Reviews','#reviews'],['How it Works','#how-it-works']].map(([l,h])=>(
              <a key={l} href={h} className="text-white/50 hover:text-white text-sm font-medium transition-colors">{l}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="px-5 py-2 rounded-xl text-sm font-bold text-white/70 hover:text-white transition-colors">Sign In</Link>
            <Link to="/signup" className="px-5 py-2 rounded-xl text-sm font-black text-white transition-all hover:opacity-90 hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#22c55e)' }}>Get Started Free</Link>
          </div>
          <button className="md:hidden text-white/70 text-xl" onClick={() => setMenuOpen(p => !p)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden mt-2 mx-6 rounded-2xl p-4 space-y-3"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {[['Features','#features'],['Screenshots','#screenshots'],['Reviews','#reviews'],['How it Works','#how-it-works']].map(([l,h])=>(
              <a key={l} href={h} className="block text-white/60 hover:text-white text-sm py-1" onClick={() => setMenuOpen(false)}>{l}</a>
            ))}
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="flex-1 text-center py-2 rounded-xl text-sm font-bold border border-white/20 text-white/70">Sign In</Link>
              <Link to="/signup" className="flex-1 text-center py-2 rounded-xl text-sm font-black text-white"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#22c55e)' }}>Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center px-6 pt-24 pb-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
            style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
            style={{ background: 'radial-gradient(circle, #22c55e, transparent)' }} />
        </div>
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
          <div>
            {/* Free badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4"
              style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#86efac' }}>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              100% Free — No credit card required
            </div>

            <h1 className="text-5xl sm:text-6xl font-black leading-none tracking-tight mb-6">
              Track. Train.{' '}
              <span style={{ background: 'linear-gradient(135deg,#3b82f6,#22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Rise.
              </span>
            </h1>
            <p className="text-white/50 text-lg max-w-lg mb-10 leading-relaxed">
              FitandRise helps you log meals, track workouts, monitor water intake
              and visualize your weekly progress — all in one clean dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup"
                className="px-8 py-4 rounded-2xl font-black text-white text-base transition-all hover:opacity-90 hover:scale-105 text-center"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#22c55e)', boxShadow: '0 0 40px rgba(59,130,246,0.3)' }}>
                Start for Free →
              </Link>
              <a href="#screenshots"
                className="px-8 py-4 rounded-2xl font-bold text-white/70 hover:text-white text-base transition-all text-center"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                See Screenshots
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 mt-8">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {['R','P','A','S'].map((l,i) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-[#080c14] flex items-center justify-center text-xs font-black text-white"
                      style={{ background: 'linear-gradient(135deg,#3b82f6,#22c55e)' }}>{l}</div>
                  ))}
                </div>
                <span className="text-white/40 text-xs">100+ users</span>
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400 text-xs">★</span>)}
                <span className="text-white/40 text-xs ml-1">5.0 rating</span>
              </div>
            </div>
          </div>

          {/* Right — rotating screenshot */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="ml-3 text-white/20 text-xs">fitand-rise.vercel.app</span>
              </div>
              <img key={activeScreen} src={screens[activeScreen].src} alt={screens[activeScreen].label}
                className="w-full object-cover" style={{ animation: 'fadeIn 0.5s ease' }} />
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {screens.map((s, i) => (
                <button key={i} onClick={() => setActiveScreen(i)}
                  className="rounded-full transition-all duration-300"
                  style={{ width: i === activeScreen ? '24px' : '8px', height: '8px', background: i === activeScreen ? s.accent : 'rgba(255,255,255,0.2)' }} />
              ))}
            </div>
            <p className="text-center text-white/30 text-xs mt-2">{screens[activeScreen].label}</p>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 blur-3xl opacity-20 rounded-full"
              style={{ background: `linear-gradient(90deg,${screens[activeScreen].accent},transparent)` }} />
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-4xl font-black mb-1"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                <Counter target={s.value} suffix={s.suffix} />
              </p>
              <p className="text-white/40 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

     
      <section id="screenshots" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-blue-400 text-sm font-bold tracking-widest uppercase mb-3">Real app, real UI</p>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">See exactly what you're getting</h2>
            <p className="text-white/40 max-w-xl mx-auto">No mockups. These are actual screenshots from the live app.</p>
          </div>
          <div className="rounded-2xl overflow-hidden mb-4 shadow-2xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="ml-3 text-white/20 text-xs">Dashboard — fitand-rise.vercel.app/dashboard</span>
            </div>
            <img src="/fit1.png" alt="Dashboard" className="w-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ScreenCard src="/fit2.png" label="Workout Tracker" desc="Pick a muscle group and track exercises with video guides" accent="#ef4444" />
            <ScreenCard src="/fit3.png" label="Nutrition Logger" desc="Search and log foods with full macro breakdown"           accent="#22c55e" />
            <ScreenCard src="/fit5.png" label="Progress Charts"  desc="Weekly bar charts showing calories and protein trends"    accent="#f97316" />
            <ScreenCard src="/fit4.png" label="BMI & Tools"      desc="BMI calculator and calorie burn estimator"                accent="#a855f7" />
          </div>
        </div>
      </section>

      
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-green-400 text-sm font-bold tracking-widest uppercase mb-3">Everything you need</p>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Built for real fitness journeys</h2>
            <p className="text-white/40 max-w-xl mx-auto">Every feature is simple to use but powerful enough to make a real difference.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} className="group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-white font-black text-base mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section id="reviews" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-yellow-400 text-sm font-bold tracking-widest uppercase mb-3">What users say</p>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Real people, real results</h2>
            <p className="text-white/40 max-w-xl mx-auto">Join hundreds of users already tracking their fitness journey with FitandRise.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {testimonials.map((t, i) => <TestimonialCard key={i} {...t} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-purple-400 text-sm font-bold tracking-widest uppercase mb-3">Simple by design</p>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Up and running in minutes</h2>
          </div>
          <div className="space-y-6">
            {steps.map((s, i) => (
              <div key={i} className="flex gap-5 items-start group">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center font-black text-base transition-all duration-300 group-hover:scale-110"
                  style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.2),rgba(34,197,94,0.2))', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd' }}>
                  {s.num}
                </div>
                <div className="flex-1 pt-3">
                  <h3 className="font-black text-white mb-1">{s.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-3xl p-10 sm:p-14 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.15),rgba(34,197,94,0.15))', border: '1px solid rgba(59,130,246,0.2)' }}>
            <img src="/fitandrise.jpeg" alt="FitandRise" className="w-16 h-16 rounded-2xl object-cover mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-black mb-4">Ready to rise?</h2>
            <p className="text-white/50 mb-2 max-w-md mx-auto">Join FitandRise today and take the first step toward a stronger, healthier you.</p>
            <p className="text-green-400 text-sm font-bold mb-8">✓ Completely free — no credit card needed</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup"
                className="px-8 py-4 rounded-2xl font-black text-white text-base transition-all hover:opacity-90 hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#22c55e)', boxShadow: '0 0 40px rgba(59,130,246,0.3)' }}>
                Create Free Account
              </Link>
              <Link to="/login"
                className="px-8 py-4 rounded-2xl font-bold text-white/70 hover:text-white text-base transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/fitandrise.jpeg" alt="FitandRise" className="w-7 h-7 rounded-lg object-cover" />
            <span className="font-black text-sm">FitandRise</span>
          </div>
          <p className="text-white/20 text-xs">© 2026 FitandRise. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/login"  className="text-white/30 hover:text-white text-xs transition-colors">Sign In</Link>
            <Link to="/signup" className="text-white/30 hover:text-white text-xs transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:scale(1.02); } to { opacity:1; transform:scale(1); } }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}