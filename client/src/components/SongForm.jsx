// Add / Edit song form used inside the admin dashboard.
// Handles both create and edit.
// Files are uploaded directly to Cloudinary before the song data
// is sent to our backend.

import { useState } from 'react';
import {
  getMediaUrl,
  uploadToCloudinary,
} from '../services/api';
import '../styles/SongForm.css';

const emptyForm = {
  title: '',
  artist: '',
  category: 'produced',
  description: '',
  published: false,
  featured: false,
};

export default function SongForm({
  song,
  defaultCategory,
  onSubmit,
  onCancel,
  submitting,
}) {
  const [fields, setFields] = useState(
    song
      ? {
          title: song.title,
          artist: song.artist,
          category: song.category,
          description: song.description || '',
          published: song.published,
          featured: song.featured,
        }
      : {
          ...emptyForm,
          category: defaultCategory || 'produced',
        }
  );

  const [audioFile, setAudioFile] = useState(null);
  const [posterFile, setPosterFile] = useState(null);

  const [posterPreview, setPosterPreview] = useState(
    song?.posterUrl ? getMediaUrl(song.posterUrl) : ''
  );

  const [removePoster, setRemovePoster] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  function updateField(name, value) {
    setFields((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleAudioChange(e) {
    const file = e.target.files?.[0];

    if (!file) {
      setAudioFile(null);
      return;
    }

    setAudioFile(file);
    setError('');
  }

  function handlePosterChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    setPosterFile(file);
    setRemovePoster(false);
    setPosterPreview(URL.createObjectURL(file));
    setError('');
  }

  function handleRemovePoster() {
    setPosterFile(null);
    setPosterPreview('');
    setRemovePoster(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (uploading || submitting) {
      return;
    }

    setError('');

    // -----------------------------------------
    // Basic validation
    // -----------------------------------------

    if (!fields.title.trim() || !fields.artist.trim()) {
      setError('Title and artist are required.');
      return;
    }

    if (!song && !audioFile) {
      setError('An audio file is required for a new song.');
      return;
    }

    try {
      setUploading(true);

      let audioUrl = song?.audioUrl || '';
      let audioPublicId = song?.audioPublicId || null;

      let posterUrl = song?.posterUrl || '';
      let posterPublicId = song?.posterPublicId || null;

      // -----------------------------------------
      // Upload new audio to Cloudinary
      // -----------------------------------------

      if (audioFile) {
        console.log('Uploading audio to Cloudinary...');

        const audioUpload = await uploadToCloudinary(audioFile);

        console.log('Audio uploaded:', audioUpload);

        audioUrl = audioUpload.secure_url || audioUpload.url;
        audioPublicId = audioUpload.public_id || null;

        if (!audioUrl) {
          throw new Error(
            'Cloudinary uploaded the audio but did not return a URL.'
          );
        }
      }

      // -----------------------------------------
      // Upload new poster to Cloudinary
      // -----------------------------------------

      if (posterFile) {
        console.log('Uploading poster to Cloudinary...');

        const posterUpload = await uploadToCloudinary(posterFile);

        console.log('Poster uploaded:', posterUpload);

        posterUrl = posterUpload.secure_url || posterUpload.url;
        posterPublicId = posterUpload.public_id || null;

        if (!posterUrl) {
          throw new Error(
            'Cloudinary uploaded the poster but did not return a URL.'
          );
        }
      }

      // -----------------------------------------
      // Explicit poster removal
      // -----------------------------------------

      if (removePoster && !posterFile) {
        posterUrl = '';
        posterPublicId = null;
      }

      // -----------------------------------------
      // Build normal JSON object
      // -----------------------------------------
      //
      // IMPORTANT:
      // No audio/poster files are sent to /api/songs.
      //
      // Only Cloudinary URLs + public IDs are sent.
      // -----------------------------------------

      const songData = {
        title: fields.title.trim(),
        artist: fields.artist.trim(),
        category: fields.category,
        description: fields.description.trim(),
        published: fields.published,
        featured: fields.featured,

        audioUrl,
        audioPublicId,

        posterUrl,
        posterPublicId,

        removePoster,
      };

      console.log('Sending song data to backend:', songData);

      // Send the JSON data to AdminDashboard / parent.
      await onSubmit(songData);
    } catch (err) {
      console.error('Song submission error:', err);

      setError(
        err?.message ||
          'Something went wrong while uploading the song.'
      );
    } finally {
      setUploading(false);
    }
  }

  const isBusy = submitting || uploading;

  return (
    <form className="song-form" onSubmit={handleSubmit}>
      {error && <p className="form-error">{error}</p>}

      <label>
        Title

        <input
          type="text"
          value={fields.title}
          onChange={(e) =>
            updateField('title', e.target.value)
          }
          required
          disabled={isBusy}
        />
      </label>

      <label>
        Artist

        <input
          type="text"
          value={fields.artist}
          onChange={(e) =>
            updateField('artist', e.target.value)
          }
          required
          disabled={isBusy}
        />
      </label>

      <label>
        Category

        <select
          value={fields.category}
          onChange={(e) =>
            updateField('category', e.target.value)
          }
          disabled={isBusy}
        >
          <option value="produced">
            Produced
          </option>

          <option value="mixed_mastered">
            Mixed & Mastered
          </option>
        </select>
      </label>

      <label>
        Description (optional)

        <textarea
          value={fields.description}
          onChange={(e) =>
            updateField('description', e.target.value)
          }
          rows={3}
          disabled={isBusy}
        />
      </label>

      <label>
        Audio file{' '}
        {song
          ? '(leave empty to keep current file)'
          : ''}

        <input
          type="file"
          accept="audio/*"
          onChange={handleAudioChange}
          disabled={isBusy}
        />
      </label>

      {audioFile && (
        <p className="form-hint">
          Selected: {audioFile.name}
        </p>
      )}

      {song?.audioUrl && !audioFile && (
        <p className="form-hint">
          Current file:{' '}
          {song.audioUrl.split('/').pop()}
        </p>
      )}

      <label>
        Poster image (optional)

        <input
          type="file"
          accept="image/*"
          onChange={handlePosterChange}
          disabled={isBusy}
        />
      </label>

      {posterPreview && (
        <div className="poster-preview">
          <img
            src={posterPreview}
            alt="Poster preview"
          />

          <button
            type="button"
            className="btn btn-outline btn-small"
            onClick={handleRemovePoster}
            disabled={isBusy}
          >
            Remove poster
          </button>
        </div>
      )}

      <div className="form-checkboxes">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={fields.published}
            onChange={(e) =>
              updateField(
                'published',
                e.target.checked
              )
            }
            disabled={isBusy}
          />

          Published
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={fields.featured}
            onChange={(e) =>
              updateField(
                'featured',
                e.target.checked
              )
            }
            disabled={isBusy}
          />

          Featured
        </label>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isBusy}
        >
          {uploading
            ? 'Uploading…'
            : submitting
              ? 'Saving…'
              : song
                ? 'Save Changes'
                : 'Add Song'}
        </button>

        <button
          type="button"
          className="btn btn-outline"
          onClick={onCancel}
          disabled={isBusy}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}