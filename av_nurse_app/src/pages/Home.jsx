import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

// All searchable items in the app
const ALL_ITEMS = [
    { label: 'Book Nurse', keywords: ['nurse', 'nursing', 'book nurse', 'home nurse'], route: '/nursing-services', icon: 'medical_services', color: 'bg-teal-50 text-teal-600' },
    { label: 'Consult Doctor', keywords: ['doctor', 'consult', 'video', 'chat', 'prescription', 'physician', 'in person', 'inperson', 'appointment', 'talk to doctor', 'see doctor'], route: '/doctor-consult', icon: 'medical_services', color: 'bg-teal-50 text-teal-600' },
    { label: 'Order Medicines', keywords: ['medicine', 'medicines', 'pharmacy', 'drug', 'store', 'pill'], route: '/store', icon: 'pill', color: 'bg-teal-50 text-teal-600' },
    { label: 'Lab Tests', keywords: ['lab', 'test', 'blood', 'urine', 'sample', 'diagnostic'], route: '/lab-tests', icon: 'biotech', color: 'bg-teal-50 text-teal-600' },
    { label: 'Emergency', keywords: ['emergency', 'urgent', 'sos', 'ambulance emergency'], route: '/emergency', icon: 'emergency', color: 'bg-red-50 text-red-600' },
    { label: 'Health Insurance', keywords: ['insurance', 'cashless', 'claim', 'coverage', 'policy'], route: '/health-insurance', icon: 'shield', color: 'bg-teal-50 text-teal-600' },
    { label: 'Treatment Packages', keywords: ['treatment', 'package', 'care plan', 'therapy', 'specialized'], route: '/treatment-packages', icon: 'medical_services', color: 'bg-teal-50 text-teal-600' },
    { label: 'Ambulance', keywords: ['ambulance', 'transport', 'vehicle'], route: '/ambulance', icon: 'ambulance', color: 'bg-red-50 text-red-600' },
    { label: 'Nearby Hospitals', keywords: ['hospital', 'clinic', 'nearby', 'location'], route: '/nearby-hospitals', icon: 'local_hospital', color: 'bg-teal-50 text-teal-600' },
    { label: 'Health Checkup', keywords: ['checkup', 'full body', 'screening', 'wellness', 'health check'], route: '/health-checkup-packages', icon: 'health_metrics', color: 'bg-teal-50 text-teal-600' },
    { label: 'IV Fluid Services', keywords: ['iv', 'fluid', 'drip', 'infusion', 'saline'], route: '/iv-fluid-services', icon: 'vaccines', color: 'bg-teal-50 text-teal-600' },
    { label: 'AI Health Assistant', keywords: ['ai', 'assistant', 'chat ai', 'bot', 'health assistant'], route: '/ai-health-assistant', icon: 'smart_toy', color: 'bg-teal-50 text-teal-600' },
    { label: 'Vitals', keywords: ['vitals', 'bp', 'blood pressure', 'pulse', 'temperature'], route: '/vitals', icon: 'favorite', color: 'bg-red-50 text-red-600' },
    { label: 'Health Records', keywords: ['records', 'history', 'reports', 'documents'], route: '/health-records', icon: 'folder_shared', color: 'bg-teal-50 text-teal-600' },
    { label: 'Membership Plans', keywords: ['membership', 'plan', 'subscribe', 'premium'], route: '/membership-plans', icon: 'workspace_premium', color: 'bg-amber-50 text-amber-600' },
];

const Home = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');

    const [profileData] = useState(() => {
        // Priority: userProfile → userData (set during signup/login) → Supabase session (async, handled below)
        const stored = localStorage.getItem('userProfile');
        if (stored) return JSON.parse(stored);

        const userData = localStorage.getItem('userData');
        if (userData) {
            const u = JSON.parse(userData);
            return {
                name: u.name || u.full_name || 'Patient',
                phone: u.phone || '',
                avatar: u.avatar || null,
            };
        }

        return { name: 'Patient', phone: '', avatar: null };
    });

    const [upcomingService, setUpcomingService] = useState(null);
    const channelRef = useRef(null);

    // ── Fetch active (non-completed, non-cancelled) booking from Supabase ─────
    const fetchUpcoming = async () => {
        try {
            // Use Supabase session OR user_id from localStorage (JWT login)
            const { data: { session } } = await supabase.auth.getSession();
            const localUser = JSON.parse(localStorage.getItem('userData') || '{}');
            const uid = session?.user?.id || localUser?.user_id || localUser?.id;
            if (!uid) return;

            const { data, error } = await supabase
                .from('bookings')
                .select('id, status, service_name, date, time, notes, tracking_status')
                .eq('user_id', uid)
                .not('status', 'in', '("completed","cancelled")')
                .order('created_at', { ascending: false })
                .limit(1);


            if (error || !data || data.length === 0) {
                setUpcomingService(null);
                return;
            }

            const b = data[0];
            let notesObj = {};
            try { notesObj = JSON.parse(b.notes || '{}'); } catch (_) { }

            // nurseId is only present after a nurse has accepted the job
            const nurseId = notesObj.nurse_id || null;

            const isMed = notesObj.is_medicine_order || false;
            setUpcomingService({
                id: b.id,
                service: b.service_name || 'Home Nursing Service',
                status: b.status,
                date: b.date || '',
                time: b.time || '',
                trackingStatus: notesObj.tracking_status || b.tracking_status || null,
                nurseId,
                isMedicineOrder: isMed,
                nurse: { name: isMed ? 'Pharmacy Team' : (notesObj.assigned_nurse_name || 'Nurse') },
            });
        } catch (_) { }
    };

    useEffect(() => {
        fetchUpcoming();
        const interval = setInterval(fetchUpcoming, 15000);

        // Realtime: re-fetch immediately when any of the user's bookings change
        (async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const localUser = JSON.parse(localStorage.getItem('userData') || '{}');
            const uid = session?.user?.id || localUser?.user_id || localUser?.id;
            if (!uid) return;

            channelRef.current = supabase
                .channel('home-upcoming-booking')
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'bookings',
                    filter: `user_id=eq.${uid}`,
                }, fetchUpcoming)
                .subscribe();
        })();

        return () => {
            clearInterval(interval);
            if (channelRef.current) supabase.removeChannel(channelRef.current);
        };
    }, []);

    const searchResults = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return ALL_ITEMS.filter(item =>
            item.label.toLowerCase().includes(q) ||
            item.keywords.some(k => k.includes(q))
        );
    }, [query]);

    const showSearchResults = query.trim().length > 0;

    return (
        <div className="bg-background min-h-screen">
            <header className="pt-14 pb-6 px-6 bg-surface">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div
                            onClick={() => navigate('/profile')}
                            className="h-12 w-12 rounded-full border-2 border-primary-teal/20 p-0.5 cursor-pointer active:scale-95 transition-all shadow-sm"
                        >
                            <img
                                alt="User"
                                className="h-full w-full rounded-full object-cover bg-white"
                                src={profileData.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuBh5GT-z5R38SjS9_OLHXXHnj9n0WRGrX9uqty9UxMyYfeQ-AR5aIMRTa3dqAqvFlnSYNjVBuXwwf8PkOmfpun-6t7dPZ_v5hCJ96a0vES4FLGb8N062dnXXoQlHdgKcRkhz4pWDF_-8SyKgx_vr2JTk06ggjHlRQJKnAB-3_CtV5XH5Lir25bJHgGfCrABc9XTCQFBE5yq7jn5xkDeXb03i68jSL8l64iAELwTQ8yw-YKnJbxWnRfR9jL5F0e569cldjsfySwDuA"}
                            />
                        </div>
                        <div onClick={() => navigate('/profile')} className="cursor-pointer">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Namaste,</p>
                            <h1 className="text-xl font-extrabold text-black">{profileData.name}</h1>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/notifications')}
                        className="flex size-11 items-center justify-center rounded-2xl bg-surface/50 text-text-muted border border-border-subtle relative hover:bg-background active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined text-[24px]">notifications</span>
                        <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-accent-red animate-pulse"></span>
                    </button>
                </div>

                {/* Search bar */}
                <div className="relative mt-2">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                    <input
                        className="h-12 w-full rounded-2xl border-none bg-slate-100 pl-11 pr-10 text-[14px] text-black placeholder:text-slate-400 focus:ring-2 focus:ring-primary-teal/20 outline-none"
                        placeholder="Search for doctors, tests, services..."
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-sm font-bold hover:text-text-muted"
                        >✕</button>
                    )}
                </div>
            </header>

            {/* Search Results Overlay */}
            {showSearchResults && (
                <div className="px-6 pt-4 pb-2">
                    {searchResults.length > 0 ? (
                        <>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-3">
                                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{query}"
                            </p>
                            <div className="space-y-2">
                                {searchResults.map(item => (
                                    <button
                                        key={item.route}
                                        onClick={() => { setQuery(''); navigate(item.route); }}
                                        className="w-full flex items-center gap-4 bg-surface rounded-2xl px-4 py-3 shadow-sm border border-border-subtle hover:border-primary/30 hover:shadow-md active:scale-[0.98] transition-all text-left"
                                    >
                                        <div className={`flex size-11 items-center justify-center rounded-xl ${item.color}`}>
                                            <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                                        </div>
                                        <span className="text-sm font-bold text-text-main">{item.label}</span>
                                        <span className="material-symbols-outlined text-[18px] text-slate-300 ml-auto">chevron_right</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-text-muted text-center">
                            <span className="material-symbols-outlined text-[48px] mb-2 opacity-40">search_off</span>
                            <p className="text-sm font-semibold">No results for "{query}"</p>
                            <p className="text-xs mt-1">Try: doctor, nurse, lab test, ambulance…</p>
                        </div>
                    )}
                </div>
            )}

            {/* Main content — hidden when search is active */}
            {!showSearchResults && (
                <main className="px-6 py-6 space-y-8">
                    {/* Doctor Consultation Banner */}
                    <section>
                        <div
                            onClick={() => navigate('/doctor-consult')}
                            className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all"
                        >
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-md text-[10px] font-bold uppercase tracking-wider border border-white/20">New</span>
                                    <span className="w-1 h-1 rounded-full bg-white animate-pulse"></span>
                                </div>
                                <h3 className="text-xl font-bold mb-1 font-display tracking-tight">Consult Top Doctors</h3>
                                <p className="text-teal-50 text-sm mb-4 opacity-90 max-w-[210px] leading-relaxed">Get expert medical advice from the comfort of your home via Video or Chat.</p>
                                <div className="inline-flex items-center gap-2 bg-white text-teal-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm group-hover:bg-teal-50 transition-colors">
                                    <span>Book Consultation</span>
                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </div>
                            </div>
                            <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:opacity-20 transition-opacity rotate-[-15deg]">
                                <span className="material-symbols-outlined text-[160px]">stethoscope</span>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-[13px] font-bold uppercase tracking-widest text-text-muted mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-4 gap-3 sm:gap-4">
                            <button
                                onClick={() => navigate('/nursing-services')}
                                className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
                            >
                                <div className="flex size-14 sm:size-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors">
                                    <span className="material-symbols-outlined text-[28px]">medical_services</span>
                                </div>
                                <span className="text-[11px] font-bold text-slate-600 text-center leading-tight">Book Nurse</span>
                            </button>
                            <button
                                onClick={() => navigate('/store')}
                                className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
                            >
                                <div className="flex size-14 sm:size-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors">
                                    <span className="material-symbols-outlined text-[28px]">pill</span>
                                </div>
                                <span className="text-[11px] font-bold text-slate-600 text-center leading-tight">Medicines</span>
                            </button>
                            <button
                                onClick={() => navigate('/lab-tests')}
                                className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
                            >
                                <div className="flex size-14 sm:size-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors">
                                    <span className="material-symbols-outlined text-[28px]">biotech</span>
                                </div>
                                <span className="text-[11px] font-bold text-slate-600 text-center leading-tight">Lab Tests</span>
                            </button>

                            {/* Row 2 */}
                            <button
                                onClick={() => navigate('/emergency')}
                                className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
                            >
                                <div className="flex size-14 sm:size-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                                    <span className="material-symbols-outlined text-[28px]">emergency</span>
                                </div>
                                <span className="text-[11px] font-semibold text-slate-600 text-center">Emergency</span>
                            </button>



                        </div>
                    </section>

                    {/* Our Services Section */}
                    <section>
                        <h3 className="text-[13px] font-bold uppercase tracking-widest text-text-muted mb-4">Our Services</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => navigate('/health-insurance')}
                                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-teal-400 hover:shadow-md transition-all text-left active:scale-[0.98]"
                            >
                                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-3">
                                    <span className="material-symbols-outlined text-[28px] text-teal-600">shield</span>
                                </div>
                                <h4 className="text-sm font-bold text-black mb-1">Health Insurance</h4>
                                <p className="text-xs text-slate-500">Cashless claims &amp; coverage</p>
                            </button>

                            <button
                                onClick={() => navigate('/treatment-packages')}
                                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-teal-500 hover:shadow-md transition-all text-left active:scale-[0.98]"
                            >
                                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-3">
                                    <span className="material-symbols-outlined text-[28px] text-teal-600">medical_services</span>
                                </div>
                                <h4 className="text-sm font-bold text-black mb-1">Treatment Packages</h4>
                                <p className="text-xs text-slate-500">Specialized care plans</p>
                            </button>

                            <button
                                onClick={() => navigate('/ambulance')}
                                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-red-400 hover:shadow-md transition-all text-left active:scale-[0.98]"
                            >
                                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-3">
                                    <span className="material-symbols-outlined text-[28px] text-red-500">ambulance</span>
                                </div>
                                <h4 className="text-sm font-bold text-black mb-1">Ambulance</h4>
                                <p className="text-xs text-slate-500">24/7 emergency transport</p>
                            </button>

                            <button
                                onClick={() => navigate('/nearby-hospitals')}
                                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-teal-600 hover:shadow-md transition-all text-left active:scale-[0.98]"
                            >
                                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-3">
                                    <span className="material-symbols-outlined text-[28px] text-teal-600">local_hospital</span>
                                </div>
                                <h4 className="text-sm font-bold text-black mb-1">Nearby Hospitals</h4>
                                <p className="text-xs text-slate-500">Find hospitals near you</p>
                            </button>
                        </div>
                    </section>

                    {upcomingService ? (
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[13px] font-bold uppercase tracking-widest text-text-muted">Upcoming Service</h3>
                                <button onClick={() => navigate('/bookings')} className="text-[12px] font-bold text-primary">View All</button>
                            </div>
                            <div className="group relative overflow-hidden rounded-3xl bg-surface p-5 shadow-premium border border-border-subtle">
                                <div className="flex gap-4">
                                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-surface/50">
                                        <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA52I6yeap-Pk-Pte-pz970v2uJSNPJIDxA3H-240nfnhU7VQgEyUU2K6IBbugutGT5oC9aDzBcjdtS0cZVKHQp9xunDFSZh3MRkKdkXX-L2fAlIS5_qDt51QHDcHy1Ct_gBCUcI9ztHmkVh8PDpPItmK-xx2V-LQt_dJWzUUvFJrv1RiQzXqJmOWaJ7zuv-deoB-hVjAFzqYBk4gvz5TDGLp0rvlVxe_KiXvRfGVyeBw8yM7oKdsW3Xk9230Oc6LJiVU_EX8ReIQ')" }}></div>
                                    </div>
                                    <div className="flex flex-1 flex-col justify-between py-0.5">
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                                                    {upcomingService.service || 'Nursing Care'}
                                                </span>
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${upcomingService.status === 'awaiting_doctor' ? 'bg-amber-500/10 text-amber-600'
                                                    : upcomingService.status === 'doctor_approved' ? 'bg-blue-500/10 text-blue-600'
                                                        : 'bg-emerald-500/10 text-emerald-500'
                                                    }`}>
                                                    {upcomingService.status === 'awaiting_doctor' ? '📋 Doctor Review'
                                                        : (upcomingService.status === 'doctor_approved' || upcomingService.status === 'confirmed') ? '✅ Approved'
                                                            : 'UPCOMING'}
                                                </span>
                                            </div>
                                            <h4 className="text-[16px] font-bold leading-tight mt-1 text-text-main">
                                                {upcomingService.service || '12hr Post-Op Nurse Shift'}
                                            </h4>
                                            <p className="text-sm font-medium text-text-muted mt-0.5">
                                                {upcomingService.nurse?.name || 'Nurse Assigned'}
                                            </p>
                                            {upcomingService.status === 'awaiting_doctor' && (
                                                <div className="mt-4 bg-amber-50/50 rounded-2xl p-3 border border-amber-100 flex gap-2.0 items-start">
                                                    <span className="text-lg">📋</span>
                                                    <div>
                                                        <p className="text-[10px] font-extrabold text-amber-900 leading-tight underline decoration-amber-200 decoration-2 underline-offset-2">Doctor Review Pending</p>
                                                        <p className="text-[9px] font-medium text-amber-700 leading-relaxed mt-1 opacity-90 italic">
                                                            Your booking has been sent for doctor review. A doctor will verify your requirements before the nurse is dispatched. You will be notified once approved.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 flex items-center justify-between rounded-2xl bg-surface/50 p-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-primary shadow-sm">
                                            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-text-muted uppercase">Date &amp; Time</p>
                                            <p className="text-[13px] font-bold text-text-main">
                                                {upcomingService.date || 'Today'}, {upcomingService.time || '08:00 PM'}
                                            </p>
                                        </div>
                                    </div>
                                    {((upcomingService.isMedicineOrder && (upcomingService.status === 'confirmed' || upcomingService.status === 'upcoming')) || upcomingService.nurseId) ? (
                                        // Medicine order (approved) OR Nurse has accepted — show Track button
                                        <button
                                            onClick={() => navigate('/service-tracking', {
                                                state: {
                                                    serviceType: upcomingService.service,
                                                    providerName: upcomingService.nurse?.name || 'Pharmacy Team',
                                                    bookingId: upcomingService.id,
                                                    isMedicineOrder: upcomingService.isMedicineOrder,
                                                    initialBookingStatus: upcomingService.status,
                                                    initialTrackingStatus: upcomingService.trackingStatus,
                                                }
                                            })}
                                            className="h-9 px-4 rounded-xl bg-primary text-white text-[12px] font-bold shadow-md shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all"
                                        >
                                            Track {upcomingService.isMedicineOrder ? 'Order' : 'Service'}
                                        </button>
                                    ) : upcomingService.status === 'awaiting_doctor' ? (
                                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-[11px] font-bold">
                                            📋 Verification Pending
                                        </span>
                                    ) : (
                                        // Waiting for a nurse to accept
                                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold">
                                            <span className="relative flex size-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                                                <span className="relative inline-flex rounded-full size-2 bg-amber-500" />
                                            </span>
                                            Awaiting Nurse
                                        </span>
                                    )}
                                </div>
                            </div>
                        </section>
                    ) : (
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[13px] font-bold uppercase tracking-widest text-text-muted">Upcoming Service</h3>
                                <button onClick={() => navigate('/bookings')} className="text-[12px] font-bold text-primary">View All</button>
                            </div>
                            <div className="rounded-3xl bg-surface/50 p-8 text-center border border-border-subtle">
                                <span className="material-symbols-outlined text-[48px] text-text-muted/30">event_available</span>
                                <p className="text-sm font-bold text-text-muted mt-3">No Upcoming Services</p>
                                <p className="text-xs font-medium text-text-muted mt-1">Book a service to get started</p>
                                <button
                                    onClick={() => navigate('/nursing-services')}
                                    className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 active:scale-95 transition-all"
                                >
                                    Book Now
                                </button>
                            </div>
                        </section>
                    )}

                    <section>
                        <div className="relative overflow-hidden rounded-3xl bg-teal-600 p-6 text-white shadow-lg">
                            <div className="relative z-10">
                                <h4 className="text-lg font-bold leading-tight">Health Checkup Packages</h4>
                                <p className="text-sm font-medium text-white/80 mt-1 max-w-[180px]">Complete full body screening at 40% discount.</p>
                                <button
                                    onClick={() => navigate('/health-checkup-packages')}
                                    className="mt-4 rounded-xl bg-white/20 px-4 py-2 text-[12px] font-bold backdrop-blur-md border border-white/30 hover:bg-white/30 transition-colors active:scale-95"
                                >
                                    Explore Now
                                </button>
                            </div>
                            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-[120px] text-white/20 rotate-12 pointer-events-none">health_metrics</span>
                        </div>
                    </section>

                    {/* AI Health Assistant Banner */}
                    <section>
                        <div
                            onClick={() => navigate('/ai-health-assistant')}
                            className="bg-gradient-to-br from-teal-700 to-teal-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all"
                        >
                            <div className="relative z-10">
                                <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 inline-block border border-white/20">AI Support</span>
                                <h3 className="text-xl font-bold mb-1 font-display tracking-tight">AI Health Assistant</h3>
                                <p className="text-teal-50 text-sm mb-4 opacity-90 max-w-[200px] leading-relaxed">Ask anything about your health or symptoms for instant AI-powered guidance.</p>
                                <div className="inline-flex items-center gap-2 bg-white text-teal-800 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm group-hover:bg-teal-50 transition-colors">
                                    <span>Chat Now</span>
                                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                                </div>
                            </div>
                            <div className="absolute right-[-10px] bottom-[-20px] opacity-10 group-hover:opacity-20 transition-opacity rotate-[-10deg]">
                                <span className="material-symbols-outlined text-[140px]">smart_toy</span>
                            </div>
                        </div>
                    </section>
                </main>
            )}


        </div>
    );
};

export default Home;
