import { useEffect, useState } from 'react';
import { fetchFeaturedSongs } from '../services/api';
import SongCard from './SongCard';
import '../styles/FeaturedTracks.css';

export default function FeaturedTracks() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeaturedSongs(6)
      .then(setSongs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="top-tracks" className="featured-tracks">
      <div className="section-heading">
        <h2>Top Tracks</h2>
        <p>A hand-picked selection of Spellze's latest work.</p>
      </div>

      {loading && <p className="state-message">Loading tracks…</p>}
      {error && <p className="state-message error">{error}</p>}
      {!loading && !error && songs.length === 0 && (
        <p className="state-message">No featured tracks yet — check back soon.</p>
      )}

      <div className="featured-tracks-grid">
        {songs.map((song) => (
          <SongCard key={song._id} song={song} />
        ))}
      </div>
    </section>
  );
}
