const router = require('express').Router();
const pool   = require('../db');
const auth   = require('../middleware/auth');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const FREE_LIMIT   = 6; // requests per day for free users

// ── CHECK & UPDATE request count ──────────────────────────────
async function checkLimit(userId) {
  const { rows } = await pool.query(
    'SELECT is_premium, ai_requests_count, last_request_date FROM users WHERE id = $1',
    [userId]
  );
  if (!rows.length) throw new Error('User not found');

  const user    = rows[0];
  const today   = new Date().toISOString().split('T')[0];
  const lastDate = user.last_request_date?.toISOString?.().split('T')[0] || today;

  // Reset count if it's a new day
  if (lastDate !== today) {
    await pool.query(
      'UPDATE users SET ai_requests_count = 0, last_request_date = $1 WHERE id = $2',
      [today, userId]
    );
    user.ai_requests_count = 0;
  }

  return user;
}

// ── AI MEAL SUGGESTION ────────────────────────────────────────
router.post('/suggest', auth, async (req, res) => {
  try {
    const user = await checkLimit(req.user.id);

    // Block free users who hit the limit
    if (!user.is_premium && user.ai_requests_count >= FREE_LIMIT) {
      return res.status(403).json({
        error: 'limit_reached',
        message: `You've used all ${FREE_LIMIT} free AI suggestions for today. Upgrade to Premium for unlimited access!`,
        is_premium: false,
        requests_used: user.ai_requests_count,
        limit: FREE_LIMIT,
      });
    }

    const { meal_type, goal, calories_left, protein_left } = req.body;

    // Call Groq API
    const groqRes = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        max_tokens: 500,
        messages: [
          {
            role: 'system',
            content: `You are a fitness nutrition expert. Suggest meals in JSON format only.
Always respond with this exact structure, no extra text:
{
  "suggestions": [
    {
      "name": "Food Name",
      "calories": 300,
      "protein": 25,
      "carbs": 30,
      "fat": 8,
      "reason": "Short reason why this is good"
    }
  ]
}`,
          },
          {
            role: 'user',
            content: `Suggest 3 healthy ${meal_type} options.
User goal: ${goal || 'General Fitness'}
Calories remaining today: ${calories_left || 500} kcal
Protein remaining today: ${protein_left || 30}g
Make suggestions fit within these remaining targets.`,
          },
        ],
      }),
    });

    const groqData = await groqRes.json();

    if (!groqRes.ok)
      return res.status(500).json({ error: 'AI service error', detail: groqData });

    // Parse AI response
    const content = groqData.choices?.[0]?.message?.content || '';
    let suggestions = [];
    try {
      const clean = content.replace(/```json|```/g, '').trim();
      suggestions = JSON.parse(clean).suggestions || [];
    } catch {
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    // Increment request count
    await pool.query(
      `UPDATE users SET
        ai_requests_count = ai_requests_count + 1,
        last_request_date = CURRENT_DATE
       WHERE id = $1`,
      [req.user.id]
    );

    const newCount = user.ai_requests_count + 1;

    res.json({
      suggestions,
      is_premium: user.is_premium,
      requests_used: newCount,
      limit: FREE_LIMIT,
      requests_left: user.is_premium ? 'unlimited' : FREE_LIMIT - newCount,
    });

  } catch (err) {
    console.error('AI suggest error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;