-- ═══════════════════════════════════════════════════════════════════════════
-- WYSZUKIWARKA PYTAŃ - FULL-TEXT SEARCH
-- Wklej do Supabase SQL Editor PO supabase-adaptive-flashcards.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- 1. FULL-TEXT SEARCH VECTOR
-- ═══════════════════════════════════════════════════════════════

-- Dodaj kolumnę tsvector dla full-text search
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS 
  search_vector tsvector;

-- Funkcja aktualizująca search_vector
CREATE OR REPLACE FUNCTION update_flashcard_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('simple', COALESCE(NEW.question, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.answer_short, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.legal_basis, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(array_to_string(NEW.tags, ' '), '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS trg_flashcard_search_vector ON flashcards;
CREATE TRIGGER trg_flashcard_search_vector
  BEFORE INSERT OR UPDATE ON flashcards
  FOR EACH ROW EXECUTE FUNCTION update_flashcard_search_vector();

-- Indeks GIN
CREATE INDEX IF NOT EXISTS idx_flashcards_search ON flashcards USING GIN(search_vector);

-- Aktualizuj istniejące rekordy
UPDATE flashcards SET search_vector = 
  setweight(to_tsvector('simple', COALESCE(question, '')), 'A') ||
  setweight(to_tsvector('simple', COALESCE(answer_short, '')), 'B') ||
  setweight(to_tsvector('simple', COALESCE(legal_basis, '')), 'A') ||
  setweight(to_tsvector('simple', COALESCE(array_to_string(tags, ' '), '')), 'B');

-- ═══════════════════════════════════════════════════════════════
-- 2. FUNKCJA WYSZUKIWANIA
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION search_flashcards(
  p_user_id UUID,
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
  -- User progress
  user_status TEXT,
  user_accuracy DECIMAL,
  last_review_at TIMESTAMPTZ,
  last_rating TEXT,
  next_review_at TIMESTAMPTZ,
  is_due BOOLEAN,
  total_reviews INTEGER,
  current_streak INTEGER,
  is_favorite BOOLEAN,
  -- Search
  relevance_score REAL
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_tsquery tsquery;
BEGIN
  -- Buduj tsquery
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
    -- User progress
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
    -- Relevance score
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
    -- Deck filter
    AND (p_deck_ids IS NULL OR f.deck_id = ANY(p_deck_ids))
    -- Search query
    AND (
      p_query = '' 
      OR p_query IS NULL 
      OR f.search_vector @@ v_tsquery
      -- Fallback: ILIKE for exact matches (np. "art. 299")
      OR f.question ILIKE '%' || p_query || '%'
      OR f.legal_basis ILIKE '%' || p_query || '%'
    )
    -- Progress filter
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

-- ═══════════════════════════════════════════════════════════════
-- 3. STATYSTYKI KATEGORII Z POSTĘPEM UŻYTKOWNIKA
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_deck_search_stats(p_user_id UUID)
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

-- ═══════════════════════════════════════════════════════════════
-- 4. AUTOCOMPLETE / SUGESTIE
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_search_suggestions(
  p_query TEXT,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  suggestion_type TEXT,
  suggestion_text TEXT,
  deck_name TEXT,
  match_count INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  -- Pytania pasujące do query
  (
    SELECT 
      'question'::TEXT,
      f.question,
      d.name,
      1
    FROM flashcards f
    JOIN flashcard_decks d ON d.id = f.deck_id
    WHERE f.is_active AND f.question ILIKE '%' || p_query || '%'
    ORDER BY LENGTH(f.question)
    LIMIT 5
  )
  UNION ALL
  -- Artykuły prawne
  (
    SELECT 
      'legal_basis'::TEXT,
      f.legal_basis,
      d.name,
      COUNT(*)::INTEGER
    FROM flashcards f
    JOIN flashcard_decks d ON d.id = f.deck_id
    WHERE f.is_active 
      AND f.legal_basis IS NOT NULL 
      AND f.legal_basis ILIKE '%' || p_query || '%'
    GROUP BY f.legal_basis, d.name
    ORDER BY COUNT(*) DESC
    LIMIT 5
  )
  UNION ALL
  -- Tagi
  (
    SELECT 
      'tag'::TEXT,
      t.tag,
      NULL,
      COUNT(*)::INTEGER
    FROM flashcards f, unnest(f.tags) AS t(tag)
    WHERE f.is_active AND t.tag ILIKE '%' || p_query || '%'
    GROUP BY t.tag
    ORDER BY COUNT(*) DESC
    LIMIT 5
  )
  LIMIT p_limit;
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- ✅ DONE! Full-text search ready
-- ═══════════════════════════════════════════════════════════════
