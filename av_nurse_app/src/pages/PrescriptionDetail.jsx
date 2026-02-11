import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, User, Calendar, Clock, CheckCircle, XCircle, ZoomIn } from 'lucide-react';
import { cn } from '../lib/utils';

export default function PrescriptionDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [prescription, setPrescription] = useState(() => {
        const queue = JSON.parse(localStorage.getItem('prescriptionQueue') || '[]');
        return queue.find(rx => rx.id === id) || null;
    });
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editServiceType, setEditServiceType] = useState(() => {
        const queue = JSON.parse(localStorage.getItem('prescriptionQueue') || '[]');
        const found = queue.find(rx => rx.id === id);
        return found ? found.serviceType : '';
    });
    const [editPrice, setEditPrice] = useState(() => {
        const queue = JSON.parse(localStorage.getItem('prescriptionQueue') || '[]');
        const found = queue.find(rx => rx.id === id);
        return found ? (found.price || '') : '';
    });

    useEffect(() => {
        const loadPrescription = () => {
            const queue = JSON.parse(localStorage.getItem('prescriptionQueue') || '[]');
            const found = queue.find(rx => rx.id === id);
            setPrescription(found);
            if (found) {
                setEditServiceType(found.serviceType);
                setEditPrice(found.price || '');
            }
        };

        if (!prescription || prescription.id !== id) {
            loadPrescription();
        }
    }, [id, prescription]);

    const handleApprove = () => {
        const queue = JSON.parse(localStorage.getItem('prescriptionQueue') || '[]');
        const updated = queue.map(rx => {
            if (rx.id === id) {
                return {
                    ...rx,
                    status: 'approved',
                    reviewedBy: 'Dr. Rajesh Kumar',
                    reviewTime: new Date().toISOString(),
                    // Save edited details
                    serviceType: editServiceType,
                    price: editPrice,
                    // Auto-assign nurse on approval
                    assignedNurse: {
                        name: 'Nurse Sarah',
                        id: 'NURSE-001',
                        phone: '+91 98765 43210',
                        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop',
                        rating: 4.8,
                        experience: '5 years'
                    }
                };
            }
            return rx;
        });
        localStorage.setItem('prescriptionQueue', JSON.stringify(updated));

        // If this is a nursing service, create a nurse assignment logic removed - handled in PaymentSuccess

        navigate('/doctor/dashboard');
    };

    const handleReject = () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }

        const queue = JSON.parse(localStorage.getItem('prescriptionQueue') || '[]');
        const updated = queue.map(rx => {
            if (rx.id === id) {
                return {
                    ...rx,
                    status: 'rejected',
                    reviewedBy: 'Dr. Rajesh Kumar',
                    reviewTime: new Date().toISOString(),
                    rejectionReason: rejectionReason
                };
            }
            return rx;
        });
        localStorage.setItem('prescriptionQueue', JSON.stringify(updated));
        setShowRejectModal(false);
        navigate('/doctor/dashboard');
    };

    if (!prescription) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <p className="text-slate-500">Loading...</p>
            </div>
        );
    }

    const isPending = prescription.status === 'pending';

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 pt-12 pb-4 px-5">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/doctor/dashboard')}
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
                {/* Status Badge */}
                <div className={cn(
                    'rounded-2xl p-4 border-2',
                    prescription.status === 'pending' && 'bg-blue-50 border-blue-200',
                    prescription.status === 'approved' && 'bg-emerald-50 border-emerald-200',
                    prescription.status === 'rejected' && 'bg-red-50 border-red-200'
                )}>
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            'flex size-12 items-center justify-center rounded-full',
                            prescription.status === 'pending' && 'bg-blue-500 text-white',
                            prescription.status === 'approved' && 'bg-emerald-500 text-white',
                            prescription.status === 'rejected' && 'bg-red-500 text-white'
                        )}>
                            {prescription.status === 'pending' && <Clock className="w-6 h-6" />}
                            {prescription.status === 'approved' && <CheckCircle className="w-6 h-6" />}
                            {prescription.status === 'rejected' && <XCircle className="w-6 h-6" />}
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                {prescription.status === 'pending' && 'Pending Review'}
                                {prescription.status === 'approved' && 'Approved'}
                                {prescription.status === 'rejected' && 'Rejected'}
                            </h2>
                            <p className="text-sm font-medium text-slate-600">
                                {prescription.status === 'pending' && 'Awaiting your decision'}
                                {prescription.status === 'approved' && `Approved on ${new Date(prescription.reviewTime).toLocaleDateString()}`}
                                {prescription.status === 'rejected' && `Rejected on ${new Date(prescription.reviewTime).toLocaleDateString()}`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Patient Information */}
                <div className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                            <User className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">Patient Information</h3>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-slate-600">Name</span>
                            <span className="font-bold text-slate-900">{prescription.patientName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-slate-600">Name</span>
                            <span className="font-bold text-slate-900">{prescription.patientName || 'N/A'}</span>
                        </div>

                        {/* Editable Service Details */}
                        <div className="pt-2 border-t border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-slate-600 text-sm">Service Details</span>
                                {isPending && (
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="text-xs font-bold text-blue-500 hover:text-blue-600"
                                    >
                                        {isEditing ? 'Done' : 'Edit'}
                                    </button>
                                )}
                            </div>

                            {isEditing ? (
                                <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 block mb-1">Service Type</label>
                                        <input
                                            type="text"
                                            value={editServiceType}
                                            onChange={(e) => setEditServiceType(e.target.value)}
                                            className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 block mb-1">Price (₹)</label>
                                        <input
                                            type="number"
                                            value={editPrice}
                                            onChange={(e) => setEditPrice(e.target.value)}
                                            className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-slate-600">Service Type</span>
                                        <span className="font-bold text-slate-900 text-right">{isEditing ? editServiceType : (prescription.serviceType || editServiceType)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-slate-600">Price</span>
                                        <span className="font-bold text-slate-900">₹{isEditing ? editPrice : (prescription.price || editPrice)}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                            <span className="font-medium text-slate-600">Uploaded</span>
                            <span className="font-bold text-slate-900">
                                {new Date(prescription.uploadTime).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Prescription File */}
                <div className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <FileText className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">Prescription Document</h3>
                    </div>

                    {/* Prescription Preview */}
                    <div className="bg-slate-50 rounded-xl p-8 border border-slate-200 mb-3">
                        <div className="flex flex-col items-center justify-center text-center">
                            <FileText className="w-16 h-16 text-slate-400 mb-3" />
                            <p className="text-sm font-bold text-slate-900 mb-1">
                                {prescription.prescription?.name || 'prescription.pdf'}
                            </p>
                            <p className="text-xs font-medium text-slate-500">
                                {prescription.prescription?.size || 'N/A'}
                            </p>
                            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors flex items-center gap-2">
                                <ZoomIn className="w-4 h-4" />
                                View Full Size
                            </button>
                        </div>
                    </div>
                </div>

                {/* Rejection Reason (if rejected) */}
                {prescription.status === 'rejected' && prescription.rejectionReason && (
                    <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                        <h3 className="text-sm font-bold text-red-900 mb-2">Rejection Reason</h3>
                        <p className="text-sm font-medium text-red-700">{prescription.rejectionReason}</p>
                    </div>
                )}

                {/* Doctor Notes Preview (if added) */}
                {(prescription.doctorNotes || prescription.diagnosis) && (
                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                        <div className="flex items-center gap-2 mb-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <h3 className="text-sm font-bold text-blue-900">Your Notes</h3>
                        </div>
                        {prescription.diagnosis && (
                            <div className="mb-3">
                                <p className="text-xs font-bold text-slate-500 uppercase">Diagnosis</p>
                                <p className="text-sm font-semibold text-slate-900">{prescription.diagnosis}</p>
                            </div>
                        )}
                        {prescription.doctorNotes && (
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase">Consultation Notes</p>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{prescription.doctorNotes}</p>
                            </div>
                        )}
                        {prescription.recommendations && (
                            <div className="mt-3">
                                <p className="text-xs font-bold text-slate-500 uppercase">Recommendations</p>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{prescription.recommendations}</p>
                            </div>
                        )}
                        {prescription.doctorPrescription && (
                            <div className="mt-3 pt-3 border-t border-blue-200">
                                <p className="text-xs font-bold text-slate-500 uppercase">Prescription Text</p>
                                <p className="text-sm font-mono text-slate-700 whitespace-pre-wrap">{prescription.doctorPrescription}</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Bottom Actions - Only show if pending */}
            {isPending && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-5 max-w-[430px] mx-auto w-full">
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => setShowRejectModal(true)}
                            className="h-14 rounded-2xl bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-500/20 hover:bg-red-600 active:scale-[0.98] transition-all flex items-center justify-center gap-1"
                        >
                            <XCircle className="w-4 h-4" />
                            Reject
                        </button>
                        <button
                            onClick={() => navigate(`/doctor/add-notes/${prescription.id}`, { state: { prescription } })}
                            className="h-14 rounded-2xl bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-600 active:scale-[0.98] transition-all flex items-center justify-center gap-1"
                        >
                            <FileText className="w-4 h-4" />
                            Add Notes
                        </button>
                        <button
                            onClick={handleApprove}
                            className="h-14 rounded-2xl bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-[0.98] transition-all flex items-center justify-center gap-1"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                        </button>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-5">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in duration-200">
                        <h2 className="text-lg font-bold text-slate-900 mb-2">Reject Prescription</h2>
                        <p className="text-sm font-medium text-slate-600 mb-4">
                            Please provide a reason for rejection to help the patient understand.
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g., Prescription image is unclear, missing doctor signature..."
                            className="w-full h-32 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm resize-none"
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason('');
                                }}
                                className="flex-1 h-11 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                className="flex-1 h-11 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors"
                            >
                                Confirm Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
