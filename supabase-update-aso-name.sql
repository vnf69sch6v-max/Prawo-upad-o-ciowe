-- Update ASO deck name in Supabase
UPDATE flashcard_decks 
SET 
    name = 'Doradca ASO',
    description = 'Certyfikat Doradcy w Alternatywnym Systemie Obrotu - NewConnect i Catalyst',
    icon = '📊',
    legal_area = 'capital_markets'
WHERE slug = 'aso';
