'use client';

import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ArrowRight, XCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '../../../context/CartContext';

import styles from './retail-cart.module.css';

export default function RetailCartPage() {
    const { retailItems, updateRetailQuantity, removeFromRetailCart, clearRetailCart } = useCart();
    const router = useRouter();

    const cartItems = retailItems;

    // Calculations
    const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
    const taxRate = 0.06; // Florida 6%
    const tax = subtotal * taxRate;
    const shipping = subtotal > 0 ? 10.00 : 0; // Fixed $10 shipping
    const total = subtotal + tax + shipping;

    const handleClearCart = () => {
        if (confirm('Are you sure you want to clear your cart?')) {
            clearRetailCart();
        }
    };

    return (
        <div className="min-h-screen bg-[#2c1810] text-[#e5e5e5]">
            <div className={`pt-24 pb-12 max-w-7xl mx-auto ${styles.container}`}>
                <div className="flex items-center justify-between mb-6 border-b border-[#d4af37]/30 pb-3">
                    <h1 className="text-2xl font-serif text-[#d4af37]">Shopping Cart <span className="text-sm text-gray-400 font-sans ml-2">({cartItems.length} items)</span></h1>

                    {cartItems.length > 0 && (
                        <button
                            onClick={handleClearCart}
                            className="text-red-400 hover:text-red-300 flex items-center gap-1 text-xs transition-colors"
                        >
                            <XCircle size={14} /> Clear Cart
                        </button>
                    )}
                </div>

                {cartItems.length === 0 ? (
                    <div className="bg-[#3e2318] p-12 rounded-lg border border-[#d4af37]/20 text-center animate-fade-in">
                        <ShoppingBag size={48} className="mx-auto text-[#d4af37]/50 mb-4" />
                        <h2 className="text-xl font-serif text-[#d4af37] mb-2">Your cart is empty</h2>
                        <button
                            onClick={() => router.push('/products')}
                            className="mt-4 bg-[#d4af37] hover:bg-[#b08d26] text-[#2c1810] px-6 py-2 rounded font-bold transition-all text-sm inline-flex items-center gap-2"
                        >
                            Start Shopping <ArrowRight size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Compact Cart Grid */}
                        <div className="lg:w-3/4">
                            <div className={styles.cartGrid}>
                                {cartItems.map((item) => (
                                    <div key={`${item.productId}-${item.variantSize}-${item.variantType}`} className={styles.cartItem}>
                                        <button
                                            onClick={() => removeFromRetailCart(item.productId, item.variantSize, item.variantType)}
                                            className={styles.removeBtn}
                                            title="Remove"
                                        >
                                            <Trash2 size={12} />
                                        </button>

                                        <div className={styles.productImageWrapper}>
                                            <img
                                                src={item.image || '/placeholder.jpg'}
                                                alt={item.name}
                                                className={styles.productImage}
                                            />
                                        </div>

                                        <div className={styles.productDetails}>
                                            <h3 className={styles.productName} title={item.name}>{item.name}</h3>
                                            {/* Variant badges */}
                                            {(item.variantSize || item.variantType) && (
                                                <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                                                    {item.variantSize && (
                                                        <span style={{
                                                            background: 'rgba(212,175,55,0.15)',
                                                            border: '1px solid rgba(212,175,55,0.3)',
                                                            color: '#d4af37',
                                                            fontSize: '10px',
                                                            fontWeight: 700,
                                                            padding: '2px 8px',
                                                            borderRadius: '4px',
                                                            letterSpacing: '0.5px',
                                                        }}>
                                                            {item.variantSize}
                                                        </span>
                                                    )}
                                                    {item.variantType && (
                                                        <span style={{
                                                            background: 'rgba(212,175,55,0.15)',
                                                            border: '1px solid rgba(212,175,55,0.3)',
                                                            color: '#d4af37',
                                                            fontSize: '10px',
                                                            fontWeight: 700,
                                                            padding: '2px 8px',
                                                            borderRadius: '4px',
                                                            letterSpacing: '0.5px',
                                                        }}>
                                                            {item.variantType}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            <div className={styles.productPrice}>${Number(item.price).toFixed(2)}</div>
                                        </div>

                                        <div className={styles.quantitySection}>
                                            <div className={styles.quantityControls}>
                                                <button
                                                    onClick={() => updateRetailQuantity(item.productId, item.quantity - 1, item.variantSize, item.variantType)}
                                                    className={styles.qtyButton}
                                                >
                                                    <Minus size={10} />
                                                </button>
                                                <span className={styles.qtyValue}>{item.quantity}</span>
                                                <button
                                                    onClick={() => updateRetailQuantity(item.productId, item.quantity + 1, item.variantSize, item.variantType)}
                                                    className={styles.qtyButton}
                                                >
                                                    <Plus size={10} />
                                                </button>
                                            </div>
                                            <div className={styles.itemTotal}>
                                                ${(Number(item.price) * item.quantity).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:w-1/4">
                            <div className="bg-[#3e2318] p-5 rounded-lg border border-[#d4af37] shadow-lg sticky top-24">
                                <h2 className="text-lg font-bold mb-4 text-[#d4af37] font-serif border-b border-[#d4af37]/30 pb-2">Order Summary</h2>

                                <div className="space-y-2 mb-4 text-sm">
                                    <div className="flex justify-between items-center text-gray-300">
                                        <span>Subtotal</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-300">
                                        <span>Tax (6%)</span>
                                        <span>${tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-300">
                                        <span>Shipping</span>
                                        <span>${shipping.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="border-t border-[#d4af37]/30 pt-3 mb-6">
                                    <div className="flex justify-between items-center text-lg font-bold font-serif">
                                        <span className="text-white">Total</span>
                                        <span className="text-[#d4af37]">${total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => router.push('/retail-checkout')}
                                    className="w-full bg-gradient-to-r from-[#d4af37] to-[#b08d26] hover:from-[#c5a028] hover:to-[#91731b] text-[#2c1810] font-bold py-3 rounded shadow transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 text-sm"
                                >
                                    CHECKOUT <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
