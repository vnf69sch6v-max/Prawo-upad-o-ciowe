-- ═══════════════════════════════════════════════════════════════════════════
-- FIX: Firebase UID Compatibility
-- Firebase UID is TEXT, not UUID. Run this AFTER main SQL files.
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop and recreate functions with TEXT user_id

-- 1. Fix search_flashcards
DROP FUNCTION IF EXISTS search_flashcards(UUID, TEXT, UUID[], INTEGER, INTEGER, TEXT, TEXT);
CREATE OR REPLACE FUNCTION search_flashcards(
  p_user_id TEXT,  -- Changed from UUID to TEXT for Firebase UID
  p_query TEXT,
  p_deck_ids UUID[] DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_show_only TEXT DEFAULT 'all',
  p_sort_by TEXT DEFAULT 'relevance'
)
RETURNS TABLE (
  flashcard_id UUID,
  question TEXT,
  answer_short TEXT,
  answer_full TEXT,
  legal_basis TEXT,
  deck_id UUID,
  deck_name TEXT,
  deck_icon TEXT,
  deck_color TEXT,
  tags TEXT[],
  base_difficulty INTEGER,
  user_status TEXT,
  user_accuracy DECIMAL,
  last_review_at TIMESTAMPTZ,
  last_rating TEXT,
  next_review_at TIMESTAMPTZ,
  is_due BOOLEAN,
  total_reviews INTEGER,
  current_streak INTEGER,
  is_favorite BOOLEAN,
  relevance_score REAL
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_tsquery tsquery;
BEGIN
  v_tsquery := plainto_tsquery('simple', COALESCE(p_query, ''));
  
  RETURN QUERY
  SELECT 
    f.id AS flashcard_id,
    f.question,
    f.answer_short,
    f.answer_full,
    f.legal_basis,
    f.deck_id,
    d.name AS deck_name,
    d.icon AS deck_icon,
    d.color AS deck_color,
    f.tags,
    f.base_difficulty,
    COALESCE(ufp.status, 'new') AS user_status,
    CASE 
      WHEN ufp.total_reviews > 0 
      THEN ROUND((ufp.correct_reviews::DECIMAL / ufp.total_reviews) * 100, 1)
      ELSE NULL
    END AS user_accuracy,
    ufp.last_review_at,
    ufp.last_rating,
    ufp.next_review_at,
    (ufp.next_review_at IS NOT NULL AND ufp.next_review_at <= NOW()) AS is_due,
    COALESCE(ufp.total_reviews, 0) AS total_reviews,
    COALESCE(ufp.current_streak, 0) AS current_streak,
    COALESCE(ufp.is_favorite, FALSE) AS is_favorite,
    CASE 
      WHEN p_query = '' OR p_query IS NULL THEN 0::REAL
      ELSE ts_rank_cd(f.search_vector, v_tsquery, 32)
    END AS relevance_score
  FROM flashcards f
  JOIN flashcard_decks d ON d.id = f.deck_id
  LEFT JOIN user_flashcard_progress ufp 
    ON ufp.flashcard_id = f.id AND ufp.user_id = p_user_id
  WHERE 
    f.is_active = TRUE
    AND (p_deck_ids IS NULL OR f.deck_id = ANY(p_deck_ids))
    AND (
      p_query = '' 
      OR p_query IS NULL 
      OR f.search_vector @@ v_tsquery
      OR f.question ILIKE '%' || p_query || '%'
      OR f.legal_basis ILIKE '%' || p_query || '%'
    )
    AND CASE p_show_only
      WHEN 'new' THEN COALESCE(ufp.status, 'new') = 'new'
      WHEN 'learning' THEN ufp.status IN ('learning', 'review')
      WHEN 'mastered' THEN ufp.status = 'mastered'
      WHEN 'due' THEN ufp.next_review_at IS NOT NULL AND ufp.next_review_at <= NOW()
      WHEN 'favorite' THEN ufp.is_favorite = TRUE
      ELSE TRUE
    END
  ORDER BY
    CASE p_sort_by
      WHEN 'relevance' THEN ts_rank_cd(f.search_vector, v_tsquery, 32)
      ELSE 0
    END DESC,
    CASE p_sort_by
      WHEN 'newest' THEN EXTRACT(EPOCH FROM f.created_at)
      ELSE 0
    END DESC,
    CASE p_sort_by
      WHEN 'difficulty' THEN f.base_difficulty
      ELSE 0
    END DESC,
    CASE p_sort_by
      WHEN 'due' THEN 
        CASE WHEN ufp.next_review_at <= NOW() THEN 0 ELSE 1 END
      ELSE 0
    END,
    f.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- 2. Fix get_deck_search_stats
DROP FUNCTION IF EXISTS get_deck_search_stats(UUID);
CREATE OR REPLACE FUNCTION get_deck_search_stats(p_user_id TEXT)  -- Changed from UUID
RETURNS TABLE (
  deck_id UUID,
  deck_name TEXT,
  deck_icon TEXT,
  deck_color TEXT,
  total_cards INTEGER,
  cards_seen INTEGER,
  cards_mastered INTEGER,
  cards_learning INTEGER,
  cards_new INTEGER,
  cards_due INTEGER,
  accuracy_percent DECIMAL,
  last_studied_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id AS deck_id,
    d.name AS deck_name,
    d.icon AS deck_icon,
    d.color AS deck_color,
    d.total_cards,
    COUNT(ufp.id)::INTEGER AS cards_seen,
    COUNT(ufp.id) FILTER (WHERE ufp.status = 'mastered')::INTEGER AS cards_mastered,
    COUNT(ufp.id) FILTER (WHERE ufp.status IN ('learning', 'review'))::INTEGER AS cards_learning,
    (d.total_cards - COUNT(ufp.id))::INTEGER AS cards_new,
    COUNT(ufp.id) FILTER (WHERE ufp.next_review_at <= NOW())::INTEGER AS cards_due,
    CASE 
      WHEN SUM(ufp.total_reviews) > 0 
      THEN ROUND((SUM(ufp.correct_reviews)::DECIMAL / SUM(ufp.total_reviews)) * 100, 1)
      ELSE NULL
    END AS accuracy_percent,
    MAX(ufp.last_review_at) AS last_studied_at
  FROM flashcard_decks d
  LEFT JOIN flashcards f ON f.deck_id = d.id AND f.is_active = TRUE
  LEFT JOIN user_flashcard_progress ufp ON ufp.flashcard_id = f.id AND ufp.user_id = p_user_id
  WHERE d.is_active = TRUE
  GROUP BY d.id, d.name, d.icon, d.color, d.total_cards
  ORDER BY d.sort_order, d.name;
END;
$$;

-- 3. Also fix user_flashcard_progress table if it uses UUID
ALTER TABLE user_flashcard_progress 
  ALTER COLUMN user_id TYPE TEXT;

-- 4. Fix user_flashcard_stats table
ALTER TABLE user_flashcard_stats 
  ALTER COLUMN user_id TYPE TEXT;

-- 5. Fix flashcard_sessions table
ALTER TABLE flashcard_sessions 
  ALTER COLUMN user_id TYPE TEXT;

-- 6. Fix flashcard_reviews table
ALTER TABLE flashcard_reviews 
  ALTER COLUMN user_id TYPE TEXT;

-- 7. Fix user_achievements table
ALTER TABLE user_achievements 
  ALTER COLUMN user_id TYPE TEXT;

-- ═══════════════════════════════════════════════════════════════════════════
-- Also update other RPC functions that use user_id
-- ═══════════════════════════════════════════════════════════════════════════

-- Fix record_flashcard_review
DROP FUNCTION IF EXISTS record_flashcard_review(UUID, UUID, TEXT, INTEGER);
CREATE OR REPLACE FUNCTION record_flashcard_review(
  p_user_id TEXT,  -- Changed from UUID
  p_flashcard_id UUID,
  p_rating TEXT,
  p_response_time_ms INTEGER DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_progress user_flashcard_progress%ROWTYPE;
  v_flashcard flashcards%ROWTYPE;
  v_new_interval INTEGER;
  v_new_ease_factor DECIMAL;
  v_new_repetitions INTEGER;
  v_new_status TEXT;
  v_is_correct BOOLEAN;
  v_xp_earned INTEGER;
BEGIN
  SELECT * INTO v_flashcard FROM flashcards WHERE id = p_flashcard_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Flashcard not found';
  END IF;

  SELECT * INTO v_current_progress 
  FROM user_flashcard_progress 
  WHERE user_id = p_user_id AND flashcard_id = p_flashcard_id;

  v_is_correct := p_rating IN ('good', 'easy');

  IF NOT FOUND THEN
    v_current_progress.ease_factor := 2.5;
    v_current_progress.interval_days := 0;
    v_current_progress.repetitions := 0;
    v_current_progress.total_reviews := 0;
    v_current_progress.correct_reviews := 0;
    v_current_progress.current_streak := 0;
  END IF;

  SELECT * INTO v_new_interval, v_new_ease_factor, v_new_repetitions, v_new_status
  FROM calculate_next_review(
    v_current_progress.interval_days,
    v_current_progress.ease_factor,
    v_current_progress.repetitions,
    p_rating
  );

  v_xp_earned := CASE p_rating
    WHEN 'again' THEN 2
    WHEN 'hard' THEN 5
    WHEN 'good' THEN 10
    WHEN 'easy' THEN 15
    ELSE 5
  END;

  INSERT INTO user_flashcard_progress (
    user_id, flashcard_id, ease_factor, interval_days, repetitions,
    status, last_review_at, last_rating, next_review_at,
    total_reviews, correct_reviews, current_streak, updated_at
  ) VALUES (
    p_user_id, p_flashcard_id, v_new_ease_factor, v_new_interval, v_new_repetitions,
    v_new_status, NOW(), p_rating, NOW() + (v_new_interval || ' days')::INTERVAL,
    1, CASE WHEN v_is_correct THEN 1 ELSE 0 END,
    CASE WHEN v_is_correct THEN 1 ELSE 0 END, NOW()
  )
  ON CONFLICT (user_id, flashcard_id) DO UPDATE SET
    ease_factor = v_new_ease_factor,
    interval_days = v_new_interval,
    repetitions = v_new_repetitions,
    status = v_new_status,
    last_review_at = NOW(),
    last_rating = p_rating,
    next_review_at = NOW() + (v_new_interval || ' days')::INTERVAL,
    total_reviews = user_flashcard_progress.total_reviews + 1,
    correct_reviews = user_flashcard_progress.correct_reviews + CASE WHEN v_is_correct THEN 1 ELSE 0 END,
    current_streak = CASE WHEN v_is_correct THEN user_flashcard_progress.current_streak + 1 ELSE 0 END,
    updated_at = NOW();

  INSERT INTO flashcard_reviews (user_id, flashcard_id, rating, response_time_ms, is_correct)
  VALUES (p_user_id, p_flashcard_id, p_rating, p_response_time_ms, v_is_correct);

  RETURN json_build_object(
    'success', true,
    'next_review_days', v_new_interval,
    'new_status', v_new_status,
    'xp_earned', v_xp_earned,
    'is_correct', v_is_correct
  );
END;
$$;

-- Fix get_smart_review_cards
DROP FUNCTION IF EXISTS get_smart_review_cards(UUID, UUID, INTEGER);
CREATE OR REPLACE FUNCTION get_smart_review_cards(
  p_user_id TEXT,  -- Changed from UUID
  p_deck_id UUID,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  flashcard_id UUID,
  question TEXT,
  answer_short TEXT,
  answer_full TEXT,
  legal_basis TEXT,
  tags TEXT[],
  base_difficulty INTEGER,
  priority TEXT,
  current_status TEXT,
  ease_factor DECIMAL,
  interval_days INTEGER,
  last_rating TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH prioritized AS (
    SELECT 
      f.id,
      f.question,
      f.answer_short,
      f.answer_full,
      f.legal_basis,
      f.tags,
      f.base_difficulty,
      COALESCE(ufp.status, 'new') AS current_status,
      ufp.ease_factor,
      ufp.interval_days,
      ufp.last_rating,
      CASE 
        WHEN ufp.next_review_at IS NOT NULL AND ufp.next_review_at <= NOW() THEN 1
        WHEN ufp.status IS NULL THEN 3
        WHEN ufp.last_rating = 'again' THEN 2
        WHEN ufp.last_rating = 'hard' THEN 2
        ELSE 4
      END AS priority_order,
      CASE 
        WHEN ufp.next_review_at IS NOT NULL AND ufp.next_review_at <= NOW() THEN 'overdue'
        WHEN ufp.status IS NULL THEN 'new'
        WHEN ufp.last_rating IN ('again', 'hard') THEN 'weak'
        ELSE 'review'
      END AS priority_label
    FROM flashcards f
    LEFT JOIN user_flashcard_progress ufp ON ufp.flashcard_id = f.id AND ufp.user_id = p_user_id
    WHERE f.deck_id = p_deck_id AND f.is_active = TRUE
  )
  SELECT 
    p.id AS flashcard_id,
    p.question,
    p.answer_short,
    p.answer_full,
    p.legal_basis,
    p.tags,
    p.base_difficulty,
    p.priority_label AS priority,
    p.current_status,
    p.ease_factor,
    p.interval_days,
    p.last_rating
  FROM prioritized p
  ORDER BY p.priority_order, RANDOM()
  LIMIT p_limit;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ Firebase UID compatibility fix complete
-- ═══════════════════════════════════════════════════════════════════════════
