const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function testStorage() {
    console.log('Testing Supabase Storage...');

    try {
        // List all buckets
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
            console.error('Error listing buckets:', listError.message);
            return;
        }

        console.log('Available buckets:', buckets.map(b => b.name));

        const prescriptionBucket = buckets.find(b => b.name === 'prescriptions');
        if (!prescriptionBucket) {
            console.error('❌ "prescriptions" bucket NOT found!');
            console.log('Please run the SQL command to create the bucket.');
        } else {
            console.log('✅ "prescriptions" bucket found.');
            console.log('Public:', prescriptionBucket.public);
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testStorage();
