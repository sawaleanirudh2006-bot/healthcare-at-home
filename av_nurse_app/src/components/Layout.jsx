import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';

const Layout = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    // List of paths where BottomNav should be hidden
    const hideNavPaths = [
        '/login',
        '/login/admin',
        '/login/doctor',
        '/login/nurse',
        '/login/patient',
        '/role-selection'
    ];

    const shouldShowNav = !hideNavPaths.includes(currentPath);

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto shadow-2xl overflow-x-hidden">
            <main className={`flex-1 ${shouldShowNav ? 'pb-24' : ''} overflow-y-auto hide-scrollbar`}>
                <Outlet />
            </main>

            {shouldShowNav && <BottomNav />}
        </div>
    );
};

export default Layout;
