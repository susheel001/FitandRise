const router = require('express').Router();
const pool   = require('../db');
const auth   = require('../middleware/auth');

// ── GET today's stats ─────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    let { rows } = await pool.query(
      'SELECT * FROM daily_stats WHERE user_id = $1 AND date = $2',
      [req.user.id, today]
    );

    // Auto-create today's row if missing
    if (!rows.length) {
      const insert = await pool.query(
        'INSERT INTO daily_stats (user_id, date) VALUES ($1,$2) RETURNING *',
        [req.user.id, today]
      );
      rows = insert.rows;
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ── UPDATE today's stats ──────────────────────────────────────
router.put('/', auth, async (req, res) => {
  const { calories_consumed, protein_consumed, water_consumed } = req.body;
  const today = new Date().toISOString().split('T')[0];
  try {
    await pool.query(`
      INSERT INTO daily_stats (user_id, date, calories_consumed, protein_consumed, water_consumed)
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT (user_id, date) DO UPDATE SET
        calories_consumed=$3,
        protein_consumed=$4,
        water_consumed=$5
    `, [req.user.id, today, calories_consumed, protein_consumed, water_consumed]);

    res.json({ message: 'Stats updated' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to update stats' });
  }
});

// ── GET last 7 days (for Progress charts) ────────────────────
router.get('/weekly', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT date, calories_consumed, protein_consumed, water_consumed
      FROM daily_stats
      WHERE user_id = $1
        AND date >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY date ASC
    `, [req.user.id]);
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch weekly stats' });
  }
});

module.exports = router;