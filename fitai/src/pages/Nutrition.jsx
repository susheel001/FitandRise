import { useState } from 'react';
import { useApp } from '../context/useApp';
import Icon from '@mdi/react';
import { mdiMagnify, mdiPlus, mdiClose, mdiFoodOutline, mdiRobot, mdiStar, mdiLock } from '@mdi/js';
import { aiAPI } from '../api/api';

const foods = [
  { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0,  fat: 4,  img: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=60&auto=format&fit=crop' },
  { name: 'Paneer (100g)',   calories: 265, protein: 18, carbs: 3,  fat: 20, img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=60&auto=format&fit=crop' },
  { name: 'Eggs (2)',        calories: 140, protein: 12, carbs: 1,  fat: 10, img: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=60&auto=format&fit=crop' },
  { name: 'Brown Rice',      calories: 216, protein: 5,  carbs: 45, fat: 2,  img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=60&auto=format&fit=crop' },
  { name: 'Banana',          calories: 89,  protein: 1,  carbs: 23, fat: 0,  img: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=60&auto=format&fit=crop' },
  { name: 'Greek Yogurt',    calories: 100, protein: 17, carbs: 6,  fat: 1,  img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=60&auto=format&fit=crop' },
  { name: 'Almonds (30g)',   calories: 174, protein: 6,  carbs: 6,  fat: 15, img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=60&auto=format&fit=crop' },
  { name: 'Oats (100g)',     calories: 389, protein: 17, carbs: 66, fat: 7,  img: 'https://images.unsplash.com/photo-1574226516831-e1dff420e562?w=60&auto=format&fit=crop' },
  { name: 'Whey Protein',    calories: 120, protein: 25, carbs: 3,  fat: 2,  img: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=60&auto=format&fit=crop' },
  { name: 'Sweet Potato',    calories: 86,  protein: 2,  carbs: 20, fat: 0,  img: 'https://images.unsplash.com/photo-1596097635121-14b38c5d7a5e?w=60&auto=format&fit=crop' },
  { name: 'Salmon (100g)',   calories: 208, protein: 20, carbs: 0,  fat: 13, img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=60&auto=format&fit=crop' },
  { name: 'Broccoli',        calories: 55,  protein: 4,  carbs: 11, fat: 1,  img: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=60&auto=format&fit=crop' },
];

const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

export default function Nutrition() {
  const { state, addMeal, removeMeal } = useApp();
  const { darkMode: dm, mealLog, stats, goals } = state;

  const [activeMeal, setActiveMeal]         = useState('Breakfast');
  const [search, setSearch]                 = useState('');
  const [showSearch, setShowSearch]         = useState(false);
  const [showAI, setShowAI]                 = useState(false);
  const [aiLoading, setAiLoading]           = useState(false);
  const [aiSuggestions, setAiSuggestions]   = useState([]);
  const [aiError, setAiError]               = useState('');
  const [aiMeta, setAiMeta]                 = useState(null); // { requests_used, limit, requests_left, is_premium }
  const [limitReached, setLimitReached]     = useState(false);

  const filtered   = foods.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  const allFoods   = Object.values(mealLog).flat();
  const totals     = {
    cal:   allFoods.reduce((a, f) => a + (f.calories || 0), 0),
    pro:   allFoods.reduce((a, f) => a + (f.protein  || 0), 0),
    carbs: allFoods.reduce((a, f) => a + (f.carbs    || 0), 0),
    fat:   allFoods.reduce((a, f) => a + (f.fat      || 0), 0),
  };

  const textMain  = dm ? 'text-white'      : 'text-gray-800';
  const textMuted = dm ? 'text-gray-400'   : 'text-gray-500';
  const card      = `rounded-2xl border p-4 ${dm ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`;

  // ── AI Suggest ───────────────────────────────────────────────
  const handleAISuggest = async () => {
    setAiError('');
    setAiSuggestions([]);
    setLimitReached(false);
    setAiLoading(true);
    setShowAI(true);

    try {
      const data = await aiAPI.suggest({
        meal_type:     activeMeal,
        goal:          goals?.goal || state.profile?.goal || 'General Fitness',
        calories_left: Math.max(0, (goals.calories || 2000) - totals.cal),
        protein_left:  Math.max(0, (goals.protein  || 120)  - totals.pro),
      });

      setAiSuggestions(data.suggestions || []);
      setAiMeta({
        requests_used: data.requests_used,
        limit:         data.limit,
        requests_left: data.requests_left,
        is_premium:    data.is_premium,
      });
    } catch (err) {
      if (err.message?.includes('limit_reached') || err.message?.includes('free AI')) {
        setLimitReached(true);
        setAiError(err.message);
      } else {
        setAiError('Failed to get AI suggestions. Try again!');
      }
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl sm:text-2xl font-black ${textMain}`}>Nutrition</h2>
          <p className={`text-xs sm:text-sm ${textMuted}`}>Track your daily food intake</p>
        </div>

        {/* AI Suggest Button */}
        <button onClick={handleAISuggest}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-white text-xs transition-all hover:opacity-90 hover:scale-105 shadow-lg"
          style={{ background: 'linear-gradient(135deg,#a855f7,#3b82f6)' }}>
          <Icon path={mdiRobot} size={0.7} />
          AI Suggest
        </button>
      </div>

      {/* Macro summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {[
          { label: 'Calories', val: totals.cal,   max: goals.calories, unit: 'kcal', color: 'text-orange-500', bar: '#f97316' },
          { label: 'Protein',  val: totals.pro,   max: goals.protein,  unit: 'g',    color: 'text-green-500',  bar: '#22c55e' },
          { label: 'Carbs',    val: totals.carbs, max: 250,            unit: 'g',    color: 'text-blue-500',   bar: '#3b82f6' },
          { label: 'Fat',      val: totals.fat,   max: 65,             unit: 'g',    color: 'text-purple-500', bar: '#a855f7' },
        ].map(m => (
          <div key={m.label} className={card}>
            <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${textMuted}`}>{m.label}</p>
            <p className={`text-xl sm:text-2xl font-black ${m.color}`}>{m.val}<span className="text-xs text-gray-400 ml-1">{m.unit}</span></p>
            <div className={`w-full h-1.5 rounded-full mt-1.5 overflow-hidden ${dm ? 'bg-gray-600' : 'bg-gray-100'}`}>
              <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min((m.val/m.max)*100,100)}%`, backgroundColor: m.bar }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── AI Panel ── */}
      {showAI && (
        <div className={`${card} border-purple-500/30`} style={{ borderColor: 'rgba(168,85,247,0.3)', background: dm ? 'rgba(168,85,247,0.08)' : 'rgba(168,85,247,0.04)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#a855f7,#3b82f6)' }}>
                <Icon path={mdiRobot} size={0.55} color="white" />
              </div>
              <p className={`font-black text-sm ${textMain}`}>AI Meal Suggestions</p>
              {aiMeta && !aiMeta.is_premium && (
                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background: 'rgba(168,85,247,0.2)', color: '#c084fc' }}>
                  {aiMeta.requests_left} left today
                </span>
              )}
              {aiMeta?.is_premium && (
                <span className="text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
                  style={{ background: 'rgba(234,179,8,0.2)', color: '#fbbf24' }}>
                  <Icon path={mdiStar} size={0.45} /> Premium
                </span>
              )}
            </div>
            <button onClick={() => { setShowAI(false); setAiSuggestions([]); setAiError(''); }}
              className={`${textMuted} hover:text-red-400 transition`}>
              <Icon path={mdiClose} size={0.7} />
            </button>
          </div>

          {/* Loading */}
          {aiLoading && (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className={`text-sm ${textMuted}`}>AI is thinking...</p>
            </div>
          )}

          {/* Limit reached */}
          {limitReached && !aiLoading && (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.3)' }}>
                <Icon path={mdiLock} size={1} color="#fbbf24" />
              </div>
              <p className="text-white font-black text-base mb-1">Daily Limit Reached</p>
              <p className={`text-sm ${textMuted} mb-4`}>You've used all {FREE_LIMIT} free AI suggestions for today.</p>
              <div className="inline-block px-6 py-3 rounded-xl font-black text-white text-sm cursor-pointer hover:opacity-90 transition"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}>
                ⭐ Upgrade to Premium
              </div>
              <p className={`text-xs ${textMuted} mt-3`}>Resets tomorrow at midnight</p>
            </div>
          )}

          {/* Error */}
          {aiError && !limitReached && !aiLoading && (
            <div className="px-4 py-3 rounded-xl text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {aiError}
            </div>
          )}

          {/* Suggestions */}
          {!aiLoading && !aiError && aiSuggestions.length > 0 && (
            <div className="space-y-2">
              <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${textMuted}`}>
                Suggested for {activeMeal}
              </p>
              {aiSuggestions.map((s, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer hover:scale-[1.01] ${dm ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:shadow-md border border-gray-100'}`}
                  onClick={() => {
                    addMeal(activeMeal, { name: s.name, calories: s.calories, protein: s.protein, carbs: s.carbs, fat: s.fat, img: '' });
                    setShowAI(false);
                    setAiSuggestions([]);
                  }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ background: 'linear-gradient(135deg,rgba(168,85,247,0.2),rgba(59,130,246,0.2))' }}>
                      🤖
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${textMain}`}>{s.name}</p>
                      <p className={`text-xs ${textMuted}`}>{s.protein}g P · {s.carbs}g C · {s.fat}g F</p>
                      <p className="text-xs text-purple-400 mt-0.5">{s.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-orange-400 font-black text-sm">{s.calories} kcal</span>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg,#a855f7,#3b82f6)' }}>
                      <Icon path={mdiPlus} size={0.6} color="white" />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={handleAISuggest}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-80 mt-2 ${textMuted}`}
                style={{ background: dm ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
                🔄 Regenerate suggestions
              </button>
            </div>
          )}
        </div>
      )}

      {/* Meal tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {meals.map(m => (
          <button key={m} onClick={() => setActiveMeal(m)}
            className={`px-3 py-2 rounded-xl font-semibold text-xs whitespace-nowrap shrink-0 transition-all ${activeMeal === m ? 'bg-blue-500 text-white shadow-md' : dm ? 'bg-gray-800 text-gray-400 border border-gray-700' : 'bg-white text-gray-500 border border-gray-200'}`}>
            {m} {(mealLog[m]?.length || 0) > 0 && <span className={`ml-1 text-xs px-1 rounded-full ${activeMeal===m?'bg-white/30':'bg-blue-100 text-blue-600'}`}>{mealLog[m].length}</span>}
          </button>
        ))}
      </div>

      {/* Food log */}
      <div className={`${card} space-y-2`}>
        <div className="flex justify-between items-center mb-2">
          <p className={`font-bold text-sm ${textMain}`}>{activeMeal}</p>
          <button onClick={() => setShowSearch(!showSearch)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition">
            <Icon path={mdiPlus} size={0.65} /> Add Food
          </button>
        </div>

        {/* Search panel */}
        {showSearch && (
          <div className="mb-3">
            <div className="relative mb-2">
              <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`}><Icon path={mdiMagnify} size={0.7} /></div>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search food..."
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border-2 text-sm focus:outline-none focus:border-blue-400 transition ${dm ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-52 overflow-y-auto">
              {filtered.map((food, i) => (
                <div key={i} onClick={() => { addMeal(activeMeal, food); setShowSearch(false); setSearch(''); }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all ${dm ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-transparent'}`}>
                  <img src={food.img} alt={food.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-xs truncate ${textMain}`}>{food.name}</p>
                    <p className={`text-xs ${textMuted}`}>{food.protein}g protein</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-orange-400 font-bold text-xs">{food.calories}</span>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${dm ? 'bg-gray-600' : 'bg-blue-100'}`}>
                      <Icon path={mdiPlus} size={0.6} color="#3b82f6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logged foods */}
        {(mealLog[activeMeal]?.length || 0) === 0 ? (
          <div className="flex flex-col items-center py-8">
            <Icon path={mdiFoodOutline} size={1.5} color={dm ? '#4b5563' : '#d1d5db'} />
            <p className={`text-sm font-medium mt-2 ${textMuted}`}>No food logged yet</p>
          </div>
        ) : (mealLog[activeMeal] || []).map((food, i) => (
          <div key={i} className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl ${dm ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <img src={food.img || food.img_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=60&auto=format&fit=crop'} alt={food.name} className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover shrink-0" />
              <div>
                <p className={`font-semibold text-xs sm:text-sm ${textMain}`}>{food.name || food.food_name}</p>
                <p className={`text-xs ${textMuted}`}>{food.protein}g P · {food.carbs}g C · {food.fat}g F</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-orange-500 font-bold text-xs sm:text-sm">{food.calories} kcal</span>
              <button onClick={() => removeMeal(activeMeal, i)} className={`${textMuted} hover:text-red-500 transition`}>
                <Icon path={mdiClose} size={0.65} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}