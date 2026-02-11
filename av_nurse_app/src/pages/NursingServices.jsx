import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, Timer, Sun, Home as HomeIcon, Check, CalendarClock } from 'lucide-react';
import { cn } from '../lib/utils';

const serviceOptions = [
    {
        id: 'short-visit',
        icon: Timer,
        title: 'Short Visit',
        description: 'Injection, dressing, or vitals check up.',
        price: 499,
        priceUnit: 'PER VISIT',
        duration: 'Approx. 30-45 mins',
        popular: false,
    },
    {
        id: '12hr-shift',
        icon: Sun,
        title: '12hr Shift',
        description: 'Day or Night specialized nursing care.',
        price: 1800,
        priceUnit: 'PER SHIFT',
        duration: 'Dedicated Caretaker',
        popular: true,
    },
    {
        id: '24hr-livein',
        icon: HomeIcon,
        title: '24hr Live-in',
        description: 'Round-the-clock support for critical recovery.',
        price: 3200,
        priceUnit: 'PER DAY',
        duration: 'Residential Support',
        popular: false,
    },
    {
        id: 'custom-care',
        icon: CalendarClock,
        title: 'Custom Care',
        description: 'Flexible duration as per your specific needs.',
        price: 'Flexible',
        priceUnit: 'PER REQUEST',
        duration: 'Tailored Schedule',
        popular: false,
    },
];

export default function NursingServices() {
    const navigate = useNavigate();
    const [selectedService, setSelectedService] = useState(null);



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
                        Nursing Services
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
                        Choose Care Duration
                    </h2>
                    <p className="text-sm font-medium text-slate-500">
                        Select the plan that best suits your needs
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
                                className={cn(
                                    'group relative overflow-hidden rounded-2xl bg-white p-5 shadow-premium transition-all active:scale-[0.98]',
                                    service.popular
                                        ? 'border-2 border-primary/10'
                                        : 'border border-slate-100/50',
                                    isSelected && 'ring-2 ring-primary'
                                )}
                            >
                                {service.popular && (
                                    <div className="absolute top-0 right-0">
                                        <div className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                                            POPULAR
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-primary">
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
                                        <div className="text-[18px] font-extrabold text-primary">
                                            {typeof service.price === 'number' ? `₹${service.price.toLocaleString()}` : service.price}
                                        </div>
                                        <div className="text-[10px] font-bold uppercase text-slate-400">
                                            {service.priceUnit}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-[11px] font-semibold text-slate-600">
                                            {service.duration}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => navigate('/schedule-datetime', {
                                            state: { serviceType: service.title, price: service.price }
                                        })}
                                        className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-base shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Trust Badge */}
                <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50 flex items-start gap-3">
                    <Check className="text-secondary w-5 h-5 mt-0.5" />
                    <div>
                        <h4 className="text-[13px] font-bold text-slate-800">
                            Certified Medical Professionals
                        </h4>
                        <p className="text-[12px] font-medium text-slate-500 mt-0.5">
                            All our nurses are background verified and DHA/MCI certified.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
