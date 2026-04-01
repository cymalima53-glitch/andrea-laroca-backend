'use client';

import { useState, useMemo } from 'react';
import styles from './ProductShowcase.module.css';
import ProductCard from './ProductCard';
import type { Product, Dictionary } from '../../app/types';

interface ProductGridProps {
    products: Product[];
    categories?: Dictionary['common']['categories'];
    initialCategory?: string;
}

export default function ProductGrid({ products, initialCategory = 'ALL ITEMS' }: ProductGridProps) {
    const [activeCategory, setActiveCategory] = useState<string>(initialCategory);

    // Extract unique categories from products
    const tabs = useMemo(() => {
        const uniqueCats = Array.from(new Set(products.map(p => p.category?.toUpperCase() || 'OTHER'))).sort();
        return [
            { id: 'ALL ITEMS', label: 'ALL ITEMS' },
            ...uniqueCats.map(cat => ({ id: cat, label: cat }))
        ];
    }, [products]);

    // Filter logic
    const filteredProducts = activeCategory === 'ALL ITEMS'
        ? products
        : products.filter((product) => (product.category?.toUpperCase() || 'OTHER') === activeCategory);

    return (
        <div>
            {/* Category Tabs */}
            <div className={styles.tabsContainer}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`${styles.tab} ${activeCategory === tab.id ? styles.activeTab : ''}`}
                        onClick={() => setActiveCategory(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Product Grid */}
            <div className={styles.grid}>
                {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <p className={styles.emptyState}>No products found in this category.</p>
            )}
        </div>
    );
}
