import BeatRow from '../components/BeatRow';
import '../styles/Beats.css';

const demoBeats = [
  {
    id: 'beat-1',
    title: 'Way To The Hills',
    producer: 'Spellze',
    genre: 'Trap',
    bpm: 140,
    key: 'G Minor',
    mood: 'Dark',
    previewUrl: '',
    artworkUrl: '',
  },
  {
    id: 'beat-2',
    title: 'Lost In The Couch',
    producer: 'Spellze',
    genre: 'Ambient',
    bpm: 120,
    key: 'C Minor',
    mood: 'Moody',
    previewUrl: '',
    artworkUrl: '',
  },
  {
    id: 'beat-3',
    title: 'Night Drive',
    producer: 'Spellze',
    genre: 'Trap',
    bpm: 145,
    key: 'F Minor',
    mood: 'Dark',
    previewUrl: '',
    artworkUrl: '',
  },
];

export default function Beats() {
  return (
    <section className="beats-page">
      <div className="catalog-page">

        <div className="section-heading">
          <h1>Beats</h1>
          <p>
            Original instrumentals available for artists, writers and creators.
          </p>
        </div>

        <div className="beats-list">
          {demoBeats.map((beat, index) => (
            <BeatRow
              key={beat.id}
              beat={beat}
              index={index}
            />
          ))}
        </div>

      </div>
    </section>
  );
}