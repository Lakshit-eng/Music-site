
const mongoose = require('mongoose');

const beatSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Beat title is required'],
      trim: true,
    },
    producer: {
      type: String,
      default: 'Spellze',
      trim: true,
    },
    genre: { type: String, default: '', trim: true },
    bpm: { type: Number, min: 1, max: 400, default: null },
    key: { type: String, default: '', trim: true },
    mood: { type: String, default: '', trim: true },

    audioUrl: {
      type: String,
      required: [true, 'Beat audio is required'],
    },
    audioPublicId: { type: String, default: null },
    artworkUrl: { type: String, default: '' },
    artworkPublicId: { type: String, default: null },

    published: { type: Boolean, default: false },
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

beatSchema.index({ published: 1, position: 1, createdAt: -1 });

module.exports = mongoose.model('Beat', beatSchema);
