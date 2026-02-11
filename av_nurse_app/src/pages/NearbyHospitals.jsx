import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Navigation, Star } from 'lucide-react';

const NearbyHospitals = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    // Mock hospital data
    const hospitals = [
        {
            id: 1,
            name: 'Apollo Hospital',
            specialty: 'Multi-Specialty',
            distance: '2.3 km',
            rating: 4.8,
            address: 'Sarita Vihar, New Delhi',
            phone: '+91 11 2692 5858',
            emergency: true,
            beds: 'Available'
        },
        {
            id: 2,
            name: 'Max Super Specialty Hospital',
            specialty: 'Cardiac Care',
            distance: '3.1 km',
            rating: 4.7,
            address: 'Saket, New Delhi',
            phone: '+91 11 2651 5050',
            emergency: true,
            beds: 'Limited'
        },
        {
            id: 3,
            name: 'Fortis Hospital',
            specialty: 'Multi-Specialty',
            distance: '4.5 km',
            rating: 4.6,
            address: 'Vasant Kunj, New Delhi',
            phone: '+91 11 4277 6222',
            emergency: true,
            beds: 'Available'
        },
        {
            id: 4,
            name: 'AIIMS Delhi',
            specialty: 'Government Hospital',
            distance: '5.2 km',
            rating: 4.5,
            address: 'Ansari Nagar, New Delhi',
            phone: '+91 11 2658 8500',
            emergency: true,
            beds: 'Full'
        },
        {
            id: 5,
            name: 'Medanta Hospital',
            specialty: 'Multi-Specialty',
            distance: '6.8 km',
            rating: 4.9,
            address: 'Sector 38, Gurugram',
            phone: '+91 124 4141 414',
            emergency: true,
            beds: 'Available'
        }
    ];

    const filteredHospitals = hospitals.filter(h =>
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 pt-12 pb-4 px-5">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigate('/home')}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Nearby Hospitals</h1>
                    <div className="w-10" />
                </div>

                {/* Search */}
                <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search hospitals..."
                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-5 py-6 space-y-4">
                {/* Location Banner */}
                <div className="bg-primary/10 rounded-2xl p-4 flex items-center gap-3">
                    <Navigation className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                        <p className="text-xs font-bold text-primary">Showing hospitals near you</p>
                        <p className="text-xs text-slate-600 mt-0.5">Based on your current location</p>
                    </div>
                </div>

                {/* Hospital List */}
                {filteredHospitals.map(hospital => (
                    <div key={hospital.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <h3 className="text-base font-bold text-slate-900">{hospital.name}</h3>
                                <p className="text-sm text-slate-600 mt-0.5">{hospital.specialty}</p>
                            </div>
                            {hospital.emergency && (
                                <span className="px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full">
                                    24/7 ER
                                </span>
                            )}
                        </div>

                        {/* Rating & Distance */}
                        <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                <span className="text-sm font-bold text-slate-900">{hospital.rating}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-600">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm font-bold">{hospital.distance}</span>
                            </div>
                            <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${hospital.beds === 'Available' ? 'bg-emerald-50 text-emerald-700' :
                                    hospital.beds === 'Limited' ? 'bg-amber-50 text-amber-700' :
                                        'bg-red-50 text-red-700'
                                }`}>
                                Beds: {hospital.beds}
                            </div>
                        </div>

                        {/* Address */}
                        <p className="text-xs text-slate-500 mb-3">{hospital.address}</p>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <a
                                href={`tel:${hospital.phone}`}
                                className="flex-1 h-10 bg-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-95 transition-all"
                            >
                                <Phone className="w-4 h-4" />
                                Call
                            </a>
                            <button
                                onClick={() => alert(`Opening directions to ${hospital.name}`)}
                                className="flex-1 h-10 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-200 active:scale-95 transition-all"
                            >
                                <Navigation className="w-4 h-4" />
                                Directions
                            </button>
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
};

export default NearbyHospitals;
