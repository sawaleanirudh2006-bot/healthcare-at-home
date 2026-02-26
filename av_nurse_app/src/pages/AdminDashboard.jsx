import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, FileText, Calendar, Activity, TrendingUp, ShoppingBag,
    Clock, CheckCircle, LogOut, LayoutDashboard, Stethoscope,
    UserCheck, RefreshCw, AlertCircle, XCircle, Search, ChevronDown,
    ArrowRight, X, Filter, Zap, ChevronLeft
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (iso) => iso ? new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
}) : '—';

const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
}) : '—';

const statusPill = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const TRACKING_LABELS = {
    null: '—',
    to_godown: '🏪 To Godown',
    items_picked: '🎒 Items Ready',
    on_the_way: '🚗 Travelling',
    arrived: '📍 Arrived',
};

function Badge({ status }) {
    return (
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border capitalize ${statusPill[status] || statusPill.pending}`}>
            {status}
        </span>
    );
}

function StatCard({ icon: Icon, label, value, color, sub, onClick, active }) {
    return (
        <button
            onClick={onClick}
            className={`bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all text-left w-full group ${active ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-slate-100'}`}
        >
            <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className={`w-4 h-4 transition-all ${active ? 'text-indigo-500' : 'text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5'}`} />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{value}</p>
            <p className="text-sm font-semibold text-slate-500 mt-0.5">{label}</p>
            {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </button>
    );
}

// ─── Tabs ────────────────────────────────────────────────────────────────────
const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'bookings', label: 'All', icon: Calendar },
    { id: 'nursing', label: 'Nursing', icon: Activity },
    { id: 'medicine', label: 'Medicine', icon: ShoppingBag },
    { id: 'emergency', label: 'Emergency', icon: AlertCircle },
    { id: 'lab', label: 'Lab Tests', icon: Stethoscope },
    { id: 'insurance', label: 'Insurance', icon: UserCheck },
    { id: 'packages', label: 'Packages', icon: FileText },
    { id: 'ambulance', label: 'Ambulance', icon: Activity },
    { id: 'hospitals', label: 'Hospitals', icon: Search },
    { id: 'prescriptions', label: 'Rx List', icon: FileText },
    { id: 'users', label: 'Users', icon: Users },
];

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    // Data
    const [allBookings, setAllBookings] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [overviewDrill, setOverviewDrill] = useState(null); // 'bookings' | 'jobs' | 'prescriptions' | 'revenue'
    const [timePeriod, setTimePeriod] = useState('all'); // 'all' | 'last' | 'this' | 'next'
    const [graphView, setGraphView] = useState('month'); // 'day' | 'month' | 'year'
    const [graphMetric, setGraphMetric] = useState('both'); // 'revenue' | 'bookings' | 'both'

    const adminData = JSON.parse(localStorage.getItem('userData') || '{}');
    const adminName = adminData?.name || adminData?.full_name || 'Admin';

    const handleLogout = () => {
        if (window.confirm('Logout?')) {
            localStorage.removeItem('userRole');
            localStorage.removeItem('userData');
            localStorage.removeItem('token');
            navigate('/role-selection');
        }
    };

    const loadData = useCallback(async () => {
        try {
            // All bookings
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
                    address: b.address_street || '—',
                    status: b.status || 'pending',
                    nurseId: notes.nurse_id || null,
                    nurseName: notes.assigned_nurse_name || '—',
                    trackingStatus: notes.tracking_status || b.tracking_status || null,
                    doctorNotes: notes.doctor_notes || '—',
                    paymentMethod: notes.payment_method || '—',
                    isMedicine: notes.is_medicine_order || false,
                    isEmergency: notes.is_emergency || (b.service_name || '').includes('EMERGENCY') || false,
                    isLabTest: notes.planType === 'lab-test' || (b.service_name || '').toLowerCase().includes('lab test') || false,
                    isInsurance: notes.planType === 'insurance' || (b.service_name || '').toLowerCase().includes('insurance') || false,
                    isTreatmentPackage: notes.planType === 'treatment-package' || notes.is_package || (b.service_name || '').toLowerCase().includes('package') || false,
                    isAmbulance: (b.service_name || '').toLowerCase().includes('ambulance') || false,
                    isHospital: (b.service_name || '').toLowerCase().includes('hospital') || false,
                    rxPending: notes.prescription_review_pending || false,
                    price: b.total_price || 0,
                    createdAt: b.created_at,
                    userId: b.user_id,
                };
            });
            setAllBookings(mapped);

            // Prescriptions table
            const { data: rxs } = await supabase
                .from('prescriptions')
                .select('*')
                .order('created_at', { ascending: false });
            setPrescriptions(rxs || []);
        } catch (err) {
            console.error('Admin load error:', err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        const i = setInterval(loadData, 10000);
        return () => clearInterval(i);
    }, [loadData]);

    const updateStatus = async (id, newStatus) => {
        await supabase.from('bookings').update({ status: newStatus }).eq('id', id);
        loadData();
    };

    const updateTracking = async (id, newStatus) => {
        // Find existing booking to get notes
        const b = allBookings.find(x => x.id === id);
        if (!b) return;

        // Fetch fresh notes from DB to be safe
        const { data: fresh } = await supabase.from('bookings').select('notes').eq('id', id).single();
        let currentNotes = {};
        try { currentNotes = JSON.parse(fresh?.notes || '{}'); } catch (_) { }

        const updatedNotes = JSON.stringify({ ...currentNotes, tracking_status: newStatus });

        await supabase
            .from('bookings')
            .update({
                notes: updatedNotes,
                tracking_status: newStatus
            })
            .eq('id', id);

        loadData();
    };

    // ─── Time period helpers ───────────────────────────────────────────────
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59);

    const inPeriod = (dateStr) => {
        if (timePeriod === 'all') return true;
        const d = new Date(dateStr);
        if (timePeriod === 'last') return d >= lastMonthStart && d <= lastMonthEnd;
        if (timePeriod === 'this') return d >= thisMonthStart && d <= thisMonthEnd;
        if (timePeriod === 'next') return d >= nextMonthStart && d <= nextMonthEnd;
        return true;
    };

    const periodLabel = timePeriod === 'last' ? lastMonthStart.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
        : timePeriod === 'this' ? thisMonthStart.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
            : timePeriod === 'next' ? nextMonthStart.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
                : 'All Time';

    // Filter bookings by time period
    const periodBookings = allBookings.filter(b => inPeriod(b.date || b.createdAt));

    // Derived lists based on active tab (use periodBookings when in overview)
    const getTabList = () => {
        if (activeTab === 'medicine') return allBookings.filter(b => b.isMedicine);
        if (activeTab === 'emergency') return allBookings.filter(b => b.isEmergency);
        if (activeTab === 'lab') return allBookings.filter(b => b.isLabTest);
        if (activeTab === 'insurance') return allBookings.filter(b => b.isInsurance);
        if (activeTab === 'packages') return allBookings.filter(b => b.isTreatmentPackage);
        if (activeTab === 'ambulance') return allBookings.filter(b => b.isAmbulance);
        if (activeTab === 'hospitals') return allBookings.filter(b => b.isHospital);
        if (activeTab === 'nursing') return allBookings.filter(b => !b.isMedicine && !b.isEmergency && !b.isLabTest && !b.isInsurance && !b.isTreatmentPackage && !b.isAmbulance && !b.isHospital);
        return allBookings;
    };

    const currentTabBookings = getTabList();
    const nursingBookings = periodBookings.filter(b => !b.isMedicine);
    const medicineOrders = periodBookings.filter(b => b.isMedicine);
    const emergencyBookings = periodBookings.filter(b => b.isEmergency);
    const activeJobs = nursingBookings.filter(b => b.status === 'confirmed' || b.status === 'upcoming');
    const completedBookings = periodBookings.filter(b => b.status === 'completed');
    const cancelledBookings = periodBookings.filter(b => b.status === 'cancelled');
    const revenue = periodBookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.price, 0);

    // Monthly breakdown for the stats panel
    const monthlyBreakdown = useMemo(() => {
        const months = [];
        for (let i = -2; i <= 2; i++) {
            const start = new Date(now.getFullYear(), now.getMonth() + i, 1);
            const end = new Date(now.getFullYear(), now.getMonth() + i + 1, 0, 23, 59, 59);
            const label = start.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
            const bks = allBookings.filter(b => {
                const d = new Date(b.date || b.createdAt);
                return d >= start && d <= end;
            });
            months.push({
                label,
                isCurrent: i === 0,
                total: bks.length,
                completed: bks.filter(b => b.status === 'completed').length,
                cancelled: bks.filter(b => b.status === 'cancelled').length,
                revenue: bks.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.price, 0),
                emergency: bks.filter(b => b.isEmergency).length,
                medicine: bks.filter(b => b.isMedicine).length,
            });
        }
        return months;
    }, [allBookings]);

    // Daily revenue for last 30 days (for day-wise line graph)
    const dailyRevenue = useMemo(() => {
        const days = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() - i);
            const end = new Date(d);
            end.setHours(23, 59, 59, 999);
            const dayStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            const bks = allBookings.filter(b => {
                const bd = new Date(b.date || b.createdAt);
                return bd >= d && bd <= end;
            });
            days.push({
                label: dayStr,
                revenue: bks.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.price, 0),
                bookings: bks.length,
            });
        }
        return days;
    }, [allBookings]);

    // Yearly revenue for last 5 years
    const yearlyRevenue = useMemo(() => {
        const years = [];
        const currentYear = new Date().getFullYear();
        for (let y = currentYear - 4; y <= currentYear; y++) {
            const start = new Date(y, 0, 1);
            const end = new Date(y, 11, 31, 23, 59, 59);
            const bks = allBookings.filter(b => {
                const bd = new Date(b.date || b.createdAt);
                return bd >= start && bd <= end;
            });
            years.push({
                label: String(y),
                revenue: bks.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.price, 0),
                bookings: bks.length,
            });
        }
        return years;
    }, [allBookings]);

    // Revenue breakdown by patient
    const revenueByPatient = useMemo(() => {
        const map = {};
        periodBookings.filter(b => b.status !== 'cancelled').forEach(b => {
            const key = b.patient || 'Unknown';
            if (!map[key]) map[key] = { name: key, total: 0, bookings: 0, lastDate: null };
            map[key].total += b.price;
            map[key].bookings += 1;
            const d = b.date || b.createdAt;
            if (!map[key].lastDate || d > map[key].lastDate) map[key].lastDate = d;
        });
        return Object.values(map).sort((a, b) => b.total - a.total);
    }, [periodBookings]);

    // Extract unique "users" from bookings metadata
    const uniqueUsers = [...new Map(
        allBookings.map(b => [b.userId, { id: b.userId, name: b.patient, role: b.isMedicine ? 'Patient (Medicine)' : 'Patient', lastBooking: b.createdAt }])
    ).values()];

    // Collect nurse names from jobs
    const allNursingBookings = allBookings.filter(b => !b.isMedicine);
    const allActiveJobs = allNursingBookings.filter(b => b.status === 'confirmed' || b.status === 'upcoming');
    const uniqueNurses = [...new Map(
        allNursingBookings.filter(b => b.nurseId).map(b => [b.nurseId, { id: b.nurseId, name: b.nurseName, jobs: allNursingBookings.filter(x => x.nurseId === b.nurseId).length, activeJobs: allActiveJobs.filter(x => x.nurseId === b.nurseId).length }])
    ).values()];

    // Filtered list for current tab
    const filterBookings = (list) => {
        let r = list;
        if (statusFilter !== 'all') r = r.filter(b => b.status === statusFilter);
        if (search) {
            const q = search.toLowerCase();
            r = r.filter(b =>
                (b.patient || '').toLowerCase().includes(q) ||
                (b.service || '').toLowerCase().includes(q) ||
                (b.nurseName || '').toLowerCase().includes(q)
            );
        }
        return r;
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* ── TOP NAV ─────────────────────────────────────────────────── */}
            <header className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
                <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                            <Stethoscope className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-base font-extrabold text-slate-900 leading-none">NurseHome</p>
                            <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-widest">Admin Console</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={loadData}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </button>

                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                {adminName.slice(0, 2).toUpperCase()}
                            </div>
                            {adminName}
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100 text-xs font-bold hover:bg-red-100 transition-colors"
                        >
                            <LogOut className="w-3.5 h-3.5" /> Logout
                        </button>
                    </div>
                </div>

                {/* Tab bar */}
                <div className="max-w-[1400px] mx-auto px-6 overflow-x-auto no-scrollbar">
                    <div className="flex gap-1 min-w-max">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${activeTab === tab.id
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* ── CONTENT ─────────────────────────────────────────────────── */}
            <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-slate-500 font-medium">Loading dashboard…</p>
                    </div>
                ) : (
                    <>
                        {/* ══ OVERVIEW ══════════════════════════════════════════ */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between flex-wrap gap-3">
                                    <h2 className="text-xl font-extrabold text-slate-900">System Overview</h2>

                                    {/* Time Period Filter */}
                                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                                        <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
                                        {[
                                            { id: 'all', label: 'All Time' },
                                            { id: 'last', label: 'Last Month' },
                                            { id: 'this', label: 'This Month' },
                                            { id: 'next', label: 'Upcoming' },
                                        ].map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => setTimePeriod(p.id)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${timePeriod === p.id
                                                    ? 'bg-indigo-600 text-white shadow-sm'
                                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {timePeriod !== 'all' && (
                                    <div className="text-sm font-semibold text-indigo-600 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Showing data for: {periodLabel}
                                    </div>
                                )}

                                {/* Stat Cards — Clickable */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                                    <StatCard
                                        icon={Calendar} label="Total Bookings" value={periodBookings.length}
                                        color="bg-blue-50 text-blue-600"
                                        sub={`${medicineOrders.length} medicine · ${emergencyBookings.length} emergency`}
                                        onClick={() => setOverviewDrill(overviewDrill === 'bookings' ? null : 'bookings')}
                                        active={overviewDrill === 'bookings'}
                                    />
                                    <StatCard
                                        icon={Activity} label="Active Nursing" value={activeJobs.length}
                                        color="bg-emerald-50 text-emerald-600"
                                        sub="Confirmed / Upcoming"
                                        onClick={() => setOverviewDrill(overviewDrill === 'jobs' ? null : 'jobs')}
                                        active={overviewDrill === 'jobs'}
                                    />
                                    <StatCard
                                        icon={FileText} label="Prescriptions" value={prescriptions.length}
                                        color="bg-violet-50 text-violet-600"
                                        sub="Total uploaded"
                                        onClick={() => setOverviewDrill(overviewDrill === 'prescriptions' ? null : 'prescriptions')}
                                        active={overviewDrill === 'prescriptions'}
                                    />
                                    <StatCard
                                        icon={TrendingUp} label="Total Revenue" value={`₹${revenue.toLocaleString()}`}
                                        color="bg-amber-50 text-amber-600"
                                        sub={`From ${revenueByPatient.length} patients`}
                                        onClick={() => setOverviewDrill(overviewDrill === 'revenue' ? null : 'revenue')}
                                        active={overviewDrill === 'revenue'}
                                    />
                                    <StatCard
                                        icon={Zap} label="Emergency" value={emergencyBookings.length}
                                        color="bg-red-50 text-red-600"
                                        sub="Critical cases"
                                        onClick={() => setOverviewDrill(overviewDrill === 'emergency' ? null : 'emergency')}
                                        active={overviewDrill === 'emergency'}
                                    />
                                    <StatCard
                                        icon={CheckCircle} label="Completed" value={completedBookings.length}
                                        color="bg-teal-50 text-teal-600"
                                        sub={`${cancelledBookings.length} cancelled`}
                                        onClick={() => setOverviewDrill(overviewDrill === 'completed' ? null : 'completed')}
                                        active={overviewDrill === 'completed'}
                                    />
                                </div>

                                {/* ── Drill-down Panel ───────────────────────────────────── */}
                                {overviewDrill && (
                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-top-2">
                                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                                {overviewDrill === 'bookings' && <><Calendar className="w-4 h-4 text-blue-500" /> All Bookings ({periodBookings.length})</>}
                                                {overviewDrill === 'jobs' && <><Activity className="w-4 h-4 text-emerald-500" /> Active Nursing Jobs ({activeJobs.length})</>}
                                                {overviewDrill === 'prescriptions' && <><FileText className="w-4 h-4 text-violet-500" /> Prescriptions ({prescriptions.length})</>}
                                                {overviewDrill === 'revenue' && <><TrendingUp className="w-4 h-4 text-amber-500" /> Revenue Breakdown — ₹{revenue.toLocaleString()}</>}
                                                {overviewDrill === 'emergency' && <><Zap className="w-4 h-4 text-red-500" /> Emergency Cases ({emergencyBookings.length})</>}
                                                {overviewDrill === 'completed' && <><CheckCircle className="w-4 h-4 text-teal-500" /> Completed Bookings ({completedBookings.length})</>}
                                            </h3>
                                            <button onClick={() => setOverviewDrill(null)} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
                                                <X className="w-4 h-4 text-slate-500" />
                                            </button>
                                        </div>
                                        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                                            {/* Revenue by patient */}
                                            {overviewDrill === 'revenue' && (
                                                <table className="w-full text-sm">
                                                    <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase sticky top-0">
                                                        <tr>
                                                            {['#', 'Patient', 'Bookings', 'Revenue', 'Last Booking'].map(h => (
                                                                <th key={h} className="px-4 py-3 text-left">{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {revenueByPatient.map((r, idx) => (
                                                            <tr key={r.name} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                                                                <td className="px-4 py-3 text-xs text-slate-400 font-bold">{idx + 1}</td>
                                                                <td className="px-4 py-3 font-semibold text-slate-800">{r.name}</td>
                                                                <td className="px-4 py-3 text-slate-600">{r.bookings}</td>
                                                                <td className="px-4 py-3 font-bold text-emerald-600">₹{r.total.toLocaleString()}</td>
                                                                <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(r.lastDate)}</td>
                                                            </tr>
                                                        ))}
                                                        {revenueByPatient.length === 0 && (
                                                            <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400 text-sm">No revenue data</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            )}

                                            {/* Booking list drill-down */}
                                            {(overviewDrill === 'bookings' || overviewDrill === 'jobs' || overviewDrill === 'emergency' || overviewDrill === 'completed') && (
                                                <table className="w-full text-sm">
                                                    <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase sticky top-0">
                                                        <tr>
                                                            {['Patient', 'Service', 'Date', 'Nurse', 'Status', 'Price'].map(h => (
                                                                <th key={h} className="px-4 py-3 text-left">{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(overviewDrill === 'bookings' ? periodBookings
                                                            : overviewDrill === 'jobs' ? activeJobs
                                                                : overviewDrill === 'emergency' ? emergencyBookings
                                                                    : completedBookings
                                                        ).map(b => (
                                                            <tr key={b.id} className={`border-t border-slate-50 hover:bg-slate-50 transition-colors ${b.isEmergency ? 'bg-red-50/30' : ''}`}>
                                                                <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                                                                    {b.patient}
                                                                    {b.isEmergency && <span className="ml-1.5 text-[9px] font-black px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full">🚨</span>}
                                                                </td>
                                                                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{b.service}</td>
                                                                <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{fmtDate(b.date || b.createdAt)}</td>
                                                                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{b.nurseName}</td>
                                                                <td className="px-4 py-3"><Badge status={b.status} /></td>
                                                                <td className="px-4 py-3 font-bold text-slate-900">₹{b.price}</td>
                                                            </tr>
                                                        ))}
                                                        {(overviewDrill === 'bookings' ? periodBookings
                                                            : overviewDrill === 'jobs' ? activeJobs
                                                                : overviewDrill === 'emergency' ? emergencyBookings
                                                                    : completedBookings
                                                        ).length === 0 && (
                                                                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400 text-sm">No data found for this period</td></tr>
                                                            )}
                                                    </tbody>
                                                </table>
                                            )}

                                            {/* Prescriptions list */}
                                            {overviewDrill === 'prescriptions' && (
                                                <table className="w-full text-sm">
                                                    <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase sticky top-0">
                                                        <tr>
                                                            {['ID', 'Patient ID', 'Status', 'File', 'Uploaded'].map(h => (
                                                                <th key={h} className="px-4 py-3 text-left">{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {prescriptions.map(rx => (
                                                            <tr key={rx.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                                                                <td className="px-4 py-3 font-mono text-xs text-slate-400">{String(rx.id).slice(0, 8)}</td>
                                                                <td className="px-4 py-3 font-mono text-xs text-slate-500">{String(rx.user_id || '—').slice(0, 12)}…</td>
                                                                <td className="px-4 py-3">
                                                                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${rx.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                                        {rx.status || 'pending'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    {rx.file_url ? (
                                                                        <a href={rx.file_url} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold text-xs hover:underline">View →</a>
                                                                    ) : <span className="text-slate-400 text-xs">—</span>}
                                                                </td>
                                                                <td className="px-4 py-3 text-xs text-slate-500">{fmt(rx.created_at)}</td>
                                                            </tr>
                                                        ))}
                                                        {prescriptions.length === 0 && (
                                                            <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400 text-sm">No prescriptions</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ── Monthly Booking Trends ─────────────────────────────── */}
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                    <div className="px-5 py-4 border-b border-slate-100">
                                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-indigo-500" />
                                            Monthly Booking Trends
                                        </h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                                                <tr>
                                                    {['Month', 'Total', 'Completed', 'Cancelled', 'Emergency', 'Medicine', 'Revenue'].map(h => (
                                                        <th key={h} className="px-4 py-3 text-left">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {monthlyBreakdown.map(m => (
                                                    <tr key={m.label} className={`border-t border-slate-50 hover:bg-slate-50 transition-colors ${m.isCurrent ? 'bg-indigo-50/40 font-semibold' : ''}`}>
                                                        <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">
                                                            {m.label}
                                                            {m.isCurrent && <span className="ml-2 text-[9px] font-black px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded-full uppercase">Current</span>}
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-900 font-bold">{m.total}</td>
                                                        <td className="px-4 py-3 text-emerald-600 font-bold">{m.completed}</td>
                                                        <td className="px-4 py-3 text-red-500 font-bold">{m.cancelled}</td>
                                                        <td className="px-4 py-3 text-red-600 font-bold">{m.emergency}</td>
                                                        <td className="px-4 py-3 text-blue-600 font-bold">{m.medicine}</td>
                                                        <td className="px-4 py-3 font-extrabold text-slate-900">₹{m.revenue.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>


                                {/* ── Revenue & Bookings Line Graph ═══════════════════════ */}
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-amber-500" />
                                            Analytics
                                        </h3>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {/* Metric toggle */}
                                            <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
                                                {[{ id: 'both', label: 'Both' }, { id: 'revenue', label: 'Revenue' }, { id: 'bookings', label: 'Bookings' }].map(v => (
                                                    <button
                                                        key={v.id}
                                                        onClick={() => setGraphMetric(v.id)}
                                                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${graphMetric === v.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                    >
                                                        {v.label}
                                                    </button>
                                                ))}
                                            </div>
                                            {/* Time toggle */}
                                            <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
                                                {[{ id: 'day', label: 'Day' }, { id: 'month', label: 'Month' }, { id: 'year', label: 'Year' }].map(v => (
                                                    <button
                                                        key={v.id}
                                                        onClick={() => setGraphView(v.id)}
                                                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${graphView === v.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                    >
                                                        {v.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Legend */}
                                    <div className="px-5 pt-3 flex items-center gap-5">
                                        {(graphMetric === 'both' || graphMetric === 'revenue') && (
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-8 h-[3px] rounded-full bg-indigo-500" />
                                                <span className="text-[11px] font-semibold text-slate-500">Revenue (₹)</span>
                                            </div>
                                        )}
                                        {(graphMetric === 'both' || graphMetric === 'bookings') && (
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-8 h-[3px] rounded-full bg-emerald-500" />
                                                <span className="text-[11px] font-semibold text-slate-500">Bookings</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5 pt-2">
                                        {(() => {
                                            const dataPoints = graphView === 'day'
                                                ? dailyRevenue
                                                : graphView === 'year'
                                                    ? yearlyRevenue
                                                    : monthlyBreakdown.map(m => ({ label: m.label, revenue: m.revenue, bookings: m.total }));

                                            const showRev = graphMetric === 'both' || graphMetric === 'revenue';
                                            const showBk = graphMetric === 'both' || graphMetric === 'bookings';
                                            const maxRev = Math.max(...dataPoints.map(d => d.revenue), 1);
                                            const maxBk = Math.max(...dataPoints.map(d => d.bookings), 1);
                                            const totalRev = dataPoints.reduce((s, d) => s + d.revenue, 0);
                                            const totalBk = dataPoints.reduce((s, d) => s + d.bookings, 0);

                                            // SVG dimensions
                                            const W = 820;
                                            const H = 260;
                                            const padL = 58;
                                            const padR = showBk && showRev ? 45 : 20;
                                            const padT = 24;
                                            const padB = 44;
                                            const chartW = W - padL - padR;
                                            const chartH = H - padT - padB;
                                            const gridRows = 4;

                                            // Build revenue points
                                            const revPts = dataPoints.map((d, i) => ({
                                                x: padL + (dataPoints.length > 1 ? (i / (dataPoints.length - 1)) * chartW : chartW / 2),
                                                y: padT + chartH - (maxRev > 0 ? (d.revenue / maxRev) * chartH : 0),
                                                ...d
                                            }));
                                            // Build bookings points
                                            const bkPts = dataPoints.map((d, i) => ({
                                                x: padL + (dataPoints.length > 1 ? (i / (dataPoints.length - 1)) * chartW : chartW / 2),
                                                y: padT + chartH - (maxBk > 0 ? (d.bookings / maxBk) * chartH : 0),
                                                ...d
                                            }));

                                            const revLine = revPts.map(p => `${p.x},${p.y}`).join(' ');
                                            const revArea = `${padL},${padT + chartH} ${revLine} ${revPts[revPts.length - 1]?.x || padL},${padT + chartH}`;
                                            const bkLine = bkPts.map(p => `${p.x},${p.y}`).join(' ');
                                            const bkArea = `${padL},${padT + chartH} ${bkLine} ${bkPts[bkPts.length - 1]?.x || padL},${padT + chartH}`;

                                            // Label spacing
                                            const labelEvery = graphView === 'day' ? 5 : graphView === 'year' ? 1 : 1;
                                            const periodName = graphView === 'day' ? 'day' : graphView === 'year' ? 'year' : 'month';

                                            return (
                                                <div className="space-y-3">
                                                    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: 300 }}>
                                                        <defs>
                                                            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                                                                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.01" />
                                                            </linearGradient>
                                                            <linearGradient id="bkGrad" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                                                                <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
                                                            </linearGradient>
                                                        </defs>

                                                        {/* Grid lines + Y labels (left = revenue) */}
                                                        {[...Array(gridRows + 1)].map((_, i) => {
                                                            const yPos = padT + (i / gridRows) * chartH;
                                                            const rVal = maxRev - (i / gridRows) * maxRev;
                                                            const bVal = Math.round(maxBk - (i / gridRows) * maxBk);
                                                            return (
                                                                <g key={i}>
                                                                    <line x1={padL} y1={yPos} x2={W - padR} y2={yPos} stroke="#f1f5f9" strokeWidth="1" strokeDasharray={i === gridRows ? '0' : '4,4'} />
                                                                    {showRev && (
                                                                        <text x={padL - 8} y={yPos + 4} textAnchor="end" fontSize="9" fontWeight="600" fill="#818cf8">
                                                                            {rVal >= 1000 ? `₹${(rVal / 1000).toFixed(0)}k` : `₹${Math.round(rVal)}`}
                                                                        </text>
                                                                    )}
                                                                    {showBk && showRev && (
                                                                        <text x={W - padR + 6} y={yPos + 4} textAnchor="start" fontSize="9" fontWeight="600" fill="#34d399">
                                                                            {bVal}
                                                                        </text>
                                                                    )}
                                                                    {showBk && !showRev && (
                                                                        <text x={padL - 8} y={yPos + 4} textAnchor="end" fontSize="9" fontWeight="600" fill="#34d399">
                                                                            {bVal}
                                                                        </text>
                                                                    )}
                                                                </g>
                                                            );
                                                        })}

                                                        {/* Axes */}
                                                        <line x1={padL} y1={padT + chartH} x2={W - padR} y2={padT + chartH} stroke="#e2e8f0" strokeWidth="2" />
                                                        <line x1={padL} y1={padT} x2={padL} y2={padT + chartH} stroke="#e2e8f0" strokeWidth="2" />

                                                        {/* Revenue area + line */}
                                                        {showRev && revPts.length > 1 && (
                                                            <>
                                                                <polygon points={revArea} fill="url(#revGrad)" />
                                                                <polyline points={revLine} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            </>
                                                        )}

                                                        {/* Bookings area + line */}
                                                        {showBk && bkPts.length > 1 && (
                                                            <>
                                                                <polygon points={bkArea} fill="url(#bkGrad)" />
                                                                <polyline points={bkLine} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            </>
                                                        )}

                                                        {/* Data points (both metrics) */}
                                                        {dataPoints.map((d, i) => {
                                                            const showLbl = (i % labelEvery === 0) || i === dataPoints.length - 1;
                                                            const rPt = revPts[i];
                                                            const bPt = bkPts[i];
                                                            const topY = Math.min(showRev ? rPt.y : 999, showBk ? bPt.y : 999);
                                                            return (
                                                                <g key={i} className="group">
                                                                    {/* Vertical hover line */}
                                                                    <line x1={rPt.x} y1={padT} x2={rPt.x} y2={padT + chartH} stroke="#6366f1" strokeWidth="1" strokeDasharray="3,3" opacity="0" className="group-hover:opacity-30 transition-opacity" />
                                                                    {/* Invisible hover target */}
                                                                    <rect x={rPt.x - (chartW / dataPoints.length / 2)} y={padT} width={chartW / dataPoints.length} height={chartH} fill="transparent" className="cursor-pointer" />

                                                                    {/* Revenue dot */}
                                                                    {showRev && (
                                                                        <>
                                                                            <circle cx={rPt.x} cy={rPt.y} r="3.5" fill="#fff" stroke="#6366f1" strokeWidth="2" />
                                                                            <circle cx={rPt.x} cy={rPt.y} r="5.5" fill="#6366f1" opacity="0" className="group-hover:opacity-100 transition-opacity" />
                                                                        </>
                                                                    )}
                                                                    {/* Bookings dot */}
                                                                    {showBk && (
                                                                        <>
                                                                            <circle cx={bPt.x} cy={bPt.y} r="3.5" fill="#fff" stroke="#10b981" strokeWidth="2" />
                                                                            <circle cx={bPt.x} cy={bPt.y} r="5.5" fill="#10b981" opacity="0" className="group-hover:opacity-100 transition-opacity" />
                                                                        </>
                                                                    )}

                                                                    {/* Tooltip */}
                                                                    <g className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ pointerEvents: 'none' }}>
                                                                        <rect x={rPt.x - 56} y={topY - 62} width="112" height={showRev && showBk ? 50 : 36} rx="8" fill="#1e293b" />
                                                                        <polygon points={`${rPt.x - 5},${topY - 12} ${rPt.x + 5},${topY - 12} ${rPt.x},${topY - 6}`} fill="#1e293b" />
                                                                        {showRev && (
                                                                            <text x={rPt.x} y={topY - 44} textAnchor="middle" fontSize="11" fontWeight="700" fill="#a5b4fc">
                                                                                ₹{d.revenue.toLocaleString()}
                                                                            </text>
                                                                        )}
                                                                        {showBk && (
                                                                            <text x={rPt.x} y={topY - (showRev ? 30 : 44)} textAnchor="middle" fontSize="11" fontWeight="700" fill="#6ee7b7">
                                                                                {d.bookings} bookings
                                                                            </text>
                                                                        )}
                                                                        <text x={rPt.x} y={topY - (showRev && showBk ? 16 : 30)} textAnchor="middle" fontSize="9" fontWeight="500" fill="#94a3b8">
                                                                            {d.label}
                                                                        </text>
                                                                    </g>

                                                                    {/* X-axis labels */}
                                                                    {showLbl && (
                                                                        <text
                                                                            x={rPt.x} y={padT + chartH + 20}
                                                                            textAnchor="middle" fontSize="9" fontWeight="600"
                                                                            fill="#94a3b8"
                                                                            transform={graphView === 'day' ? `rotate(-40, ${rPt.x}, ${padT + chartH + 20})` : ''}
                                                                        >
                                                                            {graphView === 'month' ? d.label.split(' ')[0] : d.label}
                                                                        </text>
                                                                    )}
                                                                </g>
                                                            );
                                                        })}
                                                    </svg>

                                                    {/* Summary footer */}
                                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-3">
                                                        <div className="flex items-center gap-5">
                                                            {showRev && (
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-indigo-400 uppercase">Total Revenue</p>
                                                                    <p className="text-lg font-extrabold text-slate-900">₹{totalRev.toLocaleString()}</p>
                                                                </div>
                                                            )}
                                                            {showBk && (
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-emerald-400 uppercase">Total Bookings</p>
                                                                    <p className="text-lg font-extrabold text-slate-900">{totalBk}</p>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Avg / {periodName}</p>
                                                                <p className="text-lg font-extrabold text-slate-900">
                                                                    {showRev ? `₹${Math.round(totalRev / dataPoints.length).toLocaleString()}` : `${(totalBk / dataPoints.length).toFixed(1)}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {(() => {
                                                            if (dataPoints.length < 2) return null;
                                                            const metric = showRev ? 'revenue' : 'bookings';
                                                            const last = dataPoints[dataPoints.length - 1][metric];
                                                            const prev = dataPoints[dataPoints.length - 2][metric];
                                                            if (prev === 0) return null;
                                                            const pct = ((last - prev) / prev * 100).toFixed(1);
                                                            const isUp = Number(pct) >= 0;
                                                            return (
                                                                <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl ${isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                                                                    <TrendingUp className={`w-4 h-4 ${!isUp ? 'rotate-180' : ''}`} />
                                                                    <span className="text-sm font-extrabold">{isUp ? '+' : ''}{pct}%</span>
                                                                    <span className="text-[10px] font-semibold opacity-70">vs prev {periodName}</span>
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Recent bookings preview */}
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                                        <h3 className="font-bold text-slate-900">Recent Bookings</h3>
                                        <button onClick={() => setActiveTab('bookings')} className="text-xs font-bold text-indigo-600 hover:underline">View All →</button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                                                <tr>
                                                    {['Patient', 'Service', 'Date', 'Nurse', 'Status', 'Price'].map(h => (
                                                        <th key={h} className="px-4 py-3 text-left">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allBookings.slice(0, 8).map(b => (
                                                    <tr key={b.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                                                        <td className="px-4 py-3 font-semibold text-slate-800">{b.patient}</td>
                                                        <td className="px-4 py-3 text-slate-600">{b.service}</td>
                                                        <td className="px-4 py-3 text-slate-500 text-xs">{fmt(b.date || b.createdAt)}</td>
                                                        <td className="px-4 py-3 text-slate-600">{b.nurseName}</td>
                                                        <td className="px-4 py-3"><Badge status={b.status} /></td>
                                                        <td className="px-4 py-3 font-bold text-slate-900">₹{b.price}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Nurses overview */}
                                {uniqueNurses.length > 0 && (
                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                        <div className="px-5 py-4 border-b border-slate-100">
                                            <h3 className="font-bold text-slate-900">Nurse Summary</h3>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-y divide-slate-100">
                                            {uniqueNurses.map(n => (
                                                <div key={n.id} className="p-4">
                                                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center mb-2">
                                                        {n.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-800">{n.name}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{n.jobs} total • {n.activeJobs} active</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ══ ALL BOOKINGS / CATEGORIES ═════════════════════════════ */}
                        {activeTab !== 'overview' && activeTab !== 'users' && activeTab !== 'prescriptions' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-extrabold text-slate-900 capitalize">
                                        {activeTab} Bookings
                                        <span className="text-slate-400 font-normal text-base ml-2">({currentTabBookings.length})</span>
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                value={search}
                                                onChange={e => setSearch(e.target.value)}
                                                placeholder="Search patient, service…"
                                                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl w-56 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                            />
                                        </div>
                                        <div className="relative">
                                            <select
                                                value={statusFilter}
                                                onChange={e => setStatusFilter(e.target.value)}
                                                className="appearance-none pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 font-semibold"
                                            >
                                                <option value="all">All Status</option>
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                                                <tr>
                                                    {['ID', 'Patient', 'Service', 'Date', 'Time', 'Nurse', 'Tracking', 'Doctor Notes', 'Payment', 'Price', 'Status', 'Actions'].map(h => (
                                                        <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filterBookings(currentTabBookings).map(b => (
                                                    <tr key={b.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                                                        <td className="px-4 py-3 font-mono text-xs text-slate-400">{String(b.id).slice(0, 8)}</td>
                                                        <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{b.patient}</td>
                                                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{b.service}</td>
                                                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{b.date ? fmt(b.date) : fmt(b.createdAt)}</td>
                                                        <td className="px-4 py-3 text-xs text-slate-500">{b.time}</td>
                                                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{b.nurseName}</td>
                                                        <td className="px-4 py-3 text-xs whitespace-nowrap">{TRACKING_LABELS[b.trackingStatus] || '—'}</td>
                                                        <td className="px-4 py-3 text-xs text-slate-500 max-w-[150px] truncate" title={b.doctorNotes}>{b.doctorNotes}</td>
                                                        <td className="px-4 py-3 text-xs text-slate-500 uppercase">{b.paymentMethod}</td>
                                                        <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">₹{b.price}</td>
                                                        <td className="px-4 py-3"><Badge status={b.status} /></td>
                                                        <td className="px-4 py-3">
                                                            {b.status === 'pending' && (
                                                                <div className="flex gap-1">
                                                                    <button onClick={() => updateStatus(b.id, 'confirmed')} className="px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1">
                                                                        <CheckCircle className="w-3 h-3" /> Confirm
                                                                    </button>
                                                                    <button onClick={() => updateStatus(b.id, 'cancelled')} className="px-2 py-1 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1">
                                                                        <XCircle className="w-3 h-3" /> Cancel
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {b.status === 'confirmed' && !b.isMedicine && (
                                                                <button onClick={() => updateStatus(b.id, 'completed')} className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" /> Complete
                                                                </button>
                                                            )}
                                                            {b.isInsurance && b.rawNotes && (
                                                                <button
                                                                    onClick={() => {
                                                                        const n = JSON.parse(b.rawNotes).insurance_details;
                                                                        alert(`Insurance Info:\nName: ${n.applicantName}\nAge: ${n.age}\nNominee: ${n.nomineeName}\nRelation: ${n.nomineeRelation}`);
                                                                    }}
                                                                    className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-bold rounded hover:bg-blue-100 transition-colors"
                                                                >
                                                                    View Application
                                                                </button>
                                                            )}
                                                            {b.isEmergency && b.rawNotes && (
                                                                <button
                                                                    onClick={() => {
                                                                        const n = JSON.parse(b.rawNotes);
                                                                        alert(`Emergency Detail:\nType: ${n.emergency_type}\nSymptoms: ${n.symptoms}\nNotes: ${n.notes}`);
                                                                    }}
                                                                    className="px-2 py-1 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold rounded hover:bg-red-100 transition-colors"
                                                                >
                                                                    Case Info
                                                                </button>
                                                            )}
                                                            {b.status === 'confirmed' && b.isMedicine && (
                                                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                                    {!b.trackingStatus && (
                                                                        <button onClick={() => updateTracking(b.id, 'to_godown')} className="px-2 py-1 bg-indigo-500 text-white text-[10px] font-bold rounded hover:bg-indigo-600 transition-colors">
                                                                            Process
                                                                        </button>
                                                                    )}
                                                                    {b.trackingStatus === 'to_godown' && (
                                                                        <button onClick={() => updateTracking(b.id, 'items_picked')} className="px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded hover:bg-amber-600 transition-colors">
                                                                            Pack
                                                                        </button>
                                                                    )}
                                                                    {b.trackingStatus === 'items_picked' && (
                                                                        <button onClick={() => updateTracking(b.id, 'on_the_way')} className="px-2 py-1 bg-blue-500 text-white text-[10px] font-bold rounded hover:bg-blue-600 transition-colors">
                                                                            Ship
                                                                        </button>
                                                                    )}
                                                                    {b.trackingStatus === 'on_the_way' && (
                                                                        <button onClick={() => updateTracking(b.id, 'arrived')} className="px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded hover:bg-emerald-600 transition-colors">
                                                                            Delivered
                                                                        </button>
                                                                    )}
                                                                    {b.trackingStatus === 'arrived' && (
                                                                        <button onClick={() => updateStatus(b.id, 'completed')} className="px-2 py-1 bg-slate-700 text-white text-[10px] font-bold rounded hover:bg-slate-800 transition-colors">
                                                                            Mark Done
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {filterBookings(currentTabBookings).length === 0 && (
                                                    <tr>
                                                        <td colSpan={12} className="px-4 py-12 text-center text-slate-400 text-sm">No bookings found</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ══ NURSING JOBS ══════════════════════════════════════ */}
                        {activeTab === 'nursing' && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-extrabold text-slate-900">Nursing Jobs <span className="text-slate-400 font-normal text-base">({nursingBookings.length})</span></h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {nursingBookings.map(b => (
                                        <div key={b.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <p className="font-bold text-slate-900">{b.service}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">👤 {b.patient}</p>
                                                </div>
                                                <Badge status={b.status} />
                                            </div>

                                            <div className="space-y-1.5 text-xs text-slate-500 mb-3">
                                                <div className="flex justify-between">
                                                    <span>📅 Date</span>
                                                    <span className="font-semibold text-slate-700">{b.date || '—'} {b.time}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>👩‍⚕️ Nurse</span>
                                                    <span className="font-semibold text-slate-700">{b.nurseName}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>🚦 Tracking</span>
                                                    <span className="font-semibold text-slate-700">{TRACKING_LABELS[b.trackingStatus] || 'Awaiting nurse'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>💰 Price</span>
                                                    <span className="font-bold text-emerald-600">₹{b.price}</span>
                                                </div>
                                            </div>

                                            {b.doctorNotes && b.doctorNotes !== '—' && (
                                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5 mb-3">
                                                    <p className="text-[10px] font-bold text-amber-700 mb-0.5">Doctor Notes</p>
                                                    <p className="text-xs text-amber-800">{b.doctorNotes}</p>
                                                </div>
                                            )}

                                            {b.rxPending && (
                                                <div className="bg-violet-50 border border-violet-100 rounded-xl p-2 mb-3 flex items-center gap-2">
                                                    <AlertCircle className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                                                    <p className="text-xs font-bold text-violet-700">Prescription review pending</p>
                                                </div>
                                            )}

                                            {b.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => updateStatus(b.id, 'confirmed')} className="flex-1 h-8 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-colors">Confirm</button>
                                                    <button onClick={() => updateStatus(b.id, 'cancelled')} className="flex-1 h-8 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors">Cancel</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {nursingBookings.length === 0 && (
                                        <div className="col-span-3 text-center py-16 text-slate-400">
                                            <Activity className="w-12 h-12 mx-auto opacity-30 mb-3" />
                                            <p className="text-sm font-medium">No nursing jobs yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ══ PRESCRIPTIONS ══════════════════════════════════════ */}
                        {activeTab === 'prescriptions' && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-extrabold text-slate-900">Prescriptions <span className="text-slate-400 font-normal text-base">({prescriptions.length})</span></h2>

                                {/* Pending bookings that have prescription review pending */}
                                {allBookings.filter(b => b.rxPending).length > 0 && (
                                    <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4">
                                        <p className="text-sm font-bold text-violet-800 mb-3 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" /> Bookings Awaiting Prescription Review ({allBookings.filter(b => b.rxPending).length})
                                        </p>
                                        <div className="space-y-2">
                                            {allBookings.filter(b => b.rxPending).map(b => (
                                                <div key={b.id} className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{b.patient} — {b.service}</p>
                                                        <p className="text-xs text-slate-500">{fmt(b.createdAt)}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => navigate('/doctor/dashboard')}
                                                        className="px-3 py-1.5 bg-violet-600 text-white text-xs font-bold rounded-xl hover:bg-violet-700 transition-colors"
                                                    >
                                                        Review →
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                    {prescriptions.length === 0 ? (
                                        <div className="text-center py-16 text-slate-400">
                                            <FileText className="w-12 h-12 mx-auto opacity-30 mb-3" />
                                            <p className="text-sm font-medium">No prescriptions found</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                                                    <tr>
                                                        {['ID', 'Patient ID', 'Doctor ID', 'Status', 'File', 'Uploaded'].map(h => (
                                                            <th key={h} className="px-4 py-3 text-left">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {prescriptions.map(rx => (
                                                        <tr key={rx.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                                                            <td className="px-4 py-3 font-mono text-xs text-slate-400">{String(rx.id).slice(0, 8)}</td>
                                                            <td className="px-4 py-3 font-mono text-xs text-slate-500">{String(rx.user_id || '—').slice(0, 12)}…</td>
                                                            <td className="px-4 py-3 font-mono text-xs text-slate-500">{String(rx.doctor_id || '—').slice(0, 12)}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${rx.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                                    rx.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                                        'bg-slate-100 text-slate-600 border-slate-200'
                                                                    }`}>
                                                                    {rx.status || 'pending'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {rx.file_url ? (
                                                                    <a href={rx.file_url} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold text-xs hover:underline">View File →</a>
                                                                ) : <span className="text-slate-400 text-xs">—</span>}
                                                            </td>
                                                            <td className="px-4 py-3 text-xs text-slate-500">{fmt(rx.created_at)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ══ USER LOGINS ══════════════════════════════════════ */}
                        {activeTab === 'users' && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-extrabold text-slate-900">All Users</h2>

                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                    {/* Patients */}
                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                                            <h3 className="font-bold text-slate-900 flex items-center gap-2"><UserCheck className="w-4 h-4 text-blue-500" /> Patients ({uniqueUsers.length})</h3>
                                        </div>
                                        <div className="divide-y divide-slate-50">
                                            {uniqueUsers.map(u => (
                                                <div key={u.id} className="px-5 py-3 hover:bg-slate-50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                                                            {u.name?.slice(0, 2).toUpperCase() || 'P'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                                                            <p className="text-xs text-slate-400 font-mono truncate">{String(u.id).slice(0, 16)}…</p>
                                                        </div>
                                                        <span className="text-xs text-slate-400">{fmt(u.lastBooking)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {uniqueUsers.length === 0 && <div className="px-5 py-6 text-center text-slate-400 text-sm">No patients yet</div>}
                                        </div>
                                    </div>

                                    {/* Nurses */}
                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                        <div className="px-5 py-4 border-b border-slate-100">
                                            <h3 className="font-bold text-slate-900 flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500" /> Nurses ({uniqueNurses.length})</h3>
                                        </div>
                                        <div className="divide-y divide-slate-50">
                                            {uniqueNurses.map(n => (
                                                <div key={n.id} className="px-5 py-3 hover:bg-slate-50 transition-colors flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                                                        {n.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'N'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-slate-800">{n.name}</p>
                                                        <p className="text-xs text-slate-400">{n.jobs} total jobs • {n.activeJobs} active now</p>
                                                    </div>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${n.activeJobs > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                        {n.activeJobs > 0 ? 'Active' : 'Idle'}
                                                    </span>
                                                </div>
                                            ))}
                                            {uniqueNurses.length === 0 && <div className="px-5 py-6 text-center text-slate-400 text-sm">No nurses have accepted jobs yet</div>}
                                        </div>
                                    </div>

                                    {/* Quick actions */}
                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-purple-500" /> Quick Actions</h3>
                                        <div className="space-y-3">
                                            <button onClick={() => navigate('/doctor/dashboard')} className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50 transition-all text-left">
                                                <FileText className="w-5 h-5 text-violet-500" />
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">Doctor Dashboard</p>
                                                    <p className="text-xs text-slate-500">Review prescriptions</p>
                                                </div>
                                            </button>
                                            <button onClick={() => navigate('/nurse/dashboard')} className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all text-left">
                                                <Activity className="w-5 h-5 text-emerald-500" />
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">Nurse Dashboard</p>
                                                    <p className="text-xs text-slate-500">View nurse jobs</p>
                                                </div>
                                            </button>

                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">Staff Management</p>
                                            <button onClick={() => navigate('/staff-management?tab=doctors')} className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all text-left">
                                                <Stethoscope className="w-5 h-5 text-blue-500" />
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">Doctors</p>
                                                    <p className="text-xs text-slate-500">View doctor details & stats</p>
                                                </div>
                                            </button>
                                            <button onClick={() => navigate('/staff-management?tab=nurses')} className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50 transition-all text-left">
                                                <UserCheck className="w-5 h-5 text-teal-500" />
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">Nurses</p>
                                                    <p className="text-xs text-slate-500">View nurse details & jobs</p>
                                                </div>
                                            </button>

                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">Analytics</p>
                                            <button onClick={() => navigate('/revenue-reports')} className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50 transition-all text-left">
                                                <TrendingUp className="w-5 h-5 text-amber-500" />
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">Revenue / Reports</p>
                                                    <p className="text-xs text-slate-500">Analytics, trends & breakdowns</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
