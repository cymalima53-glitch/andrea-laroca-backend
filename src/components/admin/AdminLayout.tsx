'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Home, Package, ShoppingCart, Settings, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, loading, logout, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    console.log('[AdminLayout] Render - loading:', loading, 'isAuthenticated:', isAuthenticated, 'pathname:', pathname);

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                router.push('/admin/login');
            } else if (user?.role !== 'admin') {
                // Logged in but not admin — redirect away
                router.push('/auth/login');
            }
        }
    }, [loading, isAuthenticated, user, router, pathname]);

    if (loading) {
        console.log('[AdminLayout] Showing loading state');
        return <div className="flex h-screen items-center justify-center bg-gray-100">Loading...</div>;
    }

    if (pathname === '/admin/login') {
        console.log('[AdminLayout] Login page, rendering children');
        return <>{children}</>;
    }

    if (!isAuthenticated || user?.role !== 'admin') {
        return null; // Will redirect via useEffect
    }

    console.log('[AdminLayout] Rendering admin layout with children');

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

    return (
        <div className="flex h-screen bg-gray-100 font-sans text-slate-900">
            <aside className="w-64 shrink-0 bg-slate-900 text-white flex flex-col transition-all duration-300">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gold-500 font-serif">LA ROCCA</h2>
                    <p className="text-xs text-slate-400 mt-1">Admin Panel</p>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <Link href="/admin" className={`flex items-center space-x-3 p-3 rounded transition-colors ${pathname === '/admin' ? 'bg-slate-800 text-gold-400' : 'hover:bg-slate-800 text-slate-300'}`}>
                        <Home size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link href="/admin/products" className={`flex items-center space-x-3 p-3 rounded transition-colors ${isActive('/admin/products') ? 'bg-slate-800 text-gold-400' : 'hover:bg-slate-800 text-slate-300'}`}>
                        <Package size={20} />
                        <span>Products</span>
                    </Link>
                    <Link href="/admin/catalogue" className={`flex items-center space-x-3 p-3 rounded transition-colors ${isActive('/admin/catalogue') ? 'bg-slate-800 text-gold-400' : 'hover:bg-slate-800 text-slate-300'}`}>
                        <Package size={20} />
                        <span>Catalogue</span>
                    </Link>
                    <Link href="/admin/orders" className={`flex items-center space-x-3 p-3 rounded transition-colors ${isActive('/admin/orders') ? 'bg-slate-800 text-gold-400' : 'hover:bg-slate-800 text-slate-300'}`}>
                        <ShoppingCart size={20} />
                        <span>Orders</span>
                    </Link>
                    {/* Settings - Optional/Future */}
                    <div className="pt-4 mt-4 border-t border-slate-700">
                        <a href="#" className="flex items-center space-x-3 p-3 rounded hover:bg-slate-800 text-slate-300">
                            <Settings size={20} />
                            <span>Settings</span>
                        </a>
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <p className="font-medium text-white">{user?.username || 'Admin'}</p>
                            <p className="text-xs text-slate-400">{user?.email}</p>
                        </div>
                        <button onClick={logout} className="text-slate-400 hover:text-white p-2">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto bg-white">
                {children}
            </main>
        </div>
    );
}
