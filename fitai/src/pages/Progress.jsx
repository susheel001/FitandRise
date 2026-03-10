import { useState, useEffect } from 'react';
import { useApp } from '../context/useApp';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { statsAPI } from '../api/api';
import Icon from '@mdi/react';
import { mdiWeightLifter, mdiFire, mdiDumbbell, mdiFood } from '@mdi/js';

export default function Progress() {
  const { state } = useApp();
  const { darkMode: dm, stats, goals, profile } = state;
  const [weekly, setWeekly] = useState([]);

  useEffect(() => {
    statsAPI.weekly().then(data => {
      if (data?.length) {
        setWeekly(data.map(d => ({
          day: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
          calories: d.calories_consumed || 0,
          protein: d.protein_consumed || 0,
          water: d.water_consumed || 0,
        })));
      }
    }).catch(() => {});
  }, []);

  const bmi = (profile.weight / ((profile.height / 100) ** 2)).toFixed(1);
  const bmiLabel = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
  const bmiColor = bmi < 18.5 ? '#3b82f6' : bmi < 25 ? '#22c55e' : bmi < 30 ? '#f59e0b' : '#ef4444';

  const textMain = dm ? 'text-white' : 'text-gray-800';
  const textMuted = dm ? 'text-gray-400' : 'text-gray-500';
  const card = `rounded-2xl border p-4 sm:p-5 ${dm ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`;
  const tooltip = { borderRadius: '10px', border: 'none', backgroundColor: dm ? '#1f2937' : '#fff', color: dm ? '#fff' : '#111', fontSize: '11px' };
  const grid = dm ? '#374151' : '#f3f4f6';

  const summaryCards = [
    { icon: mdiFire,        label: 'Calories Today', value: `${stats.calories} kcal`,   goal: `Goal: ${goals.calories}`, color: '#f97316', bg: dm?'#431407':'#ffedd5' },
    { icon: mdiFood,        label: 'Protein Today',  value: `${stats.protein}g`,         goal: `Goal: ${goals.protein}g`, color: '#22c55e', bg: dm?'#14532d':'#dcfce7' },
    { icon: mdiWeightLifter,label: 'Weight',         value: `${profile.weight} kg`,      goal: `BMI: ${bmi}`,            color: '#3b82f6', bg: dm?'#1e3a8a':'#dbeafe' },
    { icon: mdiDumbbell,    label: 'BMI Status',     value: bmiLabel,                    goal: `Height: ${profile.height}cm`, color: bmiColor, bg: dm?'#1e293b':'#f8fafc' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className={`text-xl sm:text-2xl font-black ${textMain}`}>Progress</h2>
        <p className={`text-xs sm:text-sm ${textMuted}`}>Your fitness journey at a glance</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {summaryCards.map((s, i) => (
          <div key={i} className={card}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <Icon path={s.icon} size={0.65} color={s.color} />
              </div>
              <p className={`text-xs font-bold ${textMuted}`}>{s.label}</p>
            </div>
            <p className="text-lg sm:text-xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className={`text-xs mt-1 ${textMuted}`}>{s.goal}</p>
          </div>
        ))}
      </div>

      {/* Goal progress */}
      <div className={card}>
        <p className={`font-bold mb-4 text-sm sm:text-base ${textMain}`}>Today's Goal Progress</p>
        <div className="space-y-3">
          {[
            { label: 'Calories', val: stats.calories, max: goals.calories, color: '#f97316', unit: 'kcal' },
            { label: 'Protein',  val: stats.protein,  max: goals.protein,  color: '#22c55e', unit: 'g' },
            { label: 'Water',    val: stats.water,    max: goals.water,    color: '#3b82f6', unit: 'glasses' },
          ].map(g => (
            <div key={g.label}>
              <div className="flex justify-between items-center mb-1">
                <span className={`text-xs font-semibold ${textMuted}`}>{g.label}</span>
                <span className="text-xs font-black" style={{ color: g.color }}>{g.val} / {g.max} {g.unit}</span>
              </div>
              <div className={`w-full h-2.5 rounded-full overflow-hidden ${dm ? 'bg-gray-600' : 'bg-gray-100'}`}>
                <div className="h-2.5 rounded-full transition-all duration-700" style={{ width: `${Math.min((g.val/g.max)*100,100)}%`, backgroundColor: g.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly chart */}
      {weekly.length > 0 ? (
        <div className={card}>
          <p className={`font-bold mb-3 text-sm sm:text-base ${textMain}`}>Weekly Calories & Protein</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weekly} barSize={10} barGap={3}>
              <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltip} />
              <Bar dataKey="calories" fill="#93c5fd" radius={[4,4,0,0]} name="Calories" />
              <Bar dataKey="protein"  fill="#6ee7b7" radius={[4,4,0,0]} name="Protein" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className={`${card} text-center py-10`}>
          <p className={`text-sm ${textMuted}`}>Start logging your meals and workouts to see weekly charts here!</p>
        </div>
      )}

      {/* BMI Scale */}
      <div className={card}>
        <p className={`font-bold mb-3 text-sm sm:text-base ${textMain}`}>BMI Overview</p>
        <div className="flex items-end gap-3 mb-3">
          <p className="text-4xl font-black" style={{ color: bmiColor }}>{bmi}</p>
          <p className={`font-bold text-base mb-1`} style={{ color: bmiColor }}>{bmiLabel}</p>
        </div>
        <div className="flex rounded-full overflow-hidden h-3 mb-2">
          {[['#3b82f6','20%'],['#22c55e','30%'],['#f59e0b','25%'],['#ef4444','25%']].map(([c,w],i)=>(
            <div key={i} style={{ width: w, backgroundColor: c }} />
          ))}
        </div>
        <div className="grid grid-cols-4 gap-1 text-center">
          {[['Under','<18.5','#3b82f6'],['Normal','18.5-25','#22c55e'],['Over','25-30','#f59e0b'],['Obese','≥30','#ef4444']].map(([l,r,c])=>(
            <div key={l}>
              <p className="text-xs font-bold" style={{color:c}}>{l}</p>
              <p className={`text-xs ${textMuted}`}>{r}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}