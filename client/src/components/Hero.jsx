import { Link } from 'react-router-dom';
import '../styles/Hero.css';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-glow" />
      <div className="hero-content">
        <p className="hero-eyebrow">Music Producer · Mixing · Mastering</p>
        <h1 className="hero-title">SPELLZE</h1>
        <p className="hero-tagline">
          Crafting sound for artists who want their music to feel bigger than life.
        </p>
        <div className="hero-ctas">
          <a href="#top-tracks" className="btn btn-primary">
            Listen
          </a>
          <Link to="/contact" className="btn btn-outline">
            Work With Me
          </Link>
        </div>
      </div>
    </section>
  );
}
