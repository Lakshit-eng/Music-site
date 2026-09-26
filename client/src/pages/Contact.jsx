import '../styles/Contact.css';

export default function Contact() {
  return (
    <section className="contact-page">
      <div className="section-heading">
        <h1>Contact</h1>
        <p>Have a track you want produced, mixed, or mastered? Reach out.</p>
      </div>

      <div className="contact-links">
        <a
          className="btn btn-primary"
          href="https://www.instagram.com/spellze_music/"
          target="_blank"
          rel="noreferrer"
        >
          Instagram
        </a>
        <a className="btn btn-outline" href="mailto:spellzemusic@gmail.com">
          spellzemusic@gmail.com
        </a>
      </div>
    </section>
  );
}
