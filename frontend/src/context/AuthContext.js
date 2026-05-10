import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext();
const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gc_user')); } catch { return null; }
  });
  const inactivityTimer = useRef(null);

  const logout = useCallback(() => {
    localStorage.removeItem('gc_token');
    localStorage.removeItem('gc_user');
    setUser(null);
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      logout();
      window.location.href = '/?reason=inactivity';
    }, INACTIVITY_LIMIT);
  }, [logout]);

  // Listen for user activity
  useEffect(() => {
    if (!user) return;
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetInactivityTimer));
    resetInactivityTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetInactivityTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [user, resetInactivityTimer]);

  const login = async (email, password, rememberMe = false) => {
    const { data } = await api.post('/auth/login', { email, password, rememberMe });
    localStorage.setItem('gc_token', data.token);
    localStorage.setItem('gc_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (form) => {
    const { data } = await api.post('/auth/register', form);
    localStorage.setItem('gc_token', data.token);
    localStorage.setItem('gc_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
