import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MapPin, Home, Briefcase, Edit2, Trash2, Check } from 'lucide-react';

const ManageAddresses = () => {
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState(() => {
        // Load addresses from localStorage
        return JSON.parse(localStorage.getItem('userAddresses') || '[]');
    });

    const handleSetDefault = (id) => {
        const updated = addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === id
        }));
        setAddresses(updated);
        localStorage.setItem('userAddresses', JSON.stringify(updated));
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            const updated = addresses.filter(addr => addr.id !== id);
            setAddresses(updated);
            localStorage.setItem('userAddresses', JSON.stringify(updated));
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'home': return <Home className="w-5 h-5" />;
            case 'work': return <Briefcase className="w-5 h-5" />;
            default: return <MapPin className="w-5 h-5" />;
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 pt-12 pb-4 px-5">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/profile')}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Saved Addresses</h1>
                    <div className="w-10" />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-5 py-6 space-y-4 pb-32">
                {addresses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <MapPin className="w-16 h-16 text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 mb-2">No Saved Addresses</h3>
                        <p className="text-sm text-slate-500 text-center mb-6">
                            Add your addresses for faster checkout
                        </p>
                        <button
                            onClick={() => navigate('/add-address')}
                            className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 active:scale-95 transition-all"
                        >
                            Add Address
                        </button>
                    </div>
                ) : (
                    addresses.map(address => (
                        <div
                            key={address.id}
                            className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition-all ${address.isDefault ? 'border-primary' : 'border-slate-100'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${address.isDefault ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    {getIcon(address.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-base font-bold text-slate-900 capitalize">
                                            {address.type}
                                        </h3>
                                        {address.isDefault && (
                                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm font-medium text-slate-700 mb-1">
                                        {address.name}
                                    </p>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        {address.fullAddress}
                                    </p>
                                    {address.landmark && (
                                        <p className="text-xs text-slate-400 mt-1">
                                            Near: {address.landmark}
                                        </p>
                                    )}
                                    <p className="text-xs font-medium text-slate-600 mt-2">
                                        {address.phone}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                                {!address.isDefault && (
                                    <button
                                        onClick={() => handleSetDefault(address.id)}
                                        className="flex-1 h-10 rounded-xl border border-primary bg-primary/5 text-primary text-sm font-bold hover:bg-primary/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Check className="w-4 h-4" />
                                        Set Default
                                    </button>
                                )}
                                <button
                                    onClick={() => navigate('/add-address', { state: { address } })}
                                    className="h-10 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-bold hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(address.id)}
                                    className="h-10 px-4 rounded-xl border border-red-100 bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </main>

            {/* Add Address Button */}
            {addresses.length > 0 && (
                <div className="sticky bottom-0 bg-white border-t border-slate-100 p-5">
                    <button
                        onClick={() => navigate('/add-address')}
                        className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-base shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Address
                    </button>
                </div>
            )}
        </div>
    );
};

export default ManageAddresses;
