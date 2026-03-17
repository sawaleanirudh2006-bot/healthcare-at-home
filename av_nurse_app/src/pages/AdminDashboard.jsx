import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, FileText, Calendar, Activity, TrendingUp,
    Clock, CheckCircle, LogOut, LayoutDashboard, Stethoscope,
    UserCheck, RefreshCw, AlertCircle, XCircle, Search, ChevronDown,
    ArrowRight, X, Filter, Zap, Package, ShieldCheck, Eye, ExternalLink,
    Gift, Plus, Trash2, ToggleLeft, ToggleRight, Tag
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
    pending: 'bg-amber-50 text-amber-700 border-amber-100',
    confirmed: 'bg-teal-50 text-teal-700 border-teal-100',
    completed: 'bg-teal-600 text-white border-teal-600',
    cancelled: 'bg-red-50 text-red-700 border-red-100',
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
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border capitalize ${statusPill[status] || statusPill.pending}`}>
            {status}
        </span>
    );
}

function StatCard({ icon: Icon, label, value, color, sub, onClick, active }) {
    return (
        <button
            onClick={onClick}
            className={`bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all text-left w-full group ${active ? 'border-teal-400 ring-2 ring-teal-200' : 'border-slate-100'}`}
        >
            <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${color.replace('blue', 'teal').replace('indigo', 'teal').replace('violet', 'teal')}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className={`w-4 h-4 transition-all ${active ? 'text-teal-500' : 'text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5'}`} />
            </div>
            <p className="text-2xl font-extrabold text-black">{value}</p>
            <p className="text-sm font-bold text-slate-500 mt-1">{label}</p>
            {sub && <p className="text-[10px] font-medium text-slate-400 mt-1">{sub}</p>}
        </button>
    );
}

// ─── Tabs ────────────────────────────────────────────────────────────────────
const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'nurses_reg', label: 'Nurses', icon: UserCheck },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope },
    { id: 'verification', label: 'Verification', icon: ShieldCheck, highlight: true },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'offers', label: 'Offers', icon: Gift },
];

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Data
    const [allBookings, setAllBookings] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [nurses, setNurses] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [overviewDrill, setOverviewDrill] = useState(null); // 'bookings' | 'jobs' | 'prescriptions' | 'revenue'
    const [timePeriod, setTimePeriod] = useState('all'); // 'all' | 'last' | 'this' | 'next'
    const [graphView, setGraphView] = useState('month'); // 'day' | 'month' | 'year'
    const [graphMetric, setGraphMetric] = useState('both'); // 'revenue' | 'bookings' | 'both'
    const [verificationModal, setVerificationModal] = useState(null); // { type: 'doctor'|'nurse', data: {} }
    const [doctorFilter, setDoctorFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
    const [nurseFilter, setNurseFilter] = useState('all');
    const [rejectReason, setRejectReason] = useState(''); // optional reason when rejecting

    // ─── Offers state ────────────────────────────────────────────────────────
    const [offers, setOffers] = useState([]);
    const [showOfferForm, setShowOfferForm] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);
    const [offerForm, setOfferForm] = useState({
        title: '', description: '', discount_type: 'percentage', discount_value: '',
        occasion: 'custom', start_date: '', end_date: '', is_active: true
    });

    const OCCASIONS = [
        { value: 'womens_day', label: "Women's Day" },
        { value: 'mens_day', label: "Men's Day" },
        { value: 'world_health_day', label: 'World Health Day' },
        { value: 'heart_day', label: 'World Heart Day' },
        { value: 'diwali', label: 'Diwali' },
        { value: 'christmas', label: 'Christmas' },
        { value: 'new_year', label: 'New Year' },
        { value: 'birthday', label: "User's Birthday" },
        { value: 'independence_day', label: 'Independence Day' },
        { value: 'republic_day', label: 'Republic Day' },
        { value: 'custom', label: 'Custom / Other' },
    ];

    // Load offers from Supabase (falls back to localStorage)
    const loadOffers = useCallback(async () => {
        try {
            const { data, error } = await supabase.from('offers').select('*').order('created_at', { ascending: false });
            if (!error && data) {
                setOffers(data);
                localStorage.setItem('admin_offers', JSON.stringify(data));
                return;
            }
        } catch (_) { }
        // Fallback: localStorage
        const local = localStorage.getItem('admin_offers');
        if (local) setOffers(JSON.parse(local));
    }, []);

    const saveOfferLocal = (list) => {
        localStorage.setItem('admin_offers', JSON.stringify(list));
        setOffers(list);
        // Also save a public version for the patient home
        const active = list.filter(o => o.is_active);
        localStorage.setItem('active_offers', JSON.stringify(active));
    };

    const handleOfferSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...offerForm, discount_value: Number(offerForm.discount_value) };
        try {
            if (editingOffer) {
                const { error } = await supabase.from('offers').update(payload).eq('id', editingOffer.id);
                if (!error) {
                    const updated = offers.map(o => o.id === editingOffer.id ? { ...o, ...payload } : o);
                    saveOfferLocal(updated);
                } else {
                    const updated = offers.map(o => o.id === editingOffer.id ? { ...o, ...payload } : o);
                    saveOfferLocal(updated);
                }
            } else {
                const newOffer = { ...payload, id: Date.now().toString(), created_at: new Date().toISOString() };
                const { data, error } = await supabase.from('offers').insert([payload]).select().single();
                const saved = (!error && data) ? data : newOffer;
                saveOfferLocal([saved, ...offers]);
            }
        } catch (_) {
            const newOffer = { ...payload, id: Date.now().toString(), created_at: new Date().toISOString() };
            if (editingOffer) {
                saveOfferLocal(offers.map(o => o.id === editingOffer.id ? { ...o, ...payload } : o));
            } else {
                saveOfferLocal([newOffer, ...offers]);
            }
        }
        setShowOfferForm(false);
        setEditingOffer(null);
        setOfferForm({ title: '', description: '', discount_type: 'percentage', discount_value: '', occasion: 'custom', start_date: '', end_date: '', is_active: true });
    };

    const toggleOfferActive = async (offer) => {
        const updated = { ...offer, is_active: !offer.is_active };
        try { await supabase.from('offers').update({ is_active: updated.is_active }).eq('id', offer.id); } catch (_) { }
        saveOfferLocal(offers.map(o => o.id === offer.id ? updated : o));
    };

    const deleteOffer = async (id) => {
        if (!window.confirm('Delete this offer?')) return;
        try { await supabase.from('offers').delete().eq('id', id); } catch (_) { }
        saveOfferLocal(offers.filter(o => o.id !== id));
    };

    const openEditOffer = (offer) => {
        setEditingOffer(offer);
        setOfferForm({ ...offer });
        setShowOfferForm(true);
    };

    const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
    const adminName = adminData?.name || adminData?.full_name || 'Admin';

    const handleLogout = () => {
        if (window.confirm('Logout?')) {
            localStorage.removeItem('userRole');
            localStorage.removeItem('adminData');
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
                    rxPending: (notes.prescription_review_pending || false) && b.status === 'pending',
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

            // Doctors table
            const { data: docs } = await supabase
                .from('doctor_profiles')
                .select('*')
                .order('created_at', { ascending: false });
            setDoctors(docs || []);

            // Nurses table
            const { data: nurs } = await supabase
                .from('nurse_profiles')
                .select('*')
                .order('created_at', { ascending: false });
            setNurses(nurs || []);
        } catch (err) {
            console.error('Admin load error:', err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateDoctorStatus = async (id, status) => {
        try {
            const { error } = await supabase
                .from('doctor_profiles')
                .update({ verification_status: status })
                .eq('id', id);
            if (error) throw error;
            setDoctors(docs => docs.map(d => d.id === id ? { ...d, verification_status: status } : d));
        } catch (err) {
            alert('Failed to update doctor status: ' + err.message);
        }
    };

    const updateNurseStatus = async (id, status) => {
        try {
            const { error } = await supabase
                .from('nurse_profiles')
                .update({ verification_status: status })
                .eq('id', id);
            if (error) throw error;
            setNurses(nurs => nurs.map(d => d.id === id ? { ...d, verification_status: status } : d));
        } catch (err) {
            alert('Failed to update nurse status: ' + err.message);
        }
    };

    useEffect(() => {
        loadData();
        loadOffers();
        const i = setInterval(loadData, 10000);
        return () => clearInterval(i);
    }, [loadData, loadOffers]);

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
                        <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center shadow-sm">
                            <Stethoscope className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-base font-extrabold text-black leading-none">NurseHome</p>
                            <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Admin Console</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={async () => {
                                setIsRefreshing(true);
                                await loadData();
                                setTimeout(() => setIsRefreshing(false), 500);
                            }}
                            disabled={isRefreshing}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isRefreshing ? 'bg-teal-50 text-teal-600' : 'bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100'
                                }`}
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </button>

                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                            <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs border border-teal-100">
                                {adminName.slice(0, 2).toUpperCase()}
                            </div>
                            {adminName}
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100 text-xs font-bold hover:bg-red-100 transition-all active:scale-95"
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
                            const pendingCount = tab.id === 'verification'
                                ? doctors.filter(d => d.verification_status === 'pending').length + nurses.filter(n => n.verification_status === 'pending').length
                                : 0;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all relative ${activeTab === tab.id
                                        ? tab.highlight ? 'border-amber-500 text-amber-600 bg-amber-50/30' : 'border-teal-600 text-teal-600 bg-teal-50/30'
                                        : tab.highlight ? 'border-transparent text-amber-600 hover:text-amber-700 hover:bg-amber-50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                    {pendingCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                                            {pendingCount}
                                        </span>
                                    )}
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
                                    <h2 className="text-xl font-extrabold text-black">System Overview</h2>

                                    {/* Time Period Filter */}
                                    <div className="flex items-center gap-1 bg-white border border-slate-100 rounded-xl p-1 shadow-sm">
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
                                                    ? 'bg-teal-600 text-white shadow-sm'
                                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {timePeriod !== 'all' && (
                                    <div className="text-xs font-bold text-teal-600 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Showing data for: {periodLabel}
                                    </div>
                                )}

                                {/* ── TOP SECTION: Analytics (left 50%) + Stat Cards (right 50%) ── */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

                                    {/* ── LEFT: Analytics Line Graph ─────────────────────── */}
                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                                            <h3 className="font-bold text-black flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-teal-600" />
                                                Analytics
                                            </h3>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {/* Metric toggle */}
                                                <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
                                                    {[{ id: 'both', label: 'Both' }, { id: 'revenue', label: 'Revenue' }, { id: 'bookings', label: 'Bookings' }].map(v => (
                                                        <button
                                                            key={v.id}
                                                            onClick={() => setGraphMetric(v.id)}
                                                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${graphMetric === v.id ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
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
                                                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${graphView === v.id ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
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
                                                    <div className="w-8 h-[3px] rounded-full bg-teal-500" />
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
                                                                    <stop offset="0%" stopColor="#0d9488" stopOpacity="0.2" />
                                                                    <stop offset="100%" stopColor="#0d9488" stopOpacity="0.01" />
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
                                                                    <polyline points={revLine} fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
                                                                                <circle cx={rPt.x} cy={rPt.y} r="3.5" fill="#fff" stroke="#0d9488" strokeWidth="2" />
                                                                                <circle cx={rPt.x} cy={rPt.y} r="5.5" fill="#0d9488" opacity="0" className="group-hover:opacity-100 transition-opacity" />
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
                                                                        <p className="text-[10px] font-bold text-teal-600/60 uppercase">Total Revenue</p>
                                                                        <p className="text-lg font-extrabold text-black">₹{totalRev.toLocaleString()}</p>
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

                                    {/* ── RIGHT: Stat Blocks (2×3 grid) ──────────────────── */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <StatCard
                                            icon={Calendar} label="Total Bookings" value={periodBookings.length}
                                            color="bg-teal-50 text-teal-600"
                                            sub={`${medicineOrders.length} medicine · ${emergencyBookings.length} emergency`}
                                            onClick={() => { setOverviewDrill(null); setStatusFilter('all'); setActiveTab('bookings'); }}
                                            active={false}
                                        />
                                        <StatCard
                                            icon={Activity} label="Active Bookings" value={activeJobs.length}
                                            color="bg-teal-50 text-teal-600"
                                            sub="Confirmed / Upcoming"
                                            onClick={() => { setOverviewDrill(null); setStatusFilter('confirmed'); setActiveTab('nursing'); }}
                                            active={false}
                                        />
                                        <StatCard
                                            icon={FileText} label="Prescriptions" value={prescriptions.length}
                                            color="bg-teal-50 text-teal-600"
                                            sub="Total uploaded"
                                            onClick={() => { setOverviewDrill(null); setStatusFilter('all'); setActiveTab('prescriptions'); }}
                                            active={false}
                                        />
                                        <StatCard
                                            icon={TrendingUp} label="Total Revenue" value={`₹${revenue.toLocaleString()}`}
                                            color="bg-teal-50 text-teal-600"
                                            sub={`From ${revenueByPatient.length} patients`}
                                            onClick={() => { setOverviewDrill(null); setStatusFilter('all'); setActiveTab('bookings'); }}
                                            active={false}
                                        />
                                        <StatCard
                                            icon={Zap} label="Emergency" value={emergencyBookings.length}
                                            color="bg-red-50 text-red-600"
                                            sub="Critical cases"
                                            onClick={() => { setOverviewDrill(null); setStatusFilter('all'); setActiveTab('emergency'); }}
                                            active={false}
                                        />
                                        <StatCard
                                            icon={CheckCircle} label="Completed" value={completedBookings.length}
                                            color="bg-teal-50 text-teal-600"
                                            sub={`${cancelledBookings.length} cancelled`}
                                            onClick={() => { setOverviewDrill(null); setStatusFilter('completed'); setActiveTab('bookings'); }}
                                            active={false}
                                        />
                                    </div>
                                </div>

                                {/* ── Drill-down Panel ───────────────────────────────────── */}
                                {overviewDrill && (
                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-top-2">
                                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                                            <h3 className="font-bold text-black flex items-center gap-2">
                                                {overviewDrill === 'bookings' && <><Calendar className="w-4 h-4 text-teal-600" /> All Bookings ({periodBookings.length})</>}
                                                {overviewDrill === 'jobs' && <><Activity className="w-4 h-4 text-teal-600" /> Active Nursing Jobs ({activeJobs.length})</>}
                                                {overviewDrill === 'prescriptions' && <><FileText className="w-4 h-4 text-teal-600" /> Prescriptions ({prescriptions.length})</>}
                                                {overviewDrill === 'revenue' && <><TrendingUp className="w-4 h-4 text-teal-600" /> Revenue Breakdown — ₹{revenue.toLocaleString()}</>}
                                                {overviewDrill === 'emergency' && <><Zap className="w-4 h-4 text-red-600" /> Emergency Cases ({emergencyBookings.length})</>}
                                                {overviewDrill === 'completed' && <><CheckCircle className="w-4 h-4 text-teal-600" /> Completed Bookings ({completedBookings.length})</>}
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
                                        <h3 className="font-bold text-black flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-teal-600" />
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
                                                    <tr key={m.label} className={`border-t border-slate-50 hover:bg-slate-50 transition-colors ${m.isCurrent ? 'bg-teal-50/40 font-semibold' : ''}`}>
                                                        <td className="px-4 py-3 font-bold text-black whitespace-nowrap">
                                                            {m.label}
                                                            {m.isCurrent && <span className="ml-2 text-[9px] font-black px-1.5 py-0.5 bg-teal-100 text-teal-600 rounded-full uppercase">Current</span>}
                                                        </td>
                                                        <td className="px-4 py-3 text-black font-bold">{m.total}</td>
                                                        <td className="px-4 py-3 text-emerald-600 font-bold">{m.completed}</td>
                                                        <td className="px-4 py-3 text-red-500 font-bold">{m.cancelled}</td>
                                                        <td className="px-4 py-3 text-red-600 font-bold">{m.emergency}</td>
                                                        <td className="px-4 py-3 text-teal-600 font-bold">{m.medicine}</td>
                                                        <td className="px-4 py-3 font-extrabold text-black">₹{m.revenue.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Recent bookings preview */}
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                                        <h3 className="font-bold text-black">Recent Bookings</h3>
                                        <button onClick={() => setActiveTab('bookings')} className="text-xs font-bold text-teal-600 hover:underline">View All →</button>
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
                        {
                            !['overview', 'users', 'prescriptions', 'nursing', 'doctors', 'nurses_reg', 'inventory'].includes(activeTab) && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-extrabold text-black capitalize">
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
                                                    className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl w-56 focus:outline-none focus:ring-2 focus:ring-teal-300 font-medium"
                                                />
                                            </div>
                                            <div className="relative">
                                                <select
                                                    value={statusFilter}
                                                    onChange={e => setStatusFilter(e.target.value)}
                                                    className="appearance-none pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-300 font-bold"
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
                                                <thead className="bg-slate-50 text-xs font-extra-bold text-slate-500 uppercase">
                                                    <tr>
                                                        {['ID', 'Patient', 'Service', 'Date', 'Time', 'Nurse', 'Tracking', 'Doctor Notes', 'Payment', 'Price', 'Status', 'Actions'].map(h => (
                                                            <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filterBookings(currentTabBookings).map(b => (
                                                        <tr key={b.id} className="border-t border-slate-50 hover:bg-teal-50/30 transition-colors">
                                                            <td className="px-4 py-3 font-mono text-xs text-slate-400 font-bold">{String(b.id).slice(0, 8)}</td>
                                                            <td className="px-4 py-3 font-bold text-black whitespace-nowrap">{b.patient}</td>
                                                            <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">{b.service}</td>
                                                            <td className="px-4 py-3 text-xs text-slate-500 font-medium whitespace-nowrap">{b.date ? fmt(b.date) : fmt(b.createdAt)}</td>
                                                            <td className="px-4 py-3 text-xs text-slate-500 font-medium">{b.time}</td>
                                                            <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">{b.nurseName}</td>
                                                            <td className="px-4 py-3 text-[10px] font-bold whitespace-nowrap">
                                                                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">{TRACKING_LABELS[b.trackingStatus] || '—'}</span>
                                                            </td>
                                                            <td className="px-4 py-3 text-xs text-slate-500 max-w-[150px] truncate font-medium" title={b.doctorNotes}>{b.doctorNotes}</td>
                                                            <td className="px-4 py-3 text-[10px] text-slate-500 uppercase font-black">{b.paymentMethod}</td>
                                                            <td className="px-4 py-3 font-extrabold text-black whitespace-nowrap">₹{b.price}</td>
                                                            <td className="px-4 py-3"><Badge status={b.status} /></td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex flex-wrap items-center gap-1.5 min-w-[120px]">
                                                                    {b.status === 'pending' && (
                                                                        <>
                                                                            <button onClick={() => updateStatus(b.id, 'confirmed')} className="px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1">
                                                                                <CheckCircle className="w-3 h-3" /> Confirm
                                                                            </button>
                                                                            <button onClick={() => updateStatus(b.id, 'cancelled')} className="px-2 py-1 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1">
                                                                                <XCircle className="w-3 h-3" /> Cancel
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                    {b.status === 'confirmed' && !b.isMedicine && (
                                                                        <button onClick={() => updateStatus(b.id, 'completed')} className="px-2 py-1 bg-blue-500 text-white text-[10px] font-bold rounded hover:bg-blue-600 transition-colors flex items-center gap-1">
                                                                            <Clock className="w-3 h-3" /> Complete
                                                                        </button>
                                                                    )}
                                                                    {b.isInsurance && b.rawNotes && (
                                                                        <button
                                                                            onClick={() => {
                                                                                const n = JSON.parse(b.rawNotes).insurance_details;
                                                                                alert(`Insurance Info:\nName: ${n.applicantName}\nAge: ${n.age}\nNominee: ${n.nomineeName}\nRelation: ${n.nomineeRelation}`);
                                                                            }}
                                                                            className="px-2 py-1 bg-indigo-50 text-indigo-600 border border-indigo-200 text-[10px] font-bold rounded hover:bg-indigo-100 transition-colors"
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
                                                                        <>
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
                                                                        </>
                                                                    )}
                                                                    {/* Universal Cancel button for active bookings */}
                                                                    {b.status !== 'pending' && b.status !== 'completed' && b.status !== 'cancelled' && (
                                                                        <button onClick={() => updateStatus(b.id, 'cancelled')} className="px-2 py-1 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold rounded hover:bg-red-100 transition-colors flex items-center gap-1">
                                                                            <XCircle className="w-3 h-3" /> Cancel
                                                                        </button>
                                                                    )}
                                                                </div>
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
                            )
                        }

                        {/* ══ NURSING JOBS ══════════════════════════════════════ */}
                        {
                            activeTab === 'nursing' && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-extrabold text-black">Nursing Jobs <span className="text-slate-400 font-normal text-base">({nursingBookings.length})</span></h2>

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
                                                        <span className="font-semibold text-black">{b.date || '—'} {b.time}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>👩‍⚕️ Nurse</span>
                                                        <span className="font-semibold text-black">{b.nurseName}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>🚦 Tracking</span>
                                                        <span className="font-semibold text-black">{TRACKING_LABELS[b.trackingStatus] || 'Awaiting nurse'}</span>
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
                                                    <button
                                                        onClick={() => { setOverviewDrill(null); setActiveTab('prescriptions'); }}
                                                        className="w-full bg-teal-50 border border-teal-100 rounded-xl p-2.5 mb-3 flex items-center justify-between hover:bg-teal-100 transition-colors group text-left cursor-pointer"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <AlertCircle className="w-4 h-4 text-teal-600 shrink-0" />
                                                            <p className="text-xs font-bold text-teal-800">Prescription review pending</p>
                                                        </div>
                                                        <ArrowRight className="w-3.5 h-3.5 text-teal-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
                                                    </button>
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
                            )
                        }

                        {/* ══ PRESCRIPTIONS ══════════════════════════════════════ */}
                        {
                            activeTab === 'prescriptions' && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-extrabold text-black">Prescriptions <span className="text-slate-400 font-normal text-base">({prescriptions.length})</span></h2>

                                    {/* Pending bookings that have prescription review pending */}
                                    {allBookings.filter(b => b.rxPending).length > 0 && (
                                        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4">
                                            <p className="text-sm font-bold text-teal-800 mb-3 flex items-center gap-2">
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
                                                            className="px-3 py-1.5 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 transition-colors"
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
                            )
                        }


                        {/* ══ VERIFICATION CENTER ══════════════════════════════════════ */}
                        {activeTab === 'verification' && (() => {
                            const pendingDocs = doctors.filter(d => d.verification_status === 'pending');
                            const pendingNurses = nurses.filter(n => n.verification_status === 'pending');
                            const processedDocs = doctors.filter(d => d.verification_status !== 'pending');
                            const processedNurses = nurses.filter(n => n.verification_status !== 'pending');
                            const totalPending = pendingDocs.length + pendingNurses.length;

                            const VerifCard = ({ person, type }) => (
                                <div className={`bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition-all ${person.verification_status === 'pending' ? 'border-slate-100' :
                                    person.verification_status === 'approved' ? 'border-teal-100' : 'border-red-100'
                                    }`}>
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl font-black border ${type === 'doctor' ? 'bg-sky-50 border-sky-100 text-sky-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                                }`}>
                                                {type === 'doctor' ? '🩺' : '💉'}
                                            </div>
                                            <div>
                                                <p className="font-extrabold text-slate-900 text-sm">{person.full_name}</p>
                                                <p className="text-[11px] text-slate-500 font-mono">{person.email}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${person.verification_status === 'approved' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                                            person.verification_status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>{person.verification_status}</span>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-4">
                                        {[
                                            { label: 'Reg No', value: person.registration_number },
                                            { label: 'Experience', value: `${person.years_of_experience} yrs` },
                                            { label: 'Qualification', value: person.qualification },
                                            { label: 'Specialization', value: person.specialization },
                                            { label: type === 'doctor' ? 'Medical Council' : 'Nursing Council', value: person.state_medical_council || person.state_nursing_council },
                                            { label: 'Location', value: person.city_location },
                                        ].map(row => (
                                            <div key={row.label}>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{row.label}</p>
                                                <p className="text-xs font-semibold text-slate-700 truncate" title={row.value}>{row.value || '—'}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Document Links */}
                                    <div className="flex gap-2 mb-4">
                                        {person.degree_cert_url && (
                                            <a href={person.degree_cert_url} target="_blank" rel="noreferrer"
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-sky-50 text-sky-700 border border-sky-100 rounded-xl text-xs font-bold hover:bg-sky-100 transition-colors">
                                                <FileText className="w-3.5 h-3.5" /> View Degree
                                                <ExternalLink className="w-3 h-3 opacity-60" />
                                            </a>
                                        )}
                                        {person.registration_cert_url && (
                                            <a href={person.registration_cert_url} target="_blank" rel="noreferrer"
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-purple-50 text-purple-700 border border-purple-100 rounded-xl text-xs font-bold hover:bg-purple-100 transition-colors">
                                                <FileText className="w-3.5 h-3.5" /> View License
                                                <ExternalLink className="w-3 h-3 opacity-60" />
                                            </a>
                                        )}
                                    </div>

                                    {/* Actions Row */}
                                    <div className="flex gap-2 pt-3 border-t border-slate-100">
                                        <button
                                            onClick={() => setVerificationModal({ type, data: person })}
                                            className="flex-1 flex items-center justify-center gap-1.5 h-9 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors">
                                            <Eye className="w-3.5 h-3.5" /> Full Details
                                        </button>
                                        {person.verification_status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => type === 'doctor' ? updateDoctorStatus(person.id, 'approved') : updateNurseStatus(person.id, 'approved')}
                                                    className="flex-1 h-9 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1">
                                                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                                                </button>
                                                <button
                                                    onClick={() => type === 'doctor' ? updateDoctorStatus(person.id, 'rejected') : updateNurseStatus(person.id, 'rejected')}
                                                    className="flex-1 h-9 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1">
                                                    <XCircle className="w-3.5 h-3.5" /> Reject
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );

                            return (
                                <div className="space-y-6">
                                    {/* Header Banner */}
                                    <div className={`rounded-2xl p-5 border flex items-center justify-between flex-wrap gap-4 ${totalPending > 0 ? 'bg-amber-50 border-amber-200' : 'bg-teal-50 border-teal-200'
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${totalPending > 0 ? 'bg-amber-100' : 'bg-teal-100'
                                                }`}>
                                                <ShieldCheck className={`w-6 h-6 ${totalPending > 0 ? 'text-amber-600' : 'text-teal-600'}`} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-extrabold text-black">Verification Center</h2>
                                                <p className={`text-sm font-medium ${totalPending > 0 ? 'text-amber-700' : 'text-teal-700'}`}>
                                                    {totalPending > 0
                                                        ? `${totalPending} application${totalPending > 1 ? 's' : ''} awaiting review — ${pendingDocs.length} doctor${pendingDocs.length !== 1 ? 's' : ''}, ${pendingNurses.length} nurse${pendingNurses.length !== 1 ? 's' : ''}`
                                                        : 'All applications have been reviewed ✓'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-center">
                                                <p className="text-2xl font-black text-amber-600">{pendingDocs.length}</p>
                                                <p className="text-[10px] font-bold text-amber-500 uppercase">Doctors</p>
                                            </div>
                                            <div className="w-px h-8 bg-amber-200" />
                                            <div className="text-center">
                                                <p className="text-2xl font-black text-amber-600">{pendingNurses.length}</p>
                                                <p className="text-[10px] font-bold text-amber-500 uppercase">Nurses</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── PENDING DOCTORS ── */}
                                    {pendingDocs.length > 0 && (
                                        <div>
                                            <h3 className="text-base font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                                                <span className="w-6 h-6 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center text-xs font-black">{pendingDocs.length}</span>
                                                Doctors Awaiting Review
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                                {pendingDocs.map(d => <VerifCard key={d.id} person={d} type="doctor" />)}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── PENDING NURSES ── */}
                                    {pendingNurses.length > 0 && (
                                        <div>
                                            <h3 className="text-base font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                                                <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-black">{pendingNurses.length}</span>
                                                Nurses Awaiting Review
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                                {pendingNurses.map(n => <VerifCard key={n.id} person={n} type="nurse" />)}
                                            </div>
                                        </div>
                                    )}

                                    {totalPending === 0 && (
                                        <div className="text-center py-16 text-slate-400">
                                            <ShieldCheck className="w-16 h-16 mx-auto opacity-20 mb-4" />
                                            <p className="text-lg font-bold">No pending verifications</p>
                                            <p className="text-sm font-medium mt-1">All doctor and nurse applications have been reviewed</p>
                                        </div>
                                    )}

                                    {/* ── PROCESSED (Audit Trail) ── */}
                                    {(processedDocs.length > 0 || processedNurses.length > 0) && (
                                        <details className="group">
                                            <summary className="cursor-pointer flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 select-none list-none py-2">
                                                <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                                                Processed Applications ({processedDocs.length + processedNurses.length})
                                            </summary>
                                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                                {processedDocs.map(d => <VerifCard key={d.id} person={d} type="doctor" />)}
                                                {processedNurses.map(n => <VerifCard key={n.id} person={n} type="nurse" />)}
                                            </div>
                                        </details>
                                    )}
                                </div>
                            );
                        })()}

                        {/* ── VERIFICATION DETAIL MODAL ── */}
                        {verificationModal && (
                            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setVerificationModal(null)}>
                                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                                    {/* Modal Header */}
                                    <div className={`p-6 rounded-t-3xl flex items-start justify-between ${verificationModal.type === 'doctor' ? 'bg-gradient-to-r from-sky-600 to-blue-700' : 'bg-gradient-to-r from-emerald-600 to-teal-700'
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
                                                {verificationModal.type === 'doctor' ? '🩺' : '💉'}
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-extrabold text-white">{verificationModal.data.full_name}</h2>
                                                <p className="text-white/70 text-sm">{verificationModal.data.email}</p>
                                                <p className="text-white/60 text-xs mt-0.5">📞 {verificationModal.data.phone || '—'}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setVerificationModal(null)} className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white transition-colors">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="p-6 space-y-5">
                                        {/* Status Badge */}
                                        <div className="flex items-center justify-between">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${verificationModal.data.verification_status === 'approved' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                                                verificationModal.data.verification_status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                    'bg-amber-50 text-amber-700 border-amber-100'
                                                }`}>
                                                {verificationModal.data.verification_status === 'pending' ? '⏳ Pending Review' :
                                                    verificationModal.data.verification_status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                                            </span>
                                            <p className="text-xs text-slate-400 font-medium">Submitted: {fmtDate(verificationModal.data.created_at)}</p>
                                        </div>

                                        {/* Professional Details */}
                                        <div className="bg-slate-50 rounded-2xl p-4">
                                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Professional Information</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                {[
                                                    { label: 'Registration Number', value: verificationModal.data.registration_number },
                                                    { label: verificationModal.type === 'doctor' ? 'Medical Council' : 'Nursing Council', value: verificationModal.data.state_medical_council || verificationModal.data.state_nursing_council },
                                                    { label: 'Qualification', value: verificationModal.data.qualification },
                                                    { label: 'Specialization', value: verificationModal.data.specialization },
                                                    { label: 'Years of Experience', value: `${verificationModal.data.years_of_experience} years` },
                                                    { label: 'Location', value: verificationModal.data.city_location },
                                                    { label: verificationModal.type === 'doctor' ? 'Clinic/Hospital' : 'Hospital/Clinic', value: verificationModal.data.clinic_hospital_name || verificationModal.data.hospital_clinic_name || '—' },
                                                ].map(row => (
                                                    <div key={row.label}>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{row.label}</p>
                                                        <p className="text-sm font-semibold text-slate-800">{row.value || '—'}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Documents */}
                                        <div>
                                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Uploaded Documents</h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                <a href={verificationModal.data.degree_cert_url} target="_blank" rel="noreferrer"
                                                    className="flex flex-col items-center gap-2 p-4 bg-sky-50 border border-sky-100 rounded-2xl hover:bg-sky-100 transition-colors group">
                                                    <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                                                        <FileText className="w-5 h-5 text-sky-600" />
                                                    </div>
                                                    <p className="text-xs font-bold text-sky-700">Degree / Diploma</p>
                                                    <p className="text-[10px] text-sky-500 flex items-center gap-1">Open document <ExternalLink className="w-2.5 h-2.5" /></p>
                                                </a>
                                                <a href={verificationModal.data.registration_cert_url} target="_blank" rel="noreferrer"
                                                    className="flex flex-col items-center gap-2 p-4 bg-purple-50 border border-purple-100 rounded-2xl hover:bg-purple-100 transition-colors group">
                                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                                        <FileText className="w-5 h-5 text-purple-600" />
                                                    </div>
                                                    <p className="text-xs font-bold text-purple-700">Registration Certificate</p>
                                                    <p className="text-[10px] text-purple-500 flex items-center gap-1">Open document <ExternalLink className="w-2.5 h-2.5" /></p>
                                                </a>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {verificationModal.data.verification_status === 'pending' && (
                                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                                <button
                                                    onClick={() => {
                                                        const fn = verificationModal.type === 'doctor' ? updateDoctorStatus : updateNurseStatus;
                                                        fn(verificationModal.data.id, 'approved');
                                                        setVerificationModal(null);
                                                    }}
                                                    className="flex-1 h-12 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                                                    <CheckCircle className="w-4 h-4" /> Approve Application
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const fn = verificationModal.type === 'doctor' ? updateDoctorStatus : updateNurseStatus;
                                                        fn(verificationModal.data.id, 'rejected');
                                                        setVerificationModal(null);
                                                    }}
                                                    className="flex-1 h-12 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                                                    <XCircle className="w-4 h-4" /> Reject Application
                                                </button>
                                            </div>
                                        )}
                                        {verificationModal.data.verification_status !== 'pending' && (
                                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                                <button
                                                    onClick={() => {
                                                        const newStatus = verificationModal.data.verification_status === 'approved' ? 'pending' : 'approved';
                                                        const fn = verificationModal.type === 'doctor' ? updateDoctorStatus : updateNurseStatus;
                                                        fn(verificationModal.data.id, newStatus);
                                                        setVerificationModal(null);
                                                    }}
                                                    className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm">
                                                    {verificationModal.data.verification_status === 'approved' ? 'Revoke Approval' : 'Re-approve'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ══ DOCTOR VERIFICATION ══════════════════════════════════════ */}
                        {
                            activeTab === 'doctors' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between flex-wrap gap-3">
                                        <h2 className="text-xl font-extrabold text-black">Registered Doctors <span className="text-slate-400 font-normal text-base">({doctors.length})</span></h2>
                                        <div className="flex items-center gap-1 bg-white border border-slate-100 rounded-xl p-1 shadow-sm">
                                            {['all', 'pending', 'approved', 'rejected'].map(s => (
                                                <button key={s} onClick={() => setDoctorFilter(s)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${doctorFilter === s ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                                        }`}>{s === 'all' ? 'All' : s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                        {doctors.length === 0 ? (
                                            <div className="text-center py-16 text-slate-400">
                                                <Stethoscope className="w-12 h-12 mx-auto opacity-30 mb-3" />
                                                <p className="text-sm font-medium">No doctors found</p>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-slate-50 text-xs font-extra-bold text-slate-500 uppercase">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left">Doctor</th>
                                                            <th className="px-4 py-3 text-left">Reg Number</th>
                                                            <th className="px-4 py-3 text-left">Experience</th>
                                                            <th className="px-4 py-3 text-left">Certificates</th>
                                                            <th className="px-4 py-3 text-left">Joined</th>
                                                            <th className="px-4 py-3 text-left">Status</th>
                                                            <th className="px-4 py-3 text-right">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50">
                                                        {doctors.filter(d => doctorFilter === 'all' || d.verification_status === doctorFilter).map(d => (
                                                            <tr key={d.id} className="hover:bg-teal-50/30 transition-colors group">
                                                                <td className="px-4 py-4">
                                                                    <p className="font-bold text-black">{d.full_name}</p>
                                                                    <p className="text-[11px] text-slate-500">{d.specialization} • {d.qualification}</p>
                                                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{d.email}</p>
                                                                </td>
                                                                <td className="px-4 py-4">
                                                                    <p className="font-mono text-xs text-slate-700">{d.registration_number}</p>
                                                                    <p className="text-[10px] text-slate-400">{d.medical_council || d.state_medical_council}</p>
                                                                </td>
                                                                <td className="px-4 py-4 text-xs font-medium text-slate-600">
                                                                    {d.years_of_experience} Yrs
                                                                </td>
                                                                <td className="px-4 py-4">
                                                                    <div className="flex flex-col gap-1.5">
                                                                        <a href={d.degree_cert_url} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                                                                            <FileText className="w-3 h-3" /> Degree
                                                                        </a>
                                                                        <a href={d.registration_cert_url} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                                                                            <FileText className="w-3 h-3" /> License
                                                                        </a>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-4 text-[11px] text-slate-500 font-medium">
                                                                    {fmt(d.created_at)}
                                                                </td>
                                                                <td className="px-4 py-4">
                                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${d.verification_status === 'approved' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                                                                        d.verification_status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                            'bg-amber-50 text-amber-700 border-amber-200'
                                                                        }`}>
                                                                        {d.verification_status}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-4 text-right">
                                                                    <div className="flex justify-end gap-2">
                                                                        <button onClick={() => setVerificationModal({ type: 'doctor', data: d })} className="h-7 px-3 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1">
                                                                            <Eye className="w-3 h-3" /> View
                                                                        </button>
                                                                        {d.verification_status === 'pending' ? (
                                                                            <>
                                                                                <button onClick={() => updateDoctorStatus(d.id, 'approved')} className="h-7 px-3 bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold rounded-lg transition-colors">
                                                                                    Approve
                                                                                </button>
                                                                                <button onClick={() => updateDoctorStatus(d.id, 'rejected')} className="h-7 px-3 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-bold rounded-lg transition-colors">
                                                                                    Reject
                                                                                </button>
                                                                            </>
                                                                        ) : (
                                                                            <span className="text-[11px] text-slate-400 font-bold">Processed</span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        }

                        {/* ══ NURSE VERIFICATION ══════════════════════════════════════ */}
                        {
                            activeTab === 'nurses_reg' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between flex-wrap gap-3">
                                        <h2 className="text-xl font-extrabold text-black">Registered Nurses <span className="text-slate-400 font-normal text-base">({nurses.length})</span></h2>
                                        <div className="flex items-center gap-1 bg-white border border-slate-100 rounded-xl p-1 shadow-sm">
                                            {['all', 'pending', 'approved', 'rejected'].map(s => (
                                                <button key={s} onClick={() => setNurseFilter(s)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${nurseFilter === s ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                                        }`}>{s === 'all' ? 'All' : s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                        {nurses.length === 0 ? (
                                            <div className="text-center py-16 text-slate-400">
                                                <UserCheck className="w-12 h-12 mx-auto opacity-30 mb-3" />
                                                <p className="text-sm font-medium">No nurses found</p>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-slate-50 text-xs font-extra-bold text-slate-500 uppercase">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left">Nurse</th>
                                                            <th className="px-4 py-3 text-left">Reg Number</th>
                                                            <th className="px-4 py-3 text-left">Experience</th>
                                                            <th className="px-4 py-3 text-left">Certificates</th>
                                                            <th className="px-4 py-3 text-left">Joined</th>
                                                            <th className="px-4 py-3 text-left">Status</th>
                                                            <th className="px-4 py-3 text-right">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50">
                                                        {nurses.filter(n => nurseFilter === 'all' || n.verification_status === nurseFilter).map(n => (
                                                            <tr key={n.id} className="hover:bg-teal-50/30 transition-colors group">
                                                                <td className="px-4 py-4">
                                                                    <p className="font-bold text-black">{n.full_name}</p>
                                                                    <p className="text-[11px] text-slate-500">{n.specialization} • {n.qualification}</p>
                                                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{n.email}</p>
                                                                </td>
                                                                <td className="px-4 py-4">
                                                                    <p className="font-mono text-xs text-slate-700">{n.registration_number}</p>
                                                                    <p className="text-[10px] text-slate-400">{n.state_nursing_council}</p>
                                                                </td>
                                                                <td className="px-4 py-4 text-xs font-medium text-slate-600">
                                                                    {n.years_of_experience} Yrs
                                                                </td>
                                                                <td className="px-4 py-4">
                                                                    <div className="flex flex-col gap-1.5">
                                                                        <a href={n.degree_cert_url} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                                                                            <FileText className="w-3 h-3" /> Degree
                                                                        </a>
                                                                        <a href={n.registration_cert_url} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                                                                            <FileText className="w-3 h-3" /> License
                                                                        </a>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-4 text-[11px] text-slate-500 font-medium">
                                                                    {fmt(n.created_at)}
                                                                </td>
                                                                <td className="px-4 py-4">
                                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${n.verification_status === 'approved' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                                                                        n.verification_status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                            'bg-amber-50 text-amber-700 border-amber-200'
                                                                        }`}>
                                                                        {n.verification_status}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-4 text-right">
                                                                    <div className="flex justify-end gap-2">
                                                                        <button onClick={() => setVerificationModal({ type: 'nurse', data: n })} className="h-7 px-3 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1">
                                                                            <Eye className="w-3 h-3" /> View
                                                                        </button>
                                                                        {n.verification_status === 'pending' ? (
                                                                            <>
                                                                                <button onClick={() => updateNurseStatus(n.id, 'approved')} className="h-7 px-3 bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold rounded-lg transition-colors">
                                                                                    Approve
                                                                                </button>
                                                                                <button onClick={() => updateNurseStatus(n.id, 'rejected')} className="h-7 px-3 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-bold rounded-lg transition-colors">
                                                                                    Reject
                                                                                </button>
                                                                            </>
                                                                        ) : (
                                                                            <span className="text-[11px] text-slate-400 font-bold">Processed</span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        }

                        {/* ══ USER LOGINS ══════════════════════════════════════ */}
                        {
                            activeTab === 'users' && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-extrabold text-black">All Users</h2>

                                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                        {/* Patients */}
                                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                                                <h3 className="font-bold text-black flex items-center gap-2"><UserCheck className="w-4 h-4 text-teal-600" /> Patients ({uniqueUsers.length})</h3>
                                            </div>
                                            <div className="divide-y divide-slate-50">
                                                {uniqueUsers.map(u => (
                                                    <div key={u.id} className="px-5 py-3 hover:bg-teal-50/30 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center">
                                                                {u.name?.slice(0, 2).toUpperCase() || 'P'}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-black truncate">{u.name}</p>
                                                                <p className="text-xs text-slate-400 font-mono truncate">{String(u.id).slice(0, 16)}…</p>
                                                            </div>
                                                            <span className="text-xs text-slate-400 font-medium">{fmt(u.lastBooking)}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                                {uniqueUsers.length === 0 && <div className="px-5 py-6 text-center text-slate-400 text-sm">No patients yet</div>}
                                            </div>
                                        </div>

                                        {/* Nurses */}
                                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                            <div className="px-5 py-4 border-b border-slate-100">
                                                <h3 className="font-bold text-black flex items-center gap-2"><Activity className="w-4 h-4 text-teal-600" /> Nurses ({uniqueNurses.length})</h3>
                                            </div>
                                            <div className="divide-y divide-slate-50">
                                                {uniqueNurses.map(n => (
                                                    <div key={n.id} className="px-5 py-3 hover:bg-teal-50/30 transition-colors flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center">
                                                            {n.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'N'}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-semibold text-black">{n.name}</p>
                                                            <p className="text-xs text-slate-400 font-medium">{n.jobs} total jobs • {n.activeJobs} active now</p>
                                                        </div>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${n.activeJobs > 0 ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>
                                                            {n.activeJobs > 0 ? 'Active' : 'Idle'}
                                                        </span>
                                                    </div>
                                                ))}
                                                {uniqueNurses.length === 0 && <div className="px-5 py-6 text-center text-slate-400 text-sm">No nurses have accepted jobs yet</div>}
                                            </div>
                                        </div>

                                        {/* Quick actions */}
                                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                                            <h3 className="font-bold text-black mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-teal-600" /> Quick Actions</h3>
                                            <div className="space-y-3">
                                                <button onClick={() => navigate('/doctor/dashboard')} className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50 transition-all text-left">
                                                    <FileText className="w-5 h-5 text-teal-600" />
                                                    <div>
                                                        <p className="text-sm font-bold text-black">Doctor Dashboard</p>
                                                        <p className="text-xs text-slate-500">Review prescriptions</p>
                                                    </div>
                                                </button>
                                                <button onClick={() => navigate('/nurse/dashboard')} className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50 transition-all text-left">
                                                    <Activity className="w-5 h-5 text-teal-600" />
                                                    <div>
                                                        <p className="text-sm font-bold text-black">Nurse Dashboard</p>
                                                        <p className="text-xs text-slate-500">View nurse jobs</p>
                                                    </div>
                                                </button>

                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">Staff Management</p>
                                                <button onClick={() => navigate('/staff-management?tab=doctors')} className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50 transition-all text-left">
                                                    <Stethoscope className="w-5 h-5 text-teal-600" />
                                                    <div>
                                                        <p className="text-sm font-bold text-black">Doctors</p>
                                                        <p className="text-xs text-slate-500">View doctor details & stats</p>
                                                    </div>
                                                </button>
                                                <button onClick={() => navigate('/staff-management?tab=nurses')} className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50 transition-all text-left">
                                                    <UserCheck className="w-5 h-5 text-teal-600" />
                                                    <div>
                                                        <p className="text-sm font-bold text-black">Nurses</p>
                                                        <p className="text-xs text-slate-500">View nurse details & jobs</p>
                                                    </div>
                                                </button>

                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">Analytics</p>
                                                <button onClick={() => navigate('/revenue-reports')} className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50 transition-all text-left">
                                                    <TrendingUp className="w-5 h-5 text-teal-600" />
                                                    <div>
                                                        <p className="text-sm font-bold text-black">Revenue / Reports</p>
                                                        <p className="text-xs text-slate-500">Analytics, trends & breakdowns</p>
                                                    </div>
                                                </button>

                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">Inventory</p>
                                                <button onClick={() => navigate('/admin/inventory')} className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50 transition-all text-left">
                                                    <Package className="w-5 h-5 text-teal-600" />
                                                    <div>
                                                        <p className="text-sm font-bold text-black">Manage Inventory</p>
                                                        <p className="text-xs text-slate-500">Stock levels, CRUD & restock alerts</p>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    </>
                )}

                {/* ══ OFFERS TAB ══════════════════════════════════════ */}
                {activeTab === 'offers' && (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <h2 className="text-xl font-extrabold text-black flex items-center gap-2">
                                    <Gift className="w-6 h-6 text-rose-500" /> Offers & Promotions
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">Create occasion-based discounts visible to patients on the app</p>
                            </div>
                            <button
                                onClick={() => { setEditingOffer(null); setOfferForm({ title: '', description: '', discount_type: 'percentage', discount_value: '', occasion: 'custom', start_date: '', end_date: '', is_active: true }); setShowOfferForm(true); }}
                                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-sm"
                            >
                                <Plus className="w-4 h-4" /> Create Offer
                            </button>
                        </div>

                        {/* Stats bar */}
                        <div className="grid grid-cols-3 gap-4">
                            {[{ label: 'Total Offers', value: offers.length, color: 'bg-teal-50 text-teal-700' },
                            { label: 'Active Now', value: offers.filter(o => o.is_active).length, color: 'bg-emerald-50 text-emerald-700' },
                            { label: 'Inactive', value: offers.filter(o => !o.is_active).length, color: 'bg-slate-50 text-slate-700' }]
                                .map(s => (
                                    <div key={s.label} className={`rounded-2xl p-4 ${s.color} border border-current/10`}>
                                        <p className="text-2xl font-extrabold">{s.value}</p>
                                        <p className="text-xs font-bold mt-1 opacity-70">{s.label}</p>
                                    </div>
                                ))}
                        </div>

                        {/* Offer Form Modal */}
                        {showOfferForm && (
                            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowOfferForm(false)}>
                                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                                    <div className="bg-gradient-to-r from-teal-600 to-teal-800 p-6 rounded-t-3xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                                <Gift className="w-5 h-5 text-white" />
                                            </div>
                                            <h3 className="text-lg font-extrabold text-white">
                                                {editingOffer ? 'Edit Offer' : 'Create New Offer'}
                                            </h3>
                                        </div>
                                        <button onClick={() => setShowOfferForm(false)} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <form onSubmit={handleOfferSubmit} className="p-6 space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                                            <textarea className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none" rows={2} placeholder="Short description for patients" value={offerForm.description} onChange={e => setOfferForm(p => ({ ...p, description: e.target.value }))} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Discount Type</label>
                                                <select className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-300" value={offerForm.discount_type} onChange={e => setOfferForm(p => ({ ...p, discount_type: e.target.value }))}>
                                                    <option value="percentage">Percentage (%)</option>
                                                    <option value="flat">Flat Amount (₹)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Discount Value *</label>
                                                <input required type="number" min="1" className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-300" placeholder={offerForm.discount_type === 'percentage' ? '20' : '200'} value={offerForm.discount_value} onChange={e => setOfferForm(p => ({ ...p, discount_value: e.target.value }))} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Occasion</label>
                                            <select className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-300" value={offerForm.occasion} onChange={e => setOfferForm(p => ({ ...p, occasion: e.target.value }))}>
                                                {OCCASIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
                                                <input type="date" className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-300" value={offerForm.start_date} onChange={e => setOfferForm(p => ({ ...p, start_date: e.target.value }))} />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">End Date</label>
                                                <input type="date" className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-300" value={offerForm.end_date} onChange={e => setOfferForm(p => ({ ...p, end_date: e.target.value }))} />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 py-2 w-full mt-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                            <button 
                                                type="button" 
                                                onClick={() => setOfferForm(p => ({ ...p, is_active: !p.is_active }))} 
                                                className={`w-[44px] h-[24px] rounded-full transition-colors flex-shrink-0 flex items-center px-0.5 ${offerForm.is_active ? 'bg-teal-500' : 'bg-slate-300'}`}
                                            >
                                                <span className={`w-[20px] h-[20px] bg-white rounded-full shadow transition-all ${offerForm.is_active ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                                            </button>
                                            <span className="text-sm font-bold text-slate-700 whitespace-nowrap">
                                                {offerForm.is_active ? 'Active — visible to patients' : 'Inactive'}
                                            </span>
                                        </div>
                                        <button type="submit" className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors shadow-md mt-4">
                                            {editingOffer ? 'Save Changes' : 'Create Offer'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Offers List */}
                        <div className="space-y-3">
                            {offers.length === 0 && (
                                <div className="text-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-100">
                                    <Gift className="w-16 h-16 mx-auto opacity-20 mb-4" />
                                    <p className="text-lg font-bold">No offers created yet</p>
                                    <p className="text-sm mt-1">Create your first occasion-based offer!</p>
                                </div>
                            )}
                            {offers.map(offer => (
                                <div key={offer.id} className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${offer.is_active ? 'border-teal-100 hover:shadow-md' : 'border-slate-100 opacity-70'}`}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${offer.is_active ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-400'}`}>
                                                <Tag className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="font-extrabold text-slate-900">{offer.title}</h4>
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${offer.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                        {offer.is_active ? '● ACTIVE' : '○ INACTIVE'}
                                                    </span>
                                                </div>
                                                {offer.description && <p className="text-sm text-slate-500 mt-1">{offer.description}</p>}
                                                <div className="flex items-center gap-4 mt-2 flex-wrap">
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
                                                        <Gift className="w-3.5 h-3.5" />
                                                        {offer.discount_type === 'percentage' ? `${offer.discount_value}% Off` : `₹${offer.discount_value} Off`}
                                                    </span>
                                                    <span className="text-xs text-slate-500 font-medium">
                                                        {OCCASIONS.find(o => o.value === offer.occasion)?.label || offer.occasion}
                                                    </span>
                                                    {offer.start_date && <span className="text-xs text-slate-400">{offer.start_date} → {offer.end_date || '...'}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button onClick={() => toggleOfferActive(offer)} title={offer.is_active ? 'Deactivate' : 'Activate'} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${offer.is_active ? 'bg-teal-50 text-teal-600 hover:bg-teal-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                                                {offer.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                            </button>
                                            <button onClick={() => openEditOffer(offer)} className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => deleteOffer(offer.id)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {/* ── INVENTORY TAB REDIRECT ── */}
                {activeTab === 'inventory' && (() => {
                    navigate('/admin/inventory');
                    return null;
                })()}
            </main>
        </div>
    );
}

