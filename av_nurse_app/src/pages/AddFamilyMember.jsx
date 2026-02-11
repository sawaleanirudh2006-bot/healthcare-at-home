import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, CheckCircle2, AlertCircle } from 'lucide-react';


const AddFamilyMember = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        relation: 'Mother',
        dob: '',
        gender: 'Female',
        emergencyContact: false
    });

    const [idProof, setIdProof] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setIdProof(e.target.files[0]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call/processing
        setTimeout(() => {
            const newMember = {
                id: Date.now(),
                name: formData.name,
                relation: formData.relation,
                // Calculate age from DOB (simplified)
                age: formData.dob ? new Date().getFullYear() - new Date(formData.dob).getFullYear() : 'N/A',
                gender: formData.gender,
                image: null, // Placeholder as we can't easily store images in localStorage
                emergencyContact: formData.emergencyContact
            };

            const existingMembers = JSON.parse(localStorage.getItem('familyMembers') || '[]');
            const updatedMembers = [...existingMembers, newMember];
            localStorage.setItem('familyMembers', JSON.stringify(updatedMembers));

            setIsSubmitting(false);
            navigate('/family-members');
        }, 1000);
    };

    return (
        <div className="bg-background min-h-screen max-w-[430px] mx-auto relative flex flex-col">
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md pt-12 pb-4 px-5 border-b border-slate-100">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Add Family Member</h1>
                </div>
            </header>

            <main className="px-5 py-6 flex-1 pb-24">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Details */}
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Suresh Kumar"
                                required
                                className="w-full h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-primary/20 text-slate-900 font-medium placeholder:text-slate-400"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Relation</label>
                                <select
                                    name="relation"
                                    value={formData.relation}
                                    onChange={handleChange}
                                    className="w-full h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-primary/20 text-slate-900 font-medium"
                                >
                                    <option value="Mother">Mother</option>
                                    <option value="Father">Father</option>
                                    <option value="Wife">Wife</option>
                                    <option value="Husband">Husband</option>
                                    <option value="Son">Son</option>
                                    <option value="Daughter">Daughter</option>
                                    <option value="Brother">Brother</option>
                                    <option value="Sister">Sister</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Date of Birth</label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    required
                                    className="w-full h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-primary/20 text-slate-900 font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Gender</label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`flex h-12 items-center justify-center rounded-xl border-2 cursor-pointer transition-all ${formData.gender === 'Male' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 bg-slate-50 text-slate-500'}`}>
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="Male"
                                        checked={formData.gender === 'Male'}
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    <span className="font-bold">Male</span>
                                </label>
                                <label className={`flex h-12 items-center justify-center rounded-xl border-2 cursor-pointer transition-all ${formData.gender === 'Female' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 bg-slate-50 text-slate-500'}`}>
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="Female"
                                        checked={formData.gender === 'Female'}
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    <span className="font-bold">Female</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* ID Proof Upload */}
                    <div className="bg-white rounded-2xl p-4 border border-slate-200 border-dashed">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <Upload className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Upload ID Proof (Optional)</p>
                                <p className="text-xs text-slate-500">Aadhaar, PAN, or Voter ID</p>
                            </div>
                        </div>
                        {idProof ? (
                            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-sm font-bold">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="truncate flex-1">{idProof.name}</span>
                                <button type="button" onClick={() => setIdProof(null)} className="text-xs underline">Remove</button>
                            </div>
                        ) : (
                            <label className="flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-slate-50 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
                                Choose File
                            </label>
                        )}
                        <div className="flex items-start gap-2 mt-3 bg-amber-50 p-2 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-amber-700 font-medium">Required for booking services for this member.</p>
                        </div>
                    </div>

                    {/* Emergency Contact Toggle */}
                    <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <div>
                            <p className="text-sm font-bold text-slate-900">Emergency Contact</p>
                            <p className="text-xs text-slate-500 font-medium">Mark as emergency contact</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="emergencyContact"
                                checked={formData.emergencyContact}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Member Details'}
                    </button>
                </form>
            </main>
        </div>
    );
};

export default AddFamilyMember;
