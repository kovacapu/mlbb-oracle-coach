import { createClient } from '@supabase/supabase-js';

// Env vars (local dev) veya fallback (production build için hardcoded)
// Anon key herkese açık tasarlanmış (sb_publishable_) — güvenli
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://denbxlatlugpypivvvie.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'sb_publishable_mDGg2UzRCSTcSNzDICqLUA_oQP-F2tC';

export const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
        auth: {
            persistSession: true,
        }
    }
);
