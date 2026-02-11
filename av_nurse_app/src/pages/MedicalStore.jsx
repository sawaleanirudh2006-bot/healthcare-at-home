import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ShoppingCart, Plus, Minus } from 'lucide-react';

const MedicalStore = () => {
    const navigate = useNavigate();
    const [products] = useState(() => {
        // Initialize products
        const defaultProducts = [
            { id: 'prod-1', name: 'Paracetamol 500mg', category: 'Medicines', price: 25, image: '💊', stock: 100, description: 'Pain relief and fever reducer' },
            { id: 'prod-2', name: 'Digital Thermometer', category: 'Equipment', price: 299, image: '🌡️', stock: 50, description: 'Fast and accurate temperature reading' },
            { id: 'prod-3', name: 'Blood Pressure Monitor', category: 'Equipment', price: 1499, image: '🩺', stock: 30, description: 'Automatic BP measurement device' },
            { id: 'prod-4', name: 'Vitamin D3 Tablets', category: 'Supplements', price: 399, image: '💊', stock: 80, description: '60 tablets - 1000 IU' },
            { id: 'prod-5', name: 'First Aid Kit', category: 'First Aid', price: 599, image: '🏥', stock: 40, description: 'Complete emergency kit' },
            { id: 'prod-6', name: 'Pulse Oximeter', category: 'Equipment', price: 899, image: '📱', stock: 45, description: 'SpO2 and heart rate monitor' },
            { id: 'prod-7', name: 'Multivitamin Capsules', category: 'Supplements', price: 499, image: '💊', stock: 70, description: '30 capsules - Daily nutrition' },
            { id: 'prod-8', name: 'Antiseptic Liquid', category: 'First Aid', price: 149, image: '🧴', stock: 90, description: '500ml - Wound disinfectant' }
        ];
        return JSON.parse(localStorage.getItem('storeProducts') || JSON.stringify(defaultProducts));
    });

    const [cart, setCart] = useState(() => {
        return JSON.parse(localStorage.getItem('shoppingCart') || '[]');
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = ['All', 'Medicines', 'Equipment', 'Supplements', 'First Aid'];

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    const addToCart = (product) => {
        const existing = cart.find(item => item.id === product.id);
        let newCart;

        if (existing) {
            newCart = cart.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            );
        } else {
            newCart = [...cart, { ...product, quantity: 1 }];
        }

        setCart(newCart);
        localStorage.setItem('shoppingCart', JSON.stringify(newCart));
    };

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

    const getCartQuantity = (productId) => {
        const item = cart.find(i => i.id === productId);
        return item ? item.quantity : 0;
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto pb-24">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 pt-12 pb-4 px-5">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigate('/home')}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Medical Store</h1>
                    <button
                        onClick={() => navigate('/cart')}
                        className="flex size-10 items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 active:scale-95 transition-all relative"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        {cartItemCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {cartItemCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search medicines, equipment..."
                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat.toLowerCase())}
                            className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${selectedCategory === cat.toLowerCase()
                                ? 'bg-primary text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </header>

            {/* Products Grid */}
            <main className="flex-1 px-5 py-6">
                <div className="grid grid-cols-2 gap-4">
                    {filteredProducts.map(product => {
                        const qty = getCartQuantity(product.id);
                        return (
                            <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                                <div className="text-5xl mb-3 text-center">{product.image}</div>
                                <h3 className="text-sm font-bold text-slate-900 mb-1 line-clamp-2 min-h-[2.5rem]">
                                    {product.name}
                                </h3>
                                <p className="text-xs text-slate-500 mb-2 line-clamp-1">{product.description}</p>
                                <p className="text-lg font-bold text-primary mb-3">₹{product.price}</p>

                                {qty === 0 ? (
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="w-full h-9 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 active:scale-95 transition-all"
                                    >
                                        Add to Cart
                                    </button>
                                ) : (
                                    <div className="flex items-center justify-between h-9 bg-primary/10 rounded-xl px-2">
                                        <button
                                            onClick={() => updateQuantity(product.id, -1)}
                                            className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-primary hover:bg-slate-50 active:scale-95 transition-all"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="font-bold text-primary">{qty}</span>
                                        <button
                                            onClick={() => updateQuantity(product.id, 1)}
                                            className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-primary hover:bg-slate-50 active:scale-95 transition-all"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Cart Summary */}
            {cartItemCount > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-5 max-w-[430px] mx-auto">
                    <button
                        onClick={() => navigate('/cart')}
                        className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-base shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-between px-6"
                    >
                        <span>{cartItemCount} items</span>
                        <span>View Cart • ₹{cartTotal}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default MedicalStore;
