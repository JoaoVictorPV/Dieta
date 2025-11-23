-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist to ensure clean slate with new relations
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS workouts; -- This was from old schema, we might rename or use programs
DROP TABLE IF EXISTS nutrition_logs;
DROP TABLE IF EXISTS body_measurements;
DROP TABLE IF EXISTS programs;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS foods;
DROP TABLE IF EXISTS users;

-- 1. Users Table (New!)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  pin VARCHAR(50) NOT NULL, -- Simple PIN/Password
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Programs Table (Linked to User)
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Exercises Table (Linked to Program)
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Workout Logs (History of executed programs)
CREATE TABLE IF NOT EXISTS workout_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  program_name VARCHAR(255), -- Keep name even if program deleted
  date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  exercises_completed INTEGER DEFAULT 0,
  total_exercises INTEGER DEFAULT 0,
  calories_burned INTEGER DEFAULT 0
);

-- 5. Food Database Table (Global + User Custom)
CREATE TABLE IF NOT EXISTS foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL for global foods
  name VARCHAR(255) NOT NULL,
  unit_g DECIMAL(10,2) DEFAULT 100.00,
  calories DECIMAL(10,2) NOT NULL,
  carbs DECIMAL(10,2) NOT NULL,
  fats DECIMAL(10,2) NOT NULL,
  proteins DECIMAL(10,2) NOT NULL
);

-- 6. Nutrition Logs (Daily consumption)
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  food_id UUID REFERENCES foods(id) ON DELETE SET NULL,
  amount_g DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Nutrition Targets (User specific)
CREATE TABLE IF NOT EXISTS nutrition_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  calories INTEGER DEFAULT 2000,
  carbs INTEGER DEFAULT 250,
  fats INTEGER DEFAULT 70,
  proteins INTEGER DEFAULT 100,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Body Measurements
CREATE TABLE IF NOT EXISTS body_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight DECIMAL(5,2),
  body_fat_percent DECIMAL(5,2),
  muscle_mass_percent DECIMAL(5,2),
  water_percent DECIMAL(5,2),
  visceral_fat_level INTEGER,
  basal_metabolic_rate INTEGER,
  metabolic_age INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
