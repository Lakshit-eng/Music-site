
const express = require('express');
const controller = require('../controllers/beatController');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// Public: only published beats
router.get('/', controller.getPublicBeats);

// Admin: authentication required
router.get('/admin/all', requireAuth, controller.getAdminBeats);
router.post('/', requireAuth, controller.createBeat);
router.put('/:id', requireAuth, controller.updateBeat);
router.patch('/:id/published', requireAuth, controller.setBeatPublished);
router.delete('/:id', requireAuth, controller.deleteBeat);

module.exports = router;
