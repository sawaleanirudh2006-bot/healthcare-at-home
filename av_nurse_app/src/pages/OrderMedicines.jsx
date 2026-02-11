import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Upload, ShoppingCart, Plus, Minus } from 'lucide-react';
import { cn } from '../lib/utils';

const categories = ['All', 'Prescription', 'Vitamins', 'Pain Relief', 'Diabetes', 'Heart'];

const medicines = [
    {
        id: 1,
        name: 'Amoxicillin 500mg',
        description: 'Strip of 10 capsules',
        price: 120,
        category: 'Prescription',
        requiresPrescription: true,
        inStock: true,
    },
    {
        id: 2,
        name: 'Paracetamol Syrup',
        description: '60ml Bottle',
        price: 85,
        category: 'Pain Relief',
        requiresPrescription: false,
        inStock: true,
    },
    {
        id: 3,
        name: 'Metformin 500mg',
        description: 'Strip of 15 tablets',
        price: 95,
        category: 'Diabetes',
        requiresPrescription: true,
        inStock: true,
    },
    {
        id: 4,
        name: 'Multivitamin Capsules',
        description: 'Bottle of 30 capsules',
        price: 250,
        category: 'Vitamins',
        requiresPrescription: false,
        inStock: true,
    },
    {
        id: 5,
        name: 'Aspirin 75mg',
        description: 'Strip of 14 tablets',
        price: 45,
        category: 'Heart',
        requiresPrescription: false,
        inStock: true,
    },
];

export default function OrderMedicines() {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState({});


    const filteredMedicines = medicines.filter((med) => {
        const matchesCategory = selectedCategory === 'All' || med.category === selectedCategory;
        const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const addToCart = (id) => {
        setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    };

    const removeFromCart = (id) => {
        setCart((prev) => {
            const newCart = { ...prev };
            if (newCart[id] > 1) {
                newCart[id]--;
            } else {
                delete newCart[id];
            }
            return newCart;
        });
    };

    const cartCount = Object.values(cart).reduce((sum, count) => sum + count, 0);
    const cartTotal = Object.entries(cart).reduce((sum, [id, count]) => {
        const medicine = medicines.find((m) => m.id === parseInt(id));
        return sum + (medicine?.price || 0) * count;
    }, 0);

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md pt-12 pb-4 px-5">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex size-10 items-center justify-center rounded-full bg-white shadow-soft text-slate-700"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold tracking-tight text-slate-800">
                        Order Medicines
                    </h1>
                    <button
                        onClick={() => {
                            const cartItems = Object.entries(cart).map(([id, quantity]) => {
                                const med = medicines.find(m => m.id === parseInt(id));
                                return { ...med, quantity };
                            });

                            // Check if any items require prescription
                            const requiresPrescription = cartItems.some(item => item.requiresPrescription);

                            if (requiresPrescription) {
                                // Redirect to prescription upload
                                navigate('/upload-prescription', {
                                    state: {
                                        serviceType: 'Medicine Order',
                                        isMedicineOrder: true,
                                        cartItems,
                                        total: cartTotal
                                    }
                                });
                            } else {
                                // Direct checkout for non-prescription items
                                navigate('/checkout', {
                                    state: {
                                        cartItems,
                                        total: cartTotal,
                                        serviceType: 'Medicine Order',
                                        isMedicineOrder: true
                                    }
                                });
                            }
                        }}
                        className="flex size-10 items-center justify-center rounded-full bg-white shadow-soft text-slate-700 relative"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                {cartCount}
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
                        placeholder="Search medicines..."
                        className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={cn(
                                'px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all',
                                selectedCategory === category
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-primary/30'
                            )}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </header>

            {/* Prescription Upload Banner */}
            <div className="px-5 mb-4">
                <button
                    onClick={() => {
                        const cartItems = Object.entries(cart).map(([id, quantity]) => {
                            const med = medicines.find(m => m.id === parseInt(id));
                            return { ...med, quantity };
                        });
                        navigate('/upload-prescription', {
                            state: {
                                serviceType: 'Medicine Order',
                                isMedicineOrder: true,
                                cartItems,
                                total: cartTotal
                            }
                        });
                    }}
                    className="w-full bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex items-center gap-3 hover:bg-blue-100 transition-colors"
                >
                    <div className="flex size-12 items-center justify-center rounded-xl bg-secondary/10">
                        <Upload className="w-6 h-6 text-secondary" />
                    </div>
                    <div className="flex-1 text-left">
                        <h3 className="text-sm font-bold text-slate-900">
                            Upload Prescription
                        </h3>
                        <p className="text-xs font-medium text-slate-600">
                            Get medicines delivered with valid prescription
                        </p>
                    </div>
                </button>
            </div>

            {/* Main Content */}
            <main className="flex-1 px-5 py-2 space-y-3 pb-32">
                {filteredMedicines.map((medicine) => {
                    const quantity = cart[medicine.id] || 0;

                    return (
                        <div
                            key={medicine.id}
                            className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100/50"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex size-14 items-center justify-center rounded-xl bg-teal-50">
                                    <span className="text-2xl">💊</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 leading-tight">
                                                {medicine.name}
                                            </h3>
                                            <p className="text-sm font-medium text-slate-500 mt-0.5">
                                                {medicine.description}
                                            </p>
                                            {medicine.requiresPrescription && (
                                                <span className="inline-block mt-2 px-2 py-1 bg-orange-50 text-orange-600 text-[10px] font-bold uppercase rounded">
                                                    Rx Required
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-extrabold text-primary">
                                                ₹{medicine.price}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-3">
                                        <span className="flex items-center gap-1.5">
                                            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                                            <span className="text-xs font-semibold text-emerald-600">
                                                In Stock
                                            </span>
                                        </span>

                                        {quantity > 0 ? (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => removeFromCart(medicine.id)}
                                                    className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-8 text-center font-bold text-slate-900">
                                                    {quantity}
                                                </span>
                                                <button
                                                    onClick={() => addToCart(medicine.id)}
                                                    className="flex size-8 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => addToCart(medicine.id)}
                                                className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
                                            >
                                                Add
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </main>

            {/* Fixed Bottom Cart */}
            {cartCount > 0 && (
                <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-slate-100 px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-xs font-semibold text-slate-500">
                                {cartCount} {cartCount === 1 ? 'item' : 'items'}
                            </p>
                            <p className="text-xl font-extrabold text-slate-900">
                                ₹{cartTotal.toLocaleString()}
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                const cartItems = Object.entries(cart).map(([id, quantity]) => {
                                    const med = medicines.find(m => m.id === parseInt(id));
                                    return { ...med, quantity };
                                });

                                // Check if any items require prescription
                                const requiresPrescription = cartItems.some(item => item.requiresPrescription);

                                if (requiresPrescription) {
                                    // Redirect to prescription upload
                                    navigate('/upload-prescription', {
                                        state: {
                                            serviceType: 'Medicine Order',
                                            isMedicineOrder: true,
                                            cartItems,
                                            total: cartTotal
                                        }
                                    });
                                } else {
                                    // Direct checkout for non-prescription items
                                    navigate('/checkout', {
                                        state: {
                                            cartItems,
                                            total: cartTotal,
                                            serviceType: 'Medicine Order',
                                            isMedicineOrder: true
                                        }
                                    });
                                }
                            }}
                            className="bg-primary text-white px-8 py-3 rounded-xl text-base font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors"
                        >
                            {Object.entries(cart).some(([id]) => {
                                const med = medicines.find(m => m.id === parseInt(id));
                                return med?.requiresPrescription;
                            }) ? 'Upload Prescription' : 'Checkout'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
