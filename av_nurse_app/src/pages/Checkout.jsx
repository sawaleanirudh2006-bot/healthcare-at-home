import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, CreditCard, Smartphone, QrCode, Shield } from 'lucide-react';
import { cn } from '../lib/utils';

const serviceDetails = {
    'short-visit': {
        title: '30min Nurse Visit',
        subtitle: 'Professional In-Home Care',
        price: 499,
    },
    '12hr-shift': {
        title: '12hr Nurse Shift',
        subtitle: 'Professional In-Home Care',
        price: 1800,
    },
    '24hr-livein': {
        title: '24hr Live-in Care',
        subtitle: 'Professional In-Home Care',
        price: 3200,
    },
};

const paymentMethods = [
    { id: 'gpay', name: 'GPay', icon: CreditCard, recommended: true },
    { id: 'phonepe', name: 'PhonePe', icon: Smartphone, recommended: false },
    { id: 'other-upi', name: 'Other UPI', icon: QrCode, recommended: false },
];

export default function Checkout() {
    const navigate = useNavigate();
    const location = useLocation();

    // Get data from location state (could be service or plan)
    const {
        serviceType,
        price,
        planType,
        coverage,
        planDetails,
        serviceId,
        date,
        time,
        nurse,
        total: stateTotal,
        isPackage,
        packageDetails
    } = location.state || {};

    // Determine if this is a plan purchase or service booking
    const isPlanPurchase = planType === 'insurance' || planType === 'membership' || planType === 'treatment-package' || isPackage;

    // For service bookings, use the old logic
    const service = serviceId ? serviceDetails[serviceId] : null;

    // Calculate pricing
    const subtotal = price || stateTotal || (service?.price || 0);
    const gst = Math.round(subtotal * 0.18);
    const serviceFee = 0;
    const total = subtotal + gst + serviceFee;

    const [selectedPayment, setSelectedPayment] = useState('gpay');

    const handlePayment = () => {
        // Simulate payment processing
        setTimeout(() => {
            navigate('/payment-success', {
                state: {
                    serviceType: serviceType || service?.title,
                    price: subtotal,
                    planType: planType || (isPackage ? 'treatment-package' : 'service'),
                    coverage: coverage,
                    planDetails: planDetails,
                    amount: total,
                    bookingId: `MD-${Math.floor(Math.random() * 100000)}`,
                    date: date,
                    time: time,
                    nurse: nurse,
                    isMedicineOrder: location.state?.isMedicineOrder,
                    cartItems: location.state?.cartItems,
                    // Pass doctor notes
                    doctorNotes: location.state?.doctorNotes,
                    diagnosis: location.state?.diagnosis,
                    recommendations: location.state?.recommendations,
                    doctorPrescription: location.state?.prescription?.doctorPrescription // Also pass rx text
                },
            });
        }, 500);
    };

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
                        Secure Checkout
                    </h1>
                    <div className="w-10" />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-5 py-4 space-y-6 pb-24">
                {/* Service Summary */}
                <div className="bg-white rounded-2xl p-5 shadow-premium border border-slate-100/50">
                    <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">
                                {isPlanPurchase ? (planType === 'insurance' ? 'INSURANCE PLAN' : (planType === 'treatment-package' || isPackage) ? 'TREATMENT PACKAGE' : 'MEMBERSHIP PLAN') : location.state?.isMedicineOrder ? 'MEDICINE ORDER' : 'CONFIRMED SERVICE'}
                            </p>
                            <h3 className="text-xl font-bold text-slate-900 leading-tight">
                                {serviceType || service?.title}
                            </h3>
                            <p className="text-sm font-medium text-slate-500 mt-1">
                                {isPlanPurchase
                                    ? (planType === 'insurance' ? `Coverage: ₹${coverage}` : (packageDetails?.description || planDetails?.description))
                                    : location.state?.isMedicineOrder ? `${location.state?.cartItems?.length || 0} items` : service?.subtitle}
                            </p>
                            {!isPlanPurchase && !location.state?.isMedicineOrder && (
                                <div className="flex items-center gap-3 mt-3 text-slate-600">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-xs font-medium">{date || 'Oct 24, 2023'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-xs font-medium">{time || '08:00 AM'}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                            <span className="text-4xl">
                                <span className="text-4xl">
                                    {isPlanPurchase
                                        ? (planType === 'insurance' ? '🛡️' : (planType === 'treatment-package' || isPackage) ? '💊' : planDetails?.id === 'platinum' ? '👑' : planDetails?.id === 'gold' ? '💎' : '⭐')
                                        : location.state?.isMedicineOrder ? '💊' : '👩‍⚕️'}
                                </span>
                            </span>
                        </div>
                    </div>
                    {/* Cart Items List */}
                    {location.state?.cartItems && (
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                            {location.state.cartItems.map((item) => (
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-700">{item.quantity}x</span>
                                        <span className="text-slate-600">{item.name}</span>
                                    </div>
                                    <span className="font-semibold text-slate-900">₹{item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Auto-Assigned Nurse Notification */}
                {nurse && location.state?.autoAssigned && (
                    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                        <div className="flex gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500 text-white shrink-0">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-slate-900">Nurse Auto-Assigned</h3>
                                <p className="text-xs font-medium text-slate-600 mt-1">
                                    <span className="font-bold text-emerald-700">{nurse.name}</span> has been automatically assigned based on availability and proximity to your location.
                                </p>
                                {nurse.rating && (
                                    <p className="text-xs font-medium text-slate-500 mt-2">
                                        ⭐ {nurse.rating} rating • {nurse.experience} experience
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Bill Summary */}
                <div className="space-y-3">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        BILL SUMMARY
                    </h3>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-600">Subtotal</span>
                            <span className="font-semibold text-slate-900">₹{subtotal}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">GST (18%)</span>
                            <span className="font-semibold text-slate-900">₹{gst}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Service Fee</span>
                            <span className="font-bold text-primary">FREE</span>
                        </div>
                        <div className="h-px bg-slate-200 my-3" />
                        <div className="flex justify-between text-lg">
                            <span className="font-bold text-slate-900">Total Payable</span>
                            <span className="font-extrabold text-slate-900">₹{total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-3">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        PAYMENT METHODS
                    </h3>
                    <p className="text-xs font-semibold text-slate-600">UPI (Recommended)</p>

                    <div className="grid grid-cols-3 gap-3">
                        {paymentMethods.map((method) => {
                            const Icon = method.icon;
                            return (
                                <button
                                    key={method.id}
                                    onClick={() => setSelectedPayment(method.id)}
                                    className={cn(
                                        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                                        selectedPayment === method.id
                                            ? 'border-primary bg-primary/5'
                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                    )}
                                >
                                    <Icon className={cn('w-6 h-6', selectedPayment === method.id ? 'text-primary' : 'text-slate-600')} />
                                    <span className="text-xs font-semibold text-slate-700">
                                        {method.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Saved Cards */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-600 mt-4">Saved Cards</p>
                        <button
                            onClick={() => setSelectedPayment('card')}
                            className={cn(
                                'w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all',
                                selectedPayment === 'card'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <CreditCard className={cn('w-5 h-5', selectedPayment === 'card' ? 'text-primary' : 'text-slate-600')} />
                                <span className={cn('text-sm font-semibold', selectedPayment === 'card' ? 'text-primary' : 'text-slate-700')}>
                                    HDFC Bank •••• 4242
                                </span>
                            </div>
                            <div className={cn(
                                'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                                selectedPayment === 'card'
                                    ? 'border-primary bg-primary'
                                    : 'border-slate-300 bg-white'
                            )}>
                                {selectedPayment === 'card' && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            </main >

            {/* Fixed Bottom Button */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-slate-100 px-5 py-4">
                <button
                    onClick={handlePayment}
                    className="w-full bg-primary text-white px-6 py-4 rounded-2xl text-base font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                    <Shield className="w-5 h-5" />
                    Secure Payment • ₹{total.toLocaleString()}
                </button>
            </div>
        </div>
    );
}
