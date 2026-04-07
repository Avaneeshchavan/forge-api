const { createClient } = require('@supabase/supabase-js');

let _client = null;

function getSupabase() {
    console.log("DEBUG: URL is:", process.env.SUPABASE_URL); 
    console.log("DEBUG: Key exists:", !!process.env.SUPABASE_SERVICE_KEY);
    
    if (_client) return _client;

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;

    if (!url || !key || url === 'your_supabase_project_url') {
        console.warn('[Supabase] WARNING: SUPABASE_URL or SUPABASE_SERVICE_KEY not set in .env — history routes will return errors until configured.');
        return null;
    }

    _client = createClient(url, key);
    return _client;
}

module.exports = { getSupabase };
