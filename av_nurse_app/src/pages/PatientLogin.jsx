import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

const FEATURES = [
    { icon: '🏥', title: 'Home Nursing', desc: 'Certified nurses at your doorstep' },
    { icon: '💊', title: 'Medicine Delivery', desc: 'Medicines delivered in 2 hours' },
    { icon: '🧪', title: 'Lab Tests', desc: 'Sample collection from home' },
    { icon: '🚑', title: '24/7 Emergency', desc: 'Round-the-clock support' },
];

const clearUserSession = () => {
    ['userRole', 'userData', 'patientData', 'nurseData', 'doctorData', 'adminData', 'userProfile', 'profilePhoto', 'loyaltyPoints', 'loyaltyReward', 'token'].forEach(k => localStorage.removeItem(k));
};

export default function PatientLogin() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const returnTo = location.state?.returnTo || '/home';
    const returnState = location.state?.returnState;

    // ── Tab: 'signin' | 'signup'
    const [tab, setTab] = useState(location.state?.tab || 'signin');
    const message = location.state?.message || '';

    // ── Sign-in state
    const [method, setMethod] = useState('mobile');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [step, setStep] = useState('input');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(45);

    // ── Sign-up state
    const [su, setSu] = useState({
        full_name: '', email: '', phone: '', password: '', confirm: '', gender: '', dob: '',
    });
    const [showSuPass, setShowSuPass] = useState(false);
    const [showSuConfirm, setShowSuConfirm] = useState(false);
    const [signupDone, setSignupDone] = useState(false);

    // ── Common
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let t;
        if (step === 'otp' && timer > 0) t = setInterval(() => setTimer(p => p - 1), 1000);
        return () => clearInterval(t);
    }, [step, timer]);

    // ────────────────────────────────────── SIGN IN
    const handleSignIn = async () => {
        clearUserSession();
        setLoading(true);
        try {
            if (method === 'email') {
                const r = await login(email, password);
                if (r?.success) { navigate(returnTo, { state: returnState }); return; }
                setError(r?.message || 'Sign in failed.');
            } else {
                if (step === 'input') {
                    setStep('otp'); setTimer(45); setLoading(false); return;
                }
                localStorage.setItem('userRole', 'Patient');
                localStorage.setItem('patientData', JSON.stringify({ role: 'Patient', phone: mobile, name: r.user?.user_metadata?.full_name || r.user?.user_metadata?.name || 'Patient' }));
                navigate(returnTo, { state: returnState });
            }
        } catch { /* ignore */ }
        setLoading(false);
    };

    const handleOtp = (i, v) => {
        if (!/^\d?$/.test(v)) return;
        const n = [...otp]; n[i] = v; setOtp(n);
        if (v && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
    };

    // ────────────────────────────────────── SIGN UP
    const handleSignUp = async () => {
        clearUserSession();
        setError(''); setLoading(true);
        clearUserSession();
        const { full_name, email: semail, phone, password: spass, gender, dob } = su;

        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: semail,
                password: spass,
                options: { data: { full_name, role: 'patient', password: spass } },
            });

            // Account was created (data.user is set)
            const userId = authData?.user?.id;
            if (userId) {
                // 1. Store in central 'users' table FIRST (dependency)
                // Include 'name' as it is required in schema.sql
                const { error: userError } = await supabase.from('users').upsert([{
                    id: userId,
                    email: semail.trim(),
                    password: spass,
                    name: full_name.trim(),
                    role: 'patient'
                }], { onConflict: 'id' });

                if (userError) {
                    console.error('Core user record creation failed:', userError);
                } else {
                    // 2. Store profile in DB (only if user record succeeded)
                    await supabase.from('patient_profiles').upsert([{
                        user_id: userId,
                        full_name: full_name.trim(),
                        email: semail.trim(),
                        phone: phone.trim(),
                        password: spass, // Store raw password
                        gender: gender || null,
                        date_of_birth: dob || null,
                    }], { onConflict: 'user_id' });
                }
            }

            // Store in localStorage for session
            localStorage.setItem('userRole', 'Patient');
            localStorage.setItem('patientData', JSON.stringify({
                role: 'Patient',
                email: semail,
                name: full_name
            }));
            // If Supabase returned a session (email confirmation OFF) → auto sign-in
            if (authData?.session) {
                localStorage.setItem('token', authData.session.access_token);
                navigate(returnTo, { state: returnState }); return;
            }

            // Email confirmation required — try manual sign-in anyway
            try {
                const r = await login(semail, spass);
                if (r?.success) { navigate(returnTo, { state: returnState }); return; }
            } catch (_) { /* ignore */ }

            // Show success and tell them to confirm email if needed
            setSignupDone(true);

        } catch (err) {
            console.error('Signup error:', err);
            setError('Something went wrong. Please try again.');
        }
        setLoading(false);
    };

    const switchTab = (t) => { setTab(t); setError(''); setSignupDone(false); };

    // ────────────────────────────────────── RENDER
    return (
        <div className="min-h-screen flex" style={{ fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}>

            {/* ── Form Panel ── */}
            <div className="flex-1 flex flex-col bg-white order-2 lg:order-1">
                {/* Top bar */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-black font-semibold text-sm transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back to Home
                    </button>
                    <span className="text-xs text-slate-400 font-medium">Need help? <a href="#" className="text-teal-600 font-semibold hover:underline">Contact support</a></span>
                </div>

                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="w-full max-sm:px-4 max-w-sm">

                        {/* ── Header */}
                        <div className="mb-7">
                            <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-3xl mb-5 border border-teal-100">👤</div>
                            <h2 className="text-2xl font-extrabold text-black mb-1">
                                {tab === 'signup' ? 'Create account' : 'Welcome back'}
                            </h2>
                            <p className="text-slate-500 text-sm font-medium">
                                {tab === 'signup' ? 'Join Healnest as a patient' : 'Sign in to your patient account'}
                            </p>
                        </div>

                        {/* ── Sign In / Sign Up toggle */}
                        <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
                            {[{ id: 'signin', label: '→ Sign In' }, { id: 'signup', label: '+ Sign Up' }].map(t => (
                                <button key={t.id} onClick={() => switchTab(t.id)}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tab === t.id ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* ── Redirect Message */}
                        {message && (
                            <div className="mb-5 flex items-center gap-2.5 p-3.5 bg-sky-50 border border-sky-200 rounded-xl text-sky-800 text-sm font-semibold">
                                <span className="text-base">ℹ️</span> {message}
                            </div>
                        )}

                        {/* ── Error */}
                        {error && (
                            <div className="mb-5 flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
                                <span className="text-base">⚠️</span> {error}
                            </div>
                        )}

                        {/* ════════════════ SIGN IN ════════════════ */}
                        {tab === 'signin' && (
                            <>
                                {/* Method tabs */}
                                <div className="flex bg-slate-50 border border-slate-100 rounded-xl p-1 mb-5">
                                    {[{ id: 'mobile', label: 'Mobile OTP' }, { id: 'email', label: 'Email' }].map(m => (
                                        <button key={m.id} onClick={() => { setMethod(m.id); setStep('input'); setError(''); }}
                                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${method === m.id ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                            {m.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    {method === 'mobile' && step === 'input' && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Mobile Number</label>
                                            <div className="flex items-center border-2 border-slate-100 rounded-xl focus-within:border-teal-500 bg-slate-50 transition-colors overflow-hidden">
                                                <span className="px-4 text-sm font-bold text-slate-600 border-r-2 border-slate-200 h-12 flex items-center">+91</span>
                                                <input type="tel" value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/, ''))}
                                                    onKeyDown={e => e.key === 'Enter' && handleSignIn()} placeholder="98765 43210" maxLength={10}
                                                    className="flex-1 h-12 px-4 bg-transparent outline-none text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal" />
                                            </div>
                                        </div>
                                    )}

                                    {method === 'mobile' && step === 'otp' && (
                                        <div className="space-y-4">
                                            <div className="text-center p-3 bg-teal-50 rounded-xl border border-teal-100">
                                                <p className="text-sm font-semibold text-slate-600">OTP sent to <span className="text-teal-700 font-bold">+91 {mobile}</span></p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">Enter 6-digit OTP</label>
                                                <div className="flex gap-2">
                                                    {otp.map((d, i) => (
                                                        <input key={i} id={`otp-${i}`} type="text" maxLength={1} value={d}
                                                            onChange={e => handleOtp(i, e.target.value)}
                                                            onKeyDown={e => e.key === 'Backspace' && !d && i > 0 && document.getElementById(`otp-${i - 1}`)?.focus()}
                                                            className="flex-1 h-12 text-center text-lg font-extrabold border-2 border-slate-100 focus:border-teal-500 rounded-xl outline-none bg-slate-50 transition-colors" />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center text-xs font-semibold">
                                                <button onClick={() => { setStep('input'); setOtp(['', '', '', '', '', '']); }} className="text-slate-400 hover:text-slate-700 transition-colors">← Change number</button>
                                                <span className={`font-bold ${timer <= 10 ? 'text-red-500' : 'text-teal-600'}`}>
                                                    {timer > 0 ? `Resend in ${timer}s` : <button className="text-teal-600 hover:underline" onClick={() => setTimer(45)}>Resend OTP</button>}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {method === 'email' && (
                                        <>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Email Address</label>
                                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                                                    className="w-full h-12 px-4 border-2 border-slate-100 focus:border-teal-500 rounded-xl outline-none bg-slate-50 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-colors" />
                                            </div>
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">Password</label>
                                                    <a href="#" className="text-xs font-semibold text-teal-600 hover:underline">Forgot password?</a>
                                                </div>
                                                <div className="relative">
                                                    <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && handleSignIn()} placeholder="••••••••••"
                                                        className="w-full h-12 px-4 pr-11 border-2 border-slate-100 focus:border-teal-500 rounded-xl outline-none bg-slate-50 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-colors" />
                                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                        {showPass
                                                            ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                                            : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <button onClick={handleSignIn} disabled={loading}
                                        className="w-full h-12 bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-700 hover:to-teal-900 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-teal-900/10 disabled:opacity-60 flex items-center justify-center gap-2">
                                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> :
                                            method === 'mobile' && step === 'input' ? '→  Send OTP' : '→  Sign In'}
                                    </button>
                                </div>

                                <p className="text-center text-xs text-slate-500 font-medium mt-6">
                                    Don't have an account?{' '}
                                    <button onClick={() => switchTab('signup')} className="text-teal-600 font-bold hover:underline">Sign up free</button>
                                </p>
                            </>
                        )}

                        {/* ════════════════ SIGN UP ════════════════ */}
                        {tab === 'signup' && !signupDone && (
                            <>
                                <div className="space-y-4">
                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Full Name *</label>
                                        <input type="text" value={su.full_name} onChange={e => setSu(p => ({ ...p, full_name: e.target.value }))}
                                            placeholder="Jane Doe"
                                            className="w-full h-12 px-4 border-2 border-slate-100 focus:border-teal-500 rounded-xl outline-none bg-slate-50 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-colors" />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Email Address *</label>
                                        <input type="email" value={su.email} onChange={e => setSu(p => ({ ...p, email: e.target.value }))}
                                            placeholder="you@example.com"
                                            className="w-full h-12 px-4 border-2 border-slate-100 focus:border-teal-500 rounded-xl outline-none bg-slate-50 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-colors" />
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Phone Number *</label>
                                        <div className="flex items-center border-2 border-slate-100 rounded-xl focus-within:border-teal-500 bg-slate-50 transition-colors overflow-hidden">
                                            <span className="px-4 text-sm font-bold text-slate-600 border-r-2 border-slate-200 h-12 flex items-center">+91</span>
                                            <input type="tel" value={su.phone} onChange={e => setSu(p => ({ ...p, phone: e.target.value.replace(/\D/, '') }))}
                                                placeholder="98765 43210" maxLength={10}
                                                className="flex-1 h-12 px-4 bg-transparent outline-none text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal" />
                                        </div>
                                    </div>

                                    {/* Gender + DOB side by side */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Gender</label>
                                            <select value={su.gender} onChange={e => setSu(p => ({ ...p, gender: e.target.value }))}
                                                className="w-full h-12 px-4 border-2 border-slate-100 focus:border-teal-500 rounded-xl outline-none bg-slate-50 text-sm font-semibold text-slate-700 transition-colors">
                                                <option value="">Select</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Date of Birth</label>
                                            <input type="date" value={su.dob} onChange={e => setSu(p => ({ ...p, dob: e.target.value }))}
                                                className="w-full h-12 px-4 border-2 border-slate-100 focus:border-teal-500 rounded-xl outline-none bg-slate-50 text-sm font-semibold text-slate-700 transition-colors" />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Password *</label>
                                        <div className="relative">
                                            <input type={showSuPass ? 'text' : 'password'} value={su.password}
                                                onChange={e => setSu(p => ({ ...p, password: e.target.value }))} placeholder="Min 6 characters"
                                                className="w-full h-12 px-4 pr-11 border-2 border-slate-100 focus:border-teal-500 rounded-xl outline-none bg-slate-50 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-colors" />
                                            <button type="button" onClick={() => setShowSuPass(!showSuPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                {showSuPass
                                                    ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                                    : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Confirm Password *</label>
                                        <div className="relative">
                                            <input type={showSuConfirm ? 'text' : 'password'} value={su.confirm}
                                                onChange={e => setSu(p => ({ ...p, confirm: e.target.value }))} placeholder="Re-enter password"
                                                onKeyDown={e => e.key === 'Enter' && handleSignUp()}
                                                className="w-full h-12 px-4 pr-11 border-2 border-slate-100 focus:border-teal-500 rounded-xl outline-none bg-slate-50 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-colors" />
                                            <button type="button" onClick={() => setShowSuConfirm(!showSuConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                {showSuConfirm
                                                    ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                                    : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                                            </button>
                                        </div>
                                    </div>

                                    <button onClick={handleSignUp} disabled={loading}
                                        className="w-full h-12 bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-700 hover:to-teal-900 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-teal-900/10 disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
                                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '+ Create Account'}
                                    </button>
                                </div>

                                <p className="text-center text-xs text-slate-500 font-medium mt-5">
                                    Already have an account?{' '}
                                    <button onClick={() => switchTab('signin')} className="text-teal-600 font-bold hover:underline">Sign in</button>
                                </p>
                            </>
                        )}

                        {/* ════════════════ SUCCESS STATE ════════════════ */}
                        {tab === 'signup' && signupDone && (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">✅</div>
                                <h3 className="text-xl font-extrabold text-black mb-2">Account Created!</h3>
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-left">
                                    <p className="text-sm font-bold text-amber-800 mb-1">📧 Confirm your email</p>
                                    <p className="text-xs text-amber-700 leading-relaxed">
                                        A confirmation link was sent to <strong>{su.email}</strong>.<br />
                                        Click it in your inbox, then come back and sign in.
                                    </p>
                                </div>
                                <button onClick={() => switchTab('signin')}
                                    className="w-full h-12 bg-gradient-to-r from-teal-600 to-teal-800 text-white font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                                    → Sign In Now
                                </button>
                                <p className="text-xs text-slate-400 mt-3">Can't find the email? Check your spam folder.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Hero Panel ── */}
            <div className="hidden lg:flex w-5/12 flex-col bg-teal-900 relative overflow-hidden order-1 lg:order-2">
                <div className="absolute -top-24 -left-24 w-80 h-80 bg-white/5 rounded-full" />
                <div className="absolute top-1/2 -right-16 w-56 h-56 bg-white/5 rounded-full" />
                <div className="absolute -bottom-20 left-1/3 w-64 h-64 bg-white/5 rounded-full" />
                <div className="relative z-10 flex flex-col h-full p-12">
                    <div className="flex items-center gap-3 mb-auto">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🏥</div>
                        <span className="text-white font-extrabold text-lg tracking-tight">Healnest</span>
                    </div>
                    <div className="mb-12">
                        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
                            <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                            <span className="text-white/80 text-xs font-semibold">Patient Portal</span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-white leading-tight mb-3">
                            Your health,<br />
                            <span className="text-teal-300">our priority.</span>
                        </h1>
                        <p className="text-teal-100/70 text-base font-medium leading-relaxed">
                            Access bookings, medical records, and professional nursing care — all in one place.
                        </p>
                    </div>
                    <div className="space-y-3">
                        {FEATURES.map((f) => (
                            <div key={f.title} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3.5 hover:border-teal-500/30 transition-colors group">
                                <span className="text-2xl">{f.icon}</span>
                                <div>
                                    <p className="text-white font-bold text-sm group-hover:text-teal-300 transition-colors">{f.title}</p>
                                    <p className="text-teal-100/60 text-xs">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-teal-300/50 text-xs font-medium mt-10">Trusted by 15,000+ patients across India</p>
                </div>
            </div>
        </div>
    );
}
