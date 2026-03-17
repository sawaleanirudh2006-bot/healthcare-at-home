import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, User, Calendar, Clock, CheckCircle, XCircle, ZoomIn, X, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabaseClient';

export default function PrescriptionDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [prescription, setPrescription] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editServiceType, setEditServiceType] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [loading, setLoading] = useState(true);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    useEffect(() => {
        const fetchPrescription = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('prescriptions')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !data) {
                console.error('Failed to load prescription:', error?.message);
                setLoading(false);
                return;
            }

            const formatted = {
                id: data.id,
                userId: data.user_id,           // needed for Strategy B booking lookup
                patientName: data.patient_name,
                serviceType: data.service_type,
                uploadTime: data.created_at,
                status: data.status,
                rejectionReason: data.rejection_reason,
                reviewTime: data.review_time,
                prescription: { name: data.file_name, url: data.file_url },
                bookingDetails: data.booking_details,   // JSON object with booking_id inside
                price: data.booking_details?.price || '',
            };
            setPrescription(formatted);
            setEditServiceType(formatted.serviceType || '');
            setEditPrice(formatted.price || '');
            setLoading(false);
        };
        fetchPrescription();
    }, [id]);

    // Helper: find the linked booking ID using two strategies
    const findLinkedBookingId = async () => {
        // Strategy A: booking_id stored inside booking_details JSON
        const fromJson = prescription.bookingDetails?.booking_id;
        if (fromJson) return fromJson;

        // Strategy B: look up the most recent 'pending' booking for this patient by user_id
        const userId = prescription.userId;
        if (!userId) return null;

        const { data } = await supabase
            .from('bookings')
            .select('id')
            .eq('user_id', userId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        return data?.id || null;
    };

    const handleApprove = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const localUser = JSON.parse(localStorage.getItem('doctorData') || '{}');
        const doctorId = session?.user?.id || localUser?.user_id || localUser?.id || null;

        // 1. Mark prescription as approved
        const { error } = await supabase
            .from('prescriptions')
            .update({
                status: 'approved',
                reviewed_by: doctorId,
                review_time: new Date().toISOString(),
                service_type: editServiceType || prescription.serviceType,
            })
            .eq('id', id);

        if (error) {
            alert('Failed to approve: ' + error.message);
            return;
        }

        // 2. Set the linked booking to 'confirmed'
        //    'confirmed' is the DB-allowed status that makes the booking visible to nurses
        const bookingId = await findLinkedBookingId();
        if (bookingId) {
            const { error: bErr } = await supabase
                .from('bookings')
                .update({ status: 'confirmed' })
                .eq('id', bookingId);
            if (bErr) {
                alert('Prescription approved but nurse assignment failed: ' + bErr.message);
                return;
            }
        }

        navigate('/doctor/dashboard');
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        const localUser = JSON.parse(localStorage.getItem('doctorData') || '{}');
        const doctorId = session?.user?.id || localUser?.user_id || localUser?.id || null;

        // 1. Mark prescription as rejected
        const { error } = await supabase
            .from('prescriptions')
            .update({
                status: 'rejected',
                reviewed_by: doctorId,
                review_time: new Date().toISOString(),
                rejection_reason: rejectionReason,
            })
            .eq('id', id);

        if (error) {
            alert('Failed to reject: ' + error.message);
            return;
        }

        // 2. Cancel the linked booking + mark refund as pending in notes
        const bookingId = await findLinkedBookingId();
        if (bookingId) {
            // Fetch the current notes so we can merge refund info in
            const { data: bData } = await supabase
                .from('bookings')
                .select('notes')
                .eq('id', bookingId)
                .single();

            let currentNotes = {};
            try { currentNotes = JSON.parse(bData?.notes || '{}'); } catch (_) { }

            const updatedNotes = JSON.stringify({
                ...currentNotes,
                refund_status: 'pending',
                refund_reason: rejectionReason,
                refund_initiated_at: new Date().toISOString(),
            });

            await supabase
                .from('bookings')
                .update({ status: 'rejected', notes: updatedNotes })
                .eq('id', bookingId);
        }

        setShowRejectModal(false);
        navigate('/doctor/dashboard');
    };

    if (loading) {
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
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <FileText className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900">Prescription Document</h3>
                        </div>
                        {prescription.prescription?.url && (
                            <a
                                href={prescription.prescription.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Open
                            </a>
                        )}
                    </div>

                    {prescription.prescription?.url ? (
                        (() => {
                            const url = prescription.prescription.url;
                            const isPdf = url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('pdf');
                            return isPdf ? (
                                /* PDF — show open button */
                                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col items-center gap-3">
                                    <FileText className="w-14 h-14 text-red-400" />
                                    <p className="text-sm font-bold text-slate-700">{prescription.prescription.name || 'prescription.pdf'}</p>
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-5 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors flex items-center gap-2"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        View PDF
                                    </a>
                                </div>
                            ) : (
                                /* Image — show inline + lightbox */
                                <>
                                    <div
                                        className="relative cursor-zoom-in rounded-xl overflow-hidden border border-slate-200 bg-slate-50"
                                        onClick={() => setLightboxOpen(true)}
                                    >
                                        <img
                                            src={url}
                                            alt="Prescription"
                                            className="w-full object-contain max-h-72"
                                        />
                                        <div className="absolute bottom-2 right-2 bg-black/60 text-white rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-xs font-bold">
                                            <ZoomIn className="w-3.5 h-3.5" />
                                            Tap to enlarge
                                        </div>
                                    </div>

                                    {/* Lightbox */}
                                    {lightboxOpen && (
                                        <div
                                            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
                                            onClick={() => setLightboxOpen(false)}
                                        >
                                            <button
                                                onClick={() => setLightboxOpen(false)}
                                                className="absolute top-5 right-5 bg-white/20 text-white rounded-full p-2 hover:bg-white/30 transition-colors"
                                            >
                                                <X className="w-6 h-6" />
                                            </button>
                                            <img
                                                src={url}
                                                alt="Prescription full size"
                                                className="max-w-full max-h-full object-contain rounded-lg"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    )}
                                </>
                            );
                        })()
                    ) : (
                        /* No file URL */
                        <div className="bg-slate-50 rounded-xl p-8 border border-slate-200 text-center">
                            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm font-medium text-slate-400">No file available</p>
                        </div>
                    )}
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
