import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { getSupabaseConfig } from '@/lib/supabase-config';
import { fetchWithTimeout } from '@/lib/fetch-with-timeout';

export async function proxy(request) {
    let supabaseResponse = NextResponse.next({ request });

    const { supabaseUrl, supabaseKey } = getSupabaseConfig();
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        global: { fetch: fetchWithTimeout },
        cookies: {
            getAll() { return request.cookies.getAll(); },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                supabaseResponse = NextResponse.next({ request });
                cookiesToSet.forEach(({ name, value, options }) =>
                    supabaseResponse.cookies.set(name, value, options)
                );
            },
        },
    });

    const { data: { user } } = await supabase.auth.getUser();

    if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/login';
        loginUrl.search = '';
        const redirectResponse = NextResponse.redirect(loginUrl);
        supabaseResponse.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie);
        });
        return redirectResponse;
    }

    return supabaseResponse;
}

export const config = {
    matcher: ['/dashboard/:path*'],
};
