const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// @desc    Upload a new prescription
// @route   POST /api/bookings/upload-prescription
// @access  Private
const uploadPrescription = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const file = req.file;
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExt}`;
        const filePath = `${req.user.id}/${fileName}`;

        console.log(`[DEBUG] Uploading file for user: ${req.user.id}`);
        console.log(`[DEBUG] File path: ${filePath}`);

        // Create an authenticated Supabase client using the user's token
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No authorization token provided' });
        }

        const authenticatedSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        });

        // 1. Upload file to Supabase Storage using authenticated client
        const { data: storageData, error: storageError } = await authenticatedSupabase
            .storage
            .from('prescriptions')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (storageError) {
            console.error("Supabase Storage Error:", storageError);
            return res.status(500).json({ message: 'Failed to upload file to storage', error: storageError.message });
        }

        // 2. Get public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('prescriptions')
            .getPublicUrl(filePath);

        // 3. Create prescription record in database
        // Expected body: { serviceType, price, date, time, ... }
        const prescriptionData = {
            user_id: req.user.id,
            patient_name: req.body.patientName || req.user.name,
            service_type: req.body.serviceType || 'Prescription Upload',
            file_url: publicUrl,
            file_name: file.originalname,
            status: 'pending',
            created_at: new Date().toISOString(),
            // Store additional booking details if provided
            booking_details: {
                date: req.body.date,
                time: req.body.time,
                price: req.body.price,
                is_iv_service: req.body.isIVService === 'true',
                is_package: req.body.isPackage === 'true'
            }
        };

        const { data: dbData, error: dbError } = await supabase
            .from('prescriptions')
            .insert([prescriptionData])
            .select();

        if (dbError) {
            console.error("Supabase DB Error:", dbError);
            // Try to clean up the uploaded file if DB insert fails
            await supabase.storage.from('prescriptions').remove([filePath]);
            return res.status(500).json({ message: 'Failed to save prescription details', error: dbError.message });
        }

        res.status(201).json(dbData[0]);

    } catch (error) {
        console.error("Upload Prescription Error:", error);
        res.status(500).json({ message: 'Server error during upload', error: error.message });
    }
};

// @desc    Get all prescriptions (for doctors/admin)
// @route   GET /api/bookings/prescriptions
// @access  Private (Doctor/Admin)
const getAllPrescriptions = async (req, res) => {
    try {
        let query = supabase
            .from('prescriptions')
            .select('*')
            .order('created_at', { ascending: false });

        // Filter by status if query param provided
        if (req.query.status && req.query.status !== 'all') {
            query = query.eq('status', req.query.status);
        }

        const { data, error } = await query;

        if (error) {
            return res.status(500).json({ message: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update prescription status
// @route   PUT /api/bookings/prescriptions/:id
// @access  Private (Doctor/Admin)
const updatePrescriptionStatus = async (req, res) => {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    try {
        const updateData = {
            status,
            reviewed_by: req.user.id,
            review_time: new Date().toISOString()
        };

        if (status === 'rejected') {
            updateData.rejection_reason = rejectionReason;
        }

        const { data, error } = await supabase
            .from('prescriptions')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(500).json({ message: error.message });
        }

        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my prescriptions
// @route   GET /api/bookings/my-prescriptions
// @access  Private
const getMyPrescriptions = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('prescriptions')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ message: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    uploadPrescription,
    getAllPrescriptions,
    updatePrescriptionStatus,
    getMyPrescriptions
};
