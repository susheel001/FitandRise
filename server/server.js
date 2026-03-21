require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const pool      = require('./db');

const app = express();
app.set("trust proxy", 1);

// ── CORS ───────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'https://fitand-rise.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.options('*', cors());

// ── SECURITY & MIDDLEWARE ─────────────────────────────────────
app.use(helmet());
app.use(express.json({ limit: '10mb' }));              // ← updated
app.use(express.urlencoded({ limit: '10mb', extended: true })); // ← updated

// ── RATE LIMITING ─────────────────────────────────────────────
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests!' }
}));

app.use('/api/auth/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts!' }
}));

// ── HEALTH CHECK ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FitAndRise API is running' });
});

// ── ROUTES ───────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/profile',  require('./routes/profile'));
app.use('/api/stats',    require('./routes/stats'));
app.use('/api/meals',    require('./routes/meals'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/ai',       require('./routes/ai'));

// ── 404 HANDLER ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `${req.method} ${req.url} not found` });
});

// ── ERROR HANDLER ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ── START SERVER ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`\n🚀 FitAndRise running on port ${PORT}`);
  try {
    await pool.query('SELECT 1');
    console.log('✅ Database connected\n');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }
});