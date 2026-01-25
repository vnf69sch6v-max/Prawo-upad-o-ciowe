// User Data Service - Supabase operations for user learning data
import { supabase, isSupabaseAvailable } from './client';
import type {
    WrongAnswer,
    LearningProgress,
    UserStatistics,
    QuestionResultJson
} from './types';

// ========================
// PROFILE & STATS
// ========================

export async function ensureUserProfile(
    userId: string,
    email: string,
    displayName: string
): Promise<void> {
    if (!isSupabaseAvailable()) return;

    // Upsert profile
    await supabase.from('profiles').upsert({
        id: userId,
        email,
        display_name: displayName,
    }, { onConflict: 'id' });

    // Ensure statistics row exists
    await supabase.from('user_statistics').upsert({
        user_id: userId,
    }, { onConflict: 'user_id' });
}

export async function getUserStatistics(userId: string): Promise<UserStatistics | null> {
    if (!isSupabaseAvailable()) return null;

    const { data, error } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error || !data) return null;

    return {
        knowledgeEquity: data.knowledge_equity,
        totalQuestions: data.total_questions,
        correctAnswers: data.correct_answers,
        currentStreak: data.current_streak,
        longestStreak: data.longest_streak,
        lastStudyDate: data.last_study_date ? new Date(data.last_study_date) : null,
        totalStudyTime: data.total_study_time,
        examsCompleted: data.exams_completed,
        examsPassed: data.exams_passed,
        bestExamScore: data.best_exam_score,
        domainMastery: data.domain_mastery || {},
    };
}

export async function updateUserStatistics(
    userId: string,
    updates: Partial<UserStatistics>
): Promise<void> {
    if (!isSupabaseAvailable()) return;

    const dbUpdates: Record<string, unknown> = {};

    if (updates.knowledgeEquity !== undefined) dbUpdates.knowledge_equity = updates.knowledgeEquity;
    if (updates.totalQuestions !== undefined) dbUpdates.total_questions = updates.totalQuestions;
    if (updates.correctAnswers !== undefined) dbUpdates.correct_answers = updates.correctAnswers;
    if (updates.currentStreak !== undefined) dbUpdates.current_streak = updates.currentStreak;
    if (updates.longestStreak !== undefined) dbUpdates.longest_streak = updates.longestStreak;
    if (updates.lastStudyDate !== undefined) dbUpdates.last_study_date = updates.lastStudyDate?.toISOString().split('T')[0];
    if (updates.totalStudyTime !== undefined) dbUpdates.total_study_time = updates.totalStudyTime;
    if (updates.examsCompleted !== undefined) dbUpdates.exams_completed = updates.examsCompleted;
    if (updates.examsPassed !== undefined) dbUpdates.exams_passed = updates.examsPassed;
    if (updates.bestExamScore !== undefined) dbUpdates.best_exam_score = updates.bestExamScore;
    if (updates.domainMastery !== undefined) dbUpdates.domain_mastery = updates.domainMastery;

    await supabase
        .from('user_statistics')
        .update(dbUpdates)
        .eq('user_id', userId);
}

// ========================
// TEST RESULTS
// ========================

export interface SaveTestResultInput {
    userId: string;
    examId: string;
    examTitle: string;
    score: number;
    passed: boolean;
    correctAnswers: number;
    totalQuestions: number;
    timeSpent?: number;
    questionResults?: QuestionResultJson[];
}

export async function saveTestResult(input: SaveTestResultInput): Promise<string | null> {
    if (!isSupabaseAvailable()) return null;

    const { data, error } = await supabase
        .from('test_results')
        .insert({
            user_id: input.userId,
            exam_id: input.examId,
            exam_title: input.examTitle,
            score: input.score,
            passed: input.passed,
            correct_answers: input.correctAnswers,
            total_questions: input.totalQuestions,
            time_spent: input.timeSpent || null,
            question_results: input.questionResults || null,
        })
        .select('id')
        .single();

    if (error) {
        console.error('Error saving test result:', error);
        return null;
    }

    // Update user statistics
    const stats = await getUserStatistics(input.userId);
    if (stats) {
        await updateUserStatistics(input.userId, {
            examsCompleted: stats.examsCompleted + 1,
            examsPassed: stats.examsPassed + (input.passed ? 1 : 0),
            totalQuestions: stats.totalQuestions + input.totalQuestions,
            correctAnswers: stats.correctAnswers + input.correctAnswers,
            knowledgeEquity: stats.knowledgeEquity + (input.correctAnswers * 10),
            bestExamScore: Math.max(stats.bestExamScore, input.score),
        });
    }

    return data?.id || null;
}

export async function getTestHistory(
    userId: string,
    limit: number = 10
): Promise<SaveTestResultInput[]> {
    if (!isSupabaseAvailable()) return [];

    const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(limit);

    if (error || !data) return [];

    return data.map(row => ({
        userId: row.user_id,
        examId: row.exam_id,
        examTitle: row.exam_title,
        score: row.score,
        passed: row.passed,
        correctAnswers: row.correct_answers,
        totalQuestions: row.total_questions,
        timeSpent: row.time_spent || undefined,
        questionResults: row.question_results || undefined,
    }));
}

// ========================
// WRONG ANSWERS (Słabe punkty)
// ========================

export async function saveWrongAnswer(
    userId: string,
    questionId: string,
    domain: 'ksh' | 'prawo_upadlosciowe' | 'prawo_cywilne' | 'aso' | 'makler_a'
): Promise<void> {
    if (!isSupabaseAvailable()) return;

    // Check if already exists
    const { data: existing } = await supabase
        .from('wrong_answers')
        .select('wrong_count')
        .eq('user_id', userId)
        .eq('question_id', questionId)
        .single();

    if (existing) {
        // Increment wrong count
        await supabase
            .from('wrong_answers')
            .update({
                wrong_count: existing.wrong_count + 1,
                correct_streak: 0,
                last_wrong_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('question_id', questionId);
    } else {
        // Insert new
        await supabase.from('wrong_answers').insert({
            user_id: userId,
            question_id: questionId,
            domain,
            wrong_count: 1,
            correct_streak: 0,
        });
    }
}

export async function markAnswerCorrect(
    userId: string,
    questionId: string
): Promise<void> {
    if (!isSupabaseAvailable()) return;

    const { data: existing } = await supabase
        .from('wrong_answers')
        .select('correct_streak')
        .eq('user_id', userId)
        .eq('question_id', questionId)
        .single();

    if (existing) {
        const newStreak = existing.correct_streak + 1;

        // If answered correctly 3 times in a row, remove from weak points
        if (newStreak >= 3) {
            await supabase
                .from('wrong_answers')
                .delete()
                .eq('user_id', userId)
                .eq('question_id', questionId);
        } else {
            await supabase
                .from('wrong_answers')
                .update({ correct_streak: newStreak })
                .eq('user_id', userId)
                .eq('question_id', questionId);
        }
    }
}

export async function getWrongAnswers(userId: string): Promise<WrongAnswer[]> {
    if (!isSupabaseAvailable()) return [];

    const { data, error } = await supabase
        .from('wrong_answers')
        .select('*')
        .eq('user_id', userId)
        .order('wrong_count', { ascending: false });

    if (error || !data) return [];

    return data.map(row => ({
        questionId: row.question_id,
        domain: row.domain as 'ksh' | 'prawo_upadlosciowe' | 'prawo_cywilne' | 'aso' | 'makler_a',
        wrongCount: row.wrong_count,
        correctStreak: row.correct_streak,
        lastWrongAt: new Date(row.last_wrong_at),
    }));
}

export async function clearWrongAnswers(userId: string): Promise<void> {
    if (!isSupabaseAvailable()) return;

    await supabase
        .from('wrong_answers')
        .delete()
        .eq('user_id', userId);
}

export async function removeWrongAnswer(
    userId: string,
    questionId: string
): Promise<void> {
    if (!isSupabaseAvailable()) return;

    await supabase
        .from('wrong_answers')
        .delete()
        .eq('user_id', userId)
        .eq('question_id', questionId);
}

// ========================
// LEARNING PROGRESS
// ========================

export async function updateLearningProgress(
    userId: string,
    topic: string,
    scorePercent: number,
    subtopicsWrong: string[],
    subtopicsCorrect: string[]
): Promise<void> {
    if (!isSupabaseAvailable()) return;

    // Get current progress
    const { data: current } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('topic', topic)
        .single();

    const oldMastery = current?.mastery_level || 0;
    const timesPracticed = (current?.times_practiced || 0) + 1;

    // Calculate new mastery (weighted average)
    const newMastery = Math.round(
        (oldMastery * (timesPracticed - 1) + scorePercent) / timesPracticed
    );

    // Update weak/strong areas
    const weakAreas = [...(current?.weak_areas || [])];
    const strongAreas = [...(current?.strong_areas || [])];

    subtopicsWrong.forEach(subtopic => {
        if (!weakAreas.includes(subtopic)) weakAreas.push(subtopic);
        const strongIdx = strongAreas.indexOf(subtopic);
        if (strongIdx !== -1) strongAreas.splice(strongIdx, 1);
    });

    subtopicsCorrect.forEach(subtopic => {
        const weakIdx = weakAreas.indexOf(subtopic);
        if (weakIdx !== -1) {
            weakAreas.splice(weakIdx, 1);
            if (!strongAreas.includes(subtopic)) strongAreas.push(subtopic);
        }
    });

    await supabase.from('learning_progress').upsert({
        user_id: userId,
        topic,
        mastery_level: newMastery,
        times_practiced: timesPracticed,
        last_practiced: new Date().toISOString(),
        weak_areas: weakAreas,
        strong_areas: strongAreas,
    }, { onConflict: 'user_id,topic' });
}

export async function getLearningProgress(userId: string): Promise<LearningProgress[]> {
    if (!isSupabaseAvailable()) return [];

    const { data, error } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', userId)
        .order('mastery_level', { ascending: true });

    if (error || !data) return [];

    return data.map(row => ({
        topic: row.topic,
        masteryLevel: row.mastery_level,
        timesPracticed: row.times_practiced,
        lastPracticed: row.last_practiced ? new Date(row.last_practiced) : null,
        weakAreas: row.weak_areas || [],
        strongAreas: row.strong_areas || [],
    }));
}

export async function getWeakTopics(userId: string): Promise<LearningProgress[]> {
    if (!isSupabaseAvailable()) return [];

    const { data, error } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', userId)
        .lt('mastery_level', 70)
        .order('mastery_level', { ascending: true });

    if (error || !data) return [];

    return data.map(row => ({
        topic: row.topic,
        masteryLevel: row.mastery_level,
        timesPracticed: row.times_practiced,
        lastPracticed: row.last_practiced ? new Date(row.last_practiced) : null,
        weakAreas: row.weak_areas || [],
        strongAreas: row.strong_areas || [],
    }));
}
