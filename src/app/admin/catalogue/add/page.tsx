'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Upload, X, Plus, Trash2 } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';

interface VariantRow {
    size: string;
    type: string;
    price: string;
}


export default function AddCatalogueItemPage() {
    const { accessToken } = useAuth();
    const { showSuccess, showError } = useNotification();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Product image
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Nutrition image
    const [nutritionFile, setNutritionFile] = useState<File | null>(null);
    const [nutritionPreview, setNutritionPreview] = useState<string | null>(null);

    // Variants
    const [variants, setVariants] = useState<VariantRow[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'COFFEE',
        sku: '',
        unit: 'kg',
        stock: 999,
        image_url: ''
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setImageFile(e.target.files[0]);
            setImagePreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleNutritionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setNutritionFile(e.target.files[0]);
            setNutritionPreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const uploadImage = async (file: File): Promise<string> => {
        const fd = new FormData();
        fd.append('image', file);
        const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/upload/product', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}` },
            body: fd,
        });
        if (!res.ok) throw new Error('Image upload failed');
        const data = await res.json();
        return data.imageUrl;
    };

    const handleVariantChange = (index: number, field: keyof VariantRow, value: string) => {
        setVariants(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const addVariantRow = () => {
        setVariants(prev => [...prev, { size: '', type: '', price: '' }]);
    };

    const removeVariantRow = (index: number) => {
        setVariants(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const [imageUrl, nutritionUrl] = await Promise.all([
                imageFile ? uploadImage(imageFile) : Promise.resolve(''),
                nutritionFile ? uploadImage(nutritionFile) : Promise.resolve(''),
            ]);

            // Save all rows that have Size+Type — price is optional (defaults to 0)
            const parsedVariants = variants
                .filter((v) => v.size.trim() && v.type.trim())
                .map((v) => ({ size: v.size.trim(), type: v.type.trim(), price: v.price !== '' ? parseFloat(v.price) : 0 }));

            const productData = {
                ...formData,
                image_url: imageUrl,
                nutrition_image_url: nutritionUrl || undefined,
                variants: parsedVariants,
            };

            const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/catalogue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(productData)
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.msg || err.error || 'Failed to create item');
            }

            showSuccess('Catalogue item created successfully');
            router.push('/admin/catalogue');
        } catch (error: any) {
            showError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const ImageUploadBox = ({
        label, preview, onClear, onFileChange, accept = 'image/*'
    }: {
        label: string;
        preview: string | null;
        onClear: () => void;
        onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        accept?: string;
    }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="flex items-center justify-center w-full">
                {preview ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300 group bg-white">
                        <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                        <button type="button" onClick={onClear}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Click to upload</p>
                        </div>
                        <input type="file" className="hidden" accept={accept} onChange={onFileChange} />
                    </label>
                )}
            </div>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold font-serif text-slate-800 mb-6">Add Catalogue Item</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">

                {/* Images side by side */}
                <div className="grid grid-cols-2 gap-4">
                    <ImageUploadBox
                        label="Product Image"
                        preview={imagePreview}
                        onClear={() => { setImageFile(null); setImagePreview(null); }}
                        onFileChange={handleImageChange}
                    />
                    <ImageUploadBox
                        label="Nutrition Facts Image"
                        preview={nutritionPreview}
                        onClear={() => { setNutritionFile(null); setNutritionPreview(null); }}
                        onFileChange={handleNutritionChange}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                        <input type="text" name="name" required
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
                            value={formData.name} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                        <input type="text" name="sku" required
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
                            value={formData.sku} onChange={handleChange} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Base Price</label>
                        <input type="text" name="price" placeholder="$0.00 or Call for Price"
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
                            value={formData.price} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                        <input type="number" name="stock"
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
                            value={formData.stock} onChange={handleChange} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select name="category"
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
                            value={formData.category} onChange={handleChange}>
                            {['COFFEE', 'TEA', 'MACHINES', 'ACCESSORIES', 'ITALIAN PRODUCTS', 'ARTICHOKES', 'BEANS', 'CANNOLI', 'COCO WATER', 'COOKIES', 'FABBRI', 'FROZEN', 'OIL', 'OLIVES', 'PAPER GOODS', 'PASTA', 'REFRIGERATED', 'RICE', 'TOMATO', 'VINEGAR', 'WATER'].map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                        <input type="text" name="unit" placeholder="kg, unit, box"
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
                            value={formData.unit} onChange={handleChange} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea name="description" rows={3}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
                        value={formData.description} onChange={handleChange} />
                </div>

                {/* Variants */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Variants (Size / Type / Price)
                            <span className="ml-2 text-xs text-gray-400 font-normal">{variants.length}/7</span>
                        </label>
                        <button type="button" onClick={addVariantRow}
                            disabled={variants.length >= 7}
                            className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 font-medium disabled:opacity-40 disabled:cursor-not-allowed">
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
                                                placeholder="e.g. 1lb"
                                                className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-amber-400" />
                                        </td>
                                        <td className="px-2 py-1">
                                            <input value={v.type} onChange={e => handleVariantChange(i, 'type', e.target.value)}
                                                placeholder="e.g. Regular"
                                                className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-amber-400" />
                                        </td>
                                        <td className="px-2 py-1">
                                            <input value={v.price} onChange={e => handleVariantChange(i, 'price', e.target.value)}
                                                type="number" min="0" step="0.01" placeholder="0.00"
                                                className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-amber-400" />
                                        </td>
                                        <td className="px-2 py-1 text-center">
                                            <button type="button" onClick={() => removeVariantRow(i)}
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
                        className={`px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium ${loading ? 'opacity-70' : ''}`}>
                        {loading ? 'Creating...' : 'Create Item'}
                    </button>
                </div>
            </form>
        </div>
    );
}
