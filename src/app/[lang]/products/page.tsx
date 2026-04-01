import Hero from '../../../components/home/Hero';
import ProductShowcase from '../../../components/products/ProductShowcase';
import type { Product } from '../../types';
import { getDictionary } from '@/lib/get-dictionary';
import type { Locale } from '../../../i18n-config';

export const dynamic = 'force-dynamic';

// Mock Dictionary for client component (or fetch it)
// Since this is a client component, we might need to pass dict from server page, 
// but for now we'll hardcode or fetch. 
// Actually, the previous page.tsx was likely a Server Component that passed data to Client Components.
// But we are in 'use client'.
// Let's use standard texts for now or minimal auth/dict dependency.
// User wants "hero coffe tab". 

// Server Component
export default async function RetailProductsPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = await params;
    // Fetch products server-side
    let products: Product[] = [];
    try {
        const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/retail/products', {
            cache: 'no-store'
        });
        if (res.ok) {
            const data = await res.json();
            // Map backend fields to frontend interface without normalization
            // ProductGrid will handle dynamic tabs based on these categories
            products = data.map((item: any) => ({
                id: item.id,
                name: item.name,
                description: item.description,
                price: item.price,
                category: item.category || 'Other', // Use raw category
                image: item.image_url || item.image || '/coffee-bag-placeholder.png', // Fallback
                image_url: item.image_url || item.image || '/coffee-bag-placeholder.png',
                nutrition_image_url: item.nutrition_image_url || null,
                variants: item.variants || [],
            }));
        }
    } catch (error) {
        console.error('Failed to fetch products:', error);
    }

    const categories = {
        all: 'ALL',
        coffee: 'COFFEE',
        machines: 'MACHINES',
        accessories: 'ACCESSORIES',
        italian: 'ITALIAN',
    };

    return (
        <main>
            <Hero
                lang={lang || 'en'}
                title="OUR PRODUCTS"
                subtitle="Explore our premium selection of Italian coffee and fine foods."
                imageSrc="/images/product%20italian.png"
                eyebrow="Retail Shop"
            />

            <ProductShowcase
                products={products}
                categories={categories}
                title="Curated Selection"
                initialCategory="ALL ITEMS"
            />
        </main>
    );
}
