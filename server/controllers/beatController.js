
const mongoose = require('mongoose');
const Beat = require('../models/Beat');
const asyncHandler = require('../utils/asyncHandler');

const parseBoolean = (value) => value === true || value === 'true';

const getPublicBeats = asyncHandler(async (req, res) => {
  const beats = await Beat.find({ published: true })
    .sort({ position: 1, createdAt: -1 })
    .lean();

  res.json({ beats });
});

const getAdminBeats = asyncHandler(async (req, res) => {
  const beats = await Beat.find()
    .sort({ position: 1, createdAt: -1 })
    .lean();

  res.json({ beats });
});

const createBeat = asyncHandler(async (req, res) => {
  const {
    title, producer, genre, bpm, key, mood,
    audioUrl, audioPublicId, artworkUrl, artworkPublicId,
    published, position,
  } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ message: 'Beat title is required.' });
  }

  if (!audioUrl) {
    return res.status(400).json({ message: 'Upload a beat audio file first.' });
  }

  const beat = await Beat.create({
    title,
    producer,
    genre,
    bpm: bpm === '' || bpm == null ? null : Number(bpm),
    key,
    mood,
    audioUrl,
    audioPublicId: audioPublicId || null,
    artworkUrl: artworkUrl || '',
    artworkPublicId: artworkPublicId || null,
    published: parseBoolean(published),
    position: position === '' || position == null ? 0 : Number(position),
  });

  res.status(201).json({ beat });
});

const updateBeat = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid beat ID.' });
  }

  const beat = await Beat.findById(req.params.id);

  if (!beat) {
    return res.status(404).json({ message: 'Beat not found.' });
  }

  const fields = [
    'title', 'producer', 'genre', 'key', 'mood',
    'audioUrl', 'audioPublicId', 'artworkUrl', 'artworkPublicId',
  ];

  for (const field of fields) {
    if (req.body[field] !== undefined) beat[field] = req.body[field];
  }

  if (req.body.bpm !== undefined) {
    beat.bpm = req.body.bpm === '' || req.body.bpm == null
      ? null : Number(req.body.bpm);
  }

  if (req.body.position !== undefined && req.body.position !== '') {
    beat.position = Number(req.body.position);
  }

  if (req.body.published !== undefined) {
    beat.published = parseBoolean(req.body.published);
  }

  if (req.body.removeArtwork === true || req.body.removeArtwork === 'true') {
    beat.artworkUrl = '';
    beat.artworkPublicId = null;
  }

  await beat.save();
  res.json({ beat });
});

const setBeatPublished = asyncHandler(async (req, res) => {
  const beat = await Beat.findByIdAndUpdate(
    req.params.id,
    { published: parseBoolean(req.body.published) },
    { new: true, runValidators: true }
  );

  if (!beat) return res.status(404).json({ message: 'Beat not found.' });
  res.json({ beat });
});

const deleteBeat = asyncHandler(async (req, res) => {
  const beat = await Beat.findByIdAndDelete(req.params.id);

  if (!beat) return res.status(404).json({ message: 'Beat not found.' });
  res.json({ message: 'Beat deleted.' });
});

module.exports = {
  getPublicBeats,
  getAdminBeats,
  createBeat,
  updateBeat,
  setBeatPublished,
  deleteBeat,
};
