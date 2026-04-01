'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { Upload, X, Plus, Trash2 } from 'lucide-react';

interface VariantRow {
    size: string;
    type: string;
    price: string;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { accessToken: token } = useAuth();
    const { showSuccess, showError } = useNotification();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [productId, setProductId] = useState<string | null>(null);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [nutritionFile, setNutritionFile] = useState<File | null>(null);
    const [nutritionPreview, setNutritionPreview] = useState<string | null>(null);
    const [variants, setVariants] = useState<VariantRow[]>([]);
    const hasFetched = useRef(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'COFFEE',
        sku: '',
        unit: 'item',
        stock: 999,
        image_url: '',
        nutrition_image_url: '',
    });

    useEffect(() => {
        if (hasFetched.current) return; // prevent React Strict Mode double-invoke
        hasFetched.current = true;
        const fetchProduct = async () => {
            const { id } = await params;
            setProductId(id);
            try {
                const res = await fetch(`http://localhost:5000/api/products/${id}`);
                if (!res.ok) throw new Error('Product not found');
                const data = await res.json();

                setFormData({
                    name: data.name ?? '',
                    description: data.description ?? '',
                    price: data.price ?? '',
                    category: data.category ?? 'COFFEE',
                    sku: data.sku ?? '',
                    unit: data.unit ?? 'item',
                    stock: data.in_stock ? 999 : 0,
                    image_url: data.image_url ?? '',
                    nutrition_image_url: data.nutrition_image_url ?? '',
                });
                if (data.image_url) setImagePreview(data.image_url);
                if (data.nutrition_image_url) setNutritionPreview(data.nutrition_image_url);
                // Load saved variants or start with empty array (variants are optional)
                setVariants(
                    data.variants && Array.isArray(data.variants)
                        ? data.variants.map((v: any) => ({
                            size: v.size ?? '',
                            type: v.type ?? '',
                            price: v.price != null ? String(v.price) : '',
                        }))
                        : []
                );
                setFetching(false);
            } catch (err) {
                showError('Error fetching product');
                router.push('/admin/products');
            }
        };
        fetchProduct();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const uploadImage = async (file: File): Promise<string> => {
        const fd = new FormData();
        fd.append('image', file);
        const res = await fetch('http://localhost:5000/api/upload/product', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: fd,
        });
        if (!res.ok) throw new Error('Image upload failed');
        return (await res.json()).imageUrl;
    };

    const handleVariantChange = (index: number, field: keyof VariantRow, value: string) => {
        setVariants(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const imageUrl = imageFile ? await uploadImage(imageFile) : formData.image_url;
            const nutritionUrl = nutritionFile ? await uploadImage(nutritionFile) : formData.nutrition_image_url;

            // Save ALL variant rows (no filter — every row the user added is kept)
            const parsedVariants = variants
                .map((v) => ({ size: v.size.trim(), type: v.type.trim(), price: v.price !== '' ? parseFloat(v.price) : 0 }));

            console.log('All variants (from state):', variants);
            console.log('Saving:', parsedVariants);

            const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    image_url: imageUrl,
                    nutrition_image_url: nutritionUrl,
                    variants: parsedVariants,
                }),
            });

            if (!res.ok) throw new Error('Failed to update product');
            showSuccess('Product updated!');
            router.push('/admin/products');
        } catch (error) {
            showError('Error updating product');
        } finally {
            setLoading(false);
        }
    };

    const ImageUploadBox = ({ label, preview, onClear, onFileChange }: {
        label: string; preview: string | null;
        onClear: () => void; onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            {preview ? (
                <div className="relative group w-full h-48 rounded-lg overflow-hidden border-2 border-amber-400 bg-white">
                    <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                    <button type="button" onClick={onClear}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Click to upload</p>
                    <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                </label>
            )}
        </div>
    );

    if (fetching) return <div className="p-8 text-gray-600">Loading product details...</div>;

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold font-serif text-slate-800 mb-6">Edit Product</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">

                {/* Images */}
                <div className="grid grid-cols-2 gap-4">
                    <ImageUploadBox label="Product Image" preview={imagePreview}
                        onClear={() => { setImageFile(null); setImagePreview(null); setFormData(p => ({ ...p, image_url: '' })); }}
                        onFileChange={e => { if (e.target.files?.[0]) { setImageFile(e.target.files[0]); setImagePreview(URL.createObjectURL(e.target.files[0])); } }} />
                    <ImageUploadBox label="Nutrition Facts Image" preview={nutritionPreview}
                        onClear={() => { setNutritionFile(null); setNutritionPreview(null); setFormData(p => ({ ...p, nutrition_image_url: '' })); }}
                        onFileChange={e => { if (e.target.files?.[0]) { setNutritionFile(e.target.files[0]); setNutritionPreview(URL.createObjectURL(e.target.files[0])); } }} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input type="text" name="name" required
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            value={formData.name} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                        <input type="text" name="sku"
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            value={formData.sku} onChange={handleChange} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Base Price</label>
                        <input type="text" name="price" required
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            value={formData.price} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                        <input type="number" name="stock" required min="0"
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            value={formData.stock} onChange={handleChange} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select name="category"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        value={formData.category} onChange={handleChange}>
                        {['BEVERAGES', 'COFFEE', 'CONDIMENTS', 'COOKIES', 'CURED MEATS', 'HAMS', 'LEGUMES', 'OIL', 'PASTA', 'PASTRIES', 'RICE', 'TEA', 'VEGETABLES', 'VINEGAR', 'WATER'].map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea name="description" rows={3}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        value={formData.description} onChange={handleChange} />
                </div>

                {/* Variants */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Variants (Size / Type / Price)</label>
                        <button type="button"
                            onClick={() => setVariants(prev => [...prev, { size: '', type: '', price: '' }])}
                            className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 font-medium">
                            <Plus size={14} /> Add Row
                        </button>
                    </div>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-3 py-2 text-gray-600 font-medium">Size</th>
                                    <th className="text-left px-3 py-2 text-gray-600 font-medium">Type</th>
                                    <th className="text-left px-3 py-2 text-gray-600 font-medium">Price ($)</th>
                                    <th className="px-2 py-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {variants.map((v, i) => (
                                    <tr key={i} className="border-b border-gray-100 last:border-0">
                                        <td className="px-2 py-1">
                                            <input value={v.size} onChange={e => handleVariantChange(i, 'size', e.target.value)}
                                                placeholder="e.g. 1lb" className="w-full border border-gray-200 rounded px-2 py-1 text-sm" />
                                        </td>
                                        <td className="px-2 py-1">
                                            <input value={v.type} onChange={e => handleVariantChange(i, 'type', e.target.value)}
                                                placeholder="e.g. Regular" className="w-full border border-gray-200 rounded px-2 py-1 text-sm" />
                                        </td>
                                        <td className="px-2 py-1">
                                            <input value={v.price} onChange={e => handleVariantChange(i, 'price', e.target.value)}
                                                type="number" min="0" step="0.01" placeholder="0.00" className="w-full border border-gray-200 rounded px-2 py-1 text-sm" />
                                        </td>
                                        <td className="px-2 py-1 text-center">
                                            <button type="button" onClick={() => setVariants(prev => prev.filter((_, idx) => idx !== i))}
                                                className="text-red-400 hover:text-red-600">
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={() => router.back()}
                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading}
                        className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium ${loading ? 'opacity-70' : ''}`}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
