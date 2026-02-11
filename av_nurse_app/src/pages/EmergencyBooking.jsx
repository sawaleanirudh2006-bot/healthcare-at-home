import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, MapPin, Phone, User } from 'lucide-react';

const EmergencyBooking = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        patientName: '',
        phone: '',
        address: '',
        emergencyType: 'IV Therapy',
        symptoms: '',
        notes: ''
    });

    const emergencyTypes = [
        'IV Therapy',
        'Wound Care',
        'Injection',
        'Catheter Care',
        'Vital Monitoring',
        'Other'
    ];

    const handleSubmit = () => {
        // Validation
        if (!formData.patientName || !formData.phone || !formData.address) {
            alert('Please fill all required fields');
            return;
        }

        // Create emergency booking
        const emergencyBooking = {
            id: `EMG-${Date.now()}`,
            ...formData,
            status: 'emergency',
            priority: 'high',
            createdAt: new Date().toISOString(),
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            service: formData.emergencyType,
            serviceName: `Emergency ${formData.emergencyType}`,
            serviceType: 'Emergency Service',
            provider: 'Assigning nearest nurse...',
            isMedicineOrder: false,
            // Auto-assign nearest nurse
            nurse: {
                id: 'nurse-1',
                name: 'Nurse Sarah',
                rating: 4.8,
                experience: '8 years'
            }
        };

        // Save to localStorage
        const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        bookings.unshift(emergencyBooking);
        localStorage.setItem('userBookings', JSON.stringify(bookings));

        // Create nurse assignment
        const assignments = JSON.parse(localStorage.getItem('nurseAssignments') || '[]');
        assignments.unshift({
            id: emergencyBooking.id,
            service: emergencyBooking.serviceName,
            patientName: formData.patientName,
            date: emergencyBooking.date,
            time: emergencyBooking.time,
            address: formData.address,
            status: 'emergency',
            priority: 'high',
            phone: formData.phone,
            notes: formData.notes,
            symptoms: formData.symptoms
        });
        localStorage.setItem('nurseAssignments', JSON.stringify(assignments));

        alert('Emergency booking created! A nurse will be assigned immediately.');
        navigate('/service-tracking', {
            state: {
                serviceType: emergencyBooking.serviceName,
                providerName: emergencyBooking.nurse.name,
                bookingId: emergencyBooking.id
            }
        });
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
                    <h1 className="text-lg font-bold text-slate-900">Emergency Booking</h1>
                    <div className="w-10" />
                </div>
            </header>

            {/* Emergency Alert */}
            <div className="px-5 pt-4">
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-bold text-red-900">Priority Service</h3>
                        <p className="text-xs font-medium text-red-700 mt-1">
                            A nurse will be assigned immediately. Expected arrival within 30 minutes.
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="flex-1 px-5 py-6 space-y-5 pb-32">
                {/* Patient Name */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 ml-1">
                        Patient Name *
                    </label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={formData.patientName}
                            onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                            placeholder="Enter patient name"
                            className="w-full h-14 pl-12 pr-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        />
                    </div>
                </div>

                {/* Phone Number */}
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
                            className="w-full h-14 pl-12 pr-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        />
                    </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 ml-1">
                        Current Location *
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Enter complete address with landmarks"
                            className="w-full h-24 pl-12 pr-4 pt-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                        />
                    </div>
                </div>

                {/* Emergency Type */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 ml-1">
                        Service Required *
                    </label>
                    <select
                        value={formData.emergencyType}
                        onChange={(e) => setFormData({ ...formData, emergencyType: e.target.value })}
                        className="w-full h-14 px-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    >
                        {emergencyTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                {/* Symptoms */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 ml-1">
                        Symptoms / Condition
                    </label>
                    <textarea
                        value={formData.symptoms}
                        onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                        placeholder="Describe symptoms or medical condition"
                        className="w-full h-24 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                    />
                </div>

                {/* Additional Notes */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 ml-1">
                        Additional Notes
                    </label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Any special instructions or allergies"
                        className="w-full h-24 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                    />
                </div>

                {/* Pricing Info */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-amber-900">Emergency Service Fee</span>
                        <span className="text-lg font-bold text-amber-900">₹1,999</span>
                    </div>
                    <p className="text-xs font-medium text-amber-700 mt-1">
                        Includes priority assignment + travel charges
                    </p>
                </div>
            </main>

            {/* Submit Button */}
            <div className="sticky bottom-0 bg-white border-t border-slate-100 p-5">
                <button
                    onClick={handleSubmit}
                    className="w-full h-14 bg-red-600 text-white rounded-2xl font-bold text-base shadow-lg shadow-red-600/20 hover:bg-red-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <AlertCircle className="w-5 h-5" />
                    Request Emergency Service
                </button>
            </div>
        </div>
    );
};

export default EmergencyBooking;
