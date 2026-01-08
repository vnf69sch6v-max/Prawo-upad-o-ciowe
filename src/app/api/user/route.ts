// API Route: GET /api/user - Get current user profile

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
    try {
        // Get auth token from header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Missing or invalid Authorization header' },
                { status: 401 }
            );
        }

        const token = authHeader.replace('Bearer ', '');

        // Verify token
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        // Get user document from Firestore
        const userDoc = await adminDb.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            // Create new user document if doesn't exist (first login)
            const newUser = {
                id: userId,
                email: decodedToken.email || '',
                displayName: decodedToken.name || 'Student Prawa',
                photoURL: decodedToken.picture || null,
                tier: 'free',
                stripeCustomerId: null,
                subscriptionStatus: null,
                subscriptionEndDate: null,
                stats: {
                    knowledgeEquity: 0,
                    retentionIndex: 0,
                    accuracy: 0,
                    streak: 0,
                    longestStreak: 0,
                    totalStudyTime: 0,
                    totalQuestionsAnswered: 0,
                    totalFlashcardsReviewed: 0,
                    lastStudyDate: null,
                },
                domainProgress: {},
                examDate: null,
                dailyGoal: 30,
                preferredStudyTime: 'evening',
                privacy: {
                    showOnLeaderboard: true,
                    publicProfile: false,
                },
                createdAt: new Date(),
                updatedAt: new Date(),
                lastLoginAt: new Date(),
                onboardingCompleted: false,
            };

            await adminDb.collection('users').doc(userId).set(newUser);

            return NextResponse.json({
                success: true,
                data: newUser,
                isNewUser: true,
            });
        }

        const userData = userDoc.data();

        // Update last login
        await adminDb.collection('users').doc(userId).update({
            lastLoginAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            data: {
                id: userId,
                ...userData,
            },
        });

    } catch (error) {
        console.error('Error in GET /api/user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PATCH /api/user - Update user profile
export async function PATCH(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const token = authHeader.replace('Bearer ', '');
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        const body = await request.json();

        // Allowed fields to update
        const allowedFields = [
            'displayName',
            'examDate',
            'dailyGoal',
            'preferredStudyTime',
            'privacy',
            'onboardingCompleted',
        ];

        // Filter only allowed fields
        const updates: Record<string, unknown> = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: 'No valid fields to update' },
                { status: 400 }
            );
        }

        updates.updatedAt = new Date();

        await adminDb.collection('users').doc(userId).update(updates);

        return NextResponse.json({
            success: true,
            message: 'Profile updated',
        });

    } catch (error) {
        console.error('Error in PATCH /api/user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
