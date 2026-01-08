// Cron API: Cleanup old sessions and data
// Runs daily at 3am via Vercel Cron

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // Verify cron secret
        const authHeader = request.headers.get('Authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        let deletedSessions = 0;
        let deletedUsage = 0;

        // Get all users
        const usersSnapshot = await adminDb.collection('users').get();

        for (const userDoc of usersSnapshot.docs) {
            // Delete old exam sessions (older than 30 days)
            const sessionsSnapshot = await userDoc.ref
                .collection('examSessions')
                .where('startedAt', '<', thirtyDaysAgo)
                .where('status', '==', 'abandoned')
                .get();

            for (const sessionDoc of sessionsSnapshot.docs) {
                await sessionDoc.ref.delete();
                deletedSessions++;
            }

            // Delete old usage records (older than 30 days)
            const usageSnapshot = await userDoc.ref
                .collection('usage')
                .get();

            for (const usageDoc of usageSnapshot.docs) {
                const usageDate = new Date(usageDoc.id);
                if (usageDate < thirtyDaysAgo) {
                    await usageDoc.ref.delete();
                    deletedUsage++;
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Cleanup complete: ${deletedSessions} sessions, ${deletedUsage} usage records deleted`,
        });

    } catch (error) {
        console.error('Cleanup cron error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
