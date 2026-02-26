import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    ArrowLeft, Phone, MapPin, Award, Mail,
    Star, Activity, Calendar, Clock,
    ChevronRight, X, Stethoscope, Heart
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmt = (iso) => iso ? new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
}) : '—';

const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
}) : '—';

const statusColor = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const StaffManagement = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') || 'doctors';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [loading, setLoading] = useState(true);
    const [selectedStaff, setSelectedStaff] = useState(null);

    // Real data from Supabase
    const [allBookings, setAllBookings] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);

    // Derived doctor and nurse data
    const [doctors, setDoctors] = useState([]);
    const [nurses, setNurses] = useState([]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch all bookings
            const { data: bks } = await supabase
                .from('bookings')
                .select('*')
                .order('created_at', { ascending: false });

            const mapped = (bks || []).map(b => {
                let notes = {};
                try { notes = JSON.parse(b.notes || '{}'); } catch (_) { }
                return {
                    id: b.id,
                    service: b.service_name || '—',
                    patient: notes.patient_name || b.user_id?.slice(0, 8) || '—',
                    date: b.date || b.created_at,
                    time: b.time || '—',
                    status: b.status || 'pending',
                    nurseId: notes.nurse_id || null,
                    nurseName: notes.assigned_nurse_name || '—',
                    doctorNotes: notes.doctor_notes || '—',
                    price: Number(b.total_price || 0),
                    createdAt: b.created_at,
                    isMedicine: notes.is_medicine_order || false,
                };
            });
            setAllBookings(mapped);

            // Fetch prescriptions
            const { data: rxs } = await supabase
                .from('prescriptions')
                .select('*')
                .order('created_at', { ascending: false });
            setPrescriptions(rxs || []);

            // Build doctor profiles from prescriptions
            const doctorMap = {};
            (rxs || []).forEach(rx => {
                const did = rx.doctor_id;
                if (!did) return;
                if (!doctorMap[did]) {
                    doctorMap[did] = {
                        id: did,
                        name: rx.doctor_name || `Dr. ${String(did).slice(0, 8)}`,
                        email: rx.doctor_email || '—',
                        totalReviewed: 0,
                        approved: 0,
                        rejected: 0,
                        pending: 0,
                        prescriptions: [],
                        lastActive: null,
                    };
                }
                doctorMap[did].totalReviewed++;
                if (rx.status === 'approved') doctorMap[did].approved++;
                else if (rx.status === 'rejected') doctorMap[did].rejected++;
                else doctorMap[did].pending++;
                doctorMap[did].prescriptions.push(rx);
                const d = rx.reviewed_at || rx.created_at;
                if (!doctorMap[did].lastActive || d > doctorMap[did].lastActive) {
                    doctorMap[did].lastActive = d;
                }
            });

            // Also add default doctors if no real data exists
            const realDoctors = Object.values(doctorMap);
            if (realDoctors.length === 0) {
                const defaultDoctors = JSON.parse(localStorage.getItem('doctors') || '[]') || [];
                if (defaultDoctors.length > 0) {
                    setDoctors(defaultDoctors.map(d => ({
                        ...d,
                        totalReviewed: 0, approved: 0, rejected: 0, pending: 0,
                        prescriptions: [], lastActive: null,
                    })));
                } else {
                    setDoctors([
                        { id: 'doc-1', name: 'Dr. Rajesh Kumar', specialty: 'General Physician', phone: '9876543210', email: 'dr.rajesh@hospital.com', experience: '15 years', totalReviewed: 0, approved: 0, rejected: 0, pending: 0, prescriptions: [], lastActive: null },
                        { id: 'doc-2', name: 'Dr. Priya Sharma', specialty: 'Internal Medicine', phone: '9876543211', email: 'dr.priya@hospital.com', experience: '12 years', totalReviewed: 0, approved: 0, rejected: 0, pending: 0, prescriptions: [], lastActive: null },
                    ]);
                }
            } else {
                setDoctors(realDoctors);
            }

            // Build nurse profiles from bookings
            const nurseMap = {};
            mapped.filter(b => !b.isMedicine && b.nurseId).forEach(b => {
                if (!nurseMap[b.nurseId]) {
                    nurseMap[b.nurseId] = {
                        id: b.nurseId,
                        name: b.nurseName || `Nurse ${String(b.nurseId).slice(0, 8)}`,
                        totalJobs: 0,
                        activeJobs: 0,
                        completedJobs: 0,
                        cancelledJobs: 0,
                        totalRevenue: 0,
                        bookings: [],
                        lastActive: null,
                    };
                }
                nurseMap[b.nurseId].totalJobs++;
                if (b.status === 'confirmed' || b.status === 'upcoming') nurseMap[b.nurseId].activeJobs++;
                if (b.status === 'completed') nurseMap[b.nurseId].completedJobs++;
                if (b.status === 'cancelled') nurseMap[b.nurseId].cancelledJobs++;
                if (b.status !== 'cancelled') nurseMap[b.nurseId].totalRevenue += b.price;
                nurseMap[b.nurseId].bookings.push(b);
                if (!nurseMap[b.nurseId].lastActive || b.createdAt > nurseMap[b.nurseId].lastActive) {
                    nurseMap[b.nurseId].lastActive = b.createdAt;
                }
            });

            const realNurses = Object.values(nurseMap);
            if (realNurses.length === 0) {
                const defaultNurses = JSON.parse(localStorage.getItem('nurses') || '[]') || [];
                if (defaultNurses.length > 0) {
                    setNurses(defaultNurses.map(n => ({
                        ...n,
                        totalJobs: 0, activeJobs: 0, completedJobs: 0, cancelledJobs: 0,
                        totalRevenue: 0, bookings: [], lastActive: null,
                    })));
                } else {
                    setNurses([
                        { id: 'nurse-1', name: 'Nurse Sarah', area: 'North Delhi', phone: '9876543220', rating: 4.8, experience: '8 years', totalJobs: 0, activeJobs: 0, completedJobs: 0, cancelledJobs: 0, totalRevenue: 0, bookings: [], lastActive: null },
                        { id: 'nurse-2', name: 'Nurse Priya', area: 'South Delhi', phone: '9876543221', rating: 4.9, experience: '10 years', totalJobs: 0, activeJobs: 0, completedJobs: 0, cancelledJobs: 0, totalRevenue: 0, bookings: [], lastActive: null },
                    ]);
                }
            } else {
                setNurses(realNurses);
            }

        } catch (err) {
            console.error('Staff load error:', err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // ─── Detail Modal ─────────────────────────────────────────────────────────
    const renderDoctorDetail = (doctor) => (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setSelectedStaff(null)}>
            <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-t-3xl p-6 text-white relative">
                    <button onClick={() => setSelectedStaff(null)} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <Stethoscope className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold">{doctor.name}</h2>
                            <p className="text-blue-100 text-sm font-medium">{doctor.specialty || 'Doctor'}</p>
                            {doctor.lastActive && (
                                <p className="text-blue-200 text-xs mt-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Last active: {fmtDate(doctor.lastActive)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-5 space-y-5">
                    {/* Contact Info */}
                    {(doctor.phone || doctor.email !== '—') && (
                        <div className="space-y-2">
                            {doctor.phone && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-medium text-slate-700">{doctor.phone}</span>
                                </div>
                            )}
                            {doctor.email && doctor.email !== '—' && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-medium text-slate-700">{doctor.email}</span>
                                </div>
                            )}
                            {doctor.experience && (
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <Award className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-medium text-slate-700">{doctor.experience} experience</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
                            <p className="text-2xl font-extrabold text-blue-700">{doctor.totalReviewed}</p>
                            <p className="text-xs font-semibold text-blue-500 mt-1">Total Reviewed</p>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                            <p className="text-2xl font-extrabold text-emerald-700">{doctor.approved}</p>
                            <p className="text-xs font-semibold text-emerald-500 mt-1">Approved</p>
                        </div>
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
                            <p className="text-2xl font-extrabold text-red-600">{doctor.rejected}</p>
                            <p className="text-xs font-semibold text-red-400 mt-1">Rejected</p>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
                            <p className="text-2xl font-extrabold text-amber-700">{doctor.pending}</p>
                            <p className="text-xs font-semibold text-amber-500 mt-1">Pending</p>
                        </div>
                    </div>

                    {/* Approval Rate */}
                    {doctor.totalReviewed > 0 && (
                        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-bold text-indigo-900">Approval Rate</p>
                                <p className="text-lg font-extrabold text-indigo-700">
                                    {Math.round((doctor.approved / doctor.totalReviewed) * 100)}%
                                </p>
                            </div>
                            <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-700"
                                    style={{ width: `${(doctor.approved / doctor.totalReviewed) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Recent Prescriptions */}
                    {doctor.prescriptions && doctor.prescriptions.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-indigo-500" />
                                Recent Prescriptions
                            </h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {doctor.prescriptions.slice(0, 10).map(rx => (
                                    <div key={rx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 truncate">
                                                Patient: {String(rx.user_id || '—').slice(0, 12)}…
                                            </p>
                                            <p className="text-xs text-slate-400">{fmt(rx.created_at)}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${rx.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : rx.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200'
                                                : 'bg-amber-50 text-amber-700 border-amber-200'
                                            }`}>
                                            {rx.status || 'pending'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderNurseDetail = (nurse) => (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setSelectedStaff(null)}>
            <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-t-3xl p-6 text-white relative">
                    <button onClick={() => setSelectedStaff(null)} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <Heart className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold">{nurse.name}</h2>
                            {nurse.area && <p className="text-emerald-100 text-sm font-medium">{nurse.area}</p>}
                            {nurse.lastActive && (
                                <p className="text-emerald-200 text-xs mt-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Last active: {fmtDate(nurse.lastActive)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-5 space-y-5">
                    {/* Contact & Info */}
                    <div className="space-y-2">
                        {nurse.phone && (
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-medium text-slate-700">{nurse.phone}</span>
                            </div>
                        )}
                        {nurse.area && (
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-medium text-slate-700">{nurse.area}</span>
                            </div>
                        )}
                        {nurse.experience && (
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <Award className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-medium text-slate-700">{nurse.experience} experience</span>
                            </div>
                        )}
                        {nurse.rating && (
                            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                <Star className="w-4 h-4 text-amber-500" />
                                <span className="text-sm font-bold text-amber-700">⭐ {nurse.rating} Rating</span>
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
                            <p className="text-2xl font-extrabold text-blue-700">{nurse.totalJobs}</p>
                            <p className="text-xs font-semibold text-blue-500 mt-1">Total Jobs</p>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                            <p className="text-2xl font-extrabold text-emerald-700">{nurse.activeJobs}</p>
                            <p className="text-xs font-semibold text-emerald-500 mt-1">Active Now</p>
                        </div>
                        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 text-center">
                            <p className="text-2xl font-extrabold text-teal-700">{nurse.completedJobs}</p>
                            <p className="text-xs font-semibold text-teal-500 mt-1">Completed</p>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
                            <p className="text-2xl font-extrabold text-amber-700">₹{(nurse.totalRevenue || 0).toLocaleString()}</p>
                            <p className="text-xs font-semibold text-amber-500 mt-1">Revenue Generated</p>
                        </div>
                    </div>

                    {/* Completion Rate */}
                    {nurse.totalJobs > 0 && (
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-bold text-emerald-900">Completion Rate</p>
                                <p className="text-lg font-extrabold text-emerald-700">
                                    {Math.round((nurse.completedJobs / nurse.totalJobs) * 100)}%
                                </p>
                            </div>
                            <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700"
                                    style={{ width: `${(nurse.completedJobs / nurse.totalJobs) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Recent Assignments */}
                    {nurse.bookings && nurse.bookings.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-emerald-500" />
                                Recent Assignments
                            </h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {nurse.bookings.slice(0, 10).map(b => (
                                    <div key={b.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 truncate">
                                                {b.patient} — {b.service}
                                            </p>
                                            <p className="text-xs text-slate-400">{fmtDate(b.date || b.createdAt)} · ₹{b.price}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${statusColor[b.status] || statusColor.pending}`}>
                                            {b.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
                <div className="max-w-3xl mx-auto px-5 pt-12 pb-4">
                    <div className="flex items-center justify-between mb-5">
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-extrabold text-slate-900">Staff Management</h1>
                        <div className="w-10" />
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('doctors')}
                            className={`flex-1 h-11 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'doctors'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            <Stethoscope className="w-4 h-4" />
                            Doctors ({doctors.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('nurses')}
                            className={`flex-1 h-11 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'nurses'
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            <Heart className="w-4 h-4" />
                            Nurses ({nurses.length})
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-3xl mx-auto px-5 py-6 space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-slate-500 font-medium">Loading staff data…</p>
                    </div>
                ) : (
                    <>
                        {/* ── DOCTORS TAB ─────────────────────────────────────── */}
                        {activeTab === 'doctors' && (
                            <div className="space-y-4">
                                {/* Summary Banner */}
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 text-white">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-2xl font-extrabold">{doctors.length}</p>
                                            <p className="text-xs text-blue-200 font-medium">Total Doctors</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-extrabold">{prescriptions.length}</p>
                                            <p className="text-xs text-blue-200 font-medium">Prescriptions</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-extrabold">{prescriptions.filter(r => r.status === 'approved').length}</p>
                                            <p className="text-xs text-blue-200 font-medium">Approved</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Doctor Cards */}
                                {doctors.map(doctor => (
                                    <button
                                        key={doctor.id}
                                        onClick={() => setSelectedStaff({ type: 'doctor', data: doctor })}
                                        className="w-full bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:border-blue-200 transition-all text-left group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                <Stethoscope className="w-7 h-7 text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-base font-bold text-slate-900 truncate">{doctor.name}</h3>
                                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                                                </div>
                                                <p className="text-sm text-slate-500">{doctor.specialty || 'Doctor'}</p>

                                                <div className="flex items-center gap-3 mt-3 flex-wrap">
                                                    {doctor.phone && (
                                                        <span className="flex items-center gap-1 text-xs text-slate-400">
                                                            <Phone className="w-3 h-3" /> {doctor.phone}
                                                        </span>
                                                    )}
                                                    {doctor.experience && (
                                                        <span className="flex items-center gap-1 text-xs text-slate-400">
                                                            <Award className="w-3 h-3" /> {doctor.experience}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 mt-3">
                                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full border border-blue-100">
                                                        {doctor.totalReviewed} reviewed
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-100">
                                                        {doctor.approved} approved
                                                    </span>
                                                    {doctor.pending > 0 && (
                                                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-100">
                                                            {doctor.pending} pending
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}

                                {doctors.length === 0 && (
                                    <div className="text-center py-16 text-slate-400">
                                        <Stethoscope className="w-12 h-12 mx-auto opacity-30 mb-3" />
                                        <p className="text-sm font-medium">No doctors found</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── NURSES TAB ──────────────────────────────────────── */}
                        {activeTab === 'nurses' && (
                            <div className="space-y-4">
                                {/* Summary Banner */}
                                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 text-white">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-2xl font-extrabold">{nurses.length}</p>
                                            <p className="text-xs text-emerald-100 font-medium">Total Nurses</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-extrabold">{nurses.reduce((s, n) => s + n.activeJobs, 0)}</p>
                                            <p className="text-xs text-emerald-100 font-medium">Active Jobs</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-extrabold">₹{nurses.reduce((s, n) => s + (n.totalRevenue || 0), 0).toLocaleString()}</p>
                                            <p className="text-xs text-emerald-100 font-medium">Total Revenue</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Nurse Cards */}
                                {nurses.map(nurse => (
                                    <button
                                        key={nurse.id}
                                        onClick={() => setSelectedStaff({ type: 'nurse', data: nurse })}
                                        className="w-full bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:border-emerald-200 transition-all text-left group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                <Heart className="w-7 h-7 text-emerald-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-base font-bold text-slate-900 truncate">{nurse.name}</h3>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${nurse.activeJobs > 0
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-slate-100 text-slate-500'
                                                            }`}>
                                                            {nurse.activeJobs > 0 ? '● Active' : '○ Idle'}
                                                        </span>
                                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                                                    </div>
                                                </div>
                                                {nurse.area && <p className="text-sm text-slate-500">{nurse.area}</p>}

                                                <div className="flex items-center gap-3 mt-3 flex-wrap">
                                                    {nurse.phone && (
                                                        <span className="flex items-center gap-1 text-xs text-slate-400">
                                                            <Phone className="w-3 h-3" /> {nurse.phone}
                                                        </span>
                                                    )}
                                                    {nurse.rating && (
                                                        <span className="flex items-center gap-1 text-xs text-amber-600 font-bold">
                                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {nurse.rating}
                                                        </span>
                                                    )}
                                                    {nurse.experience && (
                                                        <span className="flex items-center gap-1 text-xs text-slate-400">
                                                            <Award className="w-3 h-3" /> {nurse.experience}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 mt-3">
                                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full border border-blue-100">
                                                        {nurse.totalJobs} jobs
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-100">
                                                        {nurse.completedJobs} completed
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-100">
                                                        ₹{(nurse.totalRevenue || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}

                                {nurses.length === 0 && (
                                    <div className="text-center py-16 text-slate-400">
                                        <Heart className="w-12 h-12 mx-auto opacity-30 mb-3" />
                                        <p className="text-sm font-medium">No nurses found</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Detail Modal */}
            {selectedStaff?.type === 'doctor' && renderDoctorDetail(selectedStaff.data)}
            {selectedStaff?.type === 'nurse' && renderNurseDetail(selectedStaff.data)}
        </div>
    );
};

export default StaffManagement;
