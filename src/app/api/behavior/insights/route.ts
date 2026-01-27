/**
 * API Route: /api/behavior/insights
 * Get behavior insights for the current user
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { getBehaviorAgent } from '@/lib/agents';

/**
 * GET /api/behavior/insights
 * Get insights with optional priority filter
 */
export async function GET(request: NextRequest) {
    try {
        // Authenticate user
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Missing or invalid Authorization header' },
                { status: 401 }
            );
        }

        const token = authHeader.replace('Bearer ', '');
        const decodedToken = await adminAuth.verifyIdToken(token);
        const userId = decodedToken.uid;

        // Get query parameters
        const searchParams = request.nextUrl.searchParams;
        const minPriority = parseInt(searchParams.get('minPriority') || '0');
        const category = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit') || '10');

        // Get behavior agent
        const agent = await getBehaviorAgent(userId);
        const analysis = await agent.analyze();

        // Filter insights
        let insights = analysis.insights;

        if (minPriority > 0) {
            insights = insights.filter(i => i.priority >= minPriority);
        }

        if (category) {
            insights = insights.filter(i => i.category === category);
        }

        insights = insights.slice(0, limit);

        return NextResponse.json({
            success: true,
            data: {
                insights,
                totalCount: analysis.insights.length,
                filteredCount: insights.length
            }
        });

    } catch (error) {
        console.error('Error in GET /api/behavior/insights:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
