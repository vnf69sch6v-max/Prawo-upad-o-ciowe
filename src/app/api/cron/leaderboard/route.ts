// Cron API: Update Leaderboard
// Runs hourly via Vercel Cron

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

        // Get all users with their stats
        const usersSnapshot = await adminDb.collection('users').get();
        
        const leaderboardData = usersSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                displayName: data.displayName || 'Anonymous',
                knowledgeEquity: data.stats?.knowledgeEquity || 0,
                streak: data.stats?.streak || 0,
                accuracy: data.lifetimeAccuracy || 0,
                isPublic: data.privacy?.showInLeaderboard !== false,
            };
        });

        // Filter public profiles and sort by equity
        const publicLeaderboard = leaderboardData
            .filter(u => u.isPublic)
            .sort((a, b) => b.knowledgeEquity - a.knowledgeEquity)
            .slice(0, 100)
            .map((user, index) => ({
                ...user,
                rank: index + 1,
            }));

        // Update leaderboard documents
        const batch = adminDb.batch();

        // Daily leaderboard
        batch.set(adminDb.collection('leaderboard').doc('daily'), {
            users: publicLeaderboard,
            updatedAt: new Date(),
            period: 'daily',
        });

        // Weekly leaderboard
        batch.set(adminDb.collection('leaderboard').doc('weekly'), {
            users: publicLeaderboard,
            updatedAt: new Date(),
            period: 'weekly',
        });

        // All-time leaderboard
        batch.set(adminDb.collection('leaderboard').doc('all'), {
            users: publicLeaderboard,
            updatedAt: new Date(),
            period: 'all',
        });

        await batch.commit();

        return NextResponse.json({
            success: true,
            message: `Updated leaderboard with ${publicLeaderboard.length} users`,
        });

    } catch (error) {
        console.error('Leaderboard cron error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
