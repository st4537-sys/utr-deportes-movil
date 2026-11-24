import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

const RAW_BASE_URL = process.env.EXPO_PUBLIC_API_URL || '';
const BASE_URL = RAW_BASE_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
const APP_TOKEN = process.env.EXPO_PUBLIC_API_APP_TOKEN;

let onUnauthorizedCallback = null;

export const setUnauthorizedHandler = (callback) => {
  onUnauthorizedCallback = callback;
};

export const apiFetch = async (endpoint, options = {}) => {
  const userToken = await SecureStore.getItemAsync('user_token');

  const headers = {
    'Content-Type': 'application/json',
    'x-api-token': APP_TOKEN,
    ...options.headers,
  };

  if (userToken) {
    headers['Authorization'] = `Bearer ${userToken}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  // 401 Unauthorized: limpiar SecureStore y regresar al Login
  if (response.status === 401) {
    await SecureStore.deleteItemAsync('user_token');
    await SecureStore.deleteItemAsync('user_data');
    if (onUnauthorizedCallback) {
      onUnauthorizedCallback();
    }
    throw new Error('Sesión expirada o no autorizada. Inicia sesión nuevamente.');
  }

  // 403 Forbidden: alerta de acceso restringido
  if (response.status === 403) {
    Alert.alert('Acceso Restringido (403)', 'No tienes permisos para acceder a este recurso.');
    throw new Error('Acceso restringido (403 Forbidden).');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      const detalles = data.errors.map((e) => `${e.campo}: ${e.mensaje}`).join('\n');
      throw new Error(detalles);
    }
    if (response.status === 404) {
      throw new Error(data?.message || 'Recurso no encontrado (404).');
    }
    if (response.status === 409) {
      throw new Error(data?.message || 'Conflicto o sin stock disponible (409).');
    }
    if (response.status === 429) {
      throw new Error('Demasiadas peticiones (429). Espera un momento.');
    }
    throw new Error(data?.message || `Error del servidor (${response.status}).`);
  }

  return data;
};