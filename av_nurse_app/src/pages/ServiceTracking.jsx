import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Phone, MessageCircle, Navigation, Clock, MapPin, Truck, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { cn } from '../lib/utils';

// Map nurse tracking_status → user-visible step index (0-based)
const STEPS = [
    { label: 'Booking Confirmed', emoji: '✅', nurseKey: null, bookingStatuses: ['pending', 'confirmed', 'upcoming', 'completed'] },
    { label: 'Prescription Submitted', emoji: '📋', nurseKey: null, bookingStatuses: ['pending', 'confirmed', 'upcoming', 'completed'] },
    { label: 'Nurse Assigned', emoji: '👩‍⚕️', nurseKey: null, bookingStatuses: ['confirmed', 'upcoming', 'completed'] },
    { label: 'Collecting Supplies 🏪', emoji: '🏪', nurseKey: 'to_godown', bookingStatuses: ['confirmed', 'upcoming', 'completed'] },
    { label: 'Supplies Ready, Heading Out', emoji: '🎒', nurseKey: 'items_picked', bookingStatuses: ['confirmed', 'upcoming', 'completed'] },
    { label: 'Nurse On The Way 🚗', emoji: '🚗', nurseKey: 'on_the_way', bookingStatuses: ['confirmed', 'upcoming', 'completed'] },
    { label: 'Nurse Arrived 📍', emoji: '📍', nurseKey: 'arrived', bookingStatuses: ['confirmed', 'upcoming', 'completed'] },
    { label: 'Service Completed', emoji: '🎉', nurseKey: null, bookingStatuses: ['completed'] },
];

const MEDICINE_STEPS = [
    { label: 'Order Placed', emoji: '💊', nurseKey: null },
    { label: 'Prescription Verified', emoji: '📋', nurseKey: null },
    { label: 'Order Processing', emoji: '🏭', nurseKey: 'to_godown' },
    { label: 'Order Packed', emoji: '📦', nurseKey: 'items_picked' },
    { label: 'Out for Delivery', emoji: '🚚', nurseKey: 'on_the_way' },
    { label: 'Arriving Soon', emoji: '📍', nurseKey: 'arrived' },
    { label: 'Delivered', emoji: '🏠', nurseKey: null, bookingStatuses: ['completed'] },
];

function getActiveStepIndex(trackingStatus, bookingStatus, isMedicine) {
    if (bookingStatus === 'completed') return isMedicine ? 6 : 7;
    if (trackingStatus === 'arrived') return isMedicine ? 5 : 6;
    if (trackingStatus === 'on_the_way') return isMedicine ? 4 : 5;
    if (trackingStatus === 'items_picked') return isMedicine ? 3 : 4;
    if (trackingStatus === 'to_godown') return isMedicine ? 2 : 3;

    // For medicine, if it's confirmed but no tracking yet, it's at 'Verified'
    if (isMedicine) {
        if (bookingStatus === 'confirmed' || bookingStatus === 'upcoming') return 1;
        return 0;
    }

    // nurse accepted (confirmed) but not yet moved
    if (bookingStatus === 'confirmed' || bookingStatus === 'upcoming') return 2;
    // pending — booking confirmed, waiting for nurse
    return 1;
}

const progressForStep = [10, 20, 30, 45, 60, 75, 88, 100];
const medicineProgress = [15, 30, 45, 60, 75, 90, 100];

const ETA_LABELS = {
    null: 'Awaiting confirmation',
    to_godown: 'Preparing your order',
    items_picked: 'Order is packed',
    on_the_way: 'Out for delivery',
    arrived: 'Arriving very soon',
};

export default function ServiceTracking() {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        serviceType = 'Nursing Care',
        providerName = 'Your Provider',
        isMedicineOrder: initialIsMedicineOrder = false,
        bookingId,
        initialBookingStatus,
        initialTrackingStatus,
    } = location.state || {};

    const [resolvedBookingId, setResolvedBookingId] = useState(bookingId || null);
    const [trackingStatus, setTrackingStatus] = useState(initialTrackingStatus ?? null);
    const [bookingStatus, setBookingStatus] = useState(initialBookingStatus || 'confirmed');
    const [assignedNurse, setAssignedNurse] = useState(providerName);
    const [isMedicineOrder, setIsMedicineOrder] = useState(initialIsMedicineOrder);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const applyBookingData = (data) => {
        if (!data) return;
        let notesObj = {};
        try { notesObj = JSON.parse(data.notes || '{}'); } catch (_) { }
        // tracking_status lives ONLY in the notes JSON (no dedicated DB column yet)
        const ts = notesObj.tracking_status || null;
        console.log('[ServiceTracking] applyBookingData → status:', data.status, '| tracking:', ts, '| notes:', notesObj);

        const isMed = notesObj.is_medicine_order || false;
        setIsMedicineOrder(isMed);
        setTrackingStatus(ts);
        setBookingStatus(data.status || 'confirmed');

        if (notesObj.assigned_nurse_name) {
            setAssignedNurse(notesObj.assigned_nurse_name);
        } else if (isMed) {
            setAssignedNurse('Pharmacy Team');
        }

        setLastUpdated(new Date());
        setLoading(false);
    };

    // ── Core fetch — avoids .single() which throws 406 on RLS blocks ────────
    const fetchBooking = async () => {
        // Path A: we know the booking ID (fastest — passed from Home.jsx or cached)
        if (resolvedBookingId) {
            // NOTE: Only select columns that exist in the DB schema (no tracking_status column yet)
            const { data, error } = await supabase
                .from('bookings')
                .select('id, status, notes')
                .eq('id', resolvedBookingId)
                .limit(1);

            if (!error && data && data.length > 0) {
                console.log('[ServiceTracking] Path A raw row:', data[0]);
                applyBookingData(data[0]);
                return;
            }
            if (error) console.warn('[ServiceTracking] Path A error:', error.message);
        }

        // Path B: look up using every possible UID source
        const { data: { session } } = await supabase.auth.getSession();
        const localUser = JSON.parse(localStorage.getItem('userData') || '{}');
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const uid =
            session?.user?.id ||
            localUser?.user_id ||
            localUser?.id ||
            userData?.user_id ||
            userData?.id ||
            null;

        if (!uid) { console.warn('[ServiceTracking] No UID found'); setLoading(false); return; }

        const { data: rows, error: rowErr } = await supabase
            .from('bookings')
            .select('id, status, notes')
            .eq('user_id', uid)
            .not('status', 'in', '("cancelled","completed")')
            .order('created_at', { ascending: false })
            .limit(1);

        if (rowErr) { console.warn('[ServiceTracking] Path B error:', rowErr.message); setLoading(false); return; }

        if (rows && rows.length > 0) {
            if (!resolvedBookingId) setResolvedBookingId(rows[0].id);
            applyBookingData(rows[0]);
        } else {
            setLoading(false);
        }
    };

    // ── Poll every 2 s — nurse updates appear within 2 seconds ──────────────
    useEffect(() => {
        fetchBooking();
        const interval = setInterval(fetchBooking, 2000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedBookingId]);

    // ── Supabase Realtime — now triggers a full RE-FETCH for reliability ──
    useEffect(() => {
        if (!resolvedBookingId) return;
        const channel = supabase
            .channel(`svc-track-live-${resolvedBookingId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'bookings',
                filter: `id=eq.${resolvedBookingId}`,
            }, () => {
                console.log('[ServiceTracking] Booking updated in DB — re-fetching data...');
                fetchBooking(); // Full refresh ensures we get the latest notes JSON
            })
            .subscribe((status) => {
                console.log('[ServiceTracking] Realtime channel status:', status);
            });
        return () => { supabase.removeChannel(channel); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedBookingId]);



    const activeStep = getActiveStepIndex(trackingStatus, bookingStatus, isMedicineOrder);
    const progress = isMedicineOrder
        ? (medicineProgress[activeStep] ?? 10)
        : (progressForStep[activeStep] ?? 10);

    // ── Completed screen ────────────────────────────────────────────────────────
    if (!loading && bookingStatus === 'completed') {
        return (
            <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto items-center justify-center px-6">
                {/* Big checkmark circle */}
                <div className="flex size-28 items-center justify-center rounded-full bg-emerald-100 shadow-lg shadow-emerald-100 mb-6">
                    <CheckCircle className="w-14 h-14 text-emerald-500" />
                </div>

                <h1 className="text-2xl font-extrabold text-slate-900 text-center mb-2">{isMedicineOrder ? 'Order Delivered! 📦' : 'Service Completed! 🎉'}</h1>
                <p className="text-sm text-slate-500 text-center mb-8 leading-relaxed">
                    {isMedicineOrder
                        ? 'Your medicine order has been delivered successfully. Thank you for choosing us!'
                        : 'Your nurse has successfully completed the service. We hope you had a great experience!'}
                </p>

                {/* Summary card */}
                <div className="w-full bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">
                            {isMedicineOrder ? '💊' : '👩‍⚕️'}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">{assignedNurse}</p>
                            <p className="text-xs text-emerald-600 font-medium">{isMedicineOrder ? 'Medicine Order' : serviceType}</p>
                        </div>
                        <span className="ml-auto px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-lg border border-emerald-200">
                            ✅ {isMedicineOrder ? 'Delivered' : 'Done'}
                        </span>
                    </div>
                    <div className="h-px bg-slate-100" />
                    <p className="text-xs text-slate-500 text-center">Service tracking is no longer available for completed bookings.</p>
                </div>

                {/* CTA buttons */}
                <button
                    onClick={() => navigate('/bookings', { state: { tab: 'completed' } })}
                    className="w-full h-12 bg-emerald-500 text-white rounded-2xl font-bold text-sm hover:bg-emerald-600 active:scale-95 transition-all shadow-md shadow-emerald-200 mb-3"
                >
                    View in Completed Bookings
                </button>
                <button
                    onClick={() => navigate('/home')}
                    className="w-full h-12 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 active:scale-95 transition-all"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 pt-12 pb-4 px-5">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Track {isMedicineOrder ? 'Order' : 'Service'}</h1>
                    <div className="w-10" />
                </div>
            </header>


            {/* Animated Map Area */}
            <div className="relative h-[220px] bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
                        {[...Array(48)].map((_, i) => (
                            <div key={i} className="border border-slate-300" />
                        ))}
                    </div>
                </div>
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path
                        d="M 20 80 Q 40 60, 50 50 T 80 20"
                        stroke={isMedicineOrder ? '#3B82F6' : '#0D9488'}
                        strokeWidth="0.5"
                        fill="none"
                        strokeDasharray="2,2"
                        opacity="0.6"
                    />
                </svg>

                {/* Home pin */}
                <div className="absolute top-[15%] right-[15%] flex flex-col items-center">
                    <div className="relative flex size-10 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg">
                        <MapPin className="w-5 h-5 fill-white" />
                    </div>
                    <div className="mt-1 bg-white px-2 py-0.5 rounded-lg shadow-md">
                        <p className="text-[10px] font-bold text-slate-900">Your Home</p>
                    </div>
                </div>

                {/* Nurse / delivery pin */}
                <div className="absolute bottom-[25%] left-[40%] flex flex-col items-center animate-bounce">
                    <div className="relative flex size-12 items-center justify-center rounded-full bg-white border-4 border-secondary shadow-lg overflow-hidden">
                        {isMedicineOrder ? (
                            <div className="bg-blue-100 w-full h-full flex items-center justify-center text-blue-600">
                                <Truck className="w-6 h-6" />
                            </div>
                        ) : (
                            <div className="bg-emerald-100 w-full h-full flex items-center justify-center text-emerald-700 font-bold text-lg">
                                👩‍⚕️
                            </div>
                        )}
                    </div>
                    <div className="mt-1 bg-secondary px-2 py-0.5 rounded-lg shadow-md">
                        <p className="text-[10px] font-bold text-white flex items-center gap-1">
                            <Navigation className="w-2.5 h-2.5" />
                            {isMedicineOrder ? 'Delivering' : (ETA_LABELS[trackingStatus] || 'On the way')}
                        </p>
                    </div>
                </div>

                {/* ETA badge */}
                <div className="absolute top-3 left-3 bg-white rounded-xl px-3 py-1.5 shadow-lg border border-slate-100">
                    <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-teal-500" />
                        <div>
                            <p className="text-[9px] font-semibold text-slate-500 uppercase">Status</p>
                            <p className="text-xs font-bold text-slate-900">
                                {bookingStatus === 'completed' ? 'Completed ✅' : (ETA_LABELS[trackingStatus] || 'Nurse assigned')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Live indicator */}
                {!loading && (
                    <div className="absolute top-3 right-3 bg-white rounded-xl px-2 py-1 shadow border border-slate-100 flex items-center gap-1.5">
                        <span className="relative flex size-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                            <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
                        </span>
                        <span className="text-[9px] font-bold text-emerald-600">LIVE</span>
                    </div>
                )}
            </div>

            <main className="flex-1 px-5 py-4 space-y-4 pb-24">
                {/* Provider card */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl">
                                {isMedicineOrder ? '🚚' : '👩‍⚕️'}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">{assignedNurse}</h3>
                                <p className="text-xs text-teal-600 font-medium">{isMedicineOrder ? 'Delivery Executive' : serviceType}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">⭐ 4.9 • Verified</p>
                            </div>
                        </div>
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-200">
                            Verified
                        </span>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <a
                            href="tel:+919876543210"
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 active:scale-95 transition-all"
                        >
                            <Phone className="w-4 h-4" /> Call
                        </a>
                        <a
                            href="sms:+919876543210"
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 active:scale-95 transition-all"
                        >
                            <MessageCircle className="w-4 h-4" /> Message
                        </a>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-slate-900">
                            {isMedicineOrder ? 'Delivery Progress' : 'Service Progress'}
                        </h4>
                        <span className="text-sm font-bold text-teal-600">{progress}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-700 ease-in-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    {lastUpdated && (
                        <p className="text-[10px] text-slate-400 mt-1.5">
                            Last updated: {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                    )}
                </div>

                {/* Live Timeline */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <h4 className="text-sm font-bold text-slate-900 mb-4">Live Timeline</h4>
                    <div className="space-y-0">
                        {(isMedicineOrder ? MEDICINE_STEPS : STEPS).map((step, index) => {
                            const isDone = index < activeStep;
                            const isActive = index === activeStep;
                            const isUpcoming = index > activeStep;
                            return (
                                <div key={index} className="flex items-start gap-3">
                                    {/* Icon column */}
                                    <div className="flex flex-col items-center">
                                        <div className={cn(
                                            'flex size-8 items-center justify-center rounded-full text-sm shrink-0 transition-all',
                                            isDone ? 'bg-teal-500 text-white shadow-sm shadow-teal-200' :
                                                isActive ? 'bg-amber-400 text-white animate-pulse shadow-sm shadow-amber-200' :
                                                    'bg-slate-100 text-slate-400'
                                        )}>
                                            {isDone ? <CheckCircle className="w-4 h-4" /> : step.emoji}
                                        </div>
                                        {index < (isMedicineOrder ? MEDICINE_STEPS : STEPS).length - 1 && (
                                            <div className={cn(
                                                'w-0.5 h-8 mt-1 transition-all',
                                                isDone ? 'bg-teal-400' : 'bg-slate-200'
                                            )} />
                                        )}
                                    </div>
                                    {/* Label */}
                                    <div className={cn(
                                        'flex-1 pb-4 pt-1',
                                        isUpcoming ? 'opacity-40' : ''
                                    )}>
                                        <p className={cn(
                                            'text-sm font-bold',
                                            isActive ? 'text-amber-600' :
                                                isDone ? 'text-slate-900' : 'text-slate-500'
                                        )}>
                                            {step.label}
                                            {isActive && <span className="ml-2 text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">NOW</span>}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}
