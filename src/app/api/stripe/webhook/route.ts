import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

// Lazy initialization to avoid build-time errors
let supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
    if (!supabaseAdmin) {
        supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
    }
    return supabaseAdmin;
}

export async function POST(req: NextRequest) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const userId = session.client_reference_id;
                const subscriptionId = session.subscription as string;

                if (userId && subscriptionId) {
                    // Get subscription details
                    const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const subscription = subscriptionResponse as any;
                    const priceId = subscription.items?.data?.[0]?.price?.id;

                    // Determine plan based on price
                    const planSlug = priceId?.includes('pro') ? 'pro' : 'premium';

                    // Get plan ID from database
                    const { data: planData } = await getSupabaseAdmin()
                        .from('subscription_plans')
                        .select('id')
                        .eq('slug', planSlug)
                        .single();

                    if (planData) {
                        // Create or update subscription in database
                        await getSupabaseAdmin().from('subscriptions').upsert({
                            user_id: userId,
                            plan_id: planData.id,
                            stripe_subscription_id: subscriptionId,
                            stripe_customer_id: session.customer as string,
                            status: 'active',
                            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                        }, {
                            onConflict: 'user_id'
                        });
                    }
                }
                break;
            }

            case 'customer.subscription.updated': {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const subscription = event.data.object as any;
                const userId = subscription.metadata?.userId;

                if (userId) {
                    await getSupabaseAdmin()
                        .from('subscriptions')
                        .update({
                            status: subscription.status,
                            current_period_start: subscription.current_period_start
                                ? new Date(subscription.current_period_start * 1000).toISOString()
                                : null,
                            current_period_end: subscription.current_period_end
                                ? new Date(subscription.current_period_end * 1000).toISOString()
                                : null,
                            cancel_at: subscription.cancel_at
                                ? new Date(subscription.cancel_at * 1000).toISOString()
                                : null,
                        })
                        .eq('user_id', userId);
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const userId = subscription.metadata?.userId;

                if (userId) {
                    // Downgrade to free plan
                    const { data: freePlan } = await getSupabaseAdmin()
                        .from('subscription_plans')
                        .select('id')
                        .eq('slug', 'free')
                        .single();

                    if (freePlan) {
                        await getSupabaseAdmin()
                            .from('subscriptions')
                            .update({
                                plan_id: freePlan.id,
                                status: 'canceled',
                                stripe_subscription_id: null,
                            })
                            .eq('user_id', userId);
                    }
                }
                break;
            }

            case 'invoice.payment_failed': {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const invoice = event.data.object as any;
                const subscriptionId = invoice.subscription as string;

                if (subscriptionId) {
                    await getSupabaseAdmin()
                        .from('subscriptions')
                        .update({ status: 'past_due' })
                        .eq('stripe_subscription_id', subscriptionId);
                }
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook handler error:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
