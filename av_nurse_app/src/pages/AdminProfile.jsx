import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, HelpCircle, LogOut, Shield, Database, LayoutDashboard, ChevronRight, ArrowLeft } from 'lucide-react';

const AdminProfile = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        const confirmed = window.confirm('Are you sure you want to logout?');
        if (confirmed) {
            localStorage.removeItem('userRole');
            localStorage.removeItem('userData');
            navigate('/role-selection');
        }
    };

    const adminData = {
        name: 'System Admin',
        role: 'Super Administrator',
        id: 'ADMIN-001',
        email: 'admin@carehome.com',
        lastLogin: new Date().toLocaleString(),
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard Overview', path: '/admin/dashboard', color: 'text-purple-600 bg-purple-100' },
        { icon: Settings, label: 'System Settings', path: '/settings', color: 'text-slate-600 bg-slate-100' },
        { icon: HelpCircle, label: 'Support Center', path: '/help', state: { role: 'admin' }, color: 'text-blue-600 bg-blue-100' },
    ];

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-slate-50 max-w-[430px] mx-auto pb-24">
            {/* Header / Cover */}
            <div className="h-40 bg-gradient-to-r from-slate-700 to-slate-800 rounded-b-[2.5rem] relative shrink-0">
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="absolute top-6 left-6 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors z-10"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
            </div>

            {/* Profile Info */}
            <div className="px-5 -mt-16 flex flex-col items-center relative z-10">
                <div className="size-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-800 flex items-center justify-center mb-3">
                    <span className="text-4xl font-bold text-white">AD</span>
                </div>

                <h1 className="text-xl font-bold text-slate-900">{adminData.name}</h1>
                <p className="text-sm font-medium text-slate-500 mb-2">{adminData.role}</p>
                <div className="flex items-center gap-1.5 bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    <Shield className="w-3 h-3" />
                    System Access Level 1
                </div>
            </div>

            {/* Details Card */}
            <div className="px-5 mt-6 w-full">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Account Details</h3>

                    <div className="flex items-center gap-4 py-2 border-b border-slate-50 last:border-0">
                        <div className="p-2.5 bg-slate-50 rounded-xl text-slate-500">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-400">Admin ID</p>
                            <p className="text-sm font-bold text-slate-900">{adminData.id}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 py-2 border-b border-slate-50 last:border-0">
                        <div className="p-2.5 bg-slate-50 rounded-xl text-slate-500">
                            <Database className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-400">Database Access</p>
                            <p className="text-sm font-bold text-emerald-600">Full (Read/Write)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Options */}
            <div className="px-5 mt-6 space-y-3 w-full pb-8">
                {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={index}
                            onClick={() => navigate(item.path, { state: item.state })}
                            className="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group active:scale-[0.98] transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-xl ${item.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-slate-700">{item.label}</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                        </button>
                    );
                })}

                <button
                    onClick={handleLogout}
                    className="w-full bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center gap-4 active:scale-[0.98] transition-all group mt-6 shadow-sm hover:bg-red-100/50"
                >
                    <div className="p-2.5 rounded-xl bg-red-100 text-red-500 group-hover:bg-red-200 transition-colors">
                        <LogOut className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-red-600">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default AdminProfile;
