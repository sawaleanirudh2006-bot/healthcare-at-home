import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cvgvezimtqrwrcskllwz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2Z3ZlemltdHFyd3Jjc2tsbHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NzI5NTIsImV4cCI6MjA4NjU0ODk1Mn0.gZAOh9_qakIP-hKoa-13clH6YbR0Q_hQ5MuHfoRbe5k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
        params: { eventsPerSecond: 10 },
    },
});

