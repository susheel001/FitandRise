const router                     = require('express').Router();
const bcrypt                     = require('bcryptjs');
const jwt                        = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool                       = require('../db');
const authMW                     = require('../middleware/auth');

// ── HELPER — strips password before sending to frontend ───────
const safeUser = (user) => ({
  id:         user.id,
  name:       user.name,
  email:      user.email,
  created_at: user.created_at,
  // password is intentionally excluded here
});

// ── REGISTER ──────────────────────────────────────────────────
router.post('/register', [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 50 }).withMessage('Name too long'),
  body('email')
    .trim()
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .isLength({ max: 50 }).withMessage('Password too long'),
], async (req, res) => {

  // Validation check
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ error: errors.array()[0].msg });

  const { name, email, password } = req.body;

  try {
    // Check duplicate email
    const exists = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    if (exists.rows.length > 0)
      return res.status(409).json({ error: 'This email is already registered' });

    // Hash password — never store plain text
    const hashed = await bcrypt.hash(password, 12);

    // Create user — only return safe fields, never return hashed password
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, hashed]
    );
    const user = rows[0];

    // Create default profile and goals
    await pool.query('INSERT INTO profiles (user_id) VALUES ($1)', [user.id]);
    await pool.query('INSERT INTO goals    (user_id) VALUES ($1)', [user.id]);

    // Issue JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Send token + safe user (no password)
    res.status(201).json({ token, user: safeUser(user) });

  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// ── LOGIN ─────────────────────────────────────────────────────
router.post('/login', [
  body('email')
    .trim()
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ error: errors.array()[0].msg });

  const { email, password } = req.body;

  try {
    // Fetch user — we need password here only for bcrypt compare
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    // Same error message for wrong email OR wrong password
    // This prevents hackers from knowing which one is wrong
    if (rows.length === 0)
      return res.status(401).json({ error: 'Invalid email or password' });

    const user  = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Send token + safe user (no password)
    res.json({ token, user: safeUser(user) });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ── GET CURRENT USER ──────────────────────────────────────────
router.get('/me', authMW, async (req, res) => {
  try {
    // Never SELECT * — always pick exact fields
    const { rows } = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!rows.length)
      return res.status(404).json({ error: 'User not found' });

    // safeUser not needed here since we didn't select password
    // but using it anyway for consistency
    res.json(safeUser(rows[0]));

  } catch (err) {
    console.error('Me error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;