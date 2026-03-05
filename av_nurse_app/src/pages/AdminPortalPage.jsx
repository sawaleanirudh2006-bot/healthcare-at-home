import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPortalPage = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        { icon: '👥', title: 'CRUD All Users', desc: 'Create, read, update, and delete all patient, nurse, and doctor accounts.' },
        { icon: '📦', title: 'Manage Inventory', desc: 'Full control over medical supplies, equipment, and stock levels.' },
        { icon: '📊', title: 'Analytics & Reports', desc: 'Deep-dive dashboards with revenue, booking trends, and platform KPIs.' },
        { icon: '🏢', title: 'Staff Management', desc: 'Onboard, manage, and monitor all nursing and medical staff.' },
        { icon: '📋', title: 'Booking Oversight', desc: 'View and manage all bookings across the entire platform.' },
        { icon: '💰', title: 'Revenue Reports', desc: 'Detailed financial summaries, earnings charts, and payout tracking.' },
        { icon: '💬', title: 'Feedback Monitoring', desc: 'Monitor customer feedback and ratings for all nurses and services.' },
        { icon: '🔒', title: 'Role-Based Access', desc: 'Granular permission controls for every role in the system.' },
    ];

    const capabilities = [
        { icon: '🏗️', title: 'System Configuration', desc: 'Configure platform settings, service pricing, and operational parameters.' },
        { icon: '📡', title: 'Real-Time Dashboard', desc: 'Live overview of active bookings, nurses on duty, and platform activity.' },
        { icon: '🛡️', title: 'Security Audit', desc: 'Review access logs, detect anomalies, and enforce security policies.' },
        { icon: '📣', title: 'Notifications Management', desc: 'Send platform-wide announcements and manage notification templates.' },
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
                            onClick={() => navigate('/login/admin')}
                            className="px-6 py-2.5 text-sm font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all hover:-translate-y-0.5"
                        >
                            Admin Login
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
                        <span className="text-sm font-semibold text-teal-700">For Administrators</span>
                    </div>
                    <div className="w-24 h-24 rounded-3xl bg-white border border-slate-100 flex items-center justify-center text-5xl mx-auto mb-6 shadow-xl text-teal-600">
                        🛡️
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-black leading-[1.1] mb-6">
                        Admin <span className="text-teal-600">Console</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                        Full control over users, bookings, staff, inventory, and platform analytics — the ultimate command center for Nurse @ Home.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/login/admin')}
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
                        { value: '15K+', label: 'Users Managed', icon: '👥' },
                        { value: '50K+', label: 'Bookings Tracked', icon: '📋' },
                        { value: '99.9%', label: 'Uptime', icon: '⚡' },
                        { value: '₹2Cr+', label: 'Revenue Tracked', icon: '💰' },
                    ].map((s, i) => (
                        <div key={i}>
                            <div className="text-2xl mb-1">{s.icon}</div>
                            <p className="text-2xl font-extrabold text-black">{s.value}</p>
                            <p className="text-sm text-slate-400 font-semibold">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Core Features */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-teal-50 text-teal-600 text-sm font-bold rounded-full mb-4 uppercase tracking-wider">Core Modules</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-4">
                            Full Platform<br /><span className="text-teal-600">Control</span>
                        </h2>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                            Every tool you need to run the Nurse @ Home platform with precision and confidence.
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

            {/* Advanced Capabilities */}
            <section className="py-24 px-6 bg-slate-50">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-teal-50 text-teal-600 text-sm font-bold rounded-full mb-4 uppercase tracking-wider">Advanced</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-black">
                            Advanced <span className="text-teal-600">Capabilities</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {capabilities.map((c, i) => (
                            <div key={i} className="flex gap-5 bg-white border border-slate-100 rounded-2xl p-6 hover:border-teal-400 transition-all shadow-sm">
                                <div className="w-14 h-14 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-2xl shrink-0">
                                    {c.icon}
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-black mb-1">{c.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">{c.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="bg-teal-600 rounded-3xl p-12 shadow-2xl shadow-teal-600/20">
                        <div className="text-5xl mb-4 text-white">🛡️</div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Access the Admin Console</h2>
                        <p className="text-teal-50 font-medium mb-8 opacity-80">Restricted access — for authorized administrators only.</p>
                        <button
                            onClick={() => navigate('/login/admin')}
                            className="group px-10 py-4 bg-white text-teal-600 font-bold text-lg rounded-2xl shadow-xl hover:bg-teal-50 transition-all hover:-translate-y-1 inline-flex items-center gap-3"
                        >
                            <span>Enter Console</span>
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

export default AdminPortalPage;
