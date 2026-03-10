import { useState, useEffect, useCallback } from 'react';
import { AppContext } from './context';
import { profileAPI, statsAPI, mealsAPI, workoutsAPI } from '../api/api';

const defaultState = {
  darkMode: false,
  profile: { name: 'User', age: 25, weight: 70, height: 170, goal: 'General Fitness', level: 'Beginner', gender: 'Male' },
  goals: { calories: 2000, protein: 120, water: 8, workouts: 5 },
  stats: { calories: 0, protein: 0, water: 0, fitnessScore: 0 },
  mealLog: { Breakfast: [], Lunch: [], Dinner: [], Snacks: [] },
  workouts: {},
  loading: false,
};

export default function AppProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem('befit-ui');
      return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
    } catch { return defaultState; }
  });

  const update = useCallback((patch) => {
    setState(prev => {
      const next = { ...prev, ...patch };
      localStorage.setItem('befit-ui', JSON.stringify({ darkMode: next.darkMode }));
      return next;
    });
  }, []);

  // Load data from API when logged in
  useEffect(() => {
    const auth = localStorage.getItem('befit-auth');
    if (!auth) return;
    async function load() {
      update({ loading: true });
      try {
        const [profileData, statsData, mealsData, workoutsData] = await Promise.all([
          profileAPI.get().catch(() => null),
          statsAPI.get().catch(() => null),
          mealsAPI.get().catch(() => null),
          workoutsAPI.get().catch(() => null),
        ]);
        setState(prev => ({
          ...prev,
          loading: false,
          profile: profileData?.profile
            ? { name: profileData.profile.name || prev.profile.name, age: profileData.profile.age || prev.profile.age, weight: profileData.profile.weight || prev.profile.weight, height: profileData.profile.height || prev.profile.height, goal: profileData.profile.goal || prev.profile.goal, level: profileData.profile.level || prev.profile.level, gender: profileData.profile.gender || prev.profile.gender }
            : prev.profile,
          goals: profileData?.goals
            ? { calories: profileData.goals.calories || 2000, protein: profileData.goals.protein || 120, water: profileData.goals.water || 8, workouts: profileData.goals.workouts || 5 }
            : prev.goals,
          stats: statsData
            ? { ...prev.stats, calories: statsData.calories_consumed || 0, protein: statsData.protein_consumed || 0, water: statsData.water_consumed || 0 }
            : prev.stats,
          mealLog: mealsData || prev.mealLog,
          workouts: workoutsData || prev.workouts,
        }));
      } catch { update({ loading: false }); }
    }
    load();
  }, []);

  const toggleDarkMode = () => update({ darkMode: !state.darkMode });

  const updateStat = useCallback(async (key, val) => {
    const statsMap = { calories: 'calories_consumed', protein: 'protein_consumed', water: 'water_consumed' };
    update({ stats: { ...state.stats, [key]: val } });
    try {
      await statsAPI.update({
        calories_consumed: key === 'calories' ? val : state.stats.calories,
        protein_consumed:  key === 'protein'  ? val : state.stats.protein,
        water_consumed:    key === 'water'    ? val : state.stats.water,
      });
    } catch {}
  }, [state.stats]);

  const updateProfile = useCallback(async (data) => {
    update({ profile: { ...state.profile, ...data } });
    try { await profileAPI.update(data); } catch {}
  }, [state.profile]);

  const updateGoals = useCallback(async (data) => {
    update({ goals: { ...state.goals, ...data } });
    try { await profileAPI.updateGoals(data); } catch {}
  }, [state.goals]);

  const addMeal = useCallback(async (mealType, food) => {
    const newLog = { ...state.mealLog, [mealType]: [...(state.mealLog[mealType] || []), food] };
    update({ mealLog: newLog, stats: { ...state.stats, calories: state.stats.calories + food.calories, protein: state.stats.protein + food.protein } });
    try { await mealsAPI.add({ meal_type: mealType, food_name: food.name, calories: food.calories, protein: food.protein, carbs: food.carbs, fat: food.fat, img_url: food.img }); }
    catch {}
  }, [state.mealLog, state.stats]);

  const removeMeal = useCallback(async (mealType, idx) => {
    const food = state.mealLog[mealType][idx];
    const newLog = { ...state.mealLog, [mealType]: state.mealLog[mealType].filter((_, i) => i !== idx) };
    update({ mealLog: newLog, stats: { ...state.stats, calories: Math.max(0, state.stats.calories - food.calories), protein: Math.max(0, state.stats.protein - food.protein) } });
    try { if (food.id) await mealsAPI.remove(food.id); } catch {}
  }, [state.mealLog, state.stats]);

  const toggleWorkout = useCallback(async (group, exerciseId) => {
    const current = state.workouts[group]?.find(w => w.id === exerciseId);
    const done = !current?.done;
    const groupExercises = state.workouts[group] || [];
    const updated = groupExercises.find(w => w.id === exerciseId)
      ? groupExercises.map(w => w.id === exerciseId ? { ...w, done } : w)
      : [...groupExercises, { id: exerciseId, done }];
    update({ workouts: { ...state.workouts, [group]: updated } });
    try { await workoutsAPI.toggle({ muscle_group: group, exercise_id: exerciseId, done }); } catch {}
  }, [state.workouts]);

  return (
    <AppContext.Provider value={{ state, toggleDarkMode, updateStat, updateProfile, updateGoals, addMeal, removeMeal, toggleWorkout }}>
      {children}
    </AppContext.Provider>
  );
}