'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const supabase = createClient();

export default function Dashboard() {
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isToastError, setIsToastError] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let isCurrent = true;

        async function getUserData() {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();
                if (!isCurrent) return;

                if (error || !user) {
                    router.replace('/login');
                    return;
                }

                const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'Member';
                setUserName(fullName);
                setUserEmail(user.email || '');
                setIsCheckingSession(false);
            } catch {
                if (isCurrent) router.replace('/login');
            }
        }
        getUserData();

        return () => {
            isCurrent = false;
        };
    }, [router]);

    const handleLogout = async () => {
        setIsSigningOut(true);
        try {
            const { error } = await supabase.auth.signOut({ scope: 'global' });

            if (error) {
                setToastMessage('Sign out failed. Please try again.');
                setIsToastError(true);
                setIsSigningOut(false);
                return;
            }

            setIsLogoutModalOpen(false);
            setIsCheckingSession(true);
            setToastMessage('You have successfully signed out.');
            setIsToastError(false);
            router.replace('/login');
            router.refresh();
        } catch {
            setToastMessage('Sign out failed. Please try again.');
            setIsToastError(true);
            setIsSigningOut(false);
        }
    };

    if (isCheckingSession) {
        return (
            <main className="dashboard-shell">
                <p role="status">Checking your session...</p>
            </main>
        );
    }

    return (
        <main className="dashboard-shell">
            <div className="space-backdrop" aria-hidden="true">
                <span className="space-orb space-orb-indigo animate-float" />
                <span className="space-orb space-orb-cyan animate-float-delayed" />
                <span className="space-orb space-orb-fuchsia animate-float" />
            </div>
            <section className="dashboard-card">
                <div className="dashboard-heading">
                    <div>
                        <span className="dashboard-eyebrow">ANCHOR / PRIVATE ACCESS</span>
                        <h1 className="dashboard-title">Welcome, {userName}.</h1>
                        <p className="dashboard-description">
                            {userEmail ? `Signed in as ${userEmail}. ` : ''}
                            Your secure space is ready.
                        </p>
                    </div>
                    <span className="dashboard-mark" aria-hidden="true">✳</span>
                </div>
                <button
                    type="button"
                    className="dashboard-signout"
                    onClick={() => setIsLogoutModalOpen(true)}
                >
                    Sign Out
                </button>
            </section>

            {isLogoutModalOpen && (
                <div
                    role="presentation"
                    className="dialog-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !isSigningOut) {
                            setIsLogoutModalOpen(false);
                        }
                    }}
                >
                    <section
                        aria-labelledby="sign-out-title"
                        aria-modal="true"
                        role="dialog"
                        className="dialog-card"
                    >
                        <h2 id="sign-out-title" className="dialog-title">Sign out?</h2>
                        <p className="dialog-message">Are you sure you want to sign out of your account?</p>
                        <div className="dialog-actions">
                            <button
                                type="button"
                                onClick={() => setIsLogoutModalOpen(false)}
                                disabled={isSigningOut}
                                className="dialog-cancel"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleLogout}
                                disabled={isSigningOut}
                                className="dialog-confirm"
                            >
                                {isSigningOut ? 'Signing Out...' : 'Yes, Sign Out'}
                            </button>
                        </div>
                    </section>
                </div>
            )}

            {toastMessage && (
                <div
                    role="status"
                    aria-live="polite"
                    className={`app-toast${isToastError ? ' app-toast-error' : ''}`}
                >
                    {toastMessage}
                </div>
            )}
        </main>
    );
}
