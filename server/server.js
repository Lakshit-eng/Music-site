// Entry point of the backend API.
// Run it with: npm run dev
//            or: npm start

const express = require('express');
const cors = require('cors');
const path = require('path');

const config = require('./config');
const connectDB = require('./db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const songRoutes = require('./routes/songRoutes');
const cloudinaryRoutes = require('./routes/cloudinary');
const beatRoutes = require('./routes/beatRoutes');

const app = express();

// ---------- Core middleware ----------

app.use(
  cors({
    origin: config.clientUrl,
  })
);

app.use(express.json());

// ---------- Legacy local uploads ----------
//
// Kept temporarily while migrating to Cloudinary.
// This can be removed once the Cloudinary migration is confirmed.

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------- API routes ----------

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);

app.use('/api/songs', songRoutes);

app.use('/api/cloudinary', cloudinaryRoutes);
app.use('/api/beats', beatRoutes);

// ---------- Error handling ----------

app.use(notFound);
app.use(errorHandler);

// ---------- Start server ----------

connectDB().then(() => {
  app.listen(config.port, () => {
    console.log(`Spellze API running on http://localhost:${config.port}`);
  });
});