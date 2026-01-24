-- ═══════════════════════════════════════════════════════════════════════════
-- ADAPTIVE FLASHCARD SYSTEM - COMPLETE SQL
-- Spaced Repetition + XP + Streaks + Analytics
-- Wklej do Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- 1. TALIE FISZEK
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS flashcard_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT '📚',
  color TEXT DEFAULT '#3B82F6',
  legal_area TEXT,
  total_cards INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_premium BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flashcard_decks_slug ON flashcard_decks(slug);

-- ═══════════════════════════════════════════════════════════════
-- 2. FISZKI
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES flashcard_decks(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer_short TEXT NOT NULL,
  answer_full TEXT,
  legal_basis TEXT,
  base_difficulty INTEGER DEFAULT 5 CHECK (base_difficulty BETWEEN 1 AND 10),
  tags TEXT[] DEFAULT '{}',
  related_flashcard_ids UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  global_ease_factor DECIMAL(4,3) DEFAULT 2.500,
  global_success_rate DECIMAL(4,3) DEFAULT 0.500,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flashcards_deck ON flashcards(deck_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_tags ON flashcards USING GIN(tags);

-- ═══════════════════════════════════════════════════════════════
-- 3. POSTĘP UŻYTKOWNIKA (SM-2 Algorithm)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_flashcard_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  
  -- SM-2 Parameters
  ease_factor DECIMAL(4,3) DEFAULT 2.500 CHECK (ease_factor >= 1.3 AND ease_factor <= 2.5),
  interval_days INTEGER DEFAULT 0,
  repetitions INTEGER DEFAULT 0,
  
  -- Scheduling
  next_review_at TIMESTAMPTZ,
  last_review_at TIMESTAMPTZ,
  
  -- Status: new, learning, review, mastered
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'learning', 'review', 'mastered')),
  
  -- Statistics
  total_reviews INTEGER DEFAULT 0,
  correct_reviews INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  avg_response_time_ms INTEGER,
  last_rating TEXT CHECK (last_rating IN ('again', 'hard', 'good', 'easy')),
  
  -- Extras
  ai_explanations_count INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT FALSE,
  user_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, flashcard_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_user ON user_flashcard_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_next_review ON user_flashcard_progress(user_id, next_review_at);
CREATE INDEX IF NOT EXISTS idx_progress_status ON user_flashcard_progress(user_id, status);

-- ═══════════════════════════════════════════════════════════════
-- 4. SESJE NAUKI
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS flashcard_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deck_id UUID REFERENCES flashcard_decks(id),
  session_type TEXT DEFAULT 'normal' CHECK (session_type IN (
    'normal', 'smart_review', 'speed_run', 'quiz', 'weak_points', 'new_only'
  )),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  planned_count INTEGER DEFAULT 0,
  cards_reviewed INTEGER DEFAULT 0,
  cards_again INTEGER DEFAULT 0,
  cards_hard INTEGER DEFAULT 0,
  cards_good INTEGER DEFAULT 0,
  cards_easy INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON flashcard_sessions(user_id, started_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- 5. POJEDYNCZE ODPOWIEDZI
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS flashcard_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES flashcard_sessions(id) ON DELETE CASCADE,
  flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating TEXT NOT NULL CHECK (rating IN ('again', 'hard', 'good', 'easy')),
  response_time_ms INTEGER,
  time_to_flip_ms INTEGER,
  asked_ai_explanation BOOLEAN DEFAULT FALSE,
  previous_interval INTEGER,
  previous_ease_factor DECIMAL(4,3),
  new_interval INTEGER,
  new_ease_factor DECIMAL(4,3),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_session ON flashcard_reviews(session_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON flashcard_reviews(user_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- 6. STATYSTYKI UŻYTKOWNIKA
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_flashcard_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Totals
  total_reviews INTEGER DEFAULT 0,
  total_cards_seen INTEGER DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0,
  
  -- Streak
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  last_study_date DATE,
  streak_freezes_available INTEGER DEFAULT 1,
  
  -- XP & Level
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  
  -- Daily
  daily_goal_cards INTEGER DEFAULT 20,
  cards_today INTEGER DEFAULT 0,
  last_cards_today_reset DATE,
  
  -- Preferences
  new_cards_per_day INTEGER DEFAULT 15,
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 7. ACHIEVEMENTS (ODZNAKI)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  condition_type TEXT NOT NULL,
  condition_value INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  rarity TEXT DEFAULT 'common',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  seen BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, achievement_id)
);

-- Default achievements
INSERT INTO achievements (code, name, description, icon, category, condition_type, condition_value, xp_reward, rarity) VALUES
  ('streak_3', 'Dobry start', '3 dni nauki z rzędu', '🔥', 'streak', 'streak_days', 3, 50, 'common'),
  ('streak_7', 'Tydzień Wojownika', '7 dni nauki z rzędu', '⚔️', 'streak', 'streak_days', 7, 100, 'uncommon'),
  ('streak_30', 'Mistrz Dyscypliny', '30 dni nauki z rzędu', '🏆', 'streak', 'streak_days', 30, 500, 'rare'),
  ('mastered_10', 'Pierwsze kroki', 'Opanuj 10 fiszek', '📚', 'mastery', 'mastered_cards', 10, 25, 'common'),
  ('mastered_50', 'Uczeń', 'Opanuj 50 fiszek', '📖', 'mastery', 'mastered_cards', 50, 100, 'common'),
  ('mastered_100', 'Początek drogi', 'Opanuj 100 fiszek', '🎯', 'mastery', 'mastered_cards', 100, 200, 'uncommon'),
  ('mastered_500', 'Bibliotekarz', 'Opanuj 500 fiszek', '📕', 'mastery', 'mastered_cards', 500, 750, 'rare'),
  ('reviews_100', 'Pracowity', '100 powtórek', '💪', 'dedication', 'total_reviews', 100, 50, 'common'),
  ('reviews_1000', 'Wytrwały', '1000 powtórek', '🌟', 'dedication', 'total_reviews', 1000, 300, 'uncommon'),
  ('xp_1000', 'Pierwszy tysiąc', 'Zdobądź 1000 XP', '⭐', 'xp', 'total_xp', 1000, 100, 'common'),
  ('xp_10000', 'Dziesięć tysięcy', 'Zdobądź 10000 XP', '🌟', 'xp', 'total_xp', 10000, 500, 'rare')
ON CONFLICT (code) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- 8. FUNKCJA: Oblicz następną powtórkę (SM-2)
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION calculate_next_review(
  p_ease DECIMAL,
  p_interval INTEGER,
  p_reps INTEGER,
  p_rating TEXT
)
RETURNS TABLE (
  new_ease DECIMAL,
  new_interval INTEGER,
  new_reps INTEGER,
  new_status TEXT,
  next_review TIMESTAMPTZ
)
LANGUAGE plpgsql AS $$
DECLARE
  v_ease DECIMAL := p_ease;
  v_interval INTEGER := p_interval;
  v_reps INTEGER := p_reps;
  v_status TEXT;
BEGIN
  CASE p_rating
    WHEN 'again' THEN
      v_reps := 0;
      v_interval := 0;
      v_ease := GREATEST(1.3, v_ease - 0.20);
      v_status := 'learning';
    WHEN 'hard' THEN
      v_interval := GREATEST(1, FLOOR(v_interval * 0.8));
      v_ease := GREATEST(1.3, v_ease - 0.15);
      v_reps := 0;
      v_status := 'learning';
    WHEN 'good' THEN
      IF v_reps = 0 THEN v_interval := 1;
      ELSIF v_reps = 1 THEN v_interval := 6;
      ELSE v_interval := ROUND(v_interval * v_ease);
      END IF;
      v_reps := v_reps + 1;
      v_status := CASE WHEN v_interval >= 21 AND v_reps >= 5 THEN 'mastered' 
                       WHEN v_interval >= 1 THEN 'review' ELSE 'learning' END;
    WHEN 'easy' THEN
      IF v_reps = 0 THEN v_interval := 4;
      ELSE v_interval := ROUND(v_interval * v_ease * 1.3);
      END IF;
      v_reps := v_reps + 1;
      v_ease := LEAST(2.5, v_ease + 0.15);
      v_status := CASE WHEN v_interval >= 21 AND v_reps >= 3 THEN 'mastered'
                       WHEN v_interval >= 1 THEN 'review' ELSE 'learning' END;
  END CASE;
  
  RETURN QUERY SELECT 
    v_ease,
    v_interval,
    v_reps,
    v_status,
    CASE WHEN v_interval = 0 THEN NOW() + INTERVAL '1 minute'
         ELSE NOW() + (v_interval || ' days')::INTERVAL END;
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 9. FUNKCJA: Zapisz odpowiedź
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION record_flashcard_review(
  p_user_id UUID,
  p_session_id UUID,
  p_flashcard_id UUID,
  p_rating TEXT,
  p_response_time_ms INTEGER DEFAULT NULL,
  p_time_to_flip_ms INTEGER DEFAULT NULL,
  p_asked_ai BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_progress user_flashcard_progress;
  v_new RECORD;
  v_xp INTEGER;
  v_correct BOOLEAN;
BEGIN
  -- Get or create progress
  SELECT * INTO v_progress FROM user_flashcard_progress
  WHERE user_id = p_user_id AND flashcard_id = p_flashcard_id;
  
  IF v_progress IS NULL THEN
    INSERT INTO user_flashcard_progress (user_id, flashcard_id)
    VALUES (p_user_id, p_flashcard_id) RETURNING * INTO v_progress;
  END IF;
  
  -- Calculate new values
  SELECT * INTO v_new FROM calculate_next_review(
    v_progress.ease_factor, v_progress.interval_days, v_progress.repetitions, p_rating
  );
  
  v_correct := p_rating IN ('good', 'easy');
  
  -- Calculate XP
  v_xp := CASE p_rating WHEN 'again' THEN 5 WHEN 'hard' THEN 10 WHEN 'good' THEN 15 WHEN 'easy' THEN 20 END;
  IF v_correct AND v_progress.current_streak >= 5 THEN v_xp := v_xp + 5; END IF;
  IF v_correct AND v_progress.current_streak >= 10 THEN v_xp := v_xp + 10; END IF;
  
  -- Save review
  INSERT INTO flashcard_reviews (
    session_id, flashcard_id, user_id, rating, response_time_ms, time_to_flip_ms,
    asked_ai_explanation, previous_interval, previous_ease_factor, new_interval, new_ease_factor
  ) VALUES (
    p_session_id, p_flashcard_id, p_user_id, p_rating, p_response_time_ms, p_time_to_flip_ms,
    p_asked_ai, v_progress.interval_days, v_progress.ease_factor, v_new.new_interval, v_new.new_ease
  );
  
  -- Update progress
  UPDATE user_flashcard_progress SET
    ease_factor = v_new.new_ease,
    interval_days = v_new.new_interval,
    repetitions = v_new.new_reps,
    status = v_new.new_status,
    next_review_at = v_new.next_review,
    last_review_at = NOW(),
    total_reviews = total_reviews + 1,
    correct_reviews = correct_reviews + CASE WHEN v_correct THEN 1 ELSE 0 END,
    current_streak = CASE WHEN v_correct THEN current_streak + 1 ELSE 0 END,
    best_streak = GREATEST(best_streak, CASE WHEN v_correct THEN current_streak + 1 ELSE 0 END),
    last_rating = p_rating,
    ai_explanations_count = ai_explanations_count + CASE WHEN p_asked_ai THEN 1 ELSE 0 END,
    updated_at = NOW()
  WHERE user_id = p_user_id AND flashcard_id = p_flashcard_id;
  
  -- Update session
  UPDATE flashcard_sessions SET
    cards_reviewed = cards_reviewed + 1,
    cards_again = cards_again + CASE WHEN p_rating = 'again' THEN 1 ELSE 0 END,
    cards_hard = cards_hard + CASE WHEN p_rating = 'hard' THEN 1 ELSE 0 END,
    cards_good = cards_good + CASE WHEN p_rating = 'good' THEN 1 ELSE 0 END,
    cards_easy = cards_easy + CASE WHEN p_rating = 'easy' THEN 1 ELSE 0 END,
    xp_earned = xp_earned + v_xp
  WHERE id = p_session_id;
  
  -- Update user stats
  INSERT INTO user_flashcard_stats (user_id, total_reviews, total_xp, cards_today, last_cards_today_reset)
  VALUES (p_user_id, 1, v_xp, 1, CURRENT_DATE)
  ON CONFLICT (user_id) DO UPDATE SET
    total_reviews = user_flashcard_stats.total_reviews + 1,
    total_xp = user_flashcard_stats.total_xp + v_xp,
    cards_today = CASE WHEN user_flashcard_stats.last_cards_today_reset = CURRENT_DATE 
                       THEN user_flashcard_stats.cards_today + 1 ELSE 1 END,
    last_cards_today_reset = CURRENT_DATE,
    updated_at = NOW();
  
  RETURN jsonb_build_object(
    'success', TRUE,
    'xp_earned', v_xp,
    'new_status', v_new.new_status,
    'new_interval', v_new.new_interval,
    'next_review_at', v_new.next_review,
    'current_streak', CASE WHEN v_correct THEN v_progress.current_streak + 1 ELSE 0 END
  );
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 10. FUNKCJA: Smart Review - pobierz fiszki do nauki
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_smart_review_cards(
  p_user_id UUID,
  p_deck_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 25,
  p_new_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  flashcard_id UUID,
  question TEXT,
  answer_short TEXT,
  answer_full TEXT,
  legal_basis TEXT,
  base_difficulty INTEGER,
  tags TEXT[],
  deck_id UUID,
  deck_name TEXT,
  status TEXT,
  ease_factor DECIMAL,
  interval_days INTEGER,
  last_rating TEXT,
  total_reviews INTEGER,
  accuracy DECIMAL,
  priority_type TEXT,
  priority_score INTEGER
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  WITH 
  -- Overdue cards (highest priority)
  overdue AS (
    SELECT f.id, 'overdue'::TEXT as ptype, 
           EXTRACT(EPOCH FROM (NOW() - ufp.next_review_at))::INTEGER / 3600 as pscore
    FROM flashcards f
    JOIN user_flashcard_progress ufp ON ufp.flashcard_id = f.id AND ufp.user_id = p_user_id
    WHERE f.is_active AND ufp.next_review_at < NOW() AND ufp.status != 'new'
      AND (p_deck_id IS NULL OR f.deck_id = p_deck_id)
    ORDER BY ufp.next_review_at ASC
    LIMIT CEIL(p_limit * 0.5)
  ),
  -- Weak points
  weak AS (
    SELECT f.id, 'weak_point'::TEXT as ptype,
           (100 - (ufp.correct_reviews::DECIMAL / NULLIF(ufp.total_reviews, 0) * 100))::INTEGER as pscore
    FROM flashcards f
    JOIN user_flashcard_progress ufp ON ufp.flashcard_id = f.id AND ufp.user_id = p_user_id
    WHERE f.is_active AND ufp.total_reviews >= 3
      AND (ufp.correct_reviews::DECIMAL / ufp.total_reviews) < 0.6
      AND f.id NOT IN (SELECT id FROM overdue)
      AND (p_deck_id IS NULL OR f.deck_id = p_deck_id)
    ORDER BY (ufp.correct_reviews::DECIMAL / ufp.total_reviews) ASC
    LIMIT CEIL(p_limit * 0.3)
  ),
  -- New cards
  new_cards AS (
    SELECT f.id, 'new'::TEXT as ptype, f.base_difficulty as pscore
    FROM flashcards f
    LEFT JOIN user_flashcard_progress ufp ON ufp.flashcard_id = f.id AND ufp.user_id = p_user_id
    WHERE f.is_active AND (ufp.id IS NULL OR ufp.status = 'new')
      AND f.id NOT IN (SELECT id FROM overdue) AND f.id NOT IN (SELECT id FROM weak)
      AND (p_deck_id IS NULL OR f.deck_id = p_deck_id)
    ORDER BY f.base_difficulty ASC
    LIMIT p_new_limit
  ),
  -- Combine all
  all_cards AS (
    SELECT * FROM overdue
    UNION ALL SELECT * FROM weak
    UNION ALL SELECT * FROM new_cards
  )
  SELECT 
    f.id, f.question, f.answer_short, f.answer_full, f.legal_basis,
    f.base_difficulty, f.tags, f.deck_id, d.name,
    COALESCE(ufp.status, 'new'), COALESCE(ufp.ease_factor, 2.5),
    COALESCE(ufp.interval_days, 0), ufp.last_rating,
    COALESCE(ufp.total_reviews, 0),
    CASE WHEN ufp.total_reviews > 0 THEN ufp.correct_reviews::DECIMAL / ufp.total_reviews ELSE NULL END,
    ac.ptype, ac.pscore
  FROM all_cards ac
  JOIN flashcards f ON f.id = ac.id
  JOIN flashcard_decks d ON d.id = f.deck_id
  LEFT JOIN user_flashcard_progress ufp ON ufp.flashcard_id = f.id AND ufp.user_id = p_user_id
  ORDER BY CASE ac.ptype WHEN 'overdue' THEN 1 WHEN 'weak_point' THEN 2 WHEN 'new' THEN 3 END,
           ac.pscore DESC
  LIMIT p_limit;
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 11. FUNKCJA: Aktualizuj streak
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_stats user_flashcard_stats;
  v_today DATE := CURRENT_DATE;
  v_new_streak INTEGER;
  v_broken BOOLEAN := FALSE;
BEGIN
  SELECT * INTO v_stats FROM user_flashcard_stats WHERE user_id = p_user_id;
  
  IF v_stats IS NULL THEN
    INSERT INTO user_flashcard_stats (user_id, current_streak_days, last_study_date)
    VALUES (p_user_id, 1, v_today);
    RETURN jsonb_build_object('streak', 1, 'is_new', TRUE, 'broken', FALSE);
  END IF;
  
  IF v_stats.last_study_date = v_today THEN
    RETURN jsonb_build_object('streak', v_stats.current_streak_days, 'is_new', FALSE, 'broken', FALSE);
  END IF;
  
  IF v_stats.last_study_date = v_today - 1 THEN
    v_new_streak := v_stats.current_streak_days + 1;
  ELSIF v_stats.last_study_date = v_today - 2 AND v_stats.streak_freezes_available > 0 THEN
    v_new_streak := v_stats.current_streak_days;
    UPDATE user_flashcard_stats SET streak_freezes_available = streak_freezes_available - 1 WHERE user_id = p_user_id;
  ELSE
    v_new_streak := 1;
    v_broken := v_stats.current_streak_days > 0;
  END IF;
  
  UPDATE user_flashcard_stats SET
    current_streak_days = v_new_streak,
    longest_streak_days = GREATEST(longest_streak_days, v_new_streak),
    last_study_date = v_today,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN jsonb_build_object('streak', v_new_streak, 'is_new', FALSE, 'broken', v_broken);
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 12. FUNKCJA: Dashboard stats
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_user_dashboard(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql AS $$
DECLARE
  v_stats user_flashcard_stats;
  v_due INTEGER;
  v_mastered INTEGER;
  v_learning INTEGER;
BEGIN
  SELECT * INTO v_stats FROM user_flashcard_stats WHERE user_id = p_user_id;
  
  SELECT COUNT(*) INTO v_due FROM user_flashcard_progress
  WHERE user_id = p_user_id AND next_review_at <= NOW() AND status != 'new';
  
  SELECT COUNT(*) INTO v_mastered FROM user_flashcard_progress
  WHERE user_id = p_user_id AND status = 'mastered';
  
  SELECT COUNT(*) INTO v_learning FROM user_flashcard_progress
  WHERE user_id = p_user_id AND status IN ('learning', 'review');
  
  RETURN jsonb_build_object(
    'streak', jsonb_build_object(
      'current', COALESCE(v_stats.current_streak_days, 0),
      'longest', COALESCE(v_stats.longest_streak_days, 0),
      'freezes', COALESCE(v_stats.streak_freezes_available, 1)
    ),
    'xp', jsonb_build_object(
      'total', COALESCE(v_stats.total_xp, 0),
      'level', COALESCE(v_stats.current_level, 1)
    ),
    'today', jsonb_build_object(
      'done', COALESCE(v_stats.cards_today, 0),
      'goal', COALESCE(v_stats.daily_goal_cards, 20),
      'due', v_due
    ),
    'cards', jsonb_build_object(
      'mastered', v_mastered,
      'learning', v_learning,
      'total_reviews', COALESCE(v_stats.total_reviews, 0)
    )
  );
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 13. FUNKCJA: Sprawdź achievements
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION check_achievements(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_stats user_flashcard_stats;
  v_mastered INTEGER;
  v_achievement RECORD;
  v_awarded JSONB := '[]'::JSONB;
  v_value INTEGER;
  v_should_award BOOLEAN;
BEGIN
  SELECT * INTO v_stats FROM user_flashcard_stats WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_mastered FROM user_flashcard_progress WHERE user_id = p_user_id AND status = 'mastered';
  
  FOR v_achievement IN 
    SELECT a.* FROM achievements a
    WHERE a.is_active AND NOT EXISTS (
      SELECT 1 FROM user_achievements ua WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id
    )
  LOOP
    v_should_award := FALSE;
    
    CASE v_achievement.condition_type
      WHEN 'streak_days' THEN v_should_award := COALESCE(v_stats.current_streak_days, 0) >= v_achievement.condition_value;
      WHEN 'mastered_cards' THEN v_should_award := v_mastered >= v_achievement.condition_value;
      WHEN 'total_reviews' THEN v_should_award := COALESCE(v_stats.total_reviews, 0) >= v_achievement.condition_value;
      WHEN 'total_xp' THEN v_should_award := COALESCE(v_stats.total_xp, 0) >= v_achievement.condition_value;
    END CASE;
    
    IF v_should_award THEN
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (p_user_id, v_achievement.id);
      UPDATE user_flashcard_stats SET total_xp = total_xp + v_achievement.xp_reward WHERE user_id = p_user_id;
      v_awarded := v_awarded || jsonb_build_object('id', v_achievement.id, 'name', v_achievement.name, 'icon', v_achievement.icon, 'xp', v_achievement.xp_reward);
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object('awarded', v_awarded, 'count', jsonb_array_length(v_awarded));
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 14. TRIGGER: Deck card count
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_deck_count() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE flashcard_decks SET total_cards = total_cards + 1 WHERE id = NEW.deck_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE flashcard_decks SET total_cards = total_cards - 1 WHERE id = OLD.deck_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.deck_id != NEW.deck_id THEN
    UPDATE flashcard_decks SET total_cards = total_cards - 1 WHERE id = OLD.deck_id;
    UPDATE flashcard_decks SET total_cards = total_cards + 1 WHERE id = NEW.deck_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_deck_count ON flashcards;
CREATE TRIGGER trg_deck_count AFTER INSERT OR UPDATE OR DELETE ON flashcards
FOR EACH ROW EXECUTE FUNCTION update_deck_count();

-- ═══════════════════════════════════════════════════════════════
-- 15. RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_flashcard_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_flashcard_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Decks public read" ON flashcard_decks;
CREATE POLICY "Decks public read" ON flashcard_decks FOR SELECT USING (is_active);

DROP POLICY IF EXISTS "Flashcards public read" ON flashcards;
CREATE POLICY "Flashcards public read" ON flashcards FOR SELECT USING (is_active);

DROP POLICY IF EXISTS "Progress own" ON user_flashcard_progress;
CREATE POLICY "Progress own" ON user_flashcard_progress FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Sessions own" ON flashcard_sessions;
CREATE POLICY "Sessions own" ON flashcard_sessions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Reviews own" ON flashcard_reviews;
CREATE POLICY "Reviews own" ON flashcard_reviews FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Stats own" ON user_flashcard_stats;
CREATE POLICY "Stats own" ON user_flashcard_stats FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Achievements public" ON achievements;
CREATE POLICY "Achievements public" ON achievements FOR SELECT USING (is_active);

DROP POLICY IF EXISTS "User achievements own" ON user_achievements;
CREATE POLICY "User achievements own" ON user_achievements FOR ALL USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- ✅ DONE!
-- ═══════════════════════════════════════════════════════════════
