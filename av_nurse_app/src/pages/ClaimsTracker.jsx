import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Filter } from 'lucide-react';
import { cn } from '../lib/utils';

const tabs = ['Active', 'Past'];

const activeClaims = [
    {
        id: 1,
        hospital: 'Apollo Hospital, Chennai',
        claimId: 'CLM-8823190',
        amount: 45000,
        status: 'UNDER REVIEW',
        statusColor: 'orange',
        submittedDate: '2 DAYS AGO',
        progress: 50,
        currentStep: 'MEDICAL REVIEW',
        steps: ['DOCS VERIFIED', 'MEDICAL REVIEW', 'SETTLEMENT'],
        message: 'Medical officer is reviewing the discharge summary.',
        logo: '🏥',
    },
    {
        id: 2,
        hospital: 'Max Healthcare, Delhi',
        claimId: 'CLM-9901422',
        amount: 112500,
        status: 'PROCESSING',
        statusColor: 'blue',
        submittedDate: '1 WEEK AGO',
        progress: 80,
        currentStep: 'SETTLEMENT PROGRESS',
        steps: ['DOCS VERIFIED', 'MEDICAL REVIEW', 'SETTLEMENT'],
        message: 'Next: Bank account credit initiation.',
        progressText: '80%',
        logo: '🏥',
    },
];

const pastClaims = [
    {
        id: 3,
        hospital: 'Fortis Hospital, Mumbai',
        claimId: 'CLM-7712345',
        amount: 28000,
        status: 'SETTLED',
        statusColor: 'emerald',
        settledDate: '2 WEEKS AGO',
        logo: '🏥',
    },
];

export default function ClaimsTracker() {
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState('Active');

    const claims = selectedTab === 'Active' ? activeClaims : pastClaims;

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
                        Claims Tracker
                    </h1>
                    <button className="flex size-10 items-center justify-center rounded-full bg-white shadow-soft text-slate-700">
                        <Filter className="w-5 h-5" />
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
            <main className="flex-1 px-5 py-4 space-y-4 pb-32">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {selectedTab === 'Active' ? `ACTIVE CLAIMS (${activeClaims.length})` : 'RECENTLY SETTLED'}
                    </h3>
                    {selectedTab === 'Past' && (
                        <button className="text-sm font-bold text-primary">VIEW ALL</button>
                    )}
                </div>

                {claims.map((claim) => (
                    <div
                        key={claim.id}
                        className="bg-white rounded-2xl p-5 shadow-premium border border-slate-100/50 space-y-4"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <div className="flex size-12 items-center justify-center rounded-xl bg-teal-50">
                                    <span className="text-2xl">{claim.logo}</span>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                                        {claim.hospital}
                                    </h3>
                                    <p className="text-xs font-semibold text-slate-500 mt-1">
                                        ID: {claim.claimId} • ₹{claim.amount.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <span
                                className={cn(
                                    'px-2 py-1 rounded text-[10px] font-bold uppercase',
                                    claim.statusColor === 'orange' && 'bg-orange-50 text-orange-600',
                                    claim.statusColor === 'blue' && 'bg-blue-50 text-blue-600',
                                    claim.statusColor === 'emerald' && 'bg-emerald-50 text-emerald-600'
                                )}
                            >
                                {claim.status}
                            </span>
                        </div>

                        {/* Progress for Active Claims */}
                        {selectedTab === 'Active' && claim.steps && (
                            <>
                                {/* Progress Bar */}
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-2">
                                        {claim.steps.map((step, index) => (
                                            <div
                                                key={index}
                                                className={cn(
                                                    'flex size-8 items-center justify-center rounded-full text-xs font-bold z-10',
                                                    index === 0 || (index === 1 && claim.progress >= 50)
                                                        ? 'bg-primary text-white'
                                                        : index === 1 && claim.progress < 50
                                                            ? 'bg-primary/20 text-primary border-2 border-primary'
                                                            : 'bg-slate-200 text-slate-400'
                                                )}
                                            >
                                                {index === 0 || (index === 1 && claim.progress >= 50) ? '✓' : index + 1}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="absolute top-4 left-0 right-0 h-1 bg-slate-200 -z-0">
                                        <div
                                            className="h-full bg-primary transition-all"
                                            style={{ width: `${claim.progress}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        {claim.steps.map((step, index) => (
                                            <span
                                                key={index}
                                                className={cn(
                                                    'text-[9px] font-bold uppercase tracking-wider',
                                                    index <= 1 ? 'text-primary' : 'text-slate-400'
                                                )}
                                            >
                                                {step}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="bg-blue-50 rounded-xl p-3 flex items-start gap-2">
                                    <span className="text-secondary">ℹ️</span>
                                    <p className="text-xs font-semibold text-slate-700">
                                        {claim.message}
                                    </p>
                                </div>

                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    SUBMITTED {claim.submittedDate}
                                </p>
                            </>
                        )}

                        {/* Past Claims Info */}
                        {selectedTab === 'Past' && (
                            <p className="text-xs font-semibold text-emerald-600">
                                ✓ Settled {claim.settledDate}
                            </p>
                        )}
                    </div>
                ))}
            </main>

            {/* Floating Add Button */}
            <button
                onClick={() => navigate('/file-claim')}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-[390px] bg-primary text-white px-6 py-4 rounded-2xl text-base font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" />
                File New Claim
            </button>
        </div>
    );
}
