// Database types for Supabase

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string | null;
                    display_name: string | null;
                    photo_url: string | null;
                    subscription_plan: string;
                    subscription_status: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email?: string | null;
                    display_name?: string | null;
                    photo_url?: string | null;
                    subscription_plan?: string;
                    subscription_status?: string;
                };
                Update: {
                    email?: string | null;
                    display_name?: string | null;
                    photo_url?: string | null;
                    subscription_plan?: string;
                    subscription_status?: string;
                };
            };
            user_statistics: {
                Row: {
                    user_id: string;
                    knowledge_equity: number;
                    total_questions: number;
                    correct_answers: number;
                    current_streak: number;
                    longest_streak: number;
                    last_study_date: string | null;
                    total_study_time: number;
                    exams_completed: number;
                    exams_passed: number;
                    best_exam_score: number;
                    domain_mastery: Record<string, number>;
                    updated_at: string;
                };
                Insert: {
                    user_id: string;
                    knowledge_equity?: number;
                    total_questions?: number;
                    correct_answers?: number;
                    current_streak?: number;
                    longest_streak?: number;
                    last_study_date?: string | null;
                    total_study_time?: number;
                    exams_completed?: number;
                    exams_passed?: number;
                    best_exam_score?: number;
                    domain_mastery?: Record<string, number>;
                };
                Update: Partial<Database['public']['Tables']['user_statistics']['Insert']>;
            };
            test_results: {
                Row: {
                    id: string;
                    user_id: string;
                    exam_id: string;
                    exam_title: string;
                    score: number;
                    passed: boolean;
                    correct_answers: number;
                    total_questions: number;
                    time_spent: number | null;
                    question_results: QuestionResultJson[] | null;
                    completed_at: string;
                };
                Insert: Omit<Database['public']['Tables']['test_results']['Row'], 'id' | 'completed_at'>;
                Update: Partial<Database['public']['Tables']['test_results']['Insert']>;
            };
            learning_progress: {
                Row: {
                    id: string;
                    user_id: string;
                    topic: string;
                    mastery_level: number;
                    times_practiced: number;
                    last_practiced: string | null;
                    weak_areas: string[];
                    strong_areas: string[];
                    updated_at: string;
                };
                Insert: {
                    user_id: string;
                    topic: string;
                    mastery_level?: number;
                    times_practiced?: number;
                    weak_areas?: string[];
                    strong_areas?: string[];
                };
                Update: Partial<Database['public']['Tables']['learning_progress']['Insert']>;
            };
            wrong_answers: {
                Row: {
                    id: string;
                    user_id: string;
                    question_id: string;
                    domain: string;
                    wrong_count: number;
                    correct_streak: number;
                    last_wrong_at: string;
                };
                Insert: {
                    user_id: string;
                    question_id: string;
                    domain: string;
                    wrong_count?: number;
                    correct_streak?: number;
                };
                Update: Partial<Database['public']['Tables']['wrong_answers']['Insert']>;
            };
        };
    };
}

// JSON types for nested data
export interface QuestionResultJson {
    questionId: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    article?: string;
    timeSpent?: number;
}

// Converted types for app usage
export interface WrongAnswer {
    questionId: string;
    domain: 'ksh' | 'prawo_upadlosciowe';
    wrongCount: number;
    correctStreak: number;
    lastWrongAt: Date;
}

export interface LearningProgress {
    topic: string;
    masteryLevel: number;
    timesPracticed: number;
    lastPracticed: Date | null;
    weakAreas: string[];
    strongAreas: string[];
}

export interface UserStatistics {
    knowledgeEquity: number;
    totalQuestions: number;
    correctAnswers: number;
    currentStreak: number;
    longestStreak: number;
    lastStudyDate: Date | null;
    totalStudyTime: number;
    examsCompleted: number;
    examsPassed: number;
    bestExamScore: number;
    domainMastery: Record<string, number>;
}
