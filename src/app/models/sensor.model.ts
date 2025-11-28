export interface SensorData {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  status: 'normal' | 'warning' | 'danger';
  icon: string;
  min: number;
  max: number;
}

export interface DeviceStatus {
  id: string;
  name: string;
  type: 'blinds' | 'fan';
  status: 'on' | 'off' | 'auto';
  icon: string;
  level?: number; // Para persianas (0-100) o velocidad ventilador
  lastUpdate: Date;
}
