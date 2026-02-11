import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, TrendingUp, Award, Zap, ShoppingBag, Heart, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

const tabs = ['Credits', 'Rewards', 'Transactions'];

const transactions = [
    { id: 1, title: 'Nurse Visit Booking', amount: -499, date: 'Oct 20, 2023', type: 'debit' },
    { id: 2, title: 'Referral Bonus', amount: 200, date: 'Oct 18, 2023', type: 'credit' },
    { id: 3, title: 'Medicine Order', amount: -350, date: 'Oct 15, 2023', type: 'debit' },
    { id: 4, title: 'Health Checkup Cashback', amount: 150, date: 'Oct 12, 2023', type: 'credit' },
];

const rewards = [
    {
        id: 1,
        title: '10% Off Next Booking',
        description: 'Valid on nursing services',
        points: 500,
        icon: Gift,
        color: 'primary',
    },
    {
        id: 2,
        title: 'Free Health Checkup',
        description: 'Comprehensive vitals check',
        points: 1000,
        icon: Heart,
        color: 'secondary',
    },
    {
        id: 3,
        title: '₹200 Wallet Credit',
        description: 'Add to your wallet balance',
        points: 800,
        icon: Zap,
        color: 'primary',
    },
];

export default function HealthWallet() {
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState('Credits');

    const walletBalance = 1250;
    const loyaltyPoints = 3420;
    const currentTier = 'Gold';
    const nextTier = 'Platinum';
    const pointsToNextTier = 580;

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-gradient-to-br from-primary via-primary to-secondary pt-12 pb-6 px-5">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex size-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-white">
                        Health Wallet & Rewards
                    </h1>
                    <button className="flex size-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white">
                        <Gift className="w-5 h-5" />
                    </button>
                </div>

                {/* Wallet Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
                                WALLET BALANCE
                            </p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-extrabold text-white">
                                    ₹{walletBalance.toLocaleString()}
                                </span>
                                <span className="text-sm font-semibold text-white/70">.00</span>
                            </div>
                        </div>
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                            <ShoppingBag className="w-7 h-7 text-white" />
                        </div>
                    </div>

                    <div className="h-px bg-white/20 my-4" />

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
                                LOYALTY TIER
                            </p>
                            <div className="flex items-center gap-2">
                                <Award className="w-5 h-5 text-yellow-300" />
                                <span className="text-xl font-extrabold text-white">{currentTier}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
                                POINTS
                            </p>
                            <span className="text-xl font-extrabold text-white">
                                {loyaltyPoints.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Progress to Next Tier */}
                    <div className="mt-4 bg-white/10 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-white/80">
                                {pointsToNextTier} points to {nextTier}
                            </span>
                            <TrendingUp className="w-4 h-4 text-white/80" />
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500"
                                style={{ width: '85%' }}
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="px-5 py-4">
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
            </div>

            {/* Main Content */}
            <main className="flex-1 px-5 pb-24">
                {selectedTab === 'Credits' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                QUICK ACTIONS
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100/50 hover:border-primary/30 transition-all">
                                <div className="flex size-12 items-center justify-center rounded-xl bg-teal-50 mb-3">
                                    <Plus className="w-6 h-6 text-primary" />
                                </div>
                                <h4 className="text-sm font-bold text-slate-900">Add Money</h4>
                                <p className="text-xs font-medium text-slate-500 mt-1">
                                    Top up your wallet
                                </p>
                            </button>
                            <button className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100/50 hover:border-primary/30 transition-all">
                                <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 mb-3">
                                    <Gift className="w-6 h-6 text-secondary" />
                                </div>
                                <h4 className="text-sm font-bold text-slate-900">Redeem</h4>
                                <p className="text-xs font-medium text-slate-500 mt-1">
                                    Use your points
                                </p>
                            </button>
                        </div>
                    </div>
                )}

                {selectedTab === 'Rewards' && (
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                            AVAILABLE REWARDS
                        </h3>
                        {rewards.map((reward) => {
                            const Icon = reward.icon;
                            return (
                                <div
                                    key={reward.id}
                                    className="bg-white rounded-2xl p-5 shadow-soft border border-slate-100/50"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={cn(
                                            'flex size-12 items-center justify-center rounded-xl',
                                            reward.color === 'primary' ? 'bg-teal-50' : 'bg-blue-50'
                                        )}>
                                            <Icon className={cn('w-6 h-6', reward.color === 'primary' ? 'text-primary' : 'text-secondary')} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-base font-bold text-slate-900 leading-tight">
                                                {reward.title}
                                            </h4>
                                            <p className="text-sm font-medium text-slate-500 mt-1">
                                                {reward.description}
                                            </p>
                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-sm font-bold text-primary">
                                                    {reward.points} points
                                                </span>
                                                <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">
                                                    Redeem
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {selectedTab === 'Transactions' && (
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                            RECENT ACTIVITY
                        </h3>
                        {transactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100/50 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        'flex size-10 items-center justify-center rounded-lg',
                                        transaction.type === 'credit' ? 'bg-emerald-50' : 'bg-slate-50'
                                    )}>
                                        <span className="text-lg">
                                            {transaction.type === 'credit' ? '↓' : '↑'}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">
                                            {transaction.title}
                                        </h4>
                                        <p className="text-xs font-medium text-slate-500">
                                            {transaction.date}
                                        </p>
                                    </div>
                                </div>
                                <span className={cn(
                                    'text-base font-extrabold',
                                    transaction.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'
                                )}>
                                    {transaction.type === 'credit' ? '+' : ''}₹{Math.abs(transaction.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
