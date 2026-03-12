import { supabase } from '../lib/supabase';

// ── AUTH API ───────────────────────────────────────────────────
export const authAPI = {
  register: async ({ name, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    if (error) throw new Error(error.message);
    return data;
  },

  login: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw new Error(error.message);
    return data;
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }
};

// ── PROFILE API ────────────────────────────────────────────────
export const profileAPI = {
  get: async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const [{ data: profile }, { data: goals }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('goals').select('*').eq('user_id', user.id).single(),
    ]);
    return { profile, goals };
  },

  update: async (body) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('profiles')
      .update(body)
      .eq('id', user.id);
    if (error) throw new Error(error.message);
  },

  updateGoals: async (body) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('goals')
      .update(body)
      .eq('user_id', user.id);
    if (error) throw new Error(error.message);
  },
};

// ── STATS API ──────────────────────────────────────────────────
export const statsAPI = {
  get: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();
    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data;
  },

  update: async (body) => {
    const { data: { user } } = await supabase.auth.getUser();
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase
      .from('daily_stats')
      .upsert({ user_id: user.id, date: today, ...body });
    if (error) throw new Error(error.message);
  },

  weekly: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(7);
    if (error) throw new Error(error.message);
    return data;
  },
};

// ── MEALS API ──────────────────────────────────────────────────
export const mealsAPI = {
  get: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today);
    if (error) throw new Error(error.message);

    // Convert flat array to grouped object like your current format
    const grouped = { Breakfast: [], Lunch: [], Dinner: [], Snacks: [] };
    data?.forEach(meal => {
      if (grouped[meal.meal_type]) grouped[meal.meal_type].push({
        id: meal.id,
        name: meal.food_name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        img: meal.img_url,
      });
    });
    return grouped;
  },

  add: async (body) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('meal_logs')
      .insert({ user_id: user.id, ...body });
    if (error) throw new Error(error.message);
  },

  remove: async (id) => {
    const { error } = await supabase
      .from('meal_logs')
      .delete()
      .eq('id', id);
    if (error) throw new Error(error.message);
  },
};

// ── WORKOUTS API ───────────────────────────────────────────────
export const workoutsAPI = {
  get: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today);
    if (error) throw new Error(error.message);

    // Convert to grouped object format
    const grouped = {};
    data?.forEach(w => {
      if (!grouped[w.muscle_group]) grouped[w.muscle_group] = [];
      grouped[w.muscle_group].push({ id: w.exercise_id, done: w.done });
    });
    return grouped;
  },

  toggle: async ({ muscle_group, exercise_id, done }) => {
    const { data: { user } } = await supabase.auth.getUser();
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase
      .from('workout_logs')
      .upsert({ user_id: user.id, muscle_group, exercise_id, done, date: today });
    if (error) throw new Error(error.message);
  },
};