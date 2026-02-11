import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const LoginScreen = ({ role, themeColor, icon: Icon, welcomeText, subText }) => {
    const navigate = useNavigate();
    const [loginMethod, setLoginMethod] = useState('mobile'); // 'mobile' or 'email'
    const [mobileNumber, setMobileNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [step, setStep] = useState('mobile'); // 'mobile' or 'otp'
    const [timer, setTimer] = useState(45);

    useEffect(() => {
        let interval;
        if (step === 'otp' && timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const handleMobileSubmit = () => {
        if (mobileNumber.length >= 10) {
            setStep('otp');
            setTimer(45);
        }
    };

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    const handleVerifyLike = () => {
        // Store user role in localStorage
        localStorage.setItem('userRole', role);

        // Store basic user data
        const userData = {
            role: role,
            phone: mobileNumber,
            email: loginMethod === 'email' ? email : (
                role === 'Doctor' ? 'dr.rajesh@hospital.com' :
                    role === 'Admin' ? 'admin@carehome.com' :
                        role === 'Nurse' ? 'sarah.nurse@carehome.com' :
                            'patient@example.com'
            ),
            name: role === 'Doctor' ? 'Dr. Rajesh Kumar' :
                role === 'Admin' ? 'Admin User' :
                    role === 'Nurse' ? 'Nurse Sarah' :
                        'Patient User',
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('userData', JSON.stringify(userData));

        // Navigate based on role
        if (role === 'Doctor') {
            navigate('/doctor/dashboard');
        } else if (role === 'Nurse') {
            navigate('/nurse/dashboard');
        } else if (role === 'Admin') {
            navigate('/admin/dashboard');
        } else if (role === 'Patient') {
            // Patient role - navigate to home
            navigate('/home');
        } else {
            // Fallback to home for any other case
            navigate('/home');
        }
    };

    // Handle Enter key press on OTP input
    const handleOtpKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // If all OTP fields are filled, verify
            if (otp.every(digit => digit !== '')) {
                handleVerifyLike();
            }
        }
    };

    const themeColors = {
        primary: 'text-primary bg-primary border-primary focus:border-primary focus:ring-primary',
        blue: 'text-sky-500 bg-sky-500 border-sky-500 focus:border-sky-500 focus:ring-sky-500',
        emerald: 'text-emerald-500 bg-emerald-500 border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500',
        slate: 'text-slate-700 bg-slate-700 border-slate-700 focus:border-slate-700 focus:ring-slate-700',
    };

    const activeTheme = themeColors[themeColor] || themeColors.primary;
    const bgOpacity = `bg - ${themeColor === 'primary' ? 'primary' : themeColor === 'blue' ? 'sky-500' : themeColor === 'emerald' ? 'emerald-500' : 'slate-700'}/10`;

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-white max-w-[430px] mx-auto overflow-x-hidden">

            {/* Back Button */}
            <div className="absolute top-6 left-6 z-10">
                <button
                    onClick={() => step === 'otp' ? setStep('mobile') : navigate('/role-selection')}
                    className="size-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 shadow-sm border border-slate-100"
                >
                    <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
                </button>
            </div>

            <main className="flex flex-col flex-1 px-8 pt-24 pb-10">
                <div className="flex flex-col items-center mb-12">
                    <div className={`size-24 ${bgOpacity} rounded-3xl flex items-center justify-center mb-6`}>
                        <Icon size={48} className={activeTheme.split(' ')[0]} />
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">{welcomeText}</h1>
                    <p className="text-slate-500 mt-2 text-sm text-center px-4">{subText}</p>
                    <span className={`inline-block mt-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${bgOpacity} ${activeTheme.split(' ')[0]}`}>
                        {role} Login
                    </span>
                </div>

                <div className="space-y-8">
                    {/* Method Toggle */}
                    <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
                        <button
                            onClick={() => { setLoginMethod('mobile'); setStep('mobile'); }}
                            className={`px-4 py-2 text-sm font-bold transition-all ${loginMethod === 'mobile' ? 'text-slate-800 border-b-2 border-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Mobile
                        </button>
                        <button
                            onClick={() => { setLoginMethod('email'); }}
                            className={`px-4 py-2 text-sm font-bold transition-all ${loginMethod === 'email' ? 'text-slate-800 border-b-2 border-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Email
                        </button>
                    </div>

                    {loginMethod === 'mobile' ? (
                        step === 'mobile' ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Mobile Number</label>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-4 flex items-center gap-2 border-r border-slate-200 pr-3">
                                            <span className="text-sm font-bold text-slate-700">+91</span>
                                        </div>
                                        <input
                                            value={mobileNumber}
                                            onChange={(e) => setMobileNumber(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleMobileSubmit();
                                                }
                                            }}
                                            className={`w-full h-14 pl-20 pr-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none text-base font-semibold tracking-wide placeholder:text-slate-400 placeholder:font-normal transition-all shadow-input ${activeTheme.split(' ')[3]} ${activeTheme.split(' ')[4]}`}
                                            placeholder="98765 43210"
                                            type="tel"
                                            maxLength={10}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleMobileSubmit}
                                    className={`w-full h-14 text-white rounded-2xl font-bold text-[15px] shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform ${activeTheme.split(' ')[1]}`}
                                >
                                    Get OTP
                                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                </button>
                            </div>
                        ) : (
                            <div className="pt-2 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex flex-col items-center gap-4">
                                    <p className="text-[13px] font-medium text-slate-500 text-center">
                                        Enter 6-digit code sent to <br /> <span className="text-slate-800 font-bold">+91 {mobileNumber}</span>
                                    </p>
                                    <div className="flex justify-between w-full gap-2">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                id={`otp-${index}`}
                                                className={`w-12 h-14 text-center text-xl font-bold border border-slate-200 rounded-2xl outline-none transition-all shadow-input bg-slate-50 ${activeTheme.split(' ')[3]} ${activeTheme.split(' ')[4]}`}
                                                maxLength={1}
                                                type="text"
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyPress={(e) => handleOtpKeyPress(e)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Backspace' && !digit && index > 0) {
                                                        document.getElementById(`otp-${index - 1}`).focus();
                                                    }
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between px-1">
                                    <button className="text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600">Resend Code</button>
                                    <span className={`text-xs font-semibold ${activeTheme.split(' ')[0]}`}>
                                        00:{timer < 10 ? `0${timer}` : timer}
                                    </span>
                                </div>
                                <button
                                    onClick={handleVerifyLike}
                                    className={`w-full h-14 text-white rounded-2xl font-bold text-[15px] shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all ${activeTheme.split(' ')[1]}`}
                                >
                                    Verify & Login
                                </button>
                            </div>
                        )
                    ) : (
                        // Email Login View
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                                    <input
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={`w-full h-14 px-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none text-base font-semibold tracking-wide placeholder:text-slate-400 placeholder:font-normal transition-all shadow-input ${activeTheme.split(' ')[3]} ${activeTheme.split(' ')[4]}`}
                                        placeholder="Enter your email"
                                        type="email"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Password</label>
                                    <input
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={`w-full h-14 px-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none text-base font-semibold tracking-wide placeholder:text-slate-400 placeholder:font-normal transition-all shadow-input ${activeTheme.split(' ')[3]} ${activeTheme.split(' ')[4]}`}
                                        placeholder="••••••••"
                                        type="password"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleVerifyLike}
                                className={`w-full h-14 text-white rounded-2xl font-bold text-[15px] shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform ${activeTheme.split(' ')[1]}`}
                            >
                                Login
                                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-10 text-center">
                    <p className="text-xs text-slate-400 font-medium">
                        By continuing, you agree to our <br />
                        <a className={`font-bold hover:underline ${activeTheme.split(' ')[0]}`} href="#">Terms of Service</a> & <a className={`font-bold hover:underline ${activeTheme.split(' ')[0]}`} href="#">Privacy Policy</a>
                    </p>
                </div>
            </main>
        </div>
    );
};

LoginScreen.propTypes = {
    role: PropTypes.string.isRequired,
    themeColor: PropTypes.string,
    icon: PropTypes.elementType.isRequired,
    welcomeText: PropTypes.string.isRequired,
    subText: PropTypes.string.isRequired,
};

LoginScreen.defaultProps = {
    themeColor: 'primary',
};

export default LoginScreen;
