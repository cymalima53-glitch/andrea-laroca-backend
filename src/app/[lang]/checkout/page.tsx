'use client';

import { useState, useEffect } from 'react';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useNotification } from '../../../context/NotificationContext';

export default function CheckoutPage() {
    const { retailItems: items, retailItemCount: totalItems, clearRetailCart: clearCart } = useCart();
    const { user, accessToken } = useAuth();
    const { showSuccess, showError, showWarning } = useNotification();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '', // Not saving to DB in prototype but good to collect
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.username, // Or if we had a proper name field
                email: user.email,
                company: user.company_name || ''
            }));
        }
    }, [user]);


    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const shipping = subtotal > 500 ? 0 : 50;
    const total = user?.role === 'wholesale' ? 0 : subtotal + shipping;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const orderData = {
            customer_name: formData.name,
            customer_email: formData.email,
            customer_phone: formData.phone,
            customer_address: formData.address, // Added address to payload
            total_amount: total,
            items: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: user?.role === 'wholesale' ? 0 : item.price, // Zero price for WS
                name: item.name
            }))
        };

        try {
            const headers: any = { 'Content-Type': 'application/json' };
            if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
            }

            const res = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers,
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                const order = await res.json();
                await clearCart();
                if (user?.role === 'wholesale') {
                    // Custom success message for Wholesale
                    showSuccess('Order submitted! Owner will contact you soon.', 5000);
                    router.push('/catalogue'); // Or dashboard
                } else {
                    showSuccess('Order placed successfully!');
                    router.push(`/order-confirmation?id=${order.id}`);
                }
            } else {
                showError('Order failed. Please try again.');
            }
        } catch (error) {
            console.error('Order submission error', error);
            showError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0 && !loading) {
        return (
            <div className="min-h-screen pt-32 text-center text-white">
                <h1 className="text-2xl mb-4">Your cart is empty</h1>
                <button onClick={() => router.push('/')} className="underline">Return home</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-900 text-white pb-12 px-4" style={{ paddingTop: '20rem' }}>
            <div className="container mx-auto max-w-6xl">
                <h1 className="text-4xl font-serif text-gold-500 mb-8 text-center">{user?.role === 'wholesale' ? 'Wholesale Checkout' : 'Checkout'}</h1>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Form */}
                    <div className="bg-neutral-800 p-8 rounded-lg h-fit">
                        <h2 className="text-2xl font-bold mb-6">Contact & Shipping</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-400 mb-1">Full Name</label>
                                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-neutral-700 rounded p-2 text-white border border-neutral-600 focus:border-gold-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-gray-400 mb-1">Email</label>
                                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-neutral-700 rounded p-2 text-white border border-neutral-600 focus:border-gold-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-gray-400 mb-1">Phone</label>
                                <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-neutral-700 rounded p-2 text-white border border-neutral-600 focus:border-gold-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-gray-400 mb-1">Shipping Address</label>
                                <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full bg-neutral-700 rounded p-2 text-white border border-neutral-600 focus:border-gold-500 outline-none" />
                            </div>

                            {user?.role === 'wholesale' && (
                                <div className="p-4 bg-blue-900/30 border border-blue-500/50 rounded text-sm text-blue-200 mt-4">
                                    <strong>Wholesale Account:</strong> This order will be processed as a Purchase Order (Net 30 / On Account). No payment required today.
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gold-600 text-black font-bold py-4 rounded hover:bg-gold-500 transition-colors mt-6 text-lg"
                            >
                                {loading ? 'Processing...' : (user?.role === 'wholesale' ? 'Submit Purchase Order' : 'Place Order')}
                            </button>
                        </form>
                    </div>

                    {/* Summary */}
                    <div className="bg-neutral-800 p-8 rounded-lg h-fit">
                        <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
                        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between items-center bg-neutral-700/50 p-3 rounded">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-12 h-12 flex-shrink-0 bg-neutral-600 rounded overflow-hidden">
                                            <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">{item.name}</div>
                                            <div className="text-xs text-gray-400">Qty: {item.quantity}</div>
                                        </div>
                                    </div>
                                    {user?.role !== 'wholesale' && (
                                        <div className="text-gold-500 text-sm">
                                            ${(Number(item.price) * item.quantity).toFixed(2)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {user?.role !== 'wholesale' ? (
                            <div className="border-t border-neutral-700 pt-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Shipping</span>
                                    <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-gold-500 pt-2 border-t border-neutral-700 mt-2">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="border-t border-neutral-700 pt-4">
                                <p className="text-sm text-gray-400 text-center italic">
                                    Pricing will be calculated and invoiced by the owner after order review
                                    .
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
