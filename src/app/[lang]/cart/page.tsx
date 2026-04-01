'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CartItem {
    id: string;
    product_id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    subtotal: number;
}

export default function CartPage() {
    const { user, accessToken } = useAuth();
    const router = useRouter();
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) {
            router.push('/auth/login');
            return;
        }
        if (accessToken) {
            fetchCart();
        }
    }, [user, accessToken]);

    const fetchCart = async () => {
        try {
            const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/cart', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setItems(data.items || []);
            }
        } catch (err) {
            setError('Failed to load cart');
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId: string, quantity: number) => {
        if (quantity < 1) {
            removeItem(itemId);
            return;
        }

        try {
            await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/cart/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ itemId, quantity })
            });
            fetchCart();
        } catch (err) {
            setError('Failed to update cart');
        }
    };

    const removeItem = async (itemId: string) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/cart/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            fetchCart();
        } catch (err) {
            setError('Failed to remove item');
        }
    };

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const shipping = subtotal > 0 ? (subtotal > 100 ? 0 : 15) : 0;
    const total = subtotal + shipping;

    if (loading) {
        return (
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '40px 20px',
                textAlign: 'center',
                color: '#666',
            }}>
                ⏳ Loading cart...
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '40px 20px',
            fontFamily: 'Arial, sans-serif',
            marginTop: '60px'
        }}>
            {/* Header */}
            <div style={{
                marginBottom: '40px',
                borderBottom: '3px solid #d4af37',
                paddingBottom: '20px',
            }}>
                <h1 style={{
                    color: '#2c1810',
                    fontSize: '32px',
                    margin: '0 0 10px 0',
                }}>
                    🛒 Shopping Cart
                </h1>
                <p style={{
                    color: '#666',
                    margin: 0,
                    fontSize: '14px',
                }}>
                    {items.length} item{items.length !== 1 ? 's' : ''} in your cart
                </p>
            </div>

            {error && (
                <div style={{
                    background: '#f8d7da',
                    color: '#721c24',
                    padding: '15px',
                    borderRadius: '6px',
                    marginBottom: '20px',
                    border: '1px solid #f5c6cb',
                }}>
                    ⚠️ {error}
                </div>
            )}

            {items.length === 0 ? (
                <div style={{
                    background: '#f9f9f9',
                    padding: '60px 20px',
                    textAlign: 'center',
                    borderRadius: '8px',
                }}>
                    <p style={{
                        color: '#999',
                        fontSize: '16px',
                        marginBottom: '20px',
                    }}>
                        Your cart is empty
                    </p>
                    <Link
                        href="/catalogue"
                        style={{
                            background: 'linear-gradient(135deg, #d4af37 0%, #c9a227 100%)',
                            color: 'white',
                            padding: '12px 30px',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            display: 'inline-block',
                        }}
                    >
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
                    {/* Cart Items */}
                    <div>
                        {items.map((item) => (
                            <div
                                key={item.id}
                                style={{
                                    background: 'white',
                                    border: '1px solid #eee',
                                    borderRadius: '8px',
                                    padding: '20px',
                                    marginBottom: '15px',
                                    display: 'grid',
                                    gridTemplateColumns: '100px 1fr auto',
                                    gap: '20px',
                                    alignItems: 'center',
                                }}
                            >
                                {/* Product Image */}
                                <div style={{
                                    background: '#f9f9f9',
                                    borderRadius: '6px',
                                    overflow: 'hidden',
                                    height: '100px',
                                    width: '100px',
                                }}>
                                    <img
                                        src={item.image || '/placeholder.jpg'}
                                        alt={item.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
                                    />
                                </div>

                                {/* Product Info & Quantity */}
                                <div>
                                    <h3 style={{
                                        margin: '0 0 10px 0',
                                        color: '#2c1810',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                    }}>
                                        {item.name}
                                    </h3>

                                    <p style={{
                                        color: '#d4af37',
                                        fontWeight: 'bold',
                                        fontSize: '14px',
                                        margin: '0 0 15px 0',
                                    }}>
                                        ${item.price.toFixed(2)} each
                                    </p>

                                    {/* Quantity Controls */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                    }}>
                                        <label style={{
                                            fontSize: '12px',
                                            color: '#666',
                                            fontWeight: 'bold',
                                        }}>
                                            QTY:
                                        </label>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            style={{
                                                width: '30px',
                                                height: '30px',
                                                border: '1px solid #ddd',
                                                background: '#f9f9f9',
                                                cursor: 'pointer',
                                                borderRadius: '4px',
                                                fontWeight: 'bold',
                                                color: '#333',
                                            }}
                                        >
                                            −
                                        </button>
                                        <input
                                            type='number'
                                            value={item.quantity}
                                            onChange={(e) =>
                                                updateQuantity(item.id, parseInt(e.target.value) || 1)
                                            }
                                            style={{
                                                width: '50px',
                                                padding: '6px',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                textAlign: 'center',
                                                fontSize: '14px',
                                            }}
                                        />
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            style={{
                                                width: '30px',
                                                height: '30px',
                                                border: '1px solid #ddd',
                                                background: '#f9f9f9',
                                                cursor: 'pointer',
                                                borderRadius: '4px',
                                                fontWeight: 'bold',
                                                color: '#333',
                                            }}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Price & Remove */}
                                <div style={{
                                    textAlign: 'right',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '15px',
                                }}>
                                    <div>
                                        <p style={{
                                            color: '#999',
                                            fontSize: '12px',
                                            margin: '0 0 5px 0',
                                        }}>
                                            Subtotal
                                        </p>
                                        <p style={{
                                            color: '#d4af37',
                                            fontWeight: 'bold',
                                            fontSize: '18px',
                                            margin: 0,
                                        }}>
                                            ${item.subtotal.toFixed(2)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        style={{
                                            background: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            padding: '8px 12px',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        ✕ Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div>
                        <div style={{
                            background: 'white',
                            border: '2px solid #d4af37',
                            borderRadius: '8px',
                            padding: '25px',
                            position: 'sticky',
                            top: '120px',
                        }}>
                            <h2 style={{
                                color: '#2c1810',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                margin: '0 0 20px 0',
                                borderBottom: '2px solid #d4af37',
                                paddingBottom: '15px',
                            }}>
                                Order Summary
                            </h2>

                            {/* Subtotal */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '12px',
                                paddingBottom: '12px',
                                borderBottom: '1px solid #eee',
                            }}>
                                <span style={{ color: '#666', fontSize: '14px' }}>Subtotal:</span>
                                <span style={{ color: '#333', fontWeight: 'bold' }}>
                                    ${subtotal.toFixed(2)}
                                </span>
                            </div>

                            {/* Shipping */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '15px',
                                paddingBottom: '15px',
                                borderBottom: '2px solid #d4af37',
                            }}>
                                <span style={{ color: '#666', fontSize: '14px' }}>
                                    Shipping:
                                    {shipping === 0 && (
                                        <span style={{
                                            color: '#28a745',
                                            fontWeight: 'bold',
                                            fontSize: '12px',
                                            marginLeft: '5px',
                                        }}>
                                            FREE
                                        </span>
                                    )}
                                </span>
                                <span style={{
                                    color: shipping === 0 ? '#28a745' : '#333',
                                    fontWeight: 'bold',
                                }}>
                                    ${shipping.toFixed(2)}
                                </span>
                            </div>

                            {/* Total */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '25px',
                            }}>
                                <span style={{
                                    color: '#2c1810',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                }}>
                                    Total:
                                </span>
                                <span style={{
                                    color: '#d4af37',
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                }}>
                                    ${total.toFixed(2)}
                                </span>
                            </div>

                            {/* Checkout Button */}
                            <button
                                onClick={() => router.push('/checkout')}
                                className="btn-primary"
                                style={{ width: '100%', marginBottom: '10px' }}
                            >
                                Proceed to Checkout
                            </button>

                            <Link
                                href="/catalogue"
                                style={{
                                    display: 'block',
                                    textAlign: 'center',
                                    color: '#d4af37',
                                    textDecoration: 'none',
                                    fontSize: '13px',
                                    fontWeight: 'bold',
                                    marginTop: '15px',
                                }}
                            >
                                ← Continue Shopping
                            </Link>

                            {/* Info Box */}
                            <div style={{
                                background: '#fffbea',
                                border: '1px solid #ffc107',
                                borderRadius: '6px',
                                padding: '12px',
                                marginTop: '20px',
                                fontSize: '12px',
                                color: '#856404',
                                lineHeight: '1.6',
                            }}>
                                <p style={{ margin: '0 0 8px 0' }}>
                                    ✓ Free shipping on orders over $100
                                </p>
                                <p style={{ margin: '0 0 8px 0' }}>
                                    ✓ Secure checkout with Stripe
                                </p>
                                <p style={{ margin: 0 }}>
                                    ✓ Track your order in real-time
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
