import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';

const TreatmentPackages = () => {
    const navigate = useNavigate();
    const [packages] = useState(() => {
        // Load packages from localStorage
        const defaultPackages = [
            {
                id: 'pkg-wound',
                name: 'Wound Care',
                description: 'Professional dressing and management for surgical or chronic wounds (diabetic ulcers, bedsores).',
                price: 800,
                duration: 'Per Visit',
                includes: ['Sterile Dressing', 'Infection Monitoring', 'Healing Progress Check', 'Pain Management'],
                enabled: true
            },
            {
                id: 'pkg-elderly',
                name: 'Elderly Care',
                description: 'Comprehensive daily assistance and health monitoring for seniors ensuring comfort and safety.',
                price: 15000,
                duration: 'Monthly',
                includes: ['Daily Vitals Check', 'Medication Management', 'Mobility Assistance', 'Dietary Monitoring', 'Weekly Doctor Visit'],
                enabled: true
            },
            {
                id: 'pkg-maternity',
                name: 'Maternity Care',
                description: 'Holistic post-natal care for mother and newborn baby helping you transition into parenthood.',
                price: 25000,
                duration: 'Monthly',
                includes: ['Newborn Care', 'Breastfeeding Support', 'Mother\'s Recovery Check', 'Baby Vitals Monitoring', 'Postpartum Massage'],
                enabled: true
            },
            {
                id: 'pkg-physio',
                name: 'Physiotherapy Session',
                description: 'Rehabilitation and pain relief therapy at home by certified physiotherapists.',
                price: 1200,
                duration: 'Per Session',
                includes: ['Manual Therapy', 'Exercise Guidance', 'Mobility Improvement', 'Pain Relief Modalities', 'Post-Surgical Rehab'],
                enabled: true
            },
            {
                id: 'pkg-palliative',
                name: 'Palliative Care',
                description: 'Compassionate care focused on providing relief from symptoms and stress of serious illness.',
                price: 20000,
                duration: 'Monthly',
                includes: ['Pain Management', 'Symptom Relief', 'Emotional Support', 'Family Counseling', '24/7 Nursing Support'],
                enabled: true
            },
            {
                id: 'pkg-stroke',
                name: 'Stroke Rehabilitation',
                description: 'Specialized care to help stroke survivors regain independence and improve quality of life.',
                price: 18000,
                duration: 'Monthly',
                includes: ['Physical Therapy', 'Speech Therapy Support', 'Motor Skill Recovery', 'Daily Living Assistance'],
                enabled: true
            },
            {
                id: 'pkg-diabetes',
                name: 'Diabetes Care',
                description: 'Complete management and education for diabetic patients.',
                price: 5000,
                duration: 'Monthly',
                includes: ['Blood Sugar Monitoring', 'Diet Consultation', 'Insulin Administration Support', 'Foot Care'],
                enabled: true
            },
            {
                id: 'pkg-surgery',
                name: 'Post-Surgery Care',
                description: 'Dedicated nursing support for faster recovery after surgery.',
                price: 2000,
                duration: 'Per Shift (12hrs)',
                includes: ['Vitals Monitoring', 'Medication Administration', 'Wound Care', 'Assistance with Daily Activities'],
                enabled: true
            }
        ];

        const saved = JSON.parse(localStorage.getItem('treatmentPackages') || JSON.stringify(defaultPackages));
        return saved.filter(p => p.enabled !== false);
    });

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
                    <h1 className="text-lg font-bold text-slate-900">Treatment Packages</h1>
                    <div className="w-10" />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-5 py-6 space-y-4">
                {/* Info Banner */}
                <div className="bg-primary/10 rounded-2xl p-4">
                    <h3 className="text-sm font-bold text-primary mb-1">Comprehensive Care Plans</h3>
                    <p className="text-xs text-slate-600">
                        Choose from our curated specialized care packages designed for your specific health needs
                    </p>
                </div>

                {/* Packages */}
                {packages.map(pkg => (
                    <div key={pkg.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <h3 className="text-base font-bold text-slate-900">{pkg.name}</h3>
                                <p className="text-sm text-slate-600 mt-1">{pkg.description}</p>
                            </div>
                        </div>

                        {/* Price & Duration */}
                        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100">
                            <div>
                                <p className="text-xs text-slate-500">Price</p>
                                <p className="text-2xl font-bold text-primary">₹{pkg.price}</p>
                            </div>
                            <div className="h-10 w-px bg-slate-200" />
                            <div>
                                <p className="text-xs text-slate-500">Duration</p>
                                <p className="text-sm font-bold text-slate-900">{pkg.duration}</p>
                            </div>
                        </div>

                        {/* Includes */}
                        <div className="mb-4">
                            <p className="text-xs font-bold text-slate-600 mb-2">Package Includes:</p>
                            <div className="space-y-2">
                                {pkg.includes?.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-primary" />
                                        </div>
                                        <span className="text-sm text-slate-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Book Button */}
                        <button
                            onClick={() => handleBookPackage(pkg)}
                            className="w-full h-12 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all"
                        >
                            Book This Package
                        </button>
                    </div>
                ))}

                {packages.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-slate-500">No packages available at the moment</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default TreatmentPackages;
