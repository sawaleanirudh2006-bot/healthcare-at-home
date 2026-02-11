import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, Droplets, Zap, Activity, Check, HeartPulse } from 'lucide-react';
import { cn } from '../lib/utils';

const serviceOptions = [
    {
        id: 'hydration-therapy',
        icon: Droplets,
        title: 'Hydration Therapy',
        description: 'Saline solution for rapid rehydration.',
        price: 1499,
        priceUnit: 'PER SESSION',
        duration: 'Approx. 45-60 mins',
        popular: true,
    },
    {
        id: 'vitamin-cocktail',
        icon: Zap,
        title: 'Vitamin Boost',
        description: 'Multivitamin mix for immunity & energy.',
        price: 2499,
        priceUnit: 'PER SESSION',
        duration: 'Approx. 45-60 mins',
        popular: false,
    },
    {
        id: 'antibiotic-infusion',
        icon: Activity,
        title: 'Antibiotic Infusion',
        description: 'Administering prescribed antibiotics.',
        price: 999,
        priceUnit: 'PER SESSION',
        duration: 'As per prescription',
        popular: false,
    },
    {
        id: 'iron-sucrose',
        icon: HeartPulse,
        title: 'Iron Sucrose',
        description: 'For treatment of iron deficiency anemia.',
        price: 1800,
        priceUnit: 'PER SESSION',
        duration: 'Approx. 2-3 hours',
        popular: false,
    },
];

export default function IVFluidServices() {
    const navigate = useNavigate();
    const [selectedService, setSelectedService] = useState(null);

    const handleSelect = (service) => { // Accept service object
        setSelectedService(service.id);
        // Navigate to schedule with selected service
        setTimeout(() => {
            navigate('/schedule-datetime', {
                state: {
                    serviceType: service.title,
                    price: service.price,
                    isIVService: true
                }
            });
        }, 300);
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md pt-12 pb-4 px-5">
                <div className="flex items-center justify-between mb-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex size-10 items-center justify-center rounded-full bg-white shadow-soft text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold tracking-tight text-slate-800">
                        IV Fluid Services
                    </h1>
                    <button className="flex size-10 items-center justify-center rounded-full bg-white shadow-soft text-slate-700 hover:bg-slate-50 transition-colors">
                        <Info className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-5 py-2 space-y-6 pb-24">
                <div className="space-y-1">
                    <h2 className="text-xl font-extrabold text-slate-900">
                        Select IV Therapy
                    </h2>
                    <p className="text-sm font-medium text-slate-500">
                        Professional IV administration at home
                    </p>
                </div>

                {/* Service Cards */}
                <div className="space-y-4">
                    {serviceOptions.map((service) => {
                        const Icon = service.icon;
                        const isSelected = selectedService === service.id;

                        return (
                            <div
                                key={service.id}
                                onClick={() => handleSelect(service)} // Pass service object
                                className={cn(
                                    'group relative overflow-hidden rounded-2xl bg-white p-5 shadow-premium transition-all active:scale-[0.98] cursor-pointer',
                                    service.popular
                                        ? 'border-2 border-blue-500/10'
                                        : 'border border-slate-100/50',
                                    isSelected && 'ring-2 ring-blue-500 border-blue-500'
                                )}
                            >
                                {service.popular && (
                                    <div className="absolute top-0 right-0">
                                        <div className="bg-blue-500/10 text-blue-500 text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                                            POPULAR
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                                            <Icon className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800 leading-tight">
                                                {service.title}
                                            </h3>
                                            <p className="text-[13px] font-medium text-slate-500 mt-1 leading-snug">
                                                {service.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[18px] font-extrabold text-blue-500">
                                            ₹{service.price.toLocaleString()}
                                        </div>
                                        <div className="text-[10px] font-bold uppercase text-slate-400">
                                            {service.priceUnit}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-[11px] font-semibold text-slate-600">
                                            {service.duration}
                                        </span>
                                    </div>
                                    <div className={cn(
                                        "h-8 w-8 rounded-full flex items-center justify-center transition-colors",
                                        isSelected ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-300"
                                    )}>
                                        <Check className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Trust Badge */}
                <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50 flex items-start gap-3">
                    <Check className="text-blue-500 w-5 h-5 mt-0.5" />
                    <div>
                        <h4 className="text-[13px] font-bold text-slate-800">
                            Safe & Sterile Procedure
                        </h4>
                        <p className="text-[12px] font-medium text-slate-500 mt-0.5">
                            Administered by certified nurses with strict hygiene protocols.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
