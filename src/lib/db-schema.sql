-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Programs Table
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'active', -- active, completed, archived
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Workouts Table (Linked to Programs or standalone)
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL, -- e.g., "Leg Day", "Full Body A"
  description TEXT,
  scheduled_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, skipped
  calories_burned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Exercises Table (Linked to Workouts)
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sets INTEGER,
  reps INTEGER,
  weight DECIMAL(5,2), -- in kg
  notes TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Food Database Table (Base foods)
CREATE TABLE IF NOT EXISTS foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  unit_g DECIMAL(10,2) DEFAULT 100.00, -- Standard reference amount (usually 100g)
  calories DECIMAL(10,2) NOT NULL,
  carbs DECIMAL(10,2) NOT NULL,
  fats DECIMAL(10,2) NOT NULL,
  proteins DECIMAL(10,2) NOT NULL
);

-- 5. Recipes Table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  ingredients JSONB, -- Stores array of {food_id, amount_g} or text description
  total_calories DECIMAL(10,2),
  total_carbs DECIMAL(10,2),
  total_fats DECIMAL(10,2),
  total_proteins DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Nutrition Logs (Daily consumption)
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_date DATE NOT NULL,
  food_id UUID REFERENCES foods(id) ON DELETE SET NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  amount_g DECIMAL(10,2) NOT NULL,
  meal_type VARCHAR(50), -- breakfast, lunch, dinner, snack
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Body Measurements (Impedanciometry)
CREATE TABLE IF NOT EXISTS body_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  weight DECIMAL(5,2), -- kg
  body_fat_percent DECIMAL(5,2), -- %
  muscle_mass_percent DECIMAL(5,2), -- %
  water_percent DECIMAL(5,2), -- %
  visceral_fat_level INTEGER,
  basal_metabolic_rate INTEGER, -- kcal
  metabolic_age INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
