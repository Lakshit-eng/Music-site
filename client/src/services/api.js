// ONE central place for every API call the frontend makes.
// No component should call fetch/axios directly - import functions from
// here instead. This keeps API logic (URLs, headers, error format) in a
// single, easy-to-find file.

import axios from 'axios';

// In dev, VITE_API_URL is usually empty and Vite's proxy (see
// vite.config.js) forwards /api requests to the backend.
// In production, set VITE_API_URL to your deployed backend URL.
const baseURL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL,
});

// Audio/poster URLs can either be:
// - Full Cloudinary URLs
// - Relative legacy URLs such as "/uploads/audio/song.mp3"
export function getMediaUrl(path) {
  if (!path) return '';

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return `${baseURL}${path}`;
}

// Attach the saved admin token to every backend request automatically.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('spellze_admin_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Turn axios errors into a plain, readable message string.
function readableError(err) {
  return (
    err.response?.data?.message ||
    err.message ||
    'Something went wrong. Please try again.'
  );
}

// ============================================================
// PUBLIC
// ============================================================

export async function fetchFeaturedSongs(limit = 6) {
  try {
    const res = await api.get('/api/songs/featured', {
      params: { limit },
    });

    return res.data.songs;
  } catch (err) {
    throw new Error(readableError(err));
  }
}

export async function fetchSongsPage({
  category,
  page = 1,
  limit = 8,
}) {
  try {
    const res = await api.get('/api/songs', {
      params: {
        category,
        page,
        limit,
      },
    });

    return res.data;
  } catch (err) {
    throw new Error(readableError(err));
  }
}

// ============================================================
// AUTH
// ============================================================

export async function loginAdmin(email, password) {
  try {
    const res = await api.post('/api/auth/login', {
      email,
      password,
    });

    return res.data;
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

// ============================================================
// CLOUDINARY
// ============================================================

/**
 * Get a signed Cloudinary upload signature from our backend.
 *
 * The Cloudinary API secret NEVER reaches the browser.
 * The backend signs the upload request instead.
 */
export async function getCloudinarySignature() {
  try {
    const res = await api.get('/api/cloudinary/signature');

    return res.data;
  } catch (err) {
    throw new Error(readableError(err));
  }
}

/**
 * Upload a file directly from the browser to Cloudinary.
 *
 * Returns Cloudinary's upload response, including:
 * - secure_url
 * - public_id
 * - resource_type
 * - format
 * etc.
 */
export async function uploadToCloudinary(file) {
  if (!file) {
    throw new Error('No file was provided for upload.');
  }

  try {
    // Ask our backend for a signed upload.
    const {
      timestamp,
      signature,
      cloudName,
      apiKey,
    } = await getCloudinarySignature();

    const formData = new FormData();

    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('folder', 'spellze');

    // Direct browser → Cloudinary upload.
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      formData
    );

    return res.data;
  } catch (err) {
    console.error('Cloudinary upload error:', err);

    throw new Error(
      err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Cloudinary upload failed.'
    );
  }
}

// ============================================================
// ADMIN: SONG MANAGEMENT
// ============================================================

export async function fetchAdminSongs(category) {
  try {
    const res = await api.get('/api/songs/admin/all', {
      params: { category },
    });

    return res.data.songs;
  } catch (err) {
    throw new Error(readableError(err));
  }
}

/**
 * Create a song.
 *
 * IMPORTANT:
 * The audio/poster files are NO LONGER sent here.
 *
 * SongForm uploads them directly to Cloudinary first, then
 * passes the resulting URLs/public IDs here as normal JSON.
 */
export async function createSong(songData) {
  try {
    const res = await api.post('/api/songs', songData);

    return res.data.song;
  } catch (err) {
    throw new Error(readableError(err));
  }
}

/**
 * Update a song.
 *
 * Same idea as createSong():
 * Cloudinary handles the actual files.
 * This request only sends JSON metadata + Cloudinary URLs.
 */
export async function updateSong(id, songData) {
  try {
    const res = await api.put(`/api/songs/${id}`, songData);

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
    const res = await api.patch(
      `/api/songs/${id}/featured`,
      { featured }
    );

    return res.data.song;
  } catch (err) {
    throw new Error(readableError(err));
  }
}

export async function setSongPublished(id, published) {
  try {
    const res = await api.patch(
      `/api/songs/${id}/published`,
      { published }
    );

    return res.data.song;
  } catch (err) {
    throw new Error(readableError(err));
  }
}

export async function moveSongPosition(id, direction) {
  try {
    const res = await api.patch(
      `/api/songs/${id}/position`,
      { direction }
    );

    return res.data.song;
  } catch (err) {
    throw new Error(readableError(err));
  }
}

export default api;