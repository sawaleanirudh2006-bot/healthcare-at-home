import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Upload, Camera, Image, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabaseClient';

export default function UploadPrescription() {
    const navigate = useNavigate();
    const location = useLocation();
    const { serviceType, price, date, time, isIVService, isPackage, packageDetails } = location.state || {};

    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [showCamera, setShowCamera] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [cameraError, setCameraError] = useState(null);

    const startCamera = async () => {
        try {
            setCameraError(null);
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setCameraStream(stream);
            setShowCamera(true);
        } catch (err) {
            setCameraError("Unable to access camera. Please check permissions.");
            document.getElementById('camera-input').click();
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setShowCamera(false);
    };

    const capturePhoto = () => {
        const video = document.getElementById('camera-video');
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            const file = new File([blob], "captured-prescription.jpg", { type: "image/jpeg" });
            setUploadedFile({
                name: file.name,
                size: (file.size / 1024).toFixed(2) + ' KB',
                type: file.type,
                file: file // Store the actual file object
            });
            stopCamera();
        }, 'image/jpeg');
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Store file immediately
            setUploadedFile({
                name: file.name,
                size: (file.size / 1024).toFixed(2) + ' KB',
                type: file.type,
                file: file // Store the actual file object
            });
        }
    };

    const handleSubmit = async () => {
        if (!(uploadedFile || isIVService || isPackage)) return;

        try {
            setUploading(true);

            // Get current logged-in user from Supabase
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert('Please login to continue');
                navigate('/login/patient');
                return;
            }
            const userId = session.user.id;
            const userName = session.user.user_metadata?.name || 'Patient';

            let fileUrl = null;

            // Upload file to Supabase Storage if a file was selected
            if (uploadedFile && uploadedFile.file) {
                const fileExt = uploadedFile.file.name.split('.').pop();
                const filePath = `prescriptions/${userId}/${Date.now()}.${fileExt}`;

                const { error: storageError } = await supabase.storage
                    .from('prescriptions')
                    .upload(filePath, uploadedFile.file, { upsert: true });

                if (storageError) throw new Error(storageError.message);

                const { data: urlData } = supabase.storage
                    .from('prescriptions')
                    .getPublicUrl(filePath);

                fileUrl = urlData?.publicUrl || null;
            }

            // Save record to the prescriptions table in Supabase
            // Schema: user_id, patient_name, service_type, file_url, file_name, status, booking_details (JSONB)
            const { data: record, error: dbError } = await supabase
                .from('prescriptions')
                .insert([
                    {
                        user_id: userId,
                        patient_name: userName,
                        service_type: serviceType || 'Medicine Order',
                        file_url: fileUrl,
                        file_name: uploadedFile?.name || null,
                        status: 'pending',
                        booking_details: {
                            date: date || null,
                            time: time || null,
                            price: price || 0,
                            is_iv_service: isIVService || false,
                            is_package: isPackage || false,
                            package_details: packageDetails || null,
                        },
                    },
                ])
                .select()
                .single();

            if (dbError) throw new Error(dbError.message);

            setUploading(false);

            // Navigate to review page
            navigate('/prescription-review', {
                state: {
                    prescriptionId: record.id,
                    serviceType,
                    price,
                    date,
                    time,
                    prescription: { name: uploadedFile?.name, url: fileUrl },
                    nurse: location.state?.nurse,
                    isRebooking: location.state?.isRebooking,
                    isMedicineOrder: location.state?.isMedicineOrder || location.state?.fromStore || false,
                    cartItems: location.state?.cartItems,
                    total: location.state?.total,
                    isIVService,
                    isPackage,
                    packageDetails,
                    status: 'pending'
                },
            });

        } catch (error) {
            setUploading(false);
            alert('Failed to upload prescription: ' + error.message);
        }
    };

    // Camera Modal
    const CameraModal = () => (
        <div className="fixed inset-0 z-[60] bg-black bg-opacity-90 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-black rounded-3xl overflow-hidden relative">
                {cameraError ? (
                    <div className="p-8 text-white text-center">
                        <p className="mb-4">{cameraError}</p>
                        <button onClick={stopCamera} className="px-4 py-2 bg-slate-700 rounded-xl">Close</button>
                    </div>
                ) : (
                    <>
                        <video
                            id="camera-video"
                            autoPlay
                            playsInline
                            ref={video => { if (video && cameraStream) video.srcObject = cameraStream; }}
                            className="w-full h-[60vh] object-cover"
                        />
                        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6 items-center">
                            <button
                                onClick={stopCamera}
                                className="size-12 rounded-full bg-slate-800/80 text-white flex items-center justify-center backdrop-blur-sm"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={capturePhoto}
                                className="size-20 rounded-full border-4 border-white bg-transparent flex items-center justify-center hover:bg-white/20 transition-all"
                            >
                                <div className="size-16 rounded-full bg-white"></div>
                            </button>
                            <div className="size-12"></div> {/* Spacer for symmetry */}
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background max-w-[430px] mx-auto">
            {showCamera && <CameraModal />}
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 pt-12 pb-4 px-5">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">
                        {isIVService ? 'Request Consultation' : 'Upload Prescription'}
                    </h1>
                    <div className="w-10" />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-5 py-6 space-y-6 pb-32">
                {/* Info Banner */}
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                    <div className="flex gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500 text-white shrink-0">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-slate-900">
                                {isIVService || isPackage ? (isIVService ? 'Doctor Consultation Required' : 'Package Assessment Required') : 'Prescription Required'}
                            </h3>
                            <p className="text-xs font-medium text-slate-600 mt-1 leading-relaxed">
                                {isIVService
                                    ? 'For IV fluids, our doctor will consult with you to confirm the exact dosage and package required before assigning a nurse.'
                                    : isPackage
                                        ? 'Our team will review your package request and coordinate with you for the initial assessment and setup.'
                                        : 'Please upload a valid prescription from a registered doctor. Our medical team will review and approve it before assigning a nurse.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Service Summary */}
                <div className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Booking Details</p>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-slate-600">Service</span>
                            <span className="text-sm font-bold text-slate-900">{serviceType}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-slate-600">Date & Time</span>
                            <span className="text-sm font-bold text-slate-900">
                                {date && new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {time}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Upload Area - Optional for IV Service and Package */}
                {!isIVService && !isPackage && (
                    <div className="space-y-3">
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Upload Options</h2>

                        {!uploadedFile ? (
                            <div className="space-y-3">
                                {/* File Upload */}
                                <label className="block">
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        disabled={uploading}
                                    />
                                    <div className={cn(
                                        'flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all',
                                        uploading
                                            ? 'border-primary bg-primary/5 cursor-wait'
                                            : 'border-slate-200 bg-white hover:border-primary hover:bg-primary/5'
                                    )}>
                                        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            {uploading ? (
                                                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Upload className="w-6 h-6" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-bold text-slate-900">
                                                {uploading ? 'Uploading...' : 'Upload from Gallery'}
                                            </h3>
                                            <p className="text-xs font-medium text-slate-500 mt-0.5">
                                                JPG, PNG or PDF (Max 5MB)
                                            </p>
                                        </div>
                                        <Image className="w-5 h-5 text-slate-400" />
                                    </div>
                                </label>

                                {/* Camera Option */}
                                <div
                                    onClick={startCamera}
                                    className="flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-white hover:border-primary hover:bg-primary/5 cursor-pointer transition-all active:scale-95"
                                >
                                    {/* Fallback hidden input for permissions denied or mobile preference */}
                                    <input
                                        id="camera-input"
                                        type="file"
                                        accept="image/*;capture=camera"
                                        capture="environment"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        disabled={uploading}
                                        onClick={(e) => e.stopPropagation()} // Prevent double trigger
                                    />
                                    <div className="flex size-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                                        <Camera className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-slate-900">Take Photo</h3>
                                        <p className="text-xs font-medium text-slate-500 mt-0.5">
                                            Use camera to capture prescription
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Uploaded File Preview */
                            <div className="bg-white rounded-2xl p-4 shadow-soft border border-emerald-200">
                                <div className="flex items-center gap-4">
                                    <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500 text-white">
                                        <CheckCircle className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-slate-900 truncate">{uploadedFile.name}</h3>
                                        <p className="text-xs font-medium text-slate-500 mt-0.5">{uploadedFile.size}</p>
                                    </div>
                                    <button
                                        onClick={() => setUploadedFile(null)}
                                        className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Guidelines */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">
                        {isIVService ? 'Consultation Process' : 'Prescription Guidelines'}
                    </h3>
                    <ul className="space-y-2">
                        {isIVService ? (
                            <>
                                <li className="flex items-start gap-2 text-xs font-medium text-slate-600">
                                    <span className="text-emerald-500 mt-0.5">✓</span>
                                    <span>Doctor will review your request</span>
                                </li>
                                <li className="flex items-start gap-2 text-xs font-medium text-slate-600">
                                    <span className="text-emerald-500 mt-0.5">✓</span>
                                    <span>Quick call to confirm fluids/medication</span>
                                </li>
                                <li className="flex items-start gap-2 text-xs font-medium text-slate-600">
                                    <span className="text-emerald-500 mt-0.5">✓</span>
                                    <span>Nurse assigned immediately after approval</span>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="flex items-start gap-2 text-xs font-medium text-slate-600">
                                    <span className="text-emerald-500 mt-0.5">✓</span>
                                    <span>Must be from a registered medical practitioner</span>
                                </li>
                                <li className="flex items-start gap-2 text-xs font-medium text-slate-600">
                                    <span className="text-emerald-500 mt-0.5">✓</span>
                                    <span>Should be clear and readable</span>
                                </li>
                                <li className="flex items-start gap-2 text-xs font-medium text-slate-600">
                                    <span className="text-emerald-500 mt-0.5">✓</span>
                                    <span>Must include doctor's signature and stamp</span>
                                </li>
                                <li className="flex items-start gap-2 text-xs font-medium text-slate-600">
                                    <span className="text-emerald-500 mt-0.5">✓</span>
                                    <span>Valid for 30 days from issue date</span>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </main>

            {/* Bottom Action */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-5 max-w-[430px] mx-auto w-full">
                <button
                    onClick={handleSubmit}
                    disabled={!uploadedFile && !isIVService && !isPackage}
                    className={cn(
                        'w-full h-14 rounded-2xl font-bold text-base shadow-lg transition-all',
                        (uploadedFile || isIVService || isPackage)
                            ? 'bg-primary text-white shadow-primary/20 hover:bg-primary/90 active:scale-[0.98]'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    )}
                >
                    {isIVService ? 'Request Consultation' : isPackage ? 'Request Package' : 'Submit for Review'}
                </button>
            </div>
        </div>
    );
}
