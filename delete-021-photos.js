require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function cleanUp() {
    console.log("Fetching files for student 021...");
    const { data, error } = await supabase.storage.from('student-photos').list('', {
        search: 'student_021_',
        limit: 1000
    });

    if (error) {
        console.error("Error listing files:", error.message);
        return;
    }

    if (!data || data.length === 0) {
        console.log("No files found for student 021.");
        return;
    }

    console.log(`Found ${data.length} files. Deleting...`);
    
    // Extract file names
    const fileNames = data.map(f => f.name);
    
    // Batch delete
    const { error: delError } = await supabase.storage.from('student-photos').remove(fileNames);
    if (delError) {
        console.error("Error deleting files:", delError.message);
    } else {
        console.log(`Successfully deleted ${fileNames.length} duplicate files for student 021.`);
    }
}

cleanUp().then(() => process.exit(0));
