import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Search, Edit2, Trash2, AlertTriangle, CheckCircle, RefreshCw, ArrowLeft, TrendingDown, TrendingUp, X, Save, ChevronDown, Truck, Bell, User, Clock, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const CATEGORIES = ['All', 'Medicines', 'Medical Equipment', 'PPE', 'IV Supplies Kit', 'Diagnostic Kit', 'Wound Care Kit', 'Other'];
const LOW_STOCK_THRESHOLD = 10;

const DELIVERY_EXECUTIVES = [
    { id: 'de-1', name: 'Ramesh Kumar', phone: '9876543230', area: 'Aundh', available: true },
    { id: 'de-2', name: 'Suresh Patel', phone: '9876543231', area: 'Pimple Nilakh', available: true },
    { id: 'de-3', name: 'Vikram Singh', phone: '9876543232', area: 'Pimple Saudagar', available: false },
    { id: 'de-4', name: 'Amit Verma', phone: '9876543233', area: 'Pimpri-Chinchwad', available: true },
];

// Pre-populated medicines
const DEFAULT_MEDICINES = [
    { id: 'med-1', name: 'Insulin Glargine 100U/ml', category: 'Medicines', quantity: 25, unit: 'vials', price_per_unit: 850, supplier: 'Sanofi India', expiry_date: '2027-06-15', location: 'Cold Storage A1', notes: 'Requires 2-8°C storage' },
    { id: 'med-2', name: 'Morphine Sulphate 10mg', category: 'Medicines', quantity: 15, unit: 'boxes', price_per_unit: 1200, supplier: 'Sun Pharma', expiry_date: '2027-03-20', location: 'Controlled Cabinet', notes: 'Schedule H1 drug, strict records' },
    { id: 'med-3', name: 'Chemotherapy Kit (5-FU)', category: 'Medicines', quantity: 5, unit: 'sets', price_per_unit: 4500, supplier: 'Cipla Ltd.', expiry_date: '2026-12-01', location: 'Oncology Cold Store', notes: 'Handle with PPE' },
    { id: 'med-4', name: 'Heparin Sodium 5000IU/ml', category: 'Medicines', quantity: 30, unit: 'vials', price_per_unit: 320, supplier: 'Gland Pharma', expiry_date: '2027-01-30', location: 'Cold Storage A2', notes: 'Anticoagulant - monitor dosage' },
    { id: 'med-5', name: 'Vancomycin 500mg IV', category: 'Medicines', quantity: 8, unit: 'vials', price_per_unit: 650, supplier: 'Aurobindo Pharma', expiry_date: '2026-11-15', location: 'ICU Cabinet', notes: 'IV antibiotic - renal monitoring' },
    { id: 'med-6', name: 'Amoxicillin 500mg Caps', category: 'Medicines', quantity: 200, unit: 'boxes', price_per_unit: 85, supplier: 'Cipla Ltd.', expiry_date: '2027-09-10', location: 'Shelf B3', notes: 'Common antibiotic' },
    { id: 'med-7', name: 'Metformin 500mg Tab', category: 'Medicines', quantity: 150, unit: 'boxes', price_per_unit: 45, supplier: 'USV Pvt Ltd', expiry_date: '2027-08-22', location: 'Shelf B2', notes: 'Diabetes management' },
    { id: 'med-8', name: 'Amlodipine 5mg Tab', category: 'Medicines', quantity: 180, unit: 'boxes', price_per_unit: 55, supplier: 'Dr. Reddys', expiry_date: '2027-07-18', location: 'Shelf B4', notes: 'Blood pressure control' },
    { id: 'med-9', name: 'Azithromycin 500mg Tab', category: 'Medicines', quantity: 120, unit: 'boxes', price_per_unit: 95, supplier: 'Alkem Labs', expiry_date: '2027-06-25', location: 'Shelf B1', notes: 'Antibiotic - 3 day course' },
    { id: 'med-10', name: 'Omeprazole 20mg Caps', category: 'Medicines', quantity: 250, unit: 'boxes', price_per_unit: 38, supplier: 'Torrent Pharma', expiry_date: '2027-10-05', location: 'Shelf B5', notes: 'Acid reflux / ulcer' },
    { id: 'med-11', name: 'Atorvastatin 10mg Tab', category: 'Medicines', quantity: 90, unit: 'boxes', price_per_unit: 65, supplier: 'Ranbaxy', expiry_date: '2027-04-12', location: 'Shelf B2', notes: 'Cholesterol management' },
    { id: 'med-12', name: 'Ceftriaxone 1g Inj', category: 'Medicines', quantity: 40, unit: 'vials', price_per_unit: 180, supplier: 'Lupin Ltd.', expiry_date: '2027-02-28', location: 'Injection Cabinet', notes: 'IM/IV antibiotic' },
    { id: 'med-13', name: 'Paracetamol 500mg Tab', category: 'Medicines', quantity: 500, unit: 'boxes', price_per_unit: 18, supplier: 'GSK India', expiry_date: '2028-01-15', location: 'Shelf A1', notes: 'OTC pain/fever relief' },
    { id: 'med-14', name: 'Cetirizine 10mg Tab', category: 'Medicines', quantity: 300, unit: 'boxes', price_per_unit: 22, supplier: 'Dr. Reddys', expiry_date: '2027-12-20', location: 'Shelf A2', notes: 'Antihistamine - allergy' },
    { id: 'med-15', name: 'ORS Sachets (WHO)', category: 'Medicines', quantity: 400, unit: 'packets', price_per_unit: 8, supplier: 'FDC Ltd.', expiry_date: '2028-03-10', location: 'Shelf A3', notes: 'Oral rehydration' },
    { id: 'med-16', name: 'Ibuprofen 400mg Tab', category: 'Medicines', quantity: 350, unit: 'boxes', price_per_unit: 25, supplier: 'Abbott India', expiry_date: '2027-11-02', location: 'Shelf A1', notes: 'NSAID pain relief' },
    { id: 'med-17', name: 'Vitamin D3 60K Caps', category: 'Medicines', quantity: 200, unit: 'boxes', price_per_unit: 120, supplier: 'Mankind Pharma', expiry_date: '2028-06-15', location: 'Shelf A4', notes: 'Weekly supplement' },
    { id: 'med-18', name: 'Betadine Ointment 15g', category: 'Medicines', quantity: 150, unit: 'tubes', price_per_unit: 42, supplier: 'Win Medicare', expiry_date: '2027-09-30', location: 'Shelf A5', notes: 'Antiseptic wound care' },
    { id: 'med-19', name: 'Dolo 650mg Tab', category: 'Medicines', quantity: 450, unit: 'boxes', price_per_unit: 28, supplier: 'Micro Labs', expiry_date: '2028-02-18', location: 'Shelf A1', notes: 'Fever & body pain' },
    { id: 'med-20', name: 'Cough Syrup (Benadryl)', category: 'Medicines', quantity: 100, unit: 'bottles', price_per_unit: 75, supplier: 'Johnson & Johnson', expiry_date: '2027-05-20', location: 'Shelf A6', notes: 'Cough suppressant' },
    // Other Categories
    { id: 'equip-1', name: 'Digital BP Monitor', category: 'Medical Equipment', quantity: 15, unit: 'pieces', price_per_unit: 1200, supplier: 'Omron', expiry_date: '', location: 'Equipment Locker', notes: 'Requires AA batteries' },
    { id: 'ppe-1', name: 'N95 Respirator Masks', category: 'PPE', quantity: 500, unit: 'boxes', price_per_unit: 250, supplier: '3M India', expiry_date: '2028-01-01', location: 'Supply Room B', notes: 'Box of 10' },
    { id: 'iv-1', name: 'Standard IV Kit', category: 'IV Supplies Kit', quantity: 150, unit: 'kits', price_per_unit: 450, supplier: 'MediSupplies', expiry_date: '2026-11-20', location: 'Prep Station 1', notes: 'Includes saline, cannula, tubing, tape' },
    { id: 'diag-1', name: 'Rapid Antigen Test Kit', category: 'Diagnostic Kit', quantity: 200, unit: 'kits', price_per_unit: 150, supplier: 'Roche', expiry_date: '2026-08-10', location: 'Cold Storage B1', notes: 'Box of 25 tests' },
    { id: 'wound-1', name: 'Comprehensive Wound Care Kit', category: 'Wound Care Kit', quantity: 80, unit: 'kits', price_per_unit: 350, supplier: 'Johnson & Johnson', expiry_date: '2027-12-01', location: 'Prep Station 2', notes: 'Includes gauze, antiseptics, bandages, tape' },
];

// Simulated patient orders
const DEFAULT_ORDERS = [
    { id: 'ord-1', patientName: 'Ankit Sharma', phone: '9812345670', medicines: [{ name: 'Paracetamol 500mg Tab', qty: 2 }, { name: 'ORS Sachets (WHO)', qty: 5 }], total: 226, address: 'B-12, Aundh, Pune', status: 'new', createdAt: '2026-03-04T10:15:00+05:30', deliveryExec: null },
    { id: 'ord-2', patientName: 'Priya Mehta', phone: '9823456781', medicines: [{ name: 'Amoxicillin 500mg Caps', qty: 1 }, { name: 'Cetirizine 10mg Tab', qty: 1 }], total: 107, address: 'A-45, Pimple Saudagar, Pune', status: 'new', createdAt: '2026-03-04T11:30:00+05:30', deliveryExec: null },
    { id: 'ord-3', patientName: 'Rajesh Gupta', phone: '9834567892', medicines: [{ name: 'Metformin 500mg Tab', qty: 2 }, { name: 'Amlodipine 5mg Tab', qty: 1 }], total: 145, address: '22, Pimple Nilakh, Pune', status: 'assigned', createdAt: '2026-03-04T09:00:00+05:30', deliveryExec: DELIVERY_EXECUTIVES[0] },
];

function StockBadge({ qty }) {
    if (qty === 0) return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">Out of Stock</span>;
    if (qty <= LOW_STOCK_THRESHOLD) return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">Low Stock</span>;
    return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">In Stock</span>;
}

const defaultForm = { name: '', category: 'Medicines', quantity: '', unit: 'boxes', price_per_unit: '', supplier: '', expiry_date: '', notes: '', location: '' };

export default function InventoryManagement() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [stockFilter, setStockFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState(defaultForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [adjustModal, setAdjustModal] = useState(null);
    const [adjustQty, setAdjustQty] = useState('');
    const [activeView, setActiveView] = useState('inventory'); // 'inventory' | 'orders'
    const [orders, setOrders] = useState([]);
    const [assignModal, setAssignModal] = useState(null);
    const [selectedExec, setSelectedExec] = useState('');

    const saveToLocal = (newItems) => { localStorage.setItem('inventory_items', JSON.stringify(newItems)); setItems(newItems); };
    const saveOrders = (o) => { localStorage.setItem('medicine_orders', JSON.stringify(o)); setOrders(o); };

    const loadInventory = useCallback(async () => {
        try {
            const { data, error: err } = await supabase.from('inventory').select('*').order('created_at', { ascending: false });
            if (!err && data && data.length > 0) { setItems(data); }
            else {
                const local = JSON.parse(localStorage.getItem('inventory_items') || 'null');
                if (local && !local.some(i => i.id === 'equip-1')) {
                    localStorage.setItem('inventory_items', JSON.stringify(DEFAULT_MEDICINES));
                    setItems(DEFAULT_MEDICINES);
                } else {
                    setItems(local && local.length > 0 ? local : DEFAULT_MEDICINES);
                    if (!local || local.length === 0) localStorage.setItem('inventory_items', JSON.stringify(DEFAULT_MEDICINES));
                }
            }
        } catch {
            const local = JSON.parse(localStorage.getItem('inventory_items') || 'null');
            if (local && !local.some(i => i.id === 'equip-1')) {
                localStorage.setItem('inventory_items', JSON.stringify(DEFAULT_MEDICINES));
                setItems(DEFAULT_MEDICINES);
            } else {
                setItems(local && local.length > 0 ? local : DEFAULT_MEDICINES);
                if (!local || local.length === 0) localStorage.setItem('inventory_items', JSON.stringify(DEFAULT_MEDICINES));
            }
        }
        const savedOrders = JSON.parse(localStorage.getItem('medicine_orders') || 'null');
        setOrders(savedOrders && savedOrders.length > 0 ? savedOrders : DEFAULT_ORDERS);
        if (!savedOrders || savedOrders.length === 0) localStorage.setItem('medicine_orders', JSON.stringify(DEFAULT_ORDERS));
        setLoading(false);
    }, []);

    useEffect(() => { loadInventory(); }, [loadInventory]);

    const handleSave = async () => {
        if (!form.name || !form.quantity) { setError('Name and quantity are required.'); return; }
        setSaving(true); setError('');
        const record = { ...form, quantity: parseInt(form.quantity, 10), price_per_unit: parseFloat(form.price_per_unit) || 0, updated_at: new Date().toISOString() };
        try {
            if (editItem) {
                try { await supabase.from('inventory').update(record).eq('id', editItem.id); } catch { }
                saveToLocal(items.map(i => i.id === editItem.id ? { ...i, ...record } : i));
            } else {
                const newRec = { ...record, id: `inv_${Date.now()}`, created_at: new Date().toISOString() };
                try { await supabase.from('inventory').insert([record]); } catch { }
                saveToLocal([newRec, ...items]);
            }
        } catch {
            const rec2 = { ...record, id: editItem?.id || `inv_${Date.now()}`, created_at: editItem?.created_at || new Date().toISOString() };
            saveToLocal(editItem ? items.map(i => i.id === editItem.id ? rec2 : i) : [rec2, ...items]);
        }
        setShowModal(false); setEditItem(null); setForm(defaultForm); setSaving(false);
    };

    const handleDelete = async (id) => {
        try { await supabase.from('inventory').delete().eq('id', id); } catch { }
        saveToLocal(items.filter(i => i.id !== id)); setDeleteConfirm(null);
    };

    const handleAdjust = async () => {
        if (!adjustModal || !adjustQty) return;
        const qty = parseInt(adjustQty, 10); if (isNaN(qty) || qty <= 0) return;
        const newQty = adjustModal.mode === 'add' ? adjustModal.item.quantity + qty : Math.max(0, adjustModal.item.quantity - qty);
        try { await supabase.from('inventory').update({ quantity: newQty }).eq('id', adjustModal.item.id); } catch { }
        saveToLocal(items.map(i => i.id === adjustModal.item.id ? { ...i, quantity: newQty } : i));
        setAdjustModal(null); setAdjustQty('');
    };

    const openEdit = (item) => { setEditItem(item); setForm({ ...defaultForm, ...item, quantity: String(item.quantity), price_per_unit: String(item.price_per_unit || '') }); setShowModal(true); setError(''); };

    const handleAssignExec = () => {
        if (!assignModal || !selectedExec) return;
        const exec = DELIVERY_EXECUTIVES.find(e => e.id === selectedExec);
        const updated = orders.map(o => o.id === assignModal.id ? { ...o, status: 'assigned', deliveryExec: exec } : o);
        saveOrders(updated); setAssignModal(null); setSelectedExec('');
    };

    const handleMarkDelivered = (orderId) => {
        saveOrders(orders.map(o => o.id === orderId ? { ...o, status: 'delivered' } : o));
    };

    const filtered = items.filter(item => {
        const s = !search || item.name?.toLowerCase().includes(search.toLowerCase()) || item.supplier?.toLowerCase().includes(search.toLowerCase());
        const c = categoryFilter === 'All' || item.category === categoryFilter;
        const st = stockFilter === 'all' || (stockFilter === 'out' && item.quantity === 0) || (stockFilter === 'low' && item.quantity > 0 && item.quantity <= LOW_STOCK_THRESHOLD) || (stockFilter === 'ok' && item.quantity > LOW_STOCK_THRESHOLD);
        return s && c && st;
    });

    const totalItems = items.length;
    const totalValue = items.reduce((s, i) => s + (i.quantity * (i.price_per_unit || 0)), 0);
    const lowCount = items.filter(i => i.quantity > 0 && i.quantity <= LOW_STOCK_THRESHOLD).length;
    const outCount = items.filter(i => i.quantity === 0).length;
    const medicinesCount = items.filter(i => i.category === 'Medicines').length;
    const newOrdersCount = orders.filter(o => o.status === 'new').length;

    return (
        <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* Header */}
            <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/admin/dashboard')} className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <div className="h-5 w-px bg-slate-200" />
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl flex items-center justify-center"><Package className="w-5 h-5 text-white" /></div>
                            <div><p className="font-extrabold text-slate-900 leading-none">Inventory & Orders</p><p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Medicine Stock & Delivery</p></div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* View toggle */}
                        <div className="flex bg-slate-100 rounded-xl p-1">
                            <button onClick={() => setActiveView('inventory')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'inventory' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
                                📦 Inventory
                            </button>
                            <button onClick={() => setActiveView('orders')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all relative ${activeView === 'orders' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
                                🛒 Orders
                                {newOrdersCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">{newOrdersCount}</span>}
                            </button>
                        </div>
                        {activeView === 'inventory' && (
                            <button onClick={() => { setEditItem(null); setForm(defaultForm); setError(''); setShowModal(true); }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-200 hover:-translate-y-0.5 transition-all">
                                <Plus className="w-4 h-4" /> Add Medicine
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-slate-500 font-medium">Loading inventory…</p>
                    </div>
                ) : activeView === 'inventory' ? (
                    <>
                        {/* ── Clickable Stat Boxes ── */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                            {[
                                { label: 'All Items', val: totalItems, bg: 'bg-white', ring: 'ring-indigo-200', icon: '📦', filter: 'All' },
                                { label: 'Medicines', val: medicinesCount, bg: 'bg-emerald-50', ring: 'ring-emerald-200', icon: '💊', filter: 'Medicines' },
                                { label: 'Low Stock', val: lowCount, bg: lowCount > 0 ? 'bg-orange-50' : 'bg-white', ring: 'ring-orange-200', icon: '⚠️', filter: '_low' },
                                { label: 'Out of Stock', val: outCount, bg: outCount > 0 ? 'bg-red-50' : 'bg-white', ring: 'ring-red-200', icon: '❌', filter: '_out' },
                                { label: 'Total Value', val: `₹${(totalValue / 1000).toFixed(1)}K`, bg: 'bg-violet-50', ring: 'ring-violet-200', icon: '💰', filter: null },
                            ].map(s => (
                                <button key={s.label} onClick={() => {
                                    if (s.filter === '_low') { setStockFilter('low'); setCategoryFilter('All'); }
                                    else if (s.filter === '_out') { setStockFilter('out'); setCategoryFilter('All'); }
                                    else if (s.filter) { setCategoryFilter(s.filter); setStockFilter('all'); }
                                }}
                                    className={`${s.bg} rounded-2xl p-4 border border-slate-100 text-left hover:shadow-md transition-all ${categoryFilter === s.filter ? `ring-2 ${s.ring}` : ''} ${s.filter ? 'cursor-pointer' : 'cursor-default'}`}>
                                    <span className="text-xl">{s.icon}</span>
                                    <p className="text-2xl font-extrabold text-slate-900 mt-2">{s.val}</p>
                                    <p className="text-xs font-semibold text-slate-500 mt-0.5">{s.label}</p>
                                </button>
                            ))}
                        </div>

                        {/* Low stock alert */}
                        {(lowCount > 0 || outCount > 0) && (
                            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                                <p className="font-bold text-amber-800 text-sm flex-1">
                                    {outCount > 0 && `${outCount} item(s) out of stock`}{outCount > 0 && lowCount > 0 && ' · '}{lowCount > 0 && `${lowCount} item(s) low on stock`}
                                </p>
                            </div>
                        )}

                        {/* Search + Filters */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
                            <div className="flex-1 min-w-52 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search medicines, suppliers..."
                                    className="w-full h-10 pl-10 pr-4 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-400 bg-slate-50" />
                                {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-slate-400" /></button>}
                            </div>
                            <div className="relative">
                                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                                    className="h-10 pl-3 pr-8 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-400 bg-slate-50 appearance-none cursor-pointer">
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                                {[{ id: 'all', label: 'All' }, { id: 'ok', label: 'In Stock' }, { id: 'low', label: 'Low' }, { id: 'out', label: 'Out' }].map(f => (
                                    <button key={f.id} onClick={() => setStockFilter(f.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${stockFilter === f.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{f.label}</button>
                                ))}
                            </div>
                            <button onClick={loadInventory} className="flex items-center gap-1.5 h-10 px-3 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"><RefreshCw className="w-3.5 h-3.5" /> Refresh</button>
                            <p className="text-xs text-slate-400 font-medium ml-auto">{filtered.length} of {totalItems} items</p>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            {filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-3">
                                    <Package className="w-12 h-12 text-slate-200" />
                                    <p className="text-slate-400 font-semibold">No items found</p>
                                    <button onClick={() => { setCategoryFilter('All'); setStockFilter('all'); setSearch(''); }} className="mt-2 px-5 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl">Reset Filters</button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead><tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-widest">Medicine</th>
                                            <th className="text-center px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-widest">Stock</th>
                                            <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                            <th className="text-right px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-widest">Price</th>
                                            <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-widest">Supplier</th>
                                            <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-widest">Expiry</th>
                                            <th className="text-right px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                                        </tr></thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {filtered.map(item => (
                                                <tr key={item.id} className={`hover:bg-slate-50/50 transition-colors ${item.quantity === 0 ? 'bg-red-50/30' : item.quantity <= LOW_STOCK_THRESHOLD ? 'bg-amber-50/30' : ''}`}>
                                                    <td className="px-5 py-4">
                                                        <p className="font-bold text-slate-900">{item.name}</p>
                                                        {item.location && <p className="text-xs text-slate-400 font-medium mt-0.5">📍 {item.location}</p>}
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button onClick={() => { setAdjustModal({ item, mode: 'use' }); setAdjustQty(''); }} className="w-6 h-6 bg-red-100 text-red-600 rounded-lg flex items-center justify-center font-bold text-sm hover:bg-red-200 transition-colors">−</button>
                                                            <span className="font-extrabold text-slate-900 min-w-[2.5rem] text-center">{item.quantity}</span>
                                                            <button onClick={() => { setAdjustModal({ item, mode: 'add' }); setAdjustQty(''); }} className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center font-bold text-sm hover:bg-emerald-200 transition-colors">+</button>
                                                        </div>
                                                        <p className="text-xs text-slate-400 font-medium text-center mt-0.5">{item.unit || 'pcs'}</p>
                                                    </td>
                                                    <td className="px-4 py-4"><StockBadge qty={item.quantity} /></td>
                                                    <td className="px-4 py-4 text-right">
                                                        <p className="font-bold text-slate-900">₹{((item.quantity * (item.price_per_unit || 0))).toLocaleString()}</p>
                                                        <p className="text-xs text-slate-400 font-medium">₹{item.price_per_unit || 0}/{item.unit || 'unit'}</p>
                                                    </td>
                                                    <td className="px-4 py-4 text-slate-600 font-medium">{item.supplier || '—'}</td>
                                                    <td className="px-4 py-4">
                                                        {item.expiry_date ? (
                                                            <span className={`text-xs font-bold ${new Date(item.expiry_date) < new Date() ? 'text-red-600' : new Date(item.expiry_date) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) ? 'text-amber-600' : 'text-slate-500'}`}>
                                                                {new Date(item.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </span>
                                                        ) : '—'}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                                            <button onClick={() => setDeleteConfirm(item)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* ── ORDERS VIEW ── */
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            {[
                                { label: 'New Orders', val: orders.filter(o => o.status === 'new').length, icon: '🔔', bg: 'bg-red-50 border-red-100', text: 'text-red-700' },
                                { label: 'Assigned', val: orders.filter(o => o.status === 'assigned').length, icon: '🚚', bg: 'bg-blue-50 border-blue-100', text: 'text-blue-700' },
                                { label: 'Delivered', val: orders.filter(o => o.status === 'delivered').length, icon: '✅', bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-700' },
                            ].map(s => (
                                <div key={s.label} className={`${s.bg} rounded-2xl p-5 border`}>
                                    <div className="flex items-center justify-between">
                                        <div><p className={`text-3xl font-extrabold ${s.text}`}>{s.val}</p><p className="text-sm font-bold text-slate-600 mt-1">{s.label}</p></div>
                                        <span className="text-3xl">{s.icon}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Cards */}
                        <div className="space-y-4">
                            {orders.length === 0 && <div className="text-center py-20"><p className="text-slate-400 font-semibold">No orders yet</p></div>}
                            {orders.map(order => (
                                <div key={order.id} className={`bg-white rounded-2xl border shadow-sm p-6 ${order.status === 'new' ? 'border-red-200 ring-2 ring-red-100' : 'border-slate-100'}`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {order.status === 'new' && <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />}
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-slate-900 text-base">{order.patientName}</h3>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${order.status === 'new' ? 'bg-red-100 text-red-700 border-red-200' : order.status === 'assigned' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                                                        {order.status === 'new' ? '🔔 NEW ORDER' : order.status === 'assigned' ? '🚚 ASSIGNED' : '✅ DELIVERED'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-2"><Clock className="w-3 h-3" /> {new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                        <p className="text-lg font-extrabold text-slate-900">₹{order.total}</p>
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-3 mb-3">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Medicines Ordered</p>
                                        <div className="space-y-1">
                                            {order.medicines.map((m, i) => (
                                                <div key={i} className="flex justify-between text-sm"><span className="text-slate-700 font-medium">{m.name}</span><span className="text-slate-500 font-bold">×{m.qty}</span></div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                                        <MapPin className="w-3 h-3" /><span className="font-medium">{order.address}</span>
                                        <span className="mx-1">·</span><User className="w-3 h-3" /><span>{order.phone}</span>
                                    </div>

                                    {/* Delivery Executive Info */}
                                    {order.deliveryExec && (
                                        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl mb-3">
                                            <Truck className="w-5 h-5 text-blue-600" />
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-blue-800">{order.deliveryExec.name}</p>
                                                <p className="text-xs text-blue-500">{order.deliveryExec.phone} · {order.deliveryExec.area}</p>
                                            </div>
                                            {order.status === 'assigned' && (
                                                <button onClick={() => handleMarkDelivered(order.id)} className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors">✅ Mark Delivered</button>
                                            )}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    {order.status === 'new' && (
                                        <button onClick={() => { setAssignModal(order); setSelectedExec(''); }}
                                            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-200 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                                            <Truck className="w-4 h-4" /> Assign Delivery Executive
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>

            {/* ── Add/Edit Modal ── */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
                            <div><h2 className="text-xl font-extrabold text-slate-900">{editItem ? 'Edit Medicine' : 'Add New Medicine'}</h2></div>
                            <button onClick={() => { setShowModal(false); setEditItem(null); }} className="p-2 rounded-xl hover:bg-slate-100"><X className="w-5 h-5 text-slate-500" /></button>
                        </div>
                        <div className="p-8 space-y-4">
                            {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-xl">⚠️ {error}</div>}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Medicine Name *</label>
                                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Paracetamol 500mg Tab" className="w-full h-11 px-4 border-2 border-slate-200 focus:border-indigo-500 rounded-xl outline-none text-sm font-semibold bg-slate-50 placeholder:font-normal placeholder:text-slate-400" /></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Category</label>
                                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full h-11 px-4 border-2 border-slate-200 focus:border-indigo-500 rounded-xl outline-none text-sm font-semibold bg-slate-50">
                                        {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Location</label>
                                    <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Shelf A-3" className="w-full h-11 px-4 border-2 border-slate-200 focus:border-indigo-500 rounded-xl outline-none text-sm font-semibold bg-slate-50 placeholder:font-normal placeholder:text-slate-400" /></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Quantity *</label>
                                    <input type="number" min="0" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="0" className="w-full h-11 px-4 border-2 border-slate-200 focus:border-indigo-500 rounded-xl outline-none text-sm font-semibold bg-slate-50 placeholder:font-normal placeholder:text-slate-400" /></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Unit</label>
                                    <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="w-full h-11 px-4 border-2 border-slate-200 focus:border-indigo-500 rounded-xl outline-none text-sm font-semibold bg-slate-50">
                                        {['boxes', 'vials', 'bottles', 'packets', 'tubes', 'pieces', 'sets'].map(u => <option key={u}>{u}</option>)}</select></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Price/Unit (₹)</label>
                                    <input type="number" min="0" step="0.01" value={form.price_per_unit} onChange={e => setForm(f => ({ ...f, price_per_unit: e.target.value }))} placeholder="0.00" className="w-full h-11 px-4 border-2 border-slate-200 focus:border-indigo-500 rounded-xl outline-none text-sm font-semibold bg-slate-50 placeholder:font-normal placeholder:text-slate-400" /></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Supplier</label>
                                    <input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} placeholder="Cipla Ltd." className="w-full h-11 px-4 border-2 border-slate-200 focus:border-indigo-500 rounded-xl outline-none text-sm font-semibold bg-slate-50 placeholder:font-normal placeholder:text-slate-400" /></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Expiry Date</label>
                                    <input type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} className="w-full h-11 px-4 border-2 border-slate-200 focus:border-indigo-500 rounded-xl outline-none text-sm font-semibold bg-slate-50" /></div>
                                <div className="col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Notes</label>
                                    <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Storage requirements, dosage info..." className="w-full px-4 py-3 border-2 border-slate-200 focus:border-indigo-500 rounded-xl outline-none text-sm font-medium bg-slate-50 placeholder:font-normal placeholder:text-slate-400 resize-none" /></div>
                            </div>
                        </div>
                        <div className="flex gap-3 px-8 pb-8">
                            <button onClick={() => { setShowModal(false); setEditItem(null); }} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-70 flex items-center justify-center gap-2">
                                {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" />{editItem ? 'Update' : 'Add Medicine'}</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Stock Adjust Modal ── */}
            {adjustModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
                        <div className="text-center mb-6">
                            <div className={`w-14 h-14 ${adjustModal.mode === 'add' ? 'bg-emerald-100' : 'bg-red-100'} rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3`}>{adjustModal.mode === 'add' ? '➕' : '➖'}</div>
                            <h2 className="text-xl font-extrabold text-slate-900">{adjustModal.mode === 'add' ? 'Add Stock' : 'Use / Remove Stock'}</h2>
                            <p className="text-slate-500 font-medium text-sm mt-1">{adjustModal.item.name}</p>
                            <p className="text-slate-400 text-xs font-medium mt-0.5">Current: <span className="font-bold text-slate-700">{adjustModal.item.quantity} {adjustModal.item.unit || 'pcs'}</span></p>
                        </div>
                        <div className="space-y-4">
                            <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Quantity</label>
                                <input type="number" min="1" value={adjustQty} onChange={e => setAdjustQty(e.target.value)} placeholder="Enter quantity" autoFocus
                                    className={`w-full h-12 px-4 border-2 rounded-2xl outline-none text-base font-semibold bg-slate-50 placeholder:text-slate-400 ${adjustModal.mode === 'add' ? 'focus:border-emerald-500' : 'focus:border-red-400'}`} /></div>
                            <div className="flex gap-3">
                                <button onClick={() => setAdjustModal(null)} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Cancel</button>
                                <button onClick={handleAdjust} className={`flex-1 py-3 text-white font-bold rounded-xl ${adjustModal.mode === 'add' ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}>
                                    Confirm {adjustModal.mode === 'add' ? 'Add' : 'Deduct'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirm ── */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
                        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">🗑️</div>
                        <h2 className="text-xl font-extrabold text-slate-900 mb-2">Delete Item?</h2>
                        <p className="text-slate-500 font-medium text-sm mb-6">Remove <span className="font-bold text-slate-700">"{deleteConfirm.name}"</span>?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl">Cancel</button>
                            <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-100">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Assign Delivery Executive Modal ── */}
            {assignModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
                        <div className="text-center mb-6">
                            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">🚚</div>
                            <h2 className="text-xl font-extrabold text-slate-900">Assign Delivery Executive</h2>
                            <p className="text-slate-500 text-sm font-medium mt-1">Order for <span className="font-bold text-slate-700">{assignModal.patientName}</span></p>
                            <p className="text-slate-400 text-xs mt-0.5">₹{assignModal.total} · {assignModal.medicines.length} medicine(s)</p>
                        </div>
                        <div className="space-y-2 mb-6">
                            {DELIVERY_EXECUTIVES.map(exec => (
                                <button key={exec.id} onClick={() => exec.available && setSelectedExec(exec.id)} disabled={!exec.available}
                                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${selectedExec === exec.id ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' : exec.available ? 'border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50' : 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'}`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${exec.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400'}`}>
                                        {exec.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-900 text-sm">{exec.name}</p>
                                        <p className="text-xs text-slate-500">{exec.phone} · {exec.area}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${exec.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                        {exec.available ? '● Available' : '○ Busy'}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setAssignModal(null)} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl">Cancel</button>
                            <button onClick={handleAssignExec} disabled={!selectedExec}
                                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2">
                                <Truck className="w-4 h-4" /> Assign & Dispatch
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
