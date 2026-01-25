-- ═══════════════════════════════════════════════════════════════════════════
-- FIX: Firebase Auth Compatibility (v4 - COMPLETE)
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- STEP 1: DROP ALL POLICIES (all possible naming variations)
-- user_flashcard_progress
DROP POLICY IF EXISTS "Progress own" ON user_flashcard_progress;
DROP POLICY IF EXISTS "Users own progress" ON user_flashcard_progress;
DROP POLICY IF EXISTS "User progress own" ON user_flashcard_progress;
DROP POLICY IF EXISTS "user_flashcard_progress_policy" ON user_flashcard_progress;

-- user_flashcard_stats
DROP POLICY IF EXISTS "Stats own" ON user_flashcard_stats;
DROP POLICY IF EXISTS "Users own stats" ON user_flashcard_stats;
DROP POLICY IF EXISTS "User stats own" ON user_flashcard_stats;
DROP POLICY IF EXISTS "user_flashcard_stats_policy" ON user_flashcard_stats;

-- flashcard_sessions
DROP POLICY IF EXISTS "Sessions own" ON flashcard_sessions;
DROP POLICY IF EXISTS "Users own sessions" ON flashcard_sessions;
DROP POLICY IF EXISTS "User sessions own" ON flashcard_sessions;
DROP POLICY IF EXISTS "flashcard_sessions_policy" ON flashcard_sessions;

-- flashcard_reviews
DROP POLICY IF EXISTS "Reviews own" ON flashcard_reviews;
DROP POLICY IF EXISTS "Users own reviews" ON flashcard_reviews;
DROP POLICY IF EXISTS "User reviews own" ON flashcard_reviews;
DROP POLICY IF EXISTS "flashcard_reviews_policy" ON flashcard_reviews;

-- user_achievements
DROP POLICY IF EXISTS "Achievements own" ON user_achievements;
DROP POLICY IF EXISTS "Users own achievements" ON user_achievements;
DROP POLICY IF EXISTS "User achievements own" ON user_achievements;
DROP POLICY IF EXISTS "user_achievements_policy" ON user_achievements;

-- STEP 2: DISABLE RLS ON ALL TABLES FIRST
ALTER TABLE user_flashcard_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_flashcard_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements DISABLE ROW LEVEL SECURITY;

-- STEP 3: DROP FOREIGN KEY CONSTRAINTS
ALTER TABLE user_flashcard_progress DROP CONSTRAINT IF EXISTS user_flashcard_progress_user_id_fkey;
ALTER TABLE user_flashcard_stats DROP CONSTRAINT IF EXISTS user_flashcard_stats_user_id_fkey;
ALTER TABLE flashcard_sessions DROP CONSTRAINT IF EXISTS flashcard_sessions_user_id_fkey;
ALTER TABLE flashcard_reviews DROP CONSTRAINT IF EXISTS flashcard_reviews_user_id_fkey;
ALTER TABLE user_achievements DROP CONSTRAINT IF EXISTS user_achievements_user_id_fkey;

-- STEP 4: ALTER COLUMNS TO TEXT
ALTER TABLE user_flashcard_progress ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE user_flashcard_stats ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE flashcard_sessions ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE flashcard_reviews ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE user_achievements ALTER COLUMN user_id TYPE TEXT;

-- STEP 5: RECREATE FUNCTIONS WITH TEXT
DROP FUNCTION IF EXISTS search_flashcards(UUID, TEXT, UUID[], INTEGER, INTEGER, TEXT, TEXT);
DROP FUNCTION IF EXISTS search_flashcards(TEXT, TEXT, UUID[], INTEGER, INTEGER, TEXT, TEXT);

CREATE OR REPLACE FUNCTION search_flashcards(
  p_user_id TEXT,
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
    f.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

DROP FUNCTION IF EXISTS get_deck_search_stats(UUID);
DROP FUNCTION IF EXISTS get_deck_search_stats(TEXT);

CREATE OR REPLACE FUNCTION get_deck_search_stats(p_user_id TEXT)
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

-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ DONE! Firebase UID compatibility complete
-- ═══════════════════════════════════════════════════════════════════════════
