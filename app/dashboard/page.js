'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const supabase = createClient();

export default function Dashboard() {
    const [userName, setUserName] = useState('');
    const router = useRouter();

    useEffect(() => {
        async function getUserData() {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) {
                router.push('/login');
            } else {
                const fullName = user.user_metadata?.full_name || user.user_metadata?.name || 'User';
                setUserName(fullName);
            }
        }
        getUserData();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <div className="container" style={{ textAlign: 'center' }}>
            <h1>Hello Welcome, {userName}! 🎉</h1>
            <p>You have successfully entered your secure account area.</p>
            <button onClick={handleLogout} style={{ backgroundColor: '#ff4d4f' }}>Logout</button>
        </div>
    );
}