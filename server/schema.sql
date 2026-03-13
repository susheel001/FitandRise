-- ============================================================
-- FitandRise Database Schema
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- 1. USERS
-- No password column — Supabase Auth handles authentication
CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY,        -- matches Supabase auth user id
  name       VARCHAR(100)        NOT NULL,
  email      VARCHAR(150) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. PROFILES  (1 row per user)
CREATE TABLE IF NOT EXISTS profiles (
  id         SERIAL PRIMARY KEY,
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  age        INTEGER        DEFAULT 25,
  weight     DECIMAL(5,2)   DEFAULT 70,
  height     DECIMAL(5,2)   DEFAULT 170,
  gender     VARCHAR(20)    DEFAULT 'Male',
  goal       VARCHAR(50)    DEFAULT 'General Fitness',
  level      VARCHAR(20)    DEFAULT 'Beginner',
  dark_mode  BOOLEAN        DEFAULT FALSE,
  updated_at TIMESTAMP      DEFAULT NOW()
);

-- 3. GOALS  (1 row per user)
CREATE TABLE IF NOT EXISTS goals (
  id         SERIAL PRIMARY KEY,
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  calories   INTEGER DEFAULT 2000,
  protein    INTEGER DEFAULT 120,
  water      INTEGER DEFAULT 8,
  workouts   INTEGER DEFAULT 5,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. DAILY STATS  (1 row per user per day)
CREATE TABLE IF NOT EXISTS daily_stats (
  id                 SERIAL PRIMARY KEY,
  user_id            UUID REFERENCES users(id) ON DELETE CASCADE,
  date               DATE    DEFAULT CURRENT_DATE,
  calories_consumed  INTEGER DEFAULT 0,
  protein_consumed   INTEGER DEFAULT 0,
  water_consumed     INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

-- 5. MEAL LOGS
CREATE TABLE IF NOT EXISTS meal_logs (
  id         SERIAL PRIMARY KEY,
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  date       DATE          DEFAULT CURRENT_DATE,
  meal_type  VARCHAR(20)   CHECK (meal_type IN ('Breakfast','Lunch','Dinner','Snacks')),
  food_name  VARCHAR(150)  NOT NULL,
  calories   INTEGER       NOT NULL,
  protein    DECIMAL(6,2)  DEFAULT 0,
  carbs      DECIMAL(6,2)  DEFAULT 0,
  fat        DECIMAL(6,2)  DEFAULT 0,
  img_url    TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. WORKOUT LOGS
CREATE TABLE IF NOT EXISTS workout_logs (
  id            SERIAL PRIMARY KEY,
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  muscle_group  VARCHAR(30) NOT NULL,
  exercise_id   INTEGER     NOT NULL,
  done          BOOLEAN     DEFAULT FALSE,
  date          DATE        DEFAULT CURRENT_DATE,
  UNIQUE(user_id, muscle_group, exercise_id, date)
);

-- ============================================================
-- Done! 6 tables created.
-- ============================================================