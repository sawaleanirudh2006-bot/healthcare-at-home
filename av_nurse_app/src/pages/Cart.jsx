import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';

const Cart = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState(() => {
        return JSON.parse(localStorage.getItem('shoppingCart') || '[]');
    });

    const updateQuantity = (productId, change) => {
        const newCart = cart.map(item => {
            if (item.id === productId) {
                const newQty = item.quantity + change;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
        }).filter(Boolean);

        setCart(newCart);
        localStorage.setItem('shoppingCart', JSON.stringify(newCart));
    };

    const removeItem = (productId) => {
        const newCart = cart.filter(item => item.id !== productId);
        setCart(newCart);
        localStorage.setItem('shoppingCart', JSON.stringify(newCart));
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = subtotal > 500 ? 0 : 50;
    const total = subtotal + deliveryFee;

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 pt-12 pb-4 px-5">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/store')}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Shopping Cart</h1>
                    <div className="w-10" />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-5 py-6 space-y-4 pb-32">
                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <ShoppingBag className="w-16 h-16 text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Your cart is empty</h3>
                        <p className="text-sm text-slate-500 text-center mb-6">
                            Add items from the medical store
                        </p>
                        <button
                            onClick={() => navigate('/store')}
                            className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 active:scale-95 transition-all"
                        >
                            Browse Products
                        </button>
                    </div>
                ) : (
                    <>
                        {cart.map(item => (
                            <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                                <div className="flex gap-4">
                                    <div className="w-20 h-20 bg-slate-50 rounded-xl flex items-center justify-center text-4xl">
                                        {item.image}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-slate-900 mb-1">{item.name}</h3>
                                        <p className="text-xs text-slate-500 mb-2">{item.description}</p>
                                        <p className="text-base font-bold text-primary">₹{item.price}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="font-bold text-slate-900 w-8 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg font-bold text-sm hover:bg-red-100 active:scale-95 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}

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
                                    {deliveryFee === 0 ? (
                                        <span className="text-emerald-600">FREE</span>
                                    ) : (
                                        `₹${deliveryFee}`
                                    )}
                                </span>
                            </div>
                            {deliveryFee > 0 && (
                                <p className="text-xs text-amber-600">
                                    Add ₹{500 - subtotal} more for free delivery
                                </p>
                            )}
                            <div className="flex justify-between text-base pt-3 border-t border-slate-100">
                                <span className="font-bold text-slate-900">Total</span>
                                <span className="font-bold text-primary text-lg">₹{total}</span>
                            </div>
                        </div>
                    </>
                )}
            </main>

            {/* Checkout Button */}
            {cart.length > 0 && (
                <div className="sticky bottom-0 bg-white border-t border-slate-100 p-5">
                    <button
                        onClick={() => navigate('/store-checkout')}
                        className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-base shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
                    >
                        Proceed to Checkout • ₹{total}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Cart;
