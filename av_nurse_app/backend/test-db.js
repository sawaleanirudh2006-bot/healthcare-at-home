const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function testDB() {
    console.log('Testing Supabase DB...');

    try {
        // 1. Check if table exists by selecting
        console.log('Checking "prescriptions" table existence...');
        const { data: selectData, error: selectError } = await supabase
            .from('prescriptions')
            .select('id')
            .limit(1);

        if (selectError) {
            console.error('❌ Table check failed:', selectError.message);
            console.error('Full Error:', selectError);
            if (selectError.code === '42P01') {
                console.log('👉 DETECTED: Table "prescriptions" does not exist.');
            }
            return;
        } else {
            console.log('✅ Table "prescriptions" exists.');
        }

        // 2. Try to insert (this might fail if not authenticated, but will give us a hint)
        // We need a valid user ID. The ANON/Public role usually can't insert unless we set a policy.
        // We will skip this if we don't have a user, but at least we confirmed the table exists.

        console.log('NOTE: If table exists but upload fails, it is likely an RLS Policy issue on the TABLE.');
        console.log('Ensure you ran: "create policy \\"Enable insert for authenticated users only\\" on \\"public\\".\\"prescriptions\\" as PERMISSIVE for INSERT to authenticated with check (true);"')

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testDB();
