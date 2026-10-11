import { useEffect, useRef, useState } from 'react';
import { getMediaUrl } from '../services/api';
import '../styles/BeatRow.css';

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default function BeatRow({ beat, index }) {
  const audioRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const beatId = beat._id || beat.id || `beat-${index}`;

  useEffect(() => {
    const handleOtherBeatPlaying = (event) => {
      if (event.detail !== beatId && audioRef.current) {
        audioRef.current.pause();
      }
    };

    window.addEventListener(
      'spellze:beat-play',
      handleOtherBeatPlaying
    );

    return () => {
      window.removeEventListener(
        'spellze:beat-play',
        handleOtherBeatPlaying
      );
    };
  }, [beatId]);

  const togglePlay = async () => {
    const audio = audioRef.current;

    if (!audio) return;

    if (audio.paused) {
      window.dispatchEvent(
        new CustomEvent('spellze:beat-play', {
          detail: beatId,
        })
      );

      try {
        await audio.play();
      } catch (error) {
        console.error('Beat playback failed:', error);
      }
    } else {
      audio.pause();
    }
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;

    if (!audio) return;

    setDuration(audio.duration);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;

    if (!audio) return;

    setCurrentTime(audio.currentTime);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleProgressClick = (event) => {
    const audio = audioRef.current;

    if (!audio || !duration) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickPosition = event.clientX - rect.left;
    const percentage = clickPosition / rect.width;

    audio.currentTime = percentage * duration;
  };

  const progress =
    duration > 0 ? (currentTime / duration) * 100 : 0;

  const artwork = beat.artworkUrl || beat.posterUrl;

  return (
    <article className={`beat-row ${isPlaying ? 'is-playing' : ''}`}>
      <div className="beat-row-main">

        {/* Artwork */}
        <div className="beat-artwork">
          {artwork ? (
            <img
              src={getMediaUrl(artwork)}
              alt={beat.title}
            />
          ) : (
            <div className="beat-artwork-fallback">
              ♪
            </div>
          )}
        </div>

        {/* Beat information */}
        <div className="beat-content">

          <div className="beat-header">

            <div className="beat-title-block">
              <span className="beat-number">
                {String(index + 1).padStart(2, '0')}
              </span>

              <div>
                <h3 className="beat-title">
                  {beat.title}
                </h3>

                {beat.producer && (
                  <p className="beat-producer">
                    {beat.producer}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              className="beat-play-button"
              onClick={togglePlay}
              aria-label={
                isPlaying
                  ? `Pause ${beat.title}`
                  : `Play ${beat.title}`
              }
            >
              {isPlaying ? 'Ⅱ' : '▶'}
            </button>

          </div>

          {/* Progress */}
          <div className="beat-progress-row">

            <span className="beat-time">
              {formatTime(currentTime)}
            </span>

            <button
              type="button"
              className="beat-progress"
              onClick={handleProgressClick}
              aria-label={`Seek ${beat.title}`}
            >
              <span
                className="beat-progress-fill"
                style={{
                  width: `${progress}%`,
                }}
              />
            </button>

            <span className="beat-time beat-duration">
              {formatTime(duration)}
            </span>

          </div>

          {/* Metadata */}
          <div className="beat-meta">

            {beat.genre && (
              <span>{beat.genre}</span>
            )}

            {beat.bpm && (
              <span>{beat.bpm} BPM</span>
            )}

            {beat.key && (
              <span>{beat.key}</span>
            )}

            {beat.mood && (
              <span>{beat.mood}</span>
            )}

          </div>

        </div>
      </div>

      <audio
        ref={audioRef}
        src={getMediaUrl(beat.previewUrl || beat.audioUrl)}
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
      />
    </article>
  );
}