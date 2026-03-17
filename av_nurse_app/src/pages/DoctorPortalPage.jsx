import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ClipboardList, CheckCircle, FileSignature, BookOpen,
    LineChart, Bell, Archive, Shield, Stethoscope,
    Zap, Building2, ChevronLeft, ArrowRight
} from 'lucide-react';

const DoctorPortalPage = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        { icon: ClipboardList, title: 'Review Prescriptions', desc: 'Review patient-uploaded prescriptions and medical history before approving care.' },
        { icon: CheckCircle, title: 'Approve / Reject Bookings', desc: 'Quickly approve or reject nursing assignments with reasons for transparency.' },
        { icon: FileSignature, title: 'Issue Prescriptions', desc: 'Generate and issue digital prescriptions directly within the platform.' },
        { icon: BookOpen, title: 'Patient Notes', desc: 'Add detailed clinical notes for each patient consultation session.' },
        { icon: LineChart, title: 'Patient Analytics', desc: 'View patient health trends, vitals history, and treatment progress.' },
        { icon: Bell, title: 'Smart Notifications', desc: 'Get notified instantly when new booking requests arrive for your review.' },
        { icon: Archive, title: 'Consultation History', desc: 'Access complete history of all consultations, approvals, and notes.' },
        { icon: Shield, title: 'Secure Access', desc: 'HIPAA-compliant, role-based secure access to sensitive patient data.' },
    ];

    const workflow = [
        { step: '01', icon: Bell, title: 'Booking Alert', desc: 'Receive real-time notification when a patient books a nursing service.' },
        { step: '02', icon: ClipboardList, title: 'Review Prescription', desc: 'View the patient\'s uploaded prescription and health details.' },
        { step: '03', icon: CheckCircle, title: 'Approve/Reject', desc: 'Accept or reject the booking with medical justification.' },
        { step: '04', icon: FileSignature, title: 'Issue Care Plan', desc: 'Issue a digital prescription or care plan to guide the nursing team.' },
    ];

    const stats = [
        { value: '200+', label: 'Verified Doctors', icon: Stethoscope },
        { value: '5,000+', label: 'Prescriptions Reviewed', icon: ClipboardList },
        { value: '98%', label: 'Approval Rate', icon: CheckCircle },
        { value: '<2 hrs', label: 'Avg. Review Time', icon: Zap },
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
                            onClick={() => navigate('/login/doctor')}
                            className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-0.5"
                        >
                            Doctor Login
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
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="absolute top-[5%] left-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-cyan-400/20 to-teal-300/20 rounded-full blur-[100px]" 
                    />
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.3, 1],
                            opacity: [0.2, 0.4, 0.2],
                            x: [0, -100, 0]
                        }}
                        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-[-10%] right-[-5%] w-[550px] h-[550px] bg-gradient-to-tl from-teal-500/20 to-emerald-400/20 rounded-full blur-[90px]" 
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
                            <span className="text-sm font-bold text-teal-800 uppercase tracking-wide">For Medical Professionals</span>
                        </motion.div>
                        
                        <motion.div variants={fadeInUp} className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-slate-800 to-slate-900 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-slate-900/30">
                            <Stethoscope className="w-11 h-11 text-teal-400" />
                        </motion.div>
                        
                        <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tight leading-[1.05] mb-6">
                            Doctor <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">Portal</span>
                        </motion.h1>
                        
                        <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
                            Review prescriptions, approve nursing assignments, and manage patient care seamlessly with our powerful clinical dashboard.
                        </motion.p>
                        
                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                            <button
                                onClick={() => navigate('/login/doctor')}
                                className="group w-full sm:w-auto px-10 py-4 bg-teal-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-teal-600/20 hover:bg-teal-700 transition-all hover:-translate-y-1 flex items-center justify-center gap-3"
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
                                <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-4 text-teal-600">
                                    <s.icon className="w-6 h-6" />
                                </div>
                                <p className="text-3xl font-black text-slate-900 mb-1">{s.value}</p>
                                <p className="text-sm text-slate-500 font-bold tracking-wide uppercase">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Features md:grid-cols-2 lg:grid-cols-4 */}
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
                            Powerful Tools,<br />
                            <span className="text-teal-600">Built for Doctors</span>
                        </motion.h2>
                        <motion.p variants={fadeInUp} className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                            Everything you need to manage patient care efficiently, securely, and remotely.
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
                                className="group bg-white p-8 rounded-3xl border border-slate-100 hover:border-teal-300 shadow-sm hover:shadow-2xl hover:shadow-teal-600/10 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-opacity duration-300">
                                    <f.icon className="w-32 h-32 text-teal-600" />
                                </div>
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 group-hover:bg-teal-50 text-slate-600 group-hover:text-teal-600 flex items-center justify-center mb-6 transition-colors duration-300">
                                    <f.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-teal-700 transition-colors">{f.title}</h3>
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
                            <span className="text-sm font-bold text-teal-600 uppercase tracking-widest px-4">Clinical Workflow</span>
                            <div className="h-px bg-slate-200 flex-1"></div>
                        </div>
                        <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-black text-slate-900 text-center">
                            Your <span className="text-teal-600">Review Process</span>
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
                        <div className="hidden md:block absolute top-[44px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-teal-100 via-teal-300 to-teal-100 z-0"></div>

                        {workflow.map((s, i) => (
                            <motion.div variants={fadeInUp} key={i} className="relative z-10 flex flex-col items-center text-center group">
                                <div className="w-24 h-24 rounded-3xl bg-white border border-slate-200 flex flex-col items-center justify-center mb-6 shadow-xl shadow-slate-200/50 group-hover:border-teal-400 group-hover:shadow-teal-500/20 transition-all duration-300 group-hover:-translate-y-2 group-hover:bg-teal-50">
                                    <s.icon className="w-8 h-8 text-slate-700 group-hover:text-teal-600 transition-colors mb-1" />
                                    <span className="text-xs font-black text-teal-600 bg-teal-100/50 px-2 py-0.5 rounded-full mt-1.5">{s.step}</span>
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
                    className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] overflow-hidden relative shadow-xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                    <div className="absolute -top-64 -right-64 w-[500px] h-[500px] bg-teal-600/20 rounded-full blur-[100px]"></div>
                    
                    <div className="relative z-10 px-8 py-20 text-center flex flex-col items-center">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                            Ready to Manage Your Dashboard?
                        </h2>
                        <p className="text-teal-100/80 text-lg md:text-xl font-medium mb-10 max-w-2xl">
                            Join 200+ verified doctors on the Healnest platform and revolutionize home healthcare.
                        </p>
                        <button
                            onClick={() => navigate('/login/doctor')}
                            className="group px-10 py-5 bg-teal-500 text-white font-black text-lg rounded-2xl shadow-xl hover:bg-teal-400 transition-all hover:-translate-y-1 hover:shadow-teal-500/30 inline-flex items-center gap-3"
                        >
                            <span>Login as Doctor</span>
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-all" />
                        </button>
                    </div>
                </motion.div>
            </section>
        </div>
    );
};

export default DoctorPortalPage;
