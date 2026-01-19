import api from '../utils/api';
import type { SensorData, Statistics, Alert } from '../types/sensor';

// Set auth token for requests
export function setAuthToken(token: string) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Remove auth token
export function removeAuthToken() {
  delete api.defaults.headers.common['Authorization'];
}

// Get latest data from all devices
export async function getLatestDevices(): Promise<SensorData[]> {
  const response = await api.get('/api/records/get');
  return response.data;
}

// Get device history
export async function getDeviceHistory(
  deviceId: string,
  from?: string,
  to?: string,
  limit: number = 100
): Promise<SensorData[]> {
  const params: any = { device_id: deviceId, limit };
  if (from) params.from = from;
  if (to) params.to = to;
  
  const response = await api.get('/api/records/get', { params });
  return response.data;
}

// Get alerts
export async function getAlerts(limit: number = 50): Promise<Alert[]> {
  const response = await api.get('/api/alerts/', { params: { limit } });
  return response.data;
}

// Get statistics
export async function getStatistics(): Promise<Statistics> {
  const response = await api.get('/api/alerts/statistics');
  return response.data;
}

// Get device history by device ID endpoint
export async function getDeviceHistoryById(
  deviceId: string,
  from?: string,
  to?: string,
  limit: number = 100
): Promise<SensorData[]> {
  const params: any = { limit };
  if (from) params.from = from;
  if (to) params.to = to;
  
  const response = await api.get(`/api/devices/${deviceId}/history`, { params });
  return response.data;
}
