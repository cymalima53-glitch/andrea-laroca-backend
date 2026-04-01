'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import PendingUsers from '@/components/admin/PendingUsers';

interface Order {
    id: string;
    customer_email: string;
    total_amount: string;
    status: string;
    created_at: string;
}

export default function AdminDashboard() {
    const { accessToken } = useAuth();
    const [stats, setStats] = useState({
        products: 0,
        orders: 0,
        revenue: 0,
        pendingOrders: 0
    });
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!accessToken) return;
            try {
                const res = await fetch('http://localhost:5000/api/admin/dashboard-stats', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });

                if (!res.ok) {
                    const errBody = await res.json().catch(() => ({}));
                    console.error('dashboard-stats error:', res.status, errBody);
                    return; // show zeros, don't crash
                }
                const data = await res.json();

                setStats({
                    products: 36, // hardcoded — leave as-is
                    orders: data.totalOrders ?? 0,
                    revenue: data.totalRevenue ?? 0,
                    pendingOrders: data.pendingOrders ?? 0,
                });
                setRecentOrders(data.recentOrders ?? []);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [accessToken]);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 font-serif">Dashboard</h1>
                <p className="text-slate-500">Welcome back to your control center.</p>
            </div>

            <PendingUsers />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Revenue"
                    value={`$${Number(stats.revenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={<DollarSign className="text-green-500" size={24} />}
                />
                <StatCard
                    title="Total Orders"
                    value={stats.orders}
                    icon={<ShoppingCart className="text-blue-500" size={24} />}
                />
                <StatCard
                    title="Products"
                    value={stats.products}
                    icon={<Package className="text-purple-500" size={24} />}
                />
                <StatCard
                    title="Pending Orders"
                    value={stats.pendingOrders}
                    icon={<TrendingUp className="text-orange-500" size={24} />}
                />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Orders</h3>
                {loading ? (
                    <p>Loading...</p>
                ) : recentOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recentOrders.map((order: any) => (
                                    <tr key={order.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{order.id.toString().slice(0, 8)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>{order.customer_name}</div>
                                            <div className="text-xs text-gray-400">{order.customer_email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${order.order_type === 'retail' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {order.order_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.total > 0 ? `$${parseFloat(order.total).toFixed(2)}` : '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                order.status === 'Pending Pricing' ? 'bg-blue-100 text-blue-800' :
                                                    order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500">No recent orders found.</p>
                )}
            </div>
        </div>
    );
}

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
            </div>
            <div className="p-3 bg-slate-50 rounded-full">
                {icon}
            </div>
        </div>
    );
}
