
import { useState } from 'react';
import { uploadToCloudinary } from '../services/api';

export default function BeatForm({
  beat,
  submitting,
  onSubmit,
  onCancel,
}) {
  const [fields, setFields] = useState({
    title: beat?.title || '',
    producer: beat?.producer || 'Spellze',
    genre: beat?.genre || '',
    bpm: beat?.bpm ?? '',
    key: beat?.key || '',
    mood: beat?.mood || '',
    published: beat?.published ?? false,
    position: beat?.position ?? 0,
  });

  const [audioFile, setAudioFile] = useState(null);
  const [artworkFile, setArtworkFile] = useState(null);
  const [removeArtwork, setRemoveArtwork] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  function changeField(event) {
    const { name, value, type, checked } = event.target;

    setFields((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!fields.title.trim()) {
      setError('Enter a beat title.');
      return;
    }

    if (!beat && !audioFile) {
      setError('Select an audio file for this beat.');
      return;
    }

    if (fields.bpm !== '' && (
      !Number.isFinite(Number(fields.bpm)) ||
      Number(fields.bpm) < 1 ||
      Number(fields.bpm) > 400
    )) {
      setError('BPM must be between 1 and 400.');
      return;
    }

    setUploading(true);

    try {
      let audioUrl = beat?.audioUrl || '';
      let audioPublicId = beat?.audioPublicId || null;

      let artworkUrl = removeArtwork
        ? ''
        : beat?.artworkUrl || '';

      let artworkPublicId = removeArtwork
        ? null
        : beat?.artworkPublicId || null;

      // Upload audio to Cloudinary using the video resource type.
      if (audioFile) {
        const uploadedAudio = await uploadToCloudinary(
          audioFile,
          'video'
        );

        audioUrl = uploadedAudio.secure_url;
        audioPublicId = uploadedAudio.public_id;
      }

      // Upload artwork as an image.
      if (artworkFile) {
        const uploadedArtwork = await uploadToCloudinary(
          artworkFile,
          'image'
        );

        artworkUrl = uploadedArtwork.secure_url;
        artworkPublicId = uploadedArtwork.public_id;
      }

      await onSubmit({
        ...fields,
        title: fields.title.trim(),
        producer: fields.producer.trim() || 'Spellze',
        genre: fields.genre.trim(),
        bpm: fields.bpm === '' ? null : Number(fields.bpm),
        key: fields.key.trim(),
        mood: fields.mood.trim(),
        position: Number(fields.position) || 0,
        audioUrl,
        audioPublicId,
        artworkUrl,
        artworkPublicId,
        removeArtwork,
      });
    } catch (err) {
      setError(err.message || 'Could not upload or save the beat.');
    } finally {
      setUploading(false);
    }
  }

  const busy = uploading || submitting;

  return (
    <form className="beat-form" onSubmit={handleSubmit}>
      <label>
        Beat title *
        <input
          name="title"
          value={fields.title}
          onChange={changeField}
          required
          maxLength={150}
        />
      </label>

      <label>
        Producer
        <input
          name="producer"
          value={fields.producer}
          onChange={changeField}
        />
      </label>

      <label>
        Audio preview {beat ? '(optional replacement)' : '*'}
        <input
          type="file"
          accept="audio/*"
          required={!beat}
          onChange={(event) =>
            setAudioFile(event.target.files?.[0] || null)
          }
        />

        {beat?.audioUrl && !audioFile && (
          <small>Current audio will be kept.</small>
        )}
      </label>

      <label>
        Artwork (optional)
        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            setArtworkFile(event.target.files?.[0] || null);
            setRemoveArtwork(false);
          }}
        />
      </label>

      {beat?.artworkUrl && (
        <label>
          <input
            type="checkbox"
            checked={removeArtwork}
            onChange={(event) => {
              setRemoveArtwork(event.target.checked);

              if (event.target.checked) {
                setArtworkFile(null);
              }
            }}
          />
          Remove current artwork
        </label>
      )}

      <label>
        Genre
        <input
          name="genre"
          value={fields.genre}
          onChange={changeField}
          placeholder="Trap, R&B, Ambient..."
        />
      </label>

      <label>
        BPM
        <input
          name="bpm"
          type="number"
          min="1"
          max="400"
          value={fields.bpm}
          onChange={changeField}
        />
      </label>

      <label>
        Musical key
        <input
          name="key"
          value={fields.key}
          onChange={changeField}
          placeholder="G Minor"
        />
      </label>

      <label>
        Mood
        <input
          name="mood"
          value={fields.mood}
          onChange={changeField}
          placeholder="Dark, Sad, Chill..."
        />
      </label>

      <label>
        Display order
        <input
          name="position"
          type="number"
          value={fields.position}
          onChange={changeField}
        />
      </label>

      <label>
        <input
          name="published"
          type="checkbox"
          checked={fields.published}
          onChange={changeField}
        />
        Publish beat on the public website
      </label>

      {error && <p className="form-error">{error}</p>}

      <div className="row-actions">
        <button
          className="btn btn-primary"
          type="submit"
          disabled={busy}
        >
          {uploading
            ? 'Uploading files…'
            : submitting
              ? 'Saving…'
              : beat
                ? 'Save Changes'
                : 'Upload Beat'}
        </button>

        <button
          className="btn btn-outline"
          type="button"
          disabled={busy}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
