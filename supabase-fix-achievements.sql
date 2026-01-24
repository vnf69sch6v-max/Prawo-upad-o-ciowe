-- ═══════════════════════════════════════════════════════════════════════════
-- FIX: Usuń starą tabelę achievements i utwórz ponownie
-- Uruchom PRZED głównym SQL
-- ═══════════════════════════════════════════════════════════════════════════

-- Usuń zależne tabele/dane
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;

-- Teraz wklej resztę głównego SQL (supabase-adaptive-flashcards.sql)
-- i powinno działać poprawnie
