// Types for sensor data and API responses

export interface Location {
  lat: number;
  lon: number;
}

export interface SensorReading {
  accel_x: number;
  accel_y: number;
  accel_z: number;
  gyro_x: number;
  gyro_y: number;
  gyro_z: number;
  mag_x: number;
  mag_y: number;
  mag_z: number;
  tilt_angle: number;
}

export interface SensorData {
  _id?: string;
  deviceId: string;
  timestamp: string;
  data: SensorReading;
  severity: 'normal' | 'warning' | 'danger' | 'critical';
  location?: Location;
}

export interface Statistics {
  totalDevices: number;
  activeDevices: number;
  criticalAlerts: number;
  dangerAlerts: number;
  warningAlerts: number;
  lastUpdated: string;
}

export interface Alert extends SensorData {
  severity: 'danger' | 'critical';
}
