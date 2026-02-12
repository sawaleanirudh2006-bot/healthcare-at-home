import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, User, Clock, CheckCircle, Phone } from 'lucide-react';

export default function NurseDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('assigned'); // assigned, completed
    const [assignments, setAssignments] = useState([]);

    const handleLogout = () => {
        const confirmed = window.confirm('Are you sure you want to logout?');
        if (confirmed) {
            localStorage.removeItem('userRole');
            localStorage.removeItem('userData');
            navigate('/role-selection');
        }
    };

    const loadAssignments = () => {
        // Load nurse assignments from localStorage (bookings with assigned nurses)
        const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        const nurseAssignments = bookings.filter(booking =>
            booking.nurse // Include all nurse assignments, even cancelled ones
        );
        setAssignments(nurseAssignments);
    };

    useEffect(() => {
        loadAssignments();
        // Poll for new assignments
        const interval = setInterval(loadAssignments, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleCallPatient = (assignment) => {
        // Open phone dialer with patient phone number
        const phoneNumber = assignment.patientPhone || '+91 98765 43210';
        window.location.assign(`tel:${phoneNumber}`);
    };

    const handleMarkComplete = (assignmentId) => {
        // Update booking status to completed
        const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        const updated = bookings.map(booking => {
            if (booking.id === assignmentId) {
                return {
                    ...booking,
                    status: 'completed',
                    completedAt: new Date().toISOString(),
                    completedBy: 'Nurse Sarah'
                };
            }
            return booking;
        });
        localStorage.setItem('userBookings', JSON.stringify(updated));

        // Reload assignments to reflect changes
        loadAssignments();
    };

    const filteredAssignments = assignments.filter(assignment => {
        if (activeTab === 'assigned') {
            return assignment.status === 'upcoming' || assignment.status === 'confirmed';
        }
        if (activeTab === 'cancelled') {
            return assignment.status === 'cancelled';
        }
        return assignment.status === 'completed';
    });

    const assignedCount = assignments.filter(a => a.status === 'upcoming' || a.status === 'confirmed').length;
    const completedCount = assignments.filter(a => a.status === 'completed').length;
    const cancelledCount = assignments.filter(a => a.status === 'cancelled').length;

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
                    <h1 className="text-lg font-bold text-slate-900">Nurse Dashboard</h1>
                    <div className="w-10" />
                </div>

                {/* Nurse Info */}
                <div className="flex items-center gap-3 bg-emerald-50 p-3 rounded-xl mb-4">
                    <button onClick={() => navigate('/nurse/profile')} className="flex-shrink-0 relative">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                            <span className="font-bold text-indigo-600">NS</span>
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </button>
                    <div>
                        <p className="text-sm font-bold text-slate-900">Nurse Sarah</p>
                        <p className="text-xs font-medium text-slate-600">Registered Nurse • On Duty</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    <button
                        onClick={() => setActiveTab('assigned')}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'assigned'
                            ? 'bg-emerald-500 text-white shadow-md'
                            : 'bg-white text-slate-600 border border-slate-200'
                            }`}
                    >
                        Assigned ({assignedCount})
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'completed'
                            ? 'bg-emerald-500 text-white shadow-md'
                            : 'bg-white text-slate-600 border border-slate-200'
                            }`}
                    >
                        Completed ({completedCount})
                    </button>
                    <button
                        onClick={() => setActiveTab('cancelled')}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'cancelled'
                            ? 'bg-red-500 text-white shadow-md'
                            : 'bg-white text-slate-600 border border-slate-200'
                            }`}
                    >
                        Cancelled ({cancelledCount})
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-5 py-6 space-y-4 pb-24">
                {filteredAssignments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <Calendar className="w-12 h-12 mb-3 opacity-50" />
                        <p className="text-sm font-semibold">No {activeTab} assignments</p>
                    </div>
                ) : (
                    filteredAssignments.map((assignment) => (
                        <div
                            key={assignment.id}
                            className={`bg-white rounded-2xl p-4 shadow-soft border ${assignment.status === 'cancelled' ? 'border-red-100 bg-red-50/10' : 'border-slate-100'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`flex size-12 items-center justify-center rounded-xl shrink-0 ${assignment.status === 'cancelled' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
                                    }`}>
                                    <User className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div>
                                            <h3 className={`text-base font-bold ${assignment.status === 'cancelled' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                                                {assignment.service}
                                            </h3>
                                            <p className="text-sm font-medium text-slate-500">
                                                Patient: {assignment.patientName || 'Patient'}
                                            </p>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${assignment.status === 'completed'
                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                            : assignment.status === 'cancelled'
                                                ? 'bg-red-50 text-red-600 border border-red-200'
                                                : 'bg-blue-50 text-blue-600 border border-blue-200'
                                            }`}>
                                            {assignment.status === 'completed' ? 'Completed'
                                                : assignment.status === 'cancelled' ? 'Cancelled'
                                                    : 'Assigned'}
                                        </span>
                                    </div>

                                    <div className="space-y-1.5 text-xs font-medium text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {assignment.date}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {assignment.time}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {assignment.address || 'Address not provided'}
                                        </div>
                                    </div>

                                    {/* Doctor Instructions Section */}
                                    {(assignment.diagnosis || assignment.doctorNotes) && (
                                        <div className={`mt-3 p-3 rounded-lg border ${assignment.status === 'cancelled' ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-amber-50 border-amber-100'
                                            }`}>
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <User className={`w-3.5 h-3.5 ${assignment.status === 'cancelled' ? 'text-slate-500' : 'text-amber-600'}`} />
                                                <p className={`text-xs font-bold ${assignment.status === 'cancelled' ? 'text-slate-600' : 'text-amber-900'}`}>Doctor's Instructions</p>
                                            </div>
                                            {assignment.diagnosis && (
                                                <p className={`text-xs font-semibold mb-1 ${assignment.status === 'cancelled' ? 'text-slate-500' : 'text-amber-800'}`}>Diagnosis: {assignment.diagnosis}</p>
                                            )}
                                            {assignment.doctorNotes && (
                                                <p className={`text-xs whitespace-pre-wrap ${assignment.status === 'cancelled' ? 'text-slate-500' : 'text-amber-700'}`}>{assignment.doctorNotes}</p>
                                            )}
                                        </div>
                                    )}

                                    {assignment.status !== 'completed' && assignment.status !== 'cancelled' && (
                                        <div className="mt-3 flex flex-col gap-2">
                                            {assignment.trackingStatus !== 'on_the_way' ? (
                                                <button
                                                    onClick={() => {
                                                        const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
                                                        const updated = bookings.map(b =>
                                                            b.id === assignment.id ? { ...b, trackingStatus: 'on_the_way' } : b
                                                        );
                                                        localStorage.setItem('userBookings', JSON.stringify(updated));
                                                        loadAssignments();
                                                    }}
                                                    className="w-full px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-1"
                                                >
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    Start Journey
                                                </button>
                                            ) : (
                                                <div className="w-full px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-100 flex items-center justify-center gap-1 animate-pulse">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    On the way
                                                </div>
                                            )}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleCallPatient(assignment)}
                                                    className="flex-1 px-3 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-1"
                                                >
                                                    <Phone className="w-3.5 h-3.5" />
                                                    Call Patient
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/nurse/add-notes/${assignment.id}`, { state: { assignment } })}
                                                    className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-1"
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    Add Notes
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {assignment.status === 'completed' && assignment.nurseNotes && (
                                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <p className="text-xs font-bold text-blue-900 mb-1">Care Notes:</p>
                                            <p className="text-xs font-medium text-blue-700">{assignment.nurseNotes}</p>
                                        </div>
                                    )}
                                    {assignment.status === 'cancelled' && (
                                        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                                            <p className="text-xs font-bold text-red-900 mb-1">Cancelled by Patient</p>
                                            <p className="text-xs font-medium text-red-700">This service has been cancelled.</p>
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
