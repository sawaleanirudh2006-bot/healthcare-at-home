const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            // Return 401 for invalid credentials
            console.error("Supabase Login Error:", error.message);
            return res.status(401).json({ message: error.message });
        }

        if (data.user) {
            res.json({
                _id: data.user.id,
                name: data.user.user_metadata.name || 'User', // Fallback
                email: data.user.email,
                token: data.session.access_token, // Use Supabase token
                role: data.user.user_metadata.role || 'Patient' // Fallback
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }

    } catch (error) {
        console.error("Login Server Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    role: role || 'Patient',
                },
            },
        });

        if (error) {
            console.error("Supabase Register Error:", error.message);
            return res.status(400).json({ message: error.message });
        }

        if (data.user) {
            res.status(201).json({
                _id: data.user.id,
                name: data.user.user_metadata.name,
                email: data.user.email,
                token: data.session ? data.session.access_token : null, // Session might be null if email confirmation is required
                role: data.user.user_metadata.role,
                message: 'Registration successful. Please check your email for verification if enabled.'
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error("Register Server Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    // In a real app, 'req.user' would be populated by an auth middleware verifying the Supabase token.
    // For now, we might receive the user via the middleware if we implemented one.
    // If we haven't implemented middleware yet, this endpoint might fail or need to query Supabase with the token from headers.

    // Simple implementation assuming middleware sets req.user
    if (req.user) {
        res.json({
            _id: req.user.id,
            name: req.user.user_metadata.name,
            email: req.user.email,
            role: req.user.user_metadata.role
        });
    } else {
        // If no middleware, we can try to get user from Supabase using the token in header
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json({
            _id: user.id,
            name: user.user_metadata.name,
            email: user.email,
            role: user.user_metadata.role
        });
    }
};

module.exports = { loginUser, registerUser, getMe };
