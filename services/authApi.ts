import api from '../utils/api';
import { setAuthToken, removeAuthToken } from './sensorApi';

type LoginPayload = {
  username: string;
  password: string;
};

type LoginResponse = {
  status: string;
  token?: string;
  message?: string;
};

const TOKEN_KEY = 'warning_system_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function loadTokenFromStorage() {
  const token = getStoredToken();
  if (token) setAuthToken(token);
  return token;
}

export async function login(payload: LoginPayload) {
  const res = await api.post<LoginResponse>('/api/auth/login', payload);
  const token = res.data.token;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    setAuthToken(token);
  }
  return res.data;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  removeAuthToken();
}

