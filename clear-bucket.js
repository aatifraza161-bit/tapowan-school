require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function clearBucket() {
    console.log("Fetching all files in 'student-photos' bucket...");
    
    let allFiles = [];
    let hasMore = true;
    let offset = 0;
    
    while(hasMore) {
        const { data, error } = await supabase.storage.from('student-photos').list('', {
            limit: 1000,
            offset: offset
        });
        
        if (error) {
            console.error("Error listing files:", error.message);
            return;
        }
        
        if (!data || data.length === 0) {
            hasMore = false;
        } else {
            allFiles = allFiles.concat(data);
            offset += data.length;
        }
    }

    if (allFiles.length === 0) {
        console.log("Bucket is already empty.");
        return;
    }

    console.log(`Found ${allFiles.length} files. Deleting in batches...`);
    
    // Extract file names
    const fileNames = allFiles.map(f => f.name);
    
    // Batch delete (Supabase limits remove to 100-1000 items at a time, let's do 500)
    const BATCH_SIZE = 500;
    for(let i = 0; i < fileNames.length; i += BATCH_SIZE) {
        const batch = fileNames.slice(i, i + BATCH_SIZE);
        const { error: delError } = await supabase.storage.from('student-photos').remove(batch);
        if (delError) {
            console.error(`Error deleting batch ${i/BATCH_SIZE + 1}:`, delError.message);
        } else {
            console.log(`Successfully deleted batch ${Math.floor(i/BATCH_SIZE) + 1} (${batch.length} files).`);
        }
    }
    
    console.log("Finished clearing the bucket!");
}

clearBucket().then(() => process.exit(0));
