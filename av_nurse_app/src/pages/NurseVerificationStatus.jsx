import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ShieldAlert, LogOut, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function NurseVerificationStatus() {
    const navigate = useNavigate();
    const [status, setStatus] = useState('pending'); // 'pending', 'rejected', or 'approved'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            // Check current status if logged in via supabase
            if (session?.user) {
                const { data } = await supabase
                    .from('nurse_profiles')
                    .select('verification_status')
                    .eq('user_id', session.user.id)
                    .single();

                if (data) {
                    setStatus(data.verification_status);
                    if (data.verification_status === 'approved') {
                        navigate('/nurse/dashboard');
                    }
                }
            } else {
                // local fallback if testing without auth
                const storedStatus = localStorage.getItem('nurse_verification_status') || 'pending';
                setStatus(storedStatus);
            }
            setLoading(false);
        };
        fetchStatus();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        supabase.auth.signOut();
        navigate('/role-selection');
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
            <div className="animate-spin w-8 h-8 rounded-full border-4 border-emerald-600 border-t-transparent"></div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden text-center">

                {status === 'pending' ? (
                    <div className="p-10 space-y-6">
                        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 outline outline-8 outline-emerald-50/50">
                            <Clock className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Profile Under Review</h2>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            Your verification details have been successfully submitted. Our team is reviewing your nursing documents to ensure quality standards.
                        </p>
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 text-left flex items-start gap-3 mt-4">
                            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-amber-800">Please Note</p>
                                <p className="text-xs font-medium text-amber-700/80 mt-1">Verification usually takes 24-48 working hours. You will receive an email once approved.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-10 space-y-6">
                        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 outline outline-8 outline-red-50/50">
                            <ShieldAlert className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Verification Rejected</h2>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            Unfortunately, your verification was not approved. This might be due to illegible documents or mismatched credentials.
                        </p>
                        <p className="text-sm font-semibold text-slate-800">
                            Please contact support to resolve this issue and try again.
                        </p>
                    </div>
                )}

                <div className="border-t border-slate-100 bg-slate-50 p-6 flex flex-col gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full h-12 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                        Check Status Again
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full h-12 flex items-center justify-center gap-2 text-slate-500 font-bold rounded-xl hover:text-slate-800 transition-colors"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
