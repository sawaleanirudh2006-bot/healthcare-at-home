import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Calendar as CalendarIcon, Plus, Pill, Droplet, Syringe } from 'lucide-react';
import { cn } from '../lib/utils';

const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const dates = [16, 17, 18, 19, 20, 21, 22];

const medications = [
    {
        id: 1,
        name: 'Aspirin 75mg',
        dosage: '1 Tablet',
        timing: 'After Breakfast',
        time: '08:00 AM',
        icon: Pill,
        period: 'morning',
        taken: true,
    },
    {
        id: 2,
        name: 'Multivitamin',
        dosage: '1 Capsule',
        timing: 'After Breakfast',
        time: '08:00 AM',
        icon: Pill,
        period: 'morning',
        taken: true,
    },
    {
        id: 3,
        name: 'Omega 3 Syrup',
        dosage: '5ml',
        timing: 'With Lunch',
        time: '01:30 PM',
        icon: Droplet,
        period: 'afternoon',
        taken: true,
    },
    {
        id: 4,
        name: 'Metformin 500mg',
        dosage: '1 Tablet',
        timing: 'After Dinner',
        time: '09:00 PM',
        icon: Pill,
        period: 'evening',
        taken: false,
    },
    {
        id: 5,
        name: 'Sleep Support',
        dosage: '1 Capsule',
        timing: 'Before Bed',
        time: '09:00 PM',
        icon: Pill,
        period: 'evening',
        taken: false,
    },
];

export default function MedicationReminders() {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(3); // Thursday (index 3)
    const [medicationStates, setMedicationStates] = useState(
        medications.reduce((acc, med) => ({ ...acc, [med.id]: med.taken }), {})
    );

    const toggleMedication = (id) => {
        setMedicationStates((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const takenCount = Object.values(medicationStates).filter(Boolean).length;
    const totalCount = medications.length;
    const progress = Math.round((takenCount / totalCount) * 100);

    const groupedMeds = {
        morning: medications.filter((m) => m.period === 'morning'),
        afternoon: medications.filter((m) => m.period === 'afternoon'),
        evening: medications.filter((m) => m.period === 'evening'),
    };

    const periodIcons = {
        morning: '☀️',
        afternoon: '☀️',
        evening: '🌙',
    };

    const periodTitles = {
        morning: 'Morning',
        afternoon: 'Afternoon',
        evening: 'Evening',
    };

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
                        Medication Reminders
                    </h1>
                    <button className="flex size-10 items-center justify-center rounded-full bg-white shadow-soft text-slate-700">
                        <Bell className="w-5 h-5" />
                    </button>
                </div>

                {/* Calendar */}
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-bold text-slate-900">October 2023</h2>
                    <button className="text-slate-400">
                        <CalendarIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                    {weekDays.map((day, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedDate(index)}
                            className={cn(
                                'flex flex-col items-center justify-center min-w-[52px] h-16 rounded-2xl transition-all',
                                selectedDate === index
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-white text-slate-600 hover:bg-slate-50'
                            )}
                        >
                            <span className="text-[10px] font-bold uppercase tracking-wider mb-1">
                                {day}
                            </span>
                            <span className="text-lg font-bold">{dates[index]}</span>
                        </button>
                    ))}
                </div>

                {/* Progress */}
                <div className="mt-4 bg-teal-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                            TODAY'S PROGRESS
                        </span>
                        <span className="text-sm font-extrabold text-primary">{progress}%</span>
                    </div>
                    <div className="h-2 bg-white rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-5 py-2 space-y-6 pb-24">
                {Object.entries(groupedMeds).map(([period, meds]) => (
                    <div key={period} className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{periodIcons[period]}</span>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {periodTitles[period]}
                                </h3>
                            </div>
                            <span className="text-xs font-semibold text-slate-400">
                                {meds[0]?.time}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {meds.map((med) => {
                                const Icon = med.icon;
                                const isTaken = medicationStates[med.id];

                                return (
                                    <div
                                        key={med.id}
                                        className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-soft"
                                    >
                                        <div className={cn(
                                            'flex size-12 items-center justify-center rounded-xl',
                                            isTaken ? 'bg-teal-50' : 'bg-slate-50'
                                        )}>
                                            <Icon className={cn('w-6 h-6', isTaken ? 'text-primary' : 'text-slate-400')} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-base font-bold text-slate-900 leading-tight">
                                                {med.name}
                                            </h4>
                                            <p className="text-sm font-medium text-primary mt-0.5">
                                                {med.dosage} • {med.timing}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => toggleMedication(med.id)}
                                            className={cn(
                                                'relative w-12 h-7 rounded-full transition-colors',
                                                isTaken ? 'bg-primary' : 'bg-slate-200'
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'absolute top-1 w-5 h-5 bg-white rounded-full transition-transform',
                                                    isTaken ? 'right-1' : 'left-1'
                                                )}
                                            />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </main>

            {/* Floating Add Button */}
            <button
                onClick={() => navigate('/add-medication')}
                className="fixed bottom-24 right-5 flex size-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95"
            >
                <Plus className="w-6 h-6" />
            </button>
        </div>
    );
}
