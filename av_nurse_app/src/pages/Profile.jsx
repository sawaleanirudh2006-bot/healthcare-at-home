import React from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        const confirmed = window.confirm('Are you sure you want to logout?');
        if (confirmed) {
            localStorage.removeItem('userRole');
            localStorage.removeItem('userData');
            navigate('/role-selection');
        }
    };

    const menuItems = [
        { icon: 'group', label: 'Family Members', path: '/family-members', color: 'text-primary bg-primary/10' },
        { icon: 'location_on', label: 'Saved Addresses', path: '/manage-addresses', color: 'text-emerald-500 bg-emerald-500/10' },
        { icon: 'favorite', label: 'My Vitals', path: '/vitals', color: 'text-rose-500 bg-rose-500/10' },
        { icon: 'description', label: 'Health Records', path: '/health-records', color: 'text-blue-500 bg-blue-500/10' },
        { icon: 'payments', label: 'Payments', path: '/bookings', color: 'text-amber-500 bg-amber-500/10' },
        { icon: 'settings', label: 'Settings', path: '/settings', color: 'text-slate-500 bg-slate-500/10' },
        { icon: 'logout', label: 'Logout', action: handleLogout, color: 'text-red-500 bg-red-500/10' },
    ];

    return (
        <div className="bg-background min-h-screen pb-24">
            <header className="pt-14 pb-8 px-6 bg-white border-b border-slate-100 relative">
                <button
                    onClick={() => navigate('/notifications')}
                    className="absolute top-14 right-6 flex size-10 items-center justify-center rounded-full bg-slate-50 text-slate-600 border border-slate-100 relative hover:bg-slate-100 active:scale-95 transition-all"
                >
                    <span className="material-symbols-outlined text-[20px]">notifications</span>
                    <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-accent-red animate-pulse"></span>
                </button>
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <div className="size-24 rounded-full border-4 border-white shadow-premium overflow-hidden">
                            <img alt="Profile" className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBh5GT-z5R38SjS9_OLHXXHnj9n0WRGrX9uqty9UxMyYfeQ-AR5aIMRTa3dqAqvFlnSYNjVBuXwwf8PkOmfpun-6t7dPZ_v5hCJ96a0vES4FLGb8N062dnXXoQlHdgKcRkhz4pWDF_-8SyKgx_vr2JTk06ggjHlRQJKnAB-3_CtV5XH5Lir25bJHgGfCrABc9XTCQFBE5yq7jn5xkDeXb03i68jSL8l64iAELwTQ8yw-YKnJbxWnRfR9jL5F0e569cldjsfySwDuA" />
                        </div>
                        <button
                            onClick={() => navigate('/edit-profile')}
                            className="absolute bottom-0 right-0 p-1.5 bg-primary rounded-full text-white border-2 border-white cursor-pointer hover:bg-primary/90 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                    </div>
                    <h1 className="text-xl font-extrabold text-slate-900 mt-4">Arjun Sharma</h1>
                    <p className="text-slate-500 text-sm font-medium">+91 98765 43210</p>
                </div>
            </header>

            <main className="px-5 py-6 space-y-4">
                <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => item.action ? item.action() : navigate(item.path)}
                            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`size-10 rounded-full flex items-center justify-center ${item.color}`}>
                                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                </div>
                                <span className="font-bold text-slate-700 text-sm">{item.label}</span>
                            </div>
                            <span className="material-symbols-outlined text-slate-300 text-[20px] group-hover:text-primary transition-colors">chevron_right</span>
                        </button>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default Profile;
