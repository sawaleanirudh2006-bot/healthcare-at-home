import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Download, Plus, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';

const tabs = ['Daily', 'Weekly', 'Monthly'];

const vitals = [
    {
        id: 1,
        name: 'Blood Pressure',
        value: '118/76',
        unit: 'mmHg',
        status: 'NORMAL RANGE',
        statusColor: 'emerald',
        icon: '❤️',
        lastUpdated: '2 hours ago by Nurse Priya',
    },
    {
        id: 2,
        name: 'Blood Glucose',
        value: '94',
        unit: 'mg/dL',
        status: 'PRE-MEAL',
        statusColor: 'orange',
        icon: '🩸',
        lastUpdated: 'Fasting log recorded at 08:30 AM',
    },
    {
        id: 3,
        name: 'Heart Rate',
        value: '72',
        unit: 'BPM',
        status: 'STEADY',
        statusColor: 'emerald',
        icon: '💓',
        lastUpdated: 'Average resting rate today',
    },
];

export default function HealthLogTrends() {
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState('Daily');

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md pt-12 pb-4 px-5">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex size-10 items-center justify-center rounded-full bg-white shadow-soft text-slate-700"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold tracking-tight text-slate-800">
                        Health Log Trends
                    </h1>
                    <button className="flex size-10 items-center justify-center rounded-full bg-white shadow-soft text-slate-700">
                        <Calendar className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 bg-slate-100 rounded-2xl p-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setSelectedTab(tab)}
                            className={cn(
                                'flex-1 py-2.5 rounded-xl text-sm font-bold transition-all',
                                selectedTab === tab
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500'
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-5 py-4 space-y-6 pb-24">
                {/* Health Score */}
                <div className="bg-white rounded-2xl p-6 shadow-premium border border-slate-100/50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            ACTIVITY OVERVIEW
                        </h3>
                        <span className="text-xs font-bold text-primary">UPDATED 5M AGO</span>
                    </div>

                    <div className="flex items-end justify-between mb-4">
                        <div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-extrabold text-slate-900">92</span>
                                <span className="text-base font-semibold text-slate-500">Health Score</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                <span className="text-sm font-bold text-emerald-500">4%</span>
                            </div>
                        </div>
                    </div>

                    {/* Mini Chart */}
                    <div className="flex items-end justify-between h-32 gap-1.5">
                        {[45, 55, 75, 50, 85, 70, 90, 65, 95, 80, 92, 88].map((height, index) => (
                            <div
                                key={index}
                                className="flex-1 bg-gradient-to-t from-primary/30 to-primary/10 rounded-t-lg transition-all hover:from-primary/50"
                                style={{ height: `${height}%` }}
                            />
                        ))}
                    </div>

                    <div className="flex items-center justify-between mt-3 text-xs font-semibold text-slate-400">
                        <span>08 AM</span>
                        <span>12 PM</span>
                        <span>04 PM</span>
                        <span>08 PM</span>
                    </div>
                </div>

                {/* Daily Vitals */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        DAILY VITALS
                    </h3>

                    {vitals.map((vital) => (
                        <div
                            key={vital.id}
                            className="bg-white rounded-2xl p-5 shadow-soft border border-slate-100/50"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-blue-50">
                                    <span className="text-2xl">{vital.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h4 className="text-sm font-bold uppercase tracking-wider text-primary">
                                                {vital.name}
                                            </h4>
                                            <div className="flex items-baseline gap-2 mt-1">
                                                <span className="text-2xl font-extrabold text-slate-900">
                                                    {vital.value}
                                                </span>
                                                <span className="text-sm font-semibold text-slate-500">
                                                    {vital.unit}
                                                </span>
                                            </div>
                                        </div>
                                        <span
                                            className={cn(
                                                'px-2 py-1 rounded text-[10px] font-bold uppercase',
                                                vital.statusColor === 'emerald'
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : 'bg-orange-50 text-orange-600'
                                            )}
                                        >
                                            {vital.status}
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium text-slate-500">
                                        {vital.lastUpdated}
                                    </p>
                                    <button className="mt-3 text-sm font-bold text-primary hover:text-primary/80">
                                        View Trends
                                    </button>
                                </div>
                                <button className="flex size-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Download Report */}
                <button className="w-full bg-primary text-white px-6 py-4 rounded-2xl text-base font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" />
                    Download Health Report
                </button>
            </main>
        </div>
    );
}
