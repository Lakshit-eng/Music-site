const songService = require('../services/songService');
const { getPublicUrlForUploadedFile, deleteFileByUrl } = require('../services/fileService');
const asyncHandler = require('../utils/asyncHandler');

// ---------- PUBLIC ----------

// GET /api/songs?category=produced&page=1&limit=8
const getPublicSongs = asyncHandler(async (req, res) => {
  const { category, page, limit } = req.query;
  const result = await songService.getPublicSongsPage({ category, page, limit });
  res.json(result);
});

// GET /api/songs/featured?limit=6
const getFeaturedSongs = asyncHandler(async (req, res) => {
  const { limit } = req.query;
  const songs = await songService.getFeaturedSongs(limit);
  res.json({ songs });
});

// GET /api/songs/:id
const getSongById = asyncHandler(async (req, res) => {
  const song = await songService.getSongById(req.params.id);
  if (!song || !song.published) {
    return res.status(404).json({ message: 'Song not found.' });
  }
  res.json({ song });
});

// ---------- ADMIN (all protected by requireAuth in the routes file) ----------

// GET /api/songs/admin/all?category=produced
const getAdminSongs = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const songs = await songService.getAdminSongs({ category });
  res.json({ songs });
});

// POST /api/songs   (multipart/form-data: fields + optional audio + poster)
const createSong = asyncHandler(async (req, res) => {
  const {
    title,
    artist,
    category,
    description,
    published,
    featured,
    position,
    audioUrl,
    audioPublicId,
    posterUrl,
    posterPublicId,
  } = req.body;

  if (!audioUrl) {
    return res.status(400).json({ message: 'An audio file is required.' });
  }

  const song = await songService.createSong({
    title,
    artist,
    category,
    description,
    published: published === 'true' || published === true,
    featured: featured === 'true' || featured === true,
    position: position === '' ? undefined : position,

    audioUrl,
    audioPublicId: audioPublicId || null,

    posterUrl: posterUrl || '',
    posterPublicId: posterPublicId || null,
  });

  res.status(201).json({ song });
});

// PUT /api/songs/:id   (multipart/form-data: fields + optional new audio/poster)
const updateSong = asyncHandler(async (req, res) => {
  const existing = await songService.getSongById(req.params.id);

  if (!existing) {
    return res.status(404).json({ message: 'Song not found.' });
  }

  const {
    title,
    artist,
    category,
    description,
    published,
    featured,
    position,
    removePoster,

    audioUrl,
    audioPublicId,
    posterUrl,
    posterPublicId,
  } = req.body;

  const updates = {
    title,
    artist,
    category,
    description,
    published: published === 'true' || published === true,
    featured: featured === 'true' || featured === true,
  };

  if (position !== undefined && position !== '') {
    updates.position = position;
  }

  // Only update audio if a new Cloudinary file was uploaded.
  if (audioUrl) {
    updates.audioUrl = audioUrl;
    updates.audioPublicId = audioPublicId || null;
  }

  // Update poster if a new Cloudinary file was uploaded.
  if (posterUrl) {
    updates.posterUrl = posterUrl;
    updates.posterPublicId = posterPublicId || null;
  }

  // Explicitly remove poster when no replacement was uploaded.
  const shouldRemovePoster =
    (removePoster === 'true' || removePoster === true) && !posterUrl;

  if (shouldRemovePoster) {
    updates.posterUrl = '';
    updates.posterPublicId = null;
  }

  const song = await songService.updateSong(req.params.id, updates);

  res.json({ song });
});

// DELETE /api/songs/:id
const deleteSong = asyncHandler(async (req, res) => {
  const song = await songService.deleteSong(req.params.id);

  if (!song) {
    return res.status(404).json({ message: 'Song not found.' });
  }

  res.json({ message: 'Song deleted.' });
});

// PATCH /api/songs/:id/featured   { featured: true|false }
const setFeatured = asyncHandler(async (req, res) => {
  const song = await songService.setFeatured(req.params.id, req.body.featured);
  if (!song) return res.status(404).json({ message: 'Song not found.' });
  res.json({ song });
});

// PATCH /api/songs/:id/published  { published: true|false }
const setPublished = asyncHandler(async (req, res) => {
  const song = await songService.setPublished(req.params.id, req.body.published);
  if (!song) return res.status(404).json({ message: 'Song not found.' });
  res.json({ song });
});

// PATCH /api/songs/:id/position   { direction: 'up' | 'down' }
const movePosition = asyncHandler(async (req, res) => {
  const { direction } = req.body;
  if (!['up', 'down'].includes(direction)) {
    return res.status(400).json({ message: "direction must be 'up' or 'down'." });
  }
  const song = await songService.moveSongPosition(req.params.id, direction);
  if (!song) return res.status(404).json({ message: 'Song not found.' });
  res.json({ song });
});

module.exports = {
  getPublicSongs,
  getFeaturedSongs,
  getSongById,
  getAdminSongs,
  createSong,
  updateSong,
  deleteSong,
  setFeatured,
  setPublished,
  movePosition,
};
