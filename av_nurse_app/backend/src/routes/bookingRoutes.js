const express = require('express');
const router = express.Router();
const {
    createBooking,
    getMyBookings,
    getAllBookings,
    updateBookingStatus
} = require('../controllers/bookingController');
const {
    uploadPrescription,
    getAllPrescriptions,
    updatePrescriptionStatus,
    getMyPrescriptions
} = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Booking Routes
router.post('/', protect, createBooking);
router.get('/mybookings', protect, getMyBookings);
router.get('/all', protect, getAllBookings); // For doctors/admin
router.put('/:id', protect, updateBookingStatus); // For doctors/admin

// Prescription Routes
router.post('/upload-prescription', protect, upload.single('prescription'), uploadPrescription);
router.get('/prescriptions', protect, getAllPrescriptions); // For doctors/admin
router.get('/my-prescriptions', protect, getMyPrescriptions);
router.put('/prescriptions/:id', protect, updatePrescriptionStatus); // For doctors/admin

module.exports = router;
