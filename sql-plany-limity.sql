-- ═══════════════════════════════════════════════════════════════════════════
-- SYSTEM CENNIKOWY - AKTUALIZACJA ISTNIEJĄCEJ TABELI
-- Dla Supabase z istniejącą tabelą subscription_plans (id UUID)
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- 1. DODAJ BRAKUJĄCE KOLUMNY DO subscription_plans
-- ═══════════════════════════════════════════════════════════════

-- Limity
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS questions_per_day INTEGER NOT NULL DEFAULT 50;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS ai_explanations_per_day INTEGER NOT NULL DEFAULT 5;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS ai_tutor_messages_per_day INTEGER NOT NULL DEFAULT 0;

-- Dostęp do funkcji
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS access_all_categories BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS access_exam_mode BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS access_advanced_stats BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS access_learning_profile BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS access_spaced_repetition BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS access_case_studies BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS access_ai_tutor BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS access_custom_exams BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS access_study_plan BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS access_offline_mode BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS access_priority_support BOOLEAN NOT NULL DEFAULT FALSE;

-- Inne
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS ads_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS download_questions BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS export_stats BOOLEAN NOT NULL DEFAULT FALSE;

-- Stripe
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS price_yearly INTEGER DEFAULT 0;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS stripe_price_id_monthly TEXT;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS stripe_price_id_yearly TEXT;

-- UI
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS badge TEXT;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS highlighted BOOLEAN NOT NULL DEFAULT FALSE;

-- ═══════════════════════════════════════════════════════════════
-- 2. AKTUALIZUJ ISTNIEJĄCE PLANY
-- ═══════════════════════════════════════════════════════════════

-- FREE PLAN
UPDATE subscription_plans SET
  questions_per_day = 50,
  ai_explanations_per_day = 5,
  ai_tutor_messages_per_day = 0,
  access_all_categories = FALSE,
  access_exam_mode = FALSE,
  access_advanced_stats = FALSE,
  access_learning_profile = FALSE,
  access_spaced_repetition = TRUE,
  access_case_studies = FALSE,
  access_ai_tutor = FALSE,
  access_custom_exams = FALSE,
  access_study_plan = FALSE,
  access_offline_mode = FALSE,
  access_priority_support = FALSE,
  ads_enabled = TRUE,
  download_questions = FALSE,
  export_stats = FALSE,
  price_yearly = 0,
  display_order = 1,
  badge = NULL,
  highlighted = FALSE
WHERE slug = 'free';

-- PREMIUM PLAN
UPDATE subscription_plans SET
  price_monthly = 3900,
  price_yearly = 31200,
  stripe_price_id_monthly = 'price_premium_monthly',
  stripe_price_id_yearly = 'price_premium_yearly',
  questions_per_day = 999999,
  ai_explanations_per_day = 50,
  ai_tutor_messages_per_day = 0,
  access_all_categories = TRUE,
  access_exam_mode = TRUE,
  access_advanced_stats = TRUE,
  access_learning_profile = TRUE,
  access_spaced_repetition = TRUE,
  access_case_studies = TRUE,
  access_ai_tutor = FALSE,
  access_custom_exams = FALSE,
  access_study_plan = FALSE,
  access_offline_mode = TRUE,
  access_priority_support = FALSE,
  ads_enabled = FALSE,
  download_questions = TRUE,
  export_stats = TRUE,
  display_order = 2,
  badge = 'Najpopularniejszy',
  highlighted = TRUE
WHERE slug = 'premium';

-- PRO PLAN (dodaj jeśli nie istnieje)
INSERT INTO subscription_plans (name, slug, description, price_monthly, price_yearly,
  stripe_price_id_monthly, stripe_price_id_yearly,
  questions_per_day, ai_explanations_per_day, ai_tutor_messages_per_day,
  access_all_categories, access_exam_mode, access_advanced_stats,
  access_learning_profile, access_spaced_repetition, access_case_studies,
  access_ai_tutor, access_custom_exams, access_study_plan,
  access_offline_mode, access_priority_support,
  ads_enabled, download_questions, export_stats,
  display_order, badge, highlighted)
SELECT 'Pro', 'pro', 'Maksymalne wsparcie AI w nauce',
  7900, 63200,
  'price_pro_monthly', 'price_pro_yearly',
  999999, 999999, 999999,
  TRUE, TRUE, TRUE,
  TRUE, TRUE, TRUE,
  TRUE, TRUE, TRUE,
  TRUE, TRUE,
  FALSE, TRUE, TRUE,
  3, 'Pełny pakiet', FALSE
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE slug = 'pro');

-- ═══════════════════════════════════════════════════════════════
-- 3. TABELA: user_usage (śledzenie dziennego użycia)
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
  SELECT * INTO v_usage
  FROM user_usage
  WHERE user_id = p_user_id AND date = CURRENT_DATE;
  
  IF v_usage IS NULL THEN
    INSERT INTO user_usage (user_id, date)
    VALUES (p_user_id, CURRENT_DATE)
    RETURNING * INTO v_usage;
  END IF;
  
  RETURN v_usage;
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 5. FUNKCJA: Pobierz limity użytkownika (używa slug zamiast id)
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_user_limits(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan_slug TEXT;
  v_plan subscription_plans;
  v_usage user_usage;
BEGIN
  -- Pobierz plan użytkownika (role = slug planu)
  SELECT COALESCE(role, 'free') INTO v_plan_slug 
  FROM profiles 
  WHERE id = p_user_id;
  
  IF v_plan_slug IS NULL THEN 
    v_plan_slug := 'free'; 
  END IF;
  
  -- Pobierz szczegóły planu przez slug
  SELECT * INTO v_plan FROM subscription_plans WHERE slug = v_plan_slug;
  
  -- Fallback do free jeśli nie znaleziono
  IF v_plan IS NULL THEN
    SELECT * INTO v_plan FROM subscription_plans WHERE slug = 'free';
  END IF;
  
  -- Pobierz dzienne użycie
  SELECT * INTO v_usage FROM get_or_create_daily_usage(p_user_id);
  
  RETURN jsonb_build_object(
    'plan', v_plan_slug,
    'planName', v_plan.name,
    'questions', jsonb_build_object(
      'used', COALESCE(v_usage.questions_answered, 0),
      'limit', COALESCE(v_plan.questions_per_day, 50),
      'remaining', GREATEST(0, COALESCE(v_plan.questions_per_day, 50) - COALESCE(v_usage.questions_answered, 0))
    ),
    'aiExplanations', jsonb_build_object(
      'used', COALESCE(v_usage.ai_explanations_used, 0),
      'limit', COALESCE(v_plan.ai_explanations_per_day, 5),
      'remaining', GREATEST(0, COALESCE(v_plan.ai_explanations_per_day, 5) - COALESCE(v_usage.ai_explanations_used, 0))
    ),
    'aiTutor', jsonb_build_object(
      'used', COALESCE(v_usage.ai_tutor_messages_sent, 0),
      'limit', COALESCE(v_plan.ai_tutor_messages_per_day, 0),
      'remaining', GREATEST(0, COALESCE(v_plan.ai_tutor_messages_per_day, 0) - COALESCE(v_usage.ai_tutor_messages_sent, 0))
    ),
    'features', jsonb_build_object(
      'accessAllCategories', COALESCE(v_plan.access_all_categories, FALSE),
      'accessExamMode', COALESCE(v_plan.access_exam_mode, FALSE),
      'accessAdvancedStats', COALESCE(v_plan.access_advanced_stats, FALSE),
      'accessLearningProfile', COALESCE(v_plan.access_learning_profile, FALSE),
      'accessSpacedRepetition', COALESCE(v_plan.access_spaced_repetition, TRUE),
      'accessCaseStudies', COALESCE(v_plan.access_case_studies, FALSE),
      'accessAITutor', COALESCE(v_plan.access_ai_tutor, FALSE),
      'accessCustomExams', COALESCE(v_plan.access_custom_exams, FALSE),
      'accessStudyPlan', COALESCE(v_plan.access_study_plan, FALSE),
      'accessOfflineMode', COALESCE(v_plan.access_offline_mode, FALSE),
      'accessPrioritySupport', COALESCE(v_plan.access_priority_support, FALSE),
      'adsEnabled', COALESCE(v_plan.ads_enabled, TRUE),
      'downloadQuestions', COALESCE(v_plan.download_questions, FALSE),
      'exportStats', COALESCE(v_plan.export_stats, FALSE)
    )
  );
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 6. FUNKCJA: Zwiększ licznik użycia
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
  v_plan_slug TEXT;
  v_limit INTEGER;
  v_current INTEGER;
  v_allowed BOOLEAN;
BEGIN
  -- Pobierz plan użytkownika
  SELECT COALESCE(role, 'free') INTO v_plan_slug 
  FROM profiles 
  WHERE id = p_user_id;
  
  IF v_plan_slug IS NULL THEN 
    v_plan_slug := 'free'; 
  END IF;
  
  -- Pobierz limit z planu (przez slug)
  IF p_field = 'questions' THEN
    SELECT COALESCE(questions_per_day, 50) INTO v_limit FROM subscription_plans WHERE slug = v_plan_slug;
  ELSIF p_field = 'ai_explanations' THEN
    SELECT COALESCE(ai_explanations_per_day, 5) INTO v_limit FROM subscription_plans WHERE slug = v_plan_slug;
  ELSIF p_field = 'ai_tutor' THEN
    SELECT COALESCE(ai_tutor_messages_per_day, 0) INTO v_limit FROM subscription_plans WHERE slug = v_plan_slug;
  ELSE
    v_limit := 0;
  END IF;
  
  -- Fallback
  IF v_limit IS NULL THEN v_limit := 50; END IF;
  
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

-- ═══════════════════════════════════════════════════════════════
-- ✅ GOTOWE!
-- ═══════════════════════════════════════════════════════════════

-- Sprawdź czy plany zostały zaktualizowane:
SELECT slug, name, price_monthly/100 as "cena_zl", questions_per_day, access_ai_tutor 
FROM subscription_plans 
ORDER BY display_order;
