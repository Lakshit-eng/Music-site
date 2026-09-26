import { useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useClickOutside } from '../hooks/useClickOutside';
import '../styles/Navbar.css';

const links = [
  { to: '/', label: 'Home' },
  { to: '/produced', label: 'Produced' },
  { to: '/mixed-mastered', label: 'Mixed & Mastered' },
  { to: '/services', label: 'Services' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navRef = useRef(null);

  useClickOutside(navRef, () => setOpen(false));

  return (
    <header className="navbar" ref={navRef}>
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-logo" onClick={() => setOpen(false)}>
          SPELLZE
        </NavLink>

        <button
          className="navbar-toggle"
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`navbar-links ${open ? 'open' : ''}`}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
