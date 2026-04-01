'use client';

import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';
import { ShoppingCart, LogOut } from 'lucide-react';

import styles from './HeaderActions.module.css';

export default function HeaderActions() {
    const { user, isAuthenticated, logout } = useAuth();
    const { retailItemCount, wholesaleItemCount } = useCart();

    const isWholesaleUser = isAuthenticated && user?.role === 'wholesale';
    const isApproved = isWholesaleUser && user?.approval_status === 'approved';

    return (
        <div className={styles.headerRight}>
            <LanguageSwitcher />

            {/* Cart Section */}
            <div>
                {isApproved ? (
                    // Wholesale Cart (Active)
                    <Link
                        href="/wholesale-cart"
                        className={styles.cartSection}
                    >
                        <div className="relative">
                            <ShoppingCart className={styles.cartIcon} strokeWidth={1.5} />
                            {/* Wholesale Badge "W" */}
                            <span className={`${styles.badge} -bottom-2 -right-2 w-4 h-4 text-[9px] bg-blue-900 ring-1 ring-[#1a1a1a]`}>
                                W
                            </span>
                        </div>

                        {/* Count Badge */}
                        {wholesaleItemCount > 0 && (
                            <span className={`${styles.badge} -top-1 -right-1 w-4 h-4 bg-red-600 ring-2 ring-[#0f0f0f] text-[10px]`}>
                                {wholesaleItemCount}
                            </span>
                        )}

                        <span className={styles.cartText}>CART</span>

                        {/* Premium Tooltip */}
                        <div className={styles.tooltip}>
                            <div className={styles.tooltipContent}>
                                <div className="font-medium text-[#d4af37] mb-0.5">Wholesale Cart</div>
                                {retailItemCount > 0 && (
                                    <div className="text-[10px] text-gray-500 border-t border-[#333] mt-1 pt-1">
                                        Retail items: {retailItemCount}
                                    </div>
                                )}
                                <div className={styles.tooltipArrow}></div>
                            </div>
                        </div>
                    </Link>
                ) : (
                    // Retail Cart (Default)
                    <Link
                        href="/retail-cart"
                        className={styles.cartSection}
                    >
                        <div className="relative">
                            <ShoppingCart className={styles.cartIcon} strokeWidth={1.5} />
                            {retailItemCount > 0 && (
                                <span className={`${styles.badge} -top-1 -right-1 w-4 h-4 bg-red-600 ring-2 ring-[#0f0f0f] text-[10px]`}>
                                    {retailItemCount}
                                </span>
                            )}
                        </div>

                        <span className={styles.cartText}>CART</span>

                        {/* Tooltip */}
                        <div className={styles.tooltip}>
                            <div className={styles.tooltipContent}>
                                <span className="font-medium">Retail Cart</span>
                                <div className={styles.tooltipArrow}></div>
                            </div>
                        </div>
                    </Link>
                )}
            </div>

            {/* Auth Section */}
            <div className={styles.authSection}>
                {isAuthenticated ? (
                    <>
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-serif font-bold text-[#e5e5e5] tracking-wide leading-none">
                                {user?.username}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider text-[#d4af37]">
                                {user?.role === 'wholesale' ? 'Wholesale' : user?.role === 'admin' ? 'Admin' : 'Member'}
                            </span>
                        </div>

                        {user?.role === 'admin' && (
                            <Link href="/admin" className={styles.authLink}>
                                Dashboard
                            </Link>
                        )}

                        <button
                            onClick={() => logout()}
                            className={styles.authLink}
                            title="Logout"
                        >
                            LOGOUT
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/auth/login" className={styles.authLink}>
                            LOGIN
                        </Link>
                        <span className={styles.authSeparator}>|</span>
                        <Link href="/auth/login?tab=register" className={styles.authLink}>
                            JOIN
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
