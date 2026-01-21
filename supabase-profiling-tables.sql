-- ═══════════════════════════════════════════════════════
-- STUDENT PROFILING SYSTEM TABLES
-- Wklej w Supabase SQL Editor
-- ═══════════════════════════════════════════════════════

-- 1. STUDENT PROFILES
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  knowledge_map JSONB DEFAULT '{}',
  learning_style JSONB DEFAULT '{}',
  error_patterns JSONB DEFAULT '{}',
  engagement JSONB DEFAULT '{}',
  predictions JSONB DEFAULT '{}',
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LEARNING EVENTS
CREATE TABLE IF NOT EXISTS learning_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  question_id TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_student_profiles_user ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_events_user ON learning_events(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_events_type ON learning_events(event_type);
CREATE INDEX IF NOT EXISTS idx_learning_events_created ON learning_events(created_at);

-- RLS Policies
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_events ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users manage own profile" ON student_profiles FOR ALL USING (user_id = auth.uid()::text);
CREATE POLICY "Users manage own events" ON learning_events FOR ALL USING (user_id = auth.uid()::text);
