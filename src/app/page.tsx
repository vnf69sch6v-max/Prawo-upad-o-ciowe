'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import {
  BookOpen, Brain, Target, TrendingUp, Shield, Zap,
  CheckCircle, ArrowRight, Sparkles, Scale, Trophy
} from 'lucide-react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Show nothing while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If logged in, don't render (will redirect)
  if (user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Scale size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                LexCapital
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Zaloguj się
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
              >
                Rozpocznij za darmo
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-pink-600/20 rounded-full blur-[128px]" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-sm text-purple-300 mb-8">
            <Sparkles size={16} />
            <span>Przygotuj się do egzaminu zawodowego</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Zdaj egzamin
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"> radcowski </span>
            za pierwszym razem
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Platforma z <strong className="text-white">959+ pytaniami egzaminacyjnymi</strong>,
            AI asystentem prawnym i inteligentnym systemem nauki.
            Wszystko czego potrzebujesz w jednym miejscu.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 group"
            >
              Rozpocznij za darmo
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
            >
              Mam już konto
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div>
              <p className="text-3xl font-bold text-white">959+</p>
              <p className="text-sm text-gray-500">Pytań</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">2</p>
              <p className="text-sm text-gray-500">Dziedziny prawa</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">AI</p>
              <p className="text-sm text-gray-500">Asystent 24/7</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Wszystko czego potrzebujesz
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Kompleksowa platforma do przygotowania się do egzaminu zawodowego
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                <Target size={24} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">959+ Pytań Egzaminacyjnych</h3>
              <p className="text-gray-400 text-sm">
                Kompleksowa baza pytań z KSH i Prawa Upadłościowego aktualizowana na bieżąco
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <Brain size={24} className="text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Asystent Prawny</h3>
              <p className="text-gray-400 text-sm">
                Zapytaj o dowolny przepis. AI zna cały KSH, Prawo Upadłościowe i KC
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                <BookOpen size={24} className="text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Inteligentne Fiszki</h3>
              <p className="text-gray-400 text-sm">
                System powtórek oparty o spaced repetition. Zapamiętaj na zawsze
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp size={24} className="text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Śledzenie Postępów</h3>
              <p className="text-gray-400 text-sm">
                Szczegółowa analityka twoich wyników. Wiedz dokładnie co jeszcze musisz powtórzyć
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-4">
                <Zap size={24} className="text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Symulacje Egzaminu</h3>
              <p className="text-gray-400 text-sm">
                Realistyczne warunki egzaminowe. Timer, losowe pytania, próg zaliczenia
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4">
                <Trophy size={24} className="text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Gamifikacja</h3>
              <p className="text-gray-400 text-sm">
                Streaki, rankingi, punkty. Motywacja do codziennej nauki
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Prosta, uczciwa cena
            </h2>
            <p className="text-gray-400">
              Jedna subskrypcja, pełny dostęp. Bez ukrytych opłat.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="p-8 bg-white/5 border border-white/10 rounded-2xl">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Free</h3>
                <p className="text-4xl font-bold">0 zł</p>
                <p className="text-gray-500 text-sm">na zawsze</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-400">
                  <CheckCircle size={18} className="text-gray-500" />
                  3 egzaminy próbne / miesiąc
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <CheckCircle size={18} className="text-gray-500" />
                  50 pytań z bazy KSH
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <CheckCircle size={18} className="text-gray-500" />
                  10 fiszek
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full py-3 text-center bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors"
              >
                Rozpocznij za darmo
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="p-8 bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-2 border-purple-500/50 rounded-2xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-full">
                NAJPOPULARNIEJSZY
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Pro</h3>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold">149 zł</p>
                  <p className="text-gray-400">/ rok</p>
                </div>
                <p className="text-purple-300 text-sm">tylko 12,42 zł / miesiąc</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-purple-400" />
                  <span><strong>Nieograniczone</strong> egzaminy</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-purple-400" />
                  <span><strong>959+</strong> pytań (KSH + Upadłościowe)</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-purple-400" />
                  <span><strong>AI Asystent</strong> bez limitu</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-purple-400" />
                  <span><strong>Nieograniczone</strong> fiszki</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-purple-400" />
                  <span>Pełna analityka postępów</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-purple-400" />
                  <span>Ranking & Leaderboard</span>
                </li>
              </ul>
              <Link
                href="/signup?plan=pro"
                className="block w-full py-3 text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                Wybierz Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Gotowy do nauki?
          </h2>
          <p className="text-gray-400 mb-10">
            Dołącz do prawników, którzy już przygotowują się z LexCapital
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all group"
          >
            Zacznij teraz
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale size={20} className="text-purple-400" />
            <span className="font-semibold">LexCapital</span>
          </div>
          <p className="text-sm text-gray-500">
            © 2026 LexCapital. Wszystkie prawa zastrzeżone.
          </p>
        </div>
      </footer>
    </div>
  );
}
