-- ═══════════════════════════════════════════════════════════════════════════
-- FIX: Enable Mass Import (Unique Index + RLS)
-- Run this in Supabase SQL Editor BEFORE importing questions
-- ═══════════════════════════════════════════════════════════════════════════

-- STEP 1: Create unique constraint for upsert operations
CREATE UNIQUE INDEX IF NOT EXISTS flashcards_question_deck_unique
ON flashcards (deck_id, md5(question));

-- Alternative: simpler unique on question + deck_id
-- DROP INDEX IF EXISTS flashcards_question_deck_unique;
-- CREATE UNIQUE INDEX flashcards_question_deck_unique ON flashcards (deck_id, question);

-- STEP 2: Disable RLS on flashcard_decks and flashcards for import
ALTER TABLE flashcard_decks DISABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards DISABLE ROW LEVEL SECURITY;

-- STEP 3: Grant permissions for anonymous/service role
GRANT ALL ON flashcard_decks TO anon, authenticated, service_role;
GRANT ALL ON flashcards TO anon, authenticated, service_role;

-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ After running this, reload the app and sync will work
-- ═══════════════════════════════════════════════════════════════════════════
