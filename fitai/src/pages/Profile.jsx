import { useState } from 'react';
import { useApp } from '../context/useApp';
import Icon from '@mdi/react';
import { mdiPencil, mdiCheck, mdiClose } from '@mdi/js';

export default function Profile() {
  const { state, updateProfile } = useApp();
  const { darkMode: dm, profile } = state;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(profile);
  const save = () => { updateProfile(form); setEditing(false); };
  const cancel = () => { setForm(profile); setEditing(false); };
  const bmi = (profile.weight / ((profile.height / 100) ** 2)).toFixed(1);
  const bmiLabel = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
  const bmiColor = bmi < 18.5 ? 'text-blue-500' : bmi < 25 ? 'text-green-500' : bmi < 30 ? 'text-yellow-500' : 'text-red-500';
  const textMain = dm ? 'text-white' : 'text-gray-800';
  const textMuted = dm ? 'text-gray-400' : 'text-gray-500';
  const card = `rounded-2xl border p-4 sm:p-5 ${dm ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`;
  const input = `w-full px-3 py-2.5 rounded-xl border-2 text-sm font-semibold focus:outline-none focus:border-blue-400 transition ${dm ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`;
  const val = `px-3 py-2.5 rounded-xl text-sm font-semibold ${dm ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-800'}`;

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2 className={`text-xl sm:text-2xl font-black ${textMain}`}>Profile</h2>
          <p className={`text-xs sm:text-sm ${textMuted}`}>Your personal fitness details</p>
        </div>
        <div className="flex gap-2">
          {editing && <button onClick={cancel} className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1 ${dm ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}><Icon path={mdiClose} size={0.65} />Cancel</button>}
          <button onClick={() => editing ? save() : setEditing(true)}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1 ${editing ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
            <Icon path={editing ? mdiCheck : mdiPencil} size={0.65} />
            {editing ? 'Save' : 'Edit'}
          </button>
        </div>
      </div>

      {/* Avatar + stats */}
      <div className={`${card} flex flex-col sm:flex-row items-center sm:items-start gap-4`}>
        <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-black text-4xl shadow-lg shrink-0">
          {profile.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className={`text-xl font-black ${textMain}`}>{profile.name}</h3>
          <p className={`text-sm ${textMuted} mb-3`}>{profile.goal} · {profile.level}</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {[
              { label: 'BMI', value: bmi, extra: <span className={`text-xs font-bold ${bmiColor}`}>{bmiLabel}</span> },
              { label: 'Weight', value: `${profile.weight}kg` },
              { label: 'Height', value: `${profile.height}cm` },
              { label: 'Age', value: `${profile.age}yr` },
              { label: 'Gender', value: profile.gender },
            ].map((item, i) => (
              <div key={i} className={`flex flex-col items-center p-2 rounded-xl ${dm ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <span className={`text-xs ${textMuted}`}>{item.label}</span>
                <span className={`font-black text-sm ${textMain}`}>{item.value}</span>
                {item.extra}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className={card}>
        <p className={`font-bold mb-3 text-sm ${textMain}`}>Personal Details</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Full Name', key: 'name', type: 'text', span: true },
            { label: 'Age', key: 'age', type: 'number' },
            { label: 'Weight (kg)', key: 'weight', type: 'number' },
            { label: 'Height (cm)', key: 'height', type: 'number' },
          ].map(f => (
            <div key={f.key} className={f.span ? 'col-span-2' : ''}>
              <label className={`text-xs font-semibold block mb-1 ${textMuted}`}>{f.label}</label>
              {editing
                ? <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }))} className={input} />
                : <div className={val}>{profile[f.key]}</div>}
            </div>
          ))}
          <div>
            <label className={`text-xs font-semibold block mb-1 ${textMuted}`}>Fitness Goal</label>
            {editing
              ? <select value={form.goal} onChange={e => setForm(p => ({ ...p, goal: e.target.value }))} className={input}>
                  {['Muscle Gain','Fat Loss','Endurance','General Fitness'].map(o => <option key={o}>{o}</option>)}
                </select>
              : <div className={val}>{profile.goal}</div>}
          </div>
          <div>
            <label className={`text-xs font-semibold block mb-1 ${textMuted}`}>Level</label>
            {editing
              ? <select value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))} className={input}>
                  {['Beginner','Intermediate','Advanced'].map(o => <option key={o}>{o}</option>)}
                </select>
              : <div className={val}>{profile.level}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}