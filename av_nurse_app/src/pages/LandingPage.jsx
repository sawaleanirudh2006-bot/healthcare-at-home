import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [activeTestimonial, setActiveTestimonial] = useState(0);
    const [counters, setCounters] = useState({ patients: 0, nurses: 0, doctors: 0, satisfaction: 0 });
    const statsRef = useRef(null);
    const [statsAnimated, setStatsAnimated] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveTestimonial(prev => (prev + 1) % testimonials.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !statsAnimated) {
                setStatsAnimated(true);
                animateCounters();
            }
        }, { threshold: 0.5 });
        if (statsRef.current) observer.observe(statsRef.current);
        return () => observer.disconnect();
    }, [statsAnimated]);

    const animateCounters = () => {
        const targets = { patients: 15000, nurses: 500, doctors: 200, satisfaction: 98 };
        const duration = 2000;
        const steps = 60;
        let step = 0;
        const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            const eased = 1 - Math.pow(1 - progress, 3);
            setCounters({
                patients: Math.round(targets.patients * eased),
                nurses: Math.round(targets.nurses * eased),
                doctors: Math.round(targets.doctors * eased),
                satisfaction: Math.round(targets.satisfaction * eased),
            });
            if (step >= steps) clearInterval(timer);
        }, duration / steps);
    };

    const testimonials = [
        { name: 'Priya Sharma', role: 'Patient', text: 'The nurse arrived on time and was incredibly professional. My recovery was so much smoother at home!', avatar: 'PS', color: 'from-teal-500 to-emerald-600' },
        { name: 'Dr. Rajesh Kumar', role: 'Doctor', text: 'The platform makes it easy to review prescriptions and approve home care. Truly a game changer.', avatar: 'RK', color: 'from-sky-500 to-blue-600' },
        { name: 'Nurse Anjali', role: 'Nurse', text: 'The app keeps me organized with all patient details. Scheduling has never been this smooth.', avatar: 'AN', color: 'from-emerald-500 to-green-600' },
        { name: 'Meera Patel', role: 'Patient', text: 'Getting a professional nurse at home for my elderly mother has been a blessing. Highly recommend!', avatar: 'MP', color: 'from-rose-500 to-pink-600' },
    ];

    const services = [
        { icon: '🩺', title: 'Nursing Care', desc: 'Professional nurses for post-surgery, elderly & chronic illness care', color: 'from-teal-50 to-emerald-50 border-teal-200' },
        { icon: '💊', title: 'Medicine Delivery', desc: 'Prescription medicines delivered to your doorstep within hours', color: 'from-sky-50 to-blue-50 border-sky-200' },
        { icon: '🧪', title: 'Lab Tests at Home', desc: 'Blood tests, urine tests & more, right from your bedroom', color: 'from-emerald-50 to-green-50 border-emerald-200' },
        { icon: '🚑', title: 'Emergency Response', desc: '24/7 emergency nursing support with rapid deployment', color: 'from-red-50 to-rose-50 border-red-200' },
        { icon: '💉', title: 'IV Fluid Services', desc: 'Intravenous therapy administered by certified professionals', color: 'from-amber-50 to-yellow-50 border-amber-200' },
        { icon: '❤️', title: 'Elderly Care', desc: 'Compassionate daily care, physiotherapy & health monitoring', color: 'from-pink-50 to-rose-50 border-pink-200' },
    ];

    const roles = [
        {
            title: 'Patient Portal',
            icon: '👤',
            desc: 'Book nursing services, track appointments, order medicines, and manage your health records.',
            path: '/portal/patient',
            gradient: 'from-teal-600 to-teal-800',
            lightBg: 'from-teal-50 to-emerald-50',
            border: 'border-teal-200',
            badge: 'For Patients',
            badgeColor: 'bg-teal-100 text-teal-700',
            features: ['Book appointments', 'Order medicines', 'View health records', 'Emergency services']
        },
        {
            title: 'Doctor Dashboard',
            icon: '🩺',
            desc: 'Review prescriptions, approve nursing assignments, and manage your patient consultations.',
            path: '/portal/doctor',
            gradient: 'from-sky-500 to-blue-600',
            lightBg: 'from-sky-50 to-blue-50',
            border: 'border-sky-200',
            badge: 'For Doctors',
            badgeColor: 'bg-sky-100 text-sky-700',
            features: ['Review prescriptions', 'Approve/Reject bookings', 'Issue prescriptions', 'Patient notes']
        },
        {
            title: 'Nurse Portal',
            icon: '💉',
            desc: 'Track your shifts, view assigned patients, update service status and add clinical notes.',
            path: '/portal/nurse',
            gradient: 'from-emerald-500 to-green-600',
            lightBg: 'from-emerald-50 to-green-50',
            border: 'border-emerald-200',
            badge: 'For Nurses',
            badgeColor: 'bg-emerald-100 text-emerald-700',
            features: ['View assigned patients', 'Update tracking status', 'Add care notes', 'Shift management']
        },
        {
            title: 'Admin Console',
            icon: '🛡️',
            desc: 'Full control over users, bookings, staff, inventory and platform analytics.',
            path: '/portal/admin',
            gradient: 'from-slate-700 to-slate-900',
            lightBg: 'from-slate-50 to-gray-50',
            border: 'border-slate-300',
            badge: 'For Admins',
            badgeColor: 'bg-slate-100 text-slate-700',
            features: ['CRUD all users', 'Manage inventory', 'Analytics & reports', 'Staff management']
        },
    ];

    return (
        <div className="min-h-screen bg-white overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* ── NAVBAR ── */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-slate-100' : 'bg-transparent'}`}>
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-600/20">
                            <span className="text-white text-xl">🏥</span>
                        </div>
                        <div>
                            <p className="text-lg font-extrabold text-slate-900 leading-none">Nurse @ Home</p>
                            <p className="text-[10px] text-teal-600 font-bold uppercase tracking-widest">Healthcare Platform</p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#services" className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors">Services</a>
                        <a href="#testimonials" className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors">Reviews</a>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/login/patient')}
                            className="px-5 py-2.5 text-sm font-bold text-teal-700 border-2 border-teal-200 rounded-xl hover:bg-teal-50 transition-all"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => navigate('/login/patient')}
                            className="px-5 py-2.5 text-sm font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all hover:-translate-y-0.5"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── HERO SECTION ── */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50">
                {/* Animated background blobs */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-600/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-600/5 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-teal-600/5 rounded-full blur-3xl" />

                    {/* Grid lines */}
                    <div className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(13, 148, 136, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(13, 148, 136, 0.1) 1px, transparent 1px)',
                            backgroundSize: '60px 60px'
                        }}
                    />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-100 rounded-full mb-8 animate-fade-in shadow-sm">
                        <div className="w-2 h-2 bg-teal-600 rounded-full animate-pulse" />
                        <span className="text-sm font-semibold text-teal-800">India's Premier Home Healthcare Platform</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-black leading-[1.1] mb-6">
                        Professional Care,
                        <br />
                        <span className="text-teal-600">
                            Right at Home
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                        Connect with certified nurses, doctors, and healthcare professionals.
                        Premium medical care delivered to your doorstep, 24/7.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <button
                            onClick={() => navigate('/login/patient')}
                            className="group w-full sm:w-auto px-8 py-4 bg-teal-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-teal-600/20 hover:bg-teal-700 transition-all hover:-translate-y-1 flex items-center justify-center gap-3"
                        >
                            <span>Book a Nurse Now</span>
                            <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                        <button
                            onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
                            className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-black font-bold text-lg rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
                        >
                            View All Portals
                        </button>
                    </div>

                    {/* Hero stat pills */}
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        {[
                            { label: '15,000+ Patients', icon: '👤' },
                            { label: '500+ Nurses', icon: '💉' },
                            { label: '200+ Doctors', icon: '🩺' },
                            { label: '98% Satisfaction', icon: '⭐' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-full shadow-sm">
                                <span>{item.icon}</span>
                                <span className="text-sm font-semibold text-slate-600">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Scroll</span>
                    <div className="w-5 h-8 border-2 border-slate-200 rounded-full flex justify-center pt-1">
                        <div className="w-1 h-2 bg-slate-300 rounded-full animate-bounce" />
                    </div>
                </div>
            </section>

            {/* ── STATS COUNTER ── */}
            <section ref={statsRef} className="py-16 bg-teal-600">
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { value: `${counters.patients.toLocaleString()}+`, label: 'Happy Patients', icon: '👥' },
                        { value: `${counters.nurses}+`, label: 'Certified Nurses', icon: '💉' },
                        { value: `${counters.doctors}+`, label: 'Expert Doctors', icon: '🩺' },
                        { value: `${counters.satisfaction}%`, label: 'Satisfaction Rate', icon: '⭐' },
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-3xl mb-2">{stat.icon}</div>
                            <p className="text-4xl font-extrabold text-white mb-1">{stat.value}</p>
                            <p className="text-sm font-semibold text-teal-100">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── SERVICES SECTION ── */}
            <section id="services" className="py-24 px-6 scale-95 md:scale-100">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-teal-50 text-teal-600 text-sm font-bold rounded-full mb-4 uppercase tracking-widest">Our Services</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
                            Everything You Need,
                            <span className="text-teal-600"> At Your Door</span>
                        </h2>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                            From routine nursing to emergency care, we've got all your healthcare needs covered.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service, i) => (
                            <div
                                key={i}
                                className="group p-8 rounded-3xl border border-slate-100 bg-white hover:border-teal-400 hover:shadow-2xl hover:shadow-teal-600/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                                onClick={() => navigate('/login/patient')}
                            >
                                <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-3xl mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                    {service.icon}
                                </div>
                                <h3 className="text-xl font-extrabold text-slate-900 mb-3">{service.title}</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">{service.desc}</p>
                                <div className="mt-6 flex items-center gap-2 text-teal-600 font-bold text-sm">
                                    <span>Learn More</span>
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-full mb-4">Simple Process</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900">
                            How It <span className="text-emerald-600">Works</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                        {/* Connector line */}
                        <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-teal-200 via-emerald-200 to-teal-200" />

                        {[
                            { step: '01', title: 'Sign Up', desc: 'Create your patient account in under 2 minutes', icon: '📱', color: 'bg-teal-600' },
                            { step: '02', title: 'Book Service', desc: 'Choose a service, pick date & time, upload prescription', icon: '📅', color: 'bg-sky-500' },
                            { step: '03', title: 'Doctor Approves', desc: 'Our doctor reviews and approves your care plan', icon: '✅', color: 'bg-emerald-500' },
                            { step: '04', title: 'Nurse Arrives', desc: 'A certified nurse arrives at your home on time', icon: '🏠', color: 'bg-amber-500' },
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center text-center relative">
                                <div className={`w-24 h-24 ${item.color} rounded-2xl flex flex-col items-center justify-center mb-4 shadow-lg text-white relative z-10`}>
                                    <span className="text-2xl mb-1">{item.icon}</span>
                                    <span className="text-xs font-bold opacity-80">{item.step}</span>
                                </div>
                                <h3 className="text-lg font-extrabold text-slate-800 mb-2">{item.title}</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* ── TESTIMONIALS ── */}
            <section id="testimonials" className="py-24 px-6 bg-slate-50">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-teal-50 text-teal-700 text-sm font-bold rounded-full mb-4 uppercase tracking-widest">Testimonials</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900">
                            What People <span className="text-teal-600">Say</span>
                        </h2>
                    </div>

                    <div className="relative h-[300px]">
                        {testimonials.map((t, i) => (
                            <div
                                key={i}
                                className={`transition-all duration-500 absolute w-full ${i === activeTestimonial ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-4 z-0'}`}
                            >
                                <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100">
                                    <div className="text-6xl mb-6 text-teal-100">"</div>
                                    <p className="text-xl font-medium text-slate-700 leading-relaxed mb-8">
                                        {t.text}
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white font-extrabold text-lg">
                                            {t.avatar}
                                        </div>
                                        <div>
                                            <p className="font-extrabold text-slate-900">{t.name}</p>
                                            <p className="text-sm text-slate-500 font-semibold">{t.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Dots */}
                    <div className="flex items-center justify-center gap-2 mt-8">
                        {testimonials.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveTestimonial(i)}
                                className={`transition-all duration-300 rounded-full ${i === activeTestimonial ? 'w-8 h-2.5 bg-teal-600' : 'w-2.5 h-2.5 bg-slate-300'}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── WHY CHOOSE US ── */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="inline-block px-4 py-1.5 bg-teal-50 text-teal-700 text-sm font-bold rounded-full mb-6 uppercase tracking-widest">Why Choose Us</span>
                            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                                Healthcare You Can <span className="text-teal-600">Trust</span>
                            </h2>
                            <p className="text-lg text-slate-500 font-medium mb-8 leading-relaxed">
                                We bring hospital-quality care to your home with a team of verified, experienced healthcare professionals.
                            </p>
                            <button
                                onClick={() => navigate('/login/patient')}
                                className="px-8 py-4 bg-teal-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-teal-600/20 hover:bg-teal-700 transition-all hover:-translate-y-0.5"
                            >
                                Start Today →
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: '✅', title: 'Verified Professionals', desc: 'Background-checked, certified staff' },
                                { icon: '⚡', title: 'Fast Response', desc: 'Nurse at your door within hours' },
                                { icon: '🔒', title: 'Secure & Private', desc: 'HIPAA-compliant data protection' },
                                { icon: '💬', title: '24/7 Support', desc: 'Round-the-clock customer care' },
                                { icon: '📊', title: 'Real-Time Tracking', desc: 'Track your nurse in real-time' },
                                { icon: '💳', title: 'Easy Payments', desc: 'Multiple payment options available' },
                            ].map((item, i) => (
                                <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50 transition-all">
                                    <div className="text-2xl mb-2">{item.icon}</div>
                                    <h3 className="font-extrabold text-slate-800 text-sm mb-1">{item.title}</h3>
                                    <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA SECTION ── */}
            <section className="py-24 px-6 bg-teal-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.5) 0%, transparent 50%)',
                    }}
                />
                <div className="relative z-10 max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                        Ready for Premium
                        <br />Home Healthcare?
                    </h2>
                    <p className="text-lg text-teal-50 font-medium mb-10 leading-relaxed opacity-90">
                        Join thousands of families who trust Nurse @ Home for reliable, affordable, and professional medical care.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/login/patient')}
                            className="group w-full sm:w-auto px-10 py-4 bg-white text-teal-700 font-extrabold text-lg rounded-2xl shadow-xl hover:bg-teal-50 transition-all hover:-translate-y-1 flex items-center justify-center gap-3"
                        >
                            <span>🏠 Book Care Now</span>
                        </button>
                        <button
                            onClick={() => navigate('/login/doctor')}
                            className="w-full sm:w-auto px-10 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-bold text-lg rounded-2xl hover:bg-white/20 transition-all"
                        >
                            Join as Doctor
                        </button>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="py-12 px-6 bg-slate-900">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center">
                                <span className="text-white text-xl">🏥</span>
                            </div>
                            <div>
                                <p className="text-lg font-extrabold text-white leading-none">Nurse @ Home</p>
                                <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest">Healthcare Platform</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            {['Patient', 'Doctor', 'Nurse', 'Admin'].map((role, i) => {
                                const paths = ['/login/patient', '/login/doctor', '/login/nurse', '/login/admin'];
                                return (
                                    <button
                                        key={i}
                                        onClick={() => navigate(paths[i])}
                                        className="text-sm text-slate-400 hover:text-white transition-colors font-semibold"
                                    >
                                        {role}
                                    </button>
                                );
                            })}
                        </div>

                        <p className="text-sm text-slate-500 font-medium">
                            © 2026 Nurse @ Home. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Float animation CSS */}
            <style>{`
                @keyframes float {
                    from { transform: translateY(0px) rotate(0deg); }
                    to { transform: translateY(-20px) rotate(5deg); }
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.8s ease forwards; }
            `}</style>
        </div>
    );
};

export default LandingPage;
