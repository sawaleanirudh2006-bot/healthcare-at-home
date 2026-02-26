import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, CreditCard, Smartphone, QrCode, Shield } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabaseClient';

const serviceDetails = {
    'short-visit': {
        title: 'Short Visit',
        subtitle: 'Injection, dressing, wound care or vitals check',
        price: 499,
    },
    '12hr-shift': {
        title: '12hr Nurse Shift',
        subtitle: 'Day or night dedicated nursing care',
        price: 1800,
    },
    '24hr-livein': {
        title: '24hr Live-in Care',
        subtitle: 'Round-the-clock residential support',
        price: 3200,
    },
    'custom-care': {
        title: 'Custom Care Plan',
        subtitle: 'Flexible care tailored to your needs',
        price: null,
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
        packageDetails,
        isIVService,
        insuranceDetails,
        isEmergency,
    } = location.state || {};

    // Determine if this is a plan purchase or service booking
    const isPlanPurchase = planType === 'insurance' || planType === 'membership' || planType === 'treatment-package' || isPackage;

    // For service bookings, use the old logic
    const service = serviceId ? serviceDetails[serviceId] : null;

    // Is this a service/medicine that needs doctor review after payment?
    // Nursing services: always need review.
    // Medicine: needs review ONLY if cart has Rx items.
    // Emergency: NO review (nurse goes immediately)
    const needsDoctorReview = !isPlanPurchase && !isEmergency && planType !== 'lab-test' && (
        location.state?.isMedicineOrder ? location.state?.cartHasRx : true
    );

    // Calculate pricing
    const subtotal = price || stateTotal || (service?.price || 0);
    const gst = Math.round(subtotal * 0.18);
    const serviceFee = 0;
    const total = subtotal + gst + serviceFee;

    const [selectedPayment, setSelectedPayment] = useState('gpay');

    const handlePayment = async () => {
        try {
            // ── Resolve user identity ──────────────────────────────────────────────
            const { data: { session } } = await supabase.auth.getSession();
            const localUser = JSON.parse(localStorage.getItem('userData') || '{}');
            const userId = session?.user?.id || localUser?.user_id || localUser?.id;
            const userName = session?.user?.user_metadata?.name
                || localUser?.name || localUser?.full_name
                || session?.user?.email || localUser?.email
                || 'Patient';

            if (!userId) {
                alert('Please login to continue');
                navigate('/login/patient');
                return;
            }

            // ── 1. Save booking to Supabase ─────────────────────────────────────────
            // For nursing services: status = 'pending' → awaiting doctor review after prescription upload
            // Nurses ONLY see 'confirmed' bookings (confirmed = doctor approved)
            let savedBookingId = null;

            const bookingNotes = JSON.stringify({
                patient_name: userName,
                subtotal,
                nurse: nurse?.name || null,
                payment_method: selectedPayment,
                is_medicine_order: location.state?.isMedicineOrder || false,
                is_package: isPackage || false,
                is_emergency: isEmergency || false,
                planType: planType || null,
                insurance_details: insuranceDetails || null,
                prescription_review_pending: needsDoctorReview,
            });

            const { data: inserted, error: bookingErr } = await supabase
                .from('bookings')
                .insert([{
                    user_id: userId,
                    service_name: serviceType || service?.title,
                    date: date
                        ? new Date(date).toISOString().split('T')[0]
                        : new Date().toISOString().split('T')[0],
                    time: time || '09:00 AM',
                    total_price: total,
                    status: needsDoctorReview ? 'pending' : 'confirmed',   // pending until doctor approves if review needed
                    notes: bookingNotes,
                }])
                .select('id')
                .single();

            if (bookingErr) {
                console.error('Booking insert failed:', bookingErr.message);
            } else {
                savedBookingId = inserted.id;
            }

            // ── 2. Loyalty points ────────────────────────────────────────────────────
            const pointsEarned = Math.round((total || 0) / 10);
            const currentPointsStr = localStorage.getItem('loyaltyPoints');
            const existingPoints = (currentPointsStr === 'NaN' || !currentPointsStr) ? 0 : parseInt(currentPointsStr, 10) || 0;
            const newTotal = existingPoints + (isNaN(pointsEarned) ? 0 : pointsEarned);

            localStorage.setItem('loyaltyPoints', String(newTotal));
            if (newTotal >= 500) {
                localStorage.setItem('loyaltyReward', '1-free-short-visit');
            }

            // Remove used reward from localStorage
            if (location.state?.usedReward) {
                localStorage.removeItem('loyaltyReward');
            }

            // ── 3. Route appropriately ──────────────────────────────────────────────
            if (needsDoctorReview && savedBookingId) {
                // NURSING SERVICE FLOW:
                // Payment done → Now ask user to upload prescription → Doctor reviews → Nurse assigned
                navigate('/upload-prescription', {
                    state: {
                        serviceType: serviceType || service?.title,
                        price: subtotal,
                        date,
                        time,
                        nurse,
                        isIVService,
                        isPackage,
                        packageDetails,
                        bookingId: savedBookingId,        // link prescription to booking
                        paymentDone: true,                // flag: payment already completed
                        paymentAmount: total,
                        paymentMethod: selectedPayment,
                        isMedicineOrder: location.state?.isMedicineOrder,
                        cartItems: location.state?.cartItems,
                    },
                });
            } else {
                // PLAN / MEDICINE ORDER FLOW: go straight to success
                navigate('/payment-success', {
                    state: {
                        serviceType: serviceType || service?.title,
                        price: subtotal,
                        planType: planType || (isPackage ? 'treatment-package' : 'service'),
                        coverage,
                        planDetails,
                        amount: total,
                        bookingId: savedBookingId || `BK-${Date.now()}`,
                        supabaseBookingId: savedBookingId,
                        date,
                        time,
                        nurse,
                        isMedicineOrder: location.state?.isMedicineOrder,
                        cartItems: location.state?.cartItems,
                        prescriptionPending: false,
                    },
                });
            }

        } catch (error) {
            alert('Failed to complete booking: ' + error.message);
        }
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

                {/* Doctor Review Notice — shown only for nursing services */}
                {needsDoctorReview && (
                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                        <div className="flex gap-3 items-start">
                            <span className="text-2xl leading-none">📋</span>
                            <div>
                                <p className="text-sm font-bold text-amber-900">How it works</p>
                                <ol className="mt-1 space-y-1 text-xs font-medium text-amber-700 list-decimal list-inside leading-relaxed">
                                    <li>Pay now to confirm your {location.state?.isMedicineOrder ? 'order' : 'slot'}</li>
                                    <li>Upload your prescription after payment</li>
                                    <li>Doctor reviews &amp; approves</li>
                                    <li>{location.state?.isMedicineOrder ? 'Order placed once approved' : 'Nurse is assigned once approved'}</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                )}

                {/* Service Summary */}
                <div className="bg-white rounded-2xl p-5 shadow-premium border border-slate-100/50">
                    <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">
                                {isPlanPurchase
                                    ? (planType === 'insurance' ? 'INSURANCE PLAN' : (planType === 'treatment-package' || isPackage) ? 'TREATMENT PACKAGE' : 'MEMBERSHIP PLAN')
                                    : planType === 'lab-test' ? 'LAB TEST'
                                        : location.state?.isMedicineOrder ? 'MEDICINE ORDER'
                                            : 'SERVICE BOOKING'}
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
                                        <span className="text-xs font-medium">{date || 'Today'}</span>
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
                                {isPlanPurchase
                                    ? (planType === 'insurance' ? '🛡️' : (planType === 'treatment-package' || isPackage) ? '💊' : planDetails?.id === 'platinum' ? '👑' : planDetails?.id === 'gold' ? '💎' : '⭐')
                                    : location.state?.isMedicineOrder ? '💊' : '👩‍⚕️'}
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
            </main>

            {/* Fixed Bottom Button */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-slate-100 px-5 py-4">
                <button
                    onClick={handlePayment}
                    className="w-full bg-primary text-white px-6 py-4 rounded-2xl text-base font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                    <Shield className="w-5 h-5" />
                    {needsDoctorReview ? `Pay & Upload Prescription • ₹${total.toLocaleString()}` : `Secure Payment • ₹${total.toLocaleString()}`}
                </button>
            </div>
        </div>
    );
}
