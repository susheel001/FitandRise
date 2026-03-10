const router = require('express').Router();
const pool   = require('../db');
const auth   = require('../middleware/auth');

// ── GET today's workout completions ──────────────────────────
router.get('/', auth, async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const { rows } = await pool.query(
      'SELECT * FROM workout_logs WHERE user_id=$1 AND date=$2',
      [req.user.id, today]
    );

    // Group by muscle_group → { chest: [{id, done}], legs: [...] }
    const grouped = {};
    rows.forEach(row => {
      if (!grouped[row.muscle_group]) grouped[row.muscle_group] = [];
      grouped[row.muscle_group].push({ id: row.exercise_id, done: row.done });
    });

    res.json(grouped);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch workouts' });
  }
});

// ── TOGGLE an exercise done/undone ────────────────────────────
router.post('/toggle', auth, async (req, res) => {
  const { muscle_group, exercise_id, done } = req.body;
  const today = new Date().toISOString().split('T')[0];

  if (!muscle_group || exercise_id === undefined)
    return res.status(400).json({ error: 'muscle_group and exercise_id are required' });

  try {
    await pool.query(`
      INSERT INTO workout_logs (user_id, muscle_group, exercise_id, done, date)
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT (user_id, muscle_group, exercise_id, date)
      DO UPDATE SET done=$4
    `, [req.user.id, muscle_group, exercise_id, done, today]);

    res.json({ message: 'Workout updated', done });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to update workout' });
  }
});

// ── GET workout history (streak data) ────────────────────────
router.get('/history', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        date,
        COUNT(*) FILTER (WHERE done = true)  AS completed,
        COUNT(*)                              AS total
      FROM workout_logs
      WHERE user_id = $1
        AND date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY date
      ORDER BY date DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;