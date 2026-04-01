'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, Trash2, FileText, ShoppingBag, RotateCcw, Archive } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';

type Tab = 'wholesale' | 'retail' | 'deleted';

export default function AdminOrdersPage() {
    const { accessToken: token } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('wholesale');
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    const toggleExpand = (id: string) => setExpandedOrderId(prev => prev === id ? null : id);

    // Wholesale Quote State
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [quotePrice, setQuotePrice] = useState('');

    // Retail Shipping State
    const [isShippedModalOpen, setIsShippedModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [trackingInfo, setTrackingInfo] = useState({ carrier: '', trackingNumber: '' });

    const router = useRouter();

    useEffect(() => {
        if (token) fetchOrders();
    }, [token, activeTab]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            let endpoint: string;

            if (activeTab === 'deleted') {
                // Fetch deleted from both tables, merge them
                const [wsRes, rtRes] = await Promise.all([
                    fetch('http://localhost:5000/api/wholesale/orders/deleted', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch('http://localhost:5000/api/orders/retail/deleted', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                const wsData = wsRes.ok ? await wsRes.json() : [];
                const rtData = rtRes.ok ? await rtRes.json() : [];

                const wsOrders = (Array.isArray(wsData) ? wsData : []).map((o: any) => ({ ...o, _source: 'wholesale' }));
                const rtOrders = ((rtData.orders || rtData) as any[]).map((o: any) => ({ ...o, _source: 'retail' }));

                // Sort merged list by deleted_at desc
                const merged = [...wsOrders, ...rtOrders].sort(
                    (a, b) => new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime()
                );
                setOrders(merged);
            } else {
                endpoint = activeTab === 'wholesale'
                    ? 'http://localhost:5000/api/wholesale/orders'
                    : 'http://localhost:5000/api/orders/retail';

                const res = await fetch(endpoint, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    const ordersData = data.orders || data.quotes || data;
                    setOrders(Array.isArray(ordersData) ? ordersData : []);
                } else {
                    setOrders([]);
                }
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    // Soft delete — sets deleted_at, order disappears from active tabs
    const handleDelete = async (orderId: string) => {
        if (!confirm('Remove this order? It can be restored from the Deleted tab.')) return;

        try {
            const endpoint = activeTab === 'wholesale'
                ? `http://localhost:5000/api/wholesale/orders/${orderId}`
                : `http://localhost:5000/api/orders/retail/${orderId}`;

            const res = await fetch(endpoint, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setOrders(prev => prev.filter(o => o.id !== orderId));
                showSuccess('Order removed (can be restored from Deleted tab)');
            } else {
                showError('Failed to remove order');
            }
        } catch (err) {
            console.error(err);
            showError('Error removing order');
        }
    };

    // Restore a soft-deleted order
    const handleRestore = async (order: any) => {
        try {
            const endpoint = order._source === 'wholesale'
                ? `http://localhost:5000/api/wholesale/orders/${order.id}/restore`
                : `http://localhost:5000/api/orders/retail/${order.id}/restore`;

            const res = await fetch(endpoint, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setOrders(prev => prev.filter(o => o.id !== order.id));
                showSuccess('Order restored successfully!');
            } else {
                showError('Failed to restore order');
            }
        } catch (err) {
            console.error(err);
            showError('Error restoring order');
        }
    };

    const handleSetPrice = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrder || !quotePrice) return;

        try {
            const res = await fetch(`http://localhost:5000/api/orders/${selectedOrder.id}/quote`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    total_amount: parseFloat(quotePrice),
                    status: 'Awaiting Payment'
                })
            });

            if (res.ok) {
                showSuccess('Quote sent to customer!');
                setSelectedOrder(null);
                setQuotePrice('');
                fetchOrders();
            } else {
                showError('Failed to update order.');
            }
        } catch (err) {
            console.error(err);
            showError('Error updating order.');
        }
    };

    const handleMarkShipped = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrderId) return;

        try {
            const res = await fetch(`http://localhost:5000/api/orders/retail/${selectedOrderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'Shipped' })
            });

            if (res.ok) {
                showSuccess('Order marked as Shipped!');
                setIsShippedModalOpen(false);
                setSelectedOrderId(null);
                setTrackingInfo({ carrier: '', trackingNumber: '' });
                fetchOrders();
            } else {
                showError('Failed to update order status.');
            }
        } catch (err) {
            console.error(err);
            showError('Error updating order.');
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen text-[#2c1810]">
            <h1 className="text-3xl font-bold mb-8 font-serif">Order Management</h1>

            {/* Tabs */}
            <div className="flex justify-center mb-10">
                <div className="bg-[#2c1810] p-1.5 rounded-2xl shadow-2xl border border-[#d4af37]/20 inline-flex items-center gap-2">
                    <button
                        onClick={() => setActiveTab('wholesale')}
                        className={`flex items-center gap-3 px-8 py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 ${activeTab === 'wholesale'
                            ? 'bg-gradient-to-r from-[#B8860B] to-[#9A7C0F] text-white shadow-lg transform scale-105 ring-1 ring-[#FAFAD2]/30'
                            : 'text-gray-400 hover:text-[#d4af37] hover:bg-white/5'
                            }`}
                    >
                        <FileText size={18} />
                        WHOLESALE QUOTES
                    </button>
                    <button
                        onClick={() => setActiveTab('retail')}
                        className={`flex items-center gap-3 px-8 py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 ${activeTab === 'retail'
                            ? 'bg-gradient-to-r from-[#B8860B] to-[#9A7C0F] text-white shadow-lg transform scale-105 ring-1 ring-[#FAFAD2]/30'
                            : 'text-gray-400 hover:text-[#d4af37] hover:bg-white/5'
                            }`}
                    >
                        <ShoppingBag size={18} />
                        RETAIL ORDERS
                    </button>
                    <button
                        onClick={() => setActiveTab('deleted')}
                        className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 ${activeTab === 'deleted'
                            ? 'bg-gradient-to-r from-red-800 to-red-900 text-white shadow-lg transform scale-105 ring-1 ring-red-400/30'
                            : 'text-gray-500 hover:text-red-400 hover:bg-white/5'
                            }`}
                    >
                        <Archive size={16} />
                        DELETED
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading orders...</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full text-left">
                        <thead className={`text-white ${activeTab === 'deleted' ? 'bg-red-900' : 'bg-[#2c1810]'}`}>
                            <tr>
                                <th className="p-4">Order #</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">{activeTab === 'deleted' ? 'Deleted On' : 'Date'}</th>
                                {activeTab !== 'deleted' && <th className="p-4">Status</th>}
                                {activeTab === 'deleted' && <th className="p-4">Type</th>}
                                <th className="p-4 text-right">Total</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.length > 0 ? (
                                orders.map(order => {
                                    const orderId = String(order.order_id || order.id);
                                    const isExpanded = expandedOrderId === orderId;
                                    const items: any[] = Array.isArray(order.items)
                                        ? order.items
                                        : (typeof order.items === 'string' ? JSON.parse(order.items || '[]') : []);

                                    return (<React.Fragment key={orderId}>
                                        <tr key={`${order._source || activeTab}-${order.id}`}
                                            className={`hover:bg-gray-50 ${activeTab === 'deleted' ? 'opacity-75' : ''} ${isExpanded ? 'bg-amber-50' : ''}`}>
                                            <td className="p-4 font-mono font-bold">
                                                <button
                                                    onClick={() => toggleExpand(orderId)}
                                                    className="flex items-center gap-1.5 hover:text-[#d4af37] transition-colors group"
                                                    title="Click to see order items"
                                                >
                                                    <span className="text-gray-400 text-xs group-hover:text-[#d4af37] transition-colors">
                                                        {isExpanded ? '▼' : '▶'}
                                                    </span>
                                                    #{order.order_id || order.id}
                                                </button>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold">{order.customer_name}</div>
                                                <div className="text-sm text-gray-500">{order.customer_email}</div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-500">
                                                {activeTab === 'deleted'
                                                    ? new Date(order.deleted_at).toLocaleDateString()
                                                    : new Date(order.created_at).toLocaleDateString()
                                                }
                                            </td>
                                            {activeTab !== 'deleted' && (
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${order.status === 'Pending Pricing' ? 'bg-blue-100 text-blue-700' :
                                                        order.status === 'Pending Payment' ? 'bg-yellow-100 text-yellow-700' :
                                                            order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                                order.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                                                                    'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                            )}
                                            {activeTab === 'deleted' && (
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${order._source === 'wholesale'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-purple-100 text-purple-700'
                                                        }`}>
                                                        {order._source}
                                                    </span>
                                                </td>
                                            )}
                                            <td className="p-4 text-right font-bold">
                                                {order.total_amount > 0 || order.total > 0
                                                    ? `$${parseFloat(order.total_amount || order.total).toFixed(2)}`
                                                    : '-'}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {activeTab !== 'deleted' && (
                                                        <>
                                                            {activeTab === 'wholesale' && order.status === 'Pending Pricing' && (
                                                                <button
                                                                    onClick={() => { setSelectedOrder(order); setQuotePrice(''); }}
                                                                    className="bg-[#d4af37] text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-[#b5952f] transition-colors"
                                                                >
                                                                    SET PRICE
                                                                </button>
                                                            )}
                                                            {activeTab === 'retail' && order.status !== 'Shipped' && order.status !== 'Completed' && (
                                                                <button
                                                                    onClick={() => { setSelectedOrderId(order.id); setIsShippedModalOpen(true); }}
                                                                    style={{ background: 'linear-gradient(to right, #B8860B, #9A7C0F)' }}
                                                                    className="text-white px-3 py-1.5 rounded-md text-[13px] font-semibold flex items-center gap-1.5 shadow-sm hover:brightness-110 transition-all"
                                                                >
                                                                    <span>✈️</span> SHIP
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDelete(order.id)}
                                                                style={{ background: 'linear-gradient(to right, #C41E3A, #A01830)' }}
                                                                className="text-white px-3 py-1.5 rounded-md text-[13px] font-semibold flex items-center gap-1.5 shadow-sm hover:brightness-110 transition-all"
                                                                title="Remove Order"
                                                            >
                                                                <Trash2 size={13} /> REMOVE
                                                            </button>
                                                        </>
                                                    )}
                                                    {activeTab === 'deleted' && (
                                                        <button
                                                            onClick={() => handleRestore(order)}
                                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-md text-[13px] font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                                                            title="Restore Order"
                                                        >
                                                            <RotateCcw size={13} /> RESTORE
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>

                                        {/* ── Expandable items row ─────────────────────────── */}
                                        {isExpanded && (
                                            <tr key={`items-${orderId}`} className="bg-amber-50 border-t border-amber-100">
                                                <td colSpan={6} className="px-6 pb-5 pt-2">
                                                    <div className="text-xs font-bold text-[#9a7c0f] uppercase tracking-widest mb-3 flex items-center gap-2">
                                                        <span>📦</span> Order Items
                                                        {order.customer_address && (
                                                            <span className="ml-auto font-normal text-gray-500 normal-case tracking-normal">
                                                                🚚 {order.customer_address}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {items.length > 0 ? (
                                                        <table className="w-full text-sm">
                                                            <thead>
                                                                <tr className="text-xs text-gray-400 border-b border-amber-200">
                                                                    <th className="text-left pb-2 font-semibold">Product</th>
                                                                    <th className="text-center pb-2 font-semibold">Qty</th>
                                                                    <th className="text-right pb-2 font-semibold">Unit Price</th>
                                                                    <th className="text-right pb-2 font-semibold">Subtotal</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {items.map((item: any, idx: number) => (
                                                                    <tr key={idx} className="border-b border-amber-100 last:border-0">
                                                                        <td className="py-2 font-medium text-[#2c1810]">
                                                                            {item.name || item.product_name || `Product #${item.product_id}`}
                                                                        </td>
                                                                        <td className="py-2 text-center text-gray-600">{item.quantity}</td>
                                                                        <td className="py-2 text-right text-gray-600">
                                                                            ${parseFloat(item.price || item.price_at_time || 0).toFixed(2)}
                                                                        </td>
                                                                        <td className="py-2 text-right font-semibold text-[#2c1810]">
                                                                            ${(parseFloat(item.price || item.price_at_time || 0) * item.quantity).toFixed(2)}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                            <tfoot>
                                                                <tr className="border-t-2 border-amber-300">
                                                                    <td colSpan={3} className="pt-2 text-right text-xs text-gray-500 font-semibold pr-4">
                                                                        {order.shipping_cost > 0 && `+ $${parseFloat(order.shipping_cost).toFixed(2)} shipping`}
                                                                        {order.tax > 0 && `  + $${parseFloat(order.tax).toFixed(2)} tax`}
                                                                    </td>
                                                                    <td className="pt-2 text-right font-bold text-[#2c1810]">
                                                                        Total: ${parseFloat(order.total_amount || order.total || 0).toFixed(2)}
                                                                    </td>
                                                                </tr>
                                                            </tfoot>
                                                        </table>
                                                    ) : (
                                                        <p className="text-gray-400 italic text-sm">No item details available for this order.</p>
                                                    )}

                                                    {/* Payment / Stripe info */}
                                                    {order.stripe_payment_intent_id && (
                                                        <div className="mt-3 text-xs text-gray-400 font-mono">
                                                            Stripe: {order.stripe_payment_intent_id}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>);
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-gray-400 italic">
                                        {activeTab === 'deleted'
                                            ? '🗑️ No deleted orders. Removed orders will appear here.'
                                            : 'No orders found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Set Price Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 font-serif">Set Quote Price</h2>
                        <p className="mb-4 text-gray-600">
                            Enter the final total amount for Order <strong>#{selectedOrder.id}</strong>.
                            This will send an invoice to <strong>{selectedOrder.customer_email}</strong>.
                        </p>
                        <form onSubmit={handleSetPrice}>
                            <div className="mb-6">
                                <label className="block text-sm font-bold mb-2">Total Amount ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full border border-gray-300 rounded p-3 text-lg font-bold text-[#2c1810] focus:ring-[#d4af37]"
                                    placeholder="0.00"
                                    value={quotePrice}
                                    onChange={e => setQuotePrice(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-4">
                                <button type="button" onClick={() => setSelectedOrder(null)}
                                    className="px-4 py-2 text-gray-500 hover:text-gray-700 font-bold">
                                    Cancel
                                </button>
                                <button type="submit"
                                    className="bg-[#d4af37] text-white px-6 py-2 rounded font-bold hover:bg-[#b5952f]">
                                    Send Invoice
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Mark Shipped Modal */}
            {isShippedModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 font-serif flex items-center gap-2">
                            <Truck className="text-[#d4af37]" />
                            Mark as Shipped
                        </h2>
                        <form onSubmit={handleMarkShipped}>
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Carrier</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-[#d4af37]"
                                    placeholder="e.g. UPS, FedEx, DHL"
                                    value={trackingInfo.carrier}
                                    onChange={e => setTrackingInfo({ ...trackingInfo, carrier: e.target.value })}
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-bold mb-2">Tracking Number</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:border-[#d4af37]"
                                    placeholder="Tracking #"
                                    value={trackingInfo.trackingNumber}
                                    onChange={e => setTrackingInfo({ ...trackingInfo, trackingNumber: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-4">
                                <button type="button" onClick={() => setIsShippedModalOpen(false)}
                                    className="px-4 py-2 text-gray-500 hover:text-gray-700 font-bold">
                                    Cancel
                                </button>
                                <button type="submit"
                                    className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">
                                    Confirm Shipment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
