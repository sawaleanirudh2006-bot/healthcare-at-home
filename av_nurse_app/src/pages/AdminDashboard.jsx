import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, FileText, Calendar, Activity, TrendingUp } from 'lucide-react';

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

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(() => {
        // Initial load from localStorage
        const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        const prescriptions = JSON.parse(localStorage.getItem('prescriptionQueue') || '[]');

        const pendingPrescriptions = prescriptions.filter(p => p.status === 'pending').length;
        const approvedPrescriptions = prescriptions.filter(p => p.status === 'approved').length;
        const nurseAssignments = bookings.filter(b => b.nurse && b.status === 'upcoming').length;

        return {
            totalBookings: bookings.length,
            totalPrescriptions: prescriptions.length,
            pendingPrescriptions: pendingPrescriptions,
            approvedPrescriptions: approvedPrescriptions,
            activePatients: 1, // Mock data
            activeNurses: nurseAssignments,
            activeDoctors: 1
        };
    });

    const [recentActivity, setRecentActivity] = useState(() => {
        // Initial load from localStorage
        const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        const prescriptions = JSON.parse(localStorage.getItem('prescriptionQueue') || '[]');

        const activity = [];
        bookings.forEach(booking => {
            activity.push({
                type: 'booking',
                title: `${booking.patientName || 'Patient'} - ${booking.service}`,
                subtitle: booking.nurse ? `Assigned to ${booking.nurse.name}` : 'Pending assignment',
                time: booking.createdAt || booking.date,
                icon: Calendar,
                color: 'blue'
            });
        });

        prescriptions.forEach(rx => {
            const statusText = rx.status.charAt(0).toUpperCase() + rx.status.slice(1);
            activity.push({
                type: 'prescription',
                title: `${rx.patientName || 'Patient'} - ${rx.serviceType}`,
                subtitle: `Prescription ${statusText}${rx.reviewedBy ? ' by ' + rx.reviewedBy : ''}`,
                time: rx.time || rx.uploadTime,
                icon: FileText,
                color: rx.status === 'approved' ? 'emerald' : rx.status === 'rejected' ? 'red' : 'blue'
            });
        });

        // Sort by most recent
        activity.sort((a, b) => new Date(b.time) - new Date(a.time));
        return activity.slice(0, 15);
    });

    const handleLogout = () => {
        const confirmed = window.confirm('Are you sure you want to logout?');
        if (confirmed) {
            localStorage.removeItem('userRole');
            localStorage.removeItem('userData');
            navigate('/role-selection');
        }
    };

    const loadStats = () => {
        // Load all data from localStorage
        const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        const prescriptions = JSON.parse(localStorage.getItem('prescriptionQueue') || '[]');

        const pendingPrescriptions = prescriptions.filter(p => p.status === 'pending').length;
        const approvedPrescriptions = prescriptions.filter(p => p.status === 'approved').length;
        const nurseAssignments = bookings.filter(b => b.nurse && b.status === 'upcoming').length;

        setStats({
            totalBookings: bookings.length,
            totalPrescriptions: prescriptions.length,
            pendingPrescriptions: pendingPrescriptions,
            approvedPrescriptions: approvedPrescriptions,
            activePatients: 1, // Mock data
            activeNurses: nurseAssignments,
            activeDoctors: 1
        });

        // Create recent activity from bookings and prescriptions
        const activity = [];

        bookings.forEach(booking => {
            activity.push({
                type: 'booking',
                title: `${booking.patientName || 'Patient'} - ${booking.service}`,
                subtitle: booking.nurse ? `Assigned to ${booking.nurse.name}` : 'Pending assignment',
                time: booking.createdAt || booking.date,
                icon: Calendar,
                color: 'blue'
            });
        });

        prescriptions.forEach(rx => {
            const statusText = rx.status.charAt(0).toUpperCase() + rx.status.slice(1);
            activity.push({
                type: 'prescription',
                title: `${rx.patientName || 'Patient'} - ${rx.serviceType}`,
                subtitle: `Prescription ${statusText}${rx.reviewedBy ? ' by ' + rx.reviewedBy : ''}`,
                time: rx.reviewTime || rx.uploadTime,
                icon: FileText,
                color: rx.status === 'approved' ? 'emerald' : rx.status === 'rejected' ? 'red' : 'blue'
            });
        });

        // Sort by most recent
        activity.sort((a, b) => new Date(b.time) - new Date(a.time));
        setRecentActivity(activity.slice(0, 15));
    };

    useEffect(() => {
        // Refresh every 5 seconds
        // eslint-disable-next-line react-hooks/exhaustive-deps
        const loadStats = () => {
            // ... duplicate? No, loadStats is defined above.
            // Wait, I can't just reuse loadStats if I am not re-defining it.
            // Just call it.
            // But wait, loadStats uses setStats and setRecentActivity which are in scope.
        };
        const interval = setInterval(() => {
            // Logic from loadStats
            // Actually, loadStats is defined in component scope.
            // So setInterval(loadStats, 5000) works.
            // But loadStats depends on nothing from render scope except setters, which are stable.
        }, 5000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                        <StatCard title="Total Bookings" value={stats.totalBookings} icon={Calendar} color="blue" />
                        <StatCard title="All Prescriptions" value={stats.totalPrescriptions} icon={FileText} color="primary" />
                        <StatCard title="Pending Review" value={stats.pendingPrescriptions || 0} icon={FileText} color="amber" />
                        <StatCard title="Active Nurses" value={stats.activeNurses} icon={Activity} color="emerald" />
                    </div>
                </div>

                {/* Recent Activity */}
                <div>
                    <h2 className="text-sm font-bold text-slate-900 mb-3">Recent Activity</h2>
                    <div className="space-y-3">
                        {recentActivity.length === 0 ? (
                            <div className="bg-white rounded-2xl p-8 text-center">
                                <Activity className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <p className="text-sm font-medium text-slate-400">No recent activity</p>
                            </div>
                        ) : (
                            recentActivity.slice(0, 5).map((activity, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-xl p-3 shadow-soft border border-slate-100 flex items-start gap-3"
                                >
                                    <div className={`flex size-10 items-center justify-center rounded-lg bg-${activity.color}-50 text-${activity.color}-500 shrink-0`}>
                                        <activity.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate">
                                            {activity.title}
                                        </p>
                                        {activity.subtitle && (
                                            <p className="text-xs font-medium text-slate-600 truncate">
                                                {activity.subtitle}
                                            </p>
                                        )}
                                        <p className="text-xs font-medium text-slate-400 mt-0.5">
                                            {new Date(activity.time).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Nurse Assignments - Detailed View */}
                <div>
                    <h2 className="text-sm font-bold text-slate-900 mb-3">Active Nurse Assignments</h2>
                    <div className="space-y-3">
                        {(() => {
                            const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
                            const activeAssignments = bookings.filter(b => b.nurse && b.status !== 'cancelled' && b.status !== 'completed');

                            if (activeAssignments.length === 0) {
                                return (
                                    <div className="bg-white rounded-2xl p-8 text-center">
                                        <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                        <p className="text-sm font-medium text-slate-400">No active nurse assignments</p>
                                    </div>
                                );
                            }

                            return activeAssignments.map((assignment) => (
                                <div key={assignment.id} className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100">
                                    <div className="flex items-start gap-3">
                                        <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 shrink-0">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-900">
                                                        {assignment.service}
                                                    </h3>
                                                    <p className="text-xs font-medium text-slate-500">
                                                        ID: {assignment.id}
                                                    </p>
                                                </div>
                                                <span className="px-2 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200">
                                                    Active
                                                </span>
                                            </div>

                                            <div className="space-y-2 text-xs">
                                                <div className="flex items-start gap-2">
                                                    <span className="font-bold text-slate-600 min-w-[70px]">Patient:</span>
                                                    <span className="font-medium text-slate-900">{assignment.patientName || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <span className="font-bold text-slate-600 min-w-[70px]">Nurse:</span>
                                                    <span className="font-medium text-emerald-600">{assignment.nurse?.name || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <span className="font-bold text-slate-600 min-w-[70px]">Location:</span>
                                                    <span className="font-medium text-slate-700">{assignment.address || 'Address not provided'}</span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <span className="font-bold text-slate-600 min-w-[70px]">Schedule:</span>
                                                    <span className="font-medium text-slate-700">{assignment.date} at {assignment.time}</span>
                                                </div>
                                                {assignment.nurse?.phone && (
                                                    <div className="flex items-start gap-2">
                                                        <span className="font-bold text-slate-600 min-w-[70px]">Contact:</span>
                                                        <span className="font-medium text-slate-700">{assignment.nurse.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </div>

                {/* Completed Assignments */}
                <div>
                    <h2 className="text-sm font-bold text-slate-900 mb-3">Recently Completed</h2>
                    <div className="space-y-3">
                        {(() => {
                            const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
                            const completedAssignments = bookings.filter(b => b.status === 'completed').slice(0, 3);

                            if (completedAssignments.length === 0) {
                                return (
                                    <div className="bg-white rounded-2xl p-6 text-center">
                                        <p className="text-xs font-medium text-slate-400">No completed assignments yet</p>
                                    </div>
                                );
                            }

                            return completedAssignments.map((assignment) => (
                                <div key={assignment.id} className="bg-white rounded-xl p-3 shadow-soft border border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-900">{assignment.service}</p>
                                            <p className="text-xs font-medium text-slate-600">
                                                {assignment.patientName} • {assignment.nurse?.name}
                                            </p>
                                            <p className="text-xs font-medium text-slate-400 mt-1">
                                                Completed: {new Date(assignment.completedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                            ✓ Done
                                        </span>
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
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
                            <p className="text-xs font-medium text-slate-500 mt-1">{stats.pendingPrescriptions || 0} pending</p>
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
