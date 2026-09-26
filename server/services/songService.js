// Data-access layer for songs.
//
// All MongoDB/Mongoose queries for songs live in this one file.
// Controllers call these functions instead of using the Song model
// directly. If you ever swap MongoDB for another database, this is the
// only file that needs to be rewritten.

const Song = require('../models/Song');

const VALID_CATEGORIES = ['produced', 'mixed_mastered'];

// Public catalog page (Produced / Mixed & Mastered), paginated.
// Only ever returns published songs.
async function getPublicSongsPage({ category, page = 1, limit = 8 }) {
  const query = { published: true };
  if (category && VALID_CATEGORIES.includes(category)) {
    query.category = category;
  }

  const pageNumber = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.max(1, Math.min(50, parseInt(limit, 10) || 8));
  const skip = (pageNumber - 1) * pageSize;

  const [songs, totalCount] = await Promise.all([
    Song.find(query).sort({ position: 1, createdAt: -1 }).skip(skip).limit(pageSize),
    Song.countDocuments(query),
  ]);

  return {
    songs,
    currentPage: pageNumber,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
    totalCount,
  };
}

// Home page "Top Tracks" - published AND featured, in admin-chosen order.
async function getFeaturedSongs(limit = 6) {
  return Song.find({ published: true, featured: true })
    .sort({ position: 1, createdAt: -1 })
    .limit(Math.max(1, Math.min(20, parseInt(limit, 10) || 6)));
}

// Admin dashboard list - sees everything (published + unpublished),
// optionally filtered by category, not paginated (admin catalogs are
// small enough to manage on one screen; increase later if needed).
async function getAdminSongs({ category } = {}) {
  const query = {};
  if (category && VALID_CATEGORIES.includes(category)) {
    query.category = category;
  }
  return Song.find(query).sort({ position: 1, createdAt: -1 });
}

async function getSongById(id) {
  return Song.findById(id);
}

async function createSong(data) {
  // New songs default to the end of their category's order.
  if (data.position === undefined || data.position === null || data.position === '') {
    const lastInCategory = await Song.findOne({ category: data.category }).sort({ position: -1 });
    data.position = lastInCategory ? lastInCategory.position + 1 : 0;
  }
  const song = new Song(data);
  return song.save();
}

async function updateSong(id, data) {
  const song = await Song.findById(id);
  if (!song) return null;
  Object.assign(song, data);
  return song.save();
}

async function deleteSong(id) {
  return Song.findByIdAndDelete(id);
}

async function setFeatured(id, featured) {
  return Song.findByIdAndUpdate(id, { featured: !!featured }, { new: true });
}

async function setPublished(id, published) {
  return Song.findByIdAndUpdate(id, { published: !!published }, { new: true });
}

// Moves a song up or down within its own category by swapping
// `position` values with its nearest neighbour. Persists to MongoDB,
// which is why the frontend can just trust whatever order the API
// returns instead of doing its own sorting logic.
async function moveSongPosition(id, direction) {
  const song = await Song.findById(id);
  if (!song) return null;

  const comparator = direction === 'up' ? { $lt: song.position } : { $gt: song.position };
  const sortOrder = direction === 'up' ? { position: -1 } : { position: 1 };

  const neighbour = await Song.findOne({
    category: song.category,
    position: comparator,
  }).sort(sortOrder);

  if (!neighbour) return song; // already at the top/bottom, nothing to do

  const temp = song.position;
  song.position = neighbour.position;
  neighbour.position = temp;

  await song.save();
  await neighbour.save();

  return song;
}

module.exports = {
  VALID_CATEGORIES,
  getPublicSongsPage,
  getFeaturedSongs,
  getAdminSongs,
  getSongById,
  createSong,
  updateSong,
  deleteSong,
  setFeatured,
  setPublished,
  moveSongPosition,
};
