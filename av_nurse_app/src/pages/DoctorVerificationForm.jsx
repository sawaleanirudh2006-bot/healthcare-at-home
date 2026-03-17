import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Upload, CheckCircle, AlertCircle, FileText, ChevronRight } from 'lucide-react';

export default function DoctorVerificationForm() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);

    // User data from login
    const doctorData = JSON.parse(localStorage.getItem('doctorData') || '{}');
    const doctorId = doctorData?.id || doctorData?.user_id || `temp-doc-${Date.now()}`;

    const [formData, setFormData] = useState({
        full_name: doctorData.name || '',
        email: doctorData.email || '',
        phone: '',
        registration_number: '',
        qualification: '',
        specialization: '',
        state_medical_council: '',
        years_of_experience: '',
        clinic_hospital_name: '',
        city_location: '',
    });

    const [files, setFiles] = useState({
        degree_cert: null,
        registration_cert: null
    });

    // We fetch auth user ID from Supabase
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUserId(session.user.id);
            } else {
                // If using local dev mode fallback, we might not have a supabase auth user.
                // For safety, generate one or redirect if strict auth is needed.
                // but let's assume we have a user
            }
        };
        fetchUser();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    const uploadFile = async (file, path) => {
        if (!file) return null;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${path}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('doctor-certificates')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage.from('doctor-certificates').getPublicUrl(filePath);
        return data.publicUrl;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validation
            if (!formData.full_name || !formData.registration_number || !formData.qualification || !formData.specialization || !formData.state_medical_council || !formData.years_of_experience || !formData.city_location) {
                throw new Error("Please fill in all required fields.");
            }

            if (!files.degree_cert || !files.registration_cert) {
                throw new Error("Both Degree and Registration certificates are required.");
            }

            // 1. Upload certificates
            const degreeUrl = await uploadFile(files.degree_cert, 'degrees');
            const registrationUrl = await uploadFile(files.registration_cert, 'registrations');

            if (!degreeUrl || !registrationUrl) {
                throw new Error("Failed to upload certificates.");
            }

            // 2. Save profile to database
            const profileData = {
                user_id: userId || '00000000-0000-0000-0000-000000000000', // fallback if no auth
                ...formData,
                years_of_experience: parseInt(formData.years_of_experience, 10),
                degree_cert_url: degreeUrl,
                registration_cert_url: registrationUrl,
                verification_status: 'pending'
            };

            const { error: dbError } = await supabase
                .from('doctor_profiles')
                .insert([profileData]);

            if (dbError) throw dbError;

            // 3. Success - Redirect to status page
            navigate('/doctor/status');

        } catch (err) {
            console.error(err);
            setError(err.message || "An error occurred during submission. Did you create the table and bucket?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col py-10 px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="max-w-3xl w-full mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-sky-600 to-blue-700 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                    <div className="relative z-10">
                        <h1 className="text-2xl font-extrabold mb-2">Complete Your Doctor Profile</h1>
                        <p className="text-sky-100 font-medium">Please provide your professional details. Your account will be reviewed for verification.</p>
                    </div>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Section 1: Personal Info */}
                        <div>
                            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-xs">1</span>
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Full Name *</label>
                                    <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required className="w-full h-11 px-4 border border-slate-200 rounded-lg text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all placeholder:text-slate-400" placeholder="Dr. John Doe" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Email Address *</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full h-11 px-4 border border-slate-200 rounded-lg text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all placeholder:text-slate-400" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Phone Number *</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full h-11 px-4 border border-slate-200 rounded-lg text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all placeholder:text-slate-400" placeholder="+91 XXXXX XXXXX" />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Professional Info */}
                        <div>
                            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-xs">2</span>
                                Professional Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Medical Reg Number *</label>
                                    <input type="text" name="registration_number" value={formData.registration_number} onChange={handleChange} required className="w-full h-11 px-4 border border-slate-200 rounded-lg text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none uppercase transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">State Medical Council *</label>
                                    <input type="text" name="state_medical_council" value={formData.state_medical_council} onChange={handleChange} required className="w-full h-11 px-4 border border-slate-200 rounded-lg text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all" placeholder="e.g. Maharashtra Medical Council" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Highest Qualification *</label>
                                    <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} required className="w-full h-11 px-4 border border-slate-200 rounded-lg text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all" placeholder="MBBS, MD, MS" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Specialization *</label>
                                    <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} required className="w-full h-11 px-4 border border-slate-200 rounded-lg text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all" placeholder="General Physician, Cardiologist..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Years of Experience *</label>
                                    <input type="number" name="years_of_experience" value={formData.years_of_experience} onChange={handleChange} min="0" required className="w-full h-11 px-4 border border-slate-200 rounded-lg text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all" />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Practice Info */}
                        <div>
                            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-xs">3</span>
                                Current Practice
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Clinic/Hospital Name</label>
                                    <input type="text" name="clinic_hospital_name" value={formData.clinic_hospital_name} onChange={handleChange} className="w-full h-11 px-4 border border-slate-200 rounded-lg text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all" placeholder="(Optional)" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">City / Location *</label>
                                    <input type="text" name="city_location" value={formData.city_location} onChange={handleChange} required className="w-full h-11 px-4 border border-slate-200 rounded-lg text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all" />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Document Uploads */}
                        <div>
                            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-xs">4</span>
                                Verification Documents
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <FileUploader
                                    label="Medical Degree Certificate *"
                                    name="degree_cert"
                                    file={files.degree_cert}
                                    onChange={handleFileChange}
                                />
                                <FileUploader
                                    label="Medical Registration Certificate *"
                                    name="registration_cert"
                                    file={files.registration_cert}
                                    onChange={handleFileChange}
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-3 font-medium flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 text-sky-500" />
                                Accepted formats: PDF, JPG, PNG. Max size: 5MB per file.
                            </p>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-sky-200 transition-all flex items-center gap-2 disabled:opacity-70"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        Submit Profile for Review
                                        <ChevronRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// Micro-component for file uploads
function FileUploader({ label, name, file, onChange }) {
    return (
        <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">{label}</label>
            <div className="relative border-2 border-dashed border-slate-200 hover:border-sky-400 bg-slate-50 hover:bg-sky-50 transition-colors rounded-xl p-4 flex flex-col items-center justify-center text-center group cursor-pointer h-32">
                <input
                    type="file"
                    name={name}
                    onChange={onChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {!file ? (
                    <>
                        <Upload className="w-6 h-6 text-slate-400 mb-2 group-hover:text-sky-500 transition-colors" />
                        <span className="text-sm font-semibold text-slate-600">Click or drag file to upload</span>
                        <span className="text-xs text-slate-400 mt-1">PDF or Image</span>
                    </>
                ) : (
                    <>
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-emerald-700 truncate w-full px-2" title={file.name}>
                            {file.name}
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}
