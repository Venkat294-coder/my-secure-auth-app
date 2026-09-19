'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false); // Loading state tracker
    const router = useRouter();
    const supabase = createClient();

    const disposableEmailDomains = [
        'tempmail.com', '10minutemail.com', 'mailinator.com',
        'guerrillamail.com', 'trashmail.com', 'yopmail.com',
        'sharklasers.com', 'getnada.com', 'dispostable.com'
    ];

    const handleSignup = async (e) => {
        e.preventDefault();
        setErrorMsg('');

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
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: name } }
            });

            if (error) {
                const message = error.message.toLowerCase();
                const isRateLimited = message.includes('rate limit')
                    || message.includes('too many requests')
                    || message.includes('email_send_rate_limit');

                setErrorMsg(isRateLimited
                    ? '⚠️ Too many confirmation emails were requested. Please wait and try again later, or use an existing confirmation email.'
                    : `⚠️ ${error.message}`);
            } else {
                toast.success('Account created successfully!');
                setTimeout(() => {
                    router.push('/login');
                }, 1500);
            }
        } catch (err) {
            setErrorMsg('⚠️ Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h2>Create Account</h2>

            {/* Red Caution Error Banner */}
            {errorMsg && (
                <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid #ef4444',
                    color: '#fca5a5',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <span>{errorMsg}</span>
                </div>
            )}

            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                />
                <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                />
                <div className="password-field">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password (8+ chars, A-Z, 0-9, special)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword((visible) => !visible)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        title={showPassword ? 'Hide password' : 'Show password'}
                        disabled={loading}
                    >
                        {showPassword ? '🙈' : '👁'}
                    </button>
                </div>

                {/* Dynamic Button that changes text and dims when loading */}
                <button type="submit" disabled={loading} style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>
            <Link href="/login">Already have an account? Login</Link>
        </div>
    );
}