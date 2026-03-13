const router = require('express').Router();
const pool   = require('../db');
const authMW = require('../middleware/auth');

// ── REGISTER ──────────────────────────────────────────────────
// Called from frontend AFTER supabase.auth.signUp() succeeds
// Creates the user record in your own DB using Supabase UUID
router.post('/register', authMW, async (req, res) => {
  const { name } = req.body;
  const { id, email } = req.user; // Supabase UUID
  try {
    // Check if user already exists
    const exists = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (exists.rows.length > 0)
      return res.status(409).json({ error: 'User already exists' });

    // Create user in your DB using Supabase UUID as id
    await pool.query(
      'INSERT INTO users (id, name, email) VALUES ($1, $2, $3)',
      [id, name, email]
    );

    // Create default profile and goals
    await pool.query('INSERT INTO profiles (user_id) VALUES ($1)', [id]);
    await pool.query('INSERT INTO goals    (user_id) VALUES ($1)', [id]);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// ── GET CURRENT USER ──────────────────────────────────────────
router.get('/me', authMW, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!rows.length)
      return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Me error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;