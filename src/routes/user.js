const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

/**
 * Middleware to verify Supabase JWT token
 * Attaches the user to req.user if valid
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Create a Supabase client with the anon key to verify the token
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('[Auth Middleware] Token verification failed:', error?.message || 'No user found');
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('[Auth Middleware] Error verifying token:', err);
    return res.status(401).json({ error: 'Token verification failed' });
  }
}

/**
 * GET /api/user - Get current authenticated user
 * Requires valid Supabase JWT token in Authorization header
 */
router.get('/api/user', requireAuth, async (req, res) => {
  try {
    // req.user is attached by requireAuth middleware
    res.json({ 
      user: {
        id: req.user.id,
        email: req.user.email,
        user_metadata: req.user.user_metadata,
        app_metadata: req.user.app_metadata,
        created_at: req.user.created_at,
        updated_at: req.user.updated_at
      }
    });
  } catch (err) {
    console.error('[GET /api/user] Error:', err);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

/**
 * PUT /api/user - Update current authenticated user
 * Requires valid Supabase JWT token in Authorization header
 */
router.put('/api/user', requireAuth, async (req, res) => {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { data: { user }, error } = await supabase.auth.admin.updateUserById(
      req.user.id,
      req.body
    );

    if (error) {
      console.error('[PUT /api/user] Update error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ user });
  } catch (err) {
    console.error('[PUT /api/user] Error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

module.exports = router;
module.exports.requireAuth = requireAuth;
