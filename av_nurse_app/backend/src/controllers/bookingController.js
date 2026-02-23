const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
    // Expected body: { serviceId, date, time, notes, ... }
    // We attach user_id from req.user (set by auth middleware)
    const bookingData = {
        user_id: req.user.id,
        ...req.body,
        status: 'pending', // Default status
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
