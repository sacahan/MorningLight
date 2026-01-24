-- Initial schema for Morning Light
CREATE TABLE IF NOT EXISTS public.weights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weight NUMERIC NOT NULL CHECK (weight > 0),
  body_fat NUMERIC CHECK (body_fat > 0 AND body_fat < 100),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS public.settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  height NUMERIC NOT NULL CHECK (height > 0),
  target_weight NUMERIC NOT NULL CHECK (target_weight > 0),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own weights" ON public.weights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own weights" ON public.weights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own weights" ON public.weights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own weights" ON public.weights FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own settings" ON public.settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own settings" ON public.settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.settings FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS weights_user_id_date_idx ON public.weights (user_id, date DESC);
