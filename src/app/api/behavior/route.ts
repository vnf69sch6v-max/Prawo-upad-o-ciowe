/**
 * API Route: /api/behavior
 * User Behavior Agent endpoint for insights, analysis, and recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { getBehaviorAgent } from '@/lib/agents';

/**
 * GET /api/behavior
 * Get full behavior analysis for the current user
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
        const type = searchParams.get('type') || 'full';

        // Get behavior agent
        const agent = await getBehaviorAgent(userId);

        // Return based on type
        switch (type) {
            case 'quick':
                // Quick insights only
                const quickInsights = await agent.getQuickInsights();
                return NextResponse.json({
                    success: true,
                    data: {
                        insights: quickInsights
                    }
                });

            case 'intervention':
                // Check if intervention needed
                const intervention = await agent.shouldIntervene();
                const notification = intervention.shouldIntervene
                    ? await agent.getNotificationContent()
                    : null;
                return NextResponse.json({
                    success: true,
                    data: {
                        ...intervention,
                        notification
                    }
                });

            case 'predictions':
                // Predictions only
                const analysisForPredictions = await agent.analyze();
                return NextResponse.json({
                    success: true,
                    data: {
                        predictions: analysisForPredictions.predictions
                    }
                });

            case 'recommendations':
                // Recommendations only
                const analysisForRecs = await agent.analyze();
                return NextResponse.json({
                    success: true,
                    data: {
                        recommendations: analysisForRecs.recommendations
                    }
                });

            case 'full':
            default:
                // Full analysis
                const fullAnalysis = await agent.analyze();
                return NextResponse.json({
                    success: true,
                    data: fullAnalysis
                });
        }

    } catch (error) {
        console.error('Error in GET /api/behavior:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/behavior
 * Process a new learning event and get real-time insights
 */
export async function POST(request: NextRequest) {
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

        // Parse event from body
        const body = await request.json();
        const { event } = body;

        if (!event || !event.type) {
            return NextResponse.json(
                { error: 'Invalid event data' },
                { status: 400 }
            );
        }

        // Ensure timestamp is a Date
        event.timestamp = event.timestamp ? new Date(event.timestamp) : new Date();

        // Get behavior agent and process event
        const agent = await getBehaviorAgent(userId);
        const realTimeInsights = await agent.processNewEvent(event);

        return NextResponse.json({
            success: true,
            data: {
                insights: realTimeInsights,
                processedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error in POST /api/behavior:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
