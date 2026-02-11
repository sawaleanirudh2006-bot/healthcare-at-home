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

        // Apply to document
        if (newDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleLanguageChange = (newLang) => {
        setLanguage(newLang);
        localStorage.setItem('language', newLang);
        alert(`Language changed to ${newLang === 'en' ? 'English' : newLang === 'hi' ? 'Hindi' : 'Spanish'}`);
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

        // Save new password (in real app, this would be API call)
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        userData.password = passwordData.newPassword;
        localStorage.setItem('userData', JSON.stringify(userData));

        alert('Password changed successfully!');
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const languages = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
        { code: 'es', name: 'Español', flag: '🇪🇸' }
    ];

    const helpOptions = [
        { icon: Phone, label: 'Call Support', value: '+91 1800-123-4567', action: 'tel:+911800123456' },
        { icon: Mail, label: 'Email Support', value: 'support@carehome.com', action: 'mailto:support@carehome.com' },
        { icon: MessageCircle, label: 'Live Chat', value: 'Chat with us', action: null }
    ];

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 pt-12 pb-4 px-5">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/profile')}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">Settings</h1>
                    <div className="w-10" />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-5 py-6 space-y-6">
                {/* Appearance */}
                <div className="space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                        Appearance
                    </h2>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {darkMode ? (
                                    <Moon className="w-5 h-5 text-primary" />
                                ) : (
                                    <Sun className="w-5 h-5 text-amber-500" />
                                )}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Dark Mode</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        {darkMode ? 'Enabled' : 'Disabled'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleDarkModeToggle}
                                className={`w-14 h-8 rounded-full transition-all ${darkMode ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                                    }`}
                            >
                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${darkMode ? 'translate-x-7' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                        Security
                    </h2>
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="w-full bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 hover:border-primary dark:hover:border-primary transition-all text-left active:scale-[0.99]"
                    >
                        <div className="flex items-center gap-3">
                            <Lock className="w-5 h-5 text-primary" />
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Change Password</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Update your account password
                                </p>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Language */}
                <div className="space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                        Language
                    </h2>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-2">
                        {languages.map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${language === lang.code
                                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                    }`}
                            >
                                <span className="text-2xl">{lang.flag}</span>
                                <div className="flex-1 text-left">
                                    <p className={`text-sm font-bold ${language === lang.code ? 'text-primary' : 'text-slate-900 dark:text-white'
                                        }`}>
                                        {lang.name}
                                    </p>
                                </div>
                                {language === lang.code && (
                                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Help & Support */}
                <div className="space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                        Help & Support
                    </h2>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3">
                        {helpOptions.map((option, idx) => {
                            const Icon = option.icon;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        if (option.action) {
                                            if (option.action.startsWith('tel:') || option.action.startsWith('mailto:')) {
                                                window.location.href = option.action;
                                            }
                                        } else {
                                            alert('Live chat feature coming soon!');
                                        }
                                    }}
                                    className="w-full p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-primary dark:hover:border-primary transition-all text-left active:scale-[0.99] flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                                        <Icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{option.label}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{option.value}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* FAQ */}
                <div className="space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                        Resources
                    </h2>
                    <button
                        onClick={() => alert('FAQ page coming soon!')}
                        className="w-full bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 hover:border-primary dark:hover:border-primary transition-all text-left active:scale-[0.99]"
                    >
                        <div className="flex items-center gap-3">
                            <HelpCircle className="w-5 h-5 text-primary" />
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">FAQ</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Frequently asked questions
                                </p>
                            </div>
                        </div>
                    </button>
                </div>
            </main>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
                    <div className="bg-white dark:bg-slate-900 rounded-t-3xl w-full max-w-[430px] p-6 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Change Password</h2>
                            <button
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                }}
                                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 block">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    placeholder="Enter current password"
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 block">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    placeholder="Enter new password"
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 block">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    placeholder="Confirm new password"
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                }}
                                className="flex-1 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePasswordChange}
                                className="flex-1 h-12 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
                            >
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
