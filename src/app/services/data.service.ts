import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { SensorData, DeviceStatus } from '../models/sensor.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private sensorsSubject = new BehaviorSubject<SensorData[]>([]);
  private devicesSubject = new BehaviorSubject<DeviceStatus[]>([]);

  public sensors$: Observable<SensorData[]> = this.sensorsSubject.asObservable();
  public devices$: Observable<DeviceStatus[]> = this.devicesSubject.asObservable();

  constructor() {
    this.initializeSensors();
    this.initializeDevices();
    this.startDataSimulation();
  }

  private initializeSensors(): void {
    const sensors: SensorData[] = [
      {
        id: 'ldr-1',
        name: 'Iluminación',
        value: 650,
        unit: 'lux',
        timestamp: new Date(),
        status: 'normal',
        icon: '💡',
        min: 0,
        max: 1000
      },
      {
        id: 'humidity-1',
        name: 'Humedad Relativa',
        value: 55,
        unit: '%',
        timestamp: new Date(),
        status: 'normal',
        icon: '💧',
        min: 0,
        max: 100
      },
      {
        id: 'temp-1',
        name: 'Temperatura',
        value: 22,
        unit: '°C',
        timestamp: new Date(),
        status: 'normal',
        icon: '🌡️',
        min: 15,
        max: 35
      }
    ];
    this.sensorsSubject.next(sensors);
  }

  private initializeDevices(): void {
    const devices: DeviceStatus[] = [
      {
        id: 'blinds-1',
        name: 'Persianas',
        type: 'blinds',
        status: 'auto',
        icon: '🪟',
        level: 60,
        lastUpdate: new Date()
      },
      {
        id: 'fan-1',
        name: 'Ventilador',
        type: 'fan',
        status: 'on',
        icon: '🌀',
        level: 70,
        lastUpdate: new Date()
      }
    ];
    this.devicesSubject.next(devices);
  }

  private startDataSimulation(): void {
    // Simular actualización de datos cada 3 segundos
    interval(3000).subscribe(() => {
      this.updateSensorData();
    });
  }

  private updateSensorData(): void {
    const sensors = this.sensorsSubject.value.map(sensor => {
      let newValue = sensor.value + (Math.random() - 0.5) * 10;
      
      // Mantener valores dentro del rango
      newValue = Math.max(sensor.min, Math.min(sensor.max, newValue));
      
      // Determinar estado basado en el valor
      let status: 'normal' | 'warning' | 'danger' = 'normal';
      
      if (sensor.id === 'ldr-1') {
        if (newValue < 200) status = 'danger';
        else if (newValue < 400) status = 'warning';
      } else if (sensor.id === 'humidity-1') {
        if (newValue > 70 || newValue < 30) status = 'danger';
        else if (newValue > 60 || newValue < 40) status = 'warning';
      } else if (sensor.id === 'temp-1') {
        if (newValue > 28 || newValue < 18) status = 'danger';
        else if (newValue > 25 || newValue < 20) status = 'warning';
      }

      return {
        ...sensor,
        value: Math.round(newValue * 10) / 10,
        timestamp: new Date(),
        status
      };
    });
    
    this.sensorsSubject.next(sensors);
  }

  toggleDevice(deviceId: string): void {
    const devices = this.devicesSubject.value.map(device => {
      if (device.id === deviceId) {
        const statuses: Array<'on' | 'off' | 'auto'> = ['on', 'off', 'auto'];
        const currentIndex = statuses.indexOf(device.status);
        const newStatus = statuses[(currentIndex + 1) % statuses.length];
        
        return {
          ...device,
          status: newStatus,
          lastUpdate: new Date()
        };
      }
      return device;
    });
    
    this.devicesSubject.next(devices);
  }

  setDeviceLevel(deviceId: string, level: number): void {
    const devices = this.devicesSubject.value.map(device => {
      if (device.id === deviceId) {
        return {
          ...device,
          level,
          lastUpdate: new Date()
        };
      }
      return device;
    });
    
    this.devicesSubject.next(devices);
  }
}
