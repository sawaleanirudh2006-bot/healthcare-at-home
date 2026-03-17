import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const REWARD_THRESHOLD = 500;

// Helper: get real user data from any localStorage key our signup/login sets
function loadUserData() {
    const profile = localStorage.getItem('userProfile');
    const ud = localStorage.getItem('patientData');
    if (ud) {
        const u = JSON.parse(ud);
        return { name: u.name || u.full_name || '', phone: u.phone || '', email: u.email || '', avatar: u.avatar || null };
    }
    return { name: '', phone: '', email: '', avatar: null };
}

const Profile = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [patientData] = useState(() => loadUserData());
    const [uploading, setUploading] = useState(false);

    let storedPoints = localStorage.getItem('loyaltyPoints');
    if (storedPoints === 'NaN' || !storedPoints) {
        storedPoints = '0';
        localStorage.setItem('loyaltyPoints', '0');
    }
    const loyaltyPoints = parseInt(storedPoints, 10) || 0;
    const loyaltyReward = localStorage.getItem('loyaltyReward');
    const progressPct = isNaN(loyaltyPoints) ? 0 : Math.min((loyaltyPoints / REWARD_THRESHOLD) * 100, 100);



    const [photoUrl, setPhotoUrl] = useState(
        patientData.avatar || localStorage.getItem('profilePhoto') ||
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBh5GT-z5R38SjS9_OLHXXHnj9n0WRGrX9uqty9UxMyYfeQ-AR5aIMRTa3dqAqvFlnSYNjVBuXwwf8PkOmfpun-6t7dPZ_v5hCJ96a0vES4FLGb8N062dnXXoQlHdgKcRkhz4pWDF_-8SyKgx_vr2JTk06ggjHlRQJKnAB-3_CtV5XH5Lir25bJHgGfCrABc9XTCQFBE5yq7jn5xkDeXb03i68jSL8l64iAELwTQ8yw-YKnJbxWnRfR9jL5F0e569cldjsfySwDuA'
    );

    const handleLogout = async () => {
        const confirmed = window.confirm('Are you sure you want to logout?');
        if (confirmed) {
            // Sign out of Supabase
            await supabase.auth.signOut();
            // Clear ALL user-specific localStorage keys so next user starts fresh
            ['userRole', 'userData', 'patientData', 'nurseData', 'doctorData', 'adminData', 'userProfile', 'profilePhoto', 'loyaltyPoints', 'loyaltyReward', 'token'].forEach(k => localStorage.removeItem(k));
            navigate('/');
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show local preview immediately
        const localUrl = URL.createObjectURL(file);
        setPhotoUrl(localUrl);
        setUploading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id || 'guest';

            const ext = file.name.split('.').pop();
            const path = `profiles/${userId}/avatar.${ext}`;

            const { error: uploadError } = await supabase.storage
                .from('prescriptions') // reuse existing bucket
                .upload(path, file, { upsert: true });

            if (!uploadError) {
                const { data: urlData } = supabase.storage
                    .from('prescriptions')
                    .getPublicUrl(path);
                const publicUrl = urlData?.publicUrl;
                if (publicUrl) {
                    setPhotoUrl(publicUrl);
                    localStorage.setItem('profilePhoto', publicUrl);
                }
            } else {
                // Fallback: just keep the local blob URL saved to localStorage
                localStorage.setItem('profilePhoto', localUrl);
            }
        } catch (_) {
            localStorage.setItem('profilePhoto', localUrl);
        } finally {
            setUploading(false);
        }
    };

    const [searchQuery, setSearchQuery] = useState('');

    const menuItems = [
        { icon: 'group', label: 'Family Members', path: '/family-members', color: 'text-primary bg-primary/10', keywords: ['family', 'members', 'add'] },
        { icon: 'location_on', label: 'Saved Addresses', path: '/manage-addresses', color: 'text-emerald-500 bg-emerald-500/10', keywords: ['address', 'home', 'location'] },
        { icon: 'favorite', label: 'My Vitals', path: '/vitals', color: 'text-rose-500 bg-rose-500/10', keywords: ['vitals', 'health', 'pulse', 'bp'] },
        { icon: 'description', label: 'Health Records', path: '/health-records', color: 'text-blue-500 bg-blue-500/10', keywords: ['records', 'reports', 'prescription'] },
        { icon: 'payments', label: 'Payments', path: '/bookings', color: 'text-amber-500 bg-amber-500/10', keywords: ['payments', 'history', 'money'] },
        { icon: 'settings', label: 'Settings', path: '/settings', color: 'text-text-muted bg-slate-500/10', keywords: ['settings', 'account', 'edit'] },
        { icon: 'logout', label: 'Logout', action: handleLogout, color: 'text-red-500 bg-red-500/10', keywords: ['logout', 'signout'] },
    ];

    const filteredItems = searchQuery.trim() === ''
        ? menuItems
        : menuItems.filter(item =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.keywords && item.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())))
        );

    return (
        <div className="bg-background min-h-screen pb-24">
            <header className="pt-14 pb-8 px-6 bg-surface border-b border-border-subtle relative">
                <div className="flex flex-col items-center">
                    {/* Avatar with upload button */}
                    <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="size-24 rounded-full border-4 border-white shadow-premium overflow-hidden bg-background">
                            <img
                                alt="Profile"
                                className="h-full w-full object-cover"
                                src={photoUrl}
                            />
                        </div>

                        {/* Uploading overlay */}
                        {uploading && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full z-10">
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}

                        {/* Camera badge */}
                        {!uploading && (
                            <div className="absolute bottom-0 right-0 z-20 p-2 bg-primary rounded-full text-white border-2 border-white shadow-md pointer-events-none">
                                <span className="material-symbols-outlined text-[15px] leading-none">photo_camera</span>
                            </div>
                        )}

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            id="profile-photo-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoChange}
                        />
                    </div>

                    <h1 className="text-xl font-bold text-slate-900 mt-4">{patientData.name || 'Your Name'}</h1>
                    <p className="text-sm font-medium text-slate-500">{patientData.phone || patientData.email || ''}</p>

                    {/* Edit Profile Button */}
                    <button
                        onClick={() => navigate('/edit-profile')}
                        className="mt-3 flex items-center gap-1.5 px-4 py-1.5 bg-teal-50 border border-teal-200 text-teal-700 text-sm font-bold rounded-full hover:bg-teal-100 transition-colors active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        Edit Profile
                    </button>

                    {/* Tap to change label */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="mt-1 text-xs font-semibold text-primary/70 hover:text-primary transition-colors disabled:opacity-40"
                    >
                        {uploading ? 'Uploading…' : 'Tap to change photo'}
                    </button>
                </div>
            </header>

            <main className="px-5 py-6 space-y-4">
                {/* Search Bar */}
                <div className="relative mb-2">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                    <input
                        className="h-12 w-full rounded-2xl border-none bg-background pl-11 pr-10 text-[14px] text-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 outline-none"
                        placeholder="Search for doctors, records, settings..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold hover:text-slate-600"
                        >✕</button>
                    )}
                </div>

                {/* Loyalty Points Card */}
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-4 text-white shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider opacity-80">CarePoints Balance</p>
                            <p className="text-3xl font-extrabold">{loyaltyPoints.toLocaleString()} <span className="text-base font-semibold opacity-80">pts</span></p>
                        </div>
                        <div className="w-12 h-12 bg-surface/20 rounded-xl flex items-center justify-center text-2xl">⭐</div>
                    </div>
                    {loyaltyReward ? (
                        <div className="bg-surface/20 rounded-xl p-2.5 text-sm font-bold flex items-center gap-2">
                            🎁 Reward Unlocked: Free Short Visit!
                        </div>
                    ) : (
                        <>
                            <div className="w-full bg-surface/30 rounded-full h-2 mb-1">
                                <div className="bg-surface h-2 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                            </div>
                            <p className="text-xs opacity-80 font-medium">{REWARD_THRESHOLD - loyaltyPoints} more pts for a Free Short Visit 🎁</p>
                        </>
                    )}
                </div>

                <div className="bg-surface rounded-2xl p-2 shadow-sm border border-border-subtle">
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => item.action ? item.action() : navigate(item.path)}
                                className="w-full flex items-center justify-between p-4 hover:bg-background rounded-xl transition-colors group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`size-10 rounded-full flex items-center justify-center ${item.color}`}>
                                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                    </div>
                                    <span className="font-bold text-text-main text-sm">{item.label}</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-300 text-[20px] group-hover:text-primary transition-colors">chevron_right</span>
                            </button>
                        ))
                    ) : (
                        <div className="p-8 text-center text-text-muted">
                            <p className="text-sm font-medium">No results found for "{searchQuery}"</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Profile;
