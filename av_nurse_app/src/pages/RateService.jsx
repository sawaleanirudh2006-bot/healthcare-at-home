import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';

const RateService = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { booking } = location.state || {};

    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [serviceQuality, setServiceQuality] = useState({
        punctuality: 0,
        professionalism: 0,
        care: 0,
        communication: 0
    });

    const handleSubmitRating = () => {
        if (rating === 0) {
            alert('Please select a star rating');
            return;
        }

        // Create rating object
        const ratingData = {
            bookingId: booking.id,
            nurseId: booking.nurse?.id,
            nurseName: booking.nurse?.name,
            rating: rating,
            feedback: feedback,
            serviceQuality: serviceQuality,
            submittedAt: new Date().toISOString()
        };

        // Save rating to localStorage
        const ratings = JSON.parse(localStorage.getItem('serviceRatings') || '[]');
        ratings.push(ratingData);
        localStorage.setItem('serviceRatings', JSON.stringify(ratings));

        // Update booking with rating
        const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        const updatedBookings = bookings.map(b => {
            if (b.id === booking.id) {
                return { ...b, rated: true, rating: rating };
            }
            return b;
        });
        localStorage.setItem('userBookings', JSON.stringify(updatedBookings));

        alert('Thank you for your feedback!');
        navigate('/bookings');
    };

    const renderStars = (count, onHover, onClick, currentRating) => {
        return [...Array(5)].map((_, index) => (
            <button
                key={index}
                type="button"
                onMouseEnter={() => onHover && onHover(index + 1)}
                onMouseLeave={() => onHover && onHover(0)}
                onClick={() => onClick(index + 1)}
                className="transition-transform hover:scale-110 active:scale-95"
            >
                <Star
                    className={`w-10 h-10 ${index < (currentRating || count)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                />
            </button>
        ));
    };

    if (!booking) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <p className="text-slate-500">No booking data found</p>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 pt-12 pb-4 px-5">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/bookings')}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Rate Service</h1>
                    <div className="w-10" />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-5 py-6 space-y-6">
                {/* Nurse Info */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[32px] text-primary">person</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">{booking.nurse?.name || 'Nurse'}</h3>
                            <p className="text-sm font-medium text-slate-500">{booking.service}</p>
                            <p className="text-xs font-medium text-slate-400 mt-1">
                                {booking.date} • {booking.time}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Overall Rating */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 text-center">
                        How was your experience?
                    </h3>
                    <div className="flex justify-center gap-2 mb-3">
                        {renderStars(rating, setHoveredRating, setRating, hoveredRating)}
                    </div>
                    <p className="text-center text-sm font-medium text-slate-500">
                        {rating === 0 ? 'Tap to rate' :
                            rating === 1 ? 'Poor' :
                                rating === 2 ? 'Fair' :
                                    rating === 3 ? 'Good' :
                                        rating === 4 ? 'Very Good' :
                                            'Excellent'}
                    </p>
                </div>

                {/* Service Quality Metrics */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Rate Service Quality</h3>

                    {/* Punctuality */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">Punctuality</span>
                            <span className="text-xs font-bold text-primary">
                                {serviceQuality.punctuality}/5
                            </span>
                        </div>
                        <div className="flex gap-1">
                            {renderStars(serviceQuality.punctuality, null, (val) =>
                                setServiceQuality({ ...serviceQuality, punctuality: val }), 0)}
                        </div>
                    </div>

                    {/* Professionalism */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">Professionalism</span>
                            <span className="text-xs font-bold text-primary">
                                {serviceQuality.professionalism}/5
                            </span>
                        </div>
                        <div className="flex gap-1">
                            {renderStars(serviceQuality.professionalism, null, (val) =>
                                setServiceQuality({ ...serviceQuality, professionalism: val }), 0)}
                        </div>
                    </div>

                    {/* Care Quality */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">Care Quality</span>
                            <span className="text-xs font-bold text-primary">
                                {serviceQuality.care}/5
                            </span>
                        </div>
                        <div className="flex gap-1">
                            {renderStars(serviceQuality.care, null, (val) =>
                                setServiceQuality({ ...serviceQuality, care: val }), 0)}
                        </div>
                    </div>

                    {/* Communication */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">Communication</span>
                            <span className="text-xs font-bold text-primary">
                                {serviceQuality.communication}/5
                            </span>
                        </div>
                        <div className="flex gap-1">
                            {renderStars(serviceQuality.communication, null, (val) =>
                                setServiceQuality({ ...serviceQuality, communication: val }), 0)}
                        </div>
                    </div>
                </div>

                {/* Feedback */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <label className="text-sm font-bold text-slate-900 mb-3 block">
                        Additional Feedback (Optional)
                    </label>
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Share your experience with us..."
                        className="w-full h-32 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-none"
                    />
                </div>
            </main>

            {/* Submit Button */}
            <div className="sticky bottom-0 bg-white border-t border-slate-100 p-5">
                <button
                    onClick={handleSubmitRating}
                    className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-base shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
                >
                    Submit Rating
                </button>
            </div>
        </div>
    );
};

export default RateService;
