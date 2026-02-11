import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, AlertCircle, MapPin, Clock, User } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Emergency() {
    const navigate = useNavigate();

    const [locationStatus, setLocationStatus] = useState('idle'); // idle, loading, success, error
    const [locationData, setLocationData] = useState(null);

    const emergencyContacts = [
        {
            id: '1',
            name: 'Ambulance Service',
            number: '108',
            type: 'Medical Emergency',
            icon: '🚑',
            color: 'bg-red-500',
            available: '24/7 Available',
        },
        {
            id: '2',
            name: 'Emergency Nurse',
            number: '+91 9876543210',
            type: 'Immediate Care',
            icon: '👩‍⚕️',
            color: 'bg-primary',
            available: 'On-call Now',
        },
        {
            id: '3',
            name: 'Doctor on Call',
            number: '+91 9876543211',
            type: 'Medical Consultation',
            icon: '👨‍⚕️',
            color: 'bg-secondary',
            available: 'Available',
        },
        {
            id: '4',
            name: 'Family Contact',
            number: '+91 9876543212',
            type: 'Primary Contact',
            icon: '👨‍👩‍👧',
            color: 'bg-purple-500',
            available: 'Always',
        },
    ];

    const handleCall = (contact) => {

        // Simulate calling
        setTimeout(() => {
            window.location.href = `tel:${contact.number}`;

        }, 500);
    };

    const handleShareLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus('error');
            return;
        }

        setLocationStatus('loading');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocationData({ latitude, longitude });
                setLocationStatus('success');

                // Open Google Maps with the location
                const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
                window.open(mapsUrl, '_blank');

                // Reset after 3 seconds
                setTimeout(() => {
                    setLocationStatus('idle');
                }, 3000);
            },
            (error) => {
                console.error('Error getting location:', error);
                setLocationStatus('error');
                setTimeout(() => {
                    setLocationStatus('idle');
                }, 3000);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            }
        );
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-gradient-to-br from-red-500 to-red-600 pt-12 pb-6 px-5">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex size-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 active:scale-95 transition-all backdrop-blur-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-white">Emergency</h1>
                    <div className="w-10" />
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                    <div className="flex size-12 items-center justify-center rounded-full bg-white/20 animate-pulse">
                        <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="text-white font-bold text-base">Need Immediate Help?</p>
                        <p className="text-white/80 text-xs font-medium mt-0.5">Tap any contact to call instantly</p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-5 py-6 space-y-4 pb-24">
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => handleCall({ number: '108' })}
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:shadow-xl active:scale-95 transition-all"
                    >
                        <span className="text-3xl">🚑</span>
                        <span className="text-sm font-bold">Call 108</span>
                        <span className="text-xs opacity-90">Ambulance</span>
                    </button>
                    <button
                        onClick={() => navigate('/ai-health-assistant')}
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/30 hover:shadow-xl active:scale-95 transition-all"
                    >
                        <span className="text-3xl">💬</span>
                        <span className="text-sm font-bold">AI Assistant</span>
                        <span className="text-xs opacity-90">Get Help</span>
                    </button>
                </div>

                {/* Emergency Contacts */}
                <div className="space-y-3">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Emergency Contacts</h2>
                    {emergencyContacts.map((contact) => (
                        <div
                            key={contact.id}
                            className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100 hover:shadow-md transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn('flex size-14 items-center justify-center rounded-2xl text-2xl', contact.color)}>
                                    {contact.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-bold text-slate-900">{contact.name}</h3>
                                    <p className="text-xs font-medium text-slate-500 mt-0.5">{contact.type}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-xs font-semibold text-emerald-600">{contact.available}</span>
                                        </div>
                                    </div>
                                </div>
                                <a
                                    href={`tel:${contact.number}`}
                                    className="flex size-12 items-center justify-center rounded-full bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all"
                                >
                                    <Phone className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Location Sharing */}
                <div className={cn(
                    'rounded-2xl p-4 border transition-all',
                    locationStatus === 'success' && 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200',
                    locationStatus === 'error' && 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200',
                    (locationStatus === 'idle' || locationStatus === 'loading') && 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100'
                )}>
                    <div className="flex items-start gap-3">
                        <div className={cn(
                            'flex size-10 items-center justify-center rounded-xl text-white',
                            locationStatus === 'success' && 'bg-emerald-500',
                            locationStatus === 'error' && 'bg-red-500',
                            (locationStatus === 'idle' || locationStatus === 'loading') && 'bg-blue-500'
                        )}>
                            {locationStatus === 'loading' ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <MapPin className="w-5 h-5" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-slate-900">
                                {locationStatus === 'success' && 'Location Shared!'}
                                {locationStatus === 'error' && 'Location Access Denied'}
                                {(locationStatus === 'idle' || locationStatus === 'loading') && 'Share Your Location'}
                            </h3>
                            <p className="text-xs font-medium text-slate-600 mt-1">
                                {locationStatus === 'success' && `Lat: ${locationData?.latitude.toFixed(4)}, Lng: ${locationData?.longitude.toFixed(4)}`}
                                {locationStatus === 'error' && 'Please enable location access in your browser settings'}
                                {locationStatus === 'loading' && 'Getting your location...'}
                                {locationStatus === 'idle' && 'Help emergency services reach you faster by sharing your current location'}
                            </p>
                            {locationStatus !== 'loading' && (
                                <button
                                    onClick={handleShareLocation}
                                    disabled={locationStatus === 'loading'}
                                    className={cn(
                                        'mt-3 px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all',
                                        locationStatus === 'success' && 'bg-emerald-500 text-white hover:bg-emerald-600',
                                        locationStatus === 'error' && 'bg-red-500 text-white hover:bg-red-600',
                                        locationStatus === 'idle' && 'bg-blue-500 text-white hover:bg-blue-600'
                                    )}
                                >
                                    {locationStatus === 'success' && 'Share Again'}
                                    {locationStatus === 'error' && 'Try Again'}
                                    {locationStatus === 'idle' && 'Share Location'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Emergency Calls */}
                <div className="space-y-3">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Calls</h2>
                    <div className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-900">Ambulance Service</p>
                                <p className="text-xs font-medium text-slate-500 mt-0.5">Called 2 days ago • 108</p>
                            </div>
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                Completed
                            </span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
