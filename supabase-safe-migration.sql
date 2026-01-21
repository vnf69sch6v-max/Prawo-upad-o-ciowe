-- BEZPIECZNA MIGRACJA - APLIKACJA DO TESTOW PRAWNICZYCH
-- Uruchom w Supabase SQL Editor

-- ROZSZERZENIA
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUMY
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('free', 'premium', 'pro', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE question_type AS ENUM ('single_choice', 'multiple_choice', 'true_false', 'fill_blank', 'case_study');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE legal_area AS ENUM ('civil', 'criminal', 'administrative', 'constitutional', 'commercial', 'labor', 'tax', 'eu', 'international', 'procedure_civil', 'procedure_criminal', 'procedure_admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE exam_type AS ENUM ('application_entry', 'radca_exam', 'adwokat_exam', 'notary_exam', 'university', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE error_type AS ENUM ('careless', 'conceptual', 'knowledge_gap', 'confusion', 'partial', 'time_pressure');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- TABELE UZYTKOWNIKOW
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY,
  questions_per_session INTEGER DEFAULT 20,
  session_duration_minutes INTEGER DEFAULT 30,
  difficulty_preference INTEGER DEFAULT 5,
  show_explanations_immediately BOOLEAN DEFAULT true,
  sr_enabled BOOLEAN DEFAULT true,
  sr_new_cards_per_day INTEGER DEFAULT 20,
  sr_review_cards_per_day INTEGER DEFAULT 100,
  ai_explanations_enabled BOOLEAN DEFAULT true,
  ai_hints_enabled BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'light',
  font_size TEXT DEFAULT 'medium',
  language TEXT DEFAULT 'pl',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- KATEGORIE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  parent_id UUID REFERENCES public.categories(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  legal_area legal_area NOT NULL,
  icon TEXT,
  color TEXT,
  order_index INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PYTANIA
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id),
  question_text TEXT NOT NULL,
  question_type question_type DEFAULT 'single_choice',
  answers JSONB NOT NULL,
  correct_answer_ids TEXT[] NOT NULL,
  explanation TEXT,
  explanation_detailed TEXT,
  legal_basis TEXT,
  legal_area legal_area NOT NULL,
  related_articles TEXT[],
  keywords TEXT[],
  difficulty INTEGER DEFAULT 5 CHECK (difficulty >= 1 AND difficulty <= 10),
  estimated_time_seconds INTEGER DEFAULT 60,
  times_answered INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  average_time_seconds INTEGER,
  discrimination_index DECIMAL(3,2),
  source TEXT,
  source_year INTEGER,
  exam_type exam_type,
  is_active BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  search_vector TSVECTOR
);

-- TAGI PYTAN
CREATE TABLE IF NOT EXISTS public.question_tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RELACJA PYTANIA-TAGI
CREATE TABLE IF NOT EXISTS public.question_tag_relations (
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.question_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (question_id, tag_id)
);

-- CACHE WYJASNIE AI
CREATE TABLE IF NOT EXISTS public.ai_explanations_cache (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  explanation_type TEXT NOT NULL,
  content TEXT NOT NULL,
  model_used TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, explanation_type)
);

-- SESJE NAUKI
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  session_type TEXT DEFAULT 'practice',
  category_id UUID REFERENCES public.categories(id),
  legal_area legal_area,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  wrong_answers INTEGER DEFAULT 0,
  skipped_questions INTEGER DEFAULT 0,
  device_type TEXT,
  app_version TEXT,
  is_completed BOOLEAN DEFAULT false
);

-- ODPOWIEDZI NA PYTANIA
CREATE TABLE IF NOT EXISTS public.question_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.study_sessions(id) ON DELETE SET NULL,
  selected_answer_ids TEXT[] NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent_seconds INTEGER,
  time_to_first_interaction_ms INTEGER,
  changed_answer BOOLEAN DEFAULT false,
  original_answer_ids TEXT[],
  used_hint BOOLEAN DEFAULT false,
  viewed_explanation BOOLEAN DEFAULT false,
  explanation_view_time_seconds INTEGER,
  confidence_level INTEGER,
  marked_for_review BOOLEAN DEFAULT false,
  error_type error_type,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- POSTEPY W KATEGORIACH
CREATE TABLE IF NOT EXISTS public.category_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  total_questions_seen INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  total_wrong INTEGER DEFAULT 0,
  mastery_level DECIMAL(5,2) DEFAULT 50.00,
  mastery_confidence DECIMAL(3,2) DEFAULT 0.00,
  mastery_trend TEXT DEFAULT 'stable',
  last_reviewed_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  ease_factor DECIMAL(3,2) DEFAULT 2.50,
  interval_days INTEGER DEFAULT 1,
  repetition_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);

-- POSTEPY W PYTANIACH (Spaced Repetition)
CREATE TABLE IF NOT EXISTS public.question_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  times_seen INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  times_wrong INTEGER DEFAULT 0,
  ease_factor DECIMAL(4,2) DEFAULT 2.50,
  interval_days INTEGER DEFAULT 1,
  repetition_count INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  recent_results BOOLEAN[] DEFAULT '{}',
  is_mastered BOOLEAN DEFAULT false,
  is_difficult BOOLEAN DEFAULT false,
  is_bookmarked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- PROFIL NAUKI
CREATE TABLE IF NOT EXISTS public.learning_profiles (
  user_id UUID PRIMARY KEY,
  cognitive_analytical_intuitive DECIMAL(3,2) DEFAULT 0.00,
  cognitive_sequential_global DECIMAL(3,2) DEFAULT 0.00,
  cognitive_active_reflective DECIMAL(3,2) DEFAULT 0.00,
  cognitive_visual_verbal DECIMAL(3,2) DEFAULT 0.00,
  strategy_uses_elimination DECIMAL(3,2) DEFAULT 0.50,
  strategy_reads_carefully DECIMAL(3,2) DEFAULT 0.50,
  strategy_rushes DECIMAL(3,2) DEFAULT 0.50,
  strategy_uses_hints DECIMAL(3,2) DEFAULT 0.50,
  strategy_reviews_after DECIMAL(3,2) DEFAULT 0.50,
  optimal_time_of_day TEXT,
  optimal_session_length INTEGER DEFAULT 30,
  optimal_questions_per_session INTEGER DEFAULT 20,
  optimal_break_frequency INTEGER DEFAULT 15,
  format_preference_reading DECIMAL(3,2) DEFAULT 0.50,
  format_preference_practice DECIMAL(3,2) DEFAULT 0.50,
  format_preference_video DECIMAL(3,2) DEFAULT 0.50,
  motivator_streaks DECIMAL(3,2) DEFAULT 0.50,
  motivator_achievements DECIMAL(3,2) DEFAULT 0.50,
  motivator_progress DECIMAL(3,2) DEFAULT 0.50,
  motivator_competition DECIMAL(3,2) DEFAULT 0.50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- WZORCE BLEDOW
CREATE TABLE IF NOT EXISTS public.error_patterns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  error_count_careless INTEGER DEFAULT 0,
  error_count_conceptual INTEGER DEFAULT 0,
  error_count_knowledge_gap INTEGER DEFAULT 0,
  error_count_confusion INTEGER DEFAULT 0,
  error_count_partial INTEGER DEFAULT 0,
  error_count_time_pressure INTEGER DEFAULT 0,
  dominant_error_type error_type,
  errors_increase_late_session BOOLEAN DEFAULT false,
  errors_increase_evening BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONFUSION PAIRS
CREATE TABLE IF NOT EXISTS public.confusion_pairs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  concept_1 TEXT NOT NULL,
  concept_2 TEXT NOT NULL,
  frequency INTEGER DEFAULT 1,
  last_occurrence_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, concept_1, concept_2)
);

-- DAILY STATS
CREATE TABLE IF NOT EXISTS public.daily_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  sessions_count INTEGER DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  questions_wrong INTEGER DEFAULT 0,
  new_questions INTEGER DEFAULT 0,
  review_questions INTEGER DEFAULT 0,
  accuracy_percent DECIMAL(5,2),
  xp_earned INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

-- PLANY SUBSKRYPCYJNE
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price_monthly INTEGER NOT NULL,
  price_quarterly INTEGER,
  price_yearly INTEGER,
  stripe_price_id_monthly TEXT,
  stripe_price_id_quarterly TEXT,
  stripe_price_id_yearly TEXT,
  questions_per_day INTEGER,
  ai_explanations_per_day INTEGER,
  categories_access TEXT[],
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUBSKRYPCJE
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status subscription_status DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PLATNOSCI
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_invoice_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'pln',
  status TEXT NOT NULL,
  description TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACHIEVEMENTY
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  requirement_extra JSONB,
  xp_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
  current_progress INTEGER DEFAULT 0,
  unlocked_at TIMESTAMPTZ,
  is_unlocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEKSY
CREATE INDEX IF NOT EXISTS idx_questions_category ON public.questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_legal_area ON public.questions(legal_area);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_active ON public.questions(is_active);
CREATE INDEX IF NOT EXISTS idx_responses_user ON public.question_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_responses_question ON public.question_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_responses_session ON public.question_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_responses_created ON public.question_responses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_category_progress_user ON public.category_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_question_progress_user ON public.question_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON public.daily_stats(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

-- ROW LEVEL SECURITY
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confusion_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- POLITYKI RLS
DROP POLICY IF EXISTS "users_own_settings" ON public.user_settings;
DROP POLICY IF EXISTS "users_own_sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "users_own_responses" ON public.question_responses;
DROP POLICY IF EXISTS "users_own_category_progress" ON public.category_progress;
DROP POLICY IF EXISTS "users_own_question_progress" ON public.question_progress;
DROP POLICY IF EXISTS "users_own_learning_profile" ON public.learning_profiles;
DROP POLICY IF EXISTS "users_own_error_patterns" ON public.error_patterns;
DROP POLICY IF EXISTS "users_own_confusion_pairs" ON public.confusion_pairs;
DROP POLICY IF EXISTS "users_own_daily_stats" ON public.daily_stats;
DROP POLICY IF EXISTS "users_own_subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "users_own_payments" ON public.payments;
DROP POLICY IF EXISTS "users_own_achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "users_own_notifications" ON public.notifications;
DROP POLICY IF EXISTS "public_categories" ON public.categories;
DROP POLICY IF EXISTS "public_questions" ON public.questions;
DROP POLICY IF EXISTS "public_plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "public_achievements" ON public.achievements;

CREATE POLICY "users_own_settings" ON public.user_settings FOR ALL USING (user_id = auth.uid());
CREATE POLICY "users_own_sessions" ON public.study_sessions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "users_own_responses" ON public.question_responses FOR ALL USING (user_id = auth.uid());
CREATE POLICY "users_own_category_progress" ON public.category_progress FOR ALL USING (user_id = auth.uid());
CREATE POLICY "users_own_question_progress" ON public.question_progress FOR ALL USING (user_id = auth.uid());
CREATE POLICY "users_own_learning_profile" ON public.learning_profiles FOR ALL USING (user_id = auth.uid());
CREATE POLICY "users_own_error_patterns" ON public.error_patterns FOR ALL USING (user_id = auth.uid());
CREATE POLICY "users_own_confusion_pairs" ON public.confusion_pairs FOR ALL USING (user_id = auth.uid());
CREATE POLICY "users_own_daily_stats" ON public.daily_stats FOR ALL USING (user_id = auth.uid());
CREATE POLICY "users_own_subscriptions" ON public.subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users_own_payments" ON public.payments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users_own_achievements" ON public.user_achievements FOR ALL USING (user_id = auth.uid());
CREATE POLICY "users_own_notifications" ON public.notifications FOR ALL USING (user_id = auth.uid());

CREATE POLICY "public_categories" ON public.categories FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "public_questions" ON public.questions FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "public_plans" ON public.subscription_plans FOR SELECT USING (is_active = true);
CREATE POLICY "public_achievements" ON public.achievements FOR SELECT USING (is_active = true);

-- FUNKCJE
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.daily_stats (user_id, date, questions_answered, questions_correct, questions_wrong)
  VALUES (
    NEW.user_id,
    CURRENT_DATE,
    1,
    CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    CASE WHEN NEW.is_correct THEN 0 ELSE 1 END
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    questions_answered = daily_stats.questions_answered + 1,
    questions_correct = daily_stats.questions_correct + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    questions_wrong = daily_stats.questions_wrong + CASE WHEN NEW.is_correct THEN 0 ELSE 1 END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION calculate_sm2(
  p_quality INTEGER,
  p_repetitions INTEGER,
  p_ease_factor DECIMAL,
  p_interval INTEGER
)
RETURNS TABLE (
  new_repetitions INTEGER,
  new_ease_factor DECIMAL,
  new_interval INTEGER,
  next_review_date DATE
) AS $$
DECLARE
  v_ease_factor DECIMAL;
  v_interval INTEGER;
  v_repetitions INTEGER;
BEGIN
  IF p_quality < 3 THEN
    v_repetitions := 0;
    v_interval := 1;
    v_ease_factor := GREATEST(1.3, p_ease_factor - 0.2);
  ELSE
    v_ease_factor := p_ease_factor + (0.1 - (5 - p_quality) * (0.08 + (5 - p_quality) * 0.02));
    v_ease_factor := GREATEST(1.3, v_ease_factor);
    v_repetitions := p_repetitions + 1;
    IF p_repetitions = 0 THEN
      v_interval := 1;
    ELSIF p_repetitions = 1 THEN
      v_interval := 6;
    ELSE
      v_interval := ROUND(p_interval * v_ease_factor);
    END IF;
  END IF;
  v_interval := LEAST(365, v_interval);
  RETURN QUERY SELECT v_repetitions, v_ease_factor, v_interval, (CURRENT_DATE + v_interval)::DATE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- TRIGGERY
DROP TRIGGER IF EXISTS on_response_update_daily_stats ON public.question_responses;
CREATE TRIGGER on_response_update_daily_stats
  AFTER INSERT ON public.question_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_stats();

-- DANE POCZATKOWE
INSERT INTO public.subscription_plans (name, slug, description, price_monthly)
SELECT 'Free', 'free', 'Podstawowy dostep', 0
WHERE NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE slug = 'free');

INSERT INTO public.subscription_plans (name, slug, description, price_monthly)
SELECT 'Premium', 'premium', 'Pelny dostep', 3900
WHERE NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE slug = 'premium');

INSERT INTO public.achievements (name, slug, description, requirement_type, requirement_value, xp_reward)
SELECT 'Pierwszy krok', 'first-question', 'Odpowiedz na pierwsze pytanie', 'questions', 1, 10
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE slug = 'first-question');

INSERT INTO public.achievements (name, slug, description, requirement_type, requirement_value, xp_reward)
SELECT 'Seria 7 dni', 'streak-7', 'Utrzymaj 7-dniowa serie', 'streak', 7, 70
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE slug = 'streak-7');

-- GOTOWE
