import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, Plus, Trash2, Send, Activity, User, ClipboardList } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabaseClient';

export default function IssuePrescription() {
    const navigate = useNavigate();
    const { consultId } = useParams();
    const [consult, setConsult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [issuing, setIssuing] = useState(false);

    // Form State
    const [symptoms, setSymptoms] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [medicines, setMedicines] = useState([{ name: '', dosage: '', timing: 'After Food' }]);
    const [advice, setAdvice] = useState('');

    useEffect(() => {
        const consults = JSON.parse(localStorage.getItem('doctorConsults') || '[]');
        const found = consults.find(c => c.id === consultId);
        if (found) {
            setConsult(found);
            setLoading(false);
        } else {
            alert('Consultation not found');
            navigate('/doctor/dashboard');
        }
    }, [consultId, navigate]);

    const addMedicine = () => setMedicines([...medicines, { name: '', dosage: '', timing: 'After Food' }]);
    const removeMedicine = (index) => setMedicines(medicines.filter((_, i) => i !== index));
    const updateMedicine = (index, field, value) => {
        const updated = [...medicines];
        updated[index][field] = value;
        setMedicines(updated);
    };

    const handleIssue = async () => {
        if (!symptoms || !diagnosis || medicines[0].name === '') {
            alert('Please fill in symptoms, diagnosis and at least one medicine');
            return;
        }

        try {
            setIssuing(true);

            const prescriptionData = {
                symptoms,
                diagnosis,
                medicines,
                advice,
                issuedBy: consult.doctorName,
                specialty: consult.specialty,
                issuedAt: new Date().toISOString(),
                isDigital: true
            };

            // Insert into Supabase prescriptions table
            const { error } = await supabase
                .from('prescriptions')
                .insert([
                    {
                        user_id: consult.userId,
                        patient_name: consult.userName,
                        service_type: 'Doctor Consultation',
                        status: 'approved', // Auto-approved as it's from a doctor
                        file_name: `Digital Prescription - ${consult.doctorName}`,
                        booking_details: prescriptionData, // Store full details in JSONB
                        review_time: new Date().toISOString()
                    }
                ]);

            if (error) throw error;

            // Update consult status in localStorage
            const consults = JSON.parse(localStorage.getItem('doctorConsults') || '[]');
            const updatedConsults = consults.map(c =>
                c.id === consultId ? { ...c, status: 'completed' } : c
            );
            localStorage.setItem('doctorConsults', JSON.stringify(updatedConsults));

            alert('Digital Prescription issued successfully!');
            navigate('/doctor/dashboard');
        } catch (error) {
            console.error('Error issuing prescription:', error);
            alert('Failed to issue prescription: ' + error.message);
        } finally {
            setIssuing(false);
        }
    };

    if (loading) return null;

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-slate-50 max-w-[430px] mx-auto">
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 pt-12 pb-4 px-5">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 leading-tight">Digital Prescription</h1>
                        <p className="text-xs text-slate-500 font-medium">Issue prescription for {consult.userName}</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 px-5 py-6 space-y-6 pb-32">
                {/* Patient & Consult Info */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
                    <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                        <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patient</p>
                        <p className="text-sm font-bold text-slate-900">{consult.userName}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mode</p>
                        <p className="text-sm font-bold text-primary">{consult.mode.toUpperCase()}</p>
                    </div>
                </div>

                {/* Clinical Notes */}
                <section className="space-y-4">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <Activity className="w-3.5 h-3.5" /> Symptoms / Complaints
                        </label>
                        <textarea
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            className="w-full rounded-xl border-slate-200 focus:ring-primary focus:border-primary text-sm min-h-[80px]"
                            placeholder="e.g. Fever, persistent cough for 3 days..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <ClipboardList className="w-3.5 h-3.5" /> Diagnosis
                        </label>
                        <input
                            type="text"
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            className="w-full h-12 rounded-xl border-slate-200 focus:ring-primary focus:border-primary text-sm"
                            placeholder="e.g. Acute Viral Infection"
                        />
                    </div>
                </section>

                {/* Medicines List */}
                <section className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <FileText className="w-3.5 h-3.5" /> Medicines
                        </label>
                        <button
                            onClick={addMedicine}
                            className="text-xs font-bold text-primary flex items-center gap-1 hover:opacity-80 transition-opacity"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Medicine
                        </button>
                    </div>

                    <div className="space-y-3">
                        {medicines.map((med, index) => (
                            <div key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 relative group animate-in fade-in slide-in-from-bottom-2">
                                {medicines.length > 1 && (
                                    <button
                                        onClick={() => removeMedicine(index)}
                                        className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                <div className="space-y-3 pr-6">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Medicine Name</p>
                                        <input
                                            type="text"
                                            value={med.name}
                                            onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                                            className="w-full bg-slate-50 border-none rounded-lg text-sm font-bold focus:ring-1 focus:ring-primary"
                                            placeholder="Enter name..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Dosage</p>
                                            <input
                                                type="text"
                                                value={med.dosage}
                                                onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                                                className="w-full bg-slate-50 border-none rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary"
                                                placeholder="e.g. 1-0-1"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Timing</p>
                                            <select
                                                value={med.timing}
                                                onChange={(e) => updateMedicine(index, 'timing', e.target.value)}
                                                className="w-full bg-slate-50 border-none rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary py-1.5"
                                            >
                                                <option>After Food</option>
                                                <option>Before Food</option>
                                                <option>With Food</option>
                                                <option>Empty Stomach</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Additional Advice */}
                <section className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        Additional Advice / Instructions
                    </label>
                    <textarea
                        value={advice}
                        onChange={(e) => setAdvice(e.target.value)}
                        className="w-full rounded-xl border-slate-200 focus:ring-primary focus:border-primary text-sm min-h-[100px]"
                        placeholder="Rest well, drink plenty of fluids..."
                    />
                </section>
            </main>

            {/* Bottom Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-5 max-w-[430px] mx-auto w-full z-10 shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)]">
                <button
                    onClick={handleIssue}
                    disabled={issuing}
                    className={cn(
                        "w-full h-14 rounded-2xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
                        issuing ? "opacity-70 cursor-wait" : "hover:bg-primary/90"
                    )}
                >
                    {issuing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Issuing...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            Issue Digital Prescription
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
