const express = require('express');
const router = express.Router();
const { getSupabase } = require('../lib/supabase');

router.get('/api/history', async (req, res) => {
    const supabase = getSupabase();
    if (!supabase) {
        return res.status(503).json({ error: 'Database not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file.' });
    }

    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: 'Missing userId query parameter.' });

        const { data, error } = await supabase
            .from('generations')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[GET /api/history] Supabase error:', error);
            throw error;
        }

        return res.json({ generations: data || [] });
    } catch (err) {
        console.error('[GET /api/history] Error:', err.message);
        return res.status(500).json({ error: 'Failed to fetch history.' });
    }
});

router.post('/api/history', async (req, res) => {
    const supabase = getSupabase();
    if (!supabase) {
        return res.status(503).json({ error: 'Database not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file.' });
    }

    try {
        const { userId, dbName, tables, authStrategy, endpointCount } = req.body;

        if (!userId) return res.status(400).json({ error: 'Missing userId in request body.' });

        console.log('[POST /api/history] Inserting for user:', userId, '| db:', dbName, '| tables:', tables?.length);

        const { data, error } = await supabase
            .from('generations')
            .insert([{
                user_id: userId,
                db_name: dbName || 'Unknown DB',
                tables: tables || [],
                auth_strategy: authStrategy || 'None',
                endpoint_count: endpointCount || 0,
            }])
            .select();

        if (error) {
            console.error('[POST /api/history] Supabase insert error:', error);
            throw error;
        }

        console.log('[POST /api/history] Inserted row id:', data?.[0]?.id);
        return res.json({ generation: data?.[0] || null });
    } catch (err) {
        console.error('[POST /api/history] Error:', err.message);
        return res.status(500).json({ error: 'Failed to save history.' });
    }
});

router.delete('/api/history/:id', async (req, res) => {
    const supabase = getSupabase();
    if (!supabase) {
        return res.status(503).json({ error: 'Database not configured.' });
    }

    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('generations')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('[DELETE /api/history] Supabase error:', error);
            throw error;
        }

        return res.json({ success: true });
    } catch (err) {
        console.error('[DELETE /api/history] Error:', err.message);
        return res.status(500).json({ error: 'Failed to delete record.' });
    }
});

module.exports = router;
