import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

type User = { id: number; email: string; username: string } | null;

type AuthContextType = {
  user: User;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as any);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) {
      setToken(t);
      const email = localStorage.getItem('email') || 'user@example.com';
      const username = localStorage.getItem('username') || email.split('@')[0];
      setUser({ id: 0, email, username });
    }
    setReady(true);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('email', email);
    localStorage.setItem('username', email.split('@')[0]);
    setToken(data.token);
    setUser({ id: 0, email, username: email.split('@')[0] });
  };

  const signup = async (username: string, email: string, password: string) => {
    await api.post('/auth/signup', { username, email, password });
    await login(email, password);
    localStorage.setItem('username', username);
    setUser({ id: 0, email, username });
  };

  const logout = async () => {
    const tok = localStorage.getItem('token');
    try {
      if (tok) await api.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${tok}` } });
    } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('username');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, token, login, signup, logout }), [user, token]);
  if (!ready) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
