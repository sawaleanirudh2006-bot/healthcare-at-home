import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [upcomingService] = useState(() => {
        // Load upcoming services from localStorage
        const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        // Filter for non-completed bookings
        return bookings.find(b => b.status !== 'completed' && b.status !== 'cancelled') || null;
    });



    return (
        <div className="bg-background min-h-screen">
            <header className="pt-14 pb-6 px-6 bg-white">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full border-2 border-primary/20 p-0.5">
                            <img alt="User" className="h-full w-full rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBh5GT-z5R38SjS9_OLHXXHnj9n0WRGrX9uqty9UxMyYfeQ-AR5aIMRTa3dqAqvFlnSYNjVBuXwwf8PkOmfpun-6t7dPZ_v5hCJ96a0vES4FLGb8N062dnXXoQlHdgKcRkhz4pWDF_-8SyKgx_vr2JTk06ggjHlRQJKnAB-3_CtV5XH5Lir25bJHgGfCrABc9XTCQFBE5yq7jn5xkDeXb03i68jSL8l64iAELwTQ8yw-YKnJbxWnRfR9jL5F0e569cldjsfySwDuA" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Namaste,</p>
                            <h1 className="text-xl font-extrabold text-slate-800">Arjun Sharma</h1>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/notifications')}
                        className="flex size-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 border border-slate-100 relative hover:bg-slate-100 active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined text-[24px]">notifications</span>
                        <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-accent-red animate-pulse"></span>
                    </button>
                </div>
                <div className="relative mt-2">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                    <input className="h-12 w-full rounded-2xl border-none bg-slate-100 pl-11 pr-4 text-[14px] text-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Search for doctors, tests, services..." type="text" />
                </div>
            </header>

            <main className="px-6 py-6 space-y-8">
                <section>
                    <h3 className="text-[13px] font-bold uppercase tracking-widest text-slate-400 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-4 gap-3 sm:gap-4">
                        <button
                            onClick={() => navigate('/nursing-services')}
                            className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
                        >
                            <div className="flex size-14 sm:size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                <span className="material-symbols-outlined text-[28px]">medical_services</span>
                            </div>
                            <span className="text-[11px] font-bold text-slate-600 text-center leading-tight">Book Nurse</span>
                        </button>
                        <button
                            onClick={() => navigate('/store')}
                            className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
                        >
                            <div className="flex size-14 sm:size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                <span className="material-symbols-outlined text-[28px]">pill</span>
                            </div>
                            <span className="text-[11px] font-bold text-slate-600 text-center leading-tight">Medicines</span>
                        </button>
                        <button
                            onClick={() => navigate('/lab-tests')}
                            className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
                        >
                            <div className="flex size-14 sm:size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                <span className="material-symbols-outlined text-[28px]">biotech</span>
                            </div>
                            <span className="text-[11px] font-bold text-slate-600 text-center leading-tight">Lab Tests</span>
                        </button>
                        <button
                            onClick={() => navigate('/emergency')}
                            className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
                        >
                            <div className="flex size-14 sm:size-16 items-center justify-center rounded-2xl bg-accent-red/10 text-accent-red hover:bg-accent-red/20 transition-colors">
                                <span className="material-symbols-outlined text-[28px]">emergency</span>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-600 text-center">Emergency</span>
                        </button>
                    </div>
                </section>

                {/* Our Services Section */}
                <section>
                    <h3 className="text-[13px] font-bold uppercase tracking-widest text-slate-400 mb-4">Our Services</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {/* IV Fluid Services */}
                        <button
                            onClick={() => navigate('/iv-fluid-services')}
                            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-primary hover:shadow-md transition-all text-left active:scale-[0.98]"
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                                <span className="material-symbols-outlined text-[28px] text-primary">water_drop</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 mb-1">IV Fluid Services</h4>
                            <p className="text-xs text-slate-500">Hydration therapy at home</p>
                        </button>

                        {/* Treatment Packages */}
                        <button
                            onClick={() => navigate('/treatment-packages')}
                            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-purple-500 hover:shadow-md transition-all text-left active:scale-[0.98]"
                        >
                            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
                                <span className="material-symbols-outlined text-[28px] text-purple-600">medical_services</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 mb-1">Treatment Packages</h4>
                            <p className="text-xs text-slate-500">Specialized care plans</p>
                        </button>

                        {/* Ambulance Service */}
                        <button
                            onClick={() => navigate('/ambulance')}
                            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-accent-red hover:shadow-md transition-all text-left active:scale-[0.98]"
                        >
                            <div className="w-12 h-12 rounded-xl bg-accent-red/10 flex items-center justify-center mb-3">
                                <span className="material-symbols-outlined text-[28px] text-accent-red">ambulance</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 mb-1">Ambulance</h4>
                            <p className="text-xs text-slate-500">24/7 emergency transport</p>
                        </button>

                        {/* Nearby Hospitals */}
                        <button
                            onClick={() => navigate('/nearby-hospitals')}
                            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-secondary hover:shadow-md transition-all text-left active:scale-[0.98]"
                        >
                            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-3">
                                <span className="material-symbols-outlined text-[28px] text-secondary">local_hospital</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 mb-1">Nearby Hospitals</h4>
                            <p className="text-xs text-slate-500">Find hospitals near you</p>
                        </button>
                    </div>
                </section>

                {upcomingService ? (
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[13px] font-bold uppercase tracking-widest text-slate-400">Upcoming Service</h3>
                            <button onClick={() => navigate('/bookings')} className="text-[12px] font-bold text-primary">View All</button>
                        </div>
                        <div className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-premium border border-slate-100">
                            <div className="flex gap-4">
                                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-50">
                                    <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA52I6yeap-Pk-Pte-pz970v2uJSNPJIDxA3H-240nfnhU7VQgEyUU2K6IBbugutGT5oC9aDzBcjdtS0cZVKHQp9xunDFSZh3MRkKdkXX-L2fAlIS5_qDt51QHDcHy1Ct_gBCUcI9ztHmkVh8PDpPItmK-xx2V-LQt_dJWzUUvFJrv1RiQzXqJmOWaJ7zuv-deoB-hVjAFzqYBk4gvz5TDGLp0rvlVxe_KiXvRfGVyeBw8yM7oKdsW3Xk9230Oc6LJiVU_EX8ReIQ')" }}></div>
                                </div>
                                <div className="flex flex-1 flex-col justify-between py-0.5">
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                                                {upcomingService.service || 'Nursing Care'}
                                            </span>
                                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                                                {upcomingService.status === 'upcoming' ? 'CONFIRMED' : upcomingService.status?.toUpperCase()}
                                            </span>
                                        </div>
                                        <h4 className="text-[16px] font-bold leading-tight mt-1 text-slate-800">
                                            {upcomingService.service || '12hr Post-Op Nurse Shift'}
                                        </h4>
                                        <p className="text-sm font-medium text-slate-500 mt-0.5">
                                            {upcomingService.nurse?.name || 'Nurse Assigned'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                                        <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Date & Time</p>
                                        <p className="text-[13px] font-bold text-slate-700">
                                            {upcomingService.date || 'Today'}, {upcomingService.time || '08:00 PM'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/service-tracking', {
                                        state: {
                                            serviceType: upcomingService.service,
                                            providerName: upcomingService.nurse?.name || 'Nurse',
                                            bookingId: upcomingService.id
                                        }
                                    })}
                                    className="h-9 px-4 rounded-xl bg-primary text-white text-[12px] font-bold shadow-md shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all"
                                >
                                    Track
                                </button>
                            </div>
                        </div>
                    </section>
                ) : (
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[13px] font-bold uppercase tracking-widest text-slate-400">Upcoming Service</h3>
                            <button onClick={() => navigate('/bookings')} className="text-[12px] font-bold text-primary">View All</button>
                        </div>
                        <div className="rounded-3xl bg-slate-50 p-8 text-center border border-slate-100">
                            <span className="material-symbols-outlined text-[48px] text-slate-300">event_available</span>
                            <p className="text-sm font-bold text-slate-600 mt-3">No Upcoming Services</p>
                            <p className="text-xs font-medium text-slate-400 mt-1">Book a service to get started</p>
                            <button
                                onClick={() => navigate('/nursing-services')}
                                className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 active:scale-95 transition-all"
                            >
                                Book Now
                            </button>
                        </div>
                    </section>
                )}

                <section>
                    <div className="relative overflow-hidden rounded-3xl bg-secondary p-6 text-white shadow-lg">
                        <div className="relative z-10">
                            <h4 className="text-lg font-bold leading-tight">Health Checkup Packages</h4>
                            <p className="text-sm font-medium text-white/80 mt-1 max-w-[180px]">Complete full body screening at 40% discount.</p>
                            <button
                                onClick={() => navigate('/health-checkup-packages')}
                                className="mt-4 rounded-xl bg-white/20 px-4 py-2 text-[12px] font-bold backdrop-blur-md border border-white/30 hover:bg-white/30 transition-colors active:scale-95"
                            >
                                Explore Now
                            </button>
                        </div>
                        <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-[120px] text-white/10 rotate-12 pointer-events-none">health_metrics</span>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Home;
