import styles from './ProductShowcase.module.css';
import ProductGrid from './ProductGrid';
import type { Dictionary, Product } from '../../app/types';
import { Suspense } from 'react';

interface ProductShowcaseProps {
    products: Product[];
    categories: Dictionary['common']['categories'];
    initialCategory?: string;
    title: string;
}

export default function ProductShowcase({ products, categories, title, initialCategory = 'ALL ITEMS' }: ProductShowcaseProps) {
    return (
        <section className={styles.showcase} id="products">
            <div className="container">
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    <div className={styles.divider}></div>
                </div>

                <Suspense fallback={<div>Loading...</div>}>
                    <ProductGrid
                        products={products}
                        categories={categories}
                        initialCategory={initialCategory}
                    />
                </Suspense>
            </div>
        </section>
    );
}
