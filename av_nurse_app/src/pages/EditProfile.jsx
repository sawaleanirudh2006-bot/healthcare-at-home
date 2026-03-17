import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, MapPin, Camera } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const EditProfile = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(() => {
        // Priority 1: userProfile (previously saved edits)
        const saved = localStorage.getItem('userProfile');
        if (saved) return JSON.parse(saved);

        // Priority 2: userData (set during signup/login)
        const ud = localStorage.getItem('patientData');
        if (ud) {
            const u = JSON.parse(ud);
            return {
                name: u.name || u.full_name || '',
                phone: u.phone || '',
                email: u.email || '',
                gender: u.gender || '',
                address: u.address || '',
            };
        }

        // Fresh user — empty form
        return { name: '', phone: '', email: '', gender: '', address: '' };
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const role = localStorage.getItem('userRole')?.toLowerCase();
                let table = 'patient_profiles';
                if (role === 'doctor') table = 'doctor_profiles';
                else if (role === 'nurse') table = 'nurse_profiles';

                // Sync to Supabase
                await supabase
                    .from(table)
                    .update({
                        full_name: formData.name,
                        phone: formData.phone,
                        email: formData.email,
                        address_street: formData.address // assuming column name matches or is similar
                    })
                    .eq('user_id', session.user.id);
            }

            // Save to local cache
            localStorage.setItem('userProfile', JSON.stringify(formData));
            const ud = JSON.parse(localStorage.getItem('patientData') || '{}');
            localStorage.setItem('patientData', JSON.stringify({ ...ud, name: formData.name, phone: formData.phone, email: formData.email }));

        } catch (err) {
            console.error('Error updating profile:', err);
        } finally {
            setIsSubmitting(false);
            navigate('/profile');
        }
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
                    <h1 className="text-lg font-bold text-slate-900">Edit Profile</h1>
                </div>
            </header>

            <main className="px-5 py-6 flex-1 pb-24">
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="size-24 rounded-full border-4 border-white shadow-premium overflow-hidden">
                            <img alt="Profile" className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBh5GT-z5R38SjS9_OLHXXHnj9n0WRGrX9uqty9UxMyYfeQ-AR5aIMRTa3dqAqvFlnSYNjVBuXwwf8PkOmfpun-6t7dPZ_v5hCJ96a0vES4FLGb8N062dnXXoQlHdgKcRkhz4pWDF_-8SyKgx_vr2JTk06ggjHlRQJKnAB-3_CtV5XH5Lir25bJHgGfCrABc9XTCQFBE5yq7jn5xkDeXb03i68jSL8l64iAELwTQ8yw-YKnJbxWnRfR9jL5F0e569cldjsfySwDuA" />
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-white border-2 border-white shadow-md">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full h-12 pl-12 pr-4 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-primary/20 text-slate-900 font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full h-12 pl-12 pr-4 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-primary/20 text-slate-900 font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full h-12 pl-12 pr-4 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-primary/20 text-slate-900 font-medium"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full h-12 px-4 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-primary/20 text-slate-900 font-medium"
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-primary/20 text-slate-900 font-medium resize-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-70"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default EditProfile;
