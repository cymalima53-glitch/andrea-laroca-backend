'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CatalogueAuthGuard from '../../../components/auth/CatalogueAuthGuard';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { useNotification } from '../../../context/NotificationContext';

export default function WholesaleCheckoutPage() {
    const { user, accessToken } = useAuth();
    const { wholesaleItems, clearWholesaleCart, wholesaleLoading } = useCart();
    const { showSuccess, showError } = useNotification();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        shippingAddress: '',
        notes: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Prepare order data
        const orderData = {
            userId: user?.id,
            customerName: user?.username || 'Wholesale Customer',
            customerEmail: user?.email,
            shippingAddress: formData.shippingAddress,
            notes: formData.notes,
            items: wholesaleItems.map(item => ({
                product_id: item.productId,
                quantity: item.quantity,
                price_at_time: 0 // Wholesale requests start at 0 until priced
            }))
        };

        try {
            console.log('📦 Wholesale Order Data:', orderData);
            console.log('📦 Wholesale Items:', wholesaleItems);

            const res = await fetch('http://localhost:5000/api/wholesale/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(orderData)
            });

            console.log('📦 Response Status:', res.status);
            const responseData = await res.json();
            console.log('📦 Response Data:', responseData);

            if (res.ok) {
                setSubmitted(true);
                clearWholesaleCart(); // Clear API cart and any local sync
                showSuccess('Quote request submitted successfully!');
            } else {
                showError('Failed to submit quote request. Please try again.');
            }
        } catch (error) {
            console.error('📦 Error:', error);
            showError('Error submitting request.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #1a0a00 0%, #2c1810 50%, #1a0a00 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
            }}>
                <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(212,175,55,0.3)',
                    borderRadius: '24px',
                    padding: '3.5rem 3rem',
                    maxWidth: '480px',
                    width: '100%',
                    textAlign: 'center',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.2)',
                    backdropFilter: 'blur(20px)',
                }}>
                    {/* Animated checkmark circle */}
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #d4af37, #f0d060)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 2rem',
                        boxShadow: '0 8px 32px rgba(212,175,55,0.5)',
                    }}>
                        <span style={{ fontSize: '2rem', color: '#2c1810' }}>✓</span>
                    </div>

                    {/* Gold divider */}
                    <div style={{
                        width: '48px',
                        height: '2px',
                        background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
                        margin: '0 auto 1.5rem',
                    }} />

                    <p style={{
                        fontSize: '0.75rem',
                        letterSpacing: '0.25em',
                        color: '#d4af37',
                        textTransform: 'uppercase',
                        marginBottom: '0.75rem',
                        fontFamily: 'var(--font-sans)',
                    }}>Quote Request Received</p>

                    <h2 style={{
                        fontSize: '2rem',
                        fontFamily: 'var(--font-serif)',
                        color: '#fff',
                        fontWeight: 700,
                        marginBottom: '1rem',
                        letterSpacing: '0.02em',
                    }}>Thank You!</h2>

                    <p style={{
                        color: 'rgba(255,255,255,0.6)',
                        lineHeight: 1.8,
                        fontSize: '0.95rem',
                        marginBottom: '2.5rem',
                        fontFamily: 'var(--font-sans)',
                    }}>
                        Your request has been sent to our sales team. We will review your order and send a personalised invoice with pricing shortly.
                    </p>

                    {/* Gold divider */}
                    <div style={{
                        width: '100%',
                        height: '1px',
                        background: 'rgba(212,175,55,0.15)',
                        marginBottom: '2.5rem',
                    }} />

                    {/* Premium CTA button */}
                    <button
                        onClick={() => router.push('/catalogue')}
                        style={{
                            width: '100%',
                            padding: '1rem 2rem',
                            background: 'linear-gradient(135deg, #d4af37 0%, #f0d060 50%, #d4af37 100%)',
                            backgroundSize: '200% 100%',
                            color: '#2c1810',
                            border: 'none',
                            borderRadius: '50px',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            boxShadow: '0 8px 32px rgba(212,175,55,0.35)',
                            transition: 'all 0.3s ease',
                            fontFamily: 'var(--font-sans)',
                        }}
                        onMouseEnter={e => {
                            (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                            (e.target as HTMLButtonElement).style.boxShadow = '0 12px 40px rgba(212,175,55,0.55)';
                        }}
                        onMouseLeave={e => {
                            (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                            (e.target as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(212,175,55,0.35)';
                        }}
                    >
                        ← Back to Catalogue
                    </button>
                </div>
            </div>
        );
    }

    if (wholesaleLoading) {
        return <div className="min-h-screen bg-[#f9fafb] pt-32 flex justify-center text-gray-500 font-serif">Loading...</div>;
    }

    return (
        <CatalogueAuthGuard>
            <div className="min-h-screen bg-[#f9fafb] pt-32 pb-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-serif text-[#2c1810] mb-8 font-bold">Request Wholesale Quote</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Form */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-bold mb-6 text-[#d4af37] font-serif">Customer Details</h2>
                            <form id="quote-form" onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Company / Name</label>
                                    <input
                                        type="text"
                                        value={user?.username || ''}
                                        readOnly
                                        className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-gray-600 cursor-not-allowed"
                                        title="Logged in user name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        readOnly
                                        className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-gray-600 cursor-not-allowed"
                                        title="Logged in user email"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                                    <textarea
                                        name="shippingAddress"
                                        value={formData.shippingAddress}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter full shipping address..."
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                                        rows={3}
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        placeholder="Special instructions..."
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-[#d4af37] focus:border-[#d4af37]"
                                        rows={2}
                                    ></textarea>
                                </div>
                            </form>
                        </div>

                        {/* Summary */}
                        <div className="bg-white p-6 rounded-lg shadow h-fit">
                            <h2 className="text-xl font-bold mb-6 text-[#d4af37] font-serif">Order Summary</h2>
                            <div className="bg-gray-50 rounded p-4 mb-6 max-h-80 overflow-y-auto">
                                {wholesaleItems.length > 0 ? (
                                    <ul className="space-y-3">
                                        {wholesaleItems.map((item, idx) => (
                                            <li key={idx} className="flex justify-between items-start text-sm">
                                                <span className="text-gray-700">
                                                    <span className="font-bold">{item.quantity}x</span> {item.name}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-400 italic">No items in quote.</p>
                                )}
                            </div>

                            <div className="border-t border-gray-100 pt-4 mb-6">
                                <div className="flex justify-between items-center font-bold text-[#2c1810]">
                                    <span>Total Items</span>
                                    <span>{wholesaleItems.reduce((acc, item) => acc + item.quantity, 0)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
                                    <span>Estimated Total</span>
                                    <span>To be quoted</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                form="quote-form"
                                disabled={loading || wholesaleItems.length === 0}
                                className={`btn-primary w-full ${loading || wholesaleItems.length === 0 ? 'bg-gray-300 cursor-not-allowed opacity-50' : ''}`}
                            >
                                {loading ? 'Submitting...' : 'SUBMIT REQUEST'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </CatalogueAuthGuard>
    );
}
