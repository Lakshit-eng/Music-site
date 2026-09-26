// Keeps track of whether an admin is logged in, across the whole app.
// The token itself lives in localStorage; this context just holds the
// in-memory "am I logged in" state so components can react to it.

import { createContext, useContext, useEffect, useState } from 'react';
import { fetchCurrentAdmin } from '../services/api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'spellze_admin_token';

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // On first load, if a token was saved from a previous visit, check
  // that it's still valid so a reload doesn't log the admin out.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setCheckingSession(false);
      return;
    }
    fetchCurrentAdmin()
      .then((adminData) => setAdmin(adminData))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setCheckingSession(false));
  }, []);

  function login(token, adminData) {
    localStorage.setItem(TOKEN_KEY, token);
    setAdmin(adminData);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setAdmin(null);
  }

  return (
    <AuthContext.Provider value={{ admin, isLoggedIn: !!admin, checkingSession, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
