import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Save } from 'lucide-react';

export default function NurseAddNotes() {
    const navigate = useNavigate();
    const location = useLocation();
    const { assignmentId } = useParams();
    const { assignment } = location.state || {};

    const [notes, setNotes] = useState('');
    const [vitalSigns, setVitalSigns] = useState({
        bloodPressure: '',
        temperature: '',
        heartRate: '',
        oxygenLevel: ''
    });

    const handleSaveNotes = () => {
        // Update booking with nurse notes
        const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        const updated = bookings.map(booking => {
            if (booking.id === assignmentId) {
                return {
                    ...booking,
                    nurseNotes: notes,
                    vitalSigns: vitalSigns,
                    notesAddedAt: new Date().toISOString(),
                    notesAddedBy: 'Nurse Sarah'
                };
            }
            return booking;
        });
        localStorage.setItem('userBookings', JSON.stringify(updated));

        // Navigate back with success message
        alert('Notes saved successfully!');
        navigate('/nurse/dashboard');
    };

    const handleMarkComplete = () => {
        if (!notes.trim()) {
            alert('Please add care notes before marking as complete');
            return;
        }

        // Update booking with notes and mark as completed
        const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        const updated = bookings.map(booking => {
            if (booking.id === assignmentId) {
                return {
                    ...booking,
                    status: 'completed',
                    nurseNotes: notes,
                    vitalSigns: vitalSigns,
                    completedAt: new Date().toISOString(),
                    completedBy: 'Nurse Sarah',
                    notesAddedAt: new Date().toISOString()
                };
            }
            return booking;
        });
        localStorage.setItem('userBookings', JSON.stringify(updated));

        alert('Service marked as complete with notes!');
        navigate('/nurse/dashboard');
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 pt-12 pb-4 px-5">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Add Care Notes</h1>
                    <div className="w-10" />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-5 py-6 space-y-4 pb-32">
                {/* Assignment Info */}
                <div className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 mb-2">{assignment?.service}</h3>
                    <p className="text-xs font-medium text-slate-600">Patient: {assignment?.patientName}</p>
                    <p className="text-xs font-medium text-slate-500">Date: {assignment?.date} at {assignment?.time}</p>
                </div>

                {/* Vital Signs */}
                <div className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Vital Signs (Optional)</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">Blood Pressure</label>
                            <input
                                type="text"
                                placeholder="120/80"
                                value={vitalSigns.bloodPressure}
                                onChange={(e) => setVitalSigns({ ...vitalSigns, bloodPressure: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">Temperature (°F)</label>
                            <input
                                type="text"
                                placeholder="98.6"
                                value={vitalSigns.temperature}
                                onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">Heart Rate (bpm)</label>
                            <input
                                type="text"
                                placeholder="72"
                                value={vitalSigns.heartRate}
                                onChange={(e) => setVitalSigns({ ...vitalSigns, heartRate: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">Oxygen Level (%)</label>
                            <input
                                type="text"
                                placeholder="98"
                                value={vitalSigns.oxygenLevel}
                                onChange={(e) => setVitalSigns({ ...vitalSigns, oxygenLevel: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Care Notes */}
                <div className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Care Notes *</h3>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Document patient condition, care provided, observations, and recommendations..."
                        className="w-full h-40 px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-slate-500 mt-2">Required before marking service as complete</p>
                </div>
            </main>

            {/* Bottom Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-5 max-w-[430px] mx-auto w-full space-y-2">
                <button
                    onClick={handleSaveNotes}
                    disabled={!notes.trim()}
                    className="w-full px-4 py-3 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="w-4 h-4" />
                    Save Notes
                </button>
                <button
                    onClick={handleMarkComplete}
                    disabled={!notes.trim()}
                    className="w-full px-4 py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FileText className="w-4 h-4" />
                    Save & Mark Complete
                </button>
            </div>
        </div>
    );
}
