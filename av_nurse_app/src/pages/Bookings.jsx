import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, User, Calendar, Clock, MapPin, ChevronRight, FileText, XCircle } from 'lucide-react';

const Bookings = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('upcoming');
    // Dummy data moved up to be accessible for initialization
    const demoBookings = [
        {
            id: 'BK-9021',
            type: 'service',
            serviceType: 'Nursing Care',
            serviceName: '12hr Post-Op Nurse Shift',
            provider: 'Sister Priya Sharma',
            date: new Date().toISOString(),
            time: '08:00 PM',
            status: 'confirmed', // 'confirmed', 'completed', 'cancelled'
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA52I6yeap-Pk-Pte-pz970v2uJSNPJIDxA3H-240nfnhU7VQgEyUU2K6IBbugutGT5oC9aDzBcjdtS0cZVKHQp9xunDFSZh3MRkKdkXX-L2fAlIS5_qDt51QHDcHy1Ct_gBCUcI9ztHmkVh8PDpPItmK-xx2V-LQt_dJWzUUwFJrv1RiQzXqJmOWaJ7zuv-deoB-hVjAFzqYBk4gvz5TDGLp0rvlVxe_KiXvRfGVyeBw8yM7oKdsW3Xk9230Oc6LJiVU_EX8ReIQ',
            isMedicineOrder: false
        }
    ];

    const [bookings, setBookings] = useState(() => {
        // Load bookings from localStorage
        const storedBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');

        if (storedBookings.length === 0) {
            // Initialize with demo data if empty so users can see/test functionality
            localStorage.setItem('userBookings', JSON.stringify(demoBookings));
            return demoBookings;
        } else {
            return storedBookings;
        }
    });

    const handleCancelBooking = (booking) => {
        let confirmMessage = 'Are you sure you want to cancel this service?';

        if (booking.trackingStatus === 'on_the_way') {
            confirmMessage = 'Nurse is on the way. A cancellation fee of ₹50 will be applied. Do you want to proceed?';
        }

        if (window.confirm(confirmMessage)) {
            const updatedBookings = bookings.map(b => {
                if (b.id === booking.id) {
                    return { ...b, status: 'cancelled' };
                }
                return b;
            });

            setBookings(updatedBookings);
            localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
        }
    };

    const tabs = [
        { id: 'upcoming', label: 'Upcoming' },
        { id: 'completed', label: 'Completed' },
        { id: 'cancelled', label: 'Cancelled' },
    ];

    // Filter bookings based on active tab
    const filteredBookings = bookings.filter(booking => {
        if (activeTab === 'upcoming') return booking.status === 'confirmed' || booking.status === 'active';
        if (activeTab === 'completed') return booking.status === 'completed';
        if (activeTab === 'cancelled') return booking.status === 'cancelled';
        return false;
    });

    return (
        <div className="bg-background min-h-screen max-w-[430px] mx-auto relative flex flex-col">
            <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md pt-12 pb-4 px-5 border-b border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/home')}
                        className="flex size-10 items-center justify-center rounded-full bg-white shadow-soft text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
                    </button>
                    <h1 className="text-lg font-bold tracking-tight text-slate-800">Booking History</h1>
                    <button
                        onClick={() => navigate('/notifications')}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-50 text-slate-600 border border-slate-100 relative hover:bg-slate-100 active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined text-[20px]">notifications</span>
                        <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-accent-red animate-pulse"></span>
                    </button>
                </div>
                <div className="flex h-11 w-full items-center justify-center rounded-xl bg-slate-200/50 p-1">
                    {tabs.map((tab) => (
                        <label
                            key={tab.id}
                            className={`flex h-full flex-1 cursor-pointer items-center justify-center rounded-lg px-2 transition-all font-semibold text-[13px] ${activeTab === tab.id
                                ? 'bg-white shadow-soft text-primary'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <span className="truncate">{tab.label}</span>
                            <input
                                className="hidden"
                                type="radio"
                                name="booking_tab"
                                value={tab.id}
                                checked={activeTab === tab.id}
                                onChange={() => setActiveTab(tab.id)}
                            />
                        </label>
                    ))}
                </div>
            </header>

            <main className="px-5 py-6 space-y-6 flex-1 pb-24">
                {filteredBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <FileText className="w-12 h-12 mb-3 opacity-50" />
                        <p className="text-sm font-semibold">No {activeTab} bookings found.</p>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {activeTab === 'upcoming' && (
                            <div className="flex items-center justify-between">
                                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Active Services</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                                    <span className="text-[10px] font-bold text-primary uppercase">Live Now</span>
                                </div>
                            </div>
                        )}

                        {filteredBookings.map((booking, index) => (
                            <div key={index} className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-premium border border-slate-100/50">
                                <div className="flex gap-4">
                                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-50 flex items-center justify-center">
                                        {booking.isMedicineOrder ? (
                                            <div className="bg-blue-50 w-full h-full flex items-center justify-center text-blue-500">
                                                <Pill className="w-8 h-8" />
                                            </div>
                                        ) : (
                                            <img
                                                src={booking.image || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop"}
                                                alt="Provider"
                                                className="h-full w-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-1 flex-col justify-between py-0.5">
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${booking.isMedicineOrder ? 'text-blue-500' : 'text-secondary'}`}>
                                                    {booking.serviceType}
                                                </span>
                                                <span className="text-[10px] font-medium text-slate-400">#{booking.id.slice(-6)}</span>
                                            </div>
                                            <h4 className="text-[15px] font-bold leading-tight mt-1 text-slate-800 line-clamp-1">
                                                {booking.serviceName}
                                            </h4>
                                            <p className="text-sm font-medium text-slate-500 mt-0.5 flex items-center gap-1">
                                                {booking.isMedicineOrder ? (
                                                    <>{booking.items?.length || 0} Items • {booking.provider}</>
                                                ) : (
                                                    booking.provider
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-xs font-semibold text-slate-700">
                                                {new Date(booking.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}, {booking.time}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-3">
                                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                        <button
                                            onClick={() => navigate('/service-tracking', {
                                                state: {
                                                    serviceType: booking.serviceName,
                                                    providerName: booking.provider,
                                                    isMedicineOrder: booking.isMedicineOrder
                                                }
                                            })}
                                            className="flex-1 flex h-11 items-center justify-center rounded-xl bg-primary text-white text-[13px] font-bold tracking-wide shadow-md shadow-primary/10 hover:bg-primary/90 active:scale-95 transition-all gap-2"
                                        >
                                            <MapPin className="w-4 h-4" />
                                            Track {booking.isMedicineOrder ? 'Order' : 'Service'}
                                        </button>
                                    )}

                                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                        <button
                                            onClick={() => handleCancelBooking(booking)}
                                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 active:scale-95 transition-all"
                                            title="Cancel Booking"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    )}

                                    {/* Keep the chevron for detail view if needed, or replace/augment */}
                                    {booking.status === 'cancelled' && (
                                        <button className="flex-1 flex h-11 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-400 text-[13px] font-bold cursor-not-allowed">
                                            Cancelled
                                        </button>
                                    )}

                                    {/* Rate Service Button for Completed Services */}
                                    {booking.status === 'completed' && !booking.rated && (
                                        <button
                                            onClick={() => navigate('/rate-service', { state: { booking } })}
                                            className="flex-1 flex h-11 items-center justify-center rounded-xl bg-amber-500 text-white text-[13px] font-bold tracking-wide shadow-md shadow-amber-500/10 hover:bg-amber-600 active:scale-95 transition-all gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">star</span>
                                            Rate Service
                                        </button>
                                    )}

                                    {/* Show Rating if Already Rated */}
                                    {booking.status === 'completed' && booking.rated && (
                                        <div className="flex-1 flex h-11 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 text-[13px] font-bold gap-2">
                                            <span className="material-symbols-outlined text-[18px] fill-current">star</span>
                                            Rated {booking.rating}/5
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Bookings;
