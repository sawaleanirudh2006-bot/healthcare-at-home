import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users, RefreshCw, BookOpen, CalendarDays,
    MapPin, Bell, History, MessageCircle,
    ClipboardList, Home as HomeIcon, CheckCircle,
    ShieldCheck, Star, Building2, ChevronLeft,
    ArrowRight, Activity, HeartHandshake
} from 'lucide-react';

const NursePortalPage = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        { icon: Users, title: 'View Assigned Patients', desc: 'See all your current and upcoming patient assignments in a clear, organized view.' },
        { icon: RefreshCw, title: 'Update Tracking Status', desc: 'Update service status in real-time so patients and admins are always informed.' },
        { icon: BookOpen, title: 'Add Care Notes', desc: 'Document clinical observations and care notes for each patient visit.' },
        { icon: CalendarDays, title: 'Shift Management', desc: 'View your shift schedule, mark availability, and manage working hours.' },
        { icon: MapPin, title: 'Location Tracking', desc: 'Share your live location with patients when heading to their home.' },
        { icon: Bell, title: 'Instant Alerts', desc: 'Get notified immediately when a new assignment or update is available.' },
        { icon: History, title: 'Service History', desc: 'Access a complete log of all services you have provided.' },
        { icon: MessageCircle, title: 'Patient Communication', desc: 'Communicate with patients and the care team directly within the app.' },
    ];

    const workflow = [
        { step: '01', icon: Bell, title: 'Assignment Alert', desc: 'Receive a notification when a new patient is assigned to you.' },
        { step: '02', icon: ClipboardList, title: 'View Patient Details', desc: 'Review patient history, care notes, and the doctor\'s prescription.' },
        { step: '03', icon: HomeIcon, title: 'Visit Patient', desc: 'Head to the patient\'s home and provide professional nursing care.' },
        { step: '04', icon: CheckCircle, title: 'Complete & Document', desc: 'Mark service as done and add care notes for the medical record.' },
    ];

    const stats = [
        { value: '500+', label: 'Certified Nurses', icon: ShieldCheck },
        { value: '20,000+', label: 'Home Visits Done', icon: HomeIcon },
        { value: '4.8★', label: 'Nurse Rating', icon: Star },
        { value: '100%', label: 'Verified Staff', icon: CheckCircle },
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
        <div className="min-h-screen bg-slate-50 selection:bg-teal-200 selection:text-teal-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200/50 py-3' : 'bg-transparent py-5'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <button onClick={() => navigate('/')} className="flex items-center gap-3 group text-left">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-600/20 group-hover:scale-105 transition-transform duration-300">
                            <Building2 className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">Healnest</p>
                            <p className="text-[11px] text-teal-600 font-bold uppercase tracking-widest mt-1">Healthcare Platform</p>
                        </div>
                    </button>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                            <ChevronLeft className="w-4 h-4" /> Back to Home
                        </button>
                        <button
                            onClick={() => navigate('/login/nurse')}
                            className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-0.5"
                        >
                            Nurse Login
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
                            rotate: [0, 90, 0]
                        }}
                        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                        className="absolute top-[10%] -left-[10%] w-[600px] h-[600px] bg-gradient-to-br from-emerald-400/20 to-teal-300/20 rounded-full blur-[100px]" 
                    />
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.4, 1],
                            opacity: [0.2, 0.4, 0.2],
                            x: [0, 100, 0]
                        }}
                        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -bottom-[10%] -right-[5%] w-[550px] h-[550px] bg-gradient-to-tl from-teal-400/20 to-green-400/20 rounded-full blur-[90px]" 
                    />
                     <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-center">
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md border border-teal-100 rounded-full mb-8 shadow-sm">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
                            </span>
                            <span className="text-sm font-bold text-teal-800 uppercase tracking-wide">For Care Professionals</span>
                        </motion.div>
                        
                        <motion.div variants={fadeInUp} className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/30">
                            <HeartHandshake className="w-12 h-12 text-white" />
                        </motion.div>
                        
                        <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tight leading-[1.05] mb-6">
                            Nurse <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">Portal</span>
                        </motion.h1>
                        
                        <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
                            Track your shifts, view assigned patients, update service status, and add clinical notes — all from one powerful, caring portal.
                        </motion.p>
                        
                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                            <button
                                onClick={() => navigate('/login/nurse')}
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
                                <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-4 text-emerald-600">
                                    <s.icon className="w-6 h-6" />
                                </div>
                                <p className="text-3xl font-black text-slate-900 mb-1">{s.value}</p>
                                <p className="text-sm text-slate-500 font-bold tracking-wide uppercase">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Features */}
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
                            Everything You Need,<br />
                            <span className="text-emerald-600">In One Portal</span>
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                            A complete toolkit to help you deliver exceptional care, efficiently and professionally.
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
                                className="group bg-white p-8 rounded-3xl border border-slate-100 hover:border-emerald-300 shadow-sm hover:shadow-2xl hover:shadow-emerald-600/10 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-opacity duration-300">
                                    <f.icon className="w-32 h-32 text-emerald-600" />
                                </div>
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 group-hover:bg-emerald-50 text-slate-600 group-hover:text-emerald-600 flex items-center justify-center mb-6 transition-colors duration-300">
                                    <f.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors">{f.title}</h3>
                                <p className="text-slate-500 leading-relaxed font-medium">{f.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Workflow */}
            <section className="py-32 px-6 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div 
                        initial="hidden" 
                        whileInView="visible" 
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="mb-20"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px bg-slate-200 flex-1"></div>
                            <span className="text-sm font-bold text-emerald-600 uppercase tracking-widest px-4">Daily Flow</span>
                            <div className="h-px bg-slate-200 flex-1"></div>
                        </div>
                        <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-black text-slate-900 text-center">
                            A <span className="text-emerald-600">Typical Day</span>
                        </motion.h2>
                    </motion.div>

                    <motion.div 
                         initial="hidden"
                         whileInView="visible"
                         viewport={{ once: true, margin: "-100px" }}
                         variants={staggerContainer}
                         className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 relative"
                    >
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-[44px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-teal-100 via-emerald-300 to-teal-100 z-0"></div>

                        {workflow.map((s, i) => (
                            <motion.div variants={fadeInUp} key={i} className="relative z-10 flex flex-col items-center text-center group">
                                <div className="w-24 h-24 rounded-3xl bg-white border border-slate-200 flex flex-col items-center justify-center mb-6 shadow-xl shadow-slate-200/50 group-hover:border-emerald-400 group-hover:shadow-emerald-500/20 transition-all duration-300 group-hover:-translate-y-2 group-hover:bg-emerald-50">
                                    <s.icon className="w-8 h-8 text-slate-700 group-hover:text-emerald-600 transition-colors mb-1" />
                                    <span className="text-xs font-black text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded-full mt-1.5">{s.step}</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{s.title}</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">{s.desc}</p>
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
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                    <div className="absolute -top-64 -right-64 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[100px]"></div>
                    
                    <div className="relative z-10 px-8 py-20 text-center flex flex-col items-center">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                            Ready to Start Your Shift?
                        </h2>
                        <p className="text-emerald-100/80 text-lg md:text-xl font-medium mb-10 max-w-2xl">
                            Join 500+ certified nurses delivering premium care to patients' doorsteps.
                        </p>
                        <button
                            onClick={() => navigate('/login/nurse')}
                            className="group px-10 py-5 bg-emerald-500 text-white font-black text-lg rounded-2xl shadow-xl hover:bg-emerald-400 transition-all hover:-translate-y-1 hover:shadow-emerald-500/30 inline-flex items-center gap-3"
                        >
                            <span>Login as Nurse</span>
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-all" />
                        </button>
                    </div>
                </motion.div>
            </section>
        </div>
    );
};

export default NursePortalPage;
