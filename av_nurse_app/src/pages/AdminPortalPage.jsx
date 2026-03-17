import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users, Package, BarChart3, Building2,
    ClipboardList, IndianRupee, MessageSquare, Shield,
    Settings, Activity, ShieldAlert, Bell,
    ChevronLeft, ArrowRight, LayoutDashboard, Crown
} from 'lucide-react';

const AdminPortalPage = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        { icon: Users, title: 'CRUD All Users', desc: 'Create, read, update, and delete all patient, nurse, and doctor accounts.' },
        { icon: Package, title: 'Manage Inventory', desc: 'Full control over medical supplies, equipment, and stock levels.' },
        { icon: BarChart3, title: 'Analytics & Reports', desc: 'Deep-dive dashboards with revenue, booking trends, and platform KPIs.' },
        { icon: Building2, title: 'Staff Management', desc: 'Onboard, manage, and monitor all nursing and medical staff.' },
        { icon: ClipboardList, title: 'Booking Oversight', desc: 'View and manage all bookings across the entire platform.' },
        { icon: IndianRupee, title: 'Revenue Reports', desc: 'Detailed financial summaries, earnings charts, and payout tracking.' },
        { icon: MessageSquare, title: 'Feedback Monitoring', desc: 'Monitor customer feedback and ratings for all nurses and services.' },
        { icon: Shield, title: 'Role-Based Access', desc: 'Granular permission controls for every role in the system.' },
    ];

    const capabilities = [
        { icon: Settings, title: 'System Configuration', desc: 'Configure platform settings, service pricing, and operational parameters.' },
        { icon: Activity, title: 'Real-Time Dashboard', desc: 'Live overview of active bookings, nurses on duty, and platform activity.' },
        { icon: ShieldAlert, title: 'Security Audit', desc: 'Review access logs, detect anomalies, and enforce security policies.' },
        { icon: Bell, title: 'Notifications Management', desc: 'Send platform-wide announcements and manage notification templates.' },
    ];

    const stats = [
        { value: '15K+', label: 'Users Managed', icon: Users },
        { value: '50K+', label: 'Bookings Tracked', icon: ClipboardList },
        { value: '99.9%', label: 'Uptime', icon: Activity },
        { value: '₹2Cr+', label: 'Revenue Tracked', icon: IndianRupee },
    ];

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-indigo-200 selection:text-indigo-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200/50 py-3' : 'bg-transparent py-5'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <button onClick={() => navigate('/')} className="flex items-center gap-3 group text-left">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-300">
                            <Crown className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">Healnest</p>
                            <p className="text-[11px] text-indigo-600 font-bold uppercase tracking-widest mt-1">Healthcare Platform</p>
                        </div>
                    </button>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                            <ChevronLeft className="w-4 h-4" /> Back to Home
                        </button>
                        <button
                            onClick={() => navigate('/login/admin')}
                            className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-0.5"
                        >
                            Admin Login
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-32 pb-20">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                            rotate: [0, -90, 0]
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="absolute top-[10%] -left-[10%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-400/20 to-blue-300/20 rounded-full blur-[100px]" 
                    />
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.4, 1],
                            opacity: [0.2, 0.4, 0.2],
                            x: [0, -100, 0]
                        }}
                        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -bottom-[10%] -right-[5%] w-[550px] h-[550px] bg-gradient-to-tl from-blue-400/20 to-indigo-400/20 rounded-full blur-[90px]" 
                    />
                     <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-center">
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md border border-indigo-100 rounded-full mb-8 shadow-sm">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                            </span>
                            <span className="text-sm font-bold text-indigo-800 uppercase tracking-wide">For Administrators</span>
                        </motion.div>
                        
                        <motion.div variants={fadeInUp} className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-600/30">
                            <LayoutDashboard className="w-12 h-12 text-white" />
                        </motion.div>
                        
                        <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tight leading-[1.05] mb-6">
                            Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Console</span>
                        </motion.h1>
                        
                        <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
                            Full control over users, bookings, staff, inventory, and platform analytics — the ultimate command center for Healnest.
                        </motion.p>
                        
                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                            <button
                                onClick={() => navigate('/login/admin')}
                                className="group w-full sm:w-auto px-10 py-4 bg-slate-900 text-white font-bold text-lg rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all hover:-translate-y-1 flex items-center justify-center gap-3"
                            >
                                <span>Enter Dashboard</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="group w-full sm:w-auto px-10 py-4 bg-white/80 backdrop-blur-md border border-slate-200 text-slate-700 font-bold text-lg rounded-2xl shadow-sm hover:bg-white hover:text-slate-900 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                            >
                                View Other Portals
                            </button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Bar */}
            <div className="relative z-20 max-w-6xl mx-auto px-6 -mt-16">
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7 }}
                    className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-8"
                >
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-slate-100/50">
                        {stats.map((s, i) => (
                            <div key={i} className="flex flex-col items-center text-center px-4 first:border-l-0 border-l border-slate-100">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 text-indigo-600">
                                    <s.icon className="w-6 h-6" />
                                </div>
                                <p className="text-3xl font-black text-slate-900 mb-1">{s.value}</p>
                                <p className="text-sm text-slate-500 font-bold tracking-wide uppercase">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Core Features */}
            <section className="py-32 px-6 bg-slate-50 relative">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        initial="hidden" 
                        whileInView="visible" 
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="text-center mb-20"
                    >
                        <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
                            Full Platform<br />
                            <span className="text-indigo-600">Control</span>
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                            Every tool you need to run the Healnest platform with precision and confidence.
                        </motion.p>
                    </motion.div>
                    
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {features.map((f, i) => (
                            <motion.div 
                                variants={fadeInUp}
                                key={i} 
                                className="group bg-white p-8 rounded-3xl border border-slate-100 hover:border-indigo-300 shadow-sm hover:shadow-2xl hover:shadow-indigo-600/10 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-opacity duration-300">
                                    <f.icon className="w-32 h-32 text-indigo-600" />
                                </div>
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 group-hover:bg-indigo-50 text-slate-600 group-hover:text-indigo-600 flex items-center justify-center mb-6 transition-colors duration-300">
                                    <f.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-700 transition-colors">{f.title}</h3>
                                <p className="text-slate-500 leading-relaxed font-medium">{f.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Advanced Capabilities */}
            <section className="py-32 px-6 bg-white relative overflow-hidden">
                <div className="max-w-6xl mx-auto relative z-10">
                    <motion.div 
                        initial="hidden" 
                        whileInView="visible" 
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="text-center mb-20"
                    >
                        <div className="flex items-center gap-4 justify-center mb-6">
                            <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest px-4 border border-indigo-200 rounded-full py-1.5 bg-indigo-50">Advanced Mode</span>
                        </div>
                        <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-black text-slate-900">
                            Advanced <span className="text-indigo-600">Capabilities</span>
                        </motion.h2>
                    </motion.div>

                    <motion.div 
                         initial="hidden"
                         whileInView="visible"
                         viewport={{ once: true, margin: "-100px" }}
                         variants={staggerContainer}
                         className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                        {capabilities.map((c, i) => (
                            <motion.div variants={fadeInUp} key={i} className="flex gap-6 bg-slate-50 border border-slate-100 rounded-3xl p-8 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group">
                                <div className="w-16 h-16 rounded-2xl bg-white text-indigo-600 flex items-center justify-center shrink-0 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                                    <c.icon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{c.title}</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed">{c.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6 bg-slate-50">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6 }}
                    className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] overflow-hidden relative shadow-2xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                    <div className="absolute -bottom-64 -left-64 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px]"></div>
                    
                    <div className="relative z-10 px-8 py-20 text-center flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-8 border border-white/20">
                            <Shield className="w-10 h-10 text-indigo-300" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                            Access the Admin Console
                        </h2>
                        <p className="text-indigo-200/80 text-lg md:text-xl font-medium mb-10 max-w-2xl">
                            Restricted access — for authorized platform administrators and management personnel only.
                        </p>
                        <button
                            onClick={() => navigate('/login/admin')}
                            className="group px-10 py-5 bg-indigo-500 text-white font-black text-lg rounded-2xl shadow-xl hover:bg-indigo-400 transition-all hover:-translate-y-1 hover:shadow-indigo-500/30 inline-flex items-center gap-3"
                        >
                            <span>Enter Console</span>
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-all" />
                        </button>
                    </div>
                </motion.div>
            </section>
        </div>
    );
};

export default AdminPortalPage;
