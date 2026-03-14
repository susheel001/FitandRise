const router = require('express').Router();
const pool   = require('../db');
const auth   = require('../middleware/auth');

// ── GET profile + goals ───────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    // ── Auto-create user in DB if not exists ──────────────────
    await pool.query(`
      INSERT INTO users (id, name, email)
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO NOTHING
    `, [req.user.id, req.user.name, req.user.email]);

    // ── Auto-create profile if not exists ─────────────────────
    await pool.query(`
      INSERT INTO profiles (user_id)
      VALUES ($1)
      ON CONFLICT (user_id) DO NOTHING
    `, [req.user.id]);

    // ── Auto-create goals if not exists ───────────────────────
    await pool.query(`
      INSERT INTO goals (user_id)
      VALUES ($1)
      ON CONFLICT (user_id) DO NOTHING
    `, [req.user.id]);

    // ── Fetch profile, goals and name ─────────────────────────
    const [p, g, u] = await Promise.all([
      pool.query('SELECT * FROM profiles WHERE user_id = $1', [req.user.id]),
      pool.query('SELECT * FROM goals    WHERE user_id = $1', [req.user.id]),
      pool.query('SELECT name FROM users WHERE id = $1',      [req.user.id]),
    ]);

    const profile  = p.rows[0] || {};
    const goals    = g.rows[0] || {};
    const userName = u.rows[0]?.name || req.user.name;

    res.json({ profile: { ...profile, name: userName }, goals });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ── UPDATE profile ────────────────────────────────────────────
router.put('/', auth, async (req, res) => {
  const { name, age, weight, height, gender, goal, level, dark_mode } = req.body;
  try {
    if (name) {
      await pool.query('UPDATE users SET name = $1 WHERE id = $2', [name, req.user.id]);
    }

    await pool.query(`
      INSERT INTO profiles (user_id, age, weight, height, gender, goal, level, dark_mode, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        age=$2, weight=$3, height=$4, gender=$5,
        goal=$6, level=$7, dark_mode=$8, updated_at=NOW()
    `, [req.user.id, age, weight, height, gender, goal, level, dark_mode]);

    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ── UPDATE goals ──────────────────────────────────────────────
router.put('/goals', auth, async (req, res) => {
  const { calories, protein, water, workouts } = req.body;
  try {
    await pool.query(`
      INSERT INTO goals (user_id, calories, protein, water, workouts, updated_at)
      VALUES ($1,$2,$3,$4,$5,NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        calories=$2, protein=$3, water=$4, workouts=$5, updated_at=NOW()
    `, [req.user.id, calories, protein, water, workouts]);

    res.json({ message: 'Goals updated' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to update goals' });
  }
});

module.exports = router;