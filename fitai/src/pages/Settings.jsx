import { useState } from 'react';
import { useApp } from '../context/useApp';
import Icon from '@mdi/react';
import { mdiWeatherNight, mdiWeatherSunny, mdiTargetAccount, mdiContentSave } from '@mdi/js';

export default function Settings() {
  const { state, updateGoals, toggleDarkMode } = useApp();
  const { darkMode: dm, goals } = state;
  const [localGoals, setLocalGoals] = useState(goals);
  const [saved, setSaved] = useState(false);

  const save = () => {
    updateGoals(localGoals);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const textMain  = dm ? 'text-white' : 'text-gray-800';
  const textMuted = dm ? 'text-gray-400' : 'text-gray-500';
  const card      = `rounded-2xl border p-4 sm:p-5 ${dm ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`;
  const input     = `w-full px-4 py-2.5 rounded-xl border-2 text-sm font-semibold focus:outline-none focus:border-blue-400 transition ${dm ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`;

  return (
    <div className="space-y-4 max-w-lg">
      <div>
        <h2 className={`text-xl sm:text-2xl font-black ${textMain}`}>Settings</h2>
        <p className={`text-xs sm:text-sm ${textMuted}`}>Customize your BeFit experience</p>
      </div>

      {/* Appearance */}
      <div className={card}>
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dm ? 'bg-yellow-900/30' : 'bg-indigo-50'}`}>
            <Icon path={dm ? mdiWeatherSunny : mdiWeatherNight} size={0.75} color={dm ? '#fbbf24' : '#6366f1'} />
          </div>
          <p className={`font-bold ${textMain}`}>Appearance</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className={`font-semibold text-sm ${textMain}`}>Dark Mode</p>
            <p className={`text-xs ${textMuted}`}>Switch between light and dark theme</p>
          </div>
          <button onClick={toggleDarkMode}
            className={`w-12 h-6 rounded-full relative transition-all duration-300 ${dm ? 'bg-blue-500' : 'bg-gray-200'}`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 shadow ${dm ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* Goals */}
      <div className={card}>
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dm ? 'bg-green-900/30' : 'bg-green-50'}`}>
            <Icon path={mdiTargetAccount} size={0.75} color="#22c55e" />
          </div>
          <div>
            <p className={`font-bold ${textMain}`}>Daily Goals</p>
            <p className={`text-xs ${textMuted}`}>Updates your dashboard targets</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Calories (kcal)', key: 'calories' },
            { label: 'Protein (g)',     key: 'protein' },
            { label: 'Water (glasses)', key: 'water' },
            { label: 'Workouts/week',   key: 'workouts' },
          ].map(g => (
            <div key={g.key}>
              <label className={`text-xs font-semibold mb-1.5 block ${textMuted}`}>{g.label}</label>
              <input type="number" value={localGoals[g.key]}
                onChange={e => setLocalGoals(p => ({ ...p, [g.key]: parseInt(e.target.value) || 0 }))}
                className={input} />
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className={card}>
        <p className={`font-bold mb-3 text-sm text-red-500`}>Danger Zone</p>
        <button onClick={() => { if (window.confirm('Reset all local data?')) { localStorage.clear(); window.location.reload(); } }}
          className="px-5 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition">
          Reset All Data
        </button>
      </div>

      {/* Save */}
      <button onClick={save}
        className={`w-full py-3.5 rounded-2xl font-black text-white text-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${saved ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-600'}`}>
        <Icon path={mdiContentSave} size={0.85} color="white" />
        {saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}