# Fixture'y iXBRL (PS3a)

Przycięte pliki z EDGAR z oryginalnymi znacznikami faktów (konsolidowane, tylko pojęcia z `src/lib/parser/ixbrl/concepts.ts`).
Pełne pliki nie są w repo (2,3 MB każdy); test na nich uruchamia się z `IXBRL_FULL_DIR`.

| Plik | Źródło | Oryginał (sha256) | Pobrano |
|---|---|---|---|
| `spacex-10q-q3-2026.htm` | Space Exploration Technologies Corp., 10-Q za okres do 30.09.2026, CIK 1181412, accession 0001628280-26-066880, złożony 22.10.2026 | `0b790160…` (2 366 623 B) | 07.11.2026 (plik od właściciela) |
| `cipher-10k-fy2025.htm` | Cipher Digital Inc., 10-K FY2025, CIK 1819989, accession 0001819989-26-000009, złożony 24.02.2026 | `8116bbe1…` (2 318 067 B) | 07.11.2026 (plik od właściciela) |

Generowanie: `npx vite-node --config vitest.config.ts scripts/make-ixbrl-fixture.ts <pełny.htm> tests/fixtures/ixbrl/<nazwa>.htm`.
Wartości w testach zgadzają się z komunikatami spółek i z API SEC (`data.sec.gov/api/xbrl/companyconcept`).
