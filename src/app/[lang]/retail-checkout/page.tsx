'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
    ArrowLeft, Package, Truck, CreditCard,
    CheckCircle, Loader2, ShieldCheck, AlertCircle
} from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext';
import { useCart } from '../../../context/CartContext';
import styles from './retail-checkout.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

interface ShippingRate {
    shippingCost: number;
    totalWeightLbs: number;
    estimatedDays: string;
    carrier: string;
}

interface FormProps {
    items: CartItem[];
    shippingRate: ShippingRate | null;
    formData: Record<string, string>;
    onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onSuccess: (orderId: string) => void;
}

// ─── Stripe loader — null when keys not configured ────────────────────────────
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = stripeKey && !stripeKey.includes('YOUR_')
    ? loadStripe(stripeKey)
    : null;

// ─── Card Element styling ─────────────────────────────────────────────────────
const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            color: '#e5e5e5',
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            '::placeholder': { color: '#888' },
            iconColor: '#d4af37',
        },
        invalid: { color: '#f87171', iconColor: '#f87171' },
    },
};

// ─── Shared: Address Fields ───────────────────────────────────────────────────
function AddressFields({ formData, onFormChange, shippingRate }: {
    formData: Record<string, string>;
    onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    shippingRate: ShippingRate | null;
}) {
    return (
        <>
            {/* Step 1: Customer & Shipping Info */}
            <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>
                    <span className={styles.stepBadge}>1</span>
                    <Package size={18} /> Customer &amp; Shipping
                </h2>
                <div className={styles.fieldGrid}>
                    <div className={styles.field}>
                        <label className={styles.label}>Full Name *</label>
                        <input type="text" name="customer_name" required className={styles.input}
                            placeholder="John Doe" value={formData.customer_name} onChange={onFormChange} />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Email Address *</label>
                        <input type="email" name="customer_email" required className={styles.input}
                            placeholder="john@example.com" value={formData.customer_email} onChange={onFormChange} />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Phone Number</label>
                        <input type="tel" name="customer_phone" className={styles.input}
                            placeholder="+1 (555) 000-0000" value={formData.customer_phone} onChange={onFormChange} />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Street Address *</label>
                        <input type="text" name="customer_address" required className={styles.input}
                            placeholder="123 Coffee Lane" value={formData.customer_address} onChange={onFormChange} />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>City *</label>
                        <input type="text" name="shipping_city" required className={styles.input}
                            placeholder="Miami" value={formData.shipping_city} onChange={onFormChange} />
                    </div>
                    <div className={styles.fieldRow}>
                        <div className={styles.field}>
                            <label className={styles.label}>State *</label>
                            <input type="text" name="shipping_state" required maxLength={2}
                                className={styles.input} placeholder="FL"
                                value={formData.shipping_state} onChange={onFormChange} />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>ZIP Code *</label>
                            <input type="text" name="shipping_zip" required className={styles.input}
                                placeholder="33101" value={formData.shipping_zip} onChange={onFormChange} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Step 2: UPS Shipping */}
            {shippingRate && (
                <div className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.stepBadge}>2</span>
                        <Truck size={18} /> Shipping Method
                    </h2>
                    <div className={styles.shippingOption}>
                        <div className={styles.shippingOptionLeft}>
                            <div className={styles.shippingRadio}>
                                <div className={styles.shippingRadioDot} />
                            </div>
                            <div>
                                <p className={styles.shippingCarrier}>{shippingRate.carrier}</p>
                                <p className={styles.shippingEta}>{shippingRate.estimatedDays}</p>
                                <p className={styles.shippingWeight}>
                                    Total weight: ~{shippingRate.totalWeightLbs} lb{shippingRate.totalWeightLbs !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <span className={styles.shippingPrice}>${shippingRate.shippingCost.toFixed(2)}</span>
                    </div>
                </div>
            )}
        </>
    );
}

// ─── STRIPE FORM — only rendered inside <Elements> ────────────────────────────
// Safe to call useStripe() / useElements() here because this component
// is ONLY ever mounted when stripePromise is non-null (inside <Elements>).
function StripeCheckoutForm({ items, shippingRate, formData, onFormChange, onSuccess }: FormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const { showError } = useNotification();
    const [loading, setLoading] = useState(false);
    const [cardError, setCardError] = useState('');

    const subtotal = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
    const tax = subtotal * 0.06;
    const shipping = shippingRate?.shippingCost ?? 10;
    const total = subtotal + tax + shipping;

    // Generate idempotency key for this checkout session
    const idempotencyKey = useMemo(() => {
        return `checkout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }, []);

    const createOrder = async (paymentIntentId: string) => {
        const res = await fetch('http://localhost:5000/api/payments/confirm-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                paymentIntentId,
                customer_name: formData.customer_name,
                customer_email: formData.customer_email,
                customer_phone: formData.customer_phone,
                customer_address: `${formData.customer_address}, ${formData.shipping_city}, ${formData.shipping_state} ${formData.shipping_zip}`,
                items,
                subtotal: subtotal.toFixed(2),
                tax: tax.toFixed(2),
                shippingCost: shipping,
                total: total.toFixed(2),
                idempotencyKey, // Prevent duplicate payments
            }),
        });
        const data = await res.json();
        if (res.ok) {
            onSuccess(data.orderId);
        } else if (res.status === 409 && data.orderId) {
            // Duplicate payment - order already exists
            onSuccess(data.orderId);
        } else {
            throw new Error(data.error || 'Order creation failed');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setLoading(true);
        setCardError('');

        try {
            const intentRes = await fetch('http://localhost:5000/api/payments/create-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    items, 
                    customer_email: formData.customer_email, 
                    shippingCost: shipping,
                    idempotencyKey // Prevent duplicate PaymentIntents
                }),
            });
            const intentData = await intentRes.json();
            if (!intentRes.ok) throw new Error(intentData.error || 'Failed to create payment intent');

            const cardElement = elements.getElement(CardElement);
            if (!cardElement) throw new Error('Card element not found');

            const { error, paymentIntent } = await stripe.confirmCardPayment(intentData.clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: { name: formData.customer_name, email: formData.customer_email },
                },
            });

            if (error) { setCardError(error.message || 'Payment failed'); return; }
            if (paymentIntent?.status === 'succeeded') await createOrder(paymentIntent.id);

        } catch (err: unknown) {
            showError(err instanceof Error ? err.message : 'Payment error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <AddressFields formData={formData} onFormChange={onFormChange} shippingRate={shippingRate} />

            {/* Step 3: Payment */}
            <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>
                    <span className={styles.stepBadge}>{shippingRate ? '3' : '2'}</span>
                    <CreditCard size={18} /> Payment
                </h2>
                <div className={styles.cardWrapper}>
                    <CardElement options={CARD_ELEMENT_OPTIONS} className={styles.cardElement} />
                    {cardError && (
                        <div className={styles.cardError}>
                            <AlertCircle size={14} /> {cardError}
                        </div>
                    )}
                    <div className={styles.secureNote}>
                        <ShieldCheck size={14} /> Secured by Stripe — your card details are never stored
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading || !stripe || !elements}
                className={styles.submitBtn}
                id="place-order-btn"
            >
                {loading
                    ? <><Loader2 size={18} className={styles.spinner} /> Processing...</>
                    : <><ShieldCheck size={18} /> Pay ${total.toFixed(2)}</>
                }
            </button>
        </form>
    );
}

// ─── DEMO FORM — rendered when Stripe keys are not configured ─────────────────
// Does NOT call useStripe() or useElements() — safe outside <Elements>.
function DemoCheckoutForm({ items, shippingRate, formData, onFormChange, onSuccess }: FormProps) {
    const { showError } = useNotification();
    const [loading, setLoading] = useState(false);

    const subtotal = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
    const tax = subtotal * 0.06;
    const shipping = shippingRate?.shippingCost ?? 10;
    const total = subtotal + tax + shipping;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/orders/retail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_name: formData.customer_name,
                    customer_email: formData.customer_email,
                    customer_phone: formData.customer_phone,
                    shipping_address: formData.customer_address,
                    shipping_city: formData.shipping_city,
                    shipping_state: formData.shipping_state,
                    shipping_zip: formData.shipping_zip,
                    items,
                    total: total.toFixed(2),
                }),
            });
            const data = await res.json();
            if (res.ok) {
                onSuccess(data.order?.id || data.id || 'DEMO');
            } else {
                throw new Error(data.error || 'Order failed');
            }
        } catch (err: unknown) {
            showError(err instanceof Error ? err.message : 'Order error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <AddressFields formData={formData} onFormChange={onFormChange} shippingRate={shippingRate} />

            {/* Payment — Demo Notice */}
            <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>
                    <span className={styles.stepBadge}>{shippingRate ? '3' : '2'}</span>
                    <CreditCard size={18} /> Payment
                </h2>
                <div className={styles.demoPayment}>
                    <CreditCard size={20} className={styles.demoIcon} />
                    <div>
                        <p className={styles.demoTitle}>Stripe Keys Not Configured</p>
                        <p className={styles.demoDesc}>
                            Add your keys to <code>.env.local</code> and <code>backend/.env</code> to enable real payments.
                            Orders will be created directly for testing.
                        </p>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className={styles.submitBtn}
                id="place-order-btn"
            >
                {loading
                    ? <><Loader2 size={18} className={styles.spinner} /> Processing...</>
                    : <><ShieldCheck size={18} /> Place Order — ${total.toFixed(2)}</>
                }
            </button>
        </form>
    );
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function RetailCheckoutPage() {
    const router = useRouter();
    const { showSuccess } = useNotification();
    const { clearRetailCart, retailItems } = useCart();

    const [items, setItems] = useState<CartItem[]>([]);
    const [shippingRate, setShippingRate] = useState<ShippingRate | null>(null);
    const [shippingLoading, setShippingLoading] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [completedOrderId, setCompletedOrderId] = useState('');

    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_address: '',
        shipping_city: '',
        shipping_state: '',
        shipping_zip: '',
    });

    // Load cart from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('retail_cart');
        if (stored) {
            setItems(JSON.parse(stored));
        } else if (retailItems.length === 0) {
            router.push('/products');
        }
    }, [router, retailItems]);

    // Calculate shipping rate via Shippo API when zip is entered
    useEffect(() => {
        if (items.length === 0) return;
        
        // Only call Shippo when we have a valid destination zip
        if (!formData.shipping_zip || formData.shipping_zip.length < 5) return;
        
        setShippingLoading(true);

        const weight = items.reduce((s, i) => s + i.quantity, 0);
        const originZip = '33101'; // La Rocca origin (Miami, FL) - should come from env/config

        fetch('http://localhost:5000/api/shipping/shippo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                origin_zip: originZip,
                destination_zip: formData.shipping_zip,
                weight: weight,
            }),
        })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data && data.rate) {
                    setShippingRate({
                        shippingCost: data.rate,
                        totalWeightLbs: weight,
                        estimatedDays: `${data.days}-5 business days`,
                        carrier: `${data.carrier} ${data.service}`,
                    });
                }
            })
            .catch(() => {
                // Fallback to flat rate if Shippo fails
                const w = items.reduce((s, i) => s + i.quantity, 0);
                setShippingRate({
                    shippingCost: w <= 5 ? 8 : w <= 10 ? 12 : w <= 20 ? 18 : 25,
                    totalWeightLbs: w,
                    estimatedDays: '3-5 business days',
                    carrier: 'UPS Ground',
                });
            })
            .finally(() => setShippingLoading(false));
    }, [items, formData.shipping_zip]);

    const handleFormChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })),
        []
    );

    const handleSuccess = useCallback((orderId: string) => {
        clearRetailCart();
        setOrderComplete(true);
        setCompletedOrderId(orderId);
        showSuccess('Payment successful! Order confirmed.');
    }, [clearRetailCart, showSuccess]);

    // Sidebar calculations
    const subtotal = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
    const tax = subtotal * 0.06;
    const shipping = shippingRate?.shippingCost ?? 10;
    const total = subtotal + tax + shipping;

    // ── Success screen ──
    if (orderComplete) {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.successScreen}>
                    <div className={styles.successIcon}><CheckCircle size={56} /></div>
                    <h1 className={styles.successTitle}>Order Confirmed!</h1>
                    <p className={styles.successSubtitle}>
                        Thank you for your purchase. A confirmation email has been sent.
                    </p>
                    <div className={styles.successOrderId}>Order #{completedOrderId}</div>
                    <div className={styles.successShipping}>
                        <Truck size={16} />
                        Shipping via UPS Ground · {shippingRate?.estimatedDays ?? '3-5 business days'}
                    </div>
                    <button onClick={() => router.push('/')} className={styles.successBtn}>
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    if (items.length === 0) return <div className={styles.pageWrapper} />;

    // ── Shared form props ──
    const formProps: FormProps = {
        items,
        shippingRate,
        formData,
        onFormChange: handleFormChange,
        onSuccess: handleSuccess,
    };

    // ── Shared order summary sidebar ──
    const summary = (
        <div className={styles.summaryCol}>
            <div className={styles.summaryCard}>
                <h2 className={styles.summaryTitle}>Order Summary</h2>
                <div className={styles.itemsList}>
                    {items.map((item, idx) => (
                        <div key={idx} className={styles.summaryItem}>
                            <div className={styles.summaryItemImg}>
                                <img src={item.image || '/placeholder.jpg'} alt={item.name}
                                    className={styles.summaryItemImgEl} />
                                <span className={styles.summaryItemQty}>{item.quantity}</span>
                            </div>
                            <div className={styles.summaryItemInfo}>
                                <p className={styles.summaryItemName}>{item.name}</p>
                                <p className={styles.summaryItemPrice}>${Number(item.price).toFixed(2)} each</p>
                            </div>
                            <span className={styles.summaryItemTotal}>
                                ${(Number(item.price) * item.quantity).toFixed(2)}
                            </span>
                        </div>
                    ))}
                </div>
                <div className={styles.summaryBreakdown}>
                    <div className={styles.summaryRow}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                    <div className={styles.summaryRow}><span>Tax (6%)</span><span>${tax.toFixed(2)}</span></div>
                    <div className={styles.summaryRow}>
                        <span className={styles.shippingLabel}>
                            <Truck size={13} />
                            {shippingLoading ? 'Calculating...' : 'UPS Ground'}
                        </span>
                        <span>
                            {shippingLoading
                                ? <Loader2 size={13} className={styles.spinner} />
                                : `$${shipping.toFixed(2)}`}
                        </span>
                    </div>
                </div>
                <div className={styles.summaryTotal}>
                    <span>Total</span>
                    <span className={styles.summaryTotalAmount}>${total.toFixed(2)}</span>
                </div>
                <div className={styles.securityBadges}>
                    <div className={styles.badge}><ShieldCheck size={13} /> SSL Secured</div>
                    <div className={styles.badge}><CreditCard size={13} /> Stripe Payments</div>
                    <div className={styles.badge}><Truck size={13} /> UPS Ground</div>
                </div>
            </div>
        </div>
    );

    // ── Page shell ──
    const shell = (formContent: React.ReactNode) => (
        <div className={styles.pageWrapper}>
            <div className={styles.pageContent}>
                <button onClick={() => router.back()} className={styles.backBtn}>
                    <ArrowLeft size={18} /> Back to Cart
                </button>
                <h1 className={styles.pageTitle}>Secure Checkout</h1>
                <div className={styles.layout}>
                    <div className={styles.formCol}>{formContent}</div>
                    {summary}
                </div>
            </div>
        </div>
    );

    // ── Conditional render: Stripe mode vs Demo mode ──
    // CRITICAL: StripeCheckoutForm (which calls useStripe/useElements) is ONLY
    // rendered inside <Elements>. DemoCheckoutForm never uses those hooks.
    if (stripePromise) {
        return (
            <Elements stripe={stripePromise}>
                {shell(<StripeCheckoutForm {...formProps} />)}
            </Elements>
        );
    }

    return shell(<DemoCheckoutForm {...formProps} />);
}
