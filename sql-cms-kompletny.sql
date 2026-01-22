-- ═══════════════════════════════════════════════════════════════════════════
-- CONTENT MANAGEMENT SYSTEM - KOMPLETNY SQL
-- Wklej do Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- Włącz rozszerzenia
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ═══════════════════════════════════════════════════════════════
-- 1. ROZSZERZENIE TABELI questions (nowe kolumny CMS)
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE questions ADD COLUMN IF NOT EXISTS 
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'published', 'rejected', 'archived'));

ALTER TABLE questions ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE questions ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id);
ALTER TABLE questions ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);

ALTER TABLE questions ADD COLUMN IF NOT EXISTS review_notes TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE questions ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

ALTER TABLE questions ADD COLUMN IF NOT EXISTS import_batch_id UUID;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS import_source TEXT DEFAULT 'manual' 
  CHECK (import_source IN ('manual', 'excel', 'csv', 'json', 'ai_generated'));

ALTER TABLE questions ADD COLUMN IF NOT EXISTS embedding vector(1536);

ALTER TABLE questions ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS parent_question_id UUID REFERENCES questions(id);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_created_by ON questions(created_by);
CREATE INDEX IF NOT EXISTS idx_questions_embedding ON questions 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_questions_text_search ON questions 
  USING GIN (question_text gin_trgm_ops);

-- ═══════════════════════════════════════════════════════════════
-- 2. TABELA: import_batches
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('excel', 'csv', 'json', 'ai_generated')),
  source_filename TEXT,
  
  total_rows INTEGER DEFAULT 0,
  successful INTEGER DEFAULT 0,
  failed INTEGER DEFAULT 0,
  duplicates INTEGER DEFAULT 0,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  error_log JSONB DEFAULT '[]',
  
  config JSONB DEFAULT '{}',
  
  created_by UUID NOT NULL REFERENCES auth.users(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_import_batches_created_by ON import_batches(created_by);
CREATE INDEX IF NOT EXISTS idx_import_batches_status ON import_batches(status);

-- ═══════════════════════════════════════════════════════════════
-- 3. TABELA: question_history
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS question_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'status_changed', 'deleted', 'restored')),
  changes JSONB,
  
  changed_by UUID REFERENCES auth.users(id),
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
  
  tag_type TEXT DEFAULT 'general' CHECK (tag_type IN ('general', 'exam_type', 'difficulty', 'topic', 'source')),
  
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- 5. TABELA: question_tags_relation
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS question_tags_relation (
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES content_tags(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (question_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_question_tags_question ON question_tags_relation(question_id);
CREATE INDEX IF NOT EXISTS idx_question_tags_tag ON question_tags_relation(tag_id);

-- ═══════════════════════════════════════════════════════════════
-- 6. TABELA: admin_permissions
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
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
-- 7. FUNKCJA: Walidacja pytania
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION validate_question(
  p_question_text TEXT,
  p_answers JSONB,
  p_correct_answer_ids TEXT[],
  p_category_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_errors TEXT[] := '{}';
  v_warnings TEXT[] := '{}';
  v_answer_count INTEGER;
  v_answer JSONB;
BEGIN
  -- Sprawdź treść pytania
  IF p_question_text IS NULL OR length(trim(p_question_text)) < 10 THEN
    v_errors := array_append(v_errors, 'Pytanie musi mieć minimum 10 znaków');
  END IF;
  
  IF length(p_question_text) > 2000 THEN
    v_errors := array_append(v_errors, 'Pytanie nie może przekraczać 2000 znaków');
  END IF;
  
  -- Sprawdź odpowiedzi
  IF p_answers IS NULL THEN
    v_errors := array_append(v_errors, 'Brak odpowiedzi');
  ELSE
    v_answer_count := jsonb_array_length(p_answers);
    
    IF v_answer_count < 2 THEN
      v_errors := array_append(v_errors, 'Minimum 2 odpowiedzi');
    END IF;
    
    IF v_answer_count > 6 THEN
      v_errors := array_append(v_errors, 'Maksymalnie 6 odpowiedzi');
    END IF;
    
    -- Sprawdź czy każda odpowiedź ma tekst
    FOR v_answer IN SELECT * FROM jsonb_array_elements(p_answers)
    LOOP
      IF v_answer->>'text' IS NULL OR length(trim(v_answer->>'text')) = 0 THEN
        v_errors := array_append(v_errors, 'Wszystkie odpowiedzi muszą mieć treść');
        EXIT;
      END IF;
    END LOOP;
  END IF;
  
  -- Sprawdź poprawne odpowiedzi
  IF p_correct_answer_ids IS NULL OR array_length(p_correct_answer_ids, 1) IS NULL THEN
    v_errors := array_append(v_errors, 'Brak poprawnej odpowiedzi');
  ELSIF array_length(p_correct_answer_ids, 1) > 1 THEN
    v_warnings := array_append(v_warnings, 'Pytanie wielokrotnego wyboru');
  END IF;
  
  -- Sprawdź kategorię
  IF p_category_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM categories WHERE id = p_category_id AND is_active = TRUE) THEN
      v_errors := array_append(v_errors, 'Kategoria nie istnieje lub jest nieaktywna');
    END IF;
  ELSE
    v_warnings := array_append(v_warnings, 'Brak kategorii');
  END IF;
  
  RETURN jsonb_build_object(
    'valid', array_length(v_errors, 1) IS NULL,
    'errors', to_jsonb(v_errors),
    'warnings', to_jsonb(v_warnings)
  );
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 8. FUNKCJA: Sprawdź duplikaty
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION check_duplicate_question(
  p_question_text TEXT,
  p_similarity_threshold FLOAT DEFAULT 0.85
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_exact_match UUID;
  v_similar JSONB;
BEGIN
  -- Dokładne dopasowanie
  SELECT id INTO v_exact_match
  FROM questions
  WHERE lower(trim(question_text)) = lower(trim(p_question_text))
  LIMIT 1;
  
  IF v_exact_match IS NOT NULL THEN
    RETURN jsonb_build_object(
      'is_duplicate', TRUE,
      'type', 'exact',
      'duplicate_id', v_exact_match
    );
  END IF;
  
  -- Podobieństwo tekstu (trigram)
  SELECT jsonb_agg(jsonb_build_object(
    'id', id,
    'text', left(question_text, 100),
    'similarity', similarity(question_text, p_question_text)
  ))
  INTO v_similar
  FROM questions
  WHERE similarity(question_text, p_question_text) > p_similarity_threshold
  ORDER BY similarity(question_text, p_question_text) DESC
  LIMIT 5;
  
  IF v_similar IS NOT NULL AND jsonb_array_length(v_similar) > 0 THEN
    RETURN jsonb_build_object(
      'is_duplicate', TRUE,
      'type', 'similar',
      'similar_questions', v_similar
    );
  END IF;
  
  RETURN jsonb_build_object('is_duplicate', FALSE);
END;
$$;

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
  v_allowed_transitions JSONB;
BEGIN
  -- Pobierz aktualny status
  SELECT status INTO v_old_status FROM questions WHERE id = p_question_id;
  
  IF v_old_status IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Pytanie nie istnieje');
  END IF;
  
  -- Dozwolone przejścia
  v_allowed_transitions := '{
    "draft": ["pending_review", "archived"],
    "pending_review": ["approved", "rejected", "draft"],
    "approved": ["published", "draft"],
    "published": ["archived", "draft"],
    "rejected": ["draft"],
    "archived": ["draft"]
  }'::jsonb;
  
  -- Sprawdź czy przejście jest dozwolone
  IF NOT (v_allowed_transitions->v_old_status) ? p_new_status THEN
    RETURN jsonb_build_object(
      'success', FALSE, 
      'error', 'Niedozwolone przejście: ' || v_old_status || ' → ' || p_new_status
    );
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
-- 10. FUNKCJA: Bulk import
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION bulk_import_questions(
  p_questions JSONB,
  p_batch_id UUID,
  p_created_by UUID,
  p_default_category_id UUID DEFAULT NULL,
  p_auto_publish BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_question JSONB;
  v_validation JSONB;
  v_duplicate JSONB;
  v_question_id UUID;
  v_successful INTEGER := 0;
  v_failed INTEGER := 0;
  v_duplicates INTEGER := 0;
  v_errors JSONB := '[]'::jsonb;
  v_row INTEGER := 0;
  v_category_id UUID;
BEGIN
  FOR v_question IN SELECT * FROM jsonb_array_elements(p_questions)
  LOOP
    v_row := v_row + 1;
    
    BEGIN
      -- Walidacja
      v_validation := validate_question(
        v_question->>'question_text',
        v_question->'answers',
        ARRAY(SELECT jsonb_array_elements_text(v_question->'correct_answer_ids'))
      );
      
      IF NOT (v_validation->>'valid')::boolean THEN
        v_failed := v_failed + 1;
        v_errors := v_errors || jsonb_build_object(
          'row', v_row,
          'errors', v_validation->'errors'
        );
        CONTINUE;
      END IF;
      
      -- Duplikaty
      v_duplicate := check_duplicate_question(v_question->>'question_text');
      
      IF (v_duplicate->>'is_duplicate')::boolean THEN
        v_duplicates := v_duplicates + 1;
        CONTINUE;
      END IF;
      
      -- Kategoria
      v_category_id := COALESCE(
        (v_question->>'category_id')::UUID,
        p_default_category_id
      );
      
      -- Insert
      INSERT INTO questions (
        question_text,
        question_type,
        answers,
        correct_answer_ids,
        explanation,
        legal_basis,
        legal_area,
        category_id,
        difficulty,
        source,
        exam_type,
        status,
        import_batch_id,
        import_source,
        created_by,
        is_active
      ) VALUES (
        v_question->>'question_text',
        COALESCE(v_question->>'question_type', 'single_choice'),
        v_question->'answers',
        ARRAY(SELECT jsonb_array_elements_text(v_question->'correct_answer_ids')),
        v_question->>'explanation',
        v_question->>'legal_basis',
        COALESCE(v_question->>'legal_area', 'civil'),
        v_category_id,
        COALESCE((v_question->>'difficulty')::INTEGER, 5),
        v_question->>'source',
        v_question->>'exam_type',
        CASE WHEN p_auto_publish THEN 'published' ELSE 'draft' END,
        p_batch_id,
        'excel',
        p_created_by,
        p_auto_publish
      )
      RETURNING id INTO v_question_id;
      
      -- Historia
      INSERT INTO question_history (question_id, action, changed_by)
      VALUES (v_question_id, 'created', p_created_by);
      
      v_successful := v_successful + 1;
      
    EXCEPTION WHEN OTHERS THEN
      v_failed := v_failed + 1;
      v_errors := v_errors || jsonb_build_object('row', v_row, 'error', SQLERRM);
    END;
  END LOOP;
  
  -- Aktualizuj batch
  UPDATE import_batches SET
    successful = v_successful,
    failed = v_failed,
    duplicates = v_duplicates,
    error_log = v_errors,
    status = 'completed',
    completed_at = NOW()
  WHERE id = p_batch_id;
  
  RETURN jsonb_build_object(
    'successful', v_successful,
    'failed', v_failed,
    'duplicates', v_duplicates,
    'errors', v_errors
  );
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 11. WIDOK: Statystyki pytań
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
  COUNT(q.id) FILTER (WHERE q.embedding IS NOT NULL) as with_embedding
FROM categories c
LEFT JOIN questions q ON q.category_id = c.id
WHERE c.is_active = TRUE
GROUP BY c.id, c.name, c.legal_area
ORDER BY c.name;

-- ═══════════════════════════════════════════════════════════════
-- 12. RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

-- Import batches
ALTER TABLE import_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view batches"
  ON import_batches FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM admin_permissions WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can create batches"
  ON import_batches FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM admin_permissions WHERE user_id = auth.uid()
  ));

-- Question history
ALTER TABLE question_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view history"
  ON question_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM admin_permissions WHERE user_id = auth.uid()
  ));

CREATE POLICY "System can insert history"
  ON question_history FOR INSERT
  WITH CHECK (TRUE);

-- Content tags
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tags are public"
  ON content_tags FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage tags"
  ON content_tags FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_permissions WHERE user_id = auth.uid()
  ));

-- Question tags relation
ALTER TABLE question_tags_relation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tags relation public read"
  ON question_tags_relation FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage tags relation"
  ON question_tags_relation FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_permissions WHERE user_id = auth.uid()
  ));

-- ═══════════════════════════════════════════════════════════════
-- 13. DOMYŚLNE TAGI
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
-- ✅ GOTOWE!
-- ═══════════════════════════════════════════════════════════════

-- Sprawdź statystyki
SELECT * FROM question_stats_view;
