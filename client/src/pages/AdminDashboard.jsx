import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SongForm from '../components/SongForm';
import {
  fetchAdminSongs,
  createSong,
  updateSong,
  deleteSong,
  setSongFeatured,
  setSongPublished,
  moveSongPosition,
  getMediaUrl,
} from '../services/api';
import '../styles/Admin.css';

const TABS = [
  { key: 'produced', label: 'Produced' },
  { key: 'mixed_mastered', label: 'Mixed & Mastered' },
];

export default function AdminDashboard() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('produced');
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingSong, setEditingSong] = useState(null); // null = adding new
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  function loadSongs() {
    setLoading(true);
    setError('');
    fetchAdminSongs(activeTab)
      .then(setSongs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadSongs();
    setShowForm(false);
    setEditingSong(null);
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

  function openEditForm(song) {
    setEditingSong(song);
    setShowForm(true);
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
      setShowForm(false);
      setEditingSong(null);
      loadSongs();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(song) {
    const confirmed = window.confirm(`Delete "${song.title}"? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await deleteSong(song._id);
      loadSongs();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleToggleFeatured(song) {
    try {
      await setSongFeatured(song._id, !song.featured);
      loadSongs();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleTogglePublished(song) {
    try {
      await setSongPublished(song._id, !song.published);
      loadSongs();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleMove(song, direction) {
    try {
      await moveSongPosition(song._id, direction);
      loadSongs();
    } catch (err) {
      setActionError(err.message);
    }
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Spellze Admin</h1>
        <div className="admin-header-right">
          <span>{admin?.email}</span>
          <button className="btn btn-outline btn-small" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="admin-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`admin-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-toolbar">
        <button className="btn btn-primary" onClick={openAddForm}>
          + Add Song
        </button>
      </div>

      {actionError && <p className="form-error">{actionError}</p>}

      {showForm && (
        <div className="admin-form-panel">
          <h2>{editingSong ? 'Edit Song' : 'Add Song'}</h2>
          <SongForm
            song={editingSong}
            defaultCategory={activeTab}
            submitting={submitting}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingSong(null);
            }}
          />
        </div>
      )}

      {loading && <p className="state-message">Loading songs…</p>}
      {error && <p className="state-message error">{error}</p>}

      {!loading && !error && (
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
                    <img className="admin-thumb" src={getMediaUrl(song.posterUrl)} alt={song.title} />
                  ) : (
                    <div className="admin-thumb admin-thumb-fallback">🎵</div>
                  )}
                </td>
                <td>{song.title}</td>
                <td>{song.artist}</td>
                <td>
                  <button
                    className={`status-pill ${song.published ? 'on' : 'off'}`}
                    onClick={() => handleTogglePublished(song)}
                  >
                    {song.published ? 'Published' : 'Draft'}
                  </button>
                </td>
                <td>
                  <button
                    className={`status-pill ${song.featured ? 'on' : 'off'}`}
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
                    <button className="btn btn-outline btn-small" onClick={() => openEditForm(song)}>
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
    </div>
  );
}
