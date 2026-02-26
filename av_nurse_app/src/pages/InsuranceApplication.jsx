import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, Shield, Info, Heart, AlertCircle, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function InsuranceApplication() {
    const navigate = useNavigate();
    const location = useLocation();
    const { planDetails } = location.state || {};

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        applicantName: '',
        age: '',
        gender: '',
        relation: 'Self',
        nomineeName: '',
        nomineeRelation: '',
        preExistingConditions: '',
        isSmoker: false,
        address: '',
    });

    if (!planDetails) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-5 text-center">
                <AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">No Plan Selected</h3>
                <p className="text-sm text-slate-500 mt-2">Please go back and select an insurance plan first.</p>
                <button onClick={() => navigate(-1)} className="mt-6 px-6 py-3 bg-primary text-white rounded-xl font-bold">Go Back</button>
            </div>
        );
    }

    const handleNext = () => {
        if (step < 2) {
            setStep(step + 1);
        } else {
            // Final submit to checkout
            navigate('/checkout', {
                state: {
                    serviceType: `${planDetails.name} Booking`,
                    price: planDetails.price,
                    planType: 'insurance',
                    coverage: planDetails.coverage,
                    planDetails: planDetails,
                    insuranceDetails: formData
                }
            });
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto pb-24">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 pt-12 pb-4 px-5">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => step > 1 ? setStep(1) : navigate(-1)}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Application Details</h1>
                    <div className="w-10">
                        <div className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full text-center">
                            Step {step}/2
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 px-5 py-6 space-y-6">
                {/* Plan Summary */}
                <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">Applying For</p>
                        <p className="text-sm font-bold text-slate-900">{planDetails.name}</p>
                    </div>
                </div>

                {step === 1 ? (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center gap-2 mb-2">
                            <User className="w-5 h-5 text-primary" />
                            <h2 className="text-base font-bold text-slate-900">Personal Information</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Full Name of Applicant</label>
                                <input
                                    type="text"
                                    placeholder="Enter full name"
                                    value={formData.applicantName}
                                    onChange={e => setFormData({ ...formData, applicantName: e.target.value })}
                                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Age</label>
                                    <input
                                        type="number"
                                        placeholder="Age"
                                        value={formData.age}
                                        onChange={e => setFormData({ ...formData, age: e.target.value })}
                                        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Gender</label>
                                    <select
                                        value={formData.gender}
                                        onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                                    >
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Relation to Primary Member</label>
                                <select
                                    value={formData.relation}
                                    onChange={e => setFormData({ ...formData, relation: e.target.value })}
                                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                                >
                                    <option value="Self">Self</option>
                                    <option value="Spouse">Spouse</option>
                                    <option value="Child">Child</option>
                                    <option value="Parent">Parent</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Permanent Address</label>
                                <textarea
                                    placeholder="Enter your full address"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center gap-2 mb-2">
                            <Heart className="w-5 h-5 text-primary" />
                            <h2 className="text-base font-bold text-slate-900">Health & Nominee Info</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Info className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm font-semibold text-slate-700">Are you a smoker?</span>
                                    </div>
                                    <button
                                        onClick={() => setFormData({ ...formData, isSmoker: !formData.isSmoker })}
                                        className={cn(
                                            "w-12 h-6 rounded-full transition-all relative",
                                            formData.isSmoker ? "bg-primary" : "bg-slate-300"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                            formData.isSmoker ? "left-7" : "left-1"
                                        )} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Any Pre-existing Diseases?</label>
                                <textarea
                                    placeholder="Mention any illnesses, surgeries or regular medications (Leave blank if none)"
                                    value={formData.preExistingConditions}
                                    onChange={e => setFormData({ ...formData, preExistingConditions: e.target.value })}
                                    className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="h-px bg-slate-100 my-2" />

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Nominee Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter nominee name"
                                    value={formData.nomineeName}
                                    onChange={e => setFormData({ ...formData, nomineeName: e.target.value })}
                                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 ml-1">Relation with Nominee</label>
                                <select
                                    value={formData.nomineeRelation}
                                    onChange={e => setFormData({ ...formData, nomineeRelation: e.target.value })}
                                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                                >
                                    <option value="">Select Relation</option>
                                    <option value="Spouse">Spouse</option>
                                    <option value="Parent">Parent</option>
                                    <option value="Sibling">Sibling</option>
                                    <option value="Child">Child</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Sticky Bottom Button */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-slate-100 p-5">
                <button
                    onClick={handleNext}
                    disabled={step === 1 && (!formData.applicantName || !formData.age || !formData.gender)}
                    className={cn(
                        "w-full h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-base transition-all",
                        (step === 1 && (!formData.applicantName || !formData.age || !formData.gender))
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90"
                    )}
                >
                    {step === 1 ? "Next Step" : "Save & Continue to Payment"}
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
