import { useState } from 'react';
import { useApp } from '../context/useApp';

const activities = [
  { name: 'Running',         met: 9.8  },
  { name: 'Cycling',         met: 7.5  },
  { name: 'Swimming',        met: 8.0  },
  { name: 'Weight Training', met: 5.0  },
  { name: 'HIIT',            met: 12.0 },
  { name: 'Walking',         met: 3.5  },
  { name: 'Yoga',            met: 2.5  },
  { name: 'Jump Rope',       met: 11.0 },
  { name: 'Boxing',          met: 10.0 },
  { name: 'Rowing',          met: 7.0  },
];

export default function BMITools() {
  const { state } = useApp();
  const { darkMode: dm, profile } = state;

  // BMI
  const [weight, setWeight]   = useState(profile.weight);
  const [height, setHeight]   = useState(profile.height);
  const bmi   = weight && height ? (weight / ((height / 100) ** 2)).toFixed(1) : null;
  const bmiInfo = !bmi ? null : bmi < 18.5 ? { label: 'Underweight', color: '#3b82f6', bg: dm?'#1e3a5f':'#dbeafe', tip: 'Increase calorie intake with nutrient-dense foods.' }
    : bmi < 25 ? { label: 'Normal',      color: '#22c55e', bg: dm?'#14532d':'#dcfce7', tip: 'Great! Maintain your current lifestyle.' }
    : bmi < 30 ? { label: 'Overweight',  color: '#f59e0b', bg: dm?'#451a03':'#fef3c7', tip: 'Focus on cardio and a moderate calorie deficit.' }
    : { label: 'Obese', color: '#ef4444', bg: dm?'#450a0a':'#fee2e2', tip: 'Consult a healthcare professional for a plan.' };

  // Calorie Burn
  const [cbWeight,   setCbWeight]   = useState(profile.weight);
  const [duration,   setDuration]   = useState(30);
  const [selected,   setSelected]   = useState(null);
  const burned = selected ? Math.round(selected.met * cbWeight * (duration / 60)) : null;

  const textMain  = dm ? 'text-white' : 'text-gray-800';
  const textMuted = dm ? 'text-gray-400' : 'text-gray-500';
  const card      = `rounded-2xl border p-4 sm:p-5 ${dm ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`;
  const input     = `w-full px-4 py-2.5 rounded-xl border-2 text-sm font-semibold focus:outline-none focus:border-blue-400 transition ${dm ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-xl sm:text-2xl font-black ${textMain}`}>BMI & Calorie Tools</h2>
        <p className={`text-xs sm:text-sm ${textMuted}`}>Quick health calculators</p>
      </div>

      {/* ── BMI CALCULATOR ── */}
      <div className={card}>
        <p className={`font-black text-base sm:text-lg mb-4 ${textMain}`}>BMI Calculator</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className={`text-xs font-bold uppercase tracking-widest mb-2 block ${textMuted}`}>Weight (kg)</label>
            <input type="number" value={weight} onChange={e => setWeight(parseFloat(e.target.value))} className={input} />
          </div>
          <div>
            <label className={`text-xs font-bold uppercase tracking-widest mb-2 block ${textMuted}`}>Height (cm)</label>
            <input type="number" value={height} onChange={e => setHeight(parseFloat(e.target.value))} className={input} />
          </div>
        </div>

        {bmi && bmiInfo && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs font-semibold ${textMuted}`}>Your BMI</p>
                <p className="text-5xl font-black" style={{ color: bmiInfo.color }}>{bmi}</p>
                <span className="inline-block mt-1 px-3 py-1 rounded-lg text-sm font-bold" style={{ backgroundColor: bmiInfo.bg, color: bmiInfo.color }}>
                  {bmiInfo.label}
                </span>
              </div>
              <div className="text-right">
                <p className={`text-xs ${textMuted}`}>Weight</p>
                <p className={`text-2xl font-black ${textMain}`}>{weight}kg</p>
                <p className={`text-xs ${textMuted} mt-1`}>Height</p>
                <p className={`text-xl font-black ${textMain}`}>{height}cm</p>
              </div>
            </div>
            {/* scale */}
            <div className="flex rounded-full overflow-hidden h-3">
              {[['#3b82f6','20%'],['#22c55e','30%'],['#f59e0b','25%'],['#ef4444','25%']].map(([c,w],i)=>(
                <div key={i} style={{ width: w, backgroundColor: c }} />
              ))}
            </div>
            <div className="grid grid-cols-4 text-center gap-1">
              {[['Under','<18.5','#3b82f6'],['Normal','18-25','#22c55e'],['Over','25-30','#f59e0b'],['Obese','≥30','#ef4444']].map(([l,r,c])=>(
                <div key={l}><p className="text-xs font-bold" style={{color:c}}>{l}</p><p className={`text-xs ${textMuted}`}>{r}</p></div>
              ))}
            </div>
            <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: bmiInfo.bg }}>
              <span className="font-semibold" style={{ color: bmiInfo.color }}>Tip: </span>
              <span className={textMuted}>{bmiInfo.tip}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── CALORIE BURN ── */}
      <div className={card}>
        <p className={`font-black text-base sm:text-lg mb-4 ${textMain}`}>Calorie Burn Calculator</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className={`text-xs font-bold uppercase tracking-widest mb-2 block ${textMuted}`}>Your Weight (kg)</label>
            <input type="number" value={cbWeight} onChange={e => setCbWeight(parseFloat(e.target.value))} className={input} />
          </div>
          <div>
            <label className={`text-xs font-bold uppercase tracking-widest mb-2 block ${textMuted}`}>Duration (min)</label>
            <input type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value))} className={input} />
          </div>
        </div>

        <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${textMuted}`}>Select Activity</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {activities.map(a => (
            <button key={a.name} onClick={() => setSelected(selected?.name === a.name ? null : a)}
              className={`py-2.5 px-2 rounded-xl border-2 text-xs font-semibold transition-all ${selected?.name === a.name ? 'border-blue-500 bg-blue-50 text-blue-600' : dm ? 'border-gray-700 bg-gray-700 text-gray-300 hover:border-gray-500' : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-blue-300'}`}>
              {a.name}<br />
              <span className={`text-xs ${selected?.name === a.name ? 'text-blue-400' : textMuted}`}>MET {a.met}</span>
            </button>
          ))}
        </div>

        {burned !== null && selected && (
          <div className={`mt-4 p-4 rounded-2xl text-center ${dm ? 'bg-gray-700' : 'bg-orange-50'}`}>
            <p className={`text-sm font-semibold mb-1 ${textMuted}`}>{duration} min of {selected.name}</p>
            <p className="text-5xl font-black text-orange-500">{burned}</p>
            <p className={`font-bold ${textMuted}`}>calories burned</p>
            <div className="flex justify-center gap-6 mt-3">
              <div><p className="text-xl font-black text-blue-500">{Math.round(burned/9)}</p><p className={`text-xs ${textMuted}`}>grams of fat</p></div>
              <div><p className="text-xl font-black text-green-500">{Math.round(burned*4.184)}</p><p className={`text-xs ${textMuted}`}>kilojoules</p></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}