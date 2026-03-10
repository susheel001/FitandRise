const router = require('express').Router();
const pool   = require('../db');
const auth   = require('../middleware/auth');

// ── GET today's meals grouped by type ────────────────────────
router.get('/', auth, async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const { rows } = await pool.query(
      `SELECT * FROM meal_logs
       WHERE user_id = $1 AND date = $2
       ORDER BY created_at ASC`,
      [req.user.id, today]
    );

    // Group into { Breakfast:[], Lunch:[], Dinner:[], Snacks:[] }
    const grouped = { Breakfast: [], Lunch: [], Dinner: [], Snacks: [] };
    rows.forEach(row => {
      if (grouped[row.meal_type]) grouped[row.meal_type].push(row);
    });

    res.json(grouped);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
});

// ── ADD a food item ───────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  const { meal_type, food_name, calories, protein, carbs, fat, img_url } = req.body;
  const today = new Date().toISOString().split('T')[0];

  if (!meal_type || !food_name || !calories)
    return res.status(400).json({ error: 'meal_type, food_name and calories are required' });

  try {
    const { rows } = await pool.query(`
      INSERT INTO meal_logs
        (user_id, date, meal_type, food_name, calories, protein, carbs, fat, img_url)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `, [req.user.id, today, meal_type, food_name,
        calories, protein || 0, carbs || 0, fat || 0, img_url || '']);

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to add meal' });
  }
});

// ── DELETE a food item ────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM meal_logs WHERE id=$1 AND user_id=$2 RETURNING *',
      [req.params.id, req.user.id]
    );
    if (!rows.length)
      return res.status(404).json({ error: 'Meal not found' });

    res.json({ message: 'Meal removed', meal: rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to delete meal' });
  }
});

module.exports = router;