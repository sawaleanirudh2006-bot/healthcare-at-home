const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function fixUser() {
    console.log('Fixing User FK Violation...');

    const userId = '65ae5cc8-1cad-4648-8027-4ce7a283e33a';

    // We don't have the user's details (name, email) easily accessible here without admin API or the token.
    // However, if we insert a dummy user with this ID into public.users, it will satisfy the FK constraint.
    // The user can update their profile later, or we can fetch details if we had the service role key (which we don't seem to have fully working or trusted).

    // Attempt to insert the user into public.users
    // We will use a placeholder email/name if not provided.

    const userData = {
        id: userId,
        name: 'Restored User',
        email: 'restored_user@example.com', // Placeholder
        role: 'Patient', // Assuming patient
        created_at: new Date().toISOString()
    };

    console.log(`Attempting to restore user ${userId} to public.users...`);

    const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select();

    if (error) {
        console.error('❌ Failed to restore user:', error.message);
        console.log('This might fail due to RLS if we are not authenticated as this user or admin.');
        console.log('You might need to run SQL manually.');
    } else {
        console.log('✅ User restored successfully to public.users!');
    }
}

fixUser();
