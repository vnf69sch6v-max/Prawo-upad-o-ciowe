-- ═══════════════════════════════════════════════════════
-- NAPRAWKA RLS - Uruchom w Supabase SQL Editor
-- ═══════════════════════════════════════════════════════

-- 1. Włącz RLS na tabelach gdzie jest wyłączony
ALTER TABLE flashcard_srs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE explanation_cache ENABLE ROW LEVEL SECURITY;

-- 2. Usuń stare zbyt permisywne polityki (jeśli istnieją)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

DROP POLICY IF EXISTS "learning_progress_policy" ON learning_progress;
DROP POLICY IF EXISTS "test_results_policy" ON test_results;
DROP POLICY IF EXISTS "user_statistics_policy" ON user_statistics;
DROP POLICY IF EXISTS "wrong_answers_policy" ON wrong_answers;

-- 3. Utwórz prawidłowe polityki dla flashcard_srs
DROP POLICY IF EXISTS "Users manage own SRS" ON flashcard_srs;
CREATE POLICY "flashcard_srs_select" ON flashcard_srs FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "flashcard_srs_insert" ON flashcard_srs FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "flashcard_srs_update" ON flashcard_srs FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "flashcard_srs_delete" ON flashcard_srs FOR DELETE USING (user_id = auth.uid()::text);

-- 4. Utwórz prawidłowe polityki dla user_mastery
DROP POLICY IF EXISTS "Users manage own mastery" ON user_mastery;
CREATE POLICY "user_mastery_select" ON user_mastery FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "user_mastery_insert" ON user_mastery FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "user_mastery_update" ON user_mastery FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "user_mastery_delete" ON user_mastery FOR DELETE USING (user_id = auth.uid()::text);

-- 5. Explanation cache - publiczny odczyt, tylko INSERT przez auth
CREATE POLICY "explanation_cache_select" ON explanation_cache FOR SELECT USING (true);
CREATE POLICY "explanation_cache_insert" ON explanation_cache FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 6. Napraw profiles
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (id = auth.uid()::text);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (id = auth.uid()::text);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (id = auth.uid()::text);

-- 7. Napraw learning_progress
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "learning_progress_select" ON learning_progress FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "learning_progress_insert" ON learning_progress FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "learning_progress_update" ON learning_progress FOR UPDATE USING (user_id = auth.uid()::text);

-- 8. Napraw test_results
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "test_results_select" ON test_results FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "test_results_insert" ON test_results FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- 9. Napraw user_statistics
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_statistics_select" ON user_statistics FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "user_statistics_insert" ON user_statistics FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "user_statistics_update" ON user_statistics FOR UPDATE USING (user_id = auth.uid()::text);

-- 10. Napraw wrong_answers
ALTER TABLE wrong_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wrong_answers_select" ON wrong_answers FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "wrong_answers_insert" ON wrong_answers FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "wrong_answers_delete" ON wrong_answers FOR DELETE USING (user_id = auth.uid()::text);
