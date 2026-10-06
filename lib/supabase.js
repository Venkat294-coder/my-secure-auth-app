import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseConfig } from '@/lib/supabase-config';
import { fetchWithTimeout } from '@/lib/fetch-with-timeout';

let browserClient;

export function createClient() {
    if (typeof window === 'undefined') {
        throw new Error('The browser Supabase client can only be created in the browser.');
    }

    if (browserClient) return browserClient;

    const { supabaseUrl, supabaseKey } = getSupabaseConfig();
    browserClient = createBrowserClient(supabaseUrl, supabaseKey, {
        global: { fetch: fetchWithTimeout },
        auth: { persistSession: true },
    });

    return browserClient;
}