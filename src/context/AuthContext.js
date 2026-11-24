import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiFetch, setUnauthorizedHandler } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const logout = async () => {
    await SecureStore.deleteItemAsync('user_token');
    await SecureStore.deleteItemAsync('user_data');
    setUser(null);
  };

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
    });

    const restaurarSesion = async () => {
      try {
        const token = await SecureStore.getItemAsync('user_token');
        if (!token) {
          setLoadingSession(false);
          return;
        }
        const data = await apiFetch('/api/auth/me');
        const userData = data.user || data;
        setUser(userData);
        await SecureStore.setItemAsync('user_data', JSON.stringify(userData));
      } catch {
        await logout();
      } finally {
        setLoadingSession(false);
      }
    };

    restaurarSesion();
  }, []);

  const login = async (email, password) => {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    await SecureStore.setItemAsync('user_token', data.token);
    await SecureStore.setItemAsync('user_data', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
    return await apiFetch('/api/auth/register', {
      method: 'POST',
      body: { ...formData, rol: 'USER' },
    });
  };

  return (
    <AuthContext.Provider value={{ user, loadingSession, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);