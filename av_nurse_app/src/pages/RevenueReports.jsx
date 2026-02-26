import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, TrendingUp, DollarSign, Users, Package,
    Activity, Zap, BarChart3, PieChart, FileText, ShoppingBag
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
}) : '—';

const RevenueReports = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [allBookings, setAllBookings] = useState([]);
    const [timePeriod, setTimePeriod] = useState('all');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
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
                    status: b.status || 'pending',
                    price: Number(b.total_price || 0),
                    createdAt: b.created_at,
                    isMedicine: notes.is_medicine_order || false,
                    isEmergency: notes.is_emergency || (b.service_name || '').includes('EMERGENCY') || false,
                    isLabTest: notes.planType === 'lab-test' || (b.service_name || '').toLowerCase().includes('lab test') || false,
                    isInsurance: notes.planType === 'insurance' || (b.service_name || '').toLowerCase().includes('insurance') || false,
                    nurseName: notes.assigned_nurse_name || '—',
                };
            });
            setAllBookings(mapped);
        } catch (err) {
            console.error('Revenue load error:', err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // ─── Time filtering ────────────────────────────────────────────────────
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);

    const filteredBookings = useMemo(() => {
        return allBookings.filter(b => {
            if (timePeriod === 'all') return true;
            const d = new Date(b.date || b.createdAt);
            if (timePeriod === 'week') return d >= thisWeekStart;
            if (timePeriod === 'this') return d >= thisMonthStart && d <= thisMonthEnd;
            if (timePeriod === 'last') return d >= lastMonthStart && d <= lastMonthEnd;
            return true;
        });
    }, [allBookings, timePeriod]);

    const activeBookings = filteredBookings.filter(b => b.status !== 'cancelled');
    const totalRevenue = activeBookings.reduce((s, b) => s + b.price, 0);
    const completedBookings = filteredBookings.filter(b => b.status === 'completed');
    const completedRevenue = completedBookings.reduce((s, b) => s + b.price, 0);
    const cancelledBookings = filteredBookings.filter(b => b.status === 'cancelled');
    const pendingBookings = filteredBookings.filter(b => b.status === 'pending');
    const avgBookingValue = activeBookings.length > 0 ? Math.round(totalRevenue / activeBookings.length) : 0;

    // Revenue by service
    const revenueByService = useMemo(() => {
        const map = {};
        activeBookings.forEach(b => {
            const key = b.service;
            if (!map[key]) map[key] = { service: key, total: 0, count: 0 };
            map[key].total += b.price;
            map[key].count += 1;
        });
        return Object.values(map).sort((a, b) => b.total - a.total);
    }, [activeBookings]);

    // Revenue by patient
    const revenueByPatient = useMemo(() => {
        const map = {};
        activeBookings.forEach(b => {
            const key = b.patient;
            if (!map[key]) map[key] = { name: key, total: 0, count: 0, lastDate: null };
            map[key].total += b.price;
            map[key].count += 1;
            const d = b.date || b.createdAt;
            if (!map[key].lastDate || d > map[key].lastDate) map[key].lastDate = d;
        });
        return Object.values(map).sort((a, b) => b.total - a.total);
    }, [activeBookings]);

    // Monthly trend (last 6 months)
    const monthlyTrend = useMemo(() => {
        const months = [];
        for (let i = -5; i <= 0; i++) {
            const start = new Date(now.getFullYear(), now.getMonth() + i, 1);
            const end = new Date(now.getFullYear(), now.getMonth() + i + 1, 0, 23, 59, 59);
            const label = start.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
            const bks = allBookings.filter(b => {
                const d = new Date(b.date || b.createdAt);
                return d >= start && d <= end && b.status !== 'cancelled';
            });
            months.push({
                label,
                revenue: bks.reduce((s, b) => s + b.price, 0),
                bookings: bks.length,
            });
        }
        return months;
    }, [allBookings]);

    const maxMonthRev = Math.max(...monthlyTrend.map(m => m.revenue), 1);

    // Category breakdown
    const categoryBreakdown = useMemo(() => {
        const nursing = activeBookings.filter(b => !b.isMedicine && !b.isEmergency && !b.isLabTest && !b.isInsurance);
        const medicine = activeBookings.filter(b => b.isMedicine);
        const emergency = activeBookings.filter(b => b.isEmergency);
        const labTest = activeBookings.filter(b => b.isLabTest);
        return [
            { label: 'Nursing', icon: Activity, color: 'from-emerald-500 to-teal-600', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', count: nursing.length, revenue: nursing.reduce((s, b) => s + b.price, 0) },
            { label: 'Medicine', icon: ShoppingBag, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', textColor: 'text-blue-700', count: medicine.length, revenue: medicine.reduce((s, b) => s + b.price, 0) },
            { label: 'Emergency', icon: Zap, color: 'from-red-500 to-rose-600', bgColor: 'bg-red-50', textColor: 'text-red-700', count: emergency.length, revenue: emergency.reduce((s, b) => s + b.price, 0) },
            { label: 'Lab Tests', icon: FileText, color: 'from-purple-500 to-violet-600', bgColor: 'bg-purple-50', textColor: 'text-purple-700', count: labTest.length, revenue: labTest.reduce((s, b) => s + b.price, 0) },
        ];
    }, [activeBookings]);

    const periodLabel = timePeriod === 'week' ? 'This Week'
        : timePeriod === 'this' ? 'This Month'
            : timePeriod === 'last' ? 'Last Month'
                : 'All Time';

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
                <div className="max-w-3xl mx-auto px-5 pt-12 pb-4">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-extrabold text-slate-900">Revenue & Reports</h1>
                        <div className="w-10" />
                    </div>

                    {/* Time Period Filter */}
                    <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                        {[
                            { id: 'all', label: 'All Time' },
                            { id: 'last', label: 'Last Month' },
                            { id: 'this', label: 'This Month' },
                            { id: 'week', label: 'This Week' },
                        ].map(p => (
                            <button
                                key={p.id}
                                onClick={() => setTimePeriod(p.id)}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${timePeriod === p.id
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-5 py-6 space-y-5">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-slate-500 font-medium">Loading revenue data…</p>
                    </div>
                ) : (
                    <>
                        {/* ── Top Stats ───────────────────────────────────────── */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white">
                                <DollarSign className="w-7 h-7 mb-2 opacity-80" />
                                <p className="text-xs font-medium opacity-90">Total Revenue</p>
                                <p className="text-2xl font-extrabold mt-1">₹{totalRevenue.toLocaleString()}</p>
                                <p className="text-[10px] opacity-70 mt-1">{periodLabel}</p>
                            </div>

                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
                                <Users className="w-7 h-7 mb-2 opacity-80" />
                                <p className="text-xs font-medium opacity-90">Total Bookings</p>
                                <p className="text-2xl font-extrabold mt-1">{filteredBookings.length}</p>
                                <p className="text-[10px] opacity-70 mt-1">{activeBookings.length} active</p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white">
                                <TrendingUp className="w-7 h-7 mb-2 opacity-80" />
                                <p className="text-xs font-medium opacity-90">Avg Booking Value</p>
                                <p className="text-2xl font-extrabold mt-1">₹{avgBookingValue.toLocaleString()}</p>
                                <p className="text-[10px] opacity-70 mt-1">per booking</p>
                            </div>

                            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white">
                                <Package className="w-7 h-7 mb-2 opacity-80" />
                                <p className="text-xs font-medium opacity-90">Completed Revenue</p>
                                <p className="text-2xl font-extrabold mt-1">₹{completedRevenue.toLocaleString()}</p>
                                <p className="text-[10px] opacity-70 mt-1">{completedBookings.length} completed</p>
                            </div>
                        </div>

                        {/* ── Status Breakdown Bar ─────────────────────────────── */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <PieChart className="w-4 h-4 text-indigo-500" />
                                Booking Status Breakdown
                            </h3>
                            <div className="flex gap-2 mb-4">
                                {[
                                    { label: 'Completed', count: completedBookings.length, color: 'bg-emerald-500' },
                                    { label: 'Pending', count: pendingBookings.length, color: 'bg-amber-500' },
                                    { label: 'Cancelled', count: cancelledBookings.length, color: 'bg-red-500' },
                                ].map(s => (
                                    <div key={s.label} className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                                        <span className="font-semibold">{s.label}: {s.count}</span>
                                    </div>
                                ))}
                            </div>
                            {filteredBookings.length > 0 && (
                                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
                                    <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${(completedBookings.length / filteredBookings.length) * 100}%` }} />
                                    <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${(pendingBookings.length / filteredBookings.length) * 100}%` }} />
                                    <div className="bg-red-500 h-full transition-all duration-500" style={{ width: `${(cancelledBookings.length / filteredBookings.length) * 100}%` }} />
                                </div>
                            )}
                        </div>

                        {/* ── Category Breakdown ─────────────────────────────── */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-indigo-500" />
                                Revenue by Category
                            </h3>
                            <div className="space-y-3">
                                {categoryBreakdown.map(cat => {
                                    const Icon = cat.icon;
                                    const pct = totalRevenue > 0 ? Math.round((cat.revenue / totalRevenue) * 100) : 0;
                                    return (
                                        <div key={cat.label} className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl ${cat.bgColor} flex items-center justify-center shrink-0`}>
                                                <Icon className={`w-5 h-5 ${cat.textColor}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-semibold text-slate-800">{cat.label}</span>
                                                    <span className="text-sm font-bold text-slate-900">₹{cat.revenue.toLocaleString()}</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full bg-gradient-to-r ${cat.color} rounded-full transition-all duration-700`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-[10px] text-slate-400 font-medium">{cat.count} bookings</span>
                                                    <span className="text-[10px] text-slate-400 font-bold">{pct}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Monthly Revenue Trend ──────────────────────────── */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-amber-500" />
                                Monthly Revenue Trend
                            </h3>
                            <div className="h-48 flex items-end justify-between gap-2">
                                {monthlyTrend.map((m, idx) => {
                                    const pct = maxMonthRev > 0 ? (m.revenue / maxMonthRev) * 100 : 0;
                                    return (
                                        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                            <p className="text-[9px] font-bold text-slate-500">₹{m.revenue >= 1000 ? `${(m.revenue / 1000).toFixed(1)}k` : m.revenue}</p>
                                            <div className="w-full rounded-t-lg bg-slate-100 relative" style={{ height: `${Math.max(pct, 4)}%` }}>
                                                <div
                                                    className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-500"
                                                    style={{ height: '100%' }}
                                                />
                                            </div>
                                            <div className="text-center">
                                                <span className="text-[10px] font-bold text-slate-600 block">{m.label}</span>
                                                <span className="text-[9px] text-slate-400">{m.bookings} bk</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Top Services ────────────────────────────────────── */}
                        {revenueByService.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-100">
                                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <Package className="w-4 h-4 text-purple-500" />
                                        Top Services by Revenue
                                    </h3>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    {revenueByService.slice(0, 8).map((s, idx) => (
                                        <div key={s.service} className="px-5 py-3 hover:bg-slate-50 transition-colors flex items-center gap-3">
                                            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black flex items-center justify-center shrink-0">
                                                {idx + 1}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 truncate">{s.service}</p>
                                                <p className="text-xs text-slate-400">{s.count} bookings</p>
                                            </div>
                                            <p className="text-sm font-bold text-emerald-600">₹{s.total.toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Top Patients ────────────────────────────────────── */}
                        {revenueByPatient.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-100">
                                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-blue-500" />
                                        Top Patients by Revenue
                                    </h3>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    {revenueByPatient.slice(0, 8).map((p, idx) => (
                                        <div key={p.name} className="px-5 py-3 hover:bg-slate-50 transition-colors flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                                                {p.name?.slice(0, 2).toUpperCase() || '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                                                <p className="text-xs text-slate-400">{p.count} bookings · Last: {fmtDate(p.lastDate)}</p>
                                            </div>
                                            <p className="text-sm font-bold text-emerald-600">₹{p.total.toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {filteredBookings.length === 0 && (
                            <div className="text-center py-16 text-slate-400">
                                <TrendingUp className="w-12 h-12 mx-auto opacity-30 mb-3" />
                                <p className="text-sm font-medium">No revenue data for {periodLabel.toLowerCase()}</p>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default RevenueReports;
