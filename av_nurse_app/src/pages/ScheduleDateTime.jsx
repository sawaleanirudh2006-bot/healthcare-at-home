import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ScheduleDateTime() {
    const navigate = useNavigate();
    const location = useLocation();
    const { serviceType = 'Short Visit', price = '₹499', nurse, isRebooking, isIVService, isPackage, packageDetails } = location.state || {};

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);

    const dateInputRef = useRef(null);
    const timeInputRef = useRef(null);

    // Generate next 7 days
    const generateDates = () => {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push({
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                date: date.getDate(),
                month: date.toLocaleDateString('en-US', { month: 'short' }),
                fullDate: date.toISOString().split('T')[0],
                isToday: i === 0,
            });
        }
        return dates;
    };

    const timeSlots = [
        { id: '1', time: '08:00 AM', available: true },
        { id: '2', time: '09:00 AM', available: true },
        { id: '3', time: '10:00 AM', available: true },
        { id: '4', time: '11:00 AM', available: false },
        { id: '5', time: '12:00 PM', available: true },
        { id: '6', time: '02:00 PM', available: true },
        { id: '7', time: '03:00 PM', available: true },
        { id: '8', time: '04:00 PM', available: true },
        { id: '9', time: '05:00 PM', available: false },
        { id: '10', time: '06:00 PM', available: true },
        { id: '11', time: '07:00 PM', available: true },
        { id: '12', time: '08:00 PM', available: true },
    ];

    const dates = generateDates();

    const handleCustomDateClick = () => {
        if (dateInputRef.current) {
            if (dateInputRef.current.showPicker) {
                dateInputRef.current.showPicker();
            } else {
                dateInputRef.current.focus();
                dateInputRef.current.click();
            }
        }
    };

    const handleCustomTimeClick = () => {
        if (timeInputRef.current) {
            if (timeInputRef.current.showPicker) {
                timeInputRef.current.showPicker();
            } else {
                timeInputRef.current.focus();
                timeInputRef.current.click();
            }
        }
    };

    const handleContinue = () => {
        if (selectedDate && selectedTime) {
            navigate('/upload-prescription', {
                state: {
                    serviceType,
                    price,
                    date: selectedDate,
                    time: selectedTime,
                    nurse,          // Pass nurse
                    isRebooking,    // Pass isRebooking flag
                    isIVService,    // Pass isIVService flag
                    isPackage,      // Pass isPackage flag
                    packageDetails, // Pass package details
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
                    <h1 className="text-lg font-bold text-slate-900">Schedule Service</h1>
                    <div className="w-10" />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-5 py-6 space-y-6 pb-32">
                {/* Service Summary */}
                <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-4 border border-primary/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase">Selected Service</p>
                            <h3 className="text-lg font-bold text-slate-900 mt-1">{serviceType}</h3>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-extrabold text-primary">{price}</p>
                        </div>
                    </div>
                </div>

                {/* Date Selection */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        <h2 className="text-base font-bold text-slate-900">Select Date</h2>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
                        {dates.map((date) => (
                            <button
                                key={date.fullDate}
                                onClick={() => setSelectedDate(date.fullDate)}
                                className={cn(
                                    'flex flex-col items-center justify-center min-w-[70px] h-[90px] rounded-2xl border-2 transition-all shrink-0',
                                    selectedDate === date.fullDate
                                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                        : 'bg-white border-slate-200 text-slate-700 hover:border-primary/30 active:scale-95'
                                )}
                            >
                                <span className={cn(
                                    'text-xs font-semibold uppercase',
                                    selectedDate === date.fullDate ? 'text-white/80' : 'text-slate-500'
                                )}>
                                    {date.day}
                                </span>
                                <span className="text-2xl font-extrabold my-1">{date.date}</span>
                                <span className={cn(
                                    'text-xs font-medium',
                                    selectedDate === date.fullDate ? 'text-white/80' : 'text-slate-500'
                                )}>
                                    {date.month}
                                </span>
                                {date.isToday && (
                                    <span className={cn(
                                        'text-[9px] font-bold uppercase mt-1',
                                        selectedDate === date.fullDate ? 'text-white' : 'text-primary'
                                    )}>
                                        Today
                                    </span>
                                )}
                            </button>
                        ))}

                        {/* Custom Date Picker */}
                        <div
                            onClick={handleCustomDateClick}
                            className={cn(
                                "relative flex flex-col items-center justify-center min-w-[70px] h-[90px] rounded-2xl border-2 border-slate-200 bg-white text-slate-700 shrink-0 cursor-pointer overflow-hidden transition-all active:scale-95",
                                selectedDate && !dates.some(d => d.fullDate === selectedDate) ? "border-primary bg-primary/5" : "hover:border-primary/30"
                            )}
                        >
                            <input
                                ref={dateInputRef}
                                type="date"
                                className="absolute inset-0 opacity-0 w-full h-full z-0"
                                onChange={(e) => {
                                    if (e.target.value) setSelectedDate(e.target.value);
                                }}
                                min={new Date().toISOString().split('T')[0]}
                            />

                            <div className="flex flex-col items-center pointer-events-none z-10">
                                <Calendar className={cn(
                                    "w-6 h-6 mb-1",
                                    selectedDate && !dates.some(d => d.fullDate === selectedDate) ? "text-primary" : "text-slate-400"
                                )} />
                                <span className={cn(
                                    "text-[10px] font-bold uppercase whitespace-nowrap",
                                    selectedDate && !dates.some(d => d.fullDate === selectedDate) ? "text-primary" : "text-slate-500"
                                )}>
                                    {selectedDate && !dates.some(d => d.fullDate === selectedDate)
                                        ? new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                        : "Custom"
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Time Selection */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        <h2 className="text-base font-bold text-slate-900">Select Time Slot</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {timeSlots.map((slot) => (
                            <button
                                key={slot.id}
                                onClick={() => slot.available && setSelectedTime(slot.time)}
                                disabled={!slot.available}
                                className={cn(
                                    'h-14 rounded-xl font-bold text-sm transition-all border-2',
                                    !slot.available
                                        ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                                        : selectedTime === slot.time
                                            ? 'bg-primary border-primary text-white shadow-md shadow-primary/20'
                                            : 'bg-white border-slate-200 text-slate-700 hover:border-primary/30 active:scale-95'
                                )}
                            >
                                {slot.time}
                            </button>
                        ))}

                        {/* Custom Time Picker */}
                        <div
                            onClick={handleCustomTimeClick}
                            className={cn(
                                "relative h-14 rounded-xl border-2 border-slate-200 bg-white overflow-hidden cursor-pointer transition-all active:scale-95",
                                selectedTime && !timeSlots.some(t => t.time === selectedTime) ? "border-primary bg-primary/5" : "hover:border-primary/30"
                            )}
                        >
                            <input
                                ref={timeInputRef}
                                type="time"
                                className="absolute inset-0 opacity-0 w-full h-full z-0"
                                onChange={(e) => {
                                    const time = e.target.value;
                                    if (!time) return;

                                    const [hours, minutes] = time.split(':');
                                    let h = parseInt(hours, 10);
                                    if (isNaN(h)) return;

                                    const ampm = h >= 12 ? 'PM' : 'AM';
                                    h = h % 12 || 12;
                                    const formattedTime = `${h.toString().padStart(2, '0')}:${minutes} ${ampm}`;
                                    setSelectedTime(formattedTime);
                                }}
                            />
                            <div className="flex items-center justify-center w-full h-full pointer-events-none z-10">
                                <span className={cn(
                                    "font-bold text-sm",
                                    selectedTime && !timeSlots.some(t => t.time === selectedTime) ? "text-primary" : "text-slate-700"
                                )}>
                                    {selectedTime && !timeSlots.some(t => t.time === selectedTime)
                                        ? selectedTime
                                        : "Custom"
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Selected Summary */}
                {selectedDate && selectedTime && (
                    <div className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Your Appointment</p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">
                                        {new Date(selectedDate).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    <p className="text-xs font-medium text-slate-500">{selectedTime}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                        </div>
                    </div>
                )}
            </main>

            {/* Bottom Action */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-5 max-w-[430px] mx-auto w-full">
                <button
                    onClick={handleContinue}
                    disabled={!selectedDate || !selectedTime}
                    className={cn(
                        'w-full h-14 rounded-2xl font-bold text-base shadow-lg transition-all',
                        selectedDate && selectedTime
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
