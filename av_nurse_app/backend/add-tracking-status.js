/**
 * Run this ONCE to add the tracking_status column to the bookings table.
 * After running, the NurseDashboard and ServiceTracking pages will work in real-time.
 *
 * Usage:  node add-tracking-status.js
 */
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cvgvezimtqrwrcskllwz.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY ||
    'YOUR_SERVICE_ROLE_KEY_HERE'; // ← Replace with your service role key from Supabase dashboard

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrate() {
    console.log('Adding tracking_status column to bookings table...');

    // Use the REST API to run raw SQL via the pg endpoint
    const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
            ALTER TABLE bookings
            ADD COLUMN IF NOT EXISTS tracking_status text
            CHECK (tracking_status IN ('to_godown','items_picked','on_the_way','arrived') OR tracking_status IS NULL);

            -- Also enable realtime for the bookings table if not already enabled
            ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
        `
    });

    if (error) {
        console.error('Migration error (RPC might not exist — try manual SQL below):', error.message);
        console.log('\n=== RUN THIS SQL MANUALLY IN SUPABASE DASHBOARD → SQL Editor ===');
        console.log(`
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS tracking_status text;

-- Also migrate existing data from notes JSON into the column
UPDATE bookings
SET tracking_status = notes::jsonb->>'tracking_status'
WHERE notes IS NOT NULL
  AND notes::jsonb->>'tracking_status' IS NOT NULL;

-- Enable realtime on bookings table
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
        `);
    } else {
        console.log('✅ Migration complete!', data);
    }
}

migrate().catch(console.error);
