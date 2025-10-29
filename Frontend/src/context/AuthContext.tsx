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
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  useEffect(() => {
    // Optionally fetch profile if you expose it. Here we decode from token on login only.
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    // Minimal user from email since backend returns only token
    setUser({ id: 0, email, username: email.split('@')[0] });
  };

  const signup = async (username: string, email: string, password: string) => {
    await api.post('/auth/signup', { username, email, password });
    await login(email, password);
  };

  const logout = async () => {
    const tok = localStorage.getItem('token');
    if (tok) {
      await api.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${tok}` } });
    }
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, token, login, signup, logout }), [user, token]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
