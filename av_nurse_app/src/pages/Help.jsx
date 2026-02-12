import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Phone, Mail, HelpCircle, FileText, ChevronRight } from 'lucide-react';

const Help = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { role } = location.state || { role: 'patient' }; // Default to patient if no role passed

    const getRoleTitle = () => {
        switch (role) {
            case 'nurse': return 'Nurse Support';
            case 'doctor': return 'Doctor Support';
            case 'admin': return 'Admin Support';
            default: return 'Help & Support';
        }
    };

    const getBackPath = () => {
        switch (role) {
            case 'nurse': return '/nurse/profile';
            case 'doctor': return '/doctor/profile';
            case 'admin': return '/admin/profile';
            default: return '/profile'; // Patient profile
        }
    };

    const faqs = {
        patient: [
            { q: 'How do I book a nurse?', a: 'Go to Home > Nursing Services, select a service, and follow the booking steps.' },
            { q: 'Can I cancel a booking?', a: 'Yes, go to Bookings, select the appointment, and click "Cancel Booking".' },
            { q: 'How do I pay?', a: 'We accept credit cards, UPI, and digital wallets during checkout.' }
        ],
        nurse: [
            { q: 'How do I accept a booking?', a: 'Check the "Assigned" tab in your dashboard. New assignments appear there automatically.' },
            { q: 'What if I am running late?', a: 'Please contact the patient immediately using the "Call Patient" button in the assignment details.' },
            { q: 'How to mark a job as complete?', a: 'Once the service is done, click "Mark Complete" and add your care notes.' }
        ],
        doctor: [
            { q: 'How do I review prescriptions?', a: 'Go to your Dashboard. Pending prescriptions are listed at the top.' },
            { q: 'Can I reject a prescription?', a: 'Yes, but you must provide a valid reason for the rejection.' },
            { q: 'How to add consultation notes?', a: 'Open the prescription details and click "Add Notes" to write your diagnosis.' }
        ],
        admin: [
            { q: 'How to add new staff?', a: 'Go to Staff Management > Add New to onboard doctors or nurses.' },
            { q: 'Where are revenue reports?', a: 'Check the Revenue Reports section in your dashboard for financial analytics.' },
            { q: 'Can I delete a user?', a: 'Yes, from the User Management section (restricted access).' }
        ]
    };

    const currentFaqs = faqs[role] || faqs.patient;

    const contactOptions = [
        {
            icon: Phone,
            label: 'Call Support',
            sub: '+91 1800-CARE-HOME',
            action: () => window.location.href = 'tel:+9118002273466',
            color: 'bg-emerald-50 text-emerald-600'
        },
        {
            icon: Mail,
            label: 'Email Support',
            sub: 'support@carehome.com',
            action: () => window.location.href = 'mailto:support@carehome.com',
            color: 'bg-blue-50 text-blue-600'
        },
        {
            icon: MessageCircle,
            label: 'Live Chat',
            sub: 'Chat with an agent',
            action: () => alert('Live chat connecting...'),
            color: 'bg-purple-50 text-purple-600'
        }
    ];

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-slate-50 max-w-[430px] mx-auto pb-24">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white border-b border-slate-100 pt-12 pb-4 px-5">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(getBackPath())}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-700" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-900">{getRoleTitle()}</h1>
                </div>
            </div>

            {/* Contact Options */}
            <div className="px-5 mt-6 grid grid-cols-2 gap-3">
                {contactOptions.map((opt, idx) => {
                    const Icon = opt.icon;
                    return (
                        <button
                            key={idx}
                            onClick={opt.action}
                            className={`p-4 rounded-2xl border border-slate-100 bg-white shadow-sm flex flex-col items-center text-center active:scale-[0.98] transition-all ${idx === 2 ? 'col-span-2' : ''}`}
                        >
                            <div className={`p-3 rounded-full mb-3 ${opt.color}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-slate-900 text-sm">{opt.label}</span>
                            <span className="text-xs font-medium text-slate-500 mt-0.5">{opt.sub}</span>
                        </button>
                    );
                })}
            </div>

            {/* FAQs */}
            <div className="px-5 mt-8">
                <div className="flex items-center gap-2 mb-4">
                    <HelpCircle className="w-5 h-5 text-slate-400" />
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Frequently Asked Questions</h2>
                </div>

                <div className="space-y-3">
                    {currentFaqs.map((faq, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-start gap-2">
                                <span className="text-primary mt-0.5">Q.</span>
                                {faq.q}
                            </h3>
                            <p className="text-sm text-slate-600 leading-relaxed pl-5 border-l-2 border-slate-100 ml-1">
                                {faq.a}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Resources Link */}
            <div className="px-5 mt-6">
                <button className="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group active:scale-[0.98] transition-all">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <span className="block font-bold text-slate-700 text-sm">Documentation</span>
                            <span className="block text-xs text-slate-400">Read user guides & policies</span>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-500 transition-colors" />
                </button>
            </div>
        </div>
    );
};

export default Help;
