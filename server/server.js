require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const pool      = require('./db');

const app = express();

// ── SECURITY ──────────────────────────────────────────────────
app.use(helmet());

// Limit all API requests — 100 per 15 min
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, slow down!' }
}));

// Stricter limit on auth — 10 per 15 min
app.use('/api/auth/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts, try again later' }
}));

// ── MIDDLEWARE ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── HEALTH CHECK ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'BeFit API is running',
    timestamp: new Date(),
  });
});

// ── ROUTES ───────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/profile',  require('./routes/profile'));
app.use('/api/stats',    require('./routes/stats'));
app.use('/api/meals',    require('./routes/meals'));
app.use('/api/workouts', require('./routes/workouts'));

// ── 404 ──────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `${req.method} ${req.url} not found` });
});

// ── GLOBAL ERROR HANDLER ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ── START ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`\n🚀  BeFit server  →  http://localhost:${PORT}`);
  console.log(`📋  Routes ready:`);
  console.log(`    POST   /api/auth/register`);
  console.log(`    POST   /api/auth/login`);
  console.log(`    GET    /api/profile`);
  console.log(`    PUT    /api/profile`);
  console.log(`    PUT    /api/profile/goals`);
  console.log(`    GET    /api/stats`);
  console.log(`    PUT    /api/stats`);
  console.log(`    GET    /api/stats/weekly`);
  console.log(`    GET    /api/meals`);
  console.log(`    POST   /api/meals`);
  console.log(`    DELETE /api/meals/:id`);
  console.log(`    GET    /api/workouts`);
  console.log(`    POST   /api/workouts/toggle`);
  console.log(`    GET    /api/workouts/history\n`);

  try {
    await pool.query('SELECT 1');
    console.log('✅  Database connected\n');
  } catch (err) {
    console.error('❌  Database connection failed:', err.message);
    console.error('    → Check your DATABASE_URL in .env\n');
  }
});