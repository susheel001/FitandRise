import { useState } from 'react';
import { useApp } from '../context/useApp';
import Icon from '@mdi/react';
import { mdiPlay, mdiCheckCircle, mdiCheckCircleOutline } from '@mdi/js';

const workoutData = {
  chest:     { label: 'Chest',     color: 'bg-red-500',    textColor: 'text-red-500',    border: 'border-red-400',    bar: '#ef4444', exercises: [
    { id: 1, name: 'Bench Press',        sets: '4×10', difficulty: 'Intermediate', youtubeId: 'SCVCLChPQFY', tips: 'Keep back flat, grip wider than shoulders.' },
    { id: 2, name: 'Incline DB Press',   sets: '3×12', difficulty: 'Intermediate', youtubeId: '8iPEnn-ltC8', tips: 'Set bench at 30-45°. Control the descent.' },
    { id: 3, name: 'Cable Flyes',        sets: '3×15', difficulty: 'Beginner',     youtubeId: 'Iwe6AmxVf7o', tips: 'Keep slight bend in elbows.' },
    { id: 4, name: 'Push-ups',           sets: '3×20', difficulty: 'Beginner',     youtubeId: 'IODxDxX7oi4', tips: 'Keep core tight throughout.' },
  ]},
  legs:      { label: 'Legs',      color: 'bg-blue-500',   textColor: 'text-blue-500',   border: 'border-blue-400',   bar: '#3b82f6', exercises: [
    { id: 1, name: 'Squats',             sets: '4×10', difficulty: 'Intermediate', youtubeId: 'ultWZbUMPL8', tips: 'Chest up, knees over toes.' },
    { id: 2, name: 'Leg Press',          sets: '3×12', difficulty: 'Beginner',     youtubeId: 'IZxyjW7MPJQ', tips: "Don't lock knees at top." },
    { id: 3, name: 'Romanian Deadlift',  sets: '3×10', difficulty: 'Intermediate', youtubeId: 'JCXUYuzwNrM', tips: 'Hinge at hips, bar close to legs.' },
    { id: 4, name: 'Calf Raises',        sets: '4×20', difficulty: 'Beginner',     youtubeId: 'gwLzBJYoWlI', tips: 'Full range, slow and controlled.' },
  ]},
  shoulders: { label: 'Shoulders', color: 'bg-yellow-500', textColor: 'text-yellow-500', border: 'border-yellow-400', bar: '#eab308', exercises: [
    { id: 1, name: 'Overhead Press',     sets: '4×10', difficulty: 'Intermediate', youtubeId: '2yjwXTZQDDI', tips: "Press straight up, don't flare elbows." },
    { id: 2, name: 'Lateral Raises',     sets: '3×15', difficulty: 'Beginner',     youtubeId: 'geenhiHju-o', tips: 'Lead with elbows, avoid swinging.' },
    { id: 3, name: 'Front Raises',       sets: '3×12', difficulty: 'Beginner',     youtubeId: 'gktzSBimNLI', tips: 'Raise to shoulder height only.' },
    { id: 4, name: 'Face Pulls',         sets: '3×15', difficulty: 'Beginner',     youtubeId: 'rep-qVOkqgk', tips: 'Pull to face level, rotate at end.' },
  ]},
  back:      { label: 'Back',      color: 'bg-green-500',  textColor: 'text-green-500',  border: 'border-green-400',  bar: '#22c55e', exercises: [
    { id: 1, name: 'Deadlifts',          sets: '4×8',  difficulty: 'Advanced',     youtubeId: 'op9kVnSso6Q', tips: 'Neutral spine, bar over mid-foot.' },
    { id: 2, name: 'Pull-ups',           sets: '3×10', difficulty: 'Intermediate', youtubeId: 'eGo4IYlbE5g', tips: 'Full hang at bottom, chin over bar.' },
    { id: 3, name: 'Bent Over Rows',     sets: '4×10', difficulty: 'Intermediate', youtubeId: 'FWJR5Ve8bnQ', tips: 'Hinge 45°, pull to lower chest.' },
    { id: 4, name: 'Lat Pulldowns',      sets: '3×12', difficulty: 'Beginner',     youtubeId: 'CAwf7n6Luuc', tips: 'Lean slightly back, pull to chest.' },
  ]},
  triceps:   { label: 'Triceps',   color: 'bg-purple-500', textColor: 'text-purple-500', border: 'border-purple-400', bar: '#a855f7', exercises: [
    { id: 1, name: 'Tricep Dips',        sets: '3×12', difficulty: 'Intermediate', youtubeId: '0326dy_-CzM', tips: 'Keep elbows pointing back.' },
    { id: 2, name: 'Skull Crushers',     sets: '3×10', difficulty: 'Intermediate', youtubeId: 'd_KZxkY_5cM', tips: 'Lower to forehead, upper arms still.' },
    { id: 3, name: 'Rope Pushdowns',     sets: '3×15', difficulty: 'Beginner',     youtubeId: 'vB5OHsJ3EME', tips: 'Elbows tucked, extend fully at bottom.' },
    { id: 4, name: 'Overhead Extension', sets: '3×12', difficulty: 'Beginner',     youtubeId: 'YbX7Wd8jQ-Q', tips: 'Upper arms close to head.' },
  ]},
  forearms:  { label: 'Forearms',  color: 'bg-orange-500', textColor: 'text-orange-500', border: 'border-orange-400', bar: '#f97316', exercises: [
    { id: 1, name: 'Wrist Curls',        sets: '3×20', difficulty: 'Beginner',     youtubeId: 'J-lGqEYiqL0', tips: 'Rest forearms on bench, wrists only.' },
    { id: 2, name: 'Reverse Curls',      sets: '3×15', difficulty: 'Beginner',     youtubeId: 'nWmMEF9PNiE', tips: 'Overhand grip, elbows fixed.' },
    { id: 3, name: 'Farmers Walk',       sets: '3×30s',difficulty: 'Beginner',     youtubeId: 'Fkzk_RqlYig', tips: 'Heavy dumbbells, walk tall.' },
    { id: 4, name: 'Hammer Curls',       sets: '3×12', difficulty: 'Beginner',     youtubeId: 'zC3nLlEvin4', tips: "Neutral grip, don't swing body." },
  ]},
};

const diffBadge = { Beginner: 'bg-green-100 text-green-600', Intermediate: 'bg-yellow-100 text-yellow-600', Advanced: 'bg-red-100 text-red-600' };

function VideoCard({ ex, done, onToggle, dm }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-2xl overflow-hidden border transition-all hover:shadow-lg ${done ? 'opacity-60' : ''} ${dm ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
      <div className="relative cursor-pointer group" onClick={() => setOpen(!open)}>
        <img src={`https://img.youtube.com/vi/${ex.youtubeId}/mqdefault.jpg`} alt={ex.name} className="w-full h-36 sm:h-40 object-cover" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center transition-all">
          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Icon path={mdiPlay} size={1} color="#ef4444" />
          </div>
        </div>
        <div className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-lg font-bold ${diffBadge[ex.difficulty]}`}>{ex.difficulty}</div>
        {done && <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">Done</div>}
      </div>
      {open && (
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe src={`https://www.youtube.com/embed/${ex.youtubeId}?autoplay=1`} title={ex.name}
            className="absolute inset-0 w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
        </div>
      )}
      <div className="p-3">
        <h4 className={`font-black text-sm mb-0.5 ${dm ? 'text-white' : 'text-gray-800'}`}>{ex.name}</h4>
        <p className={`text-xs font-semibold mb-1 ${dm ? 'text-gray-400' : 'text-gray-400'}`}>{ex.sets}</p>
        <p className={`text-xs leading-relaxed mb-3 ${dm ? 'text-gray-500' : 'text-gray-500'}`}>{ex.tips}</p>
        <div className="flex gap-2">
          <a href={`https://www.youtube.com/watch?v=${ex.youtubeId}`} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition">
            Watch
          </a>
          <button onClick={onToggle}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold transition ${done ? 'bg-green-500 text-white' : dm ? 'bg-gray-700 text-gray-300 border border-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'}`}>
            <Icon path={done ? mdiCheckCircle : mdiCheckCircleOutline} size={0.65} />
            {done ? 'Done' : 'Mark Done'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Workouts() {
  const { state, toggleWorkout } = useApp();
  const { darkMode: dm, workouts } = state;
  const [active, setActive] = useState('chest');
  const data = workoutData[active];
  const done = workouts[active]?.filter(w => w.done).length || 0;
  const pct = Math.round((done / data.exercises.length) * 100);
  const isDone = (id) => workouts[active]?.find(w => w.id === id)?.done || false;
  const textMain = dm ? 'text-white' : 'text-gray-800';
  const textMuted = dm ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="space-y-4">
      <div>
        <h2 className={`text-xl sm:text-2xl font-black ${textMain}`}>Workout Tracker</h2>
        <p className={`text-xs sm:text-sm ${textMuted}`}>Pick a muscle group and get to work</p>
      </div>

      {/* Muscle tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {Object.entries(workoutData).map(([key, d]) => {
          const grpDone = workouts[key]?.filter(w => w.done).length || 0;
          return (
            <button key={key} onClick={() => setActive(key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs whitespace-nowrap shrink-0 border transition-all ${active === key ? `${d.color} text-white border-transparent shadow` : dm ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-white text-gray-600 border-gray-200'}`}>
              {d.label}
              {grpDone > 0 && <span className={`text-xs px-1 rounded-full ${active === key ? 'bg-white/25' : 'bg-green-100 text-green-600'}`}>{grpDone}</span>}
            </button>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className={`rounded-2xl border p-4 border-l-4 ${data.border} ${dm ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className={`font-black text-base ${textMain}`}>{data.label} Day</h3>
            <p className={`text-xs ${textMuted}`}>{done}/{data.exercises.length} exercises</p>
          </div>
          <p className={`text-2xl font-black ${data.textColor}`}>{pct}%</p>
        </div>
        <div className={`w-full h-2 rounded-full overflow-hidden ${dm ? 'bg-gray-600' : 'bg-gray-100'}`}>
          <div className={`${data.color} h-2 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
        </div>
        {pct === 100 && <p className={`text-center mt-2 font-black text-sm ${data.textColor}`}>Complete! Amazing work!</p>}
      </div>

      {/* Exercise grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {data.exercises.map(ex => (
          <VideoCard key={ex.id} ex={ex} done={isDone(ex.id)} onToggle={() => toggleWorkout(active, ex.id)} dm={dm} />
        ))}
      </div>
    </div>
  );
}