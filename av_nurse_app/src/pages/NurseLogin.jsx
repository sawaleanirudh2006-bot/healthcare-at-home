import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

const NURSE_PERKS = [
    { icon: '📅', title: 'View Your Shifts', desc: 'See upcoming and past assignments' },
    { icon: '👤', title: 'Patient Details', desc: 'Access patient info before each visit' },
    { icon: '📝', title: 'Add Care Notes', desc: 'Log post-visit notes for doctors' },
    { icon: '💰', title: 'Track Earnings', desc: 'View your completed jobs & revenue' },
];

const clearUserSession = () => {
    ['userRole', 'userData', 'patientData', 'nurseData', 'doctorData', 'adminData', 'userProfile', 'profilePhoto', 'loyaltyPoints', 'loyaltyReward', 'token'].forEach(k => localStorage.removeItem(k));
};

export default function NurseLogin() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
    const [method, setMethod] = useState('email'); // 'email' | 'mobile'
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [step, setStep] = useState('input');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(45);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let t;
        if (step === 'otp' && timer > 0) t = setInterval(() => setTimer(p => p - 1), 1000);
        return () => clearInterval(t);
    }, [step, timer]);

    const handleOtp = (i, v) => {
        if (!/^\d?$/.test(v)) return;
        const n = [...otp]; n[i] = v; setOtp(n);
        if (v && i < 5) document.getElementById(`notp-${i + 1}`)?.focus();
    };

    const handleSignIn = async () => {
        clearUserSession();
        setLoading(true);
        try {
            if (method === 'email') {
                const r = await login(email, password);
                if (r?.success) {
                    await handlePostLoginRedirect(r.user);
                    return;
                }
                localStorage.setItem('userRole', 'Nurse');
                localStorage.setItem('nurseData', JSON.stringify({ role: 'Nurse', email, name: r.user?.user_metadata?.full_name || r.user?.user_metadata?.name || 'Nurse' }));
                navigate('/nurse/dashboard');
            } else {
                if (step === 'input') {
                    setStep('otp'); setTimer(45); setLoading(false); return;
                }
                localStorage.setItem('userRole', 'Nurse');
                localStorage.setItem('nurseData', JSON.stringify({ role: 'Nurse', phone: mobile, name: 'Nurse' }));
                navigate('/nurse/dashboard');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async () => {
        clearUserSession();
        setLoading(true);
        try {
            const { data: authData } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: fullName, role: 'nurse', password: password } }
            });
            // Store email + name in nurse_profiles immediately
            const userId = authData?.user?.id;
            if (userId) {
                // 1. Store in central 'users' table FIRST (dependency)
                const { error: userError } = await supabase.from('users').upsert([{
                    id: userId,
                    name: fullName,
                    email,
                    password,
                    role: 'nurse'
                }], { onConflict: 'id' });

                if (userError) {
                    console.error('Core user record creation failed:', userError);
                } else {
                    // 2. Store in nurse_profiles
                    await supabase.from('nurse_profiles').upsert([{
                        user_id: userId,
                        full_name: fullName,
                        email,
                        password: password, // Store raw password
                        verification_status: 'pending',
                    }], { onConflict: 'user_id' });
                }
            }
        } catch (err) {
            console.warn('Signup background error (ignored):', err.message);
        }
        // Always proceed
        localStorage.setItem('userRole', 'Nurse');
        localStorage.setItem('nurseData', JSON.stringify({ role: 'Nurse', email, name: fullName }));
        setLoading(false);
        navigate('/nurse/verify');
    };

    const handlePostLoginRedirect = async (user) => {
        try {
            const { data: profile, error } = await supabase
                .from('nurse_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error("Error fetching nurse profile:", error);
                navigate('/nurse/dashboard');
                return;
            }

            if (!profile) {
                navigate('/nurse/verify');
            } else if (profile.verification_status === 'pending' || profile.verification_status === 'rejected') {
                navigate('/nurse/status');
            } else {
                navigate('/nurse/dashboard');
            }
        } catch (err) {
            console.error('Redirection error:', err);
            navigate('/nurse/dashboard');
        }
    };

    const EyeIcon = ({ show }) => show
        ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
        : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;

    return (
        <div className="min-h-screen flex" style={{ fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}>
            {/* ── Left Info Panel ── */}
            <div className="hidden lg:flex w-5/12 flex-col bg-teal-900 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-950/20 rounded-full" />

                {['💉', '🩺', '❤️', '🧤', '⚕️'].map((icon, i) => (
                    <span key={i} className="absolute text-3xl opacity-10"
                        style={{ top: `${12 + i * 18}%`, left: i % 2 === 0 ? '10%' : '75%', animation: `float ${2.5 + i * 0.4}s ease-in-out infinite alternate` }}>
                        {icon}
                    </span>
                ))}

                <div className="relative z-10 flex flex-col h-full p-12">
                    <div className="flex items-center gap-3 mb-auto">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl">💉</div>
                        <span className="text-white font-extrabold text-lg tracking-tight">Nurse Portal</span>
                    </div>

                    <div className="mb-10">
                        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
                            <span className="w-2 h-2 bg-teal-300 rounded-full animate-pulse" />
                            <span className="text-white text-xs font-semibold">Certified Nurses Only</span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-white leading-tight mb-3">
                            Care delivered<br />
                            <span className="text-teal-300">with heart.</span>
                        </h1>
                        <p className="text-teal-50/70 text-base font-medium leading-relaxed">
                            Your hub for patient assignments, shift tracking, and delivering quality care at home.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {NURSE_PERKS.map(f => (
                            <div key={f.title} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-teal-500/30 transition-colors group">
                                <span className="text-2xl">{f.icon}</span>
                                <div>
                                    <p className="text-white font-bold text-sm group-hover:text-teal-300 transition-colors">{f.title}</p>
                                    <p className="text-teal-100/60 text-xs">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="text-teal-300/50 text-xs font-medium mt-10">
                        500+ nurses serving patients across India
                    </p>
                </div>
            </div>

            {/* ── Right Form Panel ── */}
            <div className="flex-1 flex flex-col bg-white">
                <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-black font-semibold text-sm transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back to Home
                    </button>
                    <span className="text-xs text-slate-400 font-medium tracking-tight">For certified nurses only</span>
                </div>

                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="w-full max-sm:px-4 max-w-sm">
                        <div className="mb-6">
                            <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-3xl mb-5 border border-teal-100">
                                💉
                            </div>
                            <h2 className="text-2xl font-extrabold text-black mb-1">
                                {mode === 'signin' ? 'Good to see you!' : 'Join as a Nurse'}
                            </h2>
                            <p className="text-slate-500 text-sm font-medium">
                                {mode === 'signin' ? 'Sign in to view your shifts and patient assignments' : 'Create your account and complete verification to start working'}
                            </p>
                        </div>

                        {/* Sign In / Sign Up mode toggle */}
                        <div className="flex bg-slate-100 rounded-xl p-1 mb-5">
                            {[{ id: 'signin', label: '→ Sign In' }, { id: 'signup', label: '+ Sign Up' }].map(m => (
                                <button key={m.id} onClick={() => { setMode(m.id); setError(''); setStep('input'); }}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === m.id ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                    {m.label}
                                </button>
                            ))}
                        </div>

                        {/* Method tabs — only shown for sign in */}
                        {mode === 'signin' && (
                            <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
                                {[{ id: 'mobile', label: 'Mobile OTP' }, { id: 'email', label: 'Email' }].map(m => (
                                    <button key={m.id} onClick={() => { setMethod(m.id); setStep('input'); setError(''); }}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${method === m.id ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {error && (
                            <div className="mb-5 flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* ── SIGN UP FIELDS ── */}
                            {mode === 'signup' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Full Name</label>
                                        <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                                            placeholder="Jane Doe"
                                            className="w-full h-12 px-4 border-2 border-slate-100 focus:border-teal-500 rounded-xl outline-none bg-slate-50 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-colors" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Email Address</label>
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                            placeholder="nurse@nursehome.in"
                                            className="w-full h-12 px-4 border-2 border-slate-100 focus:border-teal-500 rounded-xl outline-none bg-slate-50 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-colors" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Password</label>
                                        <div className="relative">
                                            <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                                                placeholder="min. 6 characters"
                                                className="w-full h-12 px-4 pr-11 border-2 border-slate-100 focus:border-teal-500 rounded-xl outline-none bg-slate-50 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-colors" />
                                            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                                <EyeIcon show={showPass} />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Confirm Password</label>
                                        <div className="relative">
                                            <input type={showConfirmPass ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                                placeholder="••••••••••"
                                                className="w-full h-12 px-4 pr-11 border-2 border-slate-100 focus:border-teal-500 rounded-xl outline-none bg-slate-50 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-colors" />
                                            <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                                <EyeIcon show={showConfirmPass} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                                        <span className="text-amber-500 text-lg mt-0.5">📋</span>
                                        <div>
                                            <p className="text-amber-800 text-xs font-bold">Verification Required</p>
                                            <p className="text-amber-600 text-xs">After registration, you'll submit your nursing license and degree for admin review before accessing the portal.</p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* ── SIGN IN: MOBILE OTP ── */}
                            {mode === 'signin' && method === 'mobile' && step === 'input' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Mobile Number</label>
                                    <div className="flex items-center border-2 border-slate-100 rounded-xl focus-within:border-teal-500 bg-slate-50 transition-colors overflow-hidden">
                                        <span className="px-4 text-sm font-bold text-slate-600 border-r-2 border-slate-200 h-12 flex items-center">+91</span>
                                        <input type="tel" value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/, ''))} onKeyDown={e => e.key === 'Enter' && handleSignIn()} placeholder="98765 43210" maxLength={10}
                                            className="flex-1 h-12 px-4 bg-transparent outline-none text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal" />
                                    </div>
                                </div>
                            )}

                            {mode === 'signin' && method === 'mobile' && step === 'otp' && (
                                <div className="space-y-4">
                                    <div className="text-center p-3 bg-teal-50 rounded-xl border border-teal-100">
                                        <p className="text-sm font-semibold text-slate-600">OTP sent to <span className="text-teal-700 font-bold">+91 {mobile}</span></p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">Enter 6-digit OTP</label>
                                        <div className="flex gap-2">
                                            {otp.map((d, i) => (
                                                <input key={i} id={`notp-${i}`} type="text" maxLength={1} value={d}
                                                    onChange={e => handleOtp(i, e.target.value)}
                                                    onKeyDown={e => e.key === 'Backspace' && !d && i > 0 && document.getElementById(`notp-${i - 1}`)?.focus()}
                                                    className="flex-1 h-13 py-3 text-center text-lg font-extrabold border-2 border-slate-100 focus:border-teal-500 rounded-xl outline-none bg-slate-50 transition-colors"
                                                />
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

                            {/* ── SIGN IN: EMAIL ── */}
                            {mode === 'signin' && method === 'email' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Email Address</label>
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nurse@nursehome.in"
                                            className="w-full h-12 px-4 border-2 border-slate-100 focus:border-teal-500 rounded-xl outline-none bg-slate-50 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-colors" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">Password</label>
                                            <a href="#" className="text-xs font-semibold text-teal-600 hover:underline">Forgot password?</a>
                                        </div>
                                        <div className="relative">
                                            <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSignIn()} placeholder="••••••••••"
                                                className="w-full h-12 px-4 pr-11 border-2 border-slate-100 focus:border-teal-500 rounded-xl outline-none bg-slate-50 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-colors" />
                                            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                                <EyeIcon show={showPass} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            <button
                                onClick={mode === 'signin' ? handleSignIn : handleSignUp}
                                disabled={loading}
                                className="w-full h-12 bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-700 hover:to-teal-900 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-teal-900/10 hover:shadow-teal-900/20 disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> :
                                    mode === 'signup' ? '✓  Create Account & Verify' :
                                        method === 'mobile' && step === 'input' ? '→  Send OTP' : '→  Sign In'}
                            </button>
                        </div>

                        <p className="text-center text-xs text-slate-500 font-medium mt-6">
                            Not a nurse?{' '}
                            <button onClick={() => navigate('/')} className="text-teal-600 font-semibold hover:underline">Go to home page</button>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes float { from { transform: translateY(0); } to { transform: translateY(-12px); } }
            `}</style>
        </div>
    );
}
