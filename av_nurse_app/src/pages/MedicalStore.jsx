import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ShoppingCart, Plus, Minus, AlertCircle, FileText } from 'lucide-react';

// ─── FULL PRODUCT CATALOGUE ───────────────────────────────────────────────────
const CATALOGUE = [
    // Basic Medicines
    { id: 'bm-1', name: 'Paracetamol 500mg', category: 'Basic Medicines', emoji: '💊', price: 25, unit: 'Strip of 10', rx: false, description: 'Fever & mild pain relief' },
    { id: 'bm-2', name: 'Ibuprofen 400mg', category: 'Basic Medicines', emoji: '💊', price: 35, unit: 'Strip of 10', rx: false, description: 'Anti-inflammatory & pain relief' },
    { id: 'bm-3', name: 'Cetrizine 10mg', category: 'Basic Medicines', emoji: '💊', price: 22, unit: 'Strip of 10', rx: false, description: 'Allergy & cold relief' },
    { id: 'bm-4', name: 'Omeprazole 20mg', category: 'Basic Medicines', emoji: '💊', price: 45, unit: 'Strip of 10', rx: false, description: 'Acidity & heartburn' },
    { id: 'bm-5', name: 'ORS Sachets', category: 'Basic Medicines', emoji: '🧂', price: 15, unit: 'Pack of 5', rx: false, description: 'Oral rehydration salts' },
    { id: 'bm-6', name: 'Antacid Syrup', category: 'Basic Medicines', emoji: '🧴', price: 89, unit: '170ml bottle', rx: false, description: 'Instant acidity relief' },
    { id: 'bm-7', name: 'Cough Syrup', category: 'Basic Medicines', emoji: '🧴', price: 110, unit: '100ml bottle', rx: false, description: 'For dry & wet cough' },
    { id: 'bm-8', name: 'Nasal Drops', category: 'Basic Medicines', emoji: '💧', price: 65, unit: '10ml bottle', rx: false, description: 'Congestion relief' },

    // Complex / Prescription Medicines
    { id: 'cm-1', name: 'Azithromycin 500mg', category: 'Complex Medicines', emoji: '💊', price: 135, unit: 'Strip of 5', rx: true, description: 'Antibiotic for infections' },
    { id: 'cm-2', name: 'Metformin 500mg', category: 'Complex Medicines', emoji: '💊', price: 55, unit: 'Strip of 10', rx: true, description: 'Diabetes management' },
    { id: 'cm-3', name: 'Atorvastatin 20mg', category: 'Complex Medicines', emoji: '💊', price: 75, unit: 'Strip of 10', rx: true, description: 'Cholesterol control' },
    { id: 'cm-4', name: 'Amlodipine 5mg', category: 'Complex Medicines', emoji: '💊', price: 65, unit: 'Strip of 10', rx: true, description: 'Blood pressure control' },
    { id: 'cm-5', name: 'Pantoprazole 40mg', category: 'Complex Medicines', emoji: '💊', price: 85, unit: 'Strip of 10', rx: true, description: 'Gastric acid suppression' },
    { id: 'cm-6', name: 'Amoxicillin 500mg', category: 'Complex Medicines', emoji: '💊', price: 95, unit: 'Strip of 10', rx: true, description: 'Broad spectrum antibiotic' },
    { id: 'cm-7', name: 'Levothyroxine 50mcg', category: 'Complex Medicines', emoji: '💊', price: 45, unit: 'Strip of 10', rx: true, description: 'Thyroid hormone therapy' },
    { id: 'cm-8', name: 'Insulin Pen Cartridge', category: 'Complex Medicines', emoji: '💉', price: 850, unit: '1 cartridge (3ml)', rx: true, description: 'Rapid-acting insulin' },

    // Medical Equipment
    { id: 'eq-1', name: 'Digital Thermometer', category: 'Equipment', emoji: '🌡️', price: 299, unit: '1 piece', rx: false, description: 'Fast & accurate reading' },
    { id: 'eq-2', name: 'Blood Pressure Monitor', category: 'Equipment', emoji: '🩺', price: 1499, unit: '1 device', rx: false, description: 'Automatic upper arm BP' },
    { id: 'eq-3', name: 'Pulse Oximeter', category: 'Equipment', emoji: '🔬', price: 899, unit: '1 piece', rx: false, description: 'SpO2 & heart rate' },
    { id: 'eq-4', name: 'Glucometer Kit', category: 'Equipment', emoji: '🩸', price: 699, unit: 'Kit + 25 strips', rx: false, description: 'Blood sugar monitoring' },
    { id: 'eq-5', name: 'Nebulizer Machine', category: 'Equipment', emoji: '💨', price: 1899, unit: '1 device', rx: false, description: 'For asthma & respiratory' },
    { id: 'eq-6', name: 'Heating Pad', category: 'Equipment', emoji: '🔥', price: 499, unit: '1 piece', rx: false, description: 'Pain relief hot compress' },
    { id: 'eq-7', name: 'Stethoscope', category: 'Equipment', emoji: '🩺', price: 799, unit: '1 piece', rx: false, description: 'Dual head stethoscope' },
    { id: 'eq-8', name: 'Wheelchair (Foldable)', category: 'Equipment', emoji: '♿', price: 4999, unit: '1 piece', rx: false, description: 'Lightweight aluminium' },

    // Supplements
    { id: 'sp-1', name: 'Vitamin D3 2000 IU', category: 'Supplements', emoji: '🌞', price: 299, unit: '60 tablets', rx: false, description: 'Bone & immunity support' },
    { id: 'sp-2', name: 'Vitamin C 1000mg', category: 'Supplements', emoji: '🍊', price: 249, unit: '60 tablets', rx: false, description: 'Immunity & antioxidant' },
    { id: 'sp-3', name: 'Omega-3 Fish Oil', category: 'Supplements', emoji: '🐟', price: 599, unit: '60 capsules', rx: false, description: 'Heart & brain health' },
    { id: 'sp-4', name: 'Multivitamin Complete', category: 'Supplements', emoji: '💊', price: 499, unit: '30 tablets', rx: false, description: 'Daily nutrition booster' },
    { id: 'sp-5', name: 'Calcium + Magnesium', category: 'Supplements', emoji: '🦴', price: 399, unit: '60 tablets', rx: false, description: 'Bone strength formula' },
    { id: 'sp-6', name: 'Iron + Folic Acid', category: 'Supplements', emoji: '🌿', price: 189, unit: '30 tablets', rx: false, description: 'Anaemia prevention' },
    { id: 'sp-7', name: 'Protein Powder (Vanilla)', category: 'Supplements', emoji: '💪', price: 1299, unit: '500g', rx: false, description: 'Whey protein for recovery' },
    { id: 'sp-8', name: 'Probiotics Capsules', category: 'Supplements', emoji: '🦠', price: 449, unit: '30 capsules', rx: false, description: 'Gut health & digestion' },

    // First Aid
    { id: 'fa-1', name: 'Complete First Aid Kit', category: 'First Aid', emoji: '🏥', price: 599, unit: '1 kit', rx: false, description: '85+ items emergency kit' },
    { id: 'fa-2', name: 'Crepe Bandage 4"', category: 'First Aid', emoji: '🩹', price: 45, unit: 'Pack of 2', rx: false, description: 'Elastic support bandage' },
    { id: 'fa-3', name: 'Antiseptic Liquid', category: 'First Aid', emoji: '🧴', price: 149, unit: '500ml', rx: false, description: 'Dettol / Savlon wound care' },
    { id: 'fa-4', name: 'Band-Aid Strips', category: 'First Aid', emoji: '🩹', price: 79, unit: 'Box of 40', rx: false, description: 'Waterproof adhesive strips' },
    { id: 'fa-5', name: 'Sterile Gauze Pads', category: 'First Aid', emoji: '🏴‍☠️', price: 55, unit: 'Pack of 10', rx: false, description: '10x10 cm sterile pads' },
    { id: 'fa-6', name: 'Burn Relief Gel', category: 'First Aid', emoji: '❄️', price: 199, unit: '100g tube', rx: false, description: 'Instant cooling for burns' },
    { id: 'fa-7', name: 'Disposable Gloves', category: 'First Aid', emoji: '🧤', price: 129, unit: 'Box of 50', rx: false, description: 'Nitrile exam gloves' },
    { id: 'fa-8', name: 'Surgical Face Masks', category: 'First Aid', emoji: '😷', price: 99, unit: 'Box of 25', rx: false, description: '3-ply protection' },
];

const CATEGORIES = ['All', 'Basic Medicines', 'Complex Medicines', 'Equipment', 'Supplements', 'First Aid'];

const CATEGORY_ICONS = {
    'All': '🏪',
    'Basic Medicines': '💊',
    'Complex Medicines': '💉',
    'Equipment': '🩺',
    'Supplements': '🌿',
    'First Aid': '🏥',
};
// ─────────────────────────────────────────────────────────────────────────────

export default function MedicalStore() {
    const navigate = useNavigate();
    const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('shoppingCart') || '[]'));
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');

    const filteredProducts = CATALOGUE.filter(p => {
        const matchCat = category === 'All' || p.category === category;
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    const getQty = (id) => (cart.find(i => i.id === id)?.quantity || 0);
    const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
    const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const cartHasRx = cart.some(i => i.rx);

    const addToCart = (product) => {
        const existing = cart.find(i => i.id === product.id);
        const newCart = existing
            ? cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
            : [...cart, { ...product, quantity: 1 }];
        setCart(newCart);
        localStorage.setItem('shoppingCart', JSON.stringify(newCart));
    };

    const updateQty = (id, delta) => {
        const newCart = cart.map(i => {
            if (i.id !== id) return i;
            const q = i.quantity + delta;
            return q > 0 ? { ...i, quantity: q } : null;
        }).filter(Boolean);
        setCart(newCart);
        localStorage.setItem('shoppingCart', JSON.stringify(newCart));
    };

    const handleCheckout = () => {
        if (cartHasRx) {
            // Has prescription-required items — go to prescription upload first
            navigate('/upload-prescription', {
                state: {
                    fromStore: true,
                    cartItems: cart,
                    total: cartTotal,
                }
            });
        } else {
            // No prescription needed — go directly to checkout
            navigate('/checkout', {
                state: {
                    serviceType: 'Medicine Order',
                    price: cartTotal,
                    planType: 'medicine-order',
                    cartItems: cart,
                    isMedicineOrder: true,
                }
            });
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-slate-50 max-w-[430px] mx-auto pb-36">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 pt-12 pb-4 px-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigate('/home')}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 text-center">🏪 Medical Store</h1>
                        <p className="text-xs text-slate-400 text-center">Delivered to your home</p>
                    </div>
                    <button
                        onClick={() => navigate('/cart')}
                        className="flex size-10 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all relative"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search medicines, equipment..."
                        className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>

                {/* Category pills */}
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${category === cat
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            <span>{CATEGORY_ICONS[cat]}</span> {cat}
                        </button>
                    ))}
                </div>
            </header>

            {/* Rx Banner */}
            {(category === 'Complex Medicines' || cartHasRx) && (
                <div className="mx-5 mt-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-amber-800">
                        💉 <strong>Prescription required</strong> for Complex Medicines. You'll be asked to upload it before checkout.
                    </p>
                </div>
            )}

            {/* Products */}
            <main className="flex-1 px-5 py-4">
                {filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                        <Search className="w-10 h-10 mb-2 opacity-40" />
                        <p className="text-sm font-semibold">No products found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {filteredProducts.map(product => {
                            const qty = getQty(product.id);
                            return (
                                <div key={product.id} className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 flex flex-col">
                                    {/* Rx badge */}
                                    {product.rx && (
                                        <div className="flex justify-end mb-1">
                                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold rounded-md">
                                                <FileText className="w-2.5 h-2.5" /> Rx
                                            </span>
                                        </div>
                                    )}
                                    <div className="text-4xl mb-2 text-center">{product.emoji}</div>
                                    <h3 className="text-xs font-bold text-slate-900 mb-0.5 line-clamp-2 min-h-[2.5rem] leading-tight">
                                        {product.name}
                                    </h3>
                                    <p className="text-[10px] text-slate-400 mb-1 line-clamp-1">{product.unit}</p>
                                    <p className="text-[10px] text-slate-500 mb-2 line-clamp-1">{product.description}</p>
                                    <p className="text-base font-extrabold text-blue-600 mb-3">₹{product.price}</p>

                                    {qty === 0 ? (
                                        <button
                                            onClick={() => addToCart(product)}
                                            className="mt-auto w-full h-9 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-1"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> Add
                                        </button>
                                    ) : (
                                        <div className="mt-auto flex items-center justify-between h-9 bg-blue-50 border border-blue-200 rounded-xl px-2">
                                            <button
                                                onClick={() => updateQty(product.id, -1)}
                                                className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm active:scale-95 transition-all"
                                            >
                                                <Minus className="w-3.5 h-3.5" />
                                            </button>
                                            <span className="font-extrabold text-blue-700 text-sm">{qty}</span>
                                            <button
                                                onClick={() => updateQty(product.id, 1)}
                                                className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm active:scale-95 transition-all"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Sticky Cart Footer */}
            {cartCount > 0 && (
                <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-slate-100 px-5 py-4 shadow-xl z-50">
                    {cartHasRx && (
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3">
                            <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                            <p className="text-xs font-bold text-amber-800">
                                Prescription required — you'll upload it next
                            </p>
                        </div>
                    )}
                    <button
                        onClick={handleCheckout}
                        className="w-full h-14 bg-blue-600 text-white rounded-2xl font-bold text-base shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-between px-6"
                    >
                        <span className="text-sm">🛒 {cartCount} item{cartCount > 1 ? 's' : ''}</span>
                        <span>
                            {cartHasRx ? 'Upload Prescription →' : 'Proceed to Checkout →'}
                        </span>
                        <span className="font-extrabold">₹{cartTotal.toLocaleString()}</span>
                    </button>
                </div>
            )}
        </div>
    );
}
