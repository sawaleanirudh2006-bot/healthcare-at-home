import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Save, Pill } from 'lucide-react';

export default function DoctorAddNotes() {
    const navigate = useNavigate();
    const location = useLocation();
    const { prescriptionId } = useParams();
    const { prescription } = location.state || {};

    const [consultationNotes, setConsultationNotes] = useState('');
    const [prescriptionText, setPrescriptionText] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [recommendations, setRecommendations] = useState('');

    const handleSaveNotes = () => {
        // Update prescription with doctor notes
        const prescriptions = JSON.parse(localStorage.getItem('prescriptionQueue') || '[]');
        const updated = prescriptions.map(rx => {
            if (rx.id === prescriptionId) {
                return {
                    ...rx,
                    doctorNotes: consultationNotes,
                    doctorPrescription: prescriptionText,
                    diagnosis: diagnosis,
                    recommendations: recommendations,
                    notesAddedAt: new Date().toISOString(),
                    notesAddedBy: 'Dr. Rajesh Kumar'
                };
            }
            return rx;
        });
        localStorage.setItem('prescriptionQueue', JSON.stringify(updated));

        alert('Consultation notes saved successfully!');
        navigate(`/doctor/prescription/${prescriptionId}`);
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
                    <h1 className="text-lg font-bold text-slate-900">Add Consultation Notes</h1>
                    <div className="w-10" />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-5 py-6 space-y-4 pb-24">
                {/* Prescription Info */}
                <div className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 mb-2">{prescription?.serviceType}</h3>
                    <p className="text-xs font-medium text-slate-600">Patient: {prescription?.patientName}</p>
                    <p className="text-xs font-medium text-slate-500">Status: {prescription?.status}</p>
                </div>

                {/* Diagnosis */}
                <div className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Diagnosis</h3>
                    <input
                        type="text"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        placeholder="Enter diagnosis..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Prescription */}
                <div className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100">
                    <div className="flex items-center gap-2 mb-3">
                        <Pill className="w-4 h-4 text-blue-500" />
                        <h3 className="text-sm font-bold text-slate-900">Prescription</h3>
                    </div>
                    <textarea
                        value={prescriptionText}
                        onChange={(e) => setPrescriptionText(e.target.value)}
                        placeholder="List medications, dosage, and duration...&#10;Example:&#10;1. Paracetamol 500mg - 1 tablet twice daily for 5 days&#10;2. Amoxicillin 250mg - 1 capsule three times daily for 7 days"
                        className="w-full h-32 px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Consultation Notes */}
                <div className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Consultation Notes</h3>
                    <textarea
                        value={consultationNotes}
                        onChange={(e) => setConsultationNotes(e.target.value)}
                        placeholder="Document consultation findings, patient symptoms, examination results..."
                        className="w-full h-32 px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Recommendations */}
                <div className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Recommendations</h3>
                    <textarea
                        value={recommendations}
                        onChange={(e) => setRecommendations(e.target.value)}
                        placeholder="Follow-up instructions, lifestyle changes, precautions..."
                        className="w-full h-24 px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </main>

            {/* Bottom Action */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-5 max-w-[430px] mx-auto w-full">
                <button
                    onClick={handleSaveNotes}
                    className="w-full px-4 py-3 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <Save className="w-4 h-4" />
                    Save Consultation Notes
                </button>
            </div>
        </div>
    );
}
