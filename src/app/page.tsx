'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import {
  BookOpen, Brain, Target, TrendingUp, Shield, Zap,
  CheckCircle, ArrowRight, GraduationCap, Scale, Award
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
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="w-8 h-8 border-2 border-[#1a365d] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If logged in, don't render (will redirect)
  if (user) return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Scale size={28} className="text-[#1a365d]" />
              <span className="text-xl font-serif font-bold text-[#1a365d]">
                Savori Legal
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm">
              <a href="#features" className="text-gray-600 hover:text-[#1a365d] transition-colors">Funkcje</a>
              <a href="#pricing" className="text-gray-600 hover:text-[#1a365d] transition-colors">Cennik</a>
              <a href="#about" className="text-gray-600 hover:text-[#1a365d] transition-colors">O nas</a>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-[#1a365d] hover:text-[#2c5282] transition-colors"
              >
                Zaloguj się
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 bg-[#1a365d] text-white text-sm font-medium rounded-lg hover:bg-[#2c5282] transition-colors"
              >
                Rozpocznij
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a365d]/5 border border-[#1a365d]/10 rounded-full text-sm text-[#1a365d] mb-8 animate-fade-in-up">
            <GraduationCap size={16} />
            <span>Platforma do nauki prawa</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#1a365d] leading-tight mb-6 animate-fade-in-up delay-100">
            Opanuj egzaminy prawnicze.
            <br />
            <span className="text-[#b8860b]">Zdaj za pierwszym razem.</span>
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
            Kompleksowa platforma z <strong>959+ pytaniami egzaminacyjnymi</strong>,
            inteligentnym AI asystentem i systemem powtórek.
            Wszystko, czego potrzebujesz do egzaminu radcowskiego i adwokackiego.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up delay-300">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-[#1a365d] text-white font-medium rounded-lg hover:bg-[#2c5282] transition-all flex items-center justify-center gap-2 group hover-lift"
            >
              Rozpocznij za darmo
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#pricing"
              className="w-full sm:w-auto px-8 py-4 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:border-[#1a365d] hover:text-[#1a365d] transition-all hover-lift"
            >
              Zobacz cennik
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in-up delay-400">
            <div>
              <p className="text-3xl font-serif font-bold text-[#1a365d]">959+</p>
              <p className="text-sm text-gray-500">pytań</p>
            </div>
            <div>
              <p className="text-3xl font-serif font-bold text-[#1a365d]">2</p>
              <p className="text-sm text-gray-500">dziedziny prawa</p>
            </div>
            <div>
              <p className="text-3xl font-serif font-bold text-[#1a365d]">AI</p>
              <p className="text-sm text-gray-500">asystent 24/7</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold text-[#1a365d] mb-4">
              Wszystko w jednym miejscu
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Narzędzia zaprojektowane z myślą o efektywnej nauce prawa
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 bg-[#FAFAFA] rounded-xl hover-lift hover-glow">
              <div className="w-12 h-12 bg-[#1a365d]/10 rounded-lg flex items-center justify-center mb-4">
                <Target size={24} className="text-[#1a365d]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Baza pytań egzaminacyjnych</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                959+ pytań z KSH i Prawa Upadłościowego. Aktualizowana baza zgodna z wymaganiami egzaminów zawodowych.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-[#FAFAFA] rounded-xl hover-lift hover-glow">
              <div className="w-12 h-12 bg-[#1a365d]/10 rounded-lg flex items-center justify-center mb-4">
                <Brain size={24} className="text-[#1a365d]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Asystent prawny</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Zapytaj o dowolny przepis. AI zna cały KSH, Prawo Upadłościowe i Kodeks Cywilny.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-[#FAFAFA] rounded-xl hover-lift hover-glow">
              <div className="w-12 h-12 bg-[#1a365d]/10 rounded-lg flex items-center justify-center mb-4">
                <BookOpen size={24} className="text-[#1a365d]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Inteligentne fiszki</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                System powtórek oparty o spaced repetition. Zapamiętaj przepisy na zawsze.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-[#FAFAFA] rounded-xl hover-lift hover-glow">
              <div className="w-12 h-12 bg-[#1a365d]/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp size={24} className="text-[#1a365d]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analityka postępów</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Śledź swoje wyniki i wiedz dokładnie, które obszary wymagają powtórki.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 bg-[#FAFAFA] rounded-xl hover-lift hover-glow">
              <div className="w-12 h-12 bg-[#1a365d]/10 rounded-lg flex items-center justify-center mb-4">
                <Zap size={24} className="text-[#1a365d]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Symulacje egzaminów</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Realistyczne warunki egzaminowe. Timer, losowe pytania, próg zaliczenia.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 bg-[#FAFAFA] rounded-xl hover-lift hover-glow">
              <div className="w-12 h-12 bg-[#1a365d]/10 rounded-lg flex items-center justify-center mb-4">
                <Award size={24} className="text-[#1a365d]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gamifikacja</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Streaki, rankingi i punkty. Motywacja do codziennej nauki.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold text-[#1a365d] mb-4">
              Prosta, uczciwa cena
            </h2>
            <p className="text-gray-600">
              Jedna subskrypcja, pełny dostęp. Bez ukrytych opłat.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="p-8 bg-white border border-gray-200 rounded-2xl">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Free</h3>
                <p className="text-4xl font-serif font-bold text-[#1a365d]">0 zł</p>
                <p className="text-gray-500 text-sm">na zawsze</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-600">
                  <CheckCircle size={18} className="text-gray-400" />
                  3 egzaminy próbne / miesiąc
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <CheckCircle size={18} className="text-gray-400" />
                  50 pytań z bazy KSH
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <CheckCircle size={18} className="text-gray-400" />
                  10 fiszek
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full py-3 text-center bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Rozpocznij za darmo
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="p-8 bg-[#1a365d] rounded-2xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#b8860b] text-white text-xs font-semibold rounded-full">
                NAJPOPULARNIEJSZY
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Pro</h3>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-serif font-bold text-white">149 zł</p>
                  <p className="text-gray-300">/ rok</p>
                </div>
                <p className="text-[#b8860b] text-sm">tylko 12,42 zł / miesiąc</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-white">
                  <CheckCircle size={18} className="text-[#b8860b]" />
                  <span><strong>Nieograniczone</strong> egzaminy</span>
                </li>
                <li className="flex items-center gap-3 text-white">
                  <CheckCircle size={18} className="text-[#b8860b]" />
                  <span><strong>959+</strong> pytań</span>
                </li>
                <li className="flex items-center gap-3 text-white">
                  <CheckCircle size={18} className="text-[#b8860b]" />
                  <span><strong>AI Asystent</strong> bez limitu</span>
                </li>
                <li className="flex items-center gap-3 text-white">
                  <CheckCircle size={18} className="text-[#b8860b]" />
                  <span><strong>Nieograniczone</strong> fiszki</span>
                </li>
                <li className="flex items-center gap-3 text-white">
                  <CheckCircle size={18} className="text-[#b8860b]" />
                  Pełna analityka postępów
                </li>
                <li className="flex items-center gap-3 text-white">
                  <CheckCircle size={18} className="text-[#b8860b]" />
                  Ranking & Leaderboard
                </li>
              </ul>
              <Link
                href="/signup?plan=pro"
                className="block w-full py-3 text-center bg-[#b8860b] text-white font-semibold rounded-lg hover:bg-[#9a7209] transition-colors"
              >
                Wybierz Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 px-6 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="text-2xl font-serif text-[#1a365d] italic leading-relaxed mb-8">
            "Dzięki Savori Legal zdałem egzamin radcowski za pierwszym podejściem.
            Systematyczna nauka i AI asystent zrobiły ogromną różnicę."
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 bg-[#1a365d] rounded-full flex items-center justify-center text-white font-semibold">
              MK
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Michał Kowalski</p>
              <p className="text-sm text-gray-500">Radca prawny, Warszawa</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="about" className="py-20 px-6 bg-[#1a365d]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-serif font-bold text-white mb-6">
            Gotowy do nauki?
          </h2>
          <p className="text-gray-300 mb-10 leading-relaxed">
            Dołącz do prawników, którzy przygotowują się do egzaminu z Savori Legal.
            Zacznij już dziś i zbuduj swoją wiedzę krok po kroku.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#1a365d] font-semibold rounded-lg hover:bg-gray-100 transition-all group"
          >
            Zacznij za darmo
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Scale size={24} className="text-[#1a365d]" />
              <span className="font-serif font-bold text-[#1a365d]">Savori Legal</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-500">
              <a href="#" className="hover:text-[#1a365d] transition-colors">Regulamin</a>
              <a href="#" className="hover:text-[#1a365d] transition-colors">Polityka prywatności</a>
              <a href="#" className="hover:text-[#1a365d] transition-colors">Kontakt</a>
            </div>
            <p className="text-sm text-gray-400">
              © 2026 Savori Legal. Wszystkie prawa zastrzeżone.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
