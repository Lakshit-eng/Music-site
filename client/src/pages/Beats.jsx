
import { useEffect, useState } from 'react';
import BeatRow from '../components/BeatRow';
import { fetchPublicBeats } from '../services/api';
import '../styles/Beats.css';

export default function Beats() {
  const [beats, setBeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    fetchPublicBeats()
      .then((data) => {
        if (active) setBeats(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="beats-page">
      <div className="catalog-page">
        <div className="section-heading">
          <h1>Beats</h1>
          <p>
            Original instrumentals available for artists, writers and creators.
          </p>
        </div>

        {loading && <p className="state-message">Loading beats…</p>}

        {error && (
          <p className="state-message error">
            Could not load beats: {error}
          </p>
        )}

        {!loading && !error && beats.length === 0 && (
          <p className="state-message">
            No beats available yet. Check back soon.
          </p>
        )}

        {!loading && !error && beats.length > 0 && (
          <div className="beats-list">
            {beats.map((beat, index) => (
              <BeatRow key={beat._id} beat={beat} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
