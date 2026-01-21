/**
 * Feedback Styler
 * Generates personalized feedback based on student profile
 */

import type { StudentProfile, ErrorType } from './types';

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════

export interface QuestionResult {
    questionId: string;
    topic: string;
    subtopic?: string;
    correct: boolean;
    selectedAnswer: string;
    correctAnswer: string;
    errorType?: ErrorType;
    timeToAnswer: number;
    normalizedTime: number;
    difficulty: number;
    sessionStreak: number;
}

export interface PersonalizedFeedback {
    immediate: string;
    explanation?: StyledExplanation;
    encouragement: string[];
    nextSteps: NextStep[];
}

export interface StyledExplanation {
    main: string;
    details?: string;
    legalBasis?: string;
    steps?: string[];
    diagram?: string;
}

export interface NextStep {
    action: string;
    text: string;
    priority: 'high' | 'medium' | 'low';
}

// ═══════════════════════════════════════════════════════
// FEEDBACK STYLER
// ═══════════════════════════════════════════════════════

export class FeedbackStyler {
    private profile: StudentProfile;

    constructor(profile: StudentProfile) {
        this.profile = profile;
    }

    /**
     * Generate personalized feedback for a question result
     */
    generateFeedback(
        result: QuestionResult,
        explanation?: string
    ): PersonalizedFeedback {
        return {
            immediate: this.generateImmediateFeedback(result),
            explanation: explanation ? this.styleExplanation(explanation, result) : undefined,
            encouragement: this.generateEncouragement(result),
            nextSteps: this.suggestNextSteps(result)
        };
    }

    /**
     * Generate immediate feedback message
     */
    private generateImmediateFeedback(result: QuestionResult): string {
        const engagement = this.profile.engagement;

        // Base message
        let message = result.correct ? '✅ Poprawnie!' : '❌ Niepoprawnie';

        if (result.correct) {
            // Show mastery if user is motivated by it
            if (engagement.motivators.mastery > 0.7) {
                const mastery = this.profile.knowledgeMap[result.topic]?.mastery || 0;
                message += ` Poziom opanowania: ${mastery.toFixed(0)}%`;
            }

            // Show streak if user likes it
            if (engagement.motivators.streaks > 0.7 && result.sessionStreak > 1) {
                message += ` (${result.sessionStreak} z rzędu!)`;
            }

            // Note if it was a hard question
            if (result.difficulty >= 8) {
                message += ' 💪 Trudne pytanie!';
            }

            // Note if answered quickly
            if (result.normalizedTime < 0.5) {
                message += ' ⚡ Szybko!';
            }
        } else {
            // Add context for error
            switch (result.errorType) {
                case 'careless':
                    message += ' To był błąd nieuważności - sprawdź dokładniej.';
                    break;
                case 'confusion':
                    message += ' Pomyliłeś to z podobnym pojęciem.';
                    break;
                case 'knowledge_gap':
                    message += ' Ten temat wymaga głębszej nauki.';
                    break;
                case 'partial':
                    message += ' Masz częściową wiedzę - uzupełnij braki.';
                    break;
                default:
                    message += ' Przeczytaj wyjaśnienie.';
            }
        }

        return message;
    }

    /**
     * Style explanation based on learning style
     */
    private styleExplanation(
        explanation: string,
        result: QuestionResult
    ): StyledExplanation {
        const style = this.profile.learningStyle.cognitiveStyle;

        // Base explanation
        const styled: StyledExplanation = {
            main: explanation
        };

        // For analytical learners - add more details
        if (style.analyticalVsIntuitive > 0.5) {
            styled.details = '📚 Zobacz szczegóły...';
            styled.legalBasis = '📜 Podstawa prawna...';
        }

        // For sequential learners - break into steps
        if (style.sequentialVsGlobal < -0.3) {
            styled.steps = [
                'Krok 1: Zidentyfikuj kluczowe pojęcie',
                'Krok 2: Przeanalizuj odpowiedzi',
                'Krok 3: Wyeliminuj błędne opcje',
                'Krok 4: Wybierz poprawną odpowiedź'
            ];
        }

        return styled;
    }

    /**
     * Generate encouragement messages
     */
    private generateEncouragement(result: QuestionResult): string[] {
        const encouragements: string[] = [];
        const predictions = this.profile.predictions;
        const topicData = this.profile.knowledgeMap[result.topic];

        if (result.correct) {
            // Positive reinforcement
            if (result.difficulty >= 8) {
                encouragements.push('💪 Świetna robota z trudnym pytaniem!');
            }

            if (topicData && topicData.trend === 'improving') {
                encouragements.push(`📈 Twój wynik w "${result.topic}" rośnie!`);
            }

            if (result.sessionStreak >= 5) {
                encouragements.push(`🔥 Super seria ${result.sessionStreak} poprawnych!`);
            }
        } else {
            // Constructive support
            encouragements.push('💡 Każdy błąd to szansa na naukę');

            if (!topicData || topicData.totalAttempts < 3) {
                encouragements.push('📖 To nowy temat - normalne, że wymaga czasu');
            }

            // Show progress despite error
            if (predictions.passProbability > 0.6) {
                encouragements.push(
                    `📊 Wciąż na dobrej drodze (${(predictions.passProbability * 100).toFixed(0)}% szans na zdanie)`
                );
            }
        }

        return encouragements.slice(0, 3);
    }

    /**
     * Suggest next steps
     */
    private suggestNextSteps(result: QuestionResult): NextStep[] {
        const suggestions: NextStep[] = [];

        if (!result.correct) {
            // After error
            suggestions.push({
                action: 'review_explanation',
                text: 'Przeczytaj wyjaśnienie',
                priority: 'high'
            });

            // If confusion pair exists
            const hasConfusion = this.profile.errorPatterns.confusionPairs.some(p =>
                p.concept1 === result.correctAnswer || p.concept2 === result.correctAnswer
            );

            if (hasConfusion) {
                suggestions.push({
                    action: 'comparison_exercise',
                    text: 'Ćwiczenie porównawcze',
                    priority: 'high'
                });
            }

            suggestions.push({
                action: 'practice_similar',
                text: 'Przećwicz podobne pytanie',
                priority: 'medium'
            });
        } else {
            // After correct
            if (result.normalizedTime > 1.5) {
                suggestions.push({
                    action: 'speed_drill',
                    text: 'Przećwicz na szybkość',
                    priority: 'low'
                });
            }

            const topicMastery = this.profile.knowledgeMap[result.topic]?.mastery || 0;
            if (topicMastery > 80) {
                suggestions.push({
                    action: 'advanced_topic',
                    text: 'Przejdź do zaawansowanego tematu',
                    priority: 'medium'
                });
            }
        }

        return suggestions;
    }

    /**
     * Get motivation boost message
     */
    getMotivationBoost(): string | null {
        const engagement = this.profile.engagement;

        if (engagement.currentStreak >= 7) {
            return `🔥 ${engagement.currentStreak} dni nauki z rzędu! Tak trzymaj!`;
        }

        if (engagement.motivationTrend === 'down') {
            return '💪 Pamiętaj - regularna nauka to klucz do sukcesu!';
        }

        const passProbability = this.profile.predictions.passProbability;
        if (passProbability > 0.8) {
            return '🎯 Jesteś świetnie przygotowany! Utrzymaj ten poziom.';
        }

        return null;
    }

    /**
     * Get session summary feedback
     */
    getSessionSummary(
        questionsAnswered: number,
        correctCount: number,
        topicsStudied: string[]
    ): string {
        const correctRate = questionsAnswered > 0
            ? Math.round((correctCount / questionsAnswered) * 100)
            : 0;

        let summary = `📊 Sesja zakończona!\n\n`;
        summary += `• Pytań: ${questionsAnswered}\n`;
        summary += `• Poprawnych: ${correctCount} (${correctRate}%)\n`;
        summary += `• Tematy: ${topicsStudied.slice(0, 3).join(', ')}`;

        if (correctRate >= 80) {
            summary += '\n\n🌟 Świetny wynik!';
        } else if (correctRate >= 60) {
            summary += '\n\n👍 Dobra robota!';
        } else {
            summary += '\n\n📚 Kontynuuj naukę - będzie lepiej!';
        }

        return summary;
    }
}
