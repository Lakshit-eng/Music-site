// Makes sure only ONE song plays at a time across the entire site.
//
// How it works: every <AudioPlayer> asks this context "am I the one
// that's supposed to be playing?" by comparing its own song id to
// `playingSongId`. When a player starts playback, it calls
// `setPlayingSongId(itsOwnId)`, which makes every other player pause
// itself (see AudioPlayer.jsx).

import { createContext, useContext, useState } from 'react';

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const [playingSongId, setPlayingSongId] = useState(null);

  return (
    <AudioContext.Provider value={{ playingSongId, setPlayingSongId }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudioContext() {
  return useContext(AudioContext);
}
