const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*');

        if (error) {
            return res.status(500).json({ message: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getProducts, getProductById };
