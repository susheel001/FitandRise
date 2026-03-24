import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/useApp';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '@mdi/react';
import { mdiDumbbell, mdiFood, mdiChartBar, mdiCalculator, mdiPencil, mdiCheck, mdiWater, mdiFireAlert } from '@mdi/js';
import { statsAPI } from '../api/api';

function StatCard({ label, value, max, unit, color, icon, onEdit, dm }) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp]       = useState(value);
  const pct = Math.min((value / max) * 100, 100);
  const save = () => { onEdit(parseFloat(temp) || 0); setEditing(false); };
  return (
    <div className={`rounded-2xl border p-4 ${dm ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
            <Icon path={icon} size={0.7} color={color} />
          </div>
          <p className={`text-xs font-semibold ${dm ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
        </div>
        <button onClick={() => { setEditing(!editing); setTemp(value); }} className="text-gray-300 hover:text-blue-400 transition">
          <Icon path={editing ? mdiCheck : mdiPencil} size={0.55} />
        </button>
      </div>
      {editing ? (
        <div className="flex gap-1 mb-2">
          <input type="number" value={temp} onChange={e => setTemp(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && save()}
            className={`w-full border-2 border-blue-400 rounded-lg px-2 py-1 text-base font-black focus:outline-none ${dm ? 'bg-gray-700 text-white' : 'bg-white'}`} />
          <button onClick={save} className="px-2 bg-blue-500 text-white rounded-lg text-xs font-bold">OK</button>
        </div>
      ) : (
        <p className="text-2xl font-black mb-2" style={{ color }}>
          {value}<span className={`text-xs font-medium ml-1 ${dm ? 'text-gray-400' : 'text-gray-400'}`}>/ {max}{unit}</span>
        </p>
      )}
      <div className={`w-full h-2 rounded-full overflow-hidden ${dm ? 'bg-gray-600' : 'bg-gray-100'}`}>
        <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { state, updateStat } = useApp();
  const { stats, goals, profile, darkMode: dm } = state;
  const [weekly, setWeekly] = useState([]);

  const today    = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const textMain = dm ? 'text-white'    : 'text-gray-800';
  const textMuted= dm ? 'text-gray-400' : 'text-gray-500';
  const card     = `rounded-2xl border p-4 sm:p-5 ${dm ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`;

  useEffect(() => {
    statsAPI.weekly().then(data => {
      if (data?.length) {
        setWeekly(
          [...data].reverse().map(d => {
            const raw = d.date ?? '';
            const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
            const parsed = new Date(normalized);
            const day = isNaN(parsed)
              ? raw.slice(5, 10)
              : parsed.toLocaleDateString('en-US', { weekday: 'short' });
            return {
              day,
              calories: d.calories_consumed || 0,
              protein:  d.protein_consumed  || 0,
            };
          })
        );
      }
    }).catch(() => {});
  }, []);

  const quickLinks = [
    { label: 'Log Workout',   to: '/workouts',  icon: mdiDumbbell,    color: '#3b82f6', bg: dm ? '#1e3a8a' : '#dbeafe' },
    { label: 'Log Meal',      to: '/nutrition', icon: mdiFood,        color: '#22c55e', bg: dm ? '#14532d' : '#dcfce7' },
    { label: 'View Progress', to: '/progress',  icon: mdiChartBar,    color: '#a855f7', bg: dm ? '#3b0764' : '#f3e8ff' },
    { label: 'BMI & Calories',to: '/tools',     icon: mdiCalculator,  color: '#f97316', bg: dm ? '#431407' : '#ffedd5' },
  ];

  const calsLeft    = Math.max(goals.calories - stats.calories, 0);
  const proteinLeft = Math.max(goals.protein  - stats.protein,  0);

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-2">
        <div>
          <h1 className={`text-xl sm:text-2xl font-black ${textMain}`}>Hi, {profile.name}!</h1>
          <p className={`text-xs sm:text-sm ${textMuted}`}>{today}</p>
        </div>
        <div className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${dm ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}>
          {profile.goal} · {profile.level}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Calories" value={stats.calories} max={goals.calories} unit=" kcal" color="#f97316" icon={mdiFireAlert} dm={dm} onEdit={v => updateStat('calories', v)} />
        <StatCard label="Protein"  value={stats.protein}  max={goals.protein}  unit="g"    color="#22c55e" icon={mdiFood}      dm={dm} onEdit={v => updateStat('protein', v)} />
        <StatCard label="Water"    value={stats.water}    max={goals.water}    unit=" gl"  color="#3b82f6" icon={mdiWater}     dm={dm} onEdit={v => updateStat('water', v)} />
        <div className={`rounded-2xl border p-4 flex flex-col justify-between ${dm ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
          <p className={`text-xs font-semibold mb-2 ${textMuted}`}>Today's Summary</p>
          <div className="space-y-1">
            <p className={`text-xs ${textMuted}`}>Cals left: <span className="font-black text-orange-400">{calsLeft}</span></p>
            <p className={`text-xs ${textMuted}`}>Protein left: <span className="font-black text-green-400">{proteinLeft}g</span></p>
            <p className={`text-xs ${textMuted}`}>Water: <span className="font-black text-blue-400">{stats.water}/{goals.water} gl</span></p>
          </div>
          <div className="flex gap-0.5 mt-2">
            {[...Array(Math.min(goals.water, 8))].map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i < stats.water ? 'bg-blue-400' : dm ? 'bg-gray-600' : 'bg-gray-100'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickLinks.map(q => (
          <Link key={q.label} to={q.to}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border font-semibold text-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${dm ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-100 text-gray-700'}`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: q.bg }}>
              <Icon path={q.icon} size={0.9} color={q.color} />
            </div>
            {q.label}
          </Link>
        ))}
      </div>

      {/* Weekly chart */}
      <div className={card}>
        <p className={`font-bold mb-3 text-sm sm:text-base ${textMain}`}>This Week</p>
        <div className="flex gap-3 mb-3 text-xs">
          <span className="flex items-center gap-1 text-gray-400">
            <span className="w-2 h-2 rounded-sm bg-blue-300 inline-block" /> Calories
          </span>
          <span className="flex items-center gap-1 text-gray-400">
            <span className="w-2 h-2 rounded-sm bg-green-300 inline-block" /> Protein
          </span>
        </div>

        {weekly.length > 0 ? (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={weekly} barSize={8} barGap={2}>
              <CartesianGrid stroke={dm ? '#374151' : '#f3f4f6'} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', backgroundColor: dm ? '#1f2937' : '#fff', fontSize: '11px' }} />
              <Bar dataKey="calories" fill="#93c5fd" radius={[4,4,0,0]} name="Calories" />
              <Bar dataKey="protein"  fill="#6ee7b7" radius={[4,4,0,0]} name="Protein"  />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-36 flex items-center justify-center">
            <p className={`text-xs ${textMuted}`}>Start logging meals to see your weekly chart!</p>
          </div>
        )}
      </div>
    </div>
  );
}