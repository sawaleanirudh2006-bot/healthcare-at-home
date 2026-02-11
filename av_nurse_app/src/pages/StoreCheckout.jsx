import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, Wallet } from 'lucide-react';

const StoreCheckout = () => {
    const navigate = useNavigate();
    const [cart] = useState(() => {
        return JSON.parse(localStorage.getItem('shoppingCart') || '[]');
    });



    const [selectedAddress] = useState(() => {
        const savedAddresses = JSON.parse(localStorage.getItem('userAddresses') || '[]');
        return savedAddresses.find(a => a.isDefault) || savedAddresses[0] || null;
    });

    const [paymentMethod, setPaymentMethod] = useState('online');

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = subtotal > 500 ? 0 : 50;
    const total = subtotal + deliveryFee;

    const handlePlaceOrder = () => {
        if (!selectedAddress) {
            alert('Please select a delivery address');
            return;
        }

        const order = {
            id: `ORD-${Date.now()}`,
            items: cart,
            address: selectedAddress,
            paymentMethod,
            subtotal,
            deliveryFee,
            total,
            status: 'confirmed',
            orderDate: new Date().toISOString(),
            estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()
        };

        // Save order
        const orders = JSON.parse(localStorage.getItem('storeOrders') || '[]');
        orders.unshift(order);
        localStorage.setItem('storeOrders', JSON.stringify(orders));

        // Clear cart
        localStorage.setItem('shoppingCart', JSON.stringify([]));

        alert('Order placed successfully!');
        navigate('/order-tracking', { state: { orderId: order.id } });
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 pt-12 pb-4 px-5">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/cart')}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Checkout</h1>
                    <div className="w-10" />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-5 py-6 space-y-5 pb-32">
                {/* Delivery Address */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-slate-900">Delivery Address</h3>
                        <button
                            onClick={() => navigate('/manage-addresses')}
                            className="text-xs font-bold text-primary"
                        >
                            Change
                        </button>
                    </div>
                    {selectedAddress ? (
                        <div className="flex gap-3">
                            <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-slate-900 capitalize">{selectedAddress.type}</p>
                                <p className="text-sm text-slate-600 mt-1">{selectedAddress.fullAddress}</p>
                                {selectedAddress.landmark && (
                                    <p className="text-xs text-slate-500 mt-1">Near: {selectedAddress.landmark}</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/add-address')}
                            className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:border-primary hover:text-primary transition-colors"
                        >
                            + Add Delivery Address
                        </button>
                    )}
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Order Items ({cart.length})</h3>
                    <div className="space-y-3">
                        {cart.map(item => (
                            <div key={item.id} className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-2xl">
                                    {item.image}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-900">{item.name}</p>
                                    <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                </div>
                                <p className="text-sm font-bold text-slate-900">₹{item.price * item.quantity}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Payment Method</h3>
                    <div className="space-y-2">
                        <button
                            onClick={() => setPaymentMethod('online')}
                            className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'border-slate-200'
                                }`}
                        >
                            <CreditCard className={`w-5 h-5 ${paymentMethod === 'online' ? 'text-primary' : 'text-slate-400'}`} />
                            <span className={`text-sm font-bold ${paymentMethod === 'online' ? 'text-primary' : 'text-slate-700'}`}>
                                Online Payment
                            </span>
                        </button>
                        <button
                            onClick={() => setPaymentMethod('cod')}
                            className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-slate-200'
                                }`}
                        >
                            <Wallet className={`w-5 h-5 ${paymentMethod === 'cod' ? 'text-primary' : 'text-slate-400'}`} />
                            <span className={`text-sm font-bold ${paymentMethod === 'cod' ? 'text-primary' : 'text-slate-700'}`}>
                                Cash on Delivery
                            </span>
                        </button>
                    </div>
                </div>

                {/* Bill Summary */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-3">
                    <h3 className="text-base font-bold text-slate-900 mb-3">Bill Summary</h3>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Subtotal</span>
                        <span className="font-bold text-slate-900">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Delivery Fee</span>
                        <span className="font-bold text-slate-900">
                            {deliveryFee === 0 ? <span className="text-emerald-600">FREE</span> : `₹${deliveryFee}`}
                        </span>
                    </div>
                    <div className="flex justify-between text-base pt-3 border-t border-slate-100">
                        <span className="font-bold text-slate-900">Total Amount</span>
                        <span className="font-bold text-primary text-lg">₹{total}</span>
                    </div>
                </div>
            </main>

            {/* Place Order Button */}
            <div className="sticky bottom-0 bg-white border-t border-slate-100 p-5">
                <button
                    onClick={handlePlaceOrder}
                    className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-base shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
                >
                    Place Order • ₹{total}
                </button>
            </div>
        </div>
    );
};

export default StoreCheckout;
