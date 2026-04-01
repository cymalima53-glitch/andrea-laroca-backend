'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Edit2, Plus, Search, Trash2 } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';

interface CatalogueItem {
    id: string;
    name: string;
    price: string;
    category: string;
    sku: string;
    unit: string;
    image_url: string;
    in_stock: boolean;
}

export default function AdminCataloguePage() {
    const { accessToken } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [items, setItems] = useState<CatalogueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');

    const fetchItems = async () => {
        try {
            const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/catalogue');
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching catalogue:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchItems(); }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/catalogue/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            if (res.ok) {
                showSuccess('Item deleted');
                fetchItems();
            } else {
                showError('Failed to delete item');
            }
        } catch {
            showError('Error deleting item');
        }
    };

    const categories = ['ALL', ...Array.from(new Set(items.map(i => i.category))).sort()];

    const filtered = items.filter(item => {
        const matchesSearch =
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            (item.sku || '').toLowerCase().includes(search.toLowerCase());
        const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;
        return matchesSearch && matchesCat;
    });

    if (loading) return (
        <div className="p-8 text-slate-500 text-sm">Loading catalogue…</div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Catalogue
                        <span className="ml-2 text-sm font-normal text-slate-400">(Wholesale)</span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">{filtered.length} of {items.length} items</p>
                </div>
                <Link
                    href="/admin/catalogue/add"
                    className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-3 py-1.5 rounded transition-colors"
                >
                    <Plus size={15} /> Add Item
                </Link>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-4 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search name or SKU…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="text-sm border border-slate-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="w-16 px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Img</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Product Name</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">SKU</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Price</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Unit</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-3 py-8 text-center text-slate-400 text-sm">
                                    No items found
                                </td>
                            </tr>
                        )}
                        {filtered.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                {/* Thumbnail */}
                                <td className="px-3 py-2">
                                    <div className="rounded overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200" style={{ width: '50px', height: '50px', minWidth: '50px' }}>
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="admin-product-image"
                                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-medium">
                                                NO IMG
                                            </div>
                                        )}
                                    </div>
                                </td>
                                {/* Name */}
                                <td className="px-3 py-2">
                                    <span className="font-medium text-slate-800">{item.name}</span>
                                </td>
                                {/* SKU */}
                                <td className="px-3 py-2 text-slate-500 font-mono text-xs">
                                    {item.sku || <span className="text-slate-300">—</span>}
                                </td>
                                {/* Category */}
                                <td className="px-3 py-2">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                        {item.category}
                                    </span>
                                </td>
                                {/* Price */}
                                <td className="px-3 py-2 text-slate-600">
                                    {item.price
                                        ? <span className="font-medium">${Number(item.price).toFixed(2)}</span>
                                        : <span className="italic text-slate-400 text-xs">Quote</span>
                                    }
                                </td>
                                {/* Unit */}
                                <td className="px-3 py-2 text-slate-400 text-xs">
                                    {item.unit || '—'}
                                </td>
                                {/* Actions */}
                                <td className="px-3 py-2">
                                    <div className="flex justify-end items-center gap-2">
                                        <Link
                                            href={`/admin/catalogue/edit/${item.id}`}
                                            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
                                        >
                                            <Edit2 size={12} /> Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(item.id, item.name)}
                                            className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                        >
                                            <Trash2 size={12} /> Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
