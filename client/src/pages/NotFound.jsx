import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="page-section" style={{ textAlign: 'center', paddingTop: '6rem' }}>
      <h1>404</h1>
      <p>That page doesn't exist.</p>
      <Link to="/" className="btn btn-primary">
        Back Home
      </Link>
    </section>
  );
}
