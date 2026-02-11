import React from 'react';
import LoginScreen from '../components/LoginScreen';
import { User, Shield, Stethoscope, HeartPulse } from 'lucide-react';

export const LoginPatient = () => (
    <LoginScreen
        role="Patient"
        themeColor="primary"
        icon={User}
        welcomeText="Welcome Back"
        subText="Enter your mobile number to access your medical records and bookings"
    />
);

export const LoginAdmin = () => (
    <LoginScreen
        role="Admin"
        themeColor="slate"
        icon={Shield}
        welcomeText="Admin Portal"
        subText="Secure access for system administration and user management"
    />
);

export const LoginDoctor = () => (
    <LoginScreen
        role="Doctor"
        themeColor="blue"
        icon={Stethoscope}
        welcomeText="Doctor Dashboard"
        subText="Manage your appointments, patients, and consultation schedules"
    />
);

export const LoginNurse = () => (
    <LoginScreen
        role="Nurse"
        themeColor="emerald"
        icon={HeartPulse}
        welcomeText="Nurse Portal"
        subText="Track your shifts, visits, and patient care updates"
    />
);
