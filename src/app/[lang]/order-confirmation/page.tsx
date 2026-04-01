'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function OrderConfirmationContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id') || 'Unknown';

    return (
        <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center p-4">
            <div className="bg-neutral-800 p-8 rounded-lg shadow-xl text-center max-w-md w-full">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-3xl font-serif text-gold-500 mb-2">Order Confirmed!</h1>
                <p className="text-gray-300 mb-6">
                    Thank you for your order. Your confirmation number is <strong>#{id}</strong>.
                </p>
                <p className="text-gray-400 text-sm mb-8">
                    We have sent a confirmation email to your inbox.
                </p>

                <Link href="/" className="inline-block w-full bg-gold-600 text-black font-bold py-3 rounded hover:bg-gold-500 transition-colors">
                    Return to Home
                </Link>
            </div>
        </div>
    );
}

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white">Loading...</div>}>
            <OrderConfirmationContent />
        </Suspense>
    );
}
