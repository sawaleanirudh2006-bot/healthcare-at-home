import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Activity, Thermometer, Droplet, Plus, Calendar, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Vitals = () => {
    const navigate = useNavigate();
    const [vitals, setVitals] = useState(() => {
        const storedVitals = JSON.parse(localStorage.getItem('userVitals') || '[]');
        if (storedVitals.length === 0) {
            // Dummy data
            const dummyData = [
                { id: 1, type: 'Heart Rate', value: '72', unit: 'bpm', date: '2023-10-25', time: '08:00 AM', icon: 'Heart', color: 'text-rose-500 bg-rose-50' },
                { id: 2, type: 'Blood Pressure', value: '120/80', unit: 'mmHg', date: '2023-10-25', time: '08:00 AM', icon: 'Activity', color: 'text-blue-500 bg-blue-50' },
                { id: 3, type: 'Temperature', value: '98.6', unit: '°F', date: '2023-10-24', time: '09:00 PM', icon: 'Thermometer', color: 'text-amber-500 bg-amber-50' },
            ];
            localStorage.setItem('userVitals', JSON.stringify(dummyData));
            return dummyData;
        } else {
            return storedVitals;
        }
    });
    const [showLogModal, setShowLogModal] = useState(false);
    const [newVital, setNewVital] = useState(() => ({
        type: 'Heart Rate',
        value: '',
        unit: 'bpm',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    const handleLogVital = (e) => {
        e.preventDefault();
        const vitalEntry = {
            id: Date.now(),
            ...newVital,
            icon: newVital.type === 'Heart Rate' ? 'Heart' : newVital.type === 'Blood Pressure' ? 'Activity' : newVital.type === 'Temperature' ? 'Thermometer' : 'Droplet',
            color: newVital.type === 'Heart Rate' ? 'text-rose-500 bg-rose-50' : newVital.type === 'Blood Pressure' ? 'text-blue-500 bg-blue-50' : newVital.type === 'Temperature' ? 'text-amber-500 bg-amber-50' : 'text-emerald-500 bg-emerald-50'
        };
        const updatedVitals = [vitalEntry, ...vitals];
        setVitals(updatedVitals);
        localStorage.setItem('userVitals', JSON.stringify(updatedVitals));
        setShowLogModal(false);
        setNewVital({ ...newVital, value: '' });
    };

    const getIcon = (iconName) => {
        switch (iconName) {
            case 'Heart': return Heart;
            case 'Activity': return Activity;
            case 'Thermometer': return Thermometer;
            case 'Droplet': return Droplet;
            default: return Activity;
        }
    };

    return (
        <div className="bg-background min-h-screen max-w-[430px] mx-auto relative flex flex-col">
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md pt-12 pb-4 px-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">My Vitals</h1>
                </div>
                <button
                    onClick={() => setShowLogModal(true)}
                    className="flex size-10 items-center justify-center rounded-full bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </header>

            <main className="px-5 py-6 flex-1 pb-24 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Heart className="w-4 h-4 text-rose-500" />
                            <span className="text-xs font-bold text-slate-500 uppercase">Heart Rate</span>
                        </div>
                        <p className="text-2xl font-extrabold text-slate-900">
                            {vitals.find(v => v.type === 'Heart Rate')?.value || '--'}
                            <span className="text-xs font-medium text-slate-400 ml-1">bpm</span>
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4 text-blue-500" />
                            <span className="text-xs font-bold text-slate-500 uppercase">BP</span>
                        </div>
                        <p className="text-2xl font-extrabold text-slate-900">
                            {vitals.find(v => v.type === 'Blood Pressure')?.value || '--'}
                            <span className="text-xs font-medium text-slate-400 ml-1">mmHg</span>
                        </p>
                    </div>
                </div>

                {/* Recent History */}
                <div>
                    <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
                        Recent History
                        <span className="text-xs font-medium text-primary flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> View Trends
                        </span>
                    </h2>
                    <div className="space-y-3">
                        {vitals.map((vital) => {
                            const Icon = getIcon(vital.icon);
                            return (
                                <div key={vital.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`size-12 rounded-xl flex items-center justify-center ${vital.color}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{vital.type}</p>
                                            <p className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {new Date(vital.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {vital.time}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-extrabold text-slate-900">{vital.value}</p>
                                        <p className="text-xs font-bold text-slate-400 uppercase">{vital.unit}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* Log Modal */}
            <AnimatePresence>
                {showLogModal && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl"
                        >
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Log New Vitals</h3>
                            <form onSubmit={handleLogVital} className="space-y-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-700 block mb-1.5">Vital Type</label>
                                    <select
                                        className="w-full h-12 rounded-xl border-slate-200 bg-slate-50 font-medium px-3"
                                        value={newVital.type}
                                        onChange={(e) => setNewVital({ ...newVital, type: e.target.value, unit: e.target.value === 'Heart Rate' ? 'bpm' : e.target.value === 'Temperature' ? '°F' : e.target.value === 'Blood Sugar' ? 'mg/dL' : 'mmHg' })}
                                    >
                                        <option>Heart Rate</option>
                                        <option>Blood Pressure</option>
                                        <option>Temperature</option>
                                        <option>Blood Sugar</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 block mb-1.5">Value ({newVital.unit})</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 72"
                                        className="w-full h-12 rounded-xl border-slate-200 bg-slate-50 font-medium px-3 text-lg"
                                        value={newVital.value}
                                        onChange={(e) => setNewVital({ ...newVital, value: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowLogModal(false)}
                                        className="h-12 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="h-12 rounded-xl bg-primary text-white font-bold hover:bg-primary/90"
                                    >
                                        Save Log
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Vitals;
