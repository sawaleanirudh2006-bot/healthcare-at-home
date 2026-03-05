import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NursePortalPage = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        { icon: '👥', title: 'View Assigned Patients', desc: 'See all your current and upcoming patient assignments in a clear, organized view.' },
        { icon: '🔄', title: 'Update Tracking Status', desc: 'Update service status in real-time so patients and admins are always informed.' },
        { icon: '📓', title: 'Add Care Notes', desc: 'Document clinical observations and care notes for each patient visit.' },
        { icon: '📅', title: 'Shift Management', desc: 'View your shift schedule, mark availability, and manage working hours.' },
        { icon: '📍', title: 'Location Tracking', desc: 'Share your live location with patients when heading to their home.' },
        { icon: '🔔', title: 'Instant Alerts', desc: 'Get notified immediately when a new assignment or update is available.' },
        { icon: '📊', title: 'Service History', desc: 'Access a complete log of all services you have provided.' },
        { icon: '💬', title: 'Patient Communication', desc: 'Communicate with patients and the care team directly within the app.' },
    ];

    const workflow = [
        { step: '01', icon: '🔔', title: 'Assignment Alert', desc: 'Receive a notification when a new patient is assigned to you.' },
        { step: '02', icon: '📋', title: 'View Patient Details', desc: 'Review patient history, care notes, and the doctor\'s prescription.' },
        { step: '03', icon: '🏠', title: 'Visit Patient', desc: 'Head to the patient\'s home and provide professional nursing care.' },
        { step: '04', icon: '✅', title: 'Complete & Document', desc: 'Mark service as done and add care notes for the medical record.' },
    ];

    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-100' : 'bg-transparent'}`}>
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button onClick={() => navigate('/')} className="flex items-center gap-3 group text-left">
                        <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-600/20">
                            <span className="text-white text-xl">🏥</span>
                        </div>
                        <div>
                            <p className="text-lg font-extrabold text-black leading-none">Nurse @ Home</p>
                            <p className="text-[10px] text-teal-600 font-bold uppercase tracking-widest">Healthcare Platform</p>
                        </div>
                    </button>
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/')} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-black transition-colors">← Back</button>
                        <button
                            onClick={() => navigate('/login/nurse')}
                            className="px-6 py-2.5 text-sm font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all hover:-translate-y-0.5"
                        >
                            Nurse Login
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-24 pb-16 bg-slate-50">
                <div className="absolute inset-0">
                    <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-teal-600/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-600/5 rounded-full blur-3xl" />
                </div>
                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-100 rounded-full mb-6">
                        <span className="w-2 h-2 bg-teal-600 rounded-full animate-pulse inline-block" />
                        <span className="text-sm font-semibold text-teal-700">For Care Professionals</span>
                    </div>
                    <div className="w-24 h-24 rounded-3xl bg-white border border-slate-100 flex items-center justify-center text-5xl mx-auto mb-6 shadow-xl text-teal-600">
                        💉
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-black leading-[1.1] mb-6">
                        Nurse <span className="text-teal-600">Portal</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                        Track your shifts, view assigned patients, update service status, and add clinical notes — all from one powerful portal.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/login/nurse')}
                            className="group w-full sm:w-auto px-10 py-4 bg-teal-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-teal-600/20 hover:bg-teal-700 transition-all hover:-translate-y-1 flex items-center justify-center gap-3"
                        >
                            <span>Enter Dashboard</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full sm:w-auto px-10 py-4 bg-white border border-slate-200 text-black font-bold text-lg rounded-2xl hover:bg-slate-50 transition-all"
                        >
                            View All Portals
                        </button>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="py-8 bg-white border-y border-slate-100">
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    {[
                        { value: '500+', label: 'Certified Nurses', icon: '💉' },
                        { value: '20,000+', label: 'Home Visits Done', icon: '🏠' },
                        { value: '4.8★', label: 'Nurse Rating', icon: '⭐' },
                        { value: '100%', label: 'Verified Staff', icon: '✅' },
                    ].map((s, i) => (
                        <div key={i}>
                            <div className="text-2xl mb-1">{s.icon}</div>
                            <p className="text-2xl font-extrabold text-black">{s.value}</p>
                            <p className="text-sm text-slate-400 font-semibold">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-teal-50 text-teal-600 text-sm font-bold rounded-full mb-4 uppercase tracking-wider">Features</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-4">
                            Everything You Need,<br /><span className="text-teal-600">In One Portal</span>
                        </h2>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                            A complete toolkit to help you deliver exceptional care, efficiently and professionally.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {features.map((f, i) => (
                            <div key={i} className="group bg-white border border-slate-100 rounded-2xl p-6 hover:border-teal-400 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-600/5">
                                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                                    {f.icon}
                                </div>
                                <h3 className="font-extrabold text-black mb-2">{f.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Workflow */}
            <section className="py-24 px-6 bg-slate-50">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-teal-50 text-teal-600 text-sm font-bold rounded-full mb-4 uppercase tracking-wider">Daily Flow</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-black">
                            A <span className="text-teal-600">Typical Day</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {workflow.map((s, i) => (
                            <div key={i} className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-2xl bg-white border border-slate-100 flex items-center justify-center mb-4 shadow-sm relative group-hover:border-teal-400 text-teal-600">
                                    <span className="text-2xl">{s.icon}</span>
                                    <span className="text-[10px] font-bold text-teal-600 mt-0.5">{s.step}</span>
                                </div>
                                <h3 className="font-extrabold text-black mb-2">{s.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="bg-teal-600 rounded-3xl p-12 shadow-2xl shadow-teal-600/20">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Ready to Start Your Shift?</h2>
                        <p className="text-teal-50 font-medium mb-8 opacity-80">Join 500+ certified nurses delivering care across India.</p>
                        <button
                            onClick={() => navigate('/login/nurse')}
                            className="group px-10 py-4 bg-white text-teal-600 font-bold text-lg rounded-2xl shadow-xl hover:bg-teal-50 transition-all hover:-translate-y-1 inline-flex items-center gap-3"
                        >
                            <span>Login as Nurse</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    </div>
                </div>
            </section>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
            `}</style>
        </div>
    );
};

export default NursePortalPage;
