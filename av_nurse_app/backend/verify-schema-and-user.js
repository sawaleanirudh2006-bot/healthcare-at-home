const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function verify() {
    console.log('Verifying Schema and User...');

    try {
        // 1. Check if 'booking_details' column exists by trying to select it
        // If it doesn't exist, Supabase/Postgres often ignores it in select unless strict, 
        // but let's try to insert a dummy row that would fail if column missing? 
        // No, insert requires auth.
        // Let's just try to select it specifically.

        console.log('1. Checking prescriptions columns...');
        const { data: cols, error: colError } = await supabase
            .from('prescriptions')
            .select('booking_details, file_name')
            .limit(1);

        if (colError) {
            console.error('❌ Column Check Failed:', colError.message);
            if (colError.message.includes('booking_details')) {
                console.log('👉 DETECTED: "booking_details" column is MISSING.');
            }
        } else {
            console.log('✅ Columns "booking_details" and "file_name" seem to exist.');
        }

        // 2. Check foreign key (User)
        const userId = '65ae5cc8-1cad-4648-8027-4ce7a283e33a'; // From logs
        console.log(`2. Checking if user ${userId} exists in 'users' table...`);

        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('id', userId)
            .single();

        if (userError) {
            console.error('❌ User Check Failed:', userError.message);
            console.log('👉 Possible Foreign Key Violation: User ID not found in public.users table.');
        } else if (!user) {
            console.log('❌ User not found in public.users table (FK Constraint will fail).');
        } else {
            console.log('✅ User found in public.users.');
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

verify();
