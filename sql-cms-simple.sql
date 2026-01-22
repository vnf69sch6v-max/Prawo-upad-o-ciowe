-- ═══════════════════════════════════════════════════════════════════════════
-- CONTENT MANAGEMENT SYSTEM - UPROSZCZONY SQL (bez RLS które powoduje błędy)
-- Wklej do Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- Włącz rozszerzenia
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ═══════════════════════════════════════════════════════════════
-- 1. ROZSZERZENIE TABELI questions (nowe kolumny CMS)
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE questions ADD COLUMN IF NOT EXISTS 
  status TEXT DEFAULT 'published';

ALTER TABLE questions ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS reviewed_by UUID;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS approved_by UUID;

ALTER TABLE questions ADD COLUMN IF NOT EXISTS review_notes TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE questions ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

ALTER TABLE questions ADD COLUMN IF NOT EXISTS import_batch_id UUID;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS import_source TEXT DEFAULT 'manual';

ALTER TABLE questions ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS parent_question_id UUID;

-- Indexy
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_created_by ON questions(created_by);
CREATE INDEX IF NOT EXISTS idx_questions_text_search ON questions 
  USING GIN (question_text gin_trgm_ops);

-- ═══════════════════════════════════════════════════════════════
-- 2. TABELA: import_batches
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_filename TEXT,
  
  total_rows INTEGER DEFAULT 0,
  successful INTEGER DEFAULT 0,
  failed INTEGER DEFAULT 0,
  duplicates INTEGER DEFAULT 0,
  
  status TEXT DEFAULT 'pending',
  error_log JSONB DEFAULT '[]',
  
  config JSONB DEFAULT '{}',
  
  created_by UUID,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 3. TABELA: question_history
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS question_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL,
  
  action TEXT NOT NULL,
  changes JSONB,
  
  changed_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_question_history_question ON question_history(question_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- 4. TABELA: content_tags
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS content_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#6B7280',
  description TEXT,
  
  tag_type TEXT DEFAULT 'general',
  
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 5. TABELA: question_tags_relation
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS question_tags_relation (
  question_id UUID NOT NULL,
  tag_id UUID NOT NULL,
  assigned_by UUID,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (question_id, tag_id)
);

-- ═══════════════════════════════════════════════════════════════
-- 6. TABELA: admin_permissions
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  
  can_create_questions BOOLEAN DEFAULT TRUE,
  can_edit_questions BOOLEAN DEFAULT TRUE,
  can_delete_questions BOOLEAN DEFAULT FALSE,
  can_publish_questions BOOLEAN DEFAULT FALSE,
  can_import BOOLEAN DEFAULT TRUE,
  can_manage_categories BOOLEAN DEFAULT FALSE,
  can_manage_users BOOLEAN DEFAULT FALSE,
  is_super_admin BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 7. WIDOK: Statystyki pytań
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW question_stats_view AS
SELECT
  c.id as category_id,
  c.name as category_name,
  c.legal_area,
  COUNT(q.id) as total_questions,
  COUNT(q.id) FILTER (WHERE q.status = 'published') as published,
  COUNT(q.id) FILTER (WHERE q.status = 'draft') as drafts,
  COUNT(q.id) FILTER (WHERE q.status = 'pending_review') as pending_review,
  COUNT(q.id) FILTER (WHERE q.status = 'rejected') as rejected,
  COUNT(q.id) FILTER (WHERE q.status = 'archived') as archived,
  ROUND(AVG(q.difficulty)::numeric, 1) as avg_difficulty,
  0 as with_embedding
FROM categories c
LEFT JOIN questions q ON q.category_id = c.id
WHERE c.is_active = TRUE
GROUP BY c.id, c.name, c.legal_area
ORDER BY c.name;

-- ═══════════════════════════════════════════════════════════════
-- 8. DOMYŚLNE TAGI
-- ═══════════════════════════════════════════════════════════════

INSERT INTO content_tags (name, slug, tag_type, color) VALUES
  ('Egzamin radcowski', 'egzamin-radcowski', 'exam_type', '#3B82F6'),
  ('Egzamin adwokacki', 'egzamin-adwokacki', 'exam_type', '#8B5CF6'),
  ('Egzamin na aplikację', 'egzamin-aplikacja', 'exam_type', '#10B981'),
  ('Często na egzaminie', 'czesto-na-egzaminie', 'general', '#EF4444'),
  ('Trudne', 'trudne', 'difficulty', '#F59E0B'),
  ('Łatwe', 'latwe', 'difficulty', '#22C55E'),
  ('Orzecznictwo SN', 'orzecznictwo-sn', 'source', '#6366F1'),
  ('Orzecznictwo NSA', 'orzecznictwo-nsa', 'source', '#0EA5E9'),
  ('Nowelizacja 2024', 'nowelizacja-2024', 'topic', '#EC4899'),
  ('Kazus', 'kazus', 'topic', '#14B8A6')
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- 9. FUNKCJA: Zmień status pytania
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION change_question_status(
  p_question_id UUID,
  p_new_status TEXT,
  p_changed_by UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_status TEXT;
BEGIN
  -- Pobierz aktualny status
  SELECT status INTO v_old_status FROM questions WHERE id = p_question_id;
  
  IF v_old_status IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Pytanie nie istnieje');
  END IF;
  
  -- Aktualizuj
  UPDATE questions SET
    status = p_new_status,
    review_notes = COALESCE(p_notes, review_notes),
    reviewed_by = CASE WHEN p_new_status IN ('approved', 'rejected') THEN p_changed_by ELSE reviewed_by END,
    reviewed_at = CASE WHEN p_new_status IN ('approved', 'rejected') THEN NOW() ELSE reviewed_at END,
    approved_by = CASE WHEN p_new_status = 'approved' THEN p_changed_by ELSE approved_by END,
    approved_at = CASE WHEN p_new_status = 'approved' THEN NOW() ELSE approved_at END,
    published_at = CASE WHEN p_new_status = 'published' THEN NOW() ELSE published_at END,
    is_active = (p_new_status = 'published'),
    updated_at = NOW()
  WHERE id = p_question_id;
  
  -- Historia
  INSERT INTO question_history (question_id, action, changes, changed_by)
  VALUES (
    p_question_id,
    'status_changed',
    jsonb_build_object('old', v_old_status, 'new', p_new_status, 'notes', p_notes),
    p_changed_by
  );
  
  RETURN jsonb_build_object('success', TRUE, 'old_status', v_old_status, 'new_status', p_new_status);
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- ✅ GOTOWE!
-- ═══════════════════════════════════════════════════════════════

SELECT 'CMS tables created successfully!' as status;
