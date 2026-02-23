import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Lock, Globe, HelpCircle, Mail, Phone, MessageCircle } from 'lucide-react';

const Settings = () => {
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        if (savedDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        return savedDarkMode;
    });

    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('language') || 'en';
    });

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleDarkModeToggle = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem('darkMode', newDarkMode.toString());

        if (newDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleLanguageChange = (newLang) => {
        setLanguage(newLang);
        localStorage.setItem('language', newLang);
    };

    const handlePasswordChange = () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            alert('Please fill all password fields');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        userData.password = passwordData.newPassword;
        localStorage.setItem('userData', JSON.stringify(userData));

        alert('Password changed successfully!');
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const languages = [
        { code: 'en', name: 'English', flag: 'GB' },
        { code: 'hi', name: 'हिंदी', flag: 'IN' },
        { code: 'es', name: 'Español', flag: 'ES' }
    ];

    const helpOptions = [
        { icon: Phone, label: 'Call Support', value: '+91 1800-123-4567', action: 'tel:+911800123456' },
        { icon: Mail, label: 'Email Support', value: 'support@carehome.com', action: 'mailto:support@carehome.com' },
        { icon: MessageCircle, label: 'Live Chat', value: 'Chat with us', action: null }
    ];

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-white/10 pt-12 pb-6 px-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/profile')}
                        className="flex size-11 items-center justify-center rounded-full bg-surface dark:bg-white/5 text-text-main shadow-soft active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-extrabold tracking-tight text-text-main">Settings</h1>
                    <div className="w-11" />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-6 py-8 space-y-8">
                {/* Appearance */}
                <div className="bg-surface rounded-3xl p-6 shadow-premium border border-border-subtle">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-xl ${darkMode ? 'bg-primary/10 text-primary' : 'bg-amber-50 text-amber-500'}`}>
                                {darkMode ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-text-main">Dark Mode</h3>
                                <p className="text-xs font-medium text-text-muted mt-0.5">
                                    {darkMode ? 'Enabled' : 'Disabled'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleDarkModeToggle}
                            className={`w-14 h-8 rounded-full transition-all relative ${darkMode ? 'bg-primary' : 'bg-slate-200'}`}
                        >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${darkMode ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                </div>

                {/* Security */}
                <div className="space-y-4">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted px-1">
                        Security
                    </h2>
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="w-full bg-surface rounded-3xl p-6 shadow-premium border border-border-subtle hover:border-primary/30 transition-all text-left active:scale-[0.99]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                <Lock className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-text-main">Change Password</h3>
                                <p className="text-xs font-medium text-text-muted mt-0.5">
                                    Update your account password
                                </p>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Language */}
                <div className="space-y-4">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted px-1">
                        Language
                    </h2>
                    <div className="bg-surface dark:bg-[#10192d] rounded-3xl p-4 shadow-premium border border-white/5 space-y-3">
                        {languages.map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${language === lang.code
                                    ? 'border-primary bg-primary/5'
                                    : 'border-transparent bg-background/50 hover:bg-background'
                                    }`}
                            >
                                <span className={`text-sm font-bold w-8 ${language === lang.code ? 'text-primary' : 'text-text-muted'}`}>
                                    {lang.flag}
                                </span>
                                <span className={`flex-1 text-left text-sm font-bold ${language === lang.code ? 'text-text-main' : 'text-text-muted'}`}>
                                    {lang.name}
                                </span>
                                {language === lang.code && (
                                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                                        <span className="text-white text-[10px] font-black">✓</span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Help & Support */}
                <div className="space-y-4">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted px-1">
                        Help & Support
                    </h2>
                    <div className="bg-surface rounded-3xl p-4 shadow-premium border border-border-subtle space-y-3">
                        {helpOptions.map((option, idx) => {
                            const Icon = option.icon;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => option.action ? window.location.href = option.action : alert('Coming soon!')}
                                    className="w-full p-4 rounded-2xl bg-background/50 hover:bg-background transition-all text-left active:scale-[0.99] flex items-center gap-4"
                                >
                                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                        <Icon className="w-5 h-5 font-bold" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-text-main">{option.label}</h3>
                                        <p className="text-xs font-medium text-text-muted mt-0.5">{option.value}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center backdrop-blur-sm">
                    <div className="bg-surface rounded-t-[40px] w-full max-w-[430px] p-8 space-y-6 pb-12 shadow-2xl border-t border-white/10 animate-in slide-in-from-bottom duration-300">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-text-main tracking-tight">Change Password</h2>
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-text-muted hover:text-text-main transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {[
                                { id: 'current', label: 'Current Password', value: 'currentPassword' },
                                { id: 'new', label: 'New Password', value: 'newPassword' },
                                { id: 'confirm', label: 'Confirm New Password', value: 'confirmPassword' }
                            ].map((field) => (
                                <div key={field.id} className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-wider text-text-muted ml-1">
                                        {field.label}
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData[field.value]}
                                        onChange={(e) => setPasswordData({ ...passwordData, [field.value]: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full h-14 px-5 rounded-2xl bg-background border border-border-subtle text-text-main placeholder:text-text-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="flex-1 h-14 rounded-2xl bg-background text-text-main font-bold hover:bg-slate-200 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePasswordChange}
                                className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
