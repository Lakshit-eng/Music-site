// Add / Edit song form used inside the admin dashboard.
// The same component handles both "create" and "edit" - pass an existing
// `song` prop to edit it, or omit it to create a new one.

import { useState } from 'react';
import { getMediaUrl } from '../services/api';
import '../styles/SongForm.css';

const emptyForm = {
  title: '',
  artist: '',
  category: 'produced',
  description: '',
  published: false,
  featured: false,
};

export default function SongForm({ song, defaultCategory, onSubmit, onCancel, submitting }) {
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
      : { ...emptyForm, category: defaultCategory || 'produced' }
  );

  const [audioFile, setAudioFile] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(song?.posterUrl ? getMediaUrl(song.posterUrl) : '');
  const [removePoster, setRemovePoster] = useState(false);
  const [error, setError] = useState('');

  function updateField(name, value) {
    setFields((prev) => ({ ...prev, [name]: value }));
  }

  function handlePosterChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPosterFile(file);
    setRemovePoster(false);
    setPosterPreview(URL.createObjectURL(file));
  }

  function handleRemovePoster() {
    setPosterFile(null);
    setPosterPreview('');
    setRemovePoster(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!fields.title.trim() || !fields.artist.trim()) {
      setError('Title and artist are required.');
      return;
    }
    if (!song && !audioFile) {
      setError('An audio file is required for a new song.');
      return;
    }

    const formData = new FormData();
    formData.append('title', fields.title.trim());
    formData.append('artist', fields.artist.trim());
    formData.append('category', fields.category);
    formData.append('description', fields.description.trim());
    formData.append('published', fields.published);
    formData.append('featured', fields.featured);

    if (audioFile) formData.append('audio', audioFile);
    if (posterFile) formData.append('poster', posterFile);
    // Removing the poster without replacing it: send an explicit empty
    // posterUrl-clearing flag the backend can ignore if not needed, but
    // simplest is to just not send a poster and let admin re-upload if
    // they want a different one. For explicit removal we send a flag:
    if (removePoster) formData.append('removePoster', 'true');

    onSubmit(formData);
  }

  return (
    <form className="song-form" onSubmit={handleSubmit}>
      {error && <p className="form-error">{error}</p>}

      <label>
        Title
        <input
          type="text"
          value={fields.title}
          onChange={(e) => updateField('title', e.target.value)}
          required
        />
      </label>

      <label>
        Artist
        <input
          type="text"
          value={fields.artist}
          onChange={(e) => updateField('artist', e.target.value)}
          required
        />
      </label>

      <label>
        Category
        <select value={fields.category} onChange={(e) => updateField('category', e.target.value)}>
          <option value="produced">Produced</option>
          <option value="mixed_mastered">Mixed & Mastered</option>
        </select>
      </label>

      <label>
        Description (optional)
        <textarea
          value={fields.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={3}
        />
      </label>

      <label>
        Audio file {song ? '(leave empty to keep current file)' : ''}
        <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files[0])} />
      </label>
      {song?.audioUrl && !audioFile && (
        <p className="form-hint">Current file: {song.audioUrl.split('/').pop()}</p>
      )}

      <label>
        Poster image (optional)
        <input type="file" accept="image/*" onChange={handlePosterChange} />
      </label>
      {posterPreview && (
        <div className="poster-preview">
          <img src={posterPreview} alt="Poster preview" />
          <button type="button" className="btn btn-outline btn-small" onClick={handleRemovePoster}>
            Remove poster
          </button>
        </div>
      )}

      <div className="form-checkboxes">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={fields.published}
            onChange={(e) => updateField('published', e.target.checked)}
          />
          Published
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={fields.featured}
            onChange={(e) => updateField('featured', e.target.checked)}
          />
          Featured
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : song ? 'Save Changes' : 'Add Song'}
        </button>
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
      </div>
    </form>
  );
}
