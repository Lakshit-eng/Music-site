// A simple, dependency-free HTML5 audio player.
// Uses AudioContext so that starting playback here automatically pauses
// whatever else is currently playing anywhere on the site.

import { useEffect, useRef, useState } from 'react';
import { useAudioContext } from '../context/AudioContext';
import '../styles/AudioPlayer.css';

function formatTime(seconds) {
  if (!seconds || Number.isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
}

export default function AudioPlayer({ songId, audioUrl }) {
  const audioRef = useRef(null);
  const { playingSongId, setPlayingSongId } = useAudioContext();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasError, setHasError] = useState(false);

  const isThisTrackActive = playingSongId === songId;

  // If some other track becomes the active one, pause ourselves.
  useEffect(() => {
    if (!isThisTrackActive && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isThisTrackActive]);

  function togglePlay() {
    const audioEl = audioRef.current;
    if (!audioEl || hasError) return;

    if (isPlaying) {
      audioEl.pause();
      setIsPlaying(false);
    } else {
      setPlayingSongId(songId); // tells every other player to pause
      audioEl.play().catch(() => setHasError(true));
      setIsPlaying(true);
    }
  }

  function handleSeek(e) {
    const audioEl = audioRef.current;
    if (!audioEl || !duration) return;
    const newTime = Number(e.target.value);
    audioEl.currentTime = newTime;
    setCurrentTime(newTime);
  }

  if (!audioUrl) {
    return <div className="audio-player audio-player-missing">Audio not available</div>;
  }

  return (
    <div className="audio-player">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onEnded={() => setIsPlaying(false)}
        onError={() => setHasError(true)}
      />

      {hasError ? (
        <p className="audio-player-error">This track couldn't be loaded.</p>
      ) : (
        <>
          <button
            className="play-button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>

          <span className="time-label">{formatTime(currentTime)}</span>

          <input
            className="progress-bar"
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
          />

          <span className="time-label">{formatTime(duration)}</span>
        </>
      )}
    </div>
  );
}
