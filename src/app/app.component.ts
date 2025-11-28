import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from './services/data.service';
import { SensorData, DeviceStatus } from './models/sensor.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  sensors: SensorData[] = [];
  devices: DeviceStatus[] = [];
  currentTime: Date = new Date();

  constructor(private dataService: DataService) {
    this.dataService.sensors$.subscribe(sensors => {
      this.sensors = sensors;
    });

    this.dataService.devices$.subscribe(devices => {
      this.devices = devices;
    });

    // Actualizar hora cada segundo
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  toggleDevice(deviceId: string): void {
    this.dataService.toggleDevice(deviceId);
  }

  onLevelChange(deviceId: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.dataService.setDeviceLevel(deviceId, Number(target.value));
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'normal': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'danger': return '#ef4444';
      case 'on': return '#10b981';
      case 'off': return '#64748b';
      case 'auto': return '#6366f1';
      default: return '#94a3b8';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'normal': return 'Normal';
      case 'warning': return 'Alerta';
      case 'danger': return 'Crítico';
      case 'on': return 'Encendido';
      case 'off': return 'Apagado';
      case 'auto': return 'Automático';
      default: return status;
    }
  }

  getPercentage(sensor: SensorData): number {
    return ((sensor.value - sensor.min) / (sensor.max - sensor.min)) * 100;
  }
}
