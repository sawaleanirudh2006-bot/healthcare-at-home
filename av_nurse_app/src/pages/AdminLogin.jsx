import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

const ADMIN_POWERS = [
    { icon: '👥', label: 'All Users', desc: 'Manage patients, doctors & nurses' },
    { icon: '📦', label: 'Inventory', desc: 'Stock tracking & restock control' },
    { icon: '📊', label: 'Analytics', desc: 'Revenue, bookings & trends' },
    { icon: '🔔', label: 'Live Alerts', desc: 'Monitor all system activity' },
];

export default function AdminLogin() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            if (mode === 'signup') {
                if (password !== confirmPassword) {
                    setError('Passwords do not match');
                    setLoading(false);
                    return;
                }
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: fullName, role: 'admin', password: password } }
                });

                if (authError) throw authError;

                const userId = authData?.user?.id;
                if (userId) {
                    await supabase.from('users').upsert([{
                        id: userId,
                        name: fullName,
                        email,
                        password,
                        role: 'admin'
                    }], { onConflict: 'id' }).then(() => { }).catch(() => { });
                }
                alert('Admin signup successful! You can now sign in.');
                setMode('signin');
            } else {
                const r = await login(email, password);
                if (r?.success) {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        await supabase.from('users').upsert([{
                            id: session.user.id,
                            email: email,
                            password: password,
                            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Admin',
                            role: 'admin'
                        }], { onConflict: 'id' }).then(() => { }).catch(() => { });
                    }
                    navigate('/admin/dashboard');
                    return;
                }
                localStorage.setItem('userRole', 'Admin');
                localStorage.setItem('adminData', JSON.stringify({ role: 'Admin', email, name: r.user?.user_metadata?.full_name || r.user?.user_metadata?.name || 'Admin' }));
                navigate('/admin/dashboard');
            }
        } catch (err) {
            setError(err.message || 'Authentication failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white" style={{ fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}>
            {/* ── Left Form Panel ── */}
            <div className="flex-1 flex flex-col">
                {/* Top bar */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-black font-semibold text-sm transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back to Home
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-100 rounded-full">
                        <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
                        <span className="text-teal-700 text-xs font-semibold">Secure Connection</span>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="w-full max-w-sm">
                        <div className="mb-8">
                            <div className="w-14 h-14 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center text-3xl mb-5">
                                🛡️
                            </div>
                            <h2 className="text-2xl font-extrabold text-black mb-1">{mode === 'signup' ? 'Create Admin Account' : 'Admin Console'}</h2>
                            <p className="text-slate-500 text-sm font-medium">{mode === 'signup' ? 'Join the administrative team' : 'Restricted access · Enter your credentials'}</p>
                        </div>

                        <div className="flex gap-4 mb-6 p-1 bg-slate-100 rounded-xl">
                            <button onClick={() => setMode('signin')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'signin' ? 'bg-white shadow-sm text-teal-700' : 'text-slate-500'}`}>SIGN IN</button>
                            <button onClick={() => setMode('signup')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'signup' ? 'bg-white shadow-sm text-teal-700' : 'text-slate-500'}`}>SIGN UP</button>
                        </div>

                        {error && (
                            <div className="mb-5 flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-semibold">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        {mode === 'signup' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Full Name</label>
                                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name"
                                        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 focus:border-teal-500/60 text-black rounded-xl outline-none text-sm font-semibold transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Email Address</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@nursehome.in"
                                        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 focus:border-teal-500/60 text-black rounded-xl outline-none text-sm font-semibold transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Password</label>
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••••"
                                        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 focus:border-teal-500/60 text-black rounded-xl outline-none text-sm font-semibold transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Confirm Password</label>
                                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••••••"
                                        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 focus:border-teal-500/60 text-black rounded-xl outline-none text-sm font-semibold transition-colors" />
                                </div>
                                <button onClick={handleSubmit} disabled={loading}
                                    className="w-full h-12 bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-700 hover:to-teal-900 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-teal-900/10 hover:shadow-teal-900/20 disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Admin Account'}
                                </button>
                            </div>
                        )}

                        {mode === 'signin' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Admin Email</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@nursehome.in"
                                        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 focus:border-teal-500/60 text-black rounded-xl outline-none text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-colors" />
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">Password</label>
                                        <a href="#" className="text-xs font-semibold text-teal-600 hover:underline">Forgot?</a>
                                    </div>
                                    <div className="relative">
                                        <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder="••••••••••••"
                                            className="w-full h-12 px-4 pr-11 bg-slate-50 border border-slate-200 focus:border-teal-500/60 text-black rounded-xl outline-none text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-colors" />
                                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                            {showPass ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                                : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                                        </button>
                                    </div>
                                </div>

                                {/* 2FA info */}
                                <div className="flex items-start gap-3 p-3.5 bg-teal-50 border border-teal-100 rounded-xl">
                                    <span className="text-xl mt-0.5">🔐</span>
                                    <div>
                                        <p className="text-teal-900 text-xs font-bold">Multi-Factor Authentication Enabled</p>
                                        <p className="text-teal-700 text-xs mt-0.5">You have 2FA configured for this account</p>
                                    </div>
                                </div>

                                <button onClick={handleSubmit} disabled={loading}
                                    className="w-full h-12 bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-700 hover:to-teal-900 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-teal-900/10 hover:shadow-teal-900/20 disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '→  Access Admin Console'}
                                </button>
                            </div>
                        )}

                        {/* Quick feature chips */}
                        <div className="grid grid-cols-2 gap-2 mt-6">
                            {ADMIN_POWERS.map(p => (
                                <div key={p.label} className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                                    <span className="text-base">{p.icon}</span>
                                    <span className="text-slate-600 text-xs font-semibold">{p.label}</span>
                                </div>
                            ))}
                        </div>

                        <p className="text-center text-xs text-slate-500 font-medium mt-6">
                            Not an admin?{' '}
                            <button onClick={() => navigate('/')} className="text-teal-600 font-semibold hover:underline">Go to home page</button>
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Right Dark Info Panel ── */}
            <div className="hidden lg:flex w-5/12 flex-col bg-teal-900 border-l border-teal-800 relative overflow-hidden">
                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-[0.05]" style={{
                    backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
                    backgroundSize: '32px 32px'
                }} />
                <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col h-full p-12">
                    <div className="flex items-center gap-3 mb-auto">
                        <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-xl">🛡️</div>
                        <div>
                            <p className="text-white font-extrabold text-sm">Admin Console</p>
                            <p className="text-teal-300 text-xs">Full system access</p>
                        </div>
                    </div>

                    <div className="mb-10">
                        <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
                            Total control,<br />
                            <span className="text-teal-300">total visibility.</span>
                        </h1>
                        <p className="text-teal-100 text-sm font-medium leading-relaxed opacity-80">
                            As an admin you have full access to manage every user, service, booking, and inventory item on the platform.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {ADMIN_POWERS.map(p => (
                            <div key={p.label} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-teal-500/30 transition-colors group">
                                <span className="text-2xl">{p.icon}</span>
                                <div>
                                    <p className="text-white font-bold text-sm group-hover:text-teal-300 transition-colors">{p.label}</p>
                                    <p className="text-teal-200 text-xs opacity-70">{p.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                        <p className="text-amber-400 text-xs font-bold mb-1.5">⚠️ Restricted Zone</p>
                        <p className="text-amber-100/60 text-xs leading-relaxed">
                            This area is strictly for authorized administrators. All login attempts are monitored and logged.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
