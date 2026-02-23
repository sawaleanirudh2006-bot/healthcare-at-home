import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, MessageCircle, MapPin, Star, Clock, ChevronRight, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabaseClient';

const CONSULT_MODES = [
    {
        id: 'video',
        label: 'Video Call',
        icon: Video,
        color: 'bg-blue-50 text-blue-600 border-blue-200',
        activeColor: 'bg-blue-500 text-white border-blue-500',
        desc: 'Face-to-face consultation from home',
        fee: 299,
    },
    {
        id: 'chat',
        label: 'Chat',
        icon: MessageCircle,
        color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        activeColor: 'bg-emerald-500 text-white border-emerald-500',
        desc: 'Text consultation, respond in 2 hours',
        fee: 149,
    },
    {
        id: 'inperson',
        label: 'In-Person',
        icon: MapPin,
        color: 'bg-purple-50 text-purple-600 border-purple-200',
        activeColor: 'bg-purple-500 text-white border-purple-500',
        desc: 'Home visit by a certified doctor',
        fee: 599,
    },
];

const DOCTORS = [
    {
        id: 'dr-01',
        name: 'Dr. Priya Sharma',
        specialty: 'General Physician',
        rating: 4.9,
        reviews: 312,
        experience: '10 yrs',
        initials: 'PS',
        color: 'bg-pink-100 text-pink-600',
        availableIn: '5 min',
        languages: 'Hindi, English',
    },
    {
        id: 'dr-02',
        name: 'Dr. Anil Mehta',
        specialty: 'Internal Medicine',
        rating: 4.8,
        reviews: 210,
        experience: '14 yrs',
        initials: 'AM',
        color: 'bg-blue-100 text-blue-600',
        availableIn: '10 min',
        languages: 'English, Marathi',
    },
    {
        id: 'dr-03',
        name: 'Dr. Kavya Rao',
        specialty: 'Family Medicine',
        rating: 4.7,
        reviews: 187,
        experience: '7 yrs',
        initials: 'KR',
        color: 'bg-emerald-100 text-emerald-600',
        availableIn: '15 min',
        languages: 'Hindi, Kannada',
    },
    {
        id: 'dr-04',
        name: 'Dr. Rajesh Iyer',
        specialty: 'General Physician',
        rating: 4.9,
        reviews: 403,
        experience: '18 yrs',
        initials: 'RI',
        color: 'bg-amber-100 text-amber-700',
        availableIn: '20 min',
        languages: 'Tamil, English',
    },
];

export default function DoctorConsult() {
    const navigate = useNavigate();
    const [mode, setMode] = useState('video');
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [confirmed, setConfirmed] = useState(false);

    const selectedMode = CONSULT_MODES.find(m => m.id === mode);

    const handleBook = async () => {
        if (!selectedDoctor) return;

        // Get user info
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || 'anonymous';
        const userName = session?.user?.user_metadata?.name || 'Patient';

        setConfirmed(true);
        // Save a lightweight consult booking to localStorage so DoctorDashboard can see it
        const consult = {
            id: `consult-${Date.now()}`,
            userId,
            userName,
            type: 'doctor_consult',
            mode,
            doctorId: selectedDoctor.id,
            doctorName: selectedDoctor.name,
            specialty: selectedDoctor.specialty,
            fee: selectedMode.fee,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };
        const existing = JSON.parse(localStorage.getItem('doctorConsults') || '[]');
        localStorage.setItem('doctorConsults', JSON.stringify([consult, ...existing]));
    };

    if (confirmed) {
        return (
            <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto items-center justify-center px-6 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6 mx-auto">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Consultation Booked!</h2>
                <p className="text-sm font-medium text-slate-500 mb-1">
                    {selectedDoctor.name} will connect with you via{' '}
                    <span className="font-bold text-slate-700">{selectedMode.label}</span> shortly.
                </p>
                <p className="text-xs text-slate-400 mb-8 max-w-xs">
                    After the consultation, the doctor will issue a prescription directly to your account. You can then use it to book nursing services or order medicines.
                </p>
                <div className="w-full space-y-3">
                    <button
                        onClick={() => navigate('/bookings')}
                        className="w-full h-13 py-3.5 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all"
                    >
                        View My Bookings
                    </button>
                    <button
                        onClick={() => navigate('/home')}
                        className="w-full h-13 py-3.5 rounded-2xl bg-slate-100 text-slate-700 font-bold text-sm active:scale-95 transition-all"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 pt-12 pb-4 px-5">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 leading-tight">Consult a Doctor</h1>
                        <p className="text-xs text-slate-500 font-medium">Get prescription &amp; advice from home</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 px-5 py-6 space-y-6 pb-32">

                {/* Why consult banner */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
                    <span className="text-2xl">💊</span>
                    <div>
                        <p className="text-sm font-bold text-blue-900">Don't have a prescription?</p>
                        <p className="text-xs text-blue-700 font-medium mt-0.5">
                            Consult our doctors online. They'll review your symptoms and issue a digital prescription — which you can use to book nursing services or order medicines.
                        </p>
                    </div>
                </div>

                {/* Consultation Mode */}
                <section>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Choose Consultation Type</h2>
                    <div className="grid grid-cols-3 gap-3">
                        {CONSULT_MODES.map(m => {
                            const Icon = m.icon;
                            const isActive = mode === m.id;
                            return (
                                <button
                                    key={m.id}
                                    onClick={() => setMode(m.id)}
                                    className={cn(
                                        'flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all active:scale-95',
                                        isActive ? m.activeColor : 'bg-white border-slate-100 text-slate-600'
                                    )}
                                >
                                    <Icon className="w-6 h-6" />
                                    <span className="text-[11px] font-bold leading-tight text-center">{m.label}</span>
                                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', isActive ? 'bg-white/20' : 'bg-slate-100 text-slate-500')}>
                                        ₹{m.fee}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-xs text-slate-500 mt-2 text-center font-medium">{selectedMode.desc}</p>
                </section>

                {/* Available Doctors */}
                <section>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Available Doctors</h2>
                    <div className="space-y-3">
                        {DOCTORS.map(doc => (
                            <button
                                key={doc.id}
                                onClick={() => setSelectedDoctor(doc)}
                                className={cn(
                                    'w-full text-left bg-white rounded-2xl p-4 border-2 transition-all active:scale-[0.98] shadow-sm',
                                    selectedDoctor?.id === doc.id
                                        ? 'border-primary shadow-md'
                                        : 'border-slate-100 hover:border-slate-200'
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Avatar */}
                                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shrink-0', doc.color)}>
                                        {doc.initials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-1">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{doc.name}</p>
                                                <p className="text-xs font-medium text-slate-500">{doc.specialty}</p>
                                            </div>
                                            {selectedDoctor?.id === doc.id && (
                                                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                {doc.rating} ({doc.reviews})
                                            </span>
                                            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                                                <Clock className="w-3 h-3" />
                                                {doc.experience}
                                            </span>
                                            <span className="text-[11px] font-bold text-emerald-600">
                                                ⚡ In {doc.availableIn}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1">🌐 {doc.languages}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>
            </main>

            {/* Bottom CTA */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-5 max-w-[430px] mx-auto w-full">
                {selectedDoctor ? (
                    <div>
                        <div className="flex items-center justify-between mb-3 px-1">
                            <div>
                                <p className="text-xs text-slate-500 font-medium">{selectedDoctor.name}</p>
                                <p className="text-sm font-bold text-slate-900">{selectedMode.label} Consultation</p>
                            </div>
                            <p className="text-lg font-extrabold text-primary">₹{selectedMode.fee}</p>
                        </div>
                        <button
                            onClick={handleBook}
                            className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/25 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            Book Consultation
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <button
                        disabled
                        className="w-full h-14 rounded-2xl bg-slate-100 text-slate-400 font-bold text-base cursor-not-allowed"
                    >
                        Select a doctor to continue
                    </button>
                )}
            </div>
        </div>
    );
}
