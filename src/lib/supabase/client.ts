import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false, // We use Firebase Auth, not Supabase Auth
    },
});

// Check if Supabase is configured
export function isSupabaseAvailable(): boolean {
    return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project.supabase.co');
}
