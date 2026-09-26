import { Link } from 'react-router-dom';
import '../styles/Services.css';

const serviceGroups = [
  {
    title: 'Production',
    items: ['Beat production', 'Full song production', 'Arrangement', 'Custom production'],
  },
  {
    title: 'Mixing',
    items: ['Professional vocal / song mixing', 'Production mixing'],
  },
  {
    title: 'Mastering',
    items: ['Final mastering', 'Release-ready masters'],
  },
];

export default function Services() {
  return (
    <section className="services-page">
      <div className="section-heading">
        <h1>Services</h1>
        <p>Everything your track needs, from the first idea to a release-ready master.</p>
      </div>

      <div className="services-grid">
        {serviceGroups.map((group) => (
          <div key={group.title} className="service-card">
            <h3>{group.title}</h3>
            <ul>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="services-cta">
        <Link to="/contact" className="btn btn-primary">
          Work With Spellze
        </Link>
      </div>
    </section>
  );
}
