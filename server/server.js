require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const pool      = require('./db');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://fitand-rise.vercel.app',
    'https://fitand-rise-oxyqguspo-susheel001s-projects.vercel.app',
  ],
  credentials: true,
}));

app.options('*', cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FitAndRise API is running' });
});

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/profile',  require('./routes/profile'));
app.use('/api/stats',    require('./routes/stats'));
app.use('/api/meals',    require('./routes/meals'));
app.use('/api/workouts', require('./routes/workouts'));

app.use((req, res) => {
  res.status(404).json({ error: `${req.method} ${req.url} not found` });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

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