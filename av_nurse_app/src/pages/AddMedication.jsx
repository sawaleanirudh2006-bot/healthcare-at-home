import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Plus, X, Bell } from 'lucide-react';
import { cn } from '../lib/utils';

const frequencyOptions = ['Daily', 'Twice a day', 'Weekly', 'As needed'];

export default function AddMedication() {
    const navigate = useNavigate();
    const [medicineName, setMedicineName] = useState('');
    const [dosage, setDosage] = useState('');
    const [unit, setUnit] = useState('mg');
    const [frequency, setFrequency] = useState('Daily');
    const [timeSlots, setTimeSlots] = useState([
        { id: 1, label: 'Morning Dose', time: '08:30 AM', enabled: true },
        { id: 2, label: 'Night Dose', time: '09:00 PM', enabled: false },
    ]);
    const [refillReminder, setRefillReminder] = useState(true);
    const [currentStock, setCurrentStock] = useState('30');
    const [alertAt, setAlertAt] = useState('5');

    const addTimeSlot = () => {
        const newSlot = {
            id: timeSlots.length + 1,
            label: `Dose ${timeSlots.length + 1}`,
            time: '12:00 PM',
            enabled: true,
        };
        setTimeSlots([...timeSlots, newSlot]);
    };

    const toggleTimeSlot = (id) => {
        setTimeSlots(
            timeSlots.map((slot) =>
                slot.id === id ? { ...slot, enabled: !slot.enabled } : slot
            )
        );
    };

    const handleSave = () => {
        // Save medication logic here
        navigate('/medication-reminders');
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md pt-12 pb-4 px-5">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex size-10 items-center justify-center rounded-full bg-white shadow-soft text-slate-700"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold tracking-tight text-slate-800">
                        Add New Medication
                    </h1>
                    <div className="w-10" />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-5 py-4 space-y-6 pb-32">
                {/* Medicine Details */}
                <div className="space-y-4">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        MEDICINE DETAILS
                    </h3>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Medicine Name
                        </label>
                        <input
                            type="text"
                            value={medicineName}
                            onChange={(e) => setMedicineName(e.target.value)}
                            placeholder="e.g., Metformin"
                            className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Dosage
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={dosage}
                                onChange={(e) => setDosage(e.target.value)}
                                placeholder="e.g., 500"
                                className="flex-1 px-4 py-3 bg-white rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                            <select
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                className="px-4 py-3 bg-white rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                                <option value="mg">mg</option>
                                <option value="ml">ml</option>
                                <option value="g">g</option>
                                <option value="mcg">mcg</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Frequency */}
                <div className="space-y-3">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        FREQUENCY
                    </h3>
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                        {frequencyOptions.map((option) => (
                            <button
                                key={option}
                                onClick={() => setFrequency(option)}
                                className={cn(
                                    'px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all',
                                    frequency === option
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:border-primary/30'
                                )}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Time Slots */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                            TIME SLOTS
                        </h3>
                        <button
                            onClick={addTimeSlot}
                            className="flex items-center gap-1 text-sm font-bold text-primary"
                        >
                            <Plus className="w-4 h-4" />
                            Add Time
                        </button>
                    </div>

                    <div className="space-y-3">
                        {timeSlots.map((slot) => (
                            <div
                                key={slot.id}
                                className={cn(
                                    'flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                                    slot.enabled
                                        ? 'bg-teal-50 border-primary/20'
                                        : 'bg-slate-50 border-slate-200'
                                )}
                            >
                                <div className={cn(
                                    'flex size-10 items-center justify-center rounded-lg',
                                    slot.enabled ? 'bg-primary/10' : 'bg-slate-200'
                                )}>
                                    <Clock className={cn('w-5 h-5', slot.enabled ? 'text-primary' : 'text-slate-400')} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-slate-600">
                                        {slot.label}
                                    </p>
                                    <p className="text-base font-bold text-slate-900">{slot.time}</p>
                                </div>
                                <button
                                    onClick={() => toggleTimeSlot(slot.id)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    {slot.enabled ? (
                                        <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                                            <span className="text-white text-xs">✓</span>
                                        </div>
                                    ) : (
                                        <div className="w-6 h-6 rounded-md border-2 border-slate-300" />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Refill Reminder */}
                <div className="bg-teal-50 rounded-2xl p-5 border-2 border-primary/10 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-primary" />
                            <h4 className="text-base font-bold text-slate-900">
                                Refill Reminder
                            </h4>
                        </div>
                        <button
                            onClick={() => setRefillReminder(!refillReminder)}
                            className={cn(
                                'relative w-12 h-7 rounded-full transition-colors',
                                refillReminder ? 'bg-primary' : 'bg-slate-200'
                            )}
                        >
                            <div
                                className={cn(
                                    'absolute top-1 w-5 h-5 bg-white rounded-full transition-transform',
                                    refillReminder ? 'right-1' : 'left-1'
                                )}
                            />
                        </button>
                    </div>
                    <p className="text-sm font-medium text-slate-600">
                        Get notified when your medicine stock is running low so you can order in time.
                    </p>

                    {refillReminder && (
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    CURRENT STOCK
                                </p>
                                <input
                                    type="number"
                                    value={currentStock}
                                    onChange={(e) => setCurrentStock(e.target.value)}
                                    className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 text-center text-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    ALERT AT
                                </p>
                                <input
                                    type="number"
                                    value={alertAt}
                                    onChange={(e) => setAlertAt(e.target.value)}
                                    className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 text-center text-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Decorative Icon */}
                <div className="flex justify-center py-4">
                    <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-3xl">💊</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Fixed Bottom Button */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-slate-100 px-5 py-4">
                <button
                    onClick={handleSave}
                    className="w-full bg-primary text-white px-6 py-4 rounded-2xl text-base font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Save Reminder
                </button>
            </div>
        </div>
    );
}
