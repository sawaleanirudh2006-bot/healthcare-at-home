import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, FileText, Clock, CheckCircle, User } from 'lucide-react';
import { cn } from '../lib/utils';

export default function PrescriptionReview() {
    const navigate = useNavigate();
    const location = useLocation();
    const { serviceType, price, date, time, prescription } = location.state || {};

    const [status, setStatus] = useState('pending'); // pending, approved, rejected
    const [rejectionReason, setRejectionReason] = useState('');
    const [prescriptionId] = useState(() => location.state?.prescriptionId || null);

    // Dynamic details (can be updated by doctor)
    const [finalServiceType, setFinalServiceType] = useState(serviceType);
    const [finalPrice, setFinalPrice] = useState(price);
    const [assignedNurse, setAssignedNurse] = useState(null);

    useEffect(() => {
        const rxId = prescriptionId;
        if (!rxId) return;

        // Poll for status updates from doctor
        const pollInterval = setInterval(() => {
            const queue = JSON.parse(localStorage.getItem('prescriptionQueue') || '[]');
            const prescription = queue.find(rx => rx.id === rxId);

            if (prescription) {
                setStatus(prescription.status);
                if (prescription.rejectionReason) {
                    setRejectionReason(prescription.rejectionReason);
                }
                // Update details if changed by doctor
                if (prescription.serviceType) setFinalServiceType(prescription.serviceType);
                if (prescription.price) setFinalPrice(prescription.price);
                if (prescription.assignedNurse) setAssignedNurse(prescription.assignedNurse);
            }
        }, 2000); // Poll every 2 seconds

        return () => clearInterval(pollInterval);
    }, [prescriptionId]);

    const handleContinue = () => {
        if (status === 'approved') {
            const { nurse, isRebooking, isMedicineOrder } = location.state || {};

            // Auto-assign nearest available nurse only if not already assigned
            const availableNurses = [
                {
                    id: 'NURSE-001',
                    name: 'Nurse Sarah',
                    experience: '8 years',
                    rating: 4.9,
                    specialization: 'Post-operative Care',
                    phone: '+91 98765 43210',
                    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop',
                    available: true,
                    location: 'Nearby'
                },
                // ... (keep other dummy nurses if needed, or just rely on the first one)
            ];

            // Prioritize: 
            // 1. Nurse assigned by doctor (assignedNurse state)
            // 2. Nurse passed from previous step (nurse from location)
            // 3. Fallback to default nurse
            const finalNurse = assignedNurse || nurse || availableNurses[0];

            // Directly go to checkout
            navigate('/checkout', {
                state: {
                    serviceType: isMedicineOrder ? 'Medicine Order' : finalServiceType,
                    price: finalPrice,
                    date,
                    time,
                    prescription,
                    nurse: finalNurse, // Pass the correct nurse
                    isMedicineOrder,
                    cartItems: location.state?.cartItems,
                    total: location.state?.total,
                    autoAssigned: !nurse && !assignedNurse, // Flag if it was auto-assigned
                    isPackage: location.state?.isPackage,
                    packageDetails: location.state?.packageDetails,
                    // Pass doctor notes
                    doctorNotes: prescription?.doctorNotes,
                    diagnosis: prescription?.diagnosis,
                    recommendations: prescription?.recommendations,
                    doctorPrescription: prescription?.doctorPrescription
                },
            });
        }
    };

    const handleReupload = () => {
        navigate('/upload-prescription', {
            state: {
                serviceType,
                price,
                date,
                time,
            },
        });
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 pt-12 pb-4 px-5">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/home')}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Prescription Review</h1>
                    <div className="w-10" />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-5 py-6 space-y-6 pb-32">
                {/* Status Card */}
                <div className={cn(
                    'rounded-2xl p-6 border-2 transition-all',
                    status === 'pending' && 'bg-blue-50 border-blue-200',
                    status === 'approved' && 'bg-emerald-50 border-emerald-200',
                    status === 'rejected' && 'bg-red-50 border-red-200'
                )}>
                    <div className="flex flex-col items-center text-center">
                        <div className={cn(
                            'flex size-16 items-center justify-center rounded-full mb-4',
                            status === 'pending' && 'bg-blue-500 text-white',
                            status === 'approved' && 'bg-emerald-500 text-white animate-bounce',
                            status === 'rejected' && 'bg-red-500 text-white'
                        )}>
                            {status === 'pending' && <Clock className="w-8 h-8 animate-pulse" />}
                            {status === 'approved' && <CheckCircle className="w-8 h-8" />}
                            {status === 'rejected' && <FileText className="w-8 h-8" />}
                        </div>
                        <h2 className="text-xl font-extrabold text-slate-900 mb-2">
                            {status === 'pending' && 'Reviewing Prescription'}
                            {status === 'approved' && 'Prescription Approved!'}
                            {status === 'rejected' && 'Prescription Rejected'}
                        </h2>
                        <p className="text-sm font-medium text-slate-600 leading-relaxed">
                            {status === 'pending' && 'Your prescription has been submitted and is waiting for doctor approval. This may take a few minutes to a few hours.'}
                            {status === 'approved' && 'Your prescription has been verified by Dr. Rajesh Kumar. We\'re now assigning a qualified nurse.'}
                            {status === 'rejected' && rejectionReason}
                        </p>
                    </div>

                    {/* Doctor Info - Always show when pending */}
                    {status === 'pending' && (
                        <div className="mt-6">
                            <div className="flex items-center gap-3 bg-blue-100/50 p-3 rounded-xl mb-4 text-left">
                                <div className="size-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <User className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900">Dr. Rajesh Kumar</p>
                                    <p className="text-[10px] font-medium text-slate-500">General Physician • Reviewing</p>
                                </div>
                            </div>

                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                <p className="text-xs font-bold text-blue-900 mb-1">⏳ Awaiting Doctor Review</p>
                                <p className="text-xs font-medium text-blue-700">
                                    Your prescription is in the queue. The doctor will review it shortly.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Prescription Details */}
                <div className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <FileText className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">Uploaded Prescription</h3>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-slate-600">File Name</span>
                            <span className="font-bold text-slate-900">{prescription?.name || 'prescription.pdf'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-slate-600">File Size</span>
                            <span className="font-bold text-slate-900">{prescription?.size || '2.4 MB'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-slate-600">Uploaded</span>
                            <span className="font-bold text-slate-900">Just now</span>
                        </div>
                    </div>
                </div>

                {/* Service Details */}
                <div className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Service Details</p>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-slate-600">Service Type</span>
                            <span className="font-bold text-slate-900">{finalServiceType}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-slate-600">Scheduled</span>
                            <span className="font-bold text-slate-900">
                                {date && new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {time}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-slate-600">Amount</span>
                            <span className="font-bold text-primary">{finalPrice}</span>
                        </div>
                    </div>
                </div>

                {/* Review Timeline */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Review Process</h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500 text-white shrink-0 mt-0.5">
                                <span className="text-xs">✓</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-900">Prescription Uploaded</p>
                                <p className="text-xs font-medium text-slate-500 mt-0.5">Just now</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className={cn(
                                'flex size-6 items-center justify-center rounded-full shrink-0 mt-0.5',
                                status === 'approved' && 'bg-emerald-500 text-white',
                                status === 'rejected' && 'bg-red-500 text-white',
                                status === 'pending' && 'bg-blue-500 text-white animate-pulse'
                            )}>
                                <span className="text-xs">
                                    {status === 'approved' && '✓'}
                                    {status === 'rejected' && '✕'}
                                    {status === 'pending' && '2'}
                                </span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-900">Doctor Review</p>
                                <p className="text-xs font-medium text-slate-500 mt-0.5">
                                    {status === 'approved' && 'Approved by Dr. Rajesh Kumar'}
                                    {status === 'rejected' && 'Rejected - Invalid prescription'}
                                    {status === 'pending' && 'In progress...'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className={cn(
                                'flex size-6 items-center justify-center rounded-full shrink-0 mt-0.5',
                                status === 'approved' ? 'bg-blue-500 text-white animate-pulse' : 'bg-slate-300 text-slate-600'
                            )}>
                                <span className="text-xs">3</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-900">
                                    {(location.state?.isMedicineOrder) ? 'Pharmacist Review' : 'Nurse Assignment'}
                                </p>
                                <p className="text-xs font-medium text-slate-500 mt-0.5">Pending</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Action */}
            {status === 'approved' && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-5 max-w-[430px] mx-auto w-full animate-in slide-in-from-bottom duration-300">
                    <button
                        onClick={handleContinue}
                        className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
                    >
                        {location.state?.isMedicineOrder ? 'Continue to Checkout' : 'Continue to Nurse Assignment'}
                    </button>
                </div>
            )}
            {status === 'rejected' && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-5 max-w-[430px] mx-auto w-full animate-in slide-in-from-bottom duration-300">
                    <div className="space-y-3">
                        <div className="bg-red-50 rounded-xl p-3 border border-red-200">
                            <p className="text-xs font-bold text-red-900 mb-1">⚠️ Prescription Not Valid</p>
                            <p className="text-xs font-medium text-red-700">You cannot proceed to checkout without a valid prescription.</p>
                        </div>
                        <button
                            onClick={handleReupload}
                            className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
                        >
                            Upload New Prescription
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
