require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const pool      = require('./db');

const app = express();

/* ─────────────── CORS ─────────────── */

const allowedOrigins = [
  'http://localhost:5173',
  'https://fitand-rise.vercel.app',
  'https://fitand-rise-oxyqguspo-susheel001s-projects.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {

    // allow requests with no origin (mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }

  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));

// handle preflight requests
app.options('*', cors());

/* ─────────────── SECURITY ─────────────── */

app.use(helmet());

app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, slow down!' }
}));

app.use('/api/auth/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts, try again later' }
}));

/* ─────────────── MIDDLEWARE ─────────────── */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ─────────────── HEALTH CHECK ─────────────── */

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'FitAndRise API is running 🚀',
    timestamp: new Date()
  });
});

/* ─────────────── ROUTES ─────────────── */

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/profile',  require('./routes/profile'));
app.use('/api/stats',    require('./routes/stats'));
app.use('/api/meals',    require('./routes/meals'));
app.use('/api/workouts', require('./routes/workouts'));

/* ─────────────── 404 HANDLER ─────────────── */

app.use((req, res) => {
  res.status(404).json({
    error: `${req.method} ${req.url} not found`
  });
});

/* ─────────────── ERROR HANDLER ─────────────── */

app.use((err, req, res, next) => {
  console.error('Error:', err.message);

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS blocked this request' });
  }

  res.status(500).json({ error: 'Internal server error' });
});

/* ─────────────── START SERVER ─────────────── */

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {

  console.log(`🚀 FitAndRise server running on port ${PORT}`);

  try {

    await pool.query('SELECT 1');
    console.log('✅ Database connected');

  } catch (err) {

    console.error('❌ Database connection failed:', err.message);

  }

});