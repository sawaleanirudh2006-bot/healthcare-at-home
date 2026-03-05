import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Clock, CheckCircle, XCircle, User, Calendar, Search, Activity, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabaseClient';

export default function DoctorDashboard() {
    const navigate = useNavigate();
    const [prescriptions, setPrescriptions] = useState([]);
    const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all, consultations
    const [searchQuery, setSearchQuery] = useState('');
    const [consultRequests, setConsultRequests] = useState([]);
    const [doctorProfile, setDoctorProfile] = useState(null);

    const handleLogout = () => {
        const confirmed = window.confirm('Are you sure you want to logout?');
        if (confirmed) {
            localStorage.removeItem('userRole');
            localStorage.removeItem('userData');
            localStorage.removeItem('token');
            navigate('/role-selection');
        }
    };

    const loadPrescriptions = async () => {
        try {
            const { data, error } = await supabase
                .from('prescriptions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw new Error(error.message);

            const formattedData = (data || []).map(rx => ({
                id: rx.id,
                patientName: rx.patient_name,
                serviceType: rx.service_type,
                uploadTime: rx.created_at,
                status: rx.status,
                rejectionReason: rx.rejection_reason,
                reviewTime: rx.review_time,
                prescription: { name: rx.file_name, url: rx.file_url },
                bookingDetails: rx.booking_details,
            }));

            setPrescriptions(formattedData);

            // Load consultations from localStorage for demo
            setConsultRequests(JSON.parse(localStorage.getItem('doctorConsults') || '[]'));

            // Load profile
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('doctor_profiles')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .single();
                if (profile) setDoctorProfile(profile);
            }
        } catch (error) {
            console.error('Failed to load data:', error.message);
        }
    };

    useEffect(() => {
        loadPrescriptions();
        // Poll for updates every 10 seconds (less frequent than before)
        const interval = setInterval(loadPrescriptions, 10000);
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
    const waitingConsults = consultRequests.filter(c => c.status === 'pending').length;

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
                    <h1 className="text-lg font-bold text-slate-900">Doctor Dashboard</h1>
                    <div className="w-10" />
                </div>

                {/* Doctor Info */}
                <div className="flex items-center gap-3 bg-teal-50 p-3 rounded-xl mb-4 border border-teal-100">
                    <button onClick={() => navigate('/doctor/profile')} className="size-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-lg hover:opacity-90 transition-opacity shadow-sm">
                        {doctorProfile ? doctorProfile.full_name?.replace('Dr.', '').trim().charAt(0).toUpperCase() : 'DK'}
                    </button>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <p className="text-sm font-bold text-black">{doctorProfile?.full_name || 'Dr. Rajesh Kumar'}</p>
                            {(doctorProfile?.verification_status === 'approved' || !doctorProfile) && (
                                <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-bold rounded-md" title="Verified Doctor">
                                    <CheckCircle className="w-3 h-3" /> Verified
                                </span>
                            )}
                        </div>
                        <p className="text-xs font-medium text-slate-600">{doctorProfile?.specialization || 'General Physician'}</p>
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
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20 focus:border-teal-500 text-sm transition-all"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                    {[
                        { id: 'consultations', label: 'Consultations', count: waitingConsults },
                        { id: 'pending', label: 'Pending Rx', count: pendingCount },
                        { id: 'approved', label: 'Approved', count: approvedCount },
                        { id: 'all', label: 'All', count: prescriptions.length }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all shadow-sm',
                                filter === tab.id
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-white text-slate-600 border border-slate-100'
                            )}
                        >
                            {tab.label} {tab.count > 0 && `(${tab.count})`}
                        </button>
                    ))}
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-5 py-6 space-y-4 pb-24">
                {filter === 'consultations' ? (
                    consultRequests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                                <Activity className="w-8 h-8 opacity-40" />
                            </div>
                            <p className="text-sm font-bold text-slate-500">No consultation requests</p>
                        </div>
                    ) : (
                        consultRequests.map(consult => (
                            <div key={consult.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 group animate-in fade-in">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 shrink-0">
                                        <Activity className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div>
                                                <h3 className="text-base font-bold text-black truncate">{consult.userName}</h3>
                                                <p className="text-[10px] font-bold text-teal-600 mb-1 uppercase tracking-wider">{consult.mode} CONSULT</p>
                                            </div>
                                            <span className={cn(
                                                "px-2 py-1 rounded-lg text-[10px] font-bold border",
                                                consult.status === 'pending' ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-teal-50 text-teal-700 border-teal-200"
                                            )}>
                                                {consult.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium line-clamp-1 mb-3">
                                            Requested for: {consult.specialty}
                                        </p>
                                        {consult.status === 'pending' && (
                                            <button
                                                onClick={() => navigate(`/doctor/issue-prescription/${consult.id}`)}
                                                className="w-full py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 active:scale-95 transition-all shadow-md shadow-teal-900/10 flex items-center justify-center gap-2"
                                            >
                                                Start Consult &amp; Issue Rx
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )
                ) : filteredPrescriptions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                            <FileText className="w-8 h-8 opacity-40" />
                        </div>
                        <p className="text-sm font-bold text-slate-500">No {filter !== 'all' ? filter : ''} prescriptions found</p>
                    </div>
                ) : (
                    filteredPrescriptions.map((rx) => (
                        <div
                            key={rx.id}
                            onClick={() => navigate(`/doctor/prescription/${rx.id}`)}
                            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:border-teal-200 transition-all cursor-pointer active:scale-[0.98]"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex size-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 shrink-0">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div>
                                            <h3 className="text-base font-bold text-black truncate">
                                                {rx.patientName || 'Patient'}
                                            </h3>
                                            <p className="text-xs font-medium text-slate-500">
                                                {rx.serviceType}
                                            </p>
                                        </div>
                                        <span className={cn(
                                            'px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1.5 shrink-0',
                                            rx.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                rx.status === 'approved' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                                                    'bg-red-50 text-red-700 border-red-200'
                                        )}>
                                            {getStatusIcon(rx.status)}
                                            {rx.status.charAt(0).toUpperCase() + rx.status.slice(1)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-[10px] font-medium text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(rx.uploadTime).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <FileText className="w-3 h-3" />
                                            {rx.prescription?.name || 'prescription.pdf'}
                                        </span>
                                    </div>

                                    {rx.status === 'rejected' && rx.rejectionReason && (
                                        <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-100">
                                            <p className="text-[10px] font-medium text-red-700">
                                                <span className="font-bold">Reason:</span> {rx.rejectionReason}
                                            </p>
                                        </div>
                                    )}

                                    {rx.status === 'approved' && rx.reviewTime && (
                                        <div className="mt-2 text-[10px] font-bold text-teal-700">
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
