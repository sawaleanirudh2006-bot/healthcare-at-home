import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle } from 'lucide-react';

const OrderTracking = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const orderId = location.state?.orderId;
    const [order] = useState(() => {
        if (orderId) {
            const orders = JSON.parse(localStorage.getItem('storeOrders') || '[]');
            return orders.find(o => o.id === orderId) || null;
        }
        return null;
    });

    if (!order) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <p className="text-slate-500">Order not found</p>
            </div>
        );
    }

    const steps = [
        { label: 'Order Confirmed', icon: CheckCircle, completed: true },
        { label: 'Processing', icon: Package, completed: order.status !== 'confirmed' },
        { label: 'Out for Delivery', icon: Truck, completed: order.status === 'delivered' },
        { label: 'Delivered', icon: CheckCircle, completed: order.status === 'delivered' }
    ];

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 pt-12 pb-4 px-5">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/home')}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Order Tracking</h1>
                    <div className="w-10" />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-5 py-6 space-y-5">
                {/* Order Info */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase">Order ID</p>
                            <p className="text-sm font-bold text-slate-900">{order.id}</p>
                        </div>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
                            {order.status}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                        <div>
                            <p className="text-xs text-slate-500">Order Date</p>
                            <p className="text-sm font-bold text-slate-900">
                                {new Date(order.orderDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Est. Delivery</p>
                            <p className="text-sm font-bold text-slate-900">{order.estimatedDelivery}</p>
                        </div>
                    </div>
                </div>

                {/* Tracking Steps */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 mb-4">Tracking Status</h3>
                    <div className="space-y-4">
                        {steps.map((step, idx) => {
                            const Icon = step.icon;
                            return (
                                <div key={idx} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.completed ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
                                            }`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        {idx < steps.length - 1 && (
                                            <div className={`w-0.5 h-12 ${step.completed ? 'bg-primary' : 'bg-slate-200'}`} />
                                        )}
                                    </div>
                                    <div className="flex-1 pt-2">
                                        <p className={`text-sm font-bold ${step.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                                            {step.label}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Order Items</h3>
                    <div className="space-y-3">
                        {order.items.map(item => (
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
                    <div className="flex justify-between pt-3 mt-3 border-t border-slate-100">
                        <span className="font-bold text-slate-900">Total</span>
                        <span className="font-bold text-primary text-lg">₹{order.total}</span>
                    </div>
                </div>

                {/* Delivery Address */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Delivery Address</h3>
                    <p className="text-sm font-bold text-slate-900 capitalize mb-1">{order.address.type}</p>
                    <p className="text-sm text-slate-600">{order.address.fullAddress}</p>
                </div>
            </main>
        </div>
    );
};

export default OrderTracking;
