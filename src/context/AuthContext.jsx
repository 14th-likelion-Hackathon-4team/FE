/* eslint-disable react-refresh/only-export-components -- 기존 context와 provider 공개 API를 유지한다. */
import { createContext, useState } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const isLoggedIn = !!user;

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('token', userData.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>{children}</AuthContext.Provider>;
};
