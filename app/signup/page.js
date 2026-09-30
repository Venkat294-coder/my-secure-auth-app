'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';
import TurnstileWidget from '@/app/components/turnstile-widget';
import { getTurnstileToken, isTurnstileEnabled, resetTurnstile } from '@/lib/turnstile';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false); // Loading state tracker
    const [confirmationEmail, setConfirmationEmail] = useState('');
    const router = useRouter();
    const supabase = createClient();

    const disposableEmailDomains = [
        'tempmail.com', '10minutemail.com', 'mailinator.com',
        'guerrillamail.com', 'trashmail.com', 'yopmail.com',
        'sharklasers.com', 'getnada.com', 'dispostable.com'
    ];

    const handleSignup = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const captchaToken = getTurnstileToken(form);
        setErrorMsg('');

        if (isTurnstileEnabled() && !captchaToken) {
            setErrorMsg('Complete the security check before creating your account.');
            return;
        }

        if (!name || !email || !password) {
            setErrorMsg('All fields are required!');
            return;
        }

        // Check Disposable Email Restriction
        const emailDomain = email.split('@')[1]?.toLowerCase();
        if (disposableEmailDomains.includes(emailDomain)) {
            setErrorMsg('⚠️ Temporary or disposable email addresses are not allowed!');
            return;
        }

        // Strong Password Validation Rules
        if (password.length < 8) {
            setErrorMsg('⚠️ Password must be at least 8 characters long.');
            return;
        }
        if (!/[A-Z]/.test(password)) {
            setErrorMsg('⚠️ Password must contain an uppercase letter.');
            return;
        }
        if (!/[a-z]/.test(password)) {
            setErrorMsg('⚠️ Password must contain a lowercase letter.');
            return;
        }
        if (!/[0-9]/.test(password)) {
            setErrorMsg('⚠️ Password must contain a number.');
            return;
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            setErrorMsg('⚠️ Password must contain a special symbol.');
            return;
        }

        setLoading(true); // Start loading state

        try {
            // Await Supabase network request safely before proceeding
            const normalizedEmail = email.trim().toLowerCase();
            const { data, error } = await supabase.auth.signUp({
                email: normalizedEmail,
                password,
                options: {
                    data: { full_name: name },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    captchaToken: captchaToken || undefined,
                },
            });

            if (error) {
                const message = error.message.toLowerCase();
                const isRateLimited = message.includes('rate limit')
                    || message.includes('too many requests')
                    || message.includes('email_send_rate_limit');
                const isDuplicateEmail = error.code === 'user_already_exists'
                    || error.code === 'email_exists'
                    || message.includes('already registered')
                    || message.includes('already exists');

                setErrorMsg(isRateLimited
                    ? '⚠️ Too many confirmation emails were requested. Please wait and try again later, or use an existing confirmation email.'
                    : isDuplicateEmail
                        ? 'An account may already exist for this email. Try signing in or use a different address.'
                        : 'Unable to create your account right now. Please check your details and try again.');
            } else if (data.user && !data.session) {
                if (data.user.identities?.length === 0) {
                    setErrorMsg('If an account already exists for this email, sign in instead. Otherwise, check your inbox for a confirmation link.');
                } else {
                    setConfirmationEmail(normalizedEmail);
                }
            } else {
                toast.success('Account created successfully!');
                router.push('/dashboard');
            }
        } catch {
            setErrorMsg('⚠️ Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
            if (isTurnstileEnabled()) resetTurnstile(form);
        }
    };

    const handleResendConfirmation = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const captchaToken = getTurnstileToken(form);
        if (isTurnstileEnabled() && !captchaToken) {
            setErrorMsg('Complete the security check before requesting another email.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: confirmationEmail,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    captchaToken: captchaToken || undefined,
                },
            });
            if (error) {
                setErrorMsg('Unable to resend the confirmation email right now. Please try again later.');
            } else {
                setErrorMsg('');
                toast.success('A new confirmation email has been sent.');
            }
        } catch {
            setErrorMsg('Unable to resend the email right now. Please try again.');
        } finally {
            setLoading(false);
            if (isTurnstileEnabled()) resetTurnstile(form);
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
                    <span className="auth-eyebrow">A space that stays yours</span>
                    <h2 className="auth-story-title">Start with a clean slate.</h2>
                    <p className="auth-story-description">One account for your secure space. Set up your details and you are ready to go.</p>
                </div>
                <div className="auth-story-notes" aria-label="Account setup details">
                    <div className="auth-story-note"><span>01 / CREATE</span>Your account</div>
                    <div className="auth-story-note"><span>02 / PROTECT</span>Strong password</div>
                    <div className="auth-story-note"><span>03 / ENTER</span>Your workspace</div>
                </div>
            </aside>

            <section className="auth-main">
                <div className="auth-card">
                    <span className="auth-card-kicker">New membership / 02</span>
                    {confirmationEmail ? (
                        <>
                            <h1 className="auth-title">Check your inbox</h1>
                            <p className="auth-success">
                                We sent a confirmation link to <strong>{confirmationEmail}</strong>. Open it to verify your email and finish creating your account.
                            </p>
                            {errorMsg && <div className="auth-error" role="alert">{errorMsg}</div>}
                            <form onSubmit={handleResendConfirmation} className="auth-form">
                                <TurnstileWidget />
                                <button type="submit" disabled={loading} className="auth-primary">
                                    {loading ? 'Sending...' : 'Resend confirmation email'}
                                </button>
                            </form>
                            <p className="auth-footer">
                                Already verified?{' '}
                                <Link href="/login" className="auth-link">Sign in</Link>
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className="auth-title">Create account</h1>
                            <p className="auth-subtitle">Start your private workspace with a few details.</p>

                            {errorMsg && <div className="auth-error" role="alert">{errorMsg}</div>}

                            <form onSubmit={handleSignup} className="auth-form">
                                <TurnstileWidget />
                                <div className="auth-field">
                                    <label className="auth-label" htmlFor="signup-name">Full name</label>
                                    <input
                                        id="signup-name"
                                        type="text"
                                        required
                                        maxLength={120}
                                        placeholder="Your name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={loading}
                                        className="auth-input"
                                        autoComplete="name"
                                    />
                                </div>
                                <div className="auth-field">
                                    <label className="auth-label" htmlFor="signup-email">Email address</label>
                                    <input
                                        id="signup-email"
                                        type="email"
                                        required
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                        className="auth-input"
                                        autoComplete="email"
                                    />
                                </div>
                                <div className="auth-field">
                                    <label className="auth-label" htmlFor="signup-password">Password</label>
                                    <div className="password-input-wrap">
                                        <input
                                            id="signup-password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            placeholder="8+ characters, mixed case, number, symbol"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={loading}
                                            className="auth-input"
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            className="password-reveal"
                                            onClick={() => setShowPassword((visible) => !visible)}
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            disabled={loading}
                                        >
                                            {showPassword ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" disabled={loading} className="auth-primary">
                                    {loading ? 'Creating account...' : 'Create your account'}
                                </button>
                            </form>

                            <p className="auth-footer">
                                Already a member?{' '}
                                <Link href="/login" className="auth-link">Sign in</Link>
                            </p>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
}