-- Morning Light - Supabase Schema Setup

-- 1. Create weights table
-- This table stores daily weight records for each user.
CREATE TABLE IF NOT EXISTS public.weights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weight NUMERIC NOT NULL CHECK (weight > 0),
  body_fat NUMERIC CHECK (body_fat > 0 AND body_fat < 100), -- Optional body fat percentage
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure each user has only one record per day
  UNIQUE(user_id, date)
);

-- 2. Create settings table
-- This table stores user-specific settings like height and target weight.
CREATE TABLE IF NOT EXISTS public.settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  height NUMERIC NOT NULL CHECK (height > 0),
  target_weight NUMERIC NOT NULL CHECK (target_weight > 0),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable Row Level Security (RLS)
-- This ensures users can only access their own data.
ALTER TABLE public.weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for weights table
CREATE POLICY "Users can view their own weights"
  ON public.weights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weights"
  ON public.weights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weights"
  ON public.weights FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weights"
  ON public.weights FOR DELETE
  USING (auth.uid() = user_id);

-- 5. RLS Policies for settings table
CREATE POLICY "Users can view their own settings"
  ON public.settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON public.settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.settings FOR UPDATE
  USING (auth.uid() = user_id);

-- 6. Indices for performance
CREATE INDEX IF NOT EXISTS weights_user_id_date_idx ON public.weights (user_id, date DESC);
