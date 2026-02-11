import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Check, Clock, Gift, AlertCircle, Calendar, Heart } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Notifications() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('all');

    const [notifications, setNotifications] = useState([
        {
            id: '1',
            type: 'booking',
            icon: Calendar,
            color: 'bg-primary',
            title: 'Booking Confirmed',
            message: 'Your nursing service for today at 8:00 PM has been confirmed',
            time: '5 mins ago',
            read: false,
            action: 'View Details',
        },
        {
            id: '2',
            type: 'offer',
            icon: Gift,
            color: 'bg-purple-500',
            title: 'Special Offer!',
            message: 'Get 20% off on your next health checkup. Valid till tomorrow',
            time: '1 hour ago',
            read: false,
            action: 'Claim Now',
        },
        {
            id: '3',
            type: 'reminder',
            icon: Bell,
            color: 'bg-secondary',
            title: 'Medication Reminder',
            message: 'Time to take your evening medication - Aspirin 100mg',
            time: '2 hours ago',
            read: true,
            action: 'Mark Taken',
        },
        {
            id: '4',
            type: 'health',
            icon: Heart,
            color: 'bg-red-500',
            title: 'Health Tip',
            message: 'Stay hydrated! Drink at least 8 glasses of water daily',
            time: '3 hours ago',
            read: true,
            action: null,
        },
        {
            id: '5',
            type: 'alert',
            icon: AlertCircle,
            color: 'bg-orange-500',
            title: 'Service Update',
            message: 'Your nurse is on the way. ETA: 15 minutes',
            time: '5 hours ago',
            read: true,
            action: 'Track',
        },
        {
            id: '6',
            type: 'booking',
            icon: Check,
            color: 'bg-emerald-500',
            title: 'Service Completed',
            message: 'Your 12hr nurse shift has been completed successfully',
            time: '1 day ago',
            read: true,
            action: 'Rate Service',
        },
    ]);

    const tabs = [
        { id: 'all', label: 'All', count: notifications.length },
        { id: 'unread', label: 'Unread', count: notifications.filter(n => !n.read).length },
    ];

    const filteredNotifications = activeTab === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications;

    const markAllRead = () => {
        setNotifications([]);
    };

    const markAsRead = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const handleAction = (notification) => {
        markAsRead(notification.id);

        switch (notification.action) {
            case 'View Details':
                navigate('/bookings');
                break;
            case 'Claim Now':
                navigate('/membership-plans');
                break;
            case 'Track':
                navigate('/service-tracking', {
                    state: {
                        serviceType: 'Nursing Care',
                        providerName: 'Sister Priya Sharma'
                    }
                });
                break;
            case 'Mark Taken':
                alert('Medication marked as taken!');
                break;
            case 'Rate Service':
                alert('Thank you for your feedback!');
                break;
            default:
                break;
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 pt-12 pb-4 px-5">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Notifications</h1>
                    <button
                        onClick={markAllRead}
                        className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                        Mark all read
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 bg-slate-100 rounded-xl p-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'flex-1 py-2 rounded-lg text-sm font-bold transition-all',
                                activeTab === tab.id
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                            )}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={cn(
                                    'ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                                    activeTab === tab.id ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'
                                )}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-5 py-4 space-y-3 pb-24">
                {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="flex size-20 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
                            <Bell className="w-10 h-10" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No Notifications</h3>
                        <p className="text-sm font-medium text-slate-500 mt-2">
                            You're all caught up!
                        </p>
                    </div>
                ) : (
                    filteredNotifications.map((notification) => {
                        const Icon = notification.icon;
                        return (
                            <div
                                key={notification.id}
                                onClick={() => markAsRead(notification.id)}
                                className={cn(
                                    'bg-white rounded-2xl p-4 shadow-soft border transition-all hover:shadow-md cursor-pointer',
                                    notification.read ? 'border-slate-100' : 'border-primary/20 bg-primary/5'
                                )}
                            >
                                <div className="flex gap-3">
                                    <div className={cn('flex size-12 items-center justify-center rounded-xl text-white shrink-0', notification.color)}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className="text-sm font-bold text-slate-900">{notification.title}</h3>
                                            {!notification.read && (
                                                <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                                            )}
                                        </div>
                                        <p className="text-xs font-medium text-slate-600 leading-relaxed">
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-xs font-medium">{notification.time}</span>
                                            </div>
                                            {notification.action && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAction(notification);
                                                    }}
                                                    className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                                                >
                                                    {notification.action}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </main>
        </div>
    );
}
