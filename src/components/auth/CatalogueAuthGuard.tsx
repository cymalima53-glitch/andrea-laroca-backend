'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * WholesaleCartGuard — used only to protect the wholesale CART and CHECKOUT pages.
 * The catalogue itself is PUBLIC — anyone can browse without logging in.
 *
 * This guard:
 *  - Lets guests through to any public page (catalogue browsing)
 *  - For cart/checkout: redirects unapproved users to login
 */
export default function CatalogueAuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not logged in → send to login
                router.push('/auth/login');
            } else if (user.role === 'wholesale' && user.approval_status !== 'approved') {
                // Wholesale but pending/rejected — can't access cart
                router.push('/en/catalogue');
            }
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="text-[#d4af37] text-xl font-serif">Loading...</div>
            </div>
        );
    }

    if (!user) return null; // redirecting

    if (user.role === 'wholesale' && user.approval_status !== 'approved') {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
                <h2 className="text-3xl font-bold text-[#d4af37] mb-4 font-serif">Account Pending Approval</h2>
                <p className="text-gray-600 max-w-md">
                    Thank you for registering. Your wholesale account is currently under review.
                    We will notify you by email once approved.
                </p>
            </div>
        );
    }

    return <>{children}</>;
}
