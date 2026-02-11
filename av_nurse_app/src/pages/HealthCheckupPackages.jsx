import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Shield, CheckCircle2, ChevronRight, Percent } from 'lucide-react';
import { cn } from '../lib/utils';

const HealthCheckupPackages = () => {
    const navigate = useNavigate();

    const packages = [
        {
            id: 'pkg-full-body',
            name: 'Full Body Checkup',
            description: 'Comprehensive screening including Liver, Kidney, Lipid Profile, Thyroid, and more.',
            originalPrice: 2999,
            price: 1799,
            discount: '40% OFF',
            duration: '45 mins',
            includes: ['Complete Blood Count', 'Liver Function Test', 'Kidney Function Test', 'Lipid Profile', 'Thyroid Profile', 'Urine Routine'],
            color: 'bg-blue-50 text-blue-600 border-blue-100',
            icon: 'accessibility_new'
        },
        {
            id: 'pkg-senior-citizen',
            name: 'Senior Citizen Package',
            description: 'Tailored health assessment for seniors focusing on vital organ health and bone density.',
            originalPrice: 3499,
            price: 2099,
            discount: '40% OFF',
            duration: '60 mins',
            includes: ['Full Body Checkup', 'HbA1c (Diabetes)', 'Calcium & Vitamin D', 'ECG', 'Doctor Consultation'],
            color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            icon: 'elderly'
        },
        {
            id: 'pkg-women-health',
            name: 'Women Health Checkup',
            description: 'Essential preventive screening for women of all ages.',
            originalPrice: 2499,
            price: 1499,
            discount: '40% OFF',
            duration: '45 mins',
            includes: ['CBC & ESR', 'Thyroid Profile (T3, T4, TSH)', 'Iron Deficiency Profile', 'Calcium', 'Urine Analysis'],
            color: 'bg-rose-50 text-rose-600 border-rose-100',
            icon: 'female'
        },
        {
            id: 'pkg-vitamin',
            name: 'Vitamin Profile',
            description: 'Check for essential vitamin deficiencies that affect energy and immunity.',
            originalPrice: 1999,
            price: 1199,
            discount: '40% OFF',
            duration: '30 mins',
            includes: ['Vitamin B12', 'Vitamin D3', 'Calcium', 'Iron Studies'],
            color: 'bg-amber-50 text-amber-600 border-amber-100',
            icon: 'vital_signs'
        },
        {
            id: 'pkg-cardiac',
            name: 'Cardiac Screening',
            description: 'Preventive heart health checkup involves blood markers and risk assessment.',
            originalPrice: 2299,
            price: 1379,
            discount: '40% OFF',
            duration: '40 mins',
            includes: ['Lipid Profile', 'Hs-CRP', 'HbA1c', 'ECG', 'Cardiologist Consultation'],
            color: 'bg-red-50 text-red-600 border-red-100',
            icon: 'monitor_heart'
        }
    ];

    const handleBookPackage = (pkg) => {
        navigate('/schedule-datetime', {
            state: {
                serviceType: pkg.name,
                price: pkg.price,
                isPackage: true,
                packageDetails: pkg
            }
        });
    };

    return (
        <div className="bg-background min-h-screen max-w-[430px] mx-auto relative flex flex-col">
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md pt-12 pb-4 px-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 leading-tight">Health Checkups</h1>
                        <p className="text-xs font-medium text-slate-500">Preventive care at home</p>
                    </div>
                </div>
            </header>

            <main className="px-5 py-6 space-y-6 flex-1 pb-24">
                {/* Promo Banner */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase border border-white/20">Limited Time</span>
                            <span className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1">
                                <Percent className="w-3 h-3" /> Flat 40% OFF
                            </span>
                        </div>
                        <h2 className="text-xl font-bold leading-tight mb-1">Complete Health Shield</h2>
                        <p className="text-xs text-white/90 mb-0 font-medium max-w-[200px]">
                            Comprehensive screening to ensure your well-being.
                        </p>
                    </div>
                    <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-[100px] text-white/10 rotate-12 pointer-events-none">medical_services</span>
                </div>

                <div className="space-y-4">
                    {packages.map((pkg) => (
                        <div key={pkg.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 transition-all hover:shadow-md active:scale-[0.99] group">
                            <div className="flex justify-between items-start mb-3">
                                <div className={cn("size-12 rounded-xl flex items-center justify-center", pkg.color)}>
                                    <span className="material-symbols-outlined text-[28px]">{pkg.icon}</span>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <span className="text-xs font-medium text-slate-400 line-through">₹{pkg.originalPrice}</span>
                                        <span className="bg-red-50 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-100">{pkg.discount}</span>
                                    </div>
                                    <p className="text-lg font-extrabold text-slate-900">₹{pkg.price}</p>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-1">{pkg.name}</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">{pkg.description}</p>

                            <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Include {pkg.includes.length} Tests</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {pkg.includes.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                            <span className="text-[11px] font-medium text-slate-700 truncate">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-1.5 text-slate-500">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-xs font-medium">{pkg.duration}</span>
                                </div>
                                <button
                                    onClick={() => handleBookPackage(pkg)}
                                    className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors flex items-center gap-1"
                                >
                                    Book Now <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default HealthCheckupPackages;
