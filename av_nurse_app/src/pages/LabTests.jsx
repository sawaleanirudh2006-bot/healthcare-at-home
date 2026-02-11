import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, FlaskConical, Microscope, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

const labTests = [
    {
        id: 1,
        name: 'Full Body Health Checkup',
        description: 'Includes CBC, Lipid Profile, Liver Function, Kidney Function, and more.',
        price: '₹1499',
        discount: '60% OFF',
        icon: '🩺',
        color: 'bg-blue-50 text-blue-600',
    },
    {
        id: 2,
        name: 'Thyroid Profile (T3, T4, TSH)',
        description: 'Screening for thyroid dysfunction.',
        price: '₹499',
        discount: '40% OFF',
        icon: '🧪',
        color: 'bg-purple-50 text-purple-600',
    },
    {
        id: 3,
        name: 'Diabetes Screening (HbA1c)',
        description: 'Average blood sugar levels over past 3 months.',
        price: '₹399',
        discount: '30% OFF',
        icon: '🩸',
        color: 'bg-rose-50 text-rose-600',
    },
    {
        id: 4,
        name: 'Vitamin Deficiency Panel',
        description: 'Check Vitamin D, B12, and Iron levels.',
        price: '₹999',
        discount: '50% OFF',
        icon: '☀️',
        color: 'bg-orange-50 text-orange-600',
    },
    {
        id: 5,
        name: 'Complete Blood Count (CBC)',
        description: 'Overall health check including infection screening.',
        price: '₹299',
        discount: '20% OFF',
        icon: '🔬',
        color: 'bg-emerald-50 text-emerald-600',
    },
];

export default function LabTests() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTests = labTests.filter(test =>
        test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto pb-24">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 pt-12 pb-4 px-5">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Lab Tests</h1>
                    <button className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for tests, packages..."
                        className="w-full h-12 pl-12 pr-4 bg-slate-50 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
            </header>

            <main className="flex-1 px-5 py-6 space-y-6">
                {/* About Lab Tests - ADDRESSING USER REQUEST */}
                <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
                    <div className="flex items-start gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-white shrink-0">
                            <FlaskConical className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">About Lab Tests</h3>
                            <p className="text-xs font-medium text-slate-600 mt-1 leading-relaxed">
                                Book certified lab tests from the comfort of your home.
                                Samples are collected by trained phlebotomists and reports are delivered digitally within 24 hours.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Popular Tests */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Popular Tests</h2>
                    </div>

                    {filteredTests.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-slate-500 font-medium">No tests found</p>
                        </div>
                    ) : (
                        filteredTests.map((test) => (
                            <div key={test.id} className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100 hover:border-primary/20 transition-all group">
                                <div className="flex items-start gap-4">
                                    <div className={cn("flex size-12 items-center justify-center rounded-xl text-2xl shrink-0", test.color)}>
                                        {test.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{test.name}</h3>
                                            <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full whitespace-nowrap ml-2">
                                                {test.discount}
                                            </span>
                                        </div>
                                        <p className="text-xs font-medium text-slate-500 mt-1 line-clamp-2">
                                            {test.description}
                                        </p>
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-sm font-bold text-slate-900">{test.price}</span>
                                            <button
                                                onClick={() => navigate('/schedule-datetime', {
                                                    state: {
                                                        serviceType: test.name,
                                                        price: test.price,
                                                        nurse: {
                                                            name: 'Apollo Diagnostics',
                                                            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1MtFgDy8y1BMS6HtAWzUMBXRlRSSfFTLQY_W_6kcUGvwmSaN2xzTt_stiqg6HuhVVRj9HD7ZILJRc_LuAq1RyF_yw3wXWCko4fUx9jguLRsjKK3bxNrivRsogBmHorWbO-MEvIIuKNixLU_LPU24pRBY9O5fLALfn0A6orx51T5CT0JN4Bi-g0KrW_O1HfGiwP05-Ngmd62EI4Y4BI6OUpbTGTqEJUtgF8A-wG7mmzv37vjg1yzExdhFWDMAwWuj0xvOrl_i0ew',
                                                            rating: 4.9,
                                                            specialization: 'Diagnostic Center'
                                                        },
                                                        isRebooking: true // Skip nurse assignment for lab tests
                                                    }
                                                })}
                                                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 active:scale-95 transition-all"
                                            >
                                                Book
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
