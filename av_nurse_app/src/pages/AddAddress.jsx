import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, User, Phone } from 'lucide-react';

const AddAddress = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const editAddress = location.state?.address;

    const [formData, setFormData] = useState({
        name: editAddress?.name || '',
        phone: editAddress?.phone || '',
        fullAddress: editAddress?.fullAddress || '',
        landmark: editAddress?.landmark || '',
        type: editAddress?.type || 'home',
        isDefault: editAddress?.isDefault || false
    });

    const addressTypes = [
        { value: 'home', label: 'Home', icon: '🏠' },
        { value: 'work', label: 'Work', icon: '💼' },
        { value: 'other', label: 'Other', icon: '📍' }
    ];

    const handleSave = () => {
        // Validation
        if (!formData.name || !formData.phone || !formData.fullAddress) {
            alert('Please fill all required fields');
            return;
        }

        const addresses = JSON.parse(localStorage.getItem('userAddresses') || '[]');

        if (editAddress) {
            // Update existing address
            const updated = addresses.map(addr =>
                addr.id === editAddress.id ? { ...formData, id: editAddress.id } : addr
            );
            localStorage.setItem('userAddresses', JSON.stringify(updated));
        } else {
            // Add new address
            const newAddress = {
                id: `addr-${Date.now()}`,
                ...formData,
                createdAt: new Date().toISOString()
            };

            // If this is the first address or marked as default, set it as default
            if (addresses.length === 0 || formData.isDefault) {
                addresses.forEach(addr => addr.isDefault = false);
                newAddress.isDefault = true;
            }

            addresses.push(newAddress);
            localStorage.setItem('userAddresses', JSON.stringify(addresses));
        }

        alert(editAddress ? 'Address updated successfully!' : 'Address added successfully!');
        navigate('/manage-addresses');
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 pt-12 pb-4 px-5">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/manage-addresses')}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">
                        {editAddress ? 'Edit Address' : 'Add New Address'}
                    </h1>
                    <div className="w-10" />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-5 py-6 space-y-5 pb-32">
                {/* Address Type */}
                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 ml-1">
                        Address Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {addressTypes.map(type => (
                            <button
                                key={type.value}
                                onClick={() => setFormData({ ...formData, type: type.value })}
                                className={`h-20 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${formData.type === type.value
                                        ? 'border-primary bg-primary/5'
                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                    }`}
                            >
                                <span className="text-2xl">{type.icon}</span>
                                <span className={`text-sm font-bold ${formData.type === type.value ? 'text-primary' : 'text-slate-700'
                                    }`}>
                                    {type.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 ml-1">
                        Full Name *
                    </label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter your name"
                            className="w-full h-14 pl-12 pr-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 ml-1">
                        Phone Number *
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Enter phone number"
                            maxLength={10}
                            className="w-full h-14 pl-12 pr-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                </div>

                {/* Full Address */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 ml-1">
                        Complete Address *
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                        <textarea
                            value={formData.fullAddress}
                            onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                            placeholder="House No., Building Name, Street, Area"
                            className="w-full h-28 pl-12 pr-4 pt-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                        />
                    </div>
                </div>

                {/* Landmark */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 ml-1">
                        Landmark (Optional)
                    </label>
                    <input
                        type="text"
                        value={formData.landmark}
                        onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                        placeholder="e.g., Near City Mall"
                        className="w-full h-14 px-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>

                {/* Set as Default */}
                <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-100">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">Set as Default Address</h3>
                        <p className="text-xs text-slate-500 mt-1">Use this address for all bookings</p>
                    </div>
                    <button
                        onClick={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
                        className={`w-14 h-8 rounded-full transition-all ${formData.isDefault ? 'bg-primary' : 'bg-slate-200'
                            }`}
                    >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${formData.isDefault ? 'translate-x-7' : 'translate-x-1'
                            }`} />
                    </button>
                </div>
            </main>

            {/* Save Button */}
            <div className="sticky bottom-0 bg-white border-t border-slate-100 p-5">
                <button
                    onClick={handleSave}
                    className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-base shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
                >
                    {editAddress ? 'Update Address' : 'Save Address'}
                </button>
            </div>
        </div>
    );
};

export default AddAddress;
