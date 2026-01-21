// Types
export * from './types';

// Event Collection & Processing
export * from './event-collector';
export * from './event-processor';

// Profile Management
export * from './student-profile';
export * from './profile-updater';

// Adaptation Engine
export { DifficultyController } from './difficulty-controller';
export type { DifficultyAdjustment } from './difficulty-controller';
export { PacingController } from './pacing-controller';
export type { SessionPlan, DifficultyPhase, BreakPoint } from './pacing-controller';
export { FeedbackStyler } from './feedback-styler';
export type { QuestionResult, PersonalizedFeedback, NextStep } from './feedback-styler';
