// Shared implementation behind /produced and /mixed-mastered.
// Handles fetching a paginated list of songs for a given category.

import { useEffect, useState } from 'react';
import { fetchSongsPage } from '../services/api';
import SongCard from '../components/SongCard';
import Pagination from '../components/Pagination';
import '../styles/SongCatalogPage.css';

const PAGE_SIZE = 8;

export default function SongCatalogPage({ category, title, subtitle }) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ songs: [], currentPage: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchSongsPage({ category, page, limit: PAGE_SIZE })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [category, page]);

  function goToPage(newPage) {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <section className="catalog-page">
      <div className="section-heading">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      {loading && <p className="state-message">Loading songs…</p>}
      {error && <p className="state-message error">{error}</p>}
      {!loading && !error && data.songs.length === 0 && (
        <p className="state-message">No songs published in this category yet.</p>
      )}

      <div className="catalog-grid">
        {data.songs.map((song) => (
          <SongCard key={song._id} song={song} />
        ))}
      </div>

      <Pagination currentPage={data.currentPage} totalPages={data.totalPages} onPageChange={goToPage} />
    </section>
  );
}
