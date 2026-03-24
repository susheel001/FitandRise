import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@mdi/react';
import {
  mdiRobot, mdiCamera, mdiFire, mdiDumbbell, mdiChartBar,
  mdiWater, mdiTarget, mdiScaleBalance, mdiCheckCircle,
  mdiStar, mdiArrowRight,
} from '@mdi/js';

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

export default function Landing() {
  const [scrolled,     setScrolled]     = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [activeScreen, setActiveScreen] = useState(0);
  const [lightbox,     setLightbox]     = useState(null);

  const screens = [
    { src: '/fitandrise1.png', label: 'Dashboard',     accent: '#3b82f6' },
    { src: '/fitandrise2.png', label: 'Workouts',       accent: '#ef4444' },
    { src: '/fitandrise3.png', label: 'AI Nutrition',   accent: '#22c55e' },
    { src: '/fitandrise4.png', label: 'Progress',       accent: '#f97316' },
    { src: '/fitandrise5.png', label: 'BMI & Tools',    accent: '#a855f7' },
    { src: '/fitandrise6.png', label: 'AI Suggestions', accent: '#a855f7' },
    { src: '/fitandrise7.png', label: 'Food Scanner',   accent: '#06b6d4' },
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

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const features = [
    { icon: mdiRobot,        title: 'AI Meal Suggestions', color: '#a855f7', desc: 'Get 3 personalized meal suggestions based on your remaining calories and goals.',  badge: 'NEW' },
    { icon: mdiCamera,       title: 'AI Food Scanner',     color: '#06b6d4', desc: 'Point camera at any food — AI calculates all nutrition values instantly.',          badge: 'NEW' },
    { icon: mdiFire,         title: 'Calorie Tracking',    color: '#f97316', desc: 'Log every meal with detailed macros — calories, protein, carbs and fat.'                    },
    { icon: mdiDumbbell,     title: 'Workout Logger',      color: '#3b82f6', desc: 'Track exercises by muscle group. Mark sets done and build consistency.'                     },
    { icon: mdiChartBar,     title: 'Weekly Progress',     color: '#22c55e', desc: 'Beautiful charts showing your calorie and protein trends over 7 days.'                     },
    { icon: mdiWater,        title: 'Water Tracker',       color: '#0ea5e9', desc: 'Log glasses of water and never miss your daily hydration goal.'                            },
    { icon: mdiTarget,       title: 'Personal Goals',      color: '#ec4899', desc: 'Set custom targets for calories, protein, water and weekly workouts.'                      },
    { icon: mdiScaleBalance, title: 'BMI & Tools',         color: '#f59e0b', desc: 'Calculate BMI and estimate calories burned from activities.'                               },
  ];

  const stats = [
    { value: 8,  suffix: '',  label: 'Core Features' },
    { value: 10, suffix: '+', label: 'Muscle Groups' },
    { value: 5,  suffix: '$', label: 'Premium/month' },
  ];

  const steps = [
    { num: '01', title: 'Create your account',   desc: 'Sign up in seconds. Set your goal, level and body metrics.',      img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=120&auto=format&fit=crop' },
    { num: '02', title: 'Set your goals',         desc: 'Define daily targets for calories, protein, water and workouts.', img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=120&auto=format&fit=crop' },
    { num: '03', title: 'Scan or log your food',  desc: 'Use AI food scanner or manually log meals with one tap.',         img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=120&auto=format&fit=crop' },
    { num: '04', title: 'Watch yourself grow',    desc: 'Check weekly charts and progress stats to see your journey.',     img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=120&auto=format&fit=crop' },
  ];

  const testimonials = [
    { name: 'Arjun M.',  goal: 'Weight Loss',     text: 'The AI food scanner changed everything. I just point my phone at my food and it logs everything automatically!',        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop' },
    { name: 'Priya S.',  goal: 'Muscle Gain',     text: 'AI meal suggestions are insanely good. It knows exactly what I should eat based on my remaining protein for the day.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&auto=format&fit=crop' },
    { name: 'Rahul K.',  goal: 'General Fitness', text: 'Finally a fitness app that is completely free and actually works. The workout tracker and progress charts are perfect.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&auto=format&fit=crop' },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl font-black">✕</button>
          <img src={lightbox} alt="Screenshot" className="max-w-5xl w-full rounded-2xl shadow-2xl"
            onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${scrolled ? 'shadow-md py-3' : 'py-4 border-b border-gray-100'}`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/fitandrise.jpeg" alt="FitandRise" className="w-9 h-9 rounded-xl object-cover" />
            <span className="font-black text-xl text-gray-900">FitandRise</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {[['Features','#features'],['App Preview','#app-preview'],['How it Works','#how-it-works']].map(([l,h])=>(
              <a key={l} href={h} className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">{l}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="px-5 py-2 rounded-xl text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">Log In</Link>
            <Link to="/signup" className="px-5 py-2 rounded-xl text-sm font-black text-white transition-all hover:opacity-90 hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#22c55e)' }}>
              Sign Up Free
            </Link>
          </div>
          <button className="md:hidden text-gray-600 text-xl" onClick={() => setMenuOpen(p => !p)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden mt-2 mx-6 rounded-2xl p-4 space-y-3 bg-gray-50 border border-gray-100">
            {[['Features','#features'],['App Preview','#app-preview'],['How it Works','#how-it-works']].map(([l,h])=>(
              <a key={l} href={h} className="block text-gray-600 hover:text-gray-900 text-sm py-1" onClick={() => setMenuOpen(false)}>{l}</a>
            ))}
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="flex-1 text-center py-2 rounded-xl text-sm font-bold border border-gray-200 text-gray-600">Log In</Link>
              <Link to="/signup" className="flex-1 text-center py-2 rounded-xl text-sm font-black text-white"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#22c55e)' }}>Sign Up</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-28 pb-16 px-6 overflow-hidden bg-white">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6 bg-blue-50 text-blue-600 border border-blue-100">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Now with AI Food Scanner
            </div>
            <h1 className="text-5xl sm:text-6xl font-black leading-tight tracking-tight mb-6 text-gray-900">
              Your fitness,{' '}
              <span style={{ background: 'linear-gradient(135deg,#3b82f6,#22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                powered by AI
              </span>
            </h1>
            <p className="text-gray-500 text-lg max-w-lg mb-8 leading-relaxed">
              Log meals with AI, scan food with your camera, track workouts and visualize your weekly progress — all completely free.
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {[
                { label: 'AI Meal Suggestions', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
                { label: 'Food Scanner',         bg: 'bg-cyan-50',   text: 'text-cyan-600',   border: 'border-cyan-100'   },
                { label: 'Workout Tracker',      bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-100'   },
                { label: 'Progress Charts',      bg: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-100'  },
              ].map(f => (
                <span key={f.label} className={`px-3 py-1 rounded-full text-xs font-semibold border ${f.bg} ${f.text} ${f.border}`}>
                  {f.label}
                </span>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/signup"
                className="px-8 py-4 rounded-2xl font-black text-white text-base transition-all hover:opacity-90 hover:scale-105 text-center shadow-lg flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#22c55e)', boxShadow: '0 8px 30px rgba(59,130,246,0.3)' }}>
                Start for Free
                <Icon path={mdiArrowRight} size={0.85} color="white" />
              </Link>
              <a href="#app-preview"
                className="px-8 py-4 rounded-2xl font-bold text-gray-600 hover:text-gray-900 text-base transition-all text-center bg-gray-50 border border-gray-200 hover:bg-gray-100">
                See the App
              </a>
            </div>
            <p className="text-gray-400 text-xs mt-4 font-medium">No credit card required. Always free.</p>
          </div>

          {/* Right — athlete + app mockup */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl"
              style={{ background: 'linear-gradient(135deg,#eff6ff,#f0fdf4)' }}>
              <img
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80"
                alt="Athlete" className="w-full h-80 object-cover object-top" />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl p-4 shadow-xl"
                style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#a855f7,#3b82f6)' }}>
                    <Icon path={mdiRobot} size={0.6} color="white" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-black text-xs">AI suggested for you</p>
                    <p className="text-gray-400 text-xs">Based on your remaining goals</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {['Grilled Chicken 165 kcal', 'Brown Rice 216 kcal', 'Greek Yogurt 100 kcal'].map((m, i) => (
                    <div key={i} className="flex-1 px-2 py-1.5 rounded-xl text-center"
                      style={{ background: i === 0 ? 'rgba(59,130,246,0.08)' : 'rgba(0,0,0,0.03)' }}>
                      <p className="text-gray-700 font-semibold" style={{ fontSize: '9px' }}>{m}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -top-3 -right-3 bg-white rounded-2xl px-4 py-3 shadow-lg border border-gray-100">
              <p className="text-2xl font-black text-blue-500">Free</p>
              <p className="text-gray-400 text-xs font-semibold">+ Premium</p>
            </div>
            <div className="absolute -bottom-3 -left-3 bg-white rounded-2xl px-4 py-3 shadow-lg border border-gray-100 flex items-center gap-2">
              <Icon path={mdiRobot} size={0.8} color="#a855f7" />
              <p className="text-gray-400 text-xs font-semibold">AI Powered</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="py-12 px-6 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-4xl font-black mb-1"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                <Counter target={s.value} suffix={s.suffix} />
              </p>
              <p className="text-gray-400 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI FEATURES HIGHLIGHT ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1.5 rounded-full text-xs font-bold mb-4 bg-purple-50 text-purple-600 border border-purple-100">
              Powered by Groq AI
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mb-4 text-gray-900">AI that works for your fitness</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Two powerful AI features that make logging food effortless.</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:-translate-y-1 transition-all duration-300 group">
              <div className="p-8 bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(168,85,247,0.15)' }}>
                  <Icon path={mdiRobot} size={1} color="#a855f7" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mb-3 bg-purple-100 text-purple-600">
                  NEW — AI Powered
                </div>
                <h3 className="text-gray-900 font-black text-2xl mb-3">AI Meal Suggestions</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">
                  Tell the AI your remaining calories and protein — it instantly suggests 3 perfect meals tailored to your fitness goal.
                </p>
                <ul className="space-y-2 mb-6">
                  {['Personalized to your fitness goal', '6 free suggestions per day', 'One click to add to your meal log'].map(p => (
                    <li key={p} className="flex items-center gap-2 text-sm text-gray-600">
                      <Icon path={mdiCheckCircle} size={0.7} color="#a855f7" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="cursor-pointer overflow-hidden" onClick={() => setLightbox('/fitandrise6.png')}>
                <img src="/fitandrise6.png" alt="AI Meal Suggestions"
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:-translate-y-1 transition-all duration-300 group">
              <div className="p-8 bg-gradient-to-br from-cyan-50 to-blue-50">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(6,182,212,0.15)' }}>
                  <Icon path={mdiCamera} size={1} color="#06b6d4" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mb-3 bg-cyan-100 text-cyan-600">
                  NEW — Camera AI
                </div>
                <h3 className="text-gray-900 font-black text-2xl mb-3">AI Food Scanner</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">
                  Point your camera at any food and AI vision instantly calculates calories, protein, carbs and fat. No manual entry needed.
                </p>
                <ul className="space-y-2 mb-6">
                  {['Live camera scanning', 'AI vision analyzes the food', 'Auto-fills all nutrition data'].map(p => (
                    <li key={p} className="flex items-center gap-2 text-sm text-gray-600">
                      <Icon path={mdiCheckCircle} size={0.7} color="#06b6d4" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="cursor-pointer overflow-hidden" onClick={() => setLightbox('/fitandrise7.png')}>
                <img src="/fitandrise7.png" alt="Food Scanner"
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── APP PREVIEW ── */}
      <section id="app-preview" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1.5 rounded-full text-xs font-bold mb-4 bg-blue-50 text-blue-600 border border-blue-100">
              Real app, real UI
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mb-4 text-gray-900">See exactly what you're getting</h2>
            <p className="text-gray-400 max-w-xl mx-auto">No mockups. Click any image to view it fullscreen.</p>
          </div>
          <div className="rounded-2xl overflow-hidden mb-4 shadow-xl cursor-pointer group border border-gray-200"
            onClick={() => setLightbox('/fitandrise1.png')}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-white">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-3 text-gray-400 text-xs">fitand-rise.vercel.app/dashboard</span>
            </div>
            <div className="relative">
              <img src="/fitandrise1.png" alt="Dashboard" className="w-full transition-transform duration-500 group-hover:scale-[1.01]" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center bg-black/20">
                <span className="text-white font-bold bg-black/50 px-4 py-2 rounded-xl text-sm">Click to expand</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { src: '/fitandrise2.png', label: 'Workouts',     accent: '#ef4444' },
              { src: '/fitandrise6.png', label: 'AI Nutrition', accent: '#a855f7' },
              { src: '/fitandrise4.png', label: 'Progress',     accent: '#f97316' },
              { src: '/fitandrise5.png', label: 'BMI Tools',    accent: '#f59e0b' },
              { src: '/fitandrise7.png', label: 'Food Scanner', accent: '#06b6d4' },
            ].map((s, i) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-gray-200"
                onClick={() => setLightbox(s.src)}>
                <img src={s.src} alt={s.label} className="w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2"
                  style={{ background: `linear-gradient(to top, ${s.accent}99, transparent)` }}>
                  <span className="text-white text-xs font-bold">{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1.5 rounded-full text-xs font-bold mb-4 bg-green-50 text-green-600 border border-green-100">
              Everything you need
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mb-4 text-gray-900">Built for real fitness journeys</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Every feature is simple to use but powerful enough to make a real difference.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <div key={i} className="group rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-gray-100 bg-white relative">
                {f.badge && (
                  <span className="absolute top-3 right-3 text-xs font-black px-2 py-0.5 rounded-full"
                    style={{ background: `${f.color}18`, color: f.color }}>
                    {f.badge}
                  </span>
                )}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${f.color}15` }}>
                  <Icon path={f.icon} size={0.8} color={f.color} />
                </div>
                <h3 className="text-gray-900 font-black text-sm mb-1.5">{f.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ATHLETE SECTION ── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black mb-4 text-gray-900">Train like a champion</h2>
            <p className="text-gray-400 max-w-xl mx-auto">FitandRise is built for everyone — from beginners to elite athletes.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              { img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80', title: 'Track Every Workout',  desc: 'Log exercises across multiple muscle groups. Build consistency and never miss a session.',             color: '#3b82f6', tag: 'Workout Tracker', icon: mdiDumbbell },
              { img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&auto=format&fit=crop&q=80', title: 'Fuel Your Body Right',  desc: 'Use AI to scan food or get meal suggestions tailored to your exact calorie and protein goals.',         color: '#22c55e', tag: 'AI Nutrition',    icon: mdiRobot    },
              { img: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&auto=format&fit=crop&q=80', title: 'See Your Progress',       desc: 'Beautiful weekly charts show your calorie and protein trends so you can celebrate every win.',          color: '#f97316', tag: 'Progress Charts', icon: mdiChartBar },
            ].map((a, i) => (
              <div key={i} className="rounded-3xl overflow-hidden shadow-lg border border-gray-100 group hover:-translate-y-1 transition-all duration-300">
                <div className="relative h-52 overflow-hidden">
                  <img src={a.img} alt={a.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }} />
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1"
                    style={{ background: `${a.color}cc` }}>
                    <Icon path={a.icon} size={0.5} color="white" />
                    {a.tag}
                  </span>
                </div>
                <div className="p-5 bg-white">
                  <h3 className="font-black text-gray-900 text-base mb-2">{a.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1.5 rounded-full text-xs font-bold mb-4 bg-purple-50 text-purple-600 border border-purple-100">
              Simple by design
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mb-4 text-gray-900">Up and running in minutes</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="text-center group">
                <div className="relative mb-4 inline-block">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md">
                    <img src={s.img} alt={s.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white"
                    style={{ background: 'linear-gradient(135deg,#3b82f6,#22c55e)' }}>
                    {i + 1}
                  </div>
                </div>
                <h3 className="font-black text-gray-900 text-sm mb-1">{s.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black mb-4 text-gray-900">Loved by fitness enthusiasts</h2>
            <p className="text-gray-400">Real people, real results.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-black text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.goal}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Icon key={j} path={mdiStar} size={0.55} color="#facc15" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl overflow-hidden shadow-2xl">
            <div className="relative h-64 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&auto=format&fit=crop&q=80"
                alt="Fitness" className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
                style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.85),rgba(34,197,94,0.85))' }}>
                <img src="/fitandrise.jpeg" alt="FitandRise" className="w-12 h-12 rounded-xl object-cover mb-4 shadow-lg" />
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">Ready to rise?</h2>
                <p className="text-white/80 text-sm max-w-md">Join FitandRise today — AI-powered fitness tracking, completely free.</p>
              </div>
            </div>
            <div className="bg-white p-8 text-center">
              <div className="flex justify-center gap-2 mb-6 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-600 border border-purple-100 flex items-center gap-1">
                  <Icon path={mdiRobot} size={0.5} color="#a855f7" /> AI Powered
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center gap-1">
                  <Icon path={mdiCamera} size={0.5} color="#06b6d4" /> Food Scanner
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100 flex items-center gap-1">
                  <Icon path={mdiCheckCircle} size={0.5} color="#22c55e" /> Free + Premium
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/signup"
                  className="px-10 py-4 rounded-2xl font-black text-white text-base transition-all hover:opacity-90 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#22c55e)', boxShadow: '0 8px 30px rgba(59,130,246,0.3)' }}>
                  Create Free Account
                  <Icon path={mdiArrowRight} size={0.85} color="white" />
                </Link>
                <Link to="/login"
                  className="px-10 py-4 rounded-2xl font-bold text-gray-600 hover:text-gray-900 text-base transition-all bg-gray-50 border border-gray-200 hover:bg-gray-100">
                  Log In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6 border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/fitandrise.jpeg" alt="FitandRise" className="w-7 h-7 rounded-lg object-cover" />
            <span className="font-black text-sm text-gray-900">FitandRise</span>
          </div>
          <p className="text-gray-300 text-xs">© 2026 FitandRise. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/login"  className="text-gray-400 hover:text-gray-900 text-xs transition-colors">Log In</Link>
            <Link to="/signup" className="text-gray-400 hover:text-gray3900 text-xs transition-colors">Sign Up</Link>
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