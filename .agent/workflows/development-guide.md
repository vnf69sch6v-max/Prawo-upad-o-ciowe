# 🎯 LexCapital - Master Development Guide

## Kontekst Projektu

**LexCapital Pro** - platforma edukacyjna do nauki prawa dla studentów przygotowujących się do egzaminów na aplikację radcowską/adwokacką.

### ✅ Zaimplementowane Funkcjonalności:

| Feature | Status | Uwagi |
|---------|--------|-------|
| Dashboard | ✅ Done | Real user data from Firebase |
| User Profile System | ✅ Done | Types, Firebase service, auth hook |
| Egzaminy KSH | ✅ Done | 650+ pytań, scoring, review |
| Sidebar Navigation | ✅ Done | Next.js Links |
| Leaderboard (UI) | ⚠️ Mock | Needs Firebase integration |
| Flashcards (UI) | ⚠️ Mock | Needs Firebase integration |
| AI Chat | ⚠️ Basic | Needs Claude API integration |
| Analytics | ⚠️ Placeholder | Needs real data |

### Stack Technologiczny (Aktualny):
- **Frontend**: Next.js 14+ z App Router
- **Styling**: Tailwind CSS (dark theme)
- **Backend**: Firebase Firestore
- **Auth**: Firebase Authentication
- **AI**: Claude API (Anthropic)

---

## 📊 Struktura Bazy Firestore

```
users/{uid}
├── email: string
├── displayName: string
├── photoURL?: string
├── createdAt: timestamp
├── updatedAt: timestamp
├── subscription: { plan, status, expiresAt? }
├── stats: {
│   ├── knowledgeEquity: number
│   ├── totalQuestions: number
│   ├── correctAnswers: number
│   ├── currentStreak: number
│   ├── longestStreak: number
│   ├── lastStudyDate?: timestamp
│   ├── totalStudyTime: number
│   ├── examsCompleted: number
│   ├── examsPassed: number
│   ├── bestExamScore: number
│   └── domainMastery: { [domain]: number }
│   }
└── preferences: { theme, language, dailyGoal, notifications }

examResults/{id}
├── uid: string
├── examId: string
├── examTitle: string
├── completedAt: timestamp
├── score: number
├── passed: boolean
├── correctAnswers: number
├── totalQuestions: number
├── timeSpent: number
└── questionResults?: [{ questionId, userAnswer, correctAnswer, isCorrect }]

activities/{id}
├── uid: string
├── type: 'exam_completed' | 'streak_milestone' | 'achievement' | ...
├── title: string
├── description: string
└── createdAt: timestamp

studySessions/{id}
├── uid: string
├── startedAt: timestamp
├── endedAt?: timestamp
├── type: 'flashcard' | 'exam' | 'practice'
├── questionsAnswered: number
└── correctAnswers: number

flashcards/{id}
├── uid: string
├── question: string
├── answer: string
├── category: string
├── difficulty: 'easy' | 'medium' | 'hard'
├── articleRef?: string
├── createdAt: timestamp
└── srsData?: { easinessFactor, interval, repetitions, nextReview }
```

---

## 🔧 Następne Do Zaimplementowania (Priority Order)

### Priority 1: Zapisywanie Wyników Egzaminów
```
Po ukończeniu egzaminu KSH:
- Zapisz wynik do examResults/{id}
- Zaktualizuj user stats (examsCompleted, correctAnswers, etc.)
- Dodaj activity (exam_completed)
- Zaktualizuj streak
```

### Priority 2: Leaderboard z Firebase
```
- GET leaderboard from users ordered by stats.knowledgeEquity
- Show rank, change from last week
- Highlight current user
```

### Priority 3: Flashcards z SRS
```
- Implement SM-2 algorithm
- Store progress in flashcards/{id}/srsData
- GET due cards (where nextReview <= now)
- POST review result -> calculate next interval
```

### Priority 4: Analytics Dashboard
```
- Aggregate data from studySessions, examResults
- Weekly activity chart
- Category progress
- Retention rate calculation
```

---

## 🎨 Design System Reference

```css
/* Colors */
--bg-primary: #0a0a0f;
--bg-secondary: #12121a;
--bg-card: #12121a;
--bg-hover: #1a1a24;
--bg-elevated: #1f1f2a;
--border-color: #2a2a3a;

--purple-500: #a855f7;
--pink-500: #ec4899;
--gradient: linear-gradient(to right, #a855f7, #ec4899);

--text-primary: #ffffff;
--text-secondary: #a1a1aa;
--text-muted: #71717a;

--success: #22c55e;
--warning: #f59e0b;
--error: #ef4444;
```

```typescript
// Common patterns
const cardStyle = "lex-card"; // bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6
const buttonPrimary = "bg-purple-600 hover:bg-purple-500 text-white rounded-xl px-4 py-2";
const buttonGradient = "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600";
```

---

## 📝 API Reference

### User Service (`src/lib/services/user-service.ts`)
```typescript
getUserProfile(uid: string): Promise<UserProfile | null>
createUserProfile(uid, email, displayName): Promise<UserProfile>
updateUserStats(uid, updates): Promise<void>
incrementUserStats(uid, increments): Promise<void>
saveExamResult(result): Promise<string>
getUserExamResults(uid, limit): Promise<ExamResult[]>
getLeaderboard(limit): Promise<LeaderboardEntry[]>
addActivity(activity): Promise<string>
getUserActivities(uid, limit): Promise<ActivityItem[]>
updateStreak(uid): Promise<number>
updateDomainMastery(uid, domain, correct, total): Promise<void>
```

---

## ✅ Checklist Przed Każdym PR

- [ ] TypeScript bez błędów (`npx tsc --noEmit`)
- [ ] Brak console.log (poza dev)
- [ ] Loading states dla async operations
- [ ] Error handling
- [ ] Mobile responsive
- [ ] Dark theme consistency
