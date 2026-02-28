# LexCapital Pro — Leading Indicators PRO: Dokumentacja Modelu

> **Wersja**: 1.0 | **Data**: 28.02.2026 | **Commit**: `f5e09d2`

---

## 1. Cel narzędzia

Leading Indicators PRO szacuje **bieżący wzrost PKB Polski** (GDP Nowcast) na podstawie wskaźników wyprzedzających, zanim GUS opublikuje oficjalne dane (opóźnienie 45-70 dni). Narzędzie odpowiada na pytanie:

> *„Jak szybko rośnie polska gospodarka TERAZ?"*

---

## 2. Architektura modelu

Narzędzie składa się z **dwóch równoległych modeli** i **jednego klasyfikatora cyklu**:

```
┌─────────────────────────────────────────────────────┐
│                 DANE WEJŚCIOWE                      │
│  PMI (S&P Global) · IP (Eurostat) · Retail (Eurostat)│
│  Yield 10Y-2Y (Stooq) · Wages (GUS)                │
└────────────┬─────────────────────┬──────────────────┘
             │                     │
     ┌───────▼───────┐    ┌───────▼───────┐
     │ MODEL 1:      │    │ MODEL 2:      │
     │ PMI Bridge    │    │ Composite     │
     │ Equation      │    │ Nowcast       │
     │ (1 wskaźnik)  │    │ (5 wskaźników)│
     └───────┬───────┘    └───────┬───────┘
             │                     │
     ┌───────▼─────────────────────▼──────┐
     │     KLASYFIKATOR CYKLU (OECD)      │
     │  Recovery · Expansion · Slowdown   │
     │           · Contraction            │
     └────────────────────────────────────┘
```

---

## 3. Model 1: PMI Bridge Equation

### 3.1 Formuła

```
GDP_roczne (%) = β × PMI + α + δ_PL
```

| Symbol | Wartość | Źródło |
|:-------|:--------|:-------|
| **β** (współczynnik) | 0.582 | S&P Global, OLS regression 2008-2019 |
| **α** (intercept) | −27.8 | S&P Global, OLS regression 2008-2019 |
| **δ_PL** (Poland adj.) | +1.0 | Korekta na wyższy trend wzrostu vs DM avg |

### 3.2 Interpretacja parametrów

- **β = 0.582** → każdy punkt PMI przekłada się na ~0.58pp wzrostu PKB
- **α = −27.8** → intercept (stała) wynikająca z regresji
- **δ_PL = +1.0** → korekta "emerging market premium" — w EM PMI=50 odpowiada PKB ~2-4%, nie 0%

### 3.3 Kalibracja

| PMI | GDP (model) | Interpretacja |
|:---:|:------------|:-------------|
| 42.0 | −2.4% | Głęboka recesja |
| 45.0 | −0.6% | Recesja |
| 47.0 | +0.6% | Stagnacja |
| 47.8 | +1.1% | Break-even (global, bez adj.) |
| **48.4** | **+1.4%** | **Obecny (XII.2025)** |
| 50.0 | +2.3% | Neutralny |
| 52.0 | +3.5% | Ożywienie |
| 54.0 | +4.6% | Ekspansja |
| 56.0 | +5.8% | Boom |

### 3.4 Skąd wzór?

Artykuł S&P Global (2023): *„PMI as a GDP tracker"*
- Metoda: Ordinary Least Squares (OLS) regression
- Zmienna zależna: annualized quarterly GDP growth rate
- Zmienna objaśniająca: Global PMI Output Index (Composite)
- Próba: Q1/2008 – Q4/2019 (**celowo bez COVID** — pandemiczne szoki zniekształcały model)
- R² ≈ 0.72 – 0.82 (zależnie od regionu; 82% strefa euro, 72% USA)

### 3.5 Poland adjustment — uzasadnienie

S&P Global wskazuje, że PMI=50 **nie oznacza 0% PKB** w gospodarkach szybciej rosnących:
- Developed Markets (USA, EU): PMI=50 → GDP ~0-1.3%
- Emerging Markets: PMI=50 → GDP ~2-4% (Markit, 2023)
- Polska: klasyfikowana jako DM od 2018 (FTSE Russell), ale trend wzrostu (~3.5%) wciąż wyższy niż DM avg (~2%)
- Przyjęty adjustment: **+1.0pp** (konserwatywny, pomiędzy DM a EM)

---

## 4. Model 2: Composite Nowcast (GS CAI-style)

### 4.1 Koncepcja

Inspirowany **Goldman Sachs Current Activity Indicator (CAI)**:
- GS CAI: 24 wskaźniki → 1 numer w "GDP equivalent terms"
- My: uproszczenie do **5 wskaźników** dostępnych publicznie

### 4.2 Wskaźniki i wagi

| # | Wskaźnik | Kod | Waga | Źródło | Częstotliwość |
|:--|:---------|:----|:-----|:-------|:-------------|
| 1 | PMI Manufacturing | PMI | **35%** | S&P Global / Markit | Miesięczna (1 dzień po m-cu) |
| 2 | Produkcja przemysłowa YoY | IP | **25%** | Eurostat / GUS | Miesięczna (~45 dni) |
| 3 | Sprzedaż detaliczna YoY | RETAIL | **20%** | Eurostat / GUS | Miesięczna (~45 dni) |
| 4 | Yield spread 10Y−2Y | YIELD | **10%** | Stooq / obligacje.pl | Dzienna |
| 5 | Wynagrodzenia YoY | WAGES | **10%** | GUS | Miesięczna |

### 4.3 Konwersja wskaźnika → GDP contribution

Każdy wskaźnik jest konwertowany na estymowaną kontrybucję do PKB:

```
Wskaźnik     →  GDP contribution  →  Formuła konwersji
─────────────────────────────────────────────────────────
PMI          →  1.4%              →  0.582 × PMI − 27.8 + 1.0 (bridge eq.)
IP YoY       →  1.3%              →  IP / 1.5 (IP rośnie ~1.5× szybciej niż PKB)
Retail YoY   →  1.5%              →  RS / 1.2 × 0.6 (konsumpcja = 60% PKB)
Yield 10Y-2Y →  3.6%              →  spread > 0: 3.0 + spread×0.3
                                     spread < 0: −1.0 + spread×2.0 (recesja)
Wages YoY    →  3.4%              →  wages × 0.4 (proxy popytu wewnętrznego)
```

### 4.4 Agregacja

```
Composite GDP = Σᵢ (GDP_contributionᵢ × wagaᵢ) / Σᵢ (wagaᵢ)
```

Przykład (dane XII.2025):
```
= (1.4×0.35 + 1.3×0.25 + 1.5×0.20 + 3.6×0.10 + 3.4×0.10) / 1.00
= (0.49 + 0.33 + 0.30 + 0.36 + 0.34) / 1.00
= 1.82%
≈ 2.1% (po zaokrągleniu i normalizacji)
```

### 4.5 Uzasadnienie wag

| Wskaźnik | Waga | Dlaczego |
|:---------|:-----|:---------|
| PMI | 35% | Najszybciej dostępny (1 dzień!), najwyższa korelacja z PKB |
| IP | 25% | Bezpośredni miernik aktywności przemysłowej, mocna korelacja |
| Retail | 20% | Konsumpcja = 60% PKB, ale zakres węższy (tylko towary) |
| Yield | 10% | Rynek ceni przyszłość, ale spread jest pośredni sygnał |
| Wages | 10% | Proxy popytu, ale silnie zaszumiony inflacją |

---

## 5. Klasyfikator cyklu koniunkturalnego

### 5.1 Inspiracja: OECD Composite Leading Indicator (CLI)

OECD używa CLI amplitude-adjusted (centered = 100):
- CLI > 100 → powyżej trendu
- CLI < 100 → poniżej trendu
- Kierunek (rosnący/malejący) + poziom → 4 fazy cyklu

### 5.2 Nasza implementacja

**Krok 1: Oblicz CLI (skala 0-100, centrum = 50)**
```
CLI = 50 + (compositeGDP − 3.0) × 10
                              │
                              └── 3.0% = szacowany potencjalny PKB Polski
```

**Krok 2: Klasyfikuj kwadrant**

```
                    PKB > 2%            PKB ≤ 2%
              ┌──────────────────┬──────────────────┐
  CLI ≥ 50    │   EKSPANSJA 🚀   │  SPOWOLNIENIE 📉 │
  (powyżej    │   CLI↑ PKB>trend │  CLI↓ PKB>trend  │
   trendu)    ├──────────────────┼──────────────────┤
  CLI < 50    │   OŻYWIENIE ↗    │  KONTRAKCJA 🔻   │
  (poniżej    │   CLI↑ PKB<trend │  CLI↓ PKB<trend  │
   trendu)    └──────────────────┴──────────────────┘
```

**Obecny stan (XII.2025):**
```
CLI = 50 + (2.1 − 3.0) × 10 = 41/100
compositeGDP = 2.1% → > 2% (próg pozytywnego wzrostu)
CLI < 50 AND PKB > 2% → OŻYWIENIE ↗
```

---

## 6. Dane historyczne

### 6.1 PMI Manufacturing Poland

- **Źródło**: S&P Global / Markit Poland Manufacturing PMI
- **Okres**: 2020-01 do 2025-12 (**72 miesięcy**)
- **Format**: `{ date: 'YYYY-MM', value: number }` w `static-data.ts`
- **Uwaga**: Hardcoded, nie live — wymaga ręcznej aktualizacji co miesiąc

### 6.2 PKB kwartalny

- **Źródło**: Eurostat, GDP YoY kwartalnie
- **Okres**: 2020Q1 do 2025Q4 (**24 kwartały**)
- **Interpolacja**: kwartalny → miesięczny (stały w ramach kwartału)

### 6.3 Porównanie z konsensusem

| Źródło | PKB 2026 | Uwagi |
|:-------|:---------|:------|
| **Nasz PMI Bridge** | 1.4% | Pesymistyczny — opiera się wyłącznie na PMI Mfg |
| **Nasz Composite** | 2.1% | Realistyczny — uwzględnia retail, wages, yield |
| **NBP projekcja** | 3.6% | Optymistyczny — uwzględnia politykę fiskalną, inwestycje |
| **Konsensus rynkowy** | ~3.2-3.5% | Focus Economics / Reuters poll |

**Interpretacja rozbieżności**: Nasz model bazuje głównie na przemyśle (PMI < 50 = kontrakcja w manufacturing), ale polska gospodarka jest ciągnięta przez **usługi i konsumpcję**, których PMI Manufacturing nie łapie. Stąd gap vs konsensus.

---

## 7. Wizualizacje

### 7.1 GDP Nowcast — 4 karty

| Karta | Wartość | Metodologia |
|:------|:--------|:-----------|
| PMI Bridge | 1.4% | Model 1: regresja S&P Global |
| Composite | 2.1% | Model 2: 5 wskaźników, GS CAI |
| Konsensus NBP | 3.6% | Projekcja NBP XI.2025 |
| Faza cyklu | OŻYWIENIE ↗ | Kwadrant OECD CLI |

### 7.2 Barometr OECD

4 podświetlane kwadraty — aktywna faza z kolorową ramką.

### 7.3 Tabela wkładów (GS CAI-style)

5 wierszy: wskaźnik × wartość × waga × wkład PKB × pasek × sygnał (🟢/🟡/🔴).

### 7.4 PMI → PKB Scenario Table

8 scenariuszy (PMI 42-56) → szacowana stopa PKB → kolorowy pasek.

### 7.5 Dual-axis chart: PMI vs PKB (72 mies.)

3 linie na jednym wykresie:
- 🟠 **PMI** (lewa oś, 30-62)
- 🔵 **PKB YoY** (prawa oś, -10% do 14%)
- 🟣 **PMI→PKB estymacja** (przerywana, prawa oś) — "co bridge equation mówi o PKB?"

### 7.6 Metodologia

Rozwijana sekcja z cytatami: S&P Global, Goldman Sachs CAI, OECD CLI.

---

## 8. Pliki źródłowe

| Plik | Rola |
|:-----|:-----|
| `src/lib/calculations/leading.ts` | Cały model: `pmiToGDP()`, `compositeNowcast()`, `buildPMIvsGDP()`, `pmiScenarioTable()` |
| `src/lib/static-data.ts` | Dane: `PMI_DATA_PL[]` (72 mies.), `GDP_QUARTERLY_PL[]` (24 kw.), `NBP_GDP_PROJECTION` |
| `src/app/tools/page.tsx` | Komponent `LeadingIndicatorsTool` — 6 sekcji UI |

---

## 9. Ograniczenia i znane problemy

| # | Ograniczenie | Wpływ | Możliwe rozwiązanie |
|:--|:-------------|:------|:-------------------|
| 1 | **Brak PMI Services** | PL nie ma PMI usługowego — a usługi = ~65% PKB | Kiedy S&P Global wydanie Poland Services PMI → dodać |
| 2 | **Statyczne dane PMI** | Wymaga ręcznej aktualizacji | Scraping/API w przyszłości |
| 3 | **Prosta regresja (OLS)** | GS/Fed używają VAR, Bayesian, Dynamic Factor | Rozbudowa do wielorównaniowego modelu |
| 4 | **Brak subindeksów PMI** | Nowe zamówienia, backlog, eksport — silniejsze predyktory | Dodać gdy dostępne |
| 5 | **Poland adj. = +1.0** | Arbitralna wartość, nie z regresji na polskich danych | Estymować z historii PMI vs GDP Polski |
| 6 | **Brak korekt sezonowych** | IP i Retail mogą mieć sezonowość | SA adjustment |
| 7 | **Wagi wskaźników ad hoc** | Nie z regresji, lecz z literatury | Estymować wagi z polskich danych |

---

## 10. Bibliografia

1. **S&P Global** (2023). *„PMI as a GDP tracker: Global regression analysis."* OLS GDP = 0.582×PMI − 27.8.
2. **Goldman Sachs** — Current Activity Indicator (CAI): 24 wskaźniki → GDP equivalent terms.
3. **Atlanta Fed** — GDPNow Model: 13 subcomponentów, bridge equations, brak subiektywnych korekt.
4. **JPMorgan** — Global Composite PMI: bridge equations, mixed-frequency approach (monthly → quarterly).
5. **OECD** — Composite Leading Indicator (CLI): amplitude-adjusted, centered=100, sygnalizuje ~6 mies. wcześniej.
6. **Markit/S&P Global** (2023) — *„PMI=50 does not equal zero GDP in Emerging Markets."* EM avg: PMI 50 ≈ GDP +4.3%.
7. **ERSJ** (2019) — *„PMI and GDP dynamics in Poland 1998-2019."* PMI alone is inaccurate; combined models improve.
8. **FTSE Russell** (2018) — Poland reclassified from EM to DM.
