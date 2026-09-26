import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import FeaturedTracks from '../components/FeaturedTracks';
import '../styles/Home.css';

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedTracks />

      <section className="home-teaser">
        <div className="home-teaser-card">
          <h3>Production, Mixing &amp; Mastering</h3>
          <p>From a single beat to a release-ready master — see how Spellze can help.</p>
          <Link to="/services" className="btn btn-outline">
            View Services
          </Link>
        </div>
        <div className="home-teaser-card">
          <h3>Let's Make Something</h3>
          <p>Have a track in mind? Reach out and let's talk about your sound.</p>
          <Link to="/contact" className="btn btn-outline">
            Get In Touch
          </Link>
        </div>
      </section>
    </>
  );
}
