// ONE central place for every API call the frontend makes.
// No component should call fetch/axios directly - import functions from
// here instead. This keeps API logic (URLs, headers, error format) in a
// single, easy-to-find file.

import axios from 'axios';

// In dev, VITE_API_URL is usually empty and Vite's proxy (see
// vite.config.js) forwards /api requests to the backend.
// In production, set VITE_API_URL to your deployed backend URL.
const baseURL = import.meta.env.VITE_API_URL || '';

const api = axios.create({ baseURL });

// Audio/poster URLs come back from the API as relative paths like
// "/uploads/audio/song.mp3". In development, Vite's proxy makes those
// work automatically against the frontend's own origin. In production,
// if the frontend and backend are deployed to different domains, this
// turns them into full URLs pointing at the backend instead.
export function getMediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${baseURL}${path}`;
}

// Attach the saved admin token (if any) to every request automatically.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('spellze_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Turn axios errors into a plain, readable message string that
// components can show directly in the UI.
function readableError(err) {
  return err.response?.data?.message || err.message || 'Something went wrong. Please try again.';
}

// ---------- PUBLIC ----------

export async function fetchFeaturedSongs(limit = 6) {
  try {
    const res = await api.get('/api/songs/featured', { params: { limit } });
    return res.data.songs;
  } catch (err) {
    throw new Error(readableError(err));
  }
}

export async function fetchSongsPage({ category, page = 1, limit = 8 }) {
  try {
    const res = await api.get('/api/songs', { params: { category, page, limit } });
    return res.data; // { songs, currentPage, totalPages, totalCount }
  } catch (err) {
    throw new Error(readableError(err));
  }
}

// ---------- AUTH ----------

export async function loginAdmin(email, password) {
  try {
    const res = await api.post('/api/auth/login', { email, password });
    return res.data; // { token, admin }
  } catch (err) {
    throw new Error(readableError(err));
  }
}

export async function fetchCurrentAdmin() {
  try {
    const res = await api.get('/api/auth/me');
    return res.data.admin;
  } catch (err) {
    throw new Error(readableError(err));
  }
}

// ---------- ADMIN: SONG MANAGEMENT ----------

export async function fetchAdminSongs(category) {
  try {
    const res = await api.get('/api/songs/admin/all', { params: { category } });
    return res.data.songs;
  } catch (err) {
    throw new Error(readableError(err));
  }
}

// `formData` is a FormData instance built by the SongForm component -
// it can include title/artist/etc fields plus optional audio/poster files.
export async function createSong(formData) {
  try {
    const res = await api.post('/api/songs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.song;
  } catch (err) {
    throw new Error(readableError(err));
  }
}

export async function updateSong(id, formData) {
  try {
    const res = await api.put(`/api/songs/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.song;
  } catch (err) {
    throw new Error(readableError(err));
  }
}

export async function deleteSong(id) {
  try {
    await api.delete(`/api/songs/${id}`);
  } catch (err) {
    throw new Error(readableError(err));
  }
}

export async function setSongFeatured(id, featured) {
  try {
    const res = await api.patch(`/api/songs/${id}/featured`, { featured });
    return res.data.song;
  } catch (err) {
    throw new Error(readableError(err));
  }
}

export async function setSongPublished(id, published) {
  try {
    const res = await api.patch(`/api/songs/${id}/published`, { published });
    return res.data.song;
  } catch (err) {
    throw new Error(readableError(err));
  }
}

export async function moveSongPosition(id, direction) {
  try {
    const res = await api.patch(`/api/songs/${id}/position`, { direction });
    return res.data.song;
  } catch (err) {
    throw new Error(readableError(err));
  }
}

export default api;
