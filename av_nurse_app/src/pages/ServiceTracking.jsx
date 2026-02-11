import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Phone, MessageCircle, Navigation, Clock, MapPin, Package, Truck, User, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ServiceTracking() {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        serviceType = 'Nursing Care',
        providerName = 'Sister Priya Sharma',
        isMedicineOrder = false,
        bookingId
    } = location.state || {};

    const [activeTab, setActiveTab] = useState('live');
    const [bookingStatus, setBookingStatus] = useState(() => {
        if (bookingId) {
            const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
            const currentBooking = bookings.find(b => b.id === bookingId);
            return currentBooking ? currentBooking.status : 'upcoming';
        }
        return 'upcoming';
    });

    const [progress, setProgress] = useState(() => {
        if (bookingStatus === 'completed') return 100;
        return isMedicineOrder ? 45 : 65;
    });

    useEffect(() => {
        if (bookingId) {
            const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
            const currentBooking = bookings.find(b => b.id === bookingId);
            if (currentBooking) {
                // If status changed in local storage since init or last poll (though unlikely to change immediately after init without poll)
                if (currentBooking.status !== bookingStatus) {
                    setBookingStatus(currentBooking.status);
                    if (currentBooking.status === 'completed') {
                        setProgress(100);
                    }
                }
            }
        }

        const interval = setInterval(() => {
            if (bookingId) {
                const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
                const currentBooking = bookings.find(b => b.id === bookingId);
                if (currentBooking) {
                    setBookingStatus(currentBooking.status);
                    if (currentBooking.status === 'completed') {
                        setProgress(100);
                    }
                }
            }
        }, 3000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bookingId]);

    // Simulated tracking data
    const trackingInfo = {
        status: isMedicineOrder ? 'Out for Delivery' : bookingStatus === 'completed' ? 'Completed' : 'On the way',
        eta: bookingStatus === 'completed' ? 'Completed' : '15 mins',
        distance: '2.3 km',
        currentLocation: 'MG Road, Bangalore',
        destination: 'Your Home',
        progress: progress,
    };

    // Dynamic timeline based on booking status
    const serviceTimeline = [
        { time: '08:00 AM', status: 'Booking Confirmed', completed: true },
        { time: '08:05 AM', status: 'Prescription Submitted', completed: true },
        { time: '08:10 AM', status: 'Prescription Approved', completed: true },
        { time: '08:15 AM', status: 'Nurse Auto-Assigned', completed: true },
        { time: '08:30 AM', status: 'On the way', completed: bookingStatus !== 'upcoming', active: bookingStatus === 'upcoming' },
        { time: '08:45 AM', status: 'Arrived', completed: bookingStatus === 'completed' },
        { time: '09:00 AM', status: 'Service Started', completed: bookingStatus === 'completed' },
        { time: '10:00 AM', status: 'Service Completed', completed: bookingStatus === 'completed', active: bookingStatus === 'completed' },
    ];

    const medicineTimeline = [
        { time: '08:00 AM', status: 'Order Placed', completed: true },
        { time: '08:15 AM', status: 'Order Packed', completed: true },
        { time: '08:30 AM', status: 'Out for Delivery', completed: true, active: true },
        { time: '08:45 AM', status: 'Arriving Soon', completed: false },
        { time: '09:00 AM', status: 'Delivered', completed: false },
    ];

    const timeline = isMedicineOrder ? medicineTimeline : serviceTimeline;

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 pt-12 pb-4 px-5">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Track {isMedicineOrder ? 'Order' : 'Service'}</h1>
                    <div className="w-10" />
                </div>
            </header>

            {/* Map View */}
            <div className="relative h-[280px] sm:h-[320px] bg-slate-100 overflow-hidden">
                {/* Simulated Map Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50">
                    {/* Grid pattern to simulate map */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
                            {[...Array(64)].map((_, i) => (
                                <div key={i} className="border border-slate-300" />
                            ))}
                        </div>
                    </div>

                    {/* Route Line */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path
                            d="M 20 80 Q 40 60, 50 50 T 80 20"
                            stroke={isMedicineOrder ? "#3B82F6" : "#0D9488"}
                            strokeWidth="0.5"
                            fill="none"
                            strokeDasharray="2,2"
                            opacity="0.6"
                        />
                    </svg>

                    {/* Destination Marker (Your Home) */}
                    <div className="absolute top-[15%] right-[15%] flex flex-col items-center">
                        <div className="relative">
                            <div className={`absolute inset-0 ${isMedicineOrder ? 'bg-blue-500/20' : 'bg-primary/20'} rounded-full blur-xl animate-pulse`} />
                            <div className={`relative flex size-10 items-center justify-center rounded-full ${isMedicineOrder ? 'bg-blue-500' : 'bg-primary'} text-white shadow-lg`}>
                                <MapPin className="w-5 h-5 fill-white" />
                            </div>
                        </div>
                        <div className="mt-2 bg-white px-2 py-1 rounded-lg shadow-md">
                            <p className="text-[10px] font-bold text-slate-900">Your Home</p>
                        </div>
                    </div>

                    {/* Provider Marker (Moving) */}
                    <div className="absolute bottom-[25%] left-[45%] flex flex-col items-center animate-bounce">
                        <div className="relative">
                            <div className="absolute inset-0 bg-secondary/20 rounded-full blur-xl" />
                            <div className="relative flex size-12 items-center justify-center rounded-full bg-white border-4 border-secondary shadow-lg overflow-hidden">
                                {isMedicineOrder ? (
                                    <div className="bg-blue-100 w-full h-full flex items-center justify-center text-blue-600">
                                        <Truck className="w-6 h-6" />
                                    </div>
                                ) : (
                                    <img
                                        src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop"
                                        alt="Provider"
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
                        </div>
                        <div className="mt-2 bg-secondary px-3 py-1 rounded-lg shadow-md">
                            <p className="text-[10px] font-bold text-white flex items-center gap-1">
                                <Navigation className="w-3 h-3" />
                                On the way
                            </p>
                        </div>
                    </div>
                </div>

                {/* ETA Badge */}
                <div className="absolute top-4 left-4 bg-white rounded-2xl px-4 py-2 shadow-lg border border-slate-100">
                    <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${isMedicineOrder ? 'text-blue-500' : 'text-primary'}`} />
                        <div>
                            <p className="text-[10px] font-semibold text-slate-500 uppercase">ETA</p>
                            <p className="text-sm font-bold text-slate-900">{trackingInfo.eta}</p>
                        </div>
                    </div>
                </div>

                {/* Distance Badge */}
                <div className="absolute top-4 right-4 bg-white rounded-2xl px-4 py-2 shadow-lg border border-slate-100">
                    <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-secondary" />
                        <div>
                            <p className="text-[10px] font-semibold text-slate-500 uppercase">Distance</p>
                            <p className="text-sm font-bold text-slate-900">{trackingInfo.distance}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 px-5 py-4 space-y-4 pb-24">
                {/* Provider Info Card */}
                <div className="bg-white rounded-2xl p-5 shadow-premium border border-slate-100/50">
                    <div className="flex items-start gap-4">
                        <div className="size-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                            {isMedicineOrder ? (
                                <div className="bg-blue-50 w-full h-full flex items-center justify-center text-blue-500">
                                    <Truck className="w-8 h-8" />
                                </div>
                            ) : (
                                <img
                                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop"
                                    alt="Provider"
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">{providerName}</h3>
                                    <p className={`text-sm font-medium ${isMedicineOrder ? 'text-blue-500' : 'text-primary'}`}>
                                        {isMedicineOrder ? 'Delivery Executive' : serviceType}
                                    </p>
                                </div>
                                <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase">
                                    Verified
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                <span>⭐ 4.9</span>
                                <span>•</span>
                                <span>{isMedicineOrder ? '1200+ deliveries' : '250+ services'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4">
                        <a
                            href="tel:+919876543210"
                            className={`flex-1 flex items-center justify-center gap-2 py-3 sm:py-3.5 ${isMedicineOrder ? 'bg-blue-500 shadow-blue-500/20' : 'bg-primary shadow-primary/20'} text-white rounded-xl font-bold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all`}
                        >
                            <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="text-sm sm:text-base">Call</span>
                        </a>
                        <a
                            href="sms:+919876543210?body=Hi, I would like to know the status of my service."
                            className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-3.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 active:scale-95 transition-all"
                        >
                            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="text-sm sm:text-base">Message</span>
                        </a>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-100/50">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-slate-900">
                            {isMedicineOrder ? 'Delivery Progress' : 'Service Progress'}
                        </h4>
                        <span className={`text-sm font-bold ${isMedicineOrder ? 'text-blue-500' : 'text-primary'}`}>{trackingInfo.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full bg-gradient-to-r ${isMedicineOrder ? 'from-blue-500 to-indigo-500' : 'from-primary to-secondary'} transition-all duration-500`}
                            style={{ width: `${trackingInfo.progress}%` }}
                        />
                    </div>
                    <p className="text-xs font-medium text-slate-500 mt-2">
                        Currently at: {trackingInfo.currentLocation}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 bg-slate-100 rounded-2xl p-1">
                    <button
                        onClick={() => setActiveTab('live')}
                        className={cn(
                            'flex-1 py-2.5 rounded-xl text-sm font-bold transition-all',
                            activeTab === 'live'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500'
                        )}
                    >
                        Live Updates
                    </button>
                    <button
                        onClick={() => setActiveTab('timeline')}
                        className={cn(
                            'flex-1 py-2.5 rounded-xl text-sm font-bold transition-all',
                            activeTab === 'timeline'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500'
                        )}
                    >
                        Timeline
                    </button>
                </div>

                {/* Content Based on Tab */}
                {activeTab === 'live' ? (
                    <div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-100/50 space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="flex size-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shrink-0 mt-0.5">
                                <span className="text-lg">✓</span>
                            </div>
                            <div>
                                <h5 className="text-sm font-bold text-slate-900">
                                    {isMedicineOrder ? 'Order Picked Up' : 'Professional on the way'}
                                </h5>
                                <p className="text-xs font-medium text-slate-500 mt-1">
                                    {providerName} has started the journey and will reach in approximately {trackingInfo.eta}
                                </p>
                                <p className="text-[10px] font-semibold text-slate-400 mt-2">2 mins ago</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {timeline.map((item, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={cn(
                                            'flex size-8 items-center justify-center rounded-full shrink-0',
                                            item.completed
                                                ? (isMedicineOrder ? 'bg-blue-500 text-white' : 'bg-primary text-white')
                                                : 'bg-slate-100 text-slate-400'
                                        )}
                                    >
                                        {item.completed ? (
                                            <span className="text-sm">✓</span>
                                        ) : (
                                            <span className="text-xs font-bold">{index + 1}</span>
                                        )}
                                    </div>
                                    {index < timeline.length - 1 && (
                                        <div
                                            className={cn(
                                                'w-0.5 h-12 mt-1',
                                                item.completed ? (isMedicineOrder ? 'bg-blue-500' : 'bg-primary') : 'bg-slate-200'
                                            )}
                                        />
                                    )}
                                </div>
                                <div className="flex-1 pb-4">
                                    <div className="flex items-center justify-between">
                                        <h5
                                            className={cn(
                                                'text-sm font-bold',
                                                item.active ? (isMedicineOrder ? 'text-blue-500' : 'text-primary') : 'text-slate-900'
                                            )}
                                        >
                                            {item.status}
                                        </h5>
                                        <span className="text-xs font-semibold text-slate-400">{item.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
