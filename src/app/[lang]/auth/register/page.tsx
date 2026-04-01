'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const router = useRouter();

    useEffect(() => {
        router.push('/auth/login?tab=register');
    }, [router]);

    return (
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
            <div className="text-gold-500 animate-pulse">Redirecting to Wholesale Portal...</div>
        </div>
    );
}
