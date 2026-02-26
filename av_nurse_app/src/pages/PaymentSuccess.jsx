import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Calendar, Clock, CheckCircle2, Shield, Download, FileText, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

export default function PaymentSuccess() {
    const navigate = useNavigate();
    const location = useLocation();

    // Track booking status in realtime
    const [currentStatus, setCurrentStatus] = useState(location.state?.prescriptionPending ? 'awaiting_doctor' : 'confirmed');
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
    const isMedicineOrderType = isMedicineOrder || planType === 'medicine-order';
    // isNursingService = actual nursing service booking (not medicine, not insurance, not package)
    const isNursingService = !isInsurance && !isMembership && !isTreatmentPackage && !isMedicineOrderType;
    const isService = !isInsurance && !isMembership && !isTreatmentPackage; // generic (medicine + nursing)

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

    // Track status in realtime if this is a nursing service that requires review
    useEffect(() => {
        const realBookingId = location.state?.bookingId || location.state?.supabaseBookingId;
        if (!realBookingId) return;

        const fetchStatus = async () => {
            const { data } = await supabase.from('bookings').select('status').eq('id', realBookingId).single();
            if (data?.status) setCurrentStatus(data.status);
        };
        fetchStatus();

        const channel = supabase
            .channel(`status-check-${realBookingId}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${realBookingId}` },
                (payload) => {
                    if (payload.new.status) setCurrentStatus(payload.new.status);
                })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [location.state?.bookingId, location.state?.supabaseBookingId]);

    const handleTrackService = () => {
        navigate('/service-tracking', {
            state: {
                serviceType: serviceType,
                providerName: location.state?.nurse?.name || (isMedicineOrder ? 'Pharmacy Delivery' : 'Sister Priya Sharma'),
                isMedicineOrder: isMedicineOrder,
                // pass the Supabase UUID so ServiceTracking can poll the real booking
                bookingId: location.state?.supabaseBookingId || null,
                prescriptionPending: location.state?.prescriptionPending || false,
            }
        });
    };

    // ── Invoice Download ──────────────────────────────────────────────────
    const generateInvoice = () => {
        const invoiceDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        const invoiceTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        const subtotal = price || 0;
        const gst = Math.round(subtotal * 0.18);
        const grandTotal = subtotal + gst;
        const paymentMethod = location.state?.paymentMethod || 'UPI';
        const patientName = JSON.parse(localStorage.getItem('userData') || '{}')?.name || 'Patient';

        const itemsHtml = cartItems ? cartItems.map(item => `
            <tr>
                <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#334155">${item.name}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;text-align:center">${item.quantity}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#334155;text-align:right;font-weight:600">₹${(item.price * item.quantity).toLocaleString()}</td>
            </tr>
        `).join('') : `
            <tr>
                <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#334155">${serviceType}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;text-align:center">1</td>
                <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#334155;text-align:right;font-weight:600">₹${subtotal.toLocaleString()}</td>
            </tr>
        `;

        const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice - ${bookingId}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Inter',sans-serif; background:#f8fafc; padding:40px 20px; }
        .invoice { max-width:600px; margin:0 auto; background:#fff; border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,0.06); overflow:hidden; }
        .header { background:linear-gradient(135deg,#0d9488,#14b8a6); padding:32px; color:#fff; }
        .header h1 { font-size:28px; font-weight:800; margin-bottom:4px; }
        .header p { font-size:13px; opacity:0.85; }
        .badge { display:inline-block; background:rgba(255,255,255,0.2); padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; margin-top:12px; }
        .body { padding:32px; }
        .meta { display:flex; justify-content:space-between; flex-wrap:wrap; gap:16px; margin-bottom:28px; padding-bottom:20px; border-bottom:2px solid #f1f5f9; }
        .meta-item label { display:block; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#94a3b8; margin-bottom:4px; }
        .meta-item span { font-size:14px; font-weight:600; color:#1e293b; }
        table { width:100%; border-collapse:collapse; margin-bottom:24px; }
        thead th { padding:10px 12px; background:#f8fafc; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#94a3b8; text-align:left; }
        thead th:last-child { text-align:right; }
        thead th:nth-child(2) { text-align:center; }
        .totals { background:#f8fafc; border-radius:12px; padding:20px; margin-bottom:24px; }
        .totals .row { display:flex; justify-content:space-between; padding:6px 0; font-size:13px; color:#64748b; }
        .totals .row span:last-child { font-weight:600; color:#334155; }
        .totals .grand { border-top:2px solid #e2e8f0; margin-top:8px; padding-top:12px; font-size:18px; font-weight:800; color:#0f172a; }
        .footer { text-align:center; padding:20px 32px 32px; color:#94a3b8; font-size:12px; }
        .footer .thankyou { font-size:15px; font-weight:700; color:#0d9488; margin-bottom:8px; }
        .print-btn { display:block; margin:20px auto; padding:12px 32px; background:#0d9488; color:#fff; border:none; border-radius:12px; font-size:14px; font-weight:700; cursor:pointer; font-family:'Inter',sans-serif; }
        .print-btn:hover { background:#0f766e; }
        @media print { .print-btn { display:none !important; } body { background:#fff; padding:0; } .invoice { box-shadow:none; } }
    </style>
</head>
<body>
    <div class="invoice">
        <div class="header">
            <h1>NurseHome</h1>
            <p>Healthcare at Your Doorstep</p>
            <div class="badge">TAX INVOICE</div>
        </div>
        <div class="body">
            <div class="meta">
                <div class="meta-item">
                    <label>Invoice ID</label>
                    <span>${bookingId}</span>
                </div>
                <div class="meta-item">
                    <label>Date</label>
                    <span>${invoiceDate}</span>
                </div>
                <div class="meta-item">
                    <label>Time</label>
                    <span>${invoiceTime}</span>
                </div>
                <div class="meta-item">
                    <label>Patient</label>
                    <span>${patientName}</span>
                </div>
                <div class="meta-item">
                    <label>Payment</label>
                    <span>${paymentMethod.toUpperCase()}</span>
                </div>
                <div class="meta-item">
                    <label>Status</label>
                    <span style="color:#059669">✓ Paid</span>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Service / Item</th>
                        <th>Qty</th>
                        <th style="text-align:right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <div class="totals">
                <div class="row"><span>Subtotal</span><span>₹${subtotal.toLocaleString()}</span></div>
                <div class="row"><span>GST (18%)</span><span>₹${gst.toLocaleString()}</span></div>
                <div class="row"><span>Service Fee</span><span>₹0</span></div>
                <div class="row grand"><span>Total Paid</span><span>₹${grandTotal.toLocaleString()}</span></div>
            </div>
        </div>
        <div class="footer">
            <p class="thankyou">Thank you for choosing NurseHome! 🙏</p>
            <p>For support, contact us at support@nursehome.in</p>
            <p style="margin-top:4px">This is a computer-generated invoice.</p>
        </div>
    </div>
    <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
</body>
</html>`;

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    }; return (
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
                                    ? 'Your treatment package has been booked. Our team will contact you shortly.'
                                    : isMedicineOrderType
                                        ? 'Your order has been placed successfully. You can track its delivery below.'
                                        : 'Your booking has been confirmed. A nurse will be assigned to your request shortly.'}
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
                                {isMedicineOrderType ? (
                                    <span className="text-3xl">💊</span>
                                ) : isNursingService ? (
                                    <img
                                        src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop"
                                        alt="Nurse"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-3xl">🏥</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                                    {serviceType}
                                </h3>
                                <p className="text-sm font-medium text-primary mt-0.5">
                                    {isMedicineOrderType
                                        ? `${cartItems?.length || 0} Items Ordered`
                                        : isNursingService
                                            ? 'Professional Nursing Care'
                                            : 'Healthcare Service'}
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

                        {/* Doctor Review / Approval banner */}
                        {((location.state?.prescriptionPending && currentStatus === 'awaiting_doctor') || currentStatus === 'pending') && (
                            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start animate-in fade-in zoom-in">
                                <span className="text-2xl leading-none">📋</span>
                                <div>
                                    <p className="text-sm font-extrabold text-amber-900">Doctor Review Pending</p>
                                    <p className="text-[11px] font-medium text-amber-700 mt-1 leading-relaxed opacity-90">
                                        Your booking has been sent for doctor review. A doctor will verify your requirements before the nurse is dispatched. You will be notified once approved.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Approved Banner */}
                        {(currentStatus === 'confirmed' || currentStatus === 'doctor_approved') && (
                            <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3 items-start animate-in fade-in slide-in-from-top-2 duration-300">
                                <span className="text-2xl leading-none">✅</span>
                                <div>
                                    <p className="text-sm font-extrabold text-emerald-900 leading-tight">Approved</p>
                                    <p className="text-[11px] font-medium text-emerald-700 mt-0.5">
                                        Your prescription has been verified! A nurse is now being assigned to your location.
                                    </p>
                                </div>
                            </div>
                        )}
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
                        onClick={generateInvoice}
                        className="w-full bg-blue-500 text-white px-6 py-4 rounded-2xl text-base font-bold shadow-lg shadow-blue-500/25 hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <Download className="w-5 h-5" />
                        Download Policy Document
                    </button>
                )}
                {isMembership && (
                    <button
                        onClick={generateInvoice}
                        className="w-full bg-primary text-white px-6 py-4 rounded-2xl text-base font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                        <FileText className="w-5 h-5" />
                        Download Invoice
                    </button>
                )}
                {/* Track button — only for nursing services and medicine orders, NOT for lab/packages/insurance */}
                {isNursingService && (
                    <button
                        onClick={handleTrackService}
                        className="w-full bg-primary text-white px-6 py-4 rounded-2xl text-base font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                        <Navigation className="w-5 h-5" />
                        Track My Nurse
                    </button>
                )}
                {isMedicineOrderType && (
                    <button
                        onClick={handleTrackService}
                        className="w-full bg-primary text-white px-6 py-4 rounded-2xl text-base font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                        <Navigation className="w-5 h-5" />
                        Track My Order
                    </button>
                )}
                {/* Universal Download Invoice — optional for all users */}
                {!isInsurance && !isMembership && (
                    <button
                        onClick={generateInvoice}
                        className="w-full bg-white text-slate-700 px-6 py-4 rounded-2xl text-base font-bold border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <Download className="w-5 h-5 text-slate-500" />
                        Download Invoice
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
