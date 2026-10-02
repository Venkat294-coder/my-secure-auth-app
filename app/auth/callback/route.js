import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseConfig } from '@/lib/supabase-config';

export async function GET(request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');

    if (searchParams.has('error')) {
        const error = searchParams.get('error') === 'access_denied'
            ? 'google_cancelled'
            : 'auth_callback';
        return NextResponse.redirect(`${origin}/login?error=${error}`);
    }

    try {
        if (code) {
            const cookieStore = await cookies();
            const { supabaseUrl, supabaseKey } = getSupabaseConfig();
            const supabase = createServerClient(supabaseUrl, supabaseKey, {
                cookies: {
                    getAll() { return cookieStore.getAll(); },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
                    },
                },
            });
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (!error && data?.session && data?.user) {
                return NextResponse.redirect(`${origin}/dashboard`);
            }
        }
    } catch {
        return NextResponse.redirect(`${origin}/login?error=auth_callback`);
    }

    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
}
