import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { cn } from '../lib/utils';

const plans = [
    {
        id: 'silver',
        name: 'Silver Care',
        description: 'Essential support for individuals',
        price: 999,
        period: '/mo',
        features: [
            'Unlimited Nurse Visits',
            'Digital Health Records',
            '10% Pharmacy Discount',
        ],
        color: 'slate',
        popular: false,
    },
    {
        id: 'gold',
        name: 'Gold Family',
        description: 'Perfect for the whole household',
        price: 1999,
        period: '/mo',
        features: [
            'Everything in Silver',
            'Unlimited Doctor Consultations',
            'Priority Lab Reports',
            'Family Health Dashboard',
        ],
        color: 'primary',
        popular: false,
    },
    {
        id: 'platinum',
        name: 'Platinum 360',
        description: 'Total care without limits',
        price: 3499,
        period: '/mo',
        features: [
            'Everything in Gold',
            '24/7 Priority Concierge',
            'Zero Delivery Charges',
            'Home Sample Collection',
            'Quarterly Full Body Checkup',
        ],
        color: 'secondary',
        popular: true,
        badge: 'BEST VALUE',
    },
];

const trustBadges = [
    { icon: '🔒', text: 'SECURE PAYMENT' },
    { icon: '🏆', text: 'ISO CERTIFIED' },
    { icon: '⏰', text: 'CANCEL ANYTIME' },
];

export default function MembershipPlans() {
    const navigate = useNavigate();

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md pt-12 pb-4 px-5">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex size-10 items-center justify-center rounded-full bg-white shadow-soft text-slate-700"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold tracking-tight text-slate-800">
                        Membership Plans
                    </h1>
                    <div className="w-10" />
                </div>
            </header>

            {/* Billing Toggle */}
            <div className="px-5 py-4">
                <div className="flex items-center justify-center gap-3 bg-slate-100 rounded-2xl p-1">
                    <button className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-white text-slate-900 shadow-sm">
                        Monthly
                    </button>
                    <button className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-500 relative">
                        Annual
                        <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            SAVE 20%
                        </span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 px-5 py-2 space-y-4 pb-24">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={cn(
                            'relative bg-white rounded-3xl p-6 shadow-premium transition-all',
                            plan.popular
                                ? 'border-2 border-secondary ring-2 ring-secondary/20'
                                : 'border border-slate-100/50'
                        )}
                    >
                        {plan.popular && (
                            <div className="absolute -top-3 right-6">
                                <div className="bg-gradient-to-r from-secondary to-blue-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg">
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
                                        {plan.id === 'platinum' && <span className="text-xl">👑</span>}
                                    </h3>
                                    <p className="text-sm font-medium text-slate-500 mt-1">
                                        {plan.description}
                                    </p>
                                </div>
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
                                        plan.popular ? 'bg-secondary/10' : 'bg-primary/10'
                                    )}>
                                        <Check className={cn('w-3.5 h-3.5', plan.popular ? 'text-secondary' : 'text-primary')} />
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
                                    planType: 'membership',
                                    planDetails: plan
                                }
                            })}
                            className={cn(
                                'w-full py-4 rounded-2xl text-base font-bold shadow-lg transition-all active:scale-95',
                                plan.popular
                                    ? 'bg-secondary text-white shadow-secondary/25 hover:bg-secondary/90'
                                    : 'bg-primary text-white shadow-primary/25 hover:bg-primary/90'
                            )}
                        >
                            {plan.id === 'silver' ? 'Choose Silver' : plan.id === 'gold' ? 'Choose Gold' : 'Get Platinum'}
                        </button>
                    </div>
                ))}

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-4 py-6">
                    {trustBadges.map((badge, index) => (
                        <div key={index} className="flex flex-col items-center gap-1">
                            <span className="text-lg">{badge.icon}</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                {badge.text}
                            </span>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
