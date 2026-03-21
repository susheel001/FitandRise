const https  = require('https');
const router = require('express').Router();
const pool   = require('../db');
const auth   = require('../middleware/auth');

const FREE_LIMIT = 6;

// ── Built-in HTTPS fetch ──────────────────────────────────────
function fetchGroq(body, apiKey) {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.groq.com',
      path:     '/openai/v1/chat/completions',
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Authorization':  `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(bodyStr),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            ok:     res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            data:   JSON.parse(data),
          });
        } catch (e) {
          reject(new Error('Failed to parse Groq response: ' + data));
        }
      });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

// ── CHECK & UPDATE request count ──────────────────────────────
async function checkLimit(userId) {
  const { rows } = await pool.query(
    'SELECT is_premium, ai_requests_count, last_request_date FROM users WHERE id = $1',
    [userId]
  );
  if (!rows.length) throw new Error('User not found');

  const user     = rows[0];
  const today    = new Date().toISOString().split('T')[0];
  const lastDate = user.last_request_date?.toISOString?.().split('T')[0] || today;

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

    if (!user.is_premium && user.ai_requests_count >= FREE_LIMIT) {
      return res.status(403).json({
        error:         'limit_reached',
        message:       `You've used all ${FREE_LIMIT} free AI suggestions for today. Upgrade to Premium for unlimited access!`,
        is_premium:    false,
        requests_used: user.ai_requests_count,
        limit:         FREE_LIMIT,
      });
    }

    const { meal_type, goal, calories_left, protein_left } = req.body;

    const groqResult = await fetchGroq({
      model:      'llama-3.1-8b-instant',
      max_tokens: 600,
      messages: [
        {
          role:    'system',
          content: `You are a fitness nutrition expert. Suggest meals in JSON format only.
Always respond with this exact structure and nothing else — no extra text, no markdown:
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
          role:    'user',
          content: `Suggest 3 healthy ${meal_type} options.
User goal: ${goal || 'General Fitness'}
Calories remaining today: ${calories_left || 500} kcal
Protein remaining today: ${protein_left || 30}g
Respond with JSON only — no extra text.`,
        },
      ],
    }, process.env.GROQ_API_KEY);

    if (!groqResult.ok) {
      console.error('Groq error:', JSON.stringify(groqResult.data));
      return res.status(500).json({ error: 'AI service error', detail: groqResult.data });
    }

    const content = groqResult.data.choices?.[0]?.message?.content || '';
    console.log('Groq response:', content);

    let suggestions = [];
    try {
      const clean = content.replace(/```json|```/g, '').trim();
      suggestions = JSON.parse(clean).suggestions || [];
    } catch (parseErr) {
      console.error('Parse error:', parseErr.message, 'Content:', content);
      return res.status(500).json({ error: 'Failed to parse AI response', raw: content });
    }

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
      is_premium:    user.is_premium,
      requests_used: newCount,
      limit:         FREE_LIMIT,
      requests_left: user.is_premium ? 'unlimited' : FREE_LIMIT - newCount,
    });

  } catch (err) {
    console.error('AI suggest error:', err.message);
    console.error('AI suggest stack:', err.stack);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

// ── FOOD SCAN (Vision) ────────────────────────────────────────
router.post('/scan-food', auth, async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'No image provided' });

    if (image.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image too large. Please try again.' });
    }

    console.log('Scanning food image, size:', image.length);

    const result = await fetchGroq({
      model:      'llama-3.2-11b-vision-preview',   // ← fixed model
      max_tokens: 400,
      messages: [
        {
          role:    'user',
          content: [
            {
              type:      'image_url',
              image_url: { url: `data:image/jpeg;base64,${image}` },
            },
            {
              type: 'text',
              text: `Analyze this food image and return nutrition info as JSON only.
No extra text, no markdown. Use this exact structure:
{
  "name": "Food Name",
  "portion": "1 serving (approx 100g)",
  "calories": 250,
  "protein": 20,
  "carbs": 30,
  "fat": 8,
  "note": "Estimated values based on visual analysis"
}`,
            },
          ],
        },
      ],
    }, process.env.GROQ_API_KEY);

    if (!result.ok) {
      console.error('Groq vision error:', JSON.stringify(result.data));
      return res.status(500).json({ error: 'AI vision service error', detail: result.data });
    }

    const content = result.data.choices?.[0]?.message?.content || '';
    console.log('Vision response:', content);

    try {
      const clean = content.replace(/```json|```/g, '').trim();
      const food  = JSON.parse(clean);
      res.json(food);
    } catch {
      res.status(500).json({ error: 'Failed to parse food data', raw: content });
    }

  } catch (err) {
    console.error('Scan food error:', err.message);
    console.error('Scan food stack:', err.stack);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

module.exports = router;