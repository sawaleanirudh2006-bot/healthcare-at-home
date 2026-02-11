import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BottomNav = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;

    const isActive = (path) => currentPath === path;

    const navItems = [
        { path: '/', label: 'Home', icon: 'home' },
        { path: '/bookings', label: 'Bookings', icon: 'calendar_month' },
        { path: '/services', label: 'Services', icon: 'medical_services' },
        { path: '/profile', label: 'Profile', icon: 'person' },
    ];

    return (
        <nav className="fixed bottom-0 z-50 w-full max-w-[430px] bg-white/90 backdrop-blur-md border-t border-slate-100 pb-safe">
            <div className="flex h-16 items-center justify-around px-2">
                {navItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`flex flex-1 flex-col items-center gap-1 py-1 transition-colors ${isActive(item.path) ? 'text-primary' : 'text-slate-400'
                            }`}
                    >
                        <span
                            className={`material-symbols-outlined text-[24px] transition-all duration-300 ${isActive(item.path) ? 'icon-fill scale-110' : ''
                                }`}
                        >
                            {item.icon}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-tighter">
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>
            {/* Safe area spacer for bottom bar */}
            <div className="h-2 bg-transparent w-full"></div>
        </nav>
    );
};

export default BottomNav;
