'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function Login() {
    const [email, setEmail] = useState(() => (
        typeof window === 'undefined'
            ? ''
            : new URLSearchParams(window.location.search).get('email') || ''
    ));
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e) => {
        e.preventDefault();
        const trimmedEmail = email.trim().toLowerCase();
        if (!trimmedEmail || !password) return toast.error('Please enter email and password');

        setIsSubmitting(true);
        const { error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
        setIsSubmitting(false);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Login Successful!');
            router.push('/dashboard');
        }
    };

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) toast.error(error.message);
    };

    return (
        <div className="container">
            <h2>Welcome Back</h2>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
                <div className="password-field">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword((visible) => !visible)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        title={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? '🙈' : '👁'}
                    </button>
                </div>
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <button onClick={handleGoogleLogin} className="google-btn">
                Sign in with Google
            </button>

            <Link href="/signup">Don&apos;t have an account? Sign Up</Link>
        </div>
    );
}