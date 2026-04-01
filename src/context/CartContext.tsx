'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

export interface CartItem {
    id: number; // Wholesale: DB ID, Retail: Timestamp/Random
    productId: number;
    name: string;
    price: string | number;
    quantity: number;
    image: string;
    variantSize?: string;
    variantType?: string;
}

// Unique key for a cart item combining product + variant
export const cartItemKey = (productId: number, variantSize?: string, variantType?: string) =>
    `${productId}::${variantSize || ''}::${variantType || ''}`;

interface CartContextType {
    // Retail Cart (LocalStorage)
    retailItems: CartItem[];
    addToRetailCart: (product: any, quantity?: number) => void;
    removeFromRetailCart: (productId: number, variantSize?: string, variantType?: string) => void;
    updateRetailQuantity: (productId: number, quantity: number, variantSize?: string, variantType?: string) => void;
    clearRetailCart: () => void;
    retailItemCount: number;

    // Wholesale Cart (API)
    wholesaleItems: CartItem[];
    addToWholesaleCart: (product: any, quantity?: number) => Promise<void>;
    removeFromWholesaleCart: (productId: number, variantSize?: string, variantType?: string) => Promise<void>;
    updateWholesaleQuantity: (productId: number, quantity: number, variantSize?: string, variantType?: string) => Promise<void>;
    clearWholesaleCart: () => Promise<void>;
    wholesaleItemCount: number;
    wholesaleLoading: boolean;
}

const CartContext = createContext<CartContextType>({
    retailItems: [],
    addToRetailCart: () => { },
    removeFromRetailCart: () => { },
    updateRetailQuantity: () => { },
    clearRetailCart: () => { },
    retailItemCount: 0,

    wholesaleItems: [],
    addToWholesaleCart: async () => { },
    removeFromWholesaleCart: async () => { },
    updateWholesaleQuantity: async () => { },
    clearWholesaleCart: async () => { },
    wholesaleItemCount: 0,
    wholesaleLoading: false,
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, isAuthenticated, accessToken } = useAuth();

    // --- Retail State ---
    const [retailItems, setRetailItems] = useState<CartItem[]>([]);

    // --- Wholesale State ---
    const [wholesaleItems, setWholesaleItems] = useState<CartItem[]>([]);
    const [wholesaleLoading, setWholesaleLoading] = useState(false);

    const isWholesaleUser = isAuthenticated && user?.role === 'wholesale';
    const isApproved = isWholesaleUser && user?.approval_status === 'approved';

    // --- Retail Logic (LocalStorage) ---
    useEffect(() => {
        // Load retail cart on mount
        const stored = localStorage.getItem('retail_cart');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Validate items
                const validItems = Array.isArray(parsed) ? parsed.filter((item: any) =>
                    item &&
                    !isNaN(item.productId) &&
                    item.productId !== null
                ).map((item: any) => ({
                    ...item,
                    image: item.image || '/placeholder.jpg' // Use correct local placeholder
                })) : [];
                setRetailItems(validItems);
            } catch (e) {
                console.error("Failed to parse retail cart", e);
                setRetailItems([]);
            }
        }
    }, []);

    // Sync retailItems to localStorage whenever it changes
    // Note: We avoid setting it on initial mount by checking generic length or just doing it
    // Actually, explicit setters below handle localStorage update. 
    // But to catch external changes or ensure sync:
    // Better to update localStorage IN the action functions to avoid loops or overwrites.

    const addToRetailCart = (product: any, quantity = 1) => {
        const currentItems = [...retailItems];
        const key = cartItemKey(Number(product.id), product.variantSize, product.variantType);
        const existingIndex = currentItems.findIndex(i =>
            cartItemKey(i.productId, i.variantSize, i.variantType) === key
        );

        if (existingIndex > -1) {
            currentItems[existingIndex].quantity += quantity;
        } else {
            currentItems.push({
                id: Date.now(),
                productId: Number(product.id),
                name: product.name,
                price: product.price,
                quantity: quantity,
                image: product.image || product.image_url,
                variantSize: product.variantSize,
                variantType: product.variantType,
            });
        }

        setRetailItems(currentItems);
        localStorage.setItem('retail_cart', JSON.stringify(currentItems));
    };

    const removeFromRetailCart = (productId: number, variantSize?: string, variantType?: string) => {
        const key = cartItemKey(productId, variantSize, variantType);
        const updated = retailItems.filter(i => cartItemKey(i.productId, i.variantSize, i.variantType) !== key);
        setRetailItems(updated);
        localStorage.setItem('retail_cart', JSON.stringify(updated));
    };

    const updateRetailQuantity = (productId: number, quantity: number, variantSize?: string, variantType?: string) => {
        if (quantity < 1) return;
        const key = cartItemKey(productId, variantSize, variantType);
        const updated = retailItems.map(i =>
            cartItemKey(i.productId, i.variantSize, i.variantType) === key ? { ...i, quantity } : i
        );
        setRetailItems(updated);
        localStorage.setItem('retail_cart', JSON.stringify(updated));
    };

    const clearRetailCart = () => {
        setRetailItems([]);
        localStorage.removeItem('retail_cart');
    };

    // --- Wholesale Logic (LocalStorage) ---
    useEffect(() => {
        // Load wholesale cart on mount
        if (isApproved) {
            const stored = localStorage.getItem('wholesale_cart');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    const validItems = Array.isArray(parsed) ? parsed.filter((item: any) =>
                        item && !isNaN(item.productId)
                    ).map((item: any) => ({
                        ...item,
                        image: item.image || '/placeholder.jpg'
                    })) : [];
                    setWholesaleItems(validItems);
                } catch (e) {
                    console.error("Failed to parse wholesale cart", e);
                    setWholesaleItems([]);
                }
            }
        }
    }, [isApproved]);

    const addToWholesaleCart = async (product: any, quantity = 1) => {
        const currentItems = [...wholesaleItems];
        const key = cartItemKey(Number(product.id), product.variantSize, product.variantType);
        const existingIndex = currentItems.findIndex(i =>
            cartItemKey(i.productId, i.variantSize, i.variantType) === key
        );

        if (existingIndex > -1) {
            currentItems[existingIndex].quantity += quantity;
        } else {
            currentItems.push({
                id: Date.now(),
                productId: Number(product.id),
                name: product.name,
                price: product.price,
                quantity: quantity,
                image: product.image_url || product.image || '/placeholder.jpg',
                variantSize: product.variantSize,
                variantType: product.variantType,
            });
        }

        setWholesaleItems(currentItems);
        localStorage.setItem('wholesale_cart', JSON.stringify(currentItems));
    };

    const removeFromWholesaleCart = async (productId: number, variantSize?: string, variantType?: string) => {
        const key = cartItemKey(productId, variantSize, variantType);
        const updated = wholesaleItems.filter(i => cartItemKey(i.productId, i.variantSize, i.variantType) !== key);
        setWholesaleItems(updated);
        localStorage.setItem('wholesale_cart', JSON.stringify(updated));
    };

    const updateWholesaleQuantity = async (productId: number, quantity: number, variantSize?: string, variantType?: string) => {
        if (quantity < 1) return;
        const key = cartItemKey(productId, variantSize, variantType);
        const updated = wholesaleItems.map(i =>
            cartItemKey(i.productId, i.variantSize, i.variantType) === key ? { ...i, quantity } : i
        );
        setWholesaleItems(updated);
        localStorage.setItem('wholesale_cart', JSON.stringify(updated));
    };

    const clearWholesaleCart = async () => {
        setWholesaleItems([]);
        localStorage.removeItem('wholesale_cart');
    };

    // Derived State
    const retailItemCount = retailItems.reduce((sum, i) => sum + i.quantity, 0);
    const wholesaleItemCount = wholesaleItems.reduce((sum, i) => sum + i.quantity, 0);

    return (
        <CartContext.Provider value={{
            retailItems,
            addToRetailCart,
            removeFromRetailCart,
            updateRetailQuantity,
            clearRetailCart,
            retailItemCount,

            wholesaleItems,
            addToWholesaleCart,
            removeFromWholesaleCart,
            updateWholesaleQuantity,
            clearWholesaleCart,
            wholesaleItemCount,
            wholesaleLoading
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
