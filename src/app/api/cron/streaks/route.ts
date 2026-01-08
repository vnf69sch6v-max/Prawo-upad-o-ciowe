// Cron API: Check and Update Streaks
// Runs daily at midnight via Vercel Cron

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
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const today = new Date(now);
        today.setHours(0, 0, 0, 0);

        // Get all users
        const usersSnapshot = await adminDb.collection('users').get();

        const batch = adminDb.batch();
        let streaksReset = 0;
        let streaksMaintained = 0;

        for (const doc of usersSnapshot.docs) {
            const data = doc.data();
            const lastStudyDate = data.stats?.lastStudyDate?.toDate?.() || null;

            // If user didn't study yesterday, reset streak
            if (lastStudyDate) {
                const lastStudy = new Date(lastStudyDate);
                lastStudy.setHours(0, 0, 0, 0);

                if (lastStudy < yesterday) {
                    // Reset streak
                    batch.update(doc.ref, {
                        'stats.streak': 0,
                        'stats.streakBrokenAt': now,
                    });
                    streaksReset++;
                } else {
                    streaksMaintained++;
                }
            }
        }

        await batch.commit();

        return NextResponse.json({
            success: true,
            message: `Streaks processed: ${streaksMaintained} maintained, ${streaksReset} reset`,
        });

    } catch (error) {
        console.error('Streaks cron error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
