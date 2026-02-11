import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Star, Award, CheckCircle, Phone, MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function NurseAssignment() {
    const navigate = useNavigate();
    const location = useLocation();
    const { serviceType, price, date, time } = location.state || {};

    const [selectedNurse, setSelectedNurse] = useState(null);

    const nurses = [
        {
            id: '1',
            name: 'Sister Priya Sharma',
            experience: '8 years',
            rating: 4.9,
            reviews: 250,
            specialization: 'Post-operative Care',
            languages: ['English', 'Hindi', 'Kannada'],
            verified: true,
            image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop',
            available: true,
            badges: ['Top Rated', 'Verified'],
        },
        {
            id: '2',
            name: 'Sister Anjali Reddy',
            experience: '6 years',
            rating: 4.8,
            reviews: 180,
            specialization: 'Elderly Care',
            languages: ['English', 'Telugu', 'Hindi'],
            verified: true,
            image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop',
            available: true,
            badges: ['Verified'],
        },
        {
            id: '3',
            name: 'Sister Meera Patel',
            experience: '10 years',
            rating: 4.9,
            reviews: 320,
            specialization: 'Critical Care',
            languages: ['English', 'Gujarati', 'Hindi'],
            verified: true,
            image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop',
            available: false,
            badges: ['Top Rated', 'Verified', 'Expert'],
        },
    ];

    const handleContinue = () => {
        if (selectedNurse) {
            navigate('/checkout', {
                state: {
                    serviceType,
                    price,
                    date,
                    time,
                    nurse: selectedNurse,
                },
            });
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 pt-12 pb-4 px-5">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Select Nurse</h1>
                    <div className="w-10" />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-5 py-6 space-y-4 pb-32">
                {/* Success Banner */}
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                    <div className="flex gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500 text-white shrink-0">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-slate-900">Prescription Approved!</h3>
                            <p className="text-xs font-medium text-slate-600 mt-1">
                                Select a qualified nurse for your service
                            </p>
                        </div>
                    </div>
                </div>

                {/* Nurses List */}
                <div className="space-y-3">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Available Nurses</h2>
                    {nurses.map((nurse) => (
                        <button
                            key={nurse.id}
                            onClick={() => nurse.available && setSelectedNurse(nurse)}
                            disabled={!nurse.available}
                            className={cn(
                                'w-full bg-white rounded-2xl p-4 shadow-soft border-2 transition-all text-left',
                                !nurse.available && 'opacity-50 cursor-not-allowed',
                                selectedNurse?.id === nurse.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-slate-100 hover:border-primary/30'
                            )}
                        >
                            <div className="flex gap-4">
                                <div className="relative shrink-0">
                                    <img
                                        src={nurse.image}
                                        alt={nurse.name}
                                        className="w-20 h-20 rounded-xl object-cover"
                                    />
                                    {nurse.verified && (
                                        <div className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-blue-500 text-white border-2 border-white">
                                            <CheckCircle className="w-3.5 h-3.5" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h3 className="text-base font-bold text-slate-900">{nurse.name}</h3>
                                        {selectedNurse?.id === nurse.id && (
                                            <div className="flex size-5 items-center justify-center rounded-full bg-primary text-white shrink-0">
                                                <span className="text-xs">✓</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs font-medium text-primary mb-2">{nurse.specialization}</p>

                                    {/* Badges */}
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        {nurse.badges.map((badge) => (
                                            <span
                                                key={badge}
                                                className={cn(
                                                    'px-2 py-0.5 rounded-full text-[10px] font-bold',
                                                    badge === 'Top Rated' && 'bg-amber-100 text-amber-700',
                                                    badge === 'Verified' && 'bg-blue-100 text-blue-700',
                                                    badge === 'Expert' && 'bg-purple-100 text-purple-700'
                                                )}
                                            >
                                                {badge}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                            <span className="font-bold text-slate-900">{nurse.rating}</span>
                                            <span>({nurse.reviews})</span>
                                        </div>
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                            <Award className="w-3.5 h-3.5 text-primary" />
                                            <span>{nurse.experience}</span>
                                        </div>
                                    </div>

                                    {/* Languages */}
                                    <p className="text-xs font-medium text-slate-500 mt-2">
                                        {nurse.languages.join(', ')}
                                    </p>

                                    {/* Availability */}
                                    {!nurse.available && (
                                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg">
                                            <span className="text-xs font-bold text-slate-600">Not Available</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Contact Buttons (only for selected nurse) */}
                            {selectedNurse?.id === nurse.id && (
                                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                                    <a
                                        href="tel:+919876543210"
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 active:scale-95 transition-all"
                                    >
                                        <Phone className="w-4 h-4" />
                                        Call
                                    </a>
                                    <a
                                        href="sms:+919876543210"
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 active:scale-95 transition-all"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        Message
                                    </a>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </main>

            {/* Bottom Action */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-5 max-w-[430px] mx-auto w-full">
                <button
                    onClick={handleContinue}
                    disabled={!selectedNurse}
                    className={cn(
                        'w-full h-14 rounded-2xl font-bold text-base shadow-lg transition-all',
                        selectedNurse
                            ? 'bg-primary text-white shadow-primary/20 hover:bg-primary/90 active:scale-[0.98]'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    )}
                >
                    Continue to Checkout
                </button>
            </div>
        </div>
    );
}
