CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  photo_url TEXT,
  subscription_plan TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  learning_style TEXT DEFAULT 'visual',
  cognitive_style TEXT DEFAULT 'analytical',
  motivation_level INTEGER DEFAULT 5,
  preferred_session_length INTEGER DEFAULT 30,
  best_study_time TEXT DEFAULT 'morning',
  goals JSONB DEFAULT '[]'::jsonb,
  strengths JSONB DEFAULT '[]'::jsonb,
  weaknesses JSONB DEFAULT '[]'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_full_access" ON profiles;
DROP POLICY IF EXISTS "student_profiles_full_access" ON student_profiles;

CREATE POLICY "profiles_full_access" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "student_profiles_full_access" ON student_profiles FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE test_results DROP CONSTRAINT IF EXISTS test_results_user_id_fkey;
ALTER TABLE user_statistics DROP CONSTRAINT IF EXISTS user_statistics_user_id_fkey;
ALTER TABLE wrong_answers DROP CONSTRAINT IF EXISTS wrong_answers_user_id_fkey;
ALTER TABLE learning_progress DROP CONSTRAINT IF EXISTS learning_progress_user_id_fkey;
