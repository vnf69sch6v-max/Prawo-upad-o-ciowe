-- ═══════════════════════════════════════════════════════════════════════════
-- SYSTEM CENNIKOWY - PLANY I LIMITY
-- Wklej do Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- 1. TABELA: subscription_plans
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Ceny (w groszach: 3900 = 39 zł)
  price_monthly INTEGER NOT NULL DEFAULT 0,
  price_yearly INTEGER NOT NULL DEFAULT 0,
  
  -- Stripe Price IDs (uzupełnij po utworzeniu w Stripe)
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  
  -- ═══════════════════════════════════════
  -- LIMITY ILOŚCIOWE
  -- ═══════════════════════════════════════
  questions_per_day INTEGER NOT NULL DEFAULT 50,
  ai_explanations_per_day INTEGER NOT NULL DEFAULT 5,
  ai_tutor_messages_per_day INTEGER NOT NULL DEFAULT 0,
  
  -- ═══════════════════════════════════════
  -- DOSTĘP DO FUNKCJI (boolean)
  -- ═══════════════════════════════════════
  access_all_categories BOOLEAN NOT NULL DEFAULT FALSE,
  access_exam_mode BOOLEAN NOT NULL DEFAULT FALSE,
  access_advanced_stats BOOLEAN NOT NULL DEFAULT FALSE,
  access_learning_profile BOOLEAN NOT NULL DEFAULT FALSE,
  access_spaced_repetition BOOLEAN NOT NULL DEFAULT TRUE,
  access_case_studies BOOLEAN NOT NULL DEFAULT FALSE,
  access_ai_tutor BOOLEAN NOT NULL DEFAULT FALSE,
  access_custom_exams BOOLEAN NOT NULL DEFAULT FALSE,
  access_study_plan BOOLEAN NOT NULL DEFAULT FALSE,
  access_offline_mode BOOLEAN NOT NULL DEFAULT FALSE,
  access_priority_support BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- ═══════════════════════════════════════
  -- INNE
  -- ═══════════════════════════════════════
  ads_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  download_questions BOOLEAN NOT NULL DEFAULT FALSE,
  export_stats BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- ═══════════════════════════════════════
  -- METADANE
  -- ═══════════════════════════════════════
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  badge TEXT,
  highlighted BOOLEAN NOT NULL DEFAULT FALSE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 2. TABELA: user_usage (śledzenie dziennego użycia)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Liczniki dzienne
  questions_answered INTEGER NOT NULL DEFAULT 0,
  ai_explanations_used INTEGER NOT NULL DEFAULT 0,
  ai_tutor_messages_sent INTEGER NOT NULL DEFAULT 0,
  
  -- Unikalna kombinacja user + data
  UNIQUE(user_id, date),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_user_usage_user_date ON user_usage(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_usage_date ON user_usage(date);

-- ═══════════════════════════════════════════════════════════════
-- 3. WSTAW PLANY
-- ═══════════════════════════════════════════════════════════════

-- Usuń stare plany (jeśli istnieją)
DELETE FROM subscription_plans WHERE id IN ('free', 'premium', 'pro');

-- Wstaw plany
INSERT INTO subscription_plans (
  id, name, description,
  price_monthly, price_yearly,
  stripe_price_id_monthly, stripe_price_id_yearly,
  questions_per_day, ai_explanations_per_day, ai_tutor_messages_per_day,
  access_all_categories, access_exam_mode, access_advanced_stats,
  access_learning_profile, access_spaced_repetition, access_case_studies,
  access_ai_tutor, access_custom_exams, access_study_plan,
  access_offline_mode, access_priority_support,
  ads_enabled, download_questions, export_stats,
  display_order, badge, highlighted
) VALUES 

-- ═══════════════════════════════════════
-- FREE PLAN
-- ═══════════════════════════════════════
(
  'free', 
  'Free', 
  'Zacznij za darmo',
  0,                           -- price_monthly
  0,                           -- price_yearly
  NULL,                        -- stripe_price_id_monthly
  NULL,                        -- stripe_price_id_yearly
  50,                          -- questions_per_day
  5,                           -- ai_explanations_per_day
  0,                           -- ai_tutor_messages_per_day
  FALSE,                       -- access_all_categories (tylko 3 darmowe)
  FALSE,                       -- access_exam_mode
  FALSE,                       -- access_advanced_stats
  FALSE,                       -- access_learning_profile
  TRUE,                        -- access_spaced_repetition (basic)
  FALSE,                       -- access_case_studies
  FALSE,                       -- access_ai_tutor
  FALSE,                       -- access_custom_exams
  FALSE,                       -- access_study_plan
  FALSE,                       -- access_offline_mode
  FALSE,                       -- access_priority_support
  TRUE,                        -- ads_enabled
  FALSE,                       -- download_questions
  FALSE,                       -- export_stats
  1,                           -- display_order
  NULL,                        -- badge
  FALSE                        -- highlighted
),

-- ═══════════════════════════════════════
-- PREMIUM PLAN - 39 zł/mies
-- ═══════════════════════════════════════
(
  'premium', 
  'Premium', 
  'Dla poważnie przygotowujących się',
  3900,                        -- price_monthly (39 zł)
  31200,                       -- price_yearly (312 zł = 26 zł/mies)
  'price_premium_monthly',     -- stripe_price_id_monthly (zmień na swoje)
  'price_premium_yearly',      -- stripe_price_id_yearly (zmień na swoje)
  999999,                      -- questions_per_day (bez limitu)
  50,                          -- ai_explanations_per_day
  0,                           -- ai_tutor_messages_per_day
  TRUE,                        -- access_all_categories
  TRUE,                        -- access_exam_mode
  TRUE,                        -- access_advanced_stats
  TRUE,                        -- access_learning_profile
  TRUE,                        -- access_spaced_repetition (advanced)
  TRUE,                        -- access_case_studies
  FALSE,                       -- access_ai_tutor (tylko Pro)
  FALSE,                       -- access_custom_exams (tylko Pro)
  FALSE,                       -- access_study_plan (tylko Pro)
  TRUE,                        -- access_offline_mode
  FALSE,                       -- access_priority_support (tylko Pro)
  FALSE,                       -- ads_enabled
  TRUE,                        -- download_questions
  TRUE,                        -- export_stats
  2,                           -- display_order
  'Najpopularniejszy',         -- badge
  TRUE                         -- highlighted
),

-- ═══════════════════════════════════════
-- PRO PLAN - 79 zł/mies
-- ═══════════════════════════════════════
(
  'pro', 
  'Pro', 
  'Maksymalne wsparcie AI w nauce',
  7900,                        -- price_monthly (79 zł)
  63200,                       -- price_yearly (632 zł = ~53 zł/mies)
  'price_pro_monthly',         -- stripe_price_id_monthly (zmień na swoje)
  'price_pro_yearly',          -- stripe_price_id_yearly (zmień na swoje)
  999999,                      -- questions_per_day (bez limitu)
  999999,                      -- ai_explanations_per_day (bez limitu)
  999999,                      -- ai_tutor_messages_per_day (bez limitu)
  TRUE,                        -- access_all_categories
  TRUE,                        -- access_exam_mode
  TRUE,                        -- access_advanced_stats
  TRUE,                        -- access_learning_profile
  TRUE,                        -- access_spaced_repetition
  TRUE,                        -- access_case_studies
  TRUE,                        -- access_ai_tutor ✅
  TRUE,                        -- access_custom_exams ✅
  TRUE,                        -- access_study_plan ✅
  TRUE,                        -- access_offline_mode
  TRUE,                        -- access_priority_support ✅
  FALSE,                       -- ads_enabled
  TRUE,                        -- download_questions
  TRUE,                        -- export_stats
  3,                           -- display_order
  'Pełny pakiet',              -- badge
  FALSE                        -- highlighted
);

-- ═══════════════════════════════════════════════════════════════
-- 4. FUNKCJA: Pobierz lub utwórz dzienne użycie
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_or_create_daily_usage(p_user_id UUID)
RETURNS user_usage
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_usage user_usage;
BEGIN
  -- Spróbuj pobrać istniejące
  SELECT * INTO v_usage
  FROM user_usage
  WHERE user_id = p_user_id AND date = CURRENT_DATE;
  
  -- Jeśli nie istnieje, utwórz
  IF v_usage IS NULL THEN
    INSERT INTO user_usage (user_id, date)
    VALUES (p_user_id, CURRENT_DATE)
    RETURNING * INTO v_usage;
  END IF;
  
  RETURN v_usage;
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 5. FUNKCJA: Zwiększ licznik użycia
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_field TEXT,
  p_amount INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan_id TEXT;
  v_limit INTEGER;
  v_current INTEGER;
  v_allowed BOOLEAN;
BEGIN
  -- Pobierz plan użytkownika
  SELECT COALESCE(role, 'free') INTO v_plan_id 
  FROM profiles 
  WHERE id = p_user_id;
  
  IF v_plan_id IS NULL THEN 
    v_plan_id := 'free'; 
  END IF;
  
  -- Pobierz limit z planu
  IF p_field = 'questions' THEN
    SELECT questions_per_day INTO v_limit FROM subscription_plans WHERE id = v_plan_id;
  ELSIF p_field = 'ai_explanations' THEN
    SELECT ai_explanations_per_day INTO v_limit FROM subscription_plans WHERE id = v_plan_id;
  ELSIF p_field = 'ai_tutor' THEN
    SELECT ai_tutor_messages_per_day INTO v_limit FROM subscription_plans WHERE id = v_plan_id;
  ELSE
    v_limit := 0;
  END IF;
  
  -- Upewnij się, że rekord użycia istnieje
  PERFORM get_or_create_daily_usage(p_user_id);
  
  -- Pobierz aktualną wartość
  IF p_field = 'questions' THEN
    SELECT COALESCE(questions_answered, 0) INTO v_current 
    FROM user_usage 
    WHERE user_id = p_user_id AND date = CURRENT_DATE;
  ELSIF p_field = 'ai_explanations' THEN
    SELECT COALESCE(ai_explanations_used, 0) INTO v_current 
    FROM user_usage 
    WHERE user_id = p_user_id AND date = CURRENT_DATE;
  ELSIF p_field = 'ai_tutor' THEN
    SELECT COALESCE(ai_tutor_messages_sent, 0) INTO v_current 
    FROM user_usage 
    WHERE user_id = p_user_id AND date = CURRENT_DATE;
  ELSE
    v_current := 0;
  END IF;
  
  -- Sprawdź czy dozwolone
  v_allowed := (v_current + p_amount) <= v_limit;
  
  -- Jeśli dozwolone, zwiększ licznik
  IF v_allowed THEN
    IF p_field = 'questions' THEN
      UPDATE user_usage 
      SET questions_answered = questions_answered + p_amount, updated_at = NOW()
      WHERE user_id = p_user_id AND date = CURRENT_DATE;
    ELSIF p_field = 'ai_explanations' THEN
      UPDATE user_usage
      SET ai_explanations_used = ai_explanations_used + p_amount, updated_at = NOW()
      WHERE user_id = p_user_id AND date = CURRENT_DATE;
    ELSIF p_field = 'ai_tutor' THEN
      UPDATE user_usage
      SET ai_tutor_messages_sent = ai_tutor_messages_sent + p_amount, updated_at = NOW()
      WHERE user_id = p_user_id AND date = CURRENT_DATE;
    END IF;
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'current', v_current,
    'limit', v_limit,
    'remaining', GREATEST(0, v_limit - v_current - CASE WHEN v_allowed THEN p_amount ELSE 0 END)
  );
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 6. FUNKCJA: Pobierz limity użytkownika
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_user_limits(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan_id TEXT;
  v_plan subscription_plans;
  v_usage user_usage;
BEGIN
  -- Pobierz plan użytkownika
  SELECT COALESCE(role, 'free') INTO v_plan_id 
  FROM profiles 
  WHERE id = p_user_id;
  
  IF v_plan_id IS NULL THEN 
    v_plan_id := 'free'; 
  END IF;
  
  -- Pobierz szczegóły planu
  SELECT * INTO v_plan FROM subscription_plans WHERE id = v_plan_id;
  
  -- Pobierz dzienne użycie
  SELECT * INTO v_usage FROM get_or_create_daily_usage(p_user_id);
  
  RETURN jsonb_build_object(
    'plan', v_plan_id,
    'planName', v_plan.name,
    'questions', jsonb_build_object(
      'used', COALESCE(v_usage.questions_answered, 0),
      'limit', v_plan.questions_per_day,
      'remaining', GREATEST(0, v_plan.questions_per_day - COALESCE(v_usage.questions_answered, 0))
    ),
    'aiExplanations', jsonb_build_object(
      'used', COALESCE(v_usage.ai_explanations_used, 0),
      'limit', v_plan.ai_explanations_per_day,
      'remaining', GREATEST(0, v_plan.ai_explanations_per_day - COALESCE(v_usage.ai_explanations_used, 0))
    ),
    'aiTutor', jsonb_build_object(
      'used', COALESCE(v_usage.ai_tutor_messages_sent, 0),
      'limit', v_plan.ai_tutor_messages_per_day,
      'remaining', GREATEST(0, v_plan.ai_tutor_messages_per_day - COALESCE(v_usage.ai_tutor_messages_sent, 0))
    ),
    'features', jsonb_build_object(
      'accessAllCategories', v_plan.access_all_categories,
      'accessExamMode', v_plan.access_exam_mode,
      'accessAdvancedStats', v_plan.access_advanced_stats,
      'accessLearningProfile', v_plan.access_learning_profile,
      'accessSpacedRepetition', v_plan.access_spaced_repetition,
      'accessCaseStudies', v_plan.access_case_studies,
      'accessAITutor', v_plan.access_ai_tutor,
      'accessCustomExams', v_plan.access_custom_exams,
      'accessStudyPlan', v_plan.access_study_plan,
      'accessOfflineMode', v_plan.access_offline_mode,
      'accessPrioritySupport', v_plan.access_priority_support,
      'adsEnabled', v_plan.ads_enabled,
      'downloadQuestions', v_plan.download_questions,
      'exportStats', v_plan.export_stats
    )
  );
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 7. RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

-- User usage
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own usage" ON user_usage;
CREATE POLICY "Users can view own usage"
  ON user_usage FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own usage" ON user_usage;
CREATE POLICY "Users can insert own usage"
  ON user_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own usage" ON user_usage;
CREATE POLICY "Users can update own usage"
  ON user_usage FOR UPDATE
  USING (auth.uid() = user_id);

-- Subscription plans (publiczny odczyt)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Plans are publicly readable" ON subscription_plans;
CREATE POLICY "Plans are publicly readable"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

-- ═══════════════════════════════════════════════════════════════
-- 8. TRIGGER: Auto-update updated_at
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_usage_updated_at ON user_usage;
CREATE TRIGGER update_user_usage_updated_at
  BEFORE UPDATE ON user_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════
-- ✅ GOTOWE!
-- ═══════════════════════════════════════════════════════════════

-- Sprawdź czy plany zostały dodane:
SELECT id, name, price_monthly/100 as "cena_zl", questions_per_day, access_ai_tutor 
FROM subscription_plans 
ORDER BY display_order;
