
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import SongForm from '../components/SongForm';
import BeatForm from '../components/BeatForm';

import {
  fetchAdminSongs,
  createSong,
  updateSong,
  deleteSong,
  setSongFeatured,
  setSongPublished,
  moveSongPosition,
  getMediaUrl,
  fetchAdminBeats,
  createBeat,
  updateBeat,
  deleteBeat,
  setBeatPublished,
} from '../services/api';

import '../styles/Admin.css';

const TABS = [
  { key: 'produced', label: 'Produced' },
  { key: 'mixed_mastered', label: 'Mixed & Mastered' },
  { key: 'beats', label: 'Beats' },
];

export default function AdminDashboard() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('produced');
  const [songs, setSongs] = useState([]);
  const [beats, setBeats] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  async function loadSongs() {
    setLoading(true);
    setError('');

    try {
      if (activeTab === 'beats') {
        const data = await fetchAdminBeats();
        setBeats(data);
      } else {
        const data = await fetchAdminSongs(activeTab);
        setSongs(data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load content.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSongs();
    setShowForm(false);
    setEditingSong(null);
    setActionError();

    // loadSongs uses the currently selected tab.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  function openAddForm() {
    setEditingSong(null);
    setShowForm(true);
    setActionError('');
  }

  function openEditForm(item) {
    setEditingSong(item);
    setShowForm(true);
    setActionError('');
  }

  function closeForm() {
    setShowForm(false);
    setEditingSong(null);
    setActionError('');
  }

  async function handleFormSubmit(formData) {
    setSubmitting(true);
    setActionError('');

    try {
      if (editingSong) {
        await updateSong(editingSong._id, formData);
      } else {
        await createSong(formData);
      }

      closeForm();
      await loadSongs();
    } catch (err) {
      setActionError(err.message || 'Failed to save song.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBeatSubmit(formData) {
    setSubmitting(true);
    setActionError('');

    try {
      if (editingSong) {
        await updateBeat(editingSong._id, formData);
      } else {
        await createBeat(formData);
      }

      closeForm();
      await loadSongs();
    } catch (err) {
      setActionError(err.message || 'Failed to save beat.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(song) {
    const confirmed = window.confirm(
      `Delete "${song.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setActionError('');

    try {
      await deleteSong(song._id);
      await loadSongs();
    } catch (err) {
      setActionError(err.message || 'Failed to delete song.');
    }
  }

  async function handleToggleFeatured(song) {
    setActionError('');

    try {
      await setSongFeatured(song._id, !song.featured);
      await loadSongs();
    } catch (err) {
      setActionError(err.message || 'Failed to update featured status.');
    }
  }

  async function handleTogglePublished(song) {
    setActionError('');

    try {
      await setSongPublished(song._id, !song.published);
      await loadSongs();
    } catch (err) {
      setActionError(err.message || 'Failed to update song status.');
    }
  }

  async function handleMove(song, direction) {
    setActionError('');

    try {
      await moveSongPosition(song._id, direction);
      await loadSongs();
    } catch (err) {
      setActionError(err.message || 'Failed to reorder songs.');
    }
  }

  async function handleToggleBeatPublished(beat) {
    setActionError('');

    try {
      await setBeatPublished(beat._id, !beat.published);
      await loadSongs();
    } catch (err) {
      setActionError(err.message || 'Failed to update beat status.');
    }
  }

  async function handleDeleteBeat(beat) {
    const confirmed = window.confirm(
      `Delete "${beat.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setActionError('');

    try {
      await deleteBeat(beat._id);
      await loadSongs();
    } catch (err) {
      setActionError(err.message || 'Failed to delete beat.');
    }
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Spellze Admin</h1>

        <div className="admin-header-right">
          <span>{admin?.email}</span>

          <button
            className="btn btn-outline btn-small"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Dashboard tabs */}
      <div className="admin-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`admin-tab ${
              activeTab === tab.key ? 'active' : ''
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Add button */}
      <div className="admin-toolbar">
        <button className="btn btn-primary" onClick={openAddForm}>
          {activeTab === 'beats' ? '+ Add Beat' : '+ Add Song'}
        </button>
      </div>

      {actionError && (
        <p className="form-error">{actionError}</p>
      )}

      {/* Song or beat form */}
      {showForm && (
        <div className="admin-form-panel">
          <h2>
            {editingSong
              ? activeTab === 'beats'
                ? 'Edit Beat'
                : 'Edit Song'
              : activeTab === 'beats'
                ? 'Add Beat'
                : 'Add Song'}
          </h2>

          {activeTab === 'beats' ? (
            <BeatForm
              beat={editingSong}
              submitting={submitting}
              onSubmit={handleBeatSubmit}
              onCancel={closeForm}
            />
          ) : (
            <SongForm
              song={editingSong}
              defaultCategory={activeTab}
              submitting={submitting}
              onSubmit={handleFormSubmit}
              onCancel={closeForm}
            />
          )}
        </div>
      )}

      {/* Loading and errors */}
      {loading && (
        <p className="state-message">
          {activeTab === 'beats' ? 'Loading beats…' : 'Loading songs…'}
        </p>
      )}

      {error && (
        <p className="state-message error">{error}</p>
      )}

      {/* Produced and Mixed & Mastered table */}
      {activeTab !== 'beats' && !loading && !error && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Poster</th>
              <th>Title</th>
              <th>Artist</th>
              <th>Published</th>
              <th>Featured</th>
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {songs.length === 0 && (
              <tr>
                <td colSpan={7} className="state-message">
                  No songs in this category yet.
                </td>
              </tr>
            )}

            {songs.map((song, index) => (
              <tr key={song._id}>
                <td>
                  {song.posterUrl ? (
                    <img
                      className="admin-thumb"
                      src={getMediaUrl(song.posterUrl)}
                      alt={song.title}
                    />
                  ) : (
                    <div className="admin-thumb admin-thumb-fallback">
                      🎵
                    </div>
                  )}
                </td>

                <td>{song.title}</td>
                <td>{song.artist}</td>

                <td>
                  <button
                    className={`status-pill ${
                      song.published ? 'on' : 'off'
                    }`}
                    onClick={() => handleTogglePublished(song)}
                  >
                    {song.published ? 'Published' : 'Draft'}
                  </button>
                </td>

                <td>
                  <button
                    className={`status-pill ${
                      song.featured ? 'on' : 'off'
                    }`}
                    onClick={() => handleToggleFeatured(song)}
                  >
                    {song.featured ? 'Featured' : 'Not Featured'}
                  </button>
                </td>

                <td>
                  <div className="order-buttons">
                    <button
                      className="btn btn-outline btn-small"
                      disabled={index === 0}
                      onClick={() => handleMove(song, 'up')}
                      aria-label="Move up"
                    >
                      ↑
                    </button>

                    <button
                      className="btn btn-outline btn-small"
                      disabled={index === songs.length - 1}
                      onClick={() => handleMove(song, 'down')}
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                  </div>
                </td>

                <td>
                  <div className="row-actions">
                    <button
                      className="btn btn-outline btn-small"
                      onClick={() => openEditForm(song)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-outline btn-small btn-danger"
                      onClick={() => handleDelete(song)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Beats management table */}
      {activeTab === 'beats' && !loading && !error && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Artwork</th>
              <th>Beat</th>
              <th>Details</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {beats.length === 0 && (
              <tr>
                <td colSpan={5} className="state-message">
                  No beats uploaded yet.
                </td>
              </tr>
            )}

            {beats.map((beat) => (
              <tr key={beat._id}>
                <td>
                  {beat.artworkUrl ? (
                    <img
                      className="admin-thumb"
                      src={getMediaUrl(beat.artworkUrl)}
                      alt={beat.title}
                    />
                  ) : (
                    <div className="admin-thumb admin-thumb-fallback">
                      🎵
                    </div>
                  )}
                </td>

                <td>
                  <strong>{beat.title}</strong>
                  <div>{beat.producer || 'Spellze'}</div>
                </td>

                <td>
                  {[
                    beat.genre,
                    beat.bpm ? `${beat.bpm} BPM` : '',
                    beat.key,
                    beat.mood,
                  ]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </td>

                <td>
                  <button
                    className={`status-pill ${
                      beat.published ? 'on' : 'off'
                    }`}
                    onClick={() => handleToggleBeatPublished(beat)}
                  >
                    {beat.published ? 'Published' : 'Draft'}
                  </button>
                </td>

                <td>
                  <div className="row-actions">
                    <button
                      className="btn btn-outline btn-small"
                      onClick={() => openEditForm(beat)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-outline btn-small btn-danger"
                      onClick={() => handleDeleteBeat(beat)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
