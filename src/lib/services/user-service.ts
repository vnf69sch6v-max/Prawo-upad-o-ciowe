// User Service - Firebase Firestore operations
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    addDoc,
    serverTimestamp,
    Timestamp,
    increment
} from 'firebase/firestore';
import { getFirebaseDb, isFirebaseAvailable } from '../firebase/config';
import {
    UserProfile,
    UserStats,
    ExamResult,
    ActivityItem,
    LeaderboardEntry,
    StudySession,
    DEFAULT_USER_STATS,
    DEFAULT_USER_PREFERENCES
} from '../types/user';

// Re-export types for convenience
export type { LeaderboardEntry };

// Helper to convert Firestore timestamps
function convertTimestamp(timestamp: Timestamp | Date | undefined): Date | undefined {
    if (!timestamp) return undefined;
    if (timestamp instanceof Timestamp) return timestamp.toDate();
    return timestamp;
}

// ========================
// USER PROFILE
// ========================

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!isFirebaseAvailable()) return null;

    const db = getFirebaseDb();
    if (!db) return null;

    try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                ...data,
                uid,
                createdAt: convertTimestamp(data.createdAt) || new Date(),
                updatedAt: convertTimestamp(data.updatedAt) || new Date(),
            } as UserProfile;
        }
        return null;
    } catch (error) {
        console.error('Error getting user profile:', error);
        return null;
    }
}

export async function createUserProfile(
    uid: string,
    email: string,
    displayName: string
): Promise<UserProfile> {
    const db = getFirebaseDb();
    if (!db) throw new Error('Firebase not available');

    const profile: Omit<UserProfile, 'createdAt' | 'updatedAt'> & { createdAt: ReturnType<typeof serverTimestamp>, updatedAt: ReturnType<typeof serverTimestamp> } = {
        uid,
        email,
        displayName,
        subscription: {
            plan: 'free',
            status: 'active',
        },
        stats: DEFAULT_USER_STATS,
        preferences: DEFAULT_USER_PREFERENCES,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', uid), profile);

    return {
        ...profile,
        createdAt: new Date(),
        updatedAt: new Date(),
    } as UserProfile;
}

export async function updateUserProfile(
    uid: string,
    updates: Partial<UserProfile>
): Promise<void> {
    const db = getFirebaseDb();
    if (!db) throw new Error('Firebase not available');

    await updateDoc(doc(db, 'users', uid), {
        ...updates,
        updatedAt: serverTimestamp(),
    });
}

// ========================
// USER STATS
// ========================

export async function updateUserStats(
    uid: string,
    updates: Partial<UserStats>
): Promise<void> {
    const db = getFirebaseDb();
    if (!db) throw new Error('Firebase not available');

    const updateData: Record<string, unknown> = {};

    Object.entries(updates).forEach(([key, value]) => {
        updateData[`stats.${key}`] = value;
    });

    await updateDoc(doc(db, 'users', uid), {
        ...updateData,
        updatedAt: serverTimestamp(),
    });
}

export async function incrementUserStats(
    uid: string,
    increments: {
        knowledgeEquity?: number;
        totalQuestions?: number;
        correctAnswers?: number;
        totalStudyTime?: number;
        examsCompleted?: number;
        examsPassed?: number;
    }
): Promise<void> {
    const db = getFirebaseDb();
    if (!db) throw new Error('Firebase not available');

    const updateData: Record<string, unknown> = {};

    Object.entries(increments).forEach(([key, value]) => {
        if (value !== undefined) {
            updateData[`stats.${key}`] = increment(value);
        }
    });

    await updateDoc(doc(db, 'users', uid), {
        ...updateData,
        updatedAt: serverTimestamp(),
    });
}

// ========================
// EXAM RESULTS
// ========================

export async function saveExamResult(result: Omit<ExamResult, 'id'>): Promise<string> {
    const db = getFirebaseDb();
    if (!db) throw new Error('Firebase not available');

    const docRef = await addDoc(collection(db, 'examResults'), {
        ...result,
        completedAt: serverTimestamp(),
    });

    // Update user stats
    await incrementUserStats(result.uid, {
        examsCompleted: 1,
        examsPassed: result.passed ? 1 : 0,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        knowledgeEquity: result.correctAnswers * 10, // 10 points per correct answer
    });

    // Update best exam score if applicable
    const profile = await getUserProfile(result.uid);
    if (profile && result.score > profile.stats.bestExamScore) {
        await updateUserStats(result.uid, { bestExamScore: result.score });
    }

    return docRef.id;
}

export async function getUserExamResults(
    uid: string,
    limitCount: number = 10
): Promise<ExamResult[]> {
    const db = getFirebaseDb();
    if (!db) return [];

    try {
        const q = query(
            collection(db, 'examResults'),
            where('uid', '==', uid),
            orderBy('completedAt', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            completedAt: convertTimestamp(doc.data().completedAt) || new Date(),
        })) as ExamResult[];
    } catch (error) {
        console.error('Error getting exam results:', error);
        return [];
    }
}

// ========================
// ACTIVITY FEED
// ========================

export async function addActivity(
    activity: Omit<ActivityItem, 'id' | 'createdAt'>
): Promise<string> {
    const db = getFirebaseDb();
    if (!db) throw new Error('Firebase not available');

    const docRef = await addDoc(collection(db, 'activities'), {
        ...activity,
        createdAt: serverTimestamp(),
    });

    return docRef.id;
}

export async function getUserActivities(
    uid: string,
    limitCount: number = 20
): Promise<ActivityItem[]> {
    const db = getFirebaseDb();
    if (!db) return [];

    try {
        const q = query(
            collection(db, 'activities'),
            where('uid', '==', uid),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: convertTimestamp(doc.data().createdAt) || new Date(),
        })) as ActivityItem[];
    } catch (error) {
        console.error('Error getting activities:', error);
        return [];
    }
}

// ========================
// LEADERBOARD
// ========================

export async function getLeaderboard(limitCount: number = 50): Promise<LeaderboardEntry[]> {
    const db = getFirebaseDb();
    if (!db) return [];

    try {
        const q = query(
            collection(db, 'users'),
            orderBy('stats.knowledgeEquity', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc, index) => {
            const data = doc.data();
            return {
                uid: doc.id,
                displayName: data.displayName || 'Anonymous',
                photoURL: data.photoURL,
                knowledgeEquity: data.stats?.knowledgeEquity || 0,
                rank: index + 1,
                rankChange: 0, // TODO: Calculate from weekly snapshots
                currentStreak: data.stats?.currentStreak || 0,
            };
        }) as LeaderboardEntry[];
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        return [];
    }
}

// ========================
// STUDY SESSIONS
// ========================

export async function saveStudySession(
    session: Omit<StudySession, 'id'>
): Promise<string> {
    const db = getFirebaseDb();
    if (!db) throw new Error('Firebase not available');

    const docRef = await addDoc(collection(db, 'studySessions'), {
        ...session,
        startedAt: serverTimestamp(),
    });

    return docRef.id;
}

export async function getUserStudySessions(
    uid: string,
    limitCount: number = 30
): Promise<StudySession[]> {
    const db = getFirebaseDb();
    if (!db) return [];

    try {
        const q = query(
            collection(db, 'studySessions'),
            where('uid', '==', uid),
            orderBy('startedAt', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            startedAt: convertTimestamp(doc.data().startedAt) || new Date(),
            endedAt: convertTimestamp(doc.data().endedAt),
        })) as StudySession[];
    } catch (error) {
        console.error('Error getting study sessions:', error);
        return [];
    }
}

// ========================
// STREAK MANAGEMENT
// ========================

export async function updateStreak(uid: string): Promise<number> {
    const profile = await getUserProfile(uid);
    if (!profile) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastStudy = profile.stats.lastStudyDate;
    let newStreak = profile.stats.currentStreak;

    if (!lastStudy) {
        // First study session
        newStreak = 1;
    } else {
        const lastDate = new Date(lastStudy);
        lastDate.setHours(0, 0, 0, 0);

        const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            // Same day, no change
        } else if (diffDays === 1) {
            // Consecutive day
            newStreak++;
        } else {
            // Streak broken
            newStreak = 1;
        }
    }

    // Update stats
    await updateUserStats(uid, {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, profile.stats.longestStreak),
        lastStudyDate: today,
    });

    // Add milestone activity if applicable
    if (newStreak > 0 && newStreak % 7 === 0) {
        await addActivity({
            uid,
            type: 'streak_milestone',
            title: `🔥 ${newStreak} dni streak!`,
            description: `Utrzymujesz passę od ${newStreak} dni!`,
        });
    }

    return newStreak;
}

// ========================
// DOMAIN MASTERY
// ========================

export async function updateDomainMastery(
    uid: string,
    domain: string,
    correctCount: number,
    totalCount: number
): Promise<void> {
    const profile = await getUserProfile(uid);
    if (!profile) return;

    const currentMastery = profile.stats.domainMastery[domain] || 0;
    const sessionMastery = (correctCount / totalCount) * 100;

    // Weighted average: 70% current + 30% new session
    const newMastery = currentMastery === 0
        ? sessionMastery
        : (currentMastery * 0.7) + (sessionMastery * 0.3);

    await updateUserStats(uid, {
        domainMastery: {
            ...profile.stats.domainMastery,
            [domain]: Math.round(newMastery),
        },
    });
}
