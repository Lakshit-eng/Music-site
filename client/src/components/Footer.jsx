import { Link } from 'react-router-dom';
import '../styles/Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">SPELLZE</div>

        <nav className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/produced">Produced</Link>
          <Link to="/mixed-mastered">Mixed & Mastered</Link>
          <Link to="/services">Services</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        <div className="footer-social">
          <a href="https://instagram.com/spellze" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a href="mailto:contact@spellze.in">Email</a>
        </div>

        <p className="footer-copy">© {year} Spellze. All rights reserved.</p>
      </div>
    </footer>
  );
}
