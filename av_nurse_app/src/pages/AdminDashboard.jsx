import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, FileText, Calendar, Activity, TrendingUp, ShoppingBag, Package, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { cn } from '../lib/utils';

const StatCard = ({ title, value, icon: IconComp, color }) => (
    <div className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100">
        <div className="flex items-center justify-between mb-2">
            <div className={`flex size-10 items-center justify-center rounded-xl bg-${color}-50 text-${color}-500`}>
                <IconComp className="w-5 h-5" />
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
        </div>
        <p className="text-2xl font-extrabold text-slate-900">{value}</p>
        <p className="text-xs font-medium text-slate-500">{title}</p>
    </div>
);

const statusStyles = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending' },
    confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Confirmed' },
    completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Completed' },
    cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Cancelled' },
};

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [medicineOrders, setMedicineOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [stats, setStats] = useState({
        totalBookings: 0,
        pendingOrders: 0,
        activeNurses: 0,
        totalPrescriptions: 0,
    });

    const handleLogout = () => {
        const confirmed = window.confirm('Are you sure you want to logout?');
        if (confirmed) {
            localStorage.removeItem('userRole');
            localStorage.removeItem('userData');
            navigate('/role-selection');
        }
    };

    const loadData = async () => {
        setLoadingOrders(true);
        try {
            // Fetch all bookings
            const { data: bookings } = await supabase
                .from('bookings')
                .select('*')
                .order('created_at', { ascending: false });

            const allBookings = bookings || [];

            // Separate medicine orders from nursing bookings
            const orders = allBookings.filter(b => {
                let notes = {};
                try { notes = JSON.parse(b.notes || '{}'); } catch (_) { }
                return notes.is_medicine_order === true;
            }).map(b => {
                let notes = {};
                try { notes = JSON.parse(b.notes || '{}'); } catch (_) { }
                return {
                    id: b.id,
                    patientName: notes.patient_name || 'Patient',
                    amount: b.total_price || 0,
                    status: b.status || 'pending',
                    date: b.date || b.created_at,
                    createdAt: b.created_at,
                    paymentMethod: notes.payment_method || 'UPI',
                    subtotal: notes.subtotal || 0,
                };
            });

            const nursingBookings = allBookings.filter(b => {
                let notes = {};
                try { notes = JSON.parse(b.notes || '{}'); } catch (_) { }
                return !notes.is_medicine_order;
            });

            // Prescription count from Supabase
            const { count: rxCount } = await supabase
                .from('prescriptions')
                .select('*', { count: 'exact', head: true });

            setMedicineOrders(orders);
            setStats({
                totalBookings: nursingBookings.length,
                pendingOrders: orders.filter(o => o.status === 'pending').length,
                activeNurses: nursingBookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length,
                totalPrescriptions: rxCount || 0,
            });
        } catch (err) {
            console.error('AdminDashboard load error:', err.message);
        } finally {
            setLoadingOrders(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        await supabase.from('bookings').update({ status: newStatus }).eq('id', orderId);
        loadData();
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 10000); // refresh every 10s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 pt-12 pb-4 px-5">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={handleLogout}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Admin Dashboard</h1>
                    <div className="w-10" />
                </div>

                {/* Admin Info */}
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl mb-4">
                    <button onClick={() => navigate('/admin/profile')} className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-white shadow-sm text-indigo-700 font-bold overflow-hidden cursor-pointer">
                        AD
                    </button>
                    <div>
                        <p className="text-sm font-bold text-slate-900">Admin User</p>
                        <p className="text-xs font-medium text-slate-600">System Administrator</p>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-5 py-6 space-y-6 pb-24">

                {/* Stats Grid */}
                <div>
                    <h2 className="text-sm font-bold text-slate-900 mb-3">System Overview</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <StatCard title="Nursing Bookings" value={stats.totalBookings} icon={Calendar} color="blue" />
                        <StatCard title="All Prescriptions" value={stats.totalPrescriptions} icon={FileText} color="primary" />
                        <StatCard title="Pending Med Orders" value={stats.pendingOrders} icon={ShoppingBag} color="amber" />
                        <StatCard title="Active Requests" value={stats.activeNurses} icon={Activity} color="emerald" />
                    </div>
                </div>

                {/* ── MEDICINE ORDERS ── */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-bold text-slate-900">Medicine Orders</h2>
                        <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            {stats.pendingOrders} pending
                        </span>
                    </div>

                    {loadingOrders ? (
                        <div className="bg-white rounded-2xl p-8 text-center">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-xs font-medium text-slate-400">Loading orders…</p>
                        </div>
                    ) : medicineOrders.length === 0 ? (
                        <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
                            <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p className="text-sm font-medium text-slate-400">No medicine orders yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {medicineOrders.map(order => {
                                const s = statusStyles[order.status] || statusStyles.pending;
                                return (
                                    <div key={order.id} className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100">
                                        {/* Order header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 shrink-0">
                                                    <Package className="w-5 h-5 text-amber-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{order.patientName}</p>
                                                    <p className="text-xs font-medium text-slate-400">
                                                        {new Date(order.createdAt).toLocaleString('en-IN', {
                                                            month: 'short', day: 'numeric',
                                                            hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={cn('px-2 py-1 rounded-lg text-xs font-bold border', s.bg, s.text, s.border)}>
                                                {s.label}
                                            </span>
                                        </div>

                                        {/* Order details */}
                                        <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 mb-3">
                                            <div className="flex justify-between text-xs">
                                                <span className="font-medium text-slate-500">Order ID</span>
                                                <span className="font-bold text-slate-700 font-mono">{String(order.id).slice(0, 8).toUpperCase()}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="font-medium text-slate-500">Payment</span>
                                                <span className="font-bold text-slate-700">{order.paymentMethod}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="font-medium text-slate-500">Amount</span>
                                                <span className="font-bold text-primary">₹{order.amount}</span>
                                            </div>
                                        </div>

                                        {/* Admin actions */}
                                        {order.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'confirmed')}
                                                    className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors"
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    Confirm Order
                                                </button>
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                                    className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-bold hover:bg-red-100 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                        {order.status === 'confirmed' && (
                                            <button
                                                onClick={() => updateOrderStatus(order.id, 'completed')}
                                                className="w-full flex items-center justify-center gap-1.5 h-9 rounded-xl bg-blue-500 text-white text-xs font-bold hover:bg-blue-600 transition-colors"
                                            >
                                                <Clock className="w-3.5 h-3.5" />
                                                Mark as Delivered
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="text-sm font-bold text-slate-900 mb-3">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => navigate('/doctor/dashboard')}
                            className="bg-white rounded-xl p-4 shadow-soft border border-slate-100 hover:border-blue-200 transition-all text-left active:scale-95"
                        >
                            <FileText className="w-6 h-6 text-blue-500 mb-2" />
                            <p className="text-sm font-bold text-slate-900">View Prescriptions</p>
                            <p className="text-xs font-medium text-slate-500 mt-1">{stats.totalPrescriptions} total</p>
                        </button>
                        <button
                            onClick={() => navigate('/nurse/dashboard')}
                            className="bg-white rounded-xl p-4 shadow-soft border border-slate-100 hover:border-emerald-200 transition-all text-left active:scale-95"
                        >
                            <Activity className="w-6 h-6 text-emerald-500 mb-2" />
                            <p className="text-sm font-bold text-slate-900">Nurse Assignments</p>
                            <p className="text-xs font-medium text-slate-500 mt-1">{stats.activeNurses} active</p>
                        </button>
                        <button
                            onClick={() => navigate('/package-management')}
                            className="bg-white rounded-xl p-4 shadow-soft border border-slate-100 hover:border-purple-200 transition-all text-left active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[24px] text-purple-500 mb-2">package_2</span>
                            <p className="text-sm font-bold text-slate-900">Packages</p>
                            <p className="text-xs font-medium text-slate-500 mt-1">Manage IV packages</p>
                        </button>
                        <button
                            onClick={() => navigate('/staff-management')}
                            className="bg-white rounded-xl p-4 shadow-soft border border-slate-100 hover:border-amber-200 transition-all text-left active:scale-95"
                        >
                            <Users className="w-6 h-6 text-amber-500 mb-2" />
                            <p className="text-sm font-bold text-slate-900">Staff</p>
                            <p className="text-xs font-medium text-slate-500 mt-1">Doctors & Nurses</p>
                        </button>
                        <button
                            onClick={() => navigate('/revenue-reports')}
                            className="bg-white rounded-xl p-4 shadow-soft border border-slate-100 hover:border-emerald-200 transition-all text-left active:scale-95 col-span-2"
                        >
                            <TrendingUp className="w-6 h-6 text-emerald-500 mb-2" />
                            <p className="text-sm font-bold text-slate-900">Revenue Reports</p>
                            <p className="text-xs font-medium text-slate-500 mt-1">View analytics & trends</p>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
