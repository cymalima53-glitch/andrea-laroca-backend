'use client';

import { useRouter } from 'next/navigation';
import { Trash2, ArrowRight, Minus, Plus, ShoppingBag, Loader2 } from 'lucide-react';
import CatalogueAuthGuard from '../../../components/auth/CatalogueAuthGuard';
import { useCart } from '../../../context/CartContext';
import { useEffect } from 'react';
import styles from './wholesale-cart.module.css';

export default function WholesaleCartPage() {
    const { wholesaleItems, updateWholesaleQuantity, removeFromWholesaleCart, wholesaleLoading, clearWholesaleCart } = useCart();
    const router = useRouter();

    useEffect(() => {
        console.log("Wholesale Cart Render:", { loading: wholesaleLoading, length: wholesaleItems.length, items: wholesaleItems });
    }, [wholesaleItems, wholesaleLoading]);

    // Calculate total items
    const totalItems = wholesaleItems.reduce((acc, item) => acc + item.quantity, 0);

    const handleClearCart = async () => {
        if (confirm('Are you sure you want to clear your quote request?')) {
            await clearWholesaleCart();
        }
    };

    const isLoadingInitial = wholesaleLoading && wholesaleItems.length === 0;

    return (
        <CatalogueAuthGuard>
            <div className={styles.pageWrapper}>
                <div className={`pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${styles.container}`}>

                    {/* Header */}
                    <div className={styles.header}>
                        <h1 className={styles.title}>
                            Wholesale Quote
                            <span className={styles.itemCount}>({totalItems} items)</span>
                        </h1>

                        {wholesaleItems.length > 0 && (
                            <button
                                onClick={handleClearCart}
                                className={styles.clearListBtn}
                            >
                                <Trash2 size={16} /> Clear List
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    {isLoadingInitial ? (
                        <div className={styles.loadingState}>
                            <Loader2 className={styles.loaderIcon} size={56} />
                            <p className={styles.loadingText}>LOADING SELECTION...</p>
                        </div>
                    ) : wholesaleItems.length === 0 ? (
                        <div className={styles.emptyCart}>
                            <ShoppingBag size={80} className={styles.emptyCartIcon} />
                            <h2 className={styles.emptyCartTitle}>Your quote list is empty</h2>
                            <p className={styles.emptyCartDescription}>Browse our premium catalogue to add items for a wholesale quote.</p>
                            <button
                                onClick={() => router.push('/catalogue')}
                                className={styles.browseCatalogueBtn}
                            >
                                BROWSE CATALOGUE <ArrowRight size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className={styles.mainLayout}>
                            {/* Cart Grid */}
                            <div className={styles.gridSection}>
                                <div className={styles.cartGrid}>
                                    {wholesaleItems.map((item) => (
                                        <div key={`${item.productId}-${item.variantSize}-${item.variantType}`} className={styles.cartItem}>

                                            {/* Remove Button */}
                                            <button
                                                onClick={() => removeFromWholesaleCart(item.productId, item.variantSize, item.variantType)}
                                                className={styles.removeBtn}
                                                disabled={wholesaleLoading}
                                                title="Remove Item"
                                            >
                                                <Trash2 size={14} />
                                            </button>

                                            {/* Image */}
                                            <div className={styles.productImageWrapper}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={item.image || '/placeholder.jpg'}
                                                    alt={item.name}
                                                    className={styles.productImage}
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className={styles.productDetails}>
                                                <h3 className={styles.productName} title={item.name}>{item.name}</h3>

                                                {/* Variant badges */}
                                                {(item.variantSize || item.variantType) && (
                                                    <div style={{ display: 'flex', gap: '6px', margin: '6px 0', flexWrap: 'wrap' }}>
                                                        {item.variantSize && (
                                                            <span style={{
                                                                background: 'rgba(212,175,55,0.15)',
                                                                border: '1px solid rgba(212,175,55,0.35)',
                                                                color: '#d4af37',
                                                                fontSize: '10px',
                                                                fontWeight: 700,
                                                                padding: '2px 10px',
                                                                borderRadius: '4px',
                                                                letterSpacing: '0.5px',
                                                                fontFamily: 'serif',
                                                            }}>
                                                                {item.variantSize}
                                                            </span>
                                                        )}
                                                        {item.variantType && (
                                                            <span style={{
                                                                background: 'rgba(212,175,55,0.15)',
                                                                border: '1px solid rgba(212,175,55,0.35)',
                                                                color: '#d4af37',
                                                                fontSize: '10px',
                                                                fontWeight: 700,
                                                                padding: '2px 10px',
                                                                borderRadius: '4px',
                                                                letterSpacing: '0.5px',
                                                                fontFamily: 'serif',
                                                            }}>
                                                                {item.variantType}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Price */}
                                                {item.price != null && (
                                                    <p style={{ color: '#d4af37', fontSize: '14px', fontWeight: 700, fontFamily: 'serif', margin: '4px 0' }}>
                                                        ${Number(item.price).toFixed(2)}
                                                    </p>
                                                )}

                                                <p className={styles.sku}>SKU: {item.productId}</p>

                                                <div className={styles.controlsWrapper}>
                                                    {/* Quantity Controls */}
                                                    <div className={styles.quantityControls}>
                                                        <button
                                                            onClick={() => updateWholesaleQuantity(item.productId, item.quantity - 1, item.variantSize, item.variantType)}
                                                            className={styles.qtyButton}
                                                            disabled={wholesaleLoading}
                                                        >
                                                            <Minus size={12} />
                                                        </button>
                                                        <span className={styles.qtyValue}>{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateWholesaleQuantity(item.productId, item.quantity + 1, item.variantSize, item.variantType)}
                                                            className={styles.qtyButton}
                                                            disabled={wholesaleLoading}
                                                        >
                                                            <Plus size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Summary / Actions Block */}
                            <div className={styles.summarySidebar}>
                                <div className={styles.summarySection}>
                                    <h2 className={styles.summaryTitle}>Order Summary</h2>

                                    <div className={styles.summaryRow}>
                                        <span>Total Items</span>
                                        <span className={styles.summaryValue}>{totalItems}</span>
                                    </div>
                                    <div className={styles.note}>
                                        * Note: This is a quote request. Final pricing confirmed by invoice.
                                    </div>

                                    <button
                                        onClick={() => router.push('/wholesale-checkout')}
                                        className="w-full bg-[#d4af37] hover:bg-[#b08d26] text-[#2c1810] font-bold py-3 rounded-lg shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 text-md"
                                    >
                                        REQUEST QUOTE <ArrowRight size={18} />
                                    </button>

                                    <div className="mt-4 text-center">
                                        <button
                                            onClick={() => router.push('/catalogue')}
                                            className="text-[#d4af37] hover:underline text-xs font-medium uppercase tracking-wider"
                                        >
                                            Continue Browsing
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </CatalogueAuthGuard>
    );
}
