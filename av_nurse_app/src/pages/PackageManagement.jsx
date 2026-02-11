import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

const PackageManagement = () => {
    const navigate = useNavigate();
    const [packages, setPackages] = useState(() => {
        // Load packages from localStorage
        const saved = JSON.parse(localStorage.getItem('ivPackages') || '[]');
        if (saved.length === 0) {
            // Initialize with default packages
            const defaultPackages = [
                {
                    id: 'pkg-1',
                    name: 'Basic IV Hydration',
                    description: 'Essential hydration therapy with vitamins',
                    price: 1499,
                    duration: '45 minutes',
                    includes: ['Normal Saline', 'Vitamin B Complex', 'Nurse Visit'],
                    enabled: true
                },
                {
                    id: 'pkg-2',
                    name: 'Energy Boost IV',
                    description: 'Combat fatigue with energy-boosting nutrients',
                    price: 2499,
                    duration: '60 minutes',
                    includes: ['Vitamin C', 'B12 Shot', 'Amino Acids', 'Nurse Visit'],
                    enabled: true
                },
                {
                    id: 'pkg-3',
                    name: 'Immunity Booster',
                    description: 'Strengthen immune system with high-dose vitamins',
                    price: 2999,
                    duration: '60 minutes',
                    includes: ['Vitamin C 1000mg', 'Zinc', 'Glutathione', 'Nurse Visit'],
                    enabled: true
                }
            ];
            localStorage.setItem('ivPackages', JSON.stringify(defaultPackages));
            return defaultPackages;
        } else {
            return saved;
        }
    });

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        duration: '',
        includes: '',
        enabled: true
    });

    const handleSave = () => {
        if (!formData.name || !formData.price || !formData.duration) {
            alert('Please fill all required fields');
            return;
        }

        const includesArray = formData.includes.split(',').map(item => item.trim()).filter(item => item);

        if (editingPackage) {
            // Update existing package
            const updated = packages.map(pkg =>
                pkg.id === editingPackage.id
                    ? { ...pkg, ...formData, price: parseFloat(formData.price), includes: includesArray }
                    : pkg
            );
            setPackages(updated);
            localStorage.setItem('ivPackages', JSON.stringify(updated));
        } else {
            // Add new package
            const newPackage = {
                id: `pkg-${Date.now()}`,
                ...formData,
                price: parseFloat(formData.price),
                includes: includesArray,
                createdAt: new Date().toISOString()
            };
            const updated = [...packages, newPackage];
            setPackages(updated);
            localStorage.setItem('ivPackages', JSON.stringify(updated));
        }

        setShowAddModal(false);
        setEditingPackage(null);
        setFormData({ name: '', description: '', price: '', duration: '', includes: '', enabled: true });
    };

    const handleEdit = (pkg) => {
        setEditingPackage(pkg);
        setFormData({
            name: pkg.name,
            description: pkg.description,
            price: pkg.price.toString(),
            duration: pkg.duration,
            includes: pkg.includes.join(', '),
            enabled: pkg.enabled
        });
        setShowAddModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this package?')) {
            const updated = packages.filter(pkg => pkg.id !== id);
            setPackages(updated);
            localStorage.setItem('ivPackages', JSON.stringify(updated));
        }
    };

    const handleToggle = (id) => {
        const updated = packages.map(pkg =>
            pkg.id === id ? { ...pkg, enabled: !pkg.enabled } : pkg
        );
        setPackages(updated);
        localStorage.setItem('ivPackages', JSON.stringify(updated));
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 pt-12 pb-4 px-5">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Package Management</h1>
                    <button
                        onClick={() => {
                            setEditingPackage(null);
                            setFormData({ name: '', description: '', price: '', duration: '', includes: '', enabled: true });
                            setShowAddModal(true);
                        }}
                        className="flex size-10 items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-5 py-6 space-y-4">
                {packages.map(pkg => (
                    <div
                        key={pkg.id}
                        className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition-all ${pkg.enabled ? 'border-slate-100' : 'border-slate-200 opacity-60'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-bold text-slate-900">{pkg.name}</h3>
                                    {!pkg.enabled && (
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                                            Disabled
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-600 mb-2">{pkg.description}</p>
                                <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                                    <span>⏱️ {pkg.duration}</span>
                                    <span className="text-lg font-bold text-primary">₹{pkg.price}</span>
                                </div>
                            </div>
                        </div>

                        {/* Includes */}
                        <div className="mb-4">
                            <p className="text-xs font-bold text-slate-600 mb-2">Includes:</p>
                            <div className="flex flex-wrap gap-2">
                                {pkg.includes.map((item, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg">
                                        ✓ {item}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-3 border-t border-slate-100">
                            <button
                                onClick={() => handleToggle(pkg.id)}
                                className={`flex-1 h-10 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${pkg.enabled
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                    }`}
                            >
                                {pkg.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                {pkg.enabled ? 'Enabled' : 'Disabled'}
                            </button>
                            <button
                                onClick={() => handleEdit(pkg)}
                                className="h-10 px-4 rounded-xl border border-blue-100 bg-blue-50 text-blue-600 text-sm font-bold hover:bg-blue-100 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(pkg.id)}
                                className="h-10 px-4 rounded-xl border border-red-100 bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </main>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
                    <div className="bg-white rounded-t-3xl w-full max-w-[430px] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">
                            {editingPackage ? 'Edit Package' : 'Add New Package'}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-600 mb-2 block">Package Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Basic IV Hydration"
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-600 mb-2 block">Description *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the package"
                                    className="w-full h-20 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-600 mb-2 block">Price (₹) *</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="1499"
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-600 mb-2 block">Duration *</label>
                                    <input
                                        type="text"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        placeholder="45 minutes"
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-600 mb-2 block">Includes (comma separated)</label>
                                <textarea
                                    value={formData.includes}
                                    onChange={(e) => setFormData({ ...formData, includes: e.target.value })}
                                    placeholder="Normal Saline, Vitamin B Complex, Nurse Visit"
                                    className="w-full h-20 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setEditingPackage(null);
                                    setFormData({ name: '', description: '', price: '', duration: '', includes: '', enabled: true });
                                }}
                                className="flex-1 h-12 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 h-12 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
                            >
                                {editingPackage ? 'Update' : 'Add'} Package
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PackageManagement;
