'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import RegistrationForm from '@/components/auth/RegistrationForm';

import styles from './login.module.css';

function AuthContent() {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState('login');

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'register') {
            setActiveTab('register');
        } else {
            setActiveTab('login');
        }
    }, [searchParams]);

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginContainer}>
                {/* Header */}
                <div className={styles.header}>
                    <h1 className="text-4xl font-serif font-bold text-[#d4af37] tracking-wider mb-2">LA ROCCA</h1>
                    <h2 className="text-lg text-[#d4af37]/80 tracking-wide">WHOLESALE PORTAL</h2>
                </div>

                {/* Tabs & Form Wrapper */}
                <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
                    {/* Tabs */}
                    <div className={styles.tabs}>
                        <button
                            onClick={() => setActiveTab('login')}
                            className={`${styles.tabBtn} ${activeTab === 'login' ? styles.activeTab : ''}`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setActiveTab('register')}
                            className={`${styles.tabBtn} ${activeTab === 'register' ? styles.activeTab : ''}`}
                        >
                            New Application
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-8">
                        <div className="transition-all duration-300 ease-in-out">
                            {activeTab === 'login' ? (
                                <div className="animate-fade-in">
                                    <LoginForm />
                                </div>
                            ) : (
                                <div className="animate-fade-in">
                                    <RegistrationForm />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-neutral-900 flex items-center justify-center text-gold-500">Loading...</div>}>
            <AuthContent />
        </Suspense>
    );
}
