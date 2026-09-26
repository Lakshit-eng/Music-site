const express = require('express');
const router = express.Router();

const songController = require('../controllers/songController');
const requireAuth = require('../middleware/auth');
const { uploadSongFiles } = require('../middleware/upload');

// ---------- PUBLIC ROUTES ----------
// (order matters: specific paths like /featured must come before /:id)
router.get('/featured', songController.getFeaturedSongs);
router.get('/admin/all', requireAuth, songController.getAdminSongs);

router.get('/', songController.getPublicSongs);
router.get('/:id', songController.getSongById);

// ---------- ADMIN ROUTES (protected) ----------
router.post('/', requireAuth, uploadSongFiles, songController.createSong);
router.put('/:id', requireAuth, uploadSongFiles, songController.updateSong);
router.delete('/:id', requireAuth, songController.deleteSong);

router.patch('/:id/featured', requireAuth, songController.setFeatured);
router.patch('/:id/published', requireAuth, songController.setPublished);
router.patch('/:id/position', requireAuth, songController.movePosition);

module.exports = router;
