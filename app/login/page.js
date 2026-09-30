'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { toast } from 'react-toastify';
import Link from 'next/link';
import TurnstileWidget from '@/app/components/turnstile-widget';
import { getTurnstileToken, isTurnstileEnabled, resetTurnstile } from '@/lib/turnstile';

export default function LoginPage() {
    return (
        <Suspense fallback={<main className="auth-shell"><section className="auth-main"><p role="status">Loading sign-in...</p></section></main>}>
            <LoginForm />
        </Suspense>
    );
}

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    // Handle Manual Email/Password Login
    const handleLogin = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const captchaToken = getTurnstileToken(form);
        setErrorMsg('');
        if (isTurnstileEnabled() && !captchaToken) {
            setErrorMsg('Complete the security check before signing in.');
            return;
        }
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
                options: { captchaToken: captchaToken || undefined },
            });

            if (error) {
                const isUnverified = error.code === 'email_not_confirmed'
                    || error.message.toLowerCase().includes('email not confirmed');
                setErrorMsg(isUnverified
                    ? 'Please verify your email using the confirmation link we sent before signing in.'
                    : 'Incorrect email or password. Please try again.');
                return;
            }

            toast.success('Login successful! ❤️');
            router.push('/dashboard');
            router.refresh();
        } catch {
            setErrorMsg('Unable to sign in right now. Please try again.');
        } finally {
            setLoading(false);
            if (isTurnstileEnabled()) resetTurnstile(form);
        }
    };

    // Handle Google OAuth Login
    const handleGoogleLogin = async () => {
        setErrorMsg('');
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                setErrorMsg('Google sign-in is temporarily unavailable. Please try again.');
            }
        } catch {
            setErrorMsg('Google sign-in is temporarily unavailable. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-shell">
            <div className="space-backdrop" aria-hidden="true">
                <span className="space-orb space-orb-indigo animate-float" />
                <span className="space-orb space-orb-cyan animate-float-delayed" />
                <span className="space-orb space-orb-fuchsia animate-float" />
            </div>
            <aside className="auth-story">
                <div className="auth-brand">
                    <span className="auth-brand-mark" aria-hidden="true">✳</span>
                    <span>ANCHOR / PRIVATE ACCESS</span>
                </div>
                <div className="auth-story-copy">
                    <span className="auth-eyebrow">Your space, secured</span>
                    <h2 className="auth-story-title">Good to see you again.</h2>
                    <p className="auth-story-description">A calmer, clearer way into your account. Your private space is right where you left it.</p>
                </div>
                <div className="auth-story-notes" aria-label="Account security details">
                    <div className="auth-story-note"><span>01 / PRIVATE</span>Personal access</div>
                    <div className="auth-story-note"><span>02 / SECURE</span>Protected sign-in</div>
                    <div className="auth-story-note"><span>03 / YOURS</span>Always in control</div>
                </div>
            </aside>

            <section className="auth-main">
                <div className="auth-card">
                    <span className="auth-card-kicker">Member access / 01</span>
                    <h1 className="auth-title">Welcome back</h1>
                    <p className="auth-subtitle">Sign in to continue to your secure dashboard.</p>

                    {(errorMsg || searchParams.has('error')) && (
                        <div className="auth-error" role="alert">
                            {errorMsg || 'We could not complete sign-in. Please try again.'}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="auth-form">
                        <TurnstileWidget />
                        <div className="auth-field">
                            <label className="auth-label" htmlFor="login-email">Email address</label>
                            <input
                                id="login-email"
                                type="email"
                                required
                                disabled={loading}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="auth-input"
                                autoComplete="email"
                            />
                        </div>

                        <div className="auth-field">
                            <label className="auth-label" htmlFor="login-password">Password</label>
                            <div className="password-input-wrap">
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    disabled={loading}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="auth-input"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="password-reveal"
                                    onClick={() => setShowPassword((visible) => !visible)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    title={showPassword ? 'Hide password' : 'Show password'}
                                    aria-pressed={showPassword}
                                    disabled={loading}
                                >
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                                        <circle cx="12" cy="12" r="3" />
                                        {showPassword && <path d="m4 4 16 16" />}
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="auth-primary">
                            {loading ? 'Signing in...' : 'Sign in securely'}
                        </button>
                    </form>

                    <div className="auth-divider">Or continue with</div>
                    <button onClick={handleGoogleLogin} type="button" className="auth-google" disabled={loading}>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.3L1.6 15.9C3.5 19.7 7.4 23 12 23z" />
                            <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.6 6.4C.6 8.4 0 10.6 0 13s.6 4.6 1.6 6.6l3.7-2.9z" />
                            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.1 8.9 5 12 5z" />
                        </svg>
                        {loading ? 'Connecting...' : 'Continue with Google'}
                    </button>

                    <p className="auth-footer">
                        New here?{' '}
                        <Link href="/signup" className="auth-link">Create your account</Link>
                    </p>
                </div>
            </section>
        </main>
    );
}