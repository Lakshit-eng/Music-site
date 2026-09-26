// Wraps /admin routes. If there's no logged-in admin, redirect to login.

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isLoggedIn, checkingSession } = useAuth();

  if (checkingSession) {
    return <p className="state-message">Checking session…</p>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
