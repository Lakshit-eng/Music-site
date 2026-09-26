import { useState } from 'react';
import AudioPlayer from './AudioPlayer';
import { getMediaUrl } from '../services/api';
import '../styles/SongCard.css';

export default function SongCard({ song }) {
  const [posterBroken, setPosterBroken] = useState(false);

  return (
    <div className="song-card">
      <div className="song-poster">
        {song.posterUrl && !posterBroken ? (
          <img
            src={getMediaUrl(song.posterUrl)}
            alt={song.title}
            onError={() => setPosterBroken(true)}
          />
        ) : (
          <div className="song-poster-fallback">🎵</div>
        )}
      </div>

      <div className="song-info">
        <h3 className="song-title">{song.title}</h3>
        <p className="song-artist">{song.artist}</p>
        {song.description && <p className="song-description">{song.description}</p>}
      </div>

      <AudioPlayer songId={song._id} audioUrl={getMediaUrl(song.audioUrl)} />
    </div>
  );
}
