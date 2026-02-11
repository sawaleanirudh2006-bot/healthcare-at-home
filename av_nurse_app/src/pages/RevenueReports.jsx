import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, DollarSign, Users, Package } from 'lucide-react';

const RevenueReports = () => {
    const navigate = useNavigate();
    const [stats] = useState(() => {
        const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        const total = bookings.reduce((sum, b) => sum + (b.amount || 1999), 0);
        // const completed = bookings.filter(b => b.status === 'completed').length; // Unused variable 'completed' removal

        return {
            totalRevenue: total,
            totalBookings: bookings.length,
            avgBookingValue: bookings.length > 0 ? Math.round(total / bookings.length) : 0,
            topService: 'IV Therapy'
        };
    });

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 pt-12 pb-4 px-5">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Revenue Reports</h1>
                    <div className="w-10" />
                </div>
            </header>

            <main className="flex-1 px-5 py-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white">
                        <DollarSign className="w-8 h-8 mb-2 opacity-80" />
                        <p className="text-sm font-medium opacity-90">Total Revenue</p>
                        <p className="text-2xl font-bold mt-1">₹{stats.totalRevenue.toLocaleString()}</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
                        <Users className="w-8 h-8 mb-2 opacity-80" />
                        <p className="text-sm font-medium opacity-90">Total Bookings</p>
                        <p className="text-2xl font-bold mt-1">{stats.totalBookings}</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white">
                        <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
                        <p className="text-sm font-medium opacity-90">Avg Booking</p>
                        <p className="text-2xl font-bold mt-1">₹{stats.avgBookingValue}</p>
                    </div>

                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 text-white">
                        <Package className="w-8 h-8 mb-2 opacity-80" />
                        <p className="text-sm font-medium opacity-90">Top Service</p>
                        <p className="text-lg font-bold mt-1">{stats.topService}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <h3 className="text-base font-bold text-slate-900 mb-4">Revenue Trend</h3>
                    <div className="h-48 flex items-end justify-between gap-2">
                        {[65, 45, 80, 55, 90, 70, 85].map((height, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full bg-primary/20 rounded-t-lg" style={{ height: `${height}%` }}>
                                    <div className="w-full bg-primary rounded-t-lg h-1/2" />
                                </div>
                                <span className="text-xs text-slate-500">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RevenueReports;
