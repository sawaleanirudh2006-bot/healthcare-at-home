import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Pill, Calendar, MapPin, FileText, XCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Bookings = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // If navigated from ServiceTracking completion screen, open 'completed' tab
    const [activeTab, setActiveTab] = useState(location.state?.tab || 'upcoming');

    const [profileData] = useState(() => {
        const stored = localStorage.getItem('userProfile');
        return stored ? JSON.parse(stored) : { name: 'User', phone: '', avatar: null };
    });

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // ── Load bookings from Supabase for the logged-in patient ──────────────────
    const loadBookings = async () => {
        try {
            // Prefer Supabase session uid; fall back to uid stored at login
            const { data: { session } } = await supabase.auth.getSession();
            const localUser = JSON.parse(localStorage.getItem('userData') || '{}');
            const uid = session?.user?.id || localUser?.user_id || localUser?.id;

            if (!uid) {
                // No user at all — show empty list (no stale demo data)
                setBookings([]);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .eq('user_id', uid)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mapped = (data || []).map(b => {
                let notesObj = {};
                try { notesObj = JSON.parse(b.notes || '{}'); } catch (_) { }
                return {
                    id: b.id,
                    type: notesObj.is_medicine_order ? 'medicine' : 'service',
                    serviceType: b.service_name || 'Nursing Care',
                    serviceName: b.service_name || 'Home Nursing Service',
                    provider: notesObj.assigned_nurse_name || 'Assigned Nurse',
                    date: b.date || b.created_at,
                    time: b.time || '',
                    status: b.status || 'pending',
                    isMedicineOrder: notesObj.is_medicine_order || false,
                    image: null,
                    rated: b.rated || false,
                    rating: b.rating || null,
                    trackingStatus: notesObj.tracking_status || b.tracking_status || null,
                    bookingId: b.id,
                    rejectionReason: notesObj.refund_reason || null, // re-use refund_reason as rejection reason from doctor review
                };
            });

            setBookings(mapped);
        } catch (err) {
            console.error('Failed to load bookings:', err.message);
            // Fallback to localStorage on error
            const stored = JSON.parse(localStorage.getItem('userBookings') || '[]');
            setBookings(stored);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBookings();
        // Poll every 10 seconds so status updates from nurse reflect promptly
        const interval = setInterval(loadBookings, 10000);
        return () => clearInterval(interval);
    }, []);

    // ── Realtime subscription for instant updates ──────────────────────────────
    useEffect(() => {
        let channel;
        (async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const localUser = JSON.parse(localStorage.getItem('userData') || '{}');
            const uid = session?.user?.id || localUser?.user_id || localUser?.id;
            if (!uid) return;

            channel = supabase
                .channel('patient-bookings')
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'bookings',
                    filter: `user_id=eq.${uid}`,
                }, () => { loadBookings(); })
                .subscribe();
        })();
        return () => { if (channel) supabase.removeChannel(channel); };
    }, []);

    const handleCancelBooking = (booking) => {
        let confirmMessage = 'Are you sure you want to cancel this service?';
        if (booking.trackingStatus === 'on_the_way') {
            confirmMessage = 'Nurse is on the way. A cancellation fee of ₹50 will be applied. Do you want to proceed?';
        }
        if (window.confirm(confirmMessage)) {
            const updated = bookings.map(b => b.id === booking.id ? { ...b, status: 'cancelled' } : b);
            setBookings(updated);
            // Also update in Supabase
            supabase.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id).then(({ error }) => {
                if (error) console.error('Cancel error:', error.message);
            });
        }
    };

    const tabs = [
        { id: 'upcoming', label: 'Upcoming' },
        { id: 'completed', label: 'Completed' },
        { id: 'cancelled', label: 'Cancelled' },
    ];

    // Filter bookings based on active tab
    const filteredBookings = bookings.filter(booking => {
        if (activeTab === 'upcoming') return ['confirmed', 'active', 'upcoming', 'pending', 'awaiting_doctor', 'doctor_approved', 'rejected'].includes(booking.status);

        if (activeTab === 'completed') return booking.status === 'completed';
        if (activeTab === 'cancelled') return booking.status === 'cancelled';
        return false;
    });

    return (
        <div className="bg-background min-h-screen max-w-[430px] mx-auto relative flex flex-col">
            <header className="sticky top-0 z-40 bg-surface backdrop-blur-md pt-14 pb-4 px-5 border-b border-border-subtle">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/home')}
                            className="flex size-10 items-center justify-center rounded-full bg-background shadow-soft text-text-main hover:bg-surface transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
                        </button>
                        <div
                            onClick={() => navigate('/profile')}
                            className="h-10 w-10 rounded-full border border-primary/20 p-0.5 cursor-pointer active:scale-95 transition-all shadow-sm"
                        >
                            <img
                                alt="User"
                                className="h-full w-full rounded-full object-cover bg-background"
                                src={profileData.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuBh5GT-z5R38SjS9_OLHXXHnj9n0WRGrX9uqty9UxMyYfeQ-AR5aIMRTa3dqAqvFlnSYNjVBuXwwf8PkOmfpun-6t7dPZ_v5hCJ96a0vES4FLGb8N062dnXXoQlHdgKcRkhz4pWDF_-8SyKgx_vr2JTk06ggjHlRQJKnAB-3_CtV5XH5Lir25bJHgGfCrABc9XTCQFBE5yq7jn5xkDeXb03i68jSL8l64iAELwTQ8yw-YKnJbxWnRfR9jL5F0e569cldjsfySwDuA"}
                            />
                        </div>
                    </div>
                    <h1 className="text-lg font-bold tracking-tight text-text-main absolute left-1/2 -translate-x-1/2">Bookings</h1>
                    <button
                        onClick={() => navigate('/notifications')}
                        className="flex size-10 items-center justify-center rounded-full bg-background text-text-muted border border-border-subtle relative hover:bg-surface active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined text-[20px]">notifications</span>
                        <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-accent-red animate-pulse"></span>
                    </button>
                </div>
                <div className="flex h-11 w-full items-center justify-center rounded-xl bg-background/50 p-1">
                    {tabs.map((tab) => (
                        <label
                            key={tab.id}
                            className={`flex h-full flex-1 cursor-pointer items-center justify-center rounded-lg px-2 transition-all font-semibold text-[13px] ${activeTab === tab.id
                                ? 'bg-surface shadow-soft text-primary'
                                : 'text-text-muted hover:text-text-main'
                                }`}
                        >
                            <span className="truncate">{tab.label}</span>
                            <input
                                className="hidden"
                                type="radio"
                                name="booking_tab"
                                value={tab.id}
                                checked={activeTab === tab.id}
                                onChange={() => setActiveTab(tab.id)}
                            />
                        </label>
                    ))}
                </div>
            </header>

            <main className="px-5 py-6 space-y-6 flex-1 pb-24">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-text-muted gap-3">
                        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <p className="text-sm font-semibold">Loading bookings…</p>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-text-muted">
                        <FileText className="w-12 h-12 mb-3 opacity-50" />
                        <p className="text-sm font-semibold">No {activeTab} bookings found.</p>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {activeTab === 'upcoming' && (
                            <div className="flex items-center justify-between">
                                <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Active Services</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                                    <span className="text-[10px] font-bold text-primary uppercase">Live Now</span>
                                </div>
                            </div>
                        )}
                        {activeTab === 'completed' && (
                            <div className="flex items-center justify-between">
                                <h3 className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Completed Services</h3>
                                <span className="text-[10px] font-bold text-emerald-600 uppercase">✅ All Done</span>
                            </div>
                        )}

                        {filteredBookings.map((booking, index) => (
                            <div key={index} className={`group relative overflow-hidden rounded-2xl bg-surface p-4 shadow-premium border ${booking.status === 'completed' ? 'border-emerald-200 bg-emerald-50/20'
                                : booking.status === 'awaiting_doctor' ? 'border-amber-200 bg-amber-50/20'
                                    : booking.status === 'doctor_approved' ? 'border-blue-200 bg-blue-50/10'
                                        : 'border-border-subtle'
                                }`}>
                                {(booking.status === 'awaiting_doctor' || booking.status === 'pending') && (
                                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold border border-amber-200 shadow-sm transition-all duration-300">
                                        📋 Review Pending
                                    </div>
                                )}
                                {booking.status === 'rejected' && (
                                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-bold border border-red-200 shadow-sm transition-all duration-300">
                                        ❌ Rejected
                                    </div>
                                )}
                                {(booking.status === 'confirmed' || booking.status === 'doctor_approved' || booking.status === 'upcoming' || booking.status === 'active') && (
                                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-200 shadow-sm transition-all duration-300">
                                        ✅ Approved
                                    </div>
                                )}
                                {booking.status === 'completed' && (
                                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-200">
                                        <CheckCircle className="w-3 h-3" /> Completed
                                    </div>
                                )}
                                <div className="flex gap-4">
                                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-background flex items-center justify-center">
                                        {booking.isMedicineOrder ? (
                                            <div className="bg-blue-500/10 w-full h-full flex items-center justify-center text-blue-500">
                                                <Pill className="w-8 h-8" />
                                            </div>
                                        ) : (
                                            <img
                                                src={booking.image || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop"}
                                                alt="Provider"
                                                className="h-full w-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-1 flex-col justify-between py-0.5">
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${booking.isMedicineOrder ? 'text-blue-500' : 'text-secondary'}`}>
                                                    {booking.serviceType}
                                                </span>
                                                <span className="text-[10px] font-medium text-text-muted">#{booking.id.slice(-6)}</span>
                                            </div>
                                            <h4 className="text-[15px] font-bold leading-tight mt-1 text-text-main line-clamp-1">
                                                {booking.serviceName}
                                            </h4>
                                            <p className="text-sm font-medium text-text-muted mt-0.5 flex items-center gap-1">
                                                {booking.isMedicineOrder ? (
                                                    <>{booking.items?.length || 0} Items • {booking.provider}</>
                                                ) : (
                                                    booking.provider
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <Calendar className="w-3.5 h-3.5 text-text-muted" />
                                            <span className="text-xs font-semibold text-text-main">
                                                {new Date(booking.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}, {booking.time}
                                            </span>
                                        </div>
                                        {/* Status Info Banners */}
                                        {(booking.status === 'awaiting_doctor' || booking.status === 'pending') && (
                                            <div className="mt-3 bg-amber-50 rounded-xl p-3 border border-amber-100 flex gap-2.5 items-start">
                                                <span className="text-lg">📋</span>
                                                <div>
                                                    <p className="text-[11px] font-extrabold text-amber-900 leading-tight">Doctor Review Pending</p>
                                                    <p className="text-[10px] font-medium text-amber-700 leading-relaxed mt-0.5 opacity-90 italic">
                                                        Your booking has been sent for doctor review. A doctor will verify your requirements before the nurse is dispatched.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {(booking.status === 'confirmed' || booking.status === 'doctor_approved') && !booking.nurseId && (
                                            <div className="mt-3 bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex gap-2.5 items-start">
                                                <span className="text-lg">✅</span>
                                                <div>
                                                    <p className="text-[11px] font-extrabold text-emerald-900 leading-tight">Doctor Approved</p>
                                                    <p className="text-[10px] font-medium text-emerald-700 leading-relaxed mt-0.5 opacity-90 italic">
                                                        Your booking has been approved! We are now assigning the best available nurse for your service.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {booking.status === 'rejected' && (
                                            <div className="mt-3 bg-red-50 rounded-xl p-3 border border-red-100 flex gap-2.5 items-start">
                                                <span className="text-lg">❌</span>
                                                <div>
                                                    <p className="text-[11px] font-extrabold text-red-900 leading-tight">Prescription Rejected</p>
                                                    <p className="text-[10px] font-medium text-red-700 leading-relaxed mt-0.5 opacity-90 italic">
                                                        It has been rejected. Please re-upload a valid prescription to proceed with your booking.
                                                    </p>
                                                    {booking.rejectionReason && (
                                                        <p className="text-[10px] font-bold text-red-600 mt-1.5 p-1.5 bg-white/50 rounded-lg border border-red-200/50">
                                                            Reason: {booking.rejectionReason}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-3">
                                    {booking.status === 'rejected' && (
                                        <button
                                            onClick={() => navigate('/upload-prescription', {
                                                state: {
                                                    serviceType: booking.serviceName,
                                                    bookingId: booking.id,
                                                    paymentDone: true,
                                                    date: booking.date,
                                                    time: booking.time,
                                                }
                                            })}
                                            className="flex-1 flex h-11 items-center justify-center rounded-xl bg-red-500 text-white text-[13px] font-bold tracking-wide shadow-md shadow-red-500/10 hover:bg-red-600 active:scale-95 transition-all gap-2"
                                        >
                                            <FileText className="w-4 h-4" />
                                            Re-upload Prescription
                                        </button>
                                    )}

                                    {booking.status !== 'cancelled' && booking.status !== 'completed' && booking.status !== 'rejected' && (
                                        <button
                                            onClick={() => navigate('/service-tracking', {
                                                state: {
                                                    serviceType: booking.serviceName,
                                                    providerName: booking.provider,
                                                    isMedicineOrder: booking.isMedicineOrder
                                                }
                                            })}
                                            className="flex-1 flex h-11 items-center justify-center rounded-xl bg-primary text-white text-[13px] font-bold tracking-wide shadow-md shadow-primary/10 hover:bg-primary/90 active:scale-95 transition-all gap-2"
                                        >
                                            <MapPin className="w-4 h-4" />
                                            Track {booking.isMedicineOrder ? 'Order' : 'Service'}
                                        </button>
                                    )}

                                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                        <button
                                            onClick={() => handleCancelBooking(booking)}
                                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 active:scale-95 transition-all"
                                            title="Cancel Booking"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    )}

                                    {/* Keep the chevron for detail view if needed, or replace/augment */}
                                    {booking.status === 'cancelled' && (
                                        <button className="flex-1 flex h-11 items-center justify-center rounded-xl border border-border-subtle bg-background text-text-muted text-[13px] font-bold cursor-not-allowed">
                                            Cancelled
                                        </button>
                                    )}

                                    {/* Rate Service Button for Completed Services */}
                                    {booking.status === 'completed' && !booking.rated && (
                                        <button
                                            onClick={() => navigate('/rate-service', { state: { booking } })}
                                            className="flex-1 flex h-11 items-center justify-center rounded-xl bg-amber-500 text-white text-[13px] font-bold tracking-wide shadow-md shadow-amber-500/10 hover:bg-amber-600 active:scale-95 transition-all gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">star</span>
                                            Rate Service
                                        </button>
                                    )}

                                    {/* Show Rating if Already Rated */}
                                    {booking.status === 'completed' && booking.rated && (
                                        <div className="flex-1 flex h-11 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-[13px] font-bold gap-2">
                                            <span className="material-symbols-outlined text-[18px] fill-current">star</span>
                                            Rated {booking.rating}/5
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Bookings;
