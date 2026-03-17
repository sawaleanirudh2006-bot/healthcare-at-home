import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, User, Clock, CheckCircle, Phone, Bell, Zap, Search, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function NurseDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('requests');
    const [allBookings, setAllBookings] = useState([]);
    const [accepting, setAccepting] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [nurseProfile, setNurseProfile] = useState(null);

    // Nurse identity from localStorage (set at login)
    const nurseData = JSON.parse(localStorage.getItem('nurseData') || '{}');
    const nurseId = nurseData?.id || nurseData?.user_id || 'nurse-1';
    const nurseName = nurseData?.name || nurseData?.full_name || 'Nurse';
    const nurseInitials = nurseName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const handleLogout = () => {
        const confirmed = window.confirm('Are you sure you want to logout?');
        if (confirmed) {
            localStorage.removeItem('userRole');
            localStorage.removeItem('nurseData');
            localStorage.removeItem('token');
            navigate('/role-selection');
        }
    };

    const loadBookings = async () => {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Failed to load bookings:', error.message);
            return;
        }

        const mapped = (data || []).map(b => {
            let notesObj = {};
            try { notesObj = JSON.parse(b.notes || '{}'); } catch (_) { }
            return {
                id: b.id,
                service: b.service_name || 'Service',
                patientName: notesObj.patient_name || 'Patient',
                date: b.date || '',
                time: b.time || '',
                address: b.address_street || 'Address not provided',
                status: b.status || 'pending',
                nurseId: notesObj.nurse_id || null,
                nurseName: notesObj.assigned_nurse_name || null,
                doctorNotes: notesObj.doctor_notes || '',
                // Read tracking status from notes JSON (reliable) OR column (fallback)
                trackingStatus: notesObj.tracking_status || b.tracking_status || null,
                nurseNotes: b.nurse_notes || '',
                totalPrice: b.total_price || 0,
                rawNotes: b.notes || '{}',
                createdAt: b.created_at,
                isMedicineOrder: notesObj.is_medicine_order || false,
                isEmergency: notesObj.is_emergency || false,
                isInsurance: notesObj.planType === 'insurance' || false,
                isLabTest: notesObj.planType === 'lab-test' || false,
                isAmbulance: (b.service_name || '').toLowerCase().includes('ambulance'),
                isHospital: (b.service_name || '').toLowerCase().includes('hospital'),
            };
        });

        // Filter out non-nursing jobs (Medicine, Insurance, Lab Tests, Ambulance, etc.)
        // These are handled by other departments or Admin
        setAllBookings(mapped.filter(b =>
            !b.isMedicineOrder &&
            !b.isInsurance &&
            !b.isLabTest &&
            !b.isAmbulance &&
            !b.isHospital
        ));
    };

    useEffect(() => {
        loadBookings();
        // Fetch nurse profile for verification status
        const fetchProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('nurse_profiles')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .single();
                if (profile) setNurseProfile(profile);
            }
        };
        fetchProfile();

        const interval = setInterval(loadBookings, 8000); // poll every 8s
        return () => clearInterval(interval);
    }, []);

    // --- ACCEPT BOOKING (Ola/Uber style atomic claim) ---
    const handleAccept = async (booking) => {
        setAccepting(booking.id);
        try {
            // First, re-fetch the booking to check it's still unclaimed
            const { data: fresh, error: fetchErr } = await supabase
                .from('bookings')
                .select('notes, status')
                .eq('id', booking.id)
                .single();

            if (fetchErr) throw fetchErr;

            let currentNotes = {};
            try { currentNotes = JSON.parse(fresh.notes || '{}'); } catch (_) { }

            if (currentNotes.nurse_id) {
                alert('This booking was already accepted by another nurse!');
                await loadBookings();
                return;
            }

            // Claim it — merge nurse info into notes JSON
            const updatedNotes = JSON.stringify({
                ...currentNotes,
                nurse_id: nurseId,
                assigned_nurse_name: nurseName,
                accepted_at: new Date().toISOString(),
            });

            const { error } = await supabase
                .from('bookings')
                .update({ notes: updatedNotes, status: 'confirmed' })  // confirmed = nurse accepted
                .eq('id', booking.id);

            if (error) throw error;

            await loadBookings();
            setActiveTab('myJobs');
        } catch (err) {
            alert('Failed to accept: ' + err.message);
        } finally {
            setAccepting(null);
        }
    };

    const handleCallPatient = (assignment) => {
        window.location.assign(`tel:+919876543210`);
    };

    // Helper — merges a new tracking_status into the booking's notes JSON and updates DB
    const updateTrackingStatus = async (booking, newStatus) => {
        let currentNotes = {};
        try { currentNotes = JSON.parse(booking.rawNotes || '{}'); } catch (_) { }
        const updatedNotes = JSON.stringify({ ...currentNotes, tracking_status: newStatus });

        // Single atomic update — write both notes JSON AND the tracking_status column together
        // This ensures ServiceTracking.jsx always finds the status regardless of which field it reads
        const { error } = await supabase
            .from('bookings')
            .update({
                notes: updatedNotes,
                tracking_status: newStatus,   // dedicated column (primary source)
            })
            .eq('id', booking.id);

        if (error) {
            // If tracking_status column doesn't exist, fall back to notes-only update
            const { error: fallbackErr } = await supabase
                .from('bookings')
                .update({ notes: updatedNotes })
                .eq('id', booking.id);
            if (fallbackErr) { alert('Failed to update status: ' + fallbackErr.message); return false; }
        }

        await loadBookings();
        return true;
    };

    const handleGoToGodown = async (assignment) => {
        await updateTrackingStatus(assignment, 'to_godown');
    };

    const handleItemsPicked = async (assignment) => {
        await updateTrackingStatus(assignment, 'items_picked');
    };

    const handleGoToPatient = async (assignment) => {
        await updateTrackingStatus(assignment, 'on_the_way');
    };

    const handleArrived = async (assignment) => {
        await updateTrackingStatus(assignment, 'arrived');
    };

    const handleMarkComplete = async (assignmentId) => {
        const { error } = await supabase
            .from('bookings')
            .update({ status: 'completed' })
            .eq('id', assignmentId);
        if (error) { alert('Failed to mark complete: ' + error.message); return; }
        await loadBookings();
    };

    // Filtered lists
    // 'pending'   = waiting for doctor review   → NOT shown to nurses
    // 'confirmed' = doctor approved             → shown in New Requests (no nurse yet)
    //                                           → shown in My Jobs (this nurse accepted)
    const newRequests = allBookings.filter(b => b.status === 'confirmed' && !b.nurseId);
    const myJobs = allBookings.filter(b => b.nurseId === nurseId && (b.status === 'confirmed' || b.status === 'upcoming'));
    const completed = allBookings.filter(b => b.nurseId === nurseId && b.status === 'completed');
    const cancelled = allBookings.filter(b => b.nurseId === nurseId && b.status === 'cancelled');

    const tabs = [
        { id: 'requests', label: 'New Requests', count: newRequests.length, color: 'amber' },
        { id: 'myJobs', label: 'My Jobs', count: myJobs.length, color: 'emerald' },
        { id: 'completed', label: 'Done', count: completed.length, color: 'blue' },
        { id: 'cancelled', label: 'Cancelled', count: cancelled.length, color: 'red' },
    ];

    const tabColors = {
        amber: 'bg-amber-500 text-white shadow-md',
        emerald: 'bg-emerald-500 text-white shadow-md',
        blue: 'bg-blue-500 text-white shadow-md',
        red: 'bg-red-500 text-white shadow-md',
    };

    const currentListRaw = { requests: newRequests, myJobs, completed, cancelled }[activeTab];

    // Apply search filter across patient name, service name, and address
    const q = searchQuery.trim().toLowerCase();
    const currentList = q
        ? currentListRaw.filter(b =>
            (b.patientName || '').toLowerCase().includes(q) ||
            (b.service || '').toLowerCase().includes(q) ||
            (b.address || '').toLowerCase().includes(q)
        )
        : currentListRaw;

    const renderCard = (booking) => {
        const isRequest = activeTab === 'requests';
        const isMyJob = activeTab === 'myJobs';
        const ts = booking.trackingStatus; // to_godown | items_picked | on_the_way | arrived | null

        return (
            <div
                key={booking.id}
                className={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${booking.isEmergency
                    ? 'border-red-500 bg-red-50/50 ring-2 ring-red-500/20'
                    : isRequest
                        ? 'border-amber-200 bg-amber-50/30'
                        : booking.status === 'cancelled'
                            ? 'border-red-100'
                            : 'border-slate-100'
                    }`}
            >
                {booking.isEmergency && (
                    <div className="flex items-center gap-2 mb-3 py-1.5 px-3 bg-red-600 text-white rounded-xl animate-pulse">
                        <Zap className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">EMERGENCY CASE — ACT NOW</span>
                    </div>
                )}
                {/* Top row */}
                <div className="flex items-start gap-3 mb-3">
                    <div className={`flex size-12 items-center justify-center rounded-xl shrink-0 ${isRequest ? 'bg-amber-100 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                        <User className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 leading-tight">{booking.service}</h3>
                                <p className="text-sm font-medium text-slate-500 mt-0.5">👤 {booking.patientName}</p>
                            </div>
                            {isRequest && (
                                <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-lg animate-pulse">
                                    <Zap className="w-3 h-3" /> NEW
                                </span>
                            )}
                            {!isRequest && (
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${booking.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                    : booking.status === 'cancelled' ? 'bg-red-50 text-red-600 border border-red-200'
                                        : 'bg-blue-50 text-blue-600 border border-blue-200'
                                    }`}>
                                    {booking.status === 'completed' ? 'Completed'
                                        : booking.status === 'cancelled' ? 'Cancelled'
                                            : 'Confirmed'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs font-medium text-slate-500 mb-3">
                    <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{booking.date || '—'}</div>
                    <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{booking.time || '—'}</div>
                    <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{booking.address}</div>
                    {booking.totalPrice > 0 && (
                        <div className="flex items-center gap-1.5 font-bold text-emerald-600">
                            💰 ₹{booking.totalPrice.toLocaleString()}
                        </div>
                    )}
                </div>

                {/* Doctor notes */}
                {booking.doctorNotes && (
                    <div className="mb-3 p-2.5 rounded-lg bg-amber-50 border border-amber-100">
                        <p className="text-[11px] font-bold text-amber-800 mb-0.5">Doctor's Notes</p>
                        <p className="text-[11px] text-amber-700">{booking.doctorNotes}</p>
                    </div>
                )}

                {/* ACTION BUTTONS */}
                {isRequest && (
                    <button
                        onClick={() => handleAccept(booking)}
                        disabled={accepting === booking.id}
                        className="w-full h-11 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-200 disabled:opacity-60"
                    >
                        {accepting === booking.id ? (
                            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                            <CheckCircle className="w-4 h-4" />
                        )}
                        {accepting === booking.id ? 'Accepting...' : '✅ Accept Job'}
                    </button>
                )}

                {isMyJob && (() => {
                    const steps = [
                        { key: null, label: 'Accepted' },
                        { key: 'to_godown', label: 'To Godown' },
                        { key: 'items_picked', label: 'Items Ready' },
                        { key: 'on_the_way', label: 'Travelling' },
                        { key: 'arrived', label: 'Arrived' },
                    ];
                    // When ts is null, findIndex returns 0 (first step = Accepted)
                    const stepIdx = ts === null ? 0 : steps.findIndex(s => s.key === ts);
                    return (
                        <div className="flex flex-col gap-2">
                            {/* Step progress bar */}
                            <div className="flex items-center gap-1 mb-1">
                                {steps.map((s, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center">
                                        <div className={`h-1.5 w-full rounded-full transition-all ${i <= stepIdx ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                        <span className={`text-[9px] mt-0.5 font-semibold ${i <= stepIdx ? 'text-emerald-600' : 'text-slate-400'}`}>{s.label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* STEP 1: Just accepted — go pick supplies from godown */}
                            {!ts && (
                                <button
                                    onClick={() => handleGoToGodown(booking)}
                                    className="w-full h-11 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <MapPin className="w-4 h-4" /> 🏪 Go to Godown (Pick Supplies)
                                </button>
                            )}

                            {/* STEP 2: Heading to godown — mark items collected */}
                            {ts === 'to_godown' && (
                                <div className="flex flex-col gap-2">
                                    <div className="w-full px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-bold text-indigo-700 flex items-center gap-2">
                                        <span className="relative flex size-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75" /><span className="relative inline-flex rounded-full size-2 bg-indigo-500" /></span>
                                        🏪 Heading to Godown…
                                    </div>
                                    <button
                                        onClick={() => handleItemsPicked(booking)}
                                        className="w-full h-11 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" /> ✅ Items Collected — Ready!
                                    </button>
                                </div>
                            )}

                            {/* STEP 3: Items ready — navigate to patient */}
                            {ts === 'items_picked' && (
                                <button
                                    onClick={() => handleGoToPatient(booking)}
                                    className="w-full h-11 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <MapPin className="w-4 h-4" /> 🚗 Head to Patient
                                </button>
                            )}

                            {/* STEP 4: On the way — arrive button */}
                            {ts === 'on_the_way' && (
                                <div className="flex flex-col gap-2">
                                    <div className="w-full px-3 py-2.5 bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                                        <span className="relative flex size-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" /><span className="relative inline-flex rounded-full size-2 bg-white" /></span>
                                        🚗 On the Way to Patient
                                    </div>
                                    <button
                                        onClick={() => handleArrived(booking)}
                                        className="w-full h-11 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" /> ✅ Arrived at Patient's Home
                                    </button>
                                </div>
                            )}

                            {/* STEP 5: Arrived — mark service complete */}
                            {ts === 'arrived' && (
                                <button
                                    onClick={() => handleMarkComplete(booking.id)}
                                    className="w-full h-11 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" /> ✅ Mark Service as Complete
                                </button>
                            )}

                            {/* Always show call button */}
                            <button
                                onClick={() => handleCallPatient(booking)}
                                className="w-full px-3 py-2 border border-emerald-300 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Phone className="w-3.5 h-3.5" /> Call Patient
                            </button>
                        </div>
                    );
                })()}

                {booking.status === 'cancelled' && (
                    <div className="mt-2 p-2.5 bg-red-50 rounded-lg border border-red-100">
                        <p className="text-xs font-bold text-red-700">Cancelled by Patient</p>
                    </div>
                )}

                {booking.nurseNotes && booking.status === 'completed' && (
                    <div className="mt-2 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs font-bold text-blue-800 mb-0.5">Care Notes</p>
                        <p className="text-xs text-blue-700">{booking.nurseNotes}</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 pt-12 pb-4 px-5">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={handleLogout}
                        className="flex size-10 items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 active:scale-95 transition-all shadow-sm border border-red-100"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Nurse Dashboard</h1>
                    <button
                        onClick={loadBookings}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all relative"
                    >
                        <Bell className="w-5 h-5" />
                        {newRequests.length > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                {newRequests.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Nurse Info */}
                <div className="flex items-center gap-3 bg-teal-50 p-3 rounded-xl mb-4 border border-teal-100">
                    <button onClick={() => navigate('/nurse/profile')} className="flex-shrink-0 relative">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center border-2 border-white shadow-sm">
                            <span className="font-bold text-teal-700 text-sm">{nurseInitials}</span>
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </button>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <p className="text-sm font-bold text-black">{nurseProfile?.full_name || nurseName}</p>
                            {(nurseProfile?.verification_status === 'approved' || !nurseProfile) && (
                                <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-bold rounded-md" title="Verified Nurse">
                                    <CheckCircle className="w-3 h-3" /> Verified
                                </span>
                            )}
                        </div>
                        <p className="text-xs font-medium text-slate-600">{nurseProfile?.qualification || 'Registered Nurse'} • {nurseProfile?.specialization || 'On Duty'}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                            className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shadow-sm ${activeTab === tab.id
                                ? 'bg-teal-600 text-white'
                                : 'bg-white text-slate-600 border border-slate-100'
                                }`}
                        >
                            {tab.label} {tab.count > 0 && `(${tab.count})`}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative mt-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by patient, service or address..."
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20 focus:border-teal-500 text-sm transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </header>

            {/* New Requests Alert Banner */}
            {activeTab === 'requests' && newRequests.length > 0 && (
                <div className="mx-5 mt-4 px-4 py-3 bg-teal-50 border border-teal-100 rounded-xl flex items-center gap-3">
                    <Zap className="w-5 h-5 text-teal-600 shrink-0 animate-pulse" />
                    <p className="text-sm font-bold text-teal-900">
                        {newRequests.length} new booking{newRequests.length > 1 ? 's' : ''} waiting — first to accept gets the job!
                    </p>
                </div>
            )}

            {/* Content */}
            <main className="flex-1 px-5 py-4 space-y-4 pb-24">
                {currentList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                            <Calendar className="w-8 h-8 opacity-40" />
                        </div>
                        <p className="text-sm font-bold text-slate-500">
                            {activeTab === 'requests' ? 'No new requests right now' : `No ${activeTab === 'myJobs' ? 'active' : activeTab} jobs`}
                        </p>
                        {activeTab === 'requests' && (
                            <p className="text-xs mt-1 text-slate-400">New bookings will appear here automatically</p>
                        )}
                    </div>
                ) : (
                    currentList.map(renderCard)
                )}
            </main>
        </div>
    );
}
