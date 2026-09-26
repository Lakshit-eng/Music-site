// Song model.
//
// A "song" here can be either something Spellze produced, or something
// Spellze mixed/mastered for another artist — the `category` field tells
// them apart.
//
// NOTE for future flexibility: if you later want to add fields like
// bpm, slug, price, credits, releaseDate, youtubeUrl, spotifyUrl — just
// add them below as normal schema fields. Because the rest of the app
// (controllers, services, frontend) reads song objects generically,
// adding a field here will NOT require rewriting the whole application.
// You will only need to (1) add it to the admin form and (2) display it
// wherever you want it to show up.

const mongoose = require('mongoose');

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    artist: {
      type: String,
      required: [true, 'Artist name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['produced', 'mixed_mastered'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    audioUrl: {
      type: String,
      required: [true, 'An audio file is required'],
    },
    posterUrl: {
      type: String,
      default: '',
    },
    published: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    // Lower position = shown first. Used for both the featured
    // home-page order and the ordering within a category's list.
    position: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);

// Indexes that match how we actually query the collection:
songSchema.index({ category: 1, published: 1, position: 1 });
songSchema.index({ featured: 1, published: 1, position: 1 });

module.exports = mongoose.model('Song', songSchema);
