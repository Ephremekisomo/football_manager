const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const clubRoutes = require('./routes/clubs');
const joueurRoutes = require('./routes/joueurs');
const competitionRoutes = require('./routes/competitions');
const participationRoutes = require('./routes/participations');
const arbitreRoutes = require('./routes/arbitres');
const matchRoutes = require('./routes/matchs');
const resultatRoutes = require('./routes/resultats');
const dashboardRoutes = require('./routes/dashboard');
const classementRoutes = require('./routes/classements');
const tropheeRoutes = require('./routes/trophees');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' })); 

// Debug middleware
app.use((req, res, next) => {
  console.log('=== REQUEST DEBUG ===');
  console.log('Method:', req.method, 'URL:', req.url);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Body raw:', req.body ? req.body.toString ? req.body.toString() : req.body : 'empty');
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/joueurs', joueurRoutes);
app.use('/api/competitions', competitionRoutes);
app.use('/api/participations', participationRoutes);
app.use('/api/arbitres', arbitreRoutes);
app.use('/api/matchs', matchRoutes);
app.use('/api/resultats', resultatRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/classements', classementRoutes);
app.use('/api/trophees', tropheeRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Football Management System API' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Football Manager API - Use /api/health or /api/auth/login' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;