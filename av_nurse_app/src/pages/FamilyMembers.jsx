import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, User, ChevronRight } from 'lucide-react';

const FamilyMembers = () => {
    const navigate = useNavigate();
    const [familyMembers] = useState(() => {
        // Load family members from localStorage
        const storedMembers = JSON.parse(localStorage.getItem('familyMembers') || '[]');

        // If empty, add some dummy data for demo
        if (storedMembers.length === 0) {
            const initialMembers = [
                {
                    id: 1,
                    name: 'Arjun Sharma',
                    relation: 'Self',
                    age: 28,
                    gender: 'Male',
                    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBh5GT-z5R38SjS9_OLHXXHnj9n0WRGrX9uqty9UxMyYfeQ-AR5aIMRTa3dqAqvFlnSYNjVBuXwwf8PkOmfpun-6t7dPZ_v5hCJ96a0vES4FLGb8N062dnXXoQlHdgKcRkhz4pWDF_-8SyKgx_vr2JTk06ggjHlRQJKnAB-3_CtV5XH5Lir25bJHgGfCrABc9XTCQFBE5yq7jn5xkDeXb03i68jSL8l64iAELwTQ8yw-YKnJbxWnRfR9jL5F0e569cldjsfySwDuA'
                },
                {
                    id: 2,
                    name: 'Priya Sharma',
                    relation: 'Wife',
                    age: 26,
                    gender: 'Female',
                    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop'
                },
                {
                    id: 3,
                    name: 'Rohan Sharma',
                    relation: 'Son',
                    age: 5,
                    gender: 'Male',
                    image: 'https://images.unsplash.com/photo-1595290293134-84d4b1f649f7?w=200&h=200&fit=crop'
                }
            ];
            localStorage.setItem('familyMembers', JSON.stringify(initialMembers));
            return initialMembers;
        } else {
            return storedMembers;
        }
    });

    return (
        <div className="bg-background min-h-screen max-w-[430px] mx-auto relative flex flex-col">
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md pt-12 pb-4 px-5 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Family Members</h1>
                    <button
                        onClick={() => navigate('/add-family-member')}
                        className="flex size-10 items-center justify-center rounded-full bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="px-5 py-6 space-y-4 flex-1">
                {familyMembers.map((member) => (
                    <div key={member.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="size-14 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                            {member.image ? (
                                <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <User className="w-6 h-6" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-900 text-base">{member.name}</h3>
                            <p className="text-sm font-medium text-slate-500">{member.relation} • {member.age} yrs • {member.gender}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                    </div>
                ))}
            </main>
        </div>
    );
};

export default FamilyMembers;
