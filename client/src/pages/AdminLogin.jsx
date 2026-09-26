import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { loginAdmin } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Admin.css';

export default function AdminLogin() {
  const { isLoggedIn, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isLoggedIn) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { token, admin } = await loginAdmin(email, password);
      login(token, admin);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-auth-page">
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <h1>SPELLZE Admin</h1>
        {error && <p className="form-error">{error}</p>}

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log In'}
        </button>
      </form>
    </div>
  );
}
