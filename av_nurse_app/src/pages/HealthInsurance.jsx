import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Shield } from 'lucide-react';
import { cn } from '../lib/utils';

const insurancePlans = [
    {
        id: 'basic',
        name: 'Health Shield Basic',
        description: 'Essential health coverage',
        coverage: '5 Lakhs',
        price: 499,
        period: '/mo',
        features: [
            'Hospitalization Coverage',
            'Pre & Post Hospitalization',
            'Daycare Procedures',
            'Ambulance Charges',
            'Room Rent Coverage',
        ],
        color: 'blue',
        popular: false,
    },
    {
        id: 'premium',
        name: 'Health Shield Premium',
        description: 'Comprehensive family protection',
        coverage: '10 Lakhs',
        price: 899,
        period: '/mo',
        features: [
            'Everything in Basic',
            'Maternity Coverage',
            'Critical Illness Cover',
            'No Claim Bonus',
            'Worldwide Coverage',
            'Free Annual Health Checkup',
        ],
        color: 'primary',
        popular: true,
        badge: 'MOST POPULAR',
    },
    {
        id: 'elite',
        name: 'Health Shield Elite',
        description: 'Premium protection for your family',
        coverage: '25 Lakhs',
        price: 1499,
        period: '/mo',
        features: [
            'Everything in Premium',
            'Unlimited Restoration Benefit',
            'Organ Donor Expenses',
            'Home Healthcare',
            'Mental Health Coverage',
            'Alternative Treatments (Ayurveda)',
            'Zero Waiting Period',
        ],
        color: 'secondary',
        popular: false,
    },
];

const benefits = [
    { icon: '🏥', title: 'Cashless Treatment', desc: '10,000+ Network Hospitals' },
    { icon: '⚡', title: 'Instant Claim', desc: 'Quick claim settlement' },
    { icon: '📱', title: 'Digital Policy', desc: 'Paperless & instant' },
];

export default function HealthInsurance() {
    const navigate = useNavigate();

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-gradient-to-br from-blue-500 to-blue-600 pt-12 pb-6 px-5">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex size-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 active:scale-95 transition-all backdrop-blur-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-white">Health Insurance</h1>
                    <div className="w-10" />
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                    <div className="flex size-12 items-center justify-center rounded-full bg-white/20">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="text-white font-bold text-base">Protect Your Family</p>
                        <p className="text-white/80 text-xs font-medium mt-0.5">Comprehensive health coverage plans</p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-5 py-6 space-y-4 pb-24">
                {insurancePlans.map((plan) => (
                    <div
                        key={plan.id}
                        className={cn(
                            'relative bg-white rounded-3xl p-6 shadow-premium transition-all',
                            plan.popular
                                ? 'border-2 border-primary ring-2 ring-primary/20'
                                : 'border border-slate-100/50'
                        )}
                    >
                        {plan.popular && (
                            <div className="absolute -top-3 right-6">
                                <div className="bg-gradient-to-r from-primary to-blue-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg">
                                    {plan.badge}
                                </div>
                            </div>
                        )}

                        {/* Plan Header */}
                        <div className="mb-5">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                                        {plan.name}
                                        {plan.id === 'elite' && <span className="text-xl">🛡️</span>}
                                    </h3>
                                    <p className="text-sm font-medium text-slate-500 mt-1">
                                        {plan.description}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-blue-50 rounded-xl p-3 mb-4">
                                <p className="text-xs font-bold text-blue-900 uppercase tracking-wide">Coverage Amount</p>
                                <p className="text-2xl font-extrabold text-blue-600 mt-1">₹{plan.coverage}</p>
                            </div>

                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-extrabold text-slate-900">
                                    ₹{plan.price.toLocaleString()}
                                </span>
                                <span className="text-base font-semibold text-slate-500">
                                    {plan.period}
                                </span>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-3 mb-6">
                            {plan.features.map((feature, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className={cn(
                                        'flex size-5 items-center justify-center rounded-full mt-0.5',
                                        plan.popular ? 'bg-primary/10' : 'bg-blue-500/10'
                                    )}>
                                        <Check className={cn('w-3.5 h-3.5', plan.popular ? 'text-primary' : 'text-blue-600')} />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700 leading-snug">
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* CTA Button */}
                        <button
                            onClick={() => navigate('/checkout', {
                                state: {
                                    serviceType: plan.name,
                                    price: plan.price,
                                    planType: 'insurance',
                                    coverage: plan.coverage,
                                    planDetails: plan
                                }
                            })}
                            className={cn(
                                'w-full py-4 rounded-2xl text-base font-bold shadow-lg transition-all active:scale-95',
                                plan.popular
                                    ? 'bg-primary text-white shadow-primary/25 hover:bg-primary/90'
                                    : 'bg-blue-500 text-white shadow-blue-500/25 hover:bg-blue-600'
                            )}
                        >
                            Get {plan.name.split(' ')[2]}
                        </button>
                    </div>
                ))}

                {/* Benefits Section */}
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl p-6 border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Why Choose Us?</h3>
                    <div className="space-y-4">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-white shadow-sm">
                                    <span className="text-xl">{benefit.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-900">{benefit.title}</p>
                                    <p className="text-xs font-medium text-slate-500 mt-0.5">{benefit.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-4 py-4">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-lg">🔒</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            SECURE
                        </span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-lg">✓</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            IRDAI APPROVED
                        </span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-lg">⚡</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            INSTANT POLICY
                        </span>
                    </div>
                </div>
            </main>
        </div>
    );
}
