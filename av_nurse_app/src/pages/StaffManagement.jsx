import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, User, Phone, MapPin, Award } from 'lucide-react';

const StaffManagement = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('doctors');
    const [doctors] = useState(() => {
        const defaultDoctors = [
            { id: 'doc-1', name: 'Dr. Rajesh Kumar', specialty: 'General Physician', phone: '9876543210', email: 'dr.rajesh@hospital.com', experience: '15 years' },
            { id: 'doc-2', name: 'Dr. Priya Sharma', specialty: 'Internal Medicine', phone: '9876543211', email: 'dr.priya@hospital.com', experience: '12 years' }
        ];
        return JSON.parse(localStorage.getItem('doctors') || JSON.stringify(defaultDoctors));
    });

    const [nurses] = useState(() => {
        const defaultNurses = [
            { id: 'nurse-1', name: 'Nurse Sarah', area: 'North Delhi', phone: '9876543220', rating: 4.8, experience: '8 years' },
            { id: 'nurse-2', name: 'Nurse Priya', area: 'South Delhi', phone: '9876543221', rating: 4.9, experience: '10 years' }
        ];
        return JSON.parse(localStorage.getItem('nurses') || JSON.stringify(defaultNurses));
    });

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 pt-12 pb-4 px-5">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Staff Management</h1>
                    <button className="flex size-10 items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 active:scale-95 transition-all">
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('doctors')}
                        className={`flex-1 h-10 rounded-xl font-bold text-sm transition-all ${activeTab === 'doctors' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                    >
                        Doctors ({doctors.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('nurses')}
                        className={`flex-1 h-10 rounded-xl font-bold text-sm transition-all ${activeTab === 'nurses' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                    >
                        Nurses ({nurses.length})
                    </button>
                </div>
            </header>

            <main className="flex-1 px-5 py-6 space-y-4">
                {activeTab === 'doctors' ? (
                    doctors.map(doctor => (
                        <div key={doctor.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                                    <User className="w-7 h-7 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-bold text-slate-900">{doctor.name}</h3>
                                    <p className="text-sm text-slate-600">{doctor.specialty}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Phone className="w-3 h-3" />
                                            {doctor.phone}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Award className="w-3 h-3" />
                                            {doctor.experience}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    nurses.map(nurse => (
                        <div key={nurse.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <User className="w-7 h-7 text-emerald-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-bold text-slate-900">{nurse.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm text-slate-600">{nurse.area}</span>
                                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-full">
                                            ⭐ {nurse.rating}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Phone className="w-3 h-3" />
                                            {nurse.phone}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Award className="w-3 h-3" />
                                            {nurse.experience}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
};

export default StaffManagement;
