const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
    // Only extract fields that exist in the Supabase schema
    const bookingData = {
        user_id: req.user.id,
        service_id: req.body.service_id,
        service_name: req.body.service_name,
        date: req.body.date || new Date().toISOString().split('T')[0],
        time: req.body.time || 'TBD',
        total_price: req.body.price,
        address_street: req.body.address_street,
        status: 'pending', // Default status
        notes: req.body.notes || JSON.stringify({
            cart_items: req.body.cart_items,
            doctor_notes: req.body.doctor_notes,
            diagnosis: req.body.diagnosis,
            recommendations: req.body.recommendations,
            doctor_prescription: req.body.doctor_prescription,
            is_medicine_order: req.body.is_medicine_order,
            payment_method: req.body.payment_method,
            nurse_id: req.body.nurse_id
        }),
        created_at: new Date().toISOString()
    };

    try {
        const { data, error } = await supabase
            .from('bookings')
            .insert([bookingData])
            .select();

        if (error) {
            console.error("Supabase Create Booking Error:", error.message);
            return res.status(400).json({ message: error.message });
        }

        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
const getMyBookings = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
        *,
        services:service_id (name, price) 
      `) // Assuming relationship exists. If not, simple select('*') is safer.
            .eq('user_id', req.user.id);

        if (error) {
            // Fallback if relation fail (e.g., service_id foreign key issue)
            const { data: fallbackData, error: fallbackError } = await supabase
                .from('bookings')
                .select('*')
                .eq('user_id', req.user.id);

            if (fallbackError) return res.status(500).json({ message: fallbackError.message });
            return res.json(fallbackData);
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all bookings (for doctors/admin)
// @route   GET /api/bookings/all
// @access  Private (Doctor/Admin)
const getAllBookings = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                services:service_id (name, price) 
            `)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ message: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private (Doctor/Admin)
const updateBookingStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const { data, error } = await supabase
            .from('bookings')
            .update({ status })
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

module.exports = { createBooking, getMyBookings, getAllBookings, updateBookingStatus };
