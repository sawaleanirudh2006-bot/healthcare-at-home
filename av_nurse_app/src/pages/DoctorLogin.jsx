import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

const DOCTOR_FEATURES = [
    { icon: '📋', title: 'Review Prescriptions', desc: 'Approve or reject patient prescriptions' },
    { icon: '✅', title: 'Booking Approvals', desc: 'Manage nursing service assignments' },
    { icon: '📝', title: 'Clinical Notes', desc: 'Add detailed medical notes per patient' },
    { icon: '📊', title: 'Patient Overview', desc: 'Track your patient history & statuses' },
];

const clearUserSession = () => {
    ['userRole', 'userData', 'patientData', 'nurseData', 'doctorData', 'adminData', 'userProfile', 'profilePhoto', 'loyaltyPoints', 'loyaltyReward', 'token'].forEach(k => localStorage.removeItem(k));
};

export default function DoctorLogin() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignIn = async () => {
        clearUserSession();
        setLoading(true);
        try {
            const r = await login(email, password);

            const { data: { session } } = await supabase.auth.getSession();
            const doctorName = session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || 'Doctor';

            localStorage.setItem('userRole', 'Doctor');
            localStorage.setItem('doctorData', JSON.stringify({ role: 'Doctor', email, name: doctorName }));

            if (session?.user) {
                const { data: profile, error: dbError } = await supabase
                    .from('doctor_profiles')
                    .select('verification_status')
                    .eq('user_id', session.user.id)
                    .single();

                if (dbError && dbError.code === 'PGRST116') {
                    navigate('/doctor/verify');
                    return;
                } else if (profile && profile.verification_status !== 'approved') {
                    localStorage.setItem('doctor_verification_status', profile.verification_status);
                    navigate('/doctor/status');
                    return;
                }
            }

            navigate('/doctor/dashboard');

        } catch {
            setError('Authentication failed. Please check your credentials.');
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
                options: { data: { full_name: fullName, role: 'doctor', password: password } }
            });
            // Store email + name in doctor_profiles immediately
            const userId = authData?.user?.id;
            if (userId) {
                // 1. Store in central 'users' table FIRST (dependency)
                const { error: userError } = await supabase.from('users').upsert([{
                    id: userId,
                    name: fullName,
                    email,
                    password,
                    role: 'doctor'
                }], { onConflict: 'id' });

                if (userError) {
                    console.error('Core user record creation failed:', userError);
                } else {
                    // 2. Store in doctor_profiles
                    await supabase.from('doctor_profiles').upsert([{
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
        localStorage.setItem('userRole', 'Doctor');
        localStorage.setItem('doctorData', JSON.stringify({ role: 'Doctor', email, name: fullName }));
        setLoading(false);
        navigate('/doctor/verify');
    };

    const EyeIcon = ({ show }) => show
        ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
        : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;

    return (
        <div className="min-h-screen flex" style={{ fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}>
            {/* ── Right Form Panel ── */}
            <div className="flex-1 flex flex-col bg-white order-2 lg:order-1">
                {/* Top bar */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-black font-semibold text-sm transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back to Home
                    </button>
                    <span className="text-xs text-slate-400 font-medium">Verified doctors only</span>
                </div>

                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="w-full max-sm:px-4 max-w-sm">
                        <div className="mb-6">
                            <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-3xl mb-5 border border-teal-100">
                                🩺
                            </div>
                            <h2 className="text-2xl font-extrabold text-black mb-1">
                                {mode === 'signin' ? 'Doctor Sign In' : 'Create Doctor Account'}
                            </h2>
                            <p className="text-slate-500 text-sm font-medium">
                                {mode === 'signin' ? 'Access your doctor portal and manage patients' : 'Register and complete your verification to get started'}
                            </p>
                        </div>

                        {/* Mode Toggle */}
                        <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
                            {[{ id: 'signin', label: '→ Sign In' }, { id: 'signup', label: '+ Sign Up' }].map(m => (
                                <button key={m.id} onClick={() => { setMode(m.id); setError(''); }}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === m.id ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                    {m.label}
                                </button>
                            ))}
                        </div>

                        {error && (
                            <div className="mb-5 flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
                                <span className="text-base">⚠️</span> {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Sign-Up: Full Name field */}
                            {mode === 'signup' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        placeholder="Dr. Jane Smith"
                                        className="w-full h-12 px-4 border-2 border-slate-100 focus:border-teal-500 rounded-xl outline-none bg-slate-50 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-colors"
                                    />
                                </div>
                            )}

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Email Address</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="doctor@hospital.com"
                                    className="w-full h-12 px-4 border-2 border-slate-100 focus:border-teal-500 rounded-xl outline-none bg-slate-50 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-colors" />
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">Password</label>
                                    {mode === 'signin' && <a href="#" className="text-xs font-semibold text-teal-600 hover:underline">Forgot password?</a>}
                                </div>
                                <div className="relative">
                                    <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && mode === 'signin' && handleSignIn()}
                                        placeholder="••••••••••"
                                        className="w-full h-12 px-4 pr-11 border-2 border-slate-100 focus:border-teal-500 rounded-xl outline-none bg-slate-50 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-colors" />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                        <EyeIcon show={showPass} />
                                    </button>
                                </div>
                            </div>

                            {/* Sign-Up: Confirm Password */}
                            {mode === 'signup' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Confirm Password</label>
                                    <div className="relative">
                                        <input type={showConfirmPass ? 'text' : 'password'} value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••••"
                                            className="w-full h-12 px-4 pr-11 border-2 border-slate-100 focus:border-teal-500 rounded-xl outline-none bg-slate-50 text-sm font-semibold placeholder:text-slate-400 placeholder:font-normal transition-colors" />
                                        <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                            <EyeIcon show={showConfirmPass} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Sign-In: Security badge */}
                            {mode === 'signin' && (
                                <div className="flex items-center gap-3 p-3 bg-teal-50 border border-teal-100 rounded-xl">
                                    <span className="text-teal-600 text-lg">🔒</span>
                                    <div>
                                        <p className="text-teal-800 text-xs font-bold">Encrypted & Secure Connection</p>
                                        <p className="text-teal-500 text-xs">Your data is protected with TLS 1.3</p>
                                    </div>
                                </div>
                            )}

                            {/* Sign-Up: Info note */}
                            {mode === 'signup' && (
                                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                                    <span className="text-amber-500 text-lg mt-0.5">📋</span>
                                    <div>
                                        <p className="text-amber-800 text-xs font-bold">Verification Required</p>
                                        <p className="text-amber-600 text-xs">After creating your account, you'll need to submit your medical license and degree for admin review.</p>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={mode === 'signin' ? handleSignIn : handleSignUp}
                                disabled={loading}
                                className="w-full h-12 bg-gradient-to-r from-teal-600 to-teal-800 hover:from-teal-700 hover:to-teal-900 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-teal-900/10 hover:shadow-teal-900/20 disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {loading
                                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : mode === 'signin' ? '→  Access Doctor Portal' : '✓  Create Account & Verify'}
                            </button>
                        </div>

                        <p className="text-center text-xs text-slate-500 font-medium mt-6">
                            Not a doctor?{' '}
                            <button onClick={() => navigate('/')} className="text-teal-600 font-semibold hover:underline">Go to home page</button>
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Left Info Panel ── */}
            <div className="hidden lg:flex w-5/12 flex-col bg-teal-900 relative overflow-hidden order-1 lg:order-2">
                <div className="absolute top-0 right-0 w-72 h-72 bg-teal-400/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-emerald-400/5 rounded-full translate-y-1/3 -translate-x-1/3" />

                <div className="relative z-10 flex flex-col h-full p-12">
                    <div className="flex items-center gap-3 mb-auto">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl">🩺</div>
                        <span className="text-white font-extrabold text-lg tracking-tight">Doctor Portal</span>
                    </div>

                    <div className="mb-10">
                        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
                            <span className="w-2 h-2 bg-teal-300 rounded-full" />
                            <span className="text-teal-100 text-xs font-semibold">Registered Doctors Only</span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-white leading-tight mb-3">
                            Manage patients<br />
                            <span className="text-teal-300">with confidence.</span>
                        </h1>
                        <p className="text-teal-100/70 text-base font-medium leading-relaxed">
                            Review prescriptions, approve nursing jobs, and keep track of all your patient assignments.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {DOCTOR_FEATURES.map(f => (
                            <div key={f.title} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-teal-500/30 transition-colors group">
                                <span className="text-2xl">{f.icon}</span>
                                <div>
                                    <p className="text-white font-bold text-sm group-hover:text-teal-300 transition-colors">{f.title}</p>
                                    <p className="text-teal-100/60 text-xs">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 p-4 bg-amber-500/10 border border-amber-400/20 rounded-2xl">
                        <p className="text-amber-400 text-xs font-bold mb-1">⚠️ Restricted Access</p>
                        <p className="text-amber-100/60 text-xs font-medium">Only verified doctors can access this portal. New sign-ups require admin verification before access is granted.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
