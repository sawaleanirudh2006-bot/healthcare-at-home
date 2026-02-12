import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Clock, CheckCircle, XCircle, User, Calendar, Search } from 'lucide-react';
import { cn } from '../lib/utils';

export default function DoctorDashboard() {
    const navigate = useNavigate();
    const [prescriptions, setPrescriptions] = useState(() => {
        return JSON.parse(localStorage.getItem('prescriptionQueue') || '[]');
    });
    const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
    const [searchQuery, setSearchQuery] = useState('');

    const handleLogout = () => {
        const confirmed = window.confirm('Are you sure you want to logout?');
        if (confirmed) {
            // Clear user session data
            localStorage.removeItem('userRole');
            localStorage.removeItem('userData');
            navigate('/role-selection');
        }
    };

    const loadPrescriptions = () => {
        const stored = JSON.parse(localStorage.getItem('prescriptionQueue') || '[]');
        setPrescriptions(stored);
    };

    useEffect(() => {
        // Poll for updates every 3 seconds
        const interval = setInterval(loadPrescriptions, 3000);
        return () => clearInterval(interval);
    }, []);

    const filteredPrescriptions = prescriptions.filter(rx => {
        const matchesFilter = filter === 'all' || rx.status === filter;
        const matchesSearch = (rx.patientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (rx.serviceType || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'rejected': return 'bg-red-50 text-red-600 border-red-200';
            default: return 'bg-slate-50 text-slate-600 border-slate-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'approved': return <CheckCircle className="w-4 h-4" />;
            case 'rejected': return <XCircle className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const pendingCount = prescriptions.filter(rx => rx.status === 'pending').length;
    const approvedCount = prescriptions.filter(rx => rx.status === 'approved').length;
    const rejectedCount = prescriptions.filter(rx => rx.status === 'rejected').length;

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
                    <h1 className="text-lg font-bold text-slate-900">Doctor Dashboard</h1>
                    <div className="w-10" />
                </div>

                {/* Doctor Info */}
                <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-xl mb-4">
                    <button onClick={() => navigate('/doctor/profile')} className="size-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg hover:opacity-90 transition-opacity">
                        DK
                    </button>
                    <div>
                        <p className="text-sm font-bold text-slate-900">Dr. Rajesh Kumar</p>
                        <p className="text-xs font-medium text-slate-600">General Physician</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by patient or service..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                    {[
                        { id: 'pending', label: 'Pending', count: pendingCount },
                        { id: 'approved', label: 'Approved', count: approvedCount },
                        { id: 'rejected', label: 'Rejected', count: rejectedCount },
                        { id: 'all', label: 'All', count: prescriptions.length }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all',
                                filter === tab.id
                                    ? 'bg-blue-500 text-white shadow-md'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
                            )}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-5 py-6 space-y-4 pb-24">
                {filteredPrescriptions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <FileText className="w-12 h-12 mb-3 opacity-50" />
                        <p className="text-sm font-semibold">No {filter !== 'all' ? filter : ''} prescriptions found</p>
                    </div>
                ) : (
                    filteredPrescriptions.map((rx) => (
                        <div
                            key={rx.id}
                            onClick={() => navigate(`/doctor/prescription/${rx.id}`)}
                            className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer active:scale-[0.98]"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-500 shrink-0">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 truncate">
                                                {rx.patientName || 'Patient'}
                                            </h3>
                                            <p className="text-sm font-medium text-slate-500">
                                                {rx.serviceType}
                                            </p>
                                        </div>
                                        <span className={cn(
                                            'px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 shrink-0',
                                            getStatusColor(rx.status)
                                        )}>
                                            {getStatusIcon(rx.status)}
                                            {rx.status.charAt(0).toUpperCase() + rx.status.slice(1)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(rx.uploadTime).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <FileText className="w-3.5 h-3.5" />
                                            {rx.prescription?.name || 'prescription.pdf'}
                                        </span>
                                    </div>

                                    {rx.status === 'rejected' && rx.rejectionReason && (
                                        <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-100">
                                            <p className="text-xs font-medium text-red-700">
                                                <span className="font-bold">Reason:</span> {rx.rejectionReason}
                                            </p>
                                        </div>
                                    )}

                                    {rx.status === 'approved' && rx.reviewTime && (
                                        <div className="mt-2 text-xs font-medium text-emerald-600">
                                            Approved on {new Date(rx.reviewTime).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
}
