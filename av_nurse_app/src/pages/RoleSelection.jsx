import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Stethoscope, HeartPulse, User } from 'lucide-react';
import PropTypes from 'prop-types';

const RoleCard = ({ role, icon: Icon, color, path, description }) => {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate(path)}
            className="w-full bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md hover:border-primary/20 transition-all active:scale-[0.98] group"
        >
            <div className={`size-14 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={28} className="text-white" />
            </div>
            <div className="flex-1 text-left">
                <h3 className="font-bold text-slate-800 text-lg group-hover:text-primary transition-colors">{role}</h3>
                <p className="text-xs text-slate-500 font-medium">{description}</p>
            </div>
            <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
        </button>
    );
};

RoleCard.propTypes = {
    role: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    color: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
};

const RoleSelection = () => {
    // ... existing content ...
    return (
        <div className="min-h-screen bg-background p-6 flex flex-col justify-center max-w-[430px] mx-auto">
            <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-primary/10 mb-4">
                    <span className="material-symbols-outlined text-primary text-3xl">local_hospital</span>
                </div>
                <h1 className="text-2xl font-extrabold text-slate-800">Nurse @ Home</h1>
                <p className="text-slate-500 text-sm mt-2">Select your role to continue</p>
            </div>

            <div className="space-y-4">
                <RoleCard
                    role="Patient"
                    icon={User}
                    color="bg-primary"
                    path="/login/patient"
                    description="Book appointments & manage health"
                />
                <RoleCard
                    role="Doctor"
                    icon={Stethoscope}
                    color="bg-sky-500"
                    path="/login/doctor"
                    description="Manage patients & consultations"
                />
                <RoleCard
                    role="Nurse"
                    icon={HeartPulse}
                    color="bg-emerald-500"
                    path="/login/nurse"
                    description="View shifts & update status"
                />
                <RoleCard
                    role="Admin"
                    icon={Shield}
                    color="bg-slate-700"
                    path="/login/admin"
                    description="System & user management"
                />
            </div>

            <p className="text-center text-xs text-slate-400 mt-10 font-medium">
                Version 1.0.0 • Secure Login
            </p>
        </div>
    );
};

export default RoleSelection;
