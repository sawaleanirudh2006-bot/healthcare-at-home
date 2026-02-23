const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// @desc    Fetch all services
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('services')
            .select('*');

        if (error) {
            console.error("Supabase Get Services Error:", error.message);
            return res.status(500).json({ message: error.message });
        }

        res.json(data);
    } catch (error) {
        console.error("Get Services Server Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch single service
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            return res.status(404).json({ message: 'Service not found' });
        }

        res.json(data);
    } catch (error) {
        console.error("Get Service By ID Error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getServices, getServiceById };
