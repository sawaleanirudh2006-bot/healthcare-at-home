import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('phone'); // 'phone' or 'otp'
    const [mobile, setMobile] = useState('');

    const handleGetOTP = () => {
        if (mobile.length === 10) {
            setStep('otp');
        } else {
            alert('Please enter a valid 10-digit mobile number');
        }
    };

    const handleVerify = () => {
        // Mock verification
        navigate('/');
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto overflow-x-hidden">
            <main className="flex flex-col flex-1 px-8 pt-20 pb-10">
                <div className="flex flex-col items-center mb-12">
                    <div className="size-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-primary text-[40px] icon-fill">medical_services</span>
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">Welcome Back</h1>
                    <p className="text-slate-500 mt-2 text-sm text-center">Enter your mobile number to access your medical records and bookings</p>
                </div>

                <div className="space-y-8">
                    {step === 'phone' && (
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Mobile Number</label>
                            <div className="relative flex items-center">
                                <div className="absolute left-4 flex items-center gap-2 border-r border-slate-200 pr-3">
                                    <span className="text-sm font-bold text-slate-700">+91</span>
                                    <span className="material-symbols-outlined text-slate-400 text-[18px]">keyboard_arrow_down</span>
                                </div>
                                <input
                                    type="tel"
                                    className="w-full h-14 pl-20 pr-4 rounded-2xl border border-slate-200 bg-slate-50 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-base font-semibold tracking-wide placeholder:text-slate-400 placeholder:font-normal transition-all shadow-input"
                                    placeholder="98765 43210"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    maxLength={10}
                                />
                            </div>
                            <button
                                onClick={handleGetOTP}
                                className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-[15px] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform mt-8"
                            >
                                Get OTP
                                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                            </button>
                        </div>
                    )}

                    {step === 'otp' && (
                        <div className="pt-4 space-y-6">
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-[13px] font-medium text-slate-500">Enter 6-digit code sent to +91 {mobile}</p>
                                <div className="flex justify-between w-full gap-2">
                                    {[...Array(6)].map((_, i) => (
                                        <input
                                            key={i}
                                            type="text"
                                            maxLength={1}
                                            className="w-12 h-14 text-center text-xl font-bold border border-slate-200 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-input bg-slate-50"
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-between px-1">
                                <button className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resend Code</button>
                                <span className="text-xs font-semibold text-primary">00:45</span>
                            </div>
                            <button
                                onClick={handleVerify}
                                className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-[15px] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                            >
                                Verify & Login
                            </button>
                            <button onClick={() => setStep('phone')} className="w-full text-sm font-bold text-slate-400 mt-4">Change Number</button>
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-10 text-center">
                    <p className="text-xs text-slate-400 font-medium">
                        By continuing, you agree to our <br />
                        <a href="#" className="text-primary font-bold">Terms of Service</a> & <a href="#" className="text-primary font-bold">Privacy Policy</a>
                    </p>
                </div>
            </main>

            {/* Background blobs */}
            <div className="fixed top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 -z-10"></div>
            <div className="fixed bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full -ml-24 -mb-24 -z-10"></div>
        </div>
    );
};

export default Login;
