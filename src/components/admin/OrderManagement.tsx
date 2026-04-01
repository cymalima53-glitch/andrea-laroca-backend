import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Edit2, Mail, CheckCircle, Clock, Trash2, Truck, Package } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';

interface OrderItem {
    id: string;
    product_id: string;
    quantity: number;
    price_at_time: string;
    name: string; // Add name property
}

interface Order {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
    total_amount: string;
    status: string;
    created_at: string;
    items?: OrderItem[];
}

export default function OrderManagement() {
    const { accessToken } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [priceInput, setPriceInput] = useState('');
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [shippingModal, setShippingModal] = useState(false);
    const [shippingRate, setShippingRate] = useState<any>(null);
    const [creatingLabel, setCreatingLabel] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, [accessToken]);

    const fetchOrders = async () => {
        if (!accessToken) return;
        try {
            const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/admin/orders', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setLoading(false);
        }
    };

    const handleSetPrice = (order: Order) => {
        setSelectedOrder(order);
        setPriceInput(order.total_amount || '0');
        setShowPriceModal(true);
    };

    const submitPriceUpdate = async () => {
        if (!selectedOrder || !accessToken) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/orders/${selectedOrder.id}/price`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ total_amount: priceInput })
            });

            if (res.ok) {
                showSuccess('Price updated successfully');
                setShowPriceModal(false);
                fetchOrders(); // Refresh list
            } else {
                showError('Failed to update price');
            }
        } catch (error) {
            console.error('Error updating price:', error);
            showError('Error updating price');
        }
    };

    const sendInvoice = async (orderId: string) => {
        if (!accessToken) return;
        if (!confirm('Send invoice email to customer?')) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/orders/${orderId}/invoice`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (res.ok) {
                showSuccess('Invoice sent successfully');
            } else {
                showError('Failed to send invoice');
            }
        } catch (error) {
            console.error('Error sending invoice:', error);
            showError('Error sending invoice');
        }
    };

    const removeOrder = async (orderId: string) => {
        if (!accessToken) return;
        if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;

        try {
            // Using the general orders API for deletion since we added the DELETE route there
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders/${orderId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (res.ok) {
                showSuccess('Order removed successfully');
                setOrders(prev => prev.filter(o => o.id !== orderId));
            } else {
                const data = await res.json();
                showError(data.msg || 'Failed to remove order');
            }
        } catch (error) {
            console.error('Error removing order:', error);
            showError('Error removing order');
        }
    };

    // ─── SHIPPO SHIPPING LABEL CREATION ─────────────────────────────────────────
    const handleCreateShipment = async (order: Order) => {
        setSelectedOrder(order);
        setShippingModal(true);
        setShippingRate(null);
        
        // Extract zip from address (assumes format: "street, city, state zip")
        const addressParts = order.customer_address?.split(' ') || [];
        const zip = addressParts[addressParts.length - 1];
        
        if (!zip || zip.length < 5) {
            showError('Could not extract valid ZIP code from customer address');
            return;
        }

        // Get item count for weight
        const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 1;

        try {
            // Get shipping rate from Shippo
            const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/shipping/shippo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    origin_zip: '33101', // La Rocca Miami
                    destination_zip: zip,
                    weight: itemCount
                })
            });

            const data = await res.json();
            if (res.ok && data.rate) {
                setShippingRate(data);
            } else {
                showError(data.error || 'Could not get shipping rate');
            }
        } catch (error) {
            console.error('Error getting shipping rate:', error);
            showError('Failed to get shipping rate');
        }
    };

    const createShippingLabel = async () => {
        if (!selectedOrder || !shippingRate?.shippo_object_id) return;
        
        setCreatingLabel(true);
        try {
            const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/shipping/create-label', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    rate_object_id: shippingRate.shippo_object_id,
                    order_id: selectedOrder.id
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                showSuccess(`Shipping label created! Tracking: ${data.tracking_number}`);
                
                // Update order status locally
                setOrders(prev => prev.map(o => 
                    o.id === selectedOrder.id 
                        ? { ...o, status: 'shipped', tracking_number: data.tracking_number }
                        : o
                ));
                
                setShippingModal(false);
            } else {
                showError(data.error || 'Failed to create shipping label');
            }
        } catch (error) {
            console.error('Error creating label:', error);
            showError('Failed to create shipping label');
        } finally {
            setCreatingLabel(false);
        }
    };

    if (loading) return <div>Loading orders...</div>;

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Order Management</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    #{order.id.toString().slice(0, 8)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <div className="font-medium text-gray-900">{order.customer_name}</div>
                                    <div>{order.customer_email}</div>
                                    <div className="text-xs">{order.customer_phone}</div>
                                    <div className="text-xs text-gray-500 mt-1">{order.customer_address}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                                    ${Number(order.total_amount).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <ul className="list-disc list-inside">
                                        {order.items && order.items.length > 0 ? (
                                            order.items.map((item, index) => (
                                                <li key={index}>
                                                    <span className="font-medium text-gray-900">{item.name}</span>
                                                    <span className="text-gray-500"> (x{item.quantity})</span>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="text-gray-400 italic">No items</li>
                                        )}
                                    </ul>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2 flex-wrap">
                                    <button
                                        onClick={() => handleSetPrice(order)}
                                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded"
                                    >
                                        <Edit2 size={14} /> Set Price
                                    </button>
                                    <button
                                        onClick={() => sendInvoice(order.id)}
                                        className="text-purple-600 hover:text-purple-900 flex items-center gap-1 bg-purple-50 px-2 py-1 rounded"
                                    >
                                        <Mail size={14} /> Invoice
                                    </button>
                                    <button
                                        onClick={() => handleCreateShipment(order)}
                                        className="text-green-600 hover:text-green-900 flex items-center gap-1 bg-green-50 px-2 py-1 rounded"
                                        title="Create UPS Shipping Label"
                                    >
                                        <Truck size={14} /> Ship
                                    </button>
                                    <button
                                        onClick={() => removeOrder(order.id)}
                                        className="text-white bg-red-600 hover:bg-red-700 flex items-center gap-1 px-2 py-1 rounded"
                                        title="Remove Order"
                                    >
                                        <Trash2 size={14} /> Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Set Price Modal */}
            {showPriceModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h3 className="text-lg font-bold mb-4">Set Order Price</h3>
                        <p className="text-sm text-gray-500 mb-4">Enter the final invoice amount for this order.</p>
                        <input
                            type="number"
                            step="0.01"
                            value={priceInput}
                            onChange={(e) => setPriceInput(e.target.value)}
                            className="w-full border p-2 rounded mb-4"
                            placeholder="0.00"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowPriceModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitPriceUpdate}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Save Price
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Shipping Label Modal */}
            {shippingModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-[480px] max-w-[90vw]">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Truck size={20} className="text-green-600" />
                            Create UPS Shipping Label
                        </h3>
                        
                        <div className="bg-gray-50 p-3 rounded mb-4">
                            <p className="text-sm font-medium">Order #{selectedOrder.id.toString().slice(0, 8)}</p>
                            <p className="text-sm text-gray-600">{selectedOrder.customer_name}</p>
                            <p className="text-sm text-gray-500">{selectedOrder.customer_address}</p>
                        </div>

                        {!shippingRate ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                <span className="ml-3 text-gray-600">Getting UPS Ground rate...</span>
                            </div>
                        ) : (
                            <div className="mb-4">
                                <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-semibold text-green-800">
                                            {shippingRate.carrier} {shippingRate.service}
                                        </span>
                                        <span className="text-xl font-bold text-green-700">
                                            ${shippingRate.rate.toFixed(2)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Estimated delivery: <strong>{shippingRate.days} business days</strong>
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Includes tracking number
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShippingModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createShippingLabel}
                                disabled={!shippingRate || creatingLabel}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {creatingLabel ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Package size={16} />
                                        Purchase Label
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
