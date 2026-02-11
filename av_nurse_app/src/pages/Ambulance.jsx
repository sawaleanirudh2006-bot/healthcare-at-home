import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Clock } from 'lucide-react';

const Ambulance = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        patientName: '',
        phone: '',
        pickupAddress: '',
        destination: '',
        emergencyType: 'medical',
        notes: ''
    });

    const emergencyTypes = [
        { value: 'medical', label: 'Medical Emergency', icon: '🏥' },
        { value: 'accident', label: 'Accident', icon: '🚗' },
        { value: 'cardiac', label: 'Cardiac Emergency', icon: '❤️' },
        { value: 'other', label: 'Other', icon: '🚑' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.patientName || !formData.phone || !formData.pickupAddress) {
            alert('Please fill all required fields');
            return;
        }

        // Create ambulance request
        const request = {
            id: `AMB-${Date.now()}`,
            ...formData,
            status: 'dispatched',
            requestTime: new Date().toISOString(),
            eta: '8-12 minutes'
        };

        // Save to localStorage
        const requests = JSON.parse(localStorage.getItem('ambulanceRequests') || '[]');
        requests.unshift(request);
        localStorage.setItem('ambulanceRequests', JSON.stringify(requests));

        alert('Ambulance dispatched! ETA: 8-12 minutes\nEmergency Helpline: 102');
        navigate('/home');
    };

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
                    <h1 className="text-lg font-bold text-slate-900">Ambulance Service</h1>
                    <div className="w-10" />
                </div>
            </header>

            {/* Emergency Banner */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 mx-5 mt-5 rounded-2xl">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-[28px]">ambulance</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold">24/7 Emergency Service</h3>
                        <p className="text-xs opacity-90 mt-0.5">Average response time: 8-12 minutes</p>
                    </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/20">
                    <a href="tel:102" className="flex items-center justify-center gap-2 bg-white text-red-600 rounded-xl py-2 font-bold text-sm">
                        <Phone className="w-4 h-4" />
                        Call Emergency: 102
                    </a>
                </div>
            </div>

            {/* Form */}
            <main className="flex-1 px-5 py-6 space-y-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Patient Name */}
                    <div>
                        <label className="text-xs font-bold text-slate-600 mb-2 block">
                            Patient Name *
                        </label>
                        <input
                            type="text"
                            value={formData.patientName}
                            onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                            placeholder="Enter patient name"
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            required
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="text-xs font-bold text-slate-600 mb-2 block">
                            Contact Number *
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Enter phone number"
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            required
                        />
                    </div>

                    {/* Pickup Address */}
                    <div>
                        <label className="text-xs font-bold text-slate-600 mb-2 block">
                            Pickup Address *
                        </label>
                        <textarea
                            value={formData.pickupAddress}
                            onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                            placeholder="Enter complete pickup address"
                            rows="3"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                            required
                        />
                    </div>

                    {/* Destination */}
                    <div>
                        <label className="text-xs font-bold text-slate-600 mb-2 block">
                            Destination Hospital (Optional)
                        </label>
                        <input
                            type="text"
                            value={formData.destination}
                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                            placeholder="Enter hospital name or address"
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                        />
                    </div>

                    {/* Emergency Type */}
                    <div>
                        <label className="text-xs font-bold text-slate-600 mb-2 block">
                            Emergency Type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {emergencyTypes.map(type => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, emergencyType: type.value })}
                                    className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${formData.emergencyType === type.value
                                            ? 'border-red-500 bg-red-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <span className="text-xl">{type.icon}</span>
                                    <span className={`text-xs font-bold ${formData.emergencyType === type.value ? 'text-red-600' : 'text-slate-700'
                                        }`}>
                                        {type.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-xs font-bold text-slate-600 mb-2 block">
                            Additional Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Any specific instructions or medical conditions"
                            rows="3"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full h-14 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-bold text-base shadow-lg shadow-red-500/20 hover:shadow-red-500/30 active:scale-[0.98] transition-all"
                    >
                        Request Ambulance Now
                    </button>
                </form>

                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                    <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
                        <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-900">8-12 min</p>
                        <p className="text-xs text-slate-500 mt-0.5">Avg Response</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
                        <MapPin className="w-6 h-6 text-primary mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-900">GPS Tracked</p>
                        <p className="text-xs text-slate-500 mt-0.5">Real-time Location</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Ambulance;
