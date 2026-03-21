import { useState } from 'react';
import { useApp } from '../context/useApp';
import { useNotifications } from '../hooks/useNotifications';
import Icon from '@mdi/react';
import {
  mdiWeatherNight, mdiWeatherSunny, mdiTargetAccount,
  mdiContentSave, mdiBell, mdiBellOff, mdiCheckCircle,
  mdiAlertCircle, mdiFood, mdiWater, mdiDumbbell,
} from '@mdi/js';

export default function Settings() {
  const { state, updateGoals, toggleDarkMode } = useApp();
  const { darkMode: dm, goals } = state;
  const { prefs, permission, requestPermission, updatePrefs } = useNotifications();
  const [localGoals, setLocalGoals] = useState(goals);
  const [saved, setSaved] = useState(false);

  const save = () => {
    updateGoals(localGoals);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const textMain  = dm ? 'text-white'    : 'text-gray-800';
  const textMuted = dm ? 'text-gray-400' : 'text-gray-500';
  const card      = `rounded-2xl border p-4 sm:p-5 ${dm ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`;
  const input     = `w-full px-4 py-2.5 rounded-xl border-2 text-sm font-semibold focus:outline-none focus:border-blue-400 transition ${dm ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`;

  const Toggle = ({ value, onChange }) => (
    <button onClick={() => onChange(!value)}
      className={`w-12 h-6 rounded-full relative transition-all duration-300 ${value ? 'bg-blue-500' : dm ? 'bg-gray-600' : 'bg-gray-200'}`}>
      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 shadow ${value ? 'left-7' : 'left-1'}`} />
    </button>
  );

  return (
    <div className="space-y-4 max-w-lg">
      <div>
        <h2 className={`text-xl sm:text-2xl font-black ${textMain}`}>Settings</h2>
        <p className={`text-xs sm:text-sm ${textMuted}`}>Customize your FitandRise experience</p>
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
          <Toggle value={dm} onChange={toggleDarkMode} />
        </div>
      </div>

      {/* Notifications */}
      <div className={card}>
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dm ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
            <Icon path={mdiBell} size={0.75} color="#a855f7" />
          </div>
          <div>
            <p className={`font-bold ${textMain}`}>Notifications</p>
            <p className={`text-xs ${textMuted}`}>Manage your reminders</p>
          </div>
        </div>

        {permission === 'denied' && (
          <div className="mb-3 px-3 py-2 rounded-xl flex items-center gap-2"
            style={{ background: 'rgba(239,68,68,0.1)' }}>
            <Icon path={mdiAlertCircle} size={0.7} color="#f87171" />
            <p className="text-xs font-semibold text-red-400">Notifications blocked. Enable them in browser settings.</p>
          </div>
        )}

        {permission === 'default' && (
          <button onClick={requestPermission}
            className="w-full mb-3 py-2.5 rounded-xl text-sm font-black text-white transition hover:opacity-90 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#a855f7,#3b82f6)' }}>
            <Icon path={mdiBell} size={0.7} color="white" />
            Enable Browser Notifications
          </button>
        )}

        {permission === 'granted' && (
          <div className="mb-3 px-3 py-2 rounded-xl flex items-center gap-2"
            style={{ background: 'rgba(34,197,94,0.1)' }}>
            <Icon path={mdiCheckCircle} size={0.7} color="#4ade80" />
            <p className="text-xs font-semibold text-green-400">Browser notifications enabled</p>
          </div>
        )}

        <div className="space-y-3">
          {[
            { label: 'Meal Reminders',   sub: 'Breakfast 8am · Lunch 1pm · Dinner 7pm', key: 'meals',   icon: mdiFood,     color: '#f97316' },
            { label: 'Water Reminders',  sub: 'Every 2 hours from 10am to 8pm',          key: 'water',   icon: mdiWater,    color: '#3b82f6' },
            { label: 'Workout Reminder', sub: 'Daily at 6:00 PM',                        key: 'workout', icon: mdiDumbbell, color: '#22c55e' },
          ].map(({ label, sub, key, icon, color }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${color}22` }}>
                  <Icon path={icon} size={0.65} color={color} />
                </div>
                <div>
                  <p className={`font-semibold text-sm ${textMain}`}>{label}</p>
                  <p className={`text-xs ${textMuted}`}>{sub}</p>
                </div>
              </div>
              <Toggle value={prefs[key]} onChange={(val) => updatePrefs({ [key]: val })} />
            </div>
          ))}
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
            { label: 'Protein (g)',     key: 'protein'  },
            { label: 'Water (glasses)', key: 'water'    },
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
        <p className="font-bold mb-3 text-sm text-red-500">Danger Zone</p>
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