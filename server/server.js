require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const pool      = require('./db');
const aiRoutes = require('./routes/ai');
app.use('/api/ai', aiRoutes);

const app = express();
app.set("trust proxy", 1);


// ── CORS ───────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'https://fitand-rise.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow main production URL
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow ALL Vercel preview URLs for this project
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// handle preflight requests
app.options('*', cors());

// ── SECURITY & MIDDLEWARE ─────────────────────────────────────
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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