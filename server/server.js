// Entry point of the backend API.
// Run it with:  npm run dev   (auto-restarts on changes)
//           or: npm start

const express = require('express');
const cors = require('cors');
const path = require('path');

const config = require('./config');
const connectDB = require('./db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const songRoutes = require('./routes/songRoutes');

const app = express();

// ---------- Core middleware ----------
app.use(cors({ origin: config.clientUrl }));
app.use(express.json());

// Serve uploaded audio/poster files as static assets, e.g.
// http://localhost:5000/uploads/audio/169...mp3
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------- API routes ----------
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);

// ---------- Error handling (must be last) ----------
app.use(notFound);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(config.port, () => {
    console.log(`Spellze API running on http://localhost:${config.port}`);
  });
});
