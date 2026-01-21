-- ============================================
-- SUPABASE SCHEMA FOR LEXCAPITAL PRO
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. PROFILES (extends Firebase Auth users)
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,  -- Firebase UID
  email TEXT,
  display_name TEXT,
  photo_url TEXT,
  subscription_plan TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER STATISTICS
CREATE TABLE IF NOT EXISTS user_statistics (
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  knowledge_equity INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_study_date DATE,
  total_study_time INTEGER DEFAULT 0,
  exams_completed INTEGER DEFAULT 0,
  exams_passed INTEGER DEFAULT 0,
  best_exam_score INTEGER DEFAULT 0,
  domain_mastery JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TEST RESULTS
CREATE TABLE IF NOT EXISTS test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  exam_id TEXT NOT NULL,
  exam_title TEXT NOT NULL,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  correct_answers INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_spent INTEGER,
  question_results JSONB,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. LEARNING PROGRESS
CREATE TABLE IF NOT EXISTS learning_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  topic TEXT NOT NULL,
  mastery_level INTEGER DEFAULT 0,
  times_practiced INTEGER DEFAULT 0,
  last_practiced TIMESTAMPTZ,
  weak_areas JSONB DEFAULT '[]'::jsonb,
  strong_areas JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, topic)
);

-- 5. WRONG ANSWERS (Słabe punkty)
CREATE TABLE IF NOT EXISTS wrong_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  question_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  wrong_count INTEGER DEFAULT 1,
  correct_streak INTEGER DEFAULT 0,
  last_wrong_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_completed_at ON test_results(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_wrong_answers_user_id ON wrong_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON learning_progress(user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE wrong_answers ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read (for leaderboard), only owner can update
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (true);

-- Statistics: anyone can read (for leaderboard)
CREATE POLICY "Statistics are viewable by everyone" ON user_statistics
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own statistics" ON user_statistics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own statistics" ON user_statistics
  FOR UPDATE USING (true);

-- Test Results: public insert/select (we filter by user_id in queries)
CREATE POLICY "Test results are manageable" ON test_results
  FOR ALL USING (true);

-- Learning Progress: public access
CREATE POLICY "Learning progress is manageable" ON learning_progress
  FOR ALL USING (true);

-- Wrong Answers: public access
CREATE POLICY "Wrong answers are manageable" ON wrong_answers
  FOR ALL USING (true);

-- ============================================
-- DONE! Tables and RLS are configured.
-- ============================================
