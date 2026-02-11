import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Calendar, Clock, CheckCircle2, Shield, Download, FileText, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentSuccess() {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        serviceType = 'Service',
        price = 0,
        planType = 'service',
        coverage = '',
        planDetails = {},
        bookingId = 'MD-' + Math.floor(Math.random() * 100000),
        cartItems,
        isMedicineOrder
    } = location.state || {};

    const isInsurance = planType === 'insurance';
    const isMembership = planType === 'membership';
    const isTreatmentPackage = planType === 'treatment-package';
    const isService = !isInsurance && !isMembership && !isTreatmentPackage;

    // Generate policy/membership number
    const policyNumber = isInsurance
        ? 'POL-' + Math.floor(Math.random() * 1000000000)
        : isMembership
            ? 'MEM-' + Math.floor(Math.random() * 1000000)
            : bookingId;

    useEffect(() => {
        // Save booking data to localStorage
        const saveBooking = () => {
            try {
                const existingBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');

                // Check if this booking ID already exists to prevent duplicates on refresh
                const exists = existingBookings.some(b => b.id === (isInsurance || isMembership ? policyNumber : bookingId));

                if (!exists) {
                    const newBooking = {
                        id: isInsurance || isMembership ? policyNumber : bookingId,
                        type: planType, // 'service', 'insurance', 'membership', 'treatment-package'
                        serviceType: serviceType,
                        serviceName: serviceType, // For consistency
                        date: location.state?.date || new Date().toISOString(),
                        time: location.state?.time || '08:00 AM',
                        price: price,
                        status: 'confirmed', // or 'active'
                        provider: location.state?.nurse ? location.state.nurse.name : (isMedicineOrder ? 'Pharmacy Delivery' : 'Assigning...'),
                        image: location.state?.nurse?.image || (isMedicineOrder ? 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=200&h=200&fit=crop' : 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop'),
                        isMedicineOrder: isMedicineOrder,
                        items: cartItems,
                        timestamp: Date.now(),
                        // Save doctor notes
                        doctorNotes: location.state?.doctorNotes,
                        diagnosis: location.state?.diagnosis,
                        recommendations: location.state?.recommendations,
                        doctorPrescription: location.state?.doctorPrescription,
                        // CRITICAL: Save full nurse object for Nurse Dashboard
                        nurse: location.state?.nurse
                    };

                    const updatedBookings = [newBooking, ...existingBookings];
                    localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
                }
            } catch (error) {
                console.error('Error saving booking:', error);
            }
        };

        saveBooking();
    }, [bookingId, policyNumber, planType, serviceType, price, location.state, isInsurance, isMembership, isMedicineOrder, cartItems]);

    const handleTrackService = () => {
        navigate('/service-tracking', {
            state: {
                serviceType: serviceType,
                providerName: location.state?.nurse?.name || (isMedicineOrder ? 'Pharmacy Delivery' : 'Sister Priya Sharma'),
                isMedicineOrder: isMedicineOrder,
                status: 'confirmed'
            }
        });
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto p-5">
            {/* Close Button */}
            <button
                onClick={() => navigate('/home')}
                className="absolute top-8 right-5 flex size-10 items-center justify-center rounded-full bg-white shadow-soft text-slate-700 hover:bg-slate-50 transition-colors z-10"
            >
                <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 pb-20">
                {/* Success Animation */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.6 }}
                    className="relative"
                >
                    <div className={`absolute inset-0 ${isInsurance ? 'bg-blue-500/20' : 'bg-primary/20'} rounded-full blur-2xl`} />
                    <div className={`relative ${isInsurance ? 'bg-blue-500' : 'bg-primary'} rounded-full p-6`}>
                        <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={2.5} />
                    </div>
                </motion.div>

                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center space-y-2"
                >
                    <h1 className="text-3xl font-extrabold text-slate-900">
                        {isInsurance ? 'Policy Activated!' : isMembership ? 'Membership Active!' : isTreatmentPackage ? 'Package Booked!' : 'Payment Successful'}
                    </h1>
                    <p className="text-base font-medium text-slate-500 max-w-sm">
                        {isInsurance
                            ? 'Your health insurance policy is now active and ready to protect you.'
                            : isMembership
                                ? 'Your membership has been activated. Enjoy exclusive benefits!'
                                : isTreatmentPackage
                                    ? 'Your treatment package has been booked. A nurse has been assigned.'
                                    : isMedicineOrder
                                        ? 'Your order has been placed successfully. You can track its status below.'
                                        : 'Your booking has been confirmed. A professional is being assigned to your request.'}
                    </p>
                </motion.div>

                {/* Insurance Policy Card */}
                {isInsurance && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="w-full space-y-3"
                    >
                        {/* Policy Header */}
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex size-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                    <Shield className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider opacity-90">Insurance Policy</p>
                                    <p className="text-lg font-extrabold">{serviceType}</p>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                                <p className="text-xs font-bold uppercase tracking-wider opacity-80">Policy Number</p>
                                <p className="text-xl font-extrabold mt-1">{policyNumber}</p>
                            </div>
                        </div>

                        {/* Policy Details */}
                        <div className="bg-white rounded-2xl p-6 shadow-premium border border-slate-100/50 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                                    POLICY DETAILS
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-blue-50 rounded-xl p-3">
                                    <p className="text-xs font-bold text-blue-900 uppercase">Coverage</p>
                                    <p className="text-lg font-extrabold text-blue-600 mt-1">₹{coverage}</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-3">
                                    <p className="text-xs font-bold text-slate-600 uppercase">Premium</p>
                                    <p className="text-lg font-extrabold text-slate-900 mt-1">₹{price}/mo</p>
                                </div>
                            </div>

                            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <p className="text-xs font-bold text-emerald-900">Policy Active from Today</p>
                                </div>
                                <p className="text-xs font-medium text-emerald-700 mt-1">
                                    Valid for 12 months • Auto-renewal enabled
                                </p>
                            </div>

                            {planDetails.features && (
                                <div className="pt-2">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Key Benefits</p>
                                    <div className="space-y-2">
                                        {planDetails.features.slice(0, 3).map((feature, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                                <span className="text-xs font-semibold text-slate-700">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Membership Invoice Card */}
                {isMembership && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="w-full bg-white rounded-2xl p-6 shadow-premium border border-slate-100/50 space-y-4"
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <p className="text-xs font-bold uppercase tracking-wider text-primary">
                                MEMBERSHIP INVOICE
                            </p>
                            <p className="text-xs font-semibold text-slate-400">
                                #{policyNumber}
                            </p>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                                <span className="text-3xl">
                                    {planDetails.id === 'platinum' ? '👑' : planDetails.id === 'gold' ? '💎' : '⭐'}
                                </span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                                    {serviceType}
                                </h3>
                                <p className="text-sm font-medium text-primary mt-0.5">
                                    {planDetails.description || 'Premium Healthcare Membership'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-primary/5 rounded-xl p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-600">Plan Price</span>
                                <span className="text-base font-bold text-slate-900">₹{price.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-600">Billing Cycle</span>
                                <span className="text-base font-bold text-slate-900">Monthly</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-600">GST (18%)</span>
                                <span className="text-base font-bold text-slate-900">₹{Math.round(price * 0.18).toLocaleString()}</span>
                            </div>
                            <div className="h-px bg-slate-200 my-2" />
                            <div className="flex items-center justify-between">
                                <span className="text-base font-bold text-slate-900">Total Paid</span>
                                <span className="text-xl font-extrabold text-primary">
                                    ₹{Math.round(price * 1.18).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {planDetails.features && (
                            <div className="pt-2">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Your Benefits</p>
                                <div className="space-y-2">
                                    {planDetails.features.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                            <span className="text-xs font-semibold text-slate-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <p className="text-xs font-bold text-emerald-900">Membership Active</p>
                            </div>
                            <p className="text-xs font-medium text-emerald-700 mt-1">
                                Next billing: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Treatment Package Confirmation Card */}
                {isTreatmentPackage && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="w-full bg-white rounded-2xl p-6 shadow-premium border border-slate-100/50 space-y-4"
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <p className="text-xs font-bold uppercase tracking-wider text-rose-500">
                                PACKAGE BOOKED
                            </p>
                            <p className="text-xs font-semibold text-slate-400">
                                #{policyNumber}
                            </p>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 flex items-center justify-center">
                                <span className="text-3xl">💊</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                                    {serviceType}
                                </h3>
                                <p className="text-sm font-medium text-rose-500 mt-0.5">
                                    {planDetails.duration || 'Treatment Package'}
                                </p>
                            </div>
                        </div>

                        {location.state?.nurse && (
                            <div className="bg-rose-50/50 rounded-xl p-3 border border-rose-100 flex items-center gap-3">
                                <img
                                    src={location.state.nurse.image}
                                    alt={location.state.nurse.name}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase">Assigned Nurse</p>
                                    <p className="text-sm font-bold text-slate-900">{location.state.nurse.name}</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-3">
                                <Calendar className="w-4 h-4 text-rose-500" />
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-slate-400">START DATE</p>
                                    <p className="text-sm font-bold text-slate-900">
                                        {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-3">
                                <Clock className="w-4 h-4 text-rose-500" />
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-slate-400">DURATION</p>
                                    <p className="text-sm font-bold text-slate-900">{planDetails.duration}</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-slate-100 my-2" />

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-600">Amount Paid</span>
                            <span className="text-xl font-extrabold text-slate-900">
                                ₹{price.toLocaleString()}
                            </span>
                        </div>
                    </motion.div>
                )}

                {/* Service Booking / Order Card */}
                {isService && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="w-full bg-white rounded-2xl p-6 shadow-premium border border-slate-100/50 space-y-4"
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <p className="text-xs font-bold uppercase tracking-wider text-primary">
                                {isMedicineOrder ? 'ORDER SUMMARY' : 'BOOKING SUMMARY'}
                            </p>
                            <p className="text-xs font-semibold text-slate-400">
                                ID: #{bookingId}
                            </p>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center overflow-hidden">
                                {isMedicineOrder ? (
                                    <span className="text-3xl">💊</span>
                                ) : (
                                    <img
                                        src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop"
                                        alt="Nurse"
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                                    {serviceType}
                                </h3>
                                <p className="text-sm font-medium text-primary mt-0.5">
                                    {isMedicineOrder
                                        ? `${cartItems?.length || 0} Items Ordered`
                                        : 'Premium Medical Care'}
                                </p>
                            </div>
                        </div>

                        {cartItems ? (
                            <div className="pt-2">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Items</p>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                    {cartItems.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <div>
                                                <span className="font-bold text-slate-700 mr-2">{item.quantity}x</span>
                                                <span className="text-slate-600">{item.name}</span>
                                            </div>
                                            <span className="font-semibold text-slate-900">₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-3">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-slate-400">DATE</p>
                                        <p className="text-sm font-bold text-slate-900">
                                            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-3">
                                    <Clock className="w-4 h-4 text-primary" />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-slate-400">TIME SLOT</p>
                                        <p className="text-sm font-bold text-slate-900">08:00 AM</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="h-px bg-slate-100 my-2" />

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-600">Amount Paid</span>
                            <span className="text-xl font-extrabold text-slate-900">
                                ₹{price.toLocaleString()}
                            </span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-3 pb-6"
            >
                {isInsurance && (
                    <button
                        className="w-full bg-blue-500 text-white px-6 py-4 rounded-2xl text-base font-bold shadow-lg shadow-blue-500/25 hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <Download className="w-5 h-5" />
                        Download Policy Document
                    </button>
                )}
                {isMembership && (
                    <button
                        className="w-full bg-primary text-white px-6 py-4 rounded-2xl text-base font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                        <FileText className="w-5 h-5" />
                        Download Invoice
                    </button>
                )}
                {isService && (
                    <button
                        onClick={handleTrackService}
                        className="w-full bg-primary text-white px-6 py-4 rounded-2xl text-base font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                        <Navigation className="w-5 h-5" />
                        Track {isMedicineOrder ? 'Order' : 'Service'}
                    </button>
                )}
                <button
                    onClick={() => navigate('/home')}
                    className="w-full bg-white text-slate-700 px-6 py-4 rounded-2xl text-base font-bold border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                    Back to Home
                </button>
            </motion.div>
        </div>
    );
}
