import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { SensorData, DeviceStatus } from '../models/sensor.model';

interface SSEData {
  status?: string;
  temperatura: number;
  humedad: number;
  luz: number;
  ventilador: boolean;
  persianas: boolean;
  bulbs: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly sensorsSubject = new BehaviorSubject<SensorData[]>([]);
  private readonly devicesSubject = new BehaviorSubject<DeviceStatus[]>([]);
  private apiUrl: string = '';
  private eventSource: EventSource | null = null;
  private useRealData: boolean = false;

  public sensors$: Observable<SensorData[]> = this.sensorsSubject.asObservable();
  public devices$: Observable<DeviceStatus[]> = this.devicesSubject.asObservable();

  constructor() {
    // Cargar URL de API desde localStorage o usar valor por defecto
    const savedUrl = localStorage.getItem('apiUrl');
    this.apiUrl = savedUrl || 'http://172.20.10.2:8000';
    
    // Verificar si se debe usar datos reales
    const useReal = localStorage.getItem('useRealData');
    this.useRealData = useReal === 'true';
    
    this.initializeSensors();
    this.initializeDevices();
    
    if (this.useRealData) {
      this.connectToSSE();
    } else {
      this.startDataSimulation();
    }
  }

  setApiUrl(url: string): void {
    this.apiUrl = url;
    console.log('API URL actualizada a:', this.apiUrl);
    
    // Reconectar SSE si está usando datos reales
    if (this.useRealData) {
      this.disconnectSSE();
      this.connectToSSE();
    }
  }

  toggleDataSource(useReal: boolean): void {
    this.useRealData = useReal;
    localStorage.setItem('useRealData', useReal.toString());
    
    if (useReal) {
      this.connectToSSE();
    } else {
      this.disconnectSSE();
      this.startDataSimulation();
    }
  }

  private connectToSSE(): void {
    const sseUrl = `${this.apiUrl}/api/v1/sensors/stream`;
    console.log('Conectando a SSE:', sseUrl);
    
    try {
      this.eventSource = new EventSource(sseUrl);
      
      this.eventSource.onmessage = (event) => {
        try {
          const data: SSEData = JSON.parse(event.data);
          
          // Ignorar keepalive
          if (data.status === 'keepalive') return;
          
          console.log('Datos recibidos:', data);
          this.updateFromSSE(data);
        } catch (error) {
          console.error('Error parseando datos SSE:', error);
        }
      };
      
      this.eventSource.onerror = (error) => {
        console.error('Error en SSE:', error);
        // Reconectar después de 5 segundos
        setTimeout(() => {
          if (this.useRealData) {
            this.disconnectSSE();
            this.connectToSSE();
          }
        }, 5000);
      };
      
      this.eventSource.onopen = () => {
        console.log('✓ Conexión SSE establecida');
      };
    } catch (error) {
      console.error('Error creando EventSource:', error);
    }
  }

  private disconnectSSE(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('Conexión SSE cerrada');
    }
  }

  private updateFromSSE(data: SSEData): void {
    // Actualizar sensores
    const currentSensors = this.sensorsSubject.value;
    const sensors: SensorData[] = [
      {
        id: 'ldr-1',
        name: 'Iluminación',
        value: data.luz,
        unit: 'lux',
        timestamp: new Date(),
        status: this.getLightStatus(data.luz),
        icon: '💡',
        min: 0,
        max: 1000,
        history: this.updateHistory(currentSensors.find(s => s.id === 'ldr-1')?.history || [], data.luz)
      },
      {
        id: 'humidity-1',
        name: 'Humedad Relativa',
        value: data.humedad,
        unit: '%',
        timestamp: new Date(),
        status: this.getHumidityStatus(data.humedad),
        icon: '💧',
        min: 0,
        max: 100,
        history: this.updateHistory(currentSensors.find(s => s.id === 'humidity-1')?.history || [], data.humedad)
      },
      {
        id: 'temp-1',
        name: 'Temperatura',
        value: data.temperatura,
        unit: '°C',
        timestamp: new Date(),
        status: this.getTemperatureStatus(data.temperatura),
        icon: '🌡️',
        min: 15,
        max: 35,
        history: this.updateHistory(currentSensors.find(s => s.id === 'temp-1')?.history || [], data.temperatura)
      }
    ];
    this.sensorsSubject.next(sensors);
    
    // Actualizar dispositivos
    const devices: DeviceStatus[] = [
      {
        id: 'blinds-1',
        name: 'Persianas',
        type: 'blinds',
        status: data.persianas ? 'on' : 'off',
        icon: '🪟',
        level: data.persianas ? 100 : 0,
        lastUpdate: new Date()
      },
      {
        id: 'fan-1',
        name: 'Ventilador',
        type: 'fan',
        status: data.ventilador ? 'on' : 'off',
        icon: '🌀',
        level: data.ventilador ? 70 : 0,
        lastUpdate: new Date()
      },
      {
        id: 'bulbs-1',
        name: 'Luces',
        type: 'fan', // Reutilizamos el tipo
        status: data.bulbs ? 'on' : 'off',
        icon: '💡',
        level: data.bulbs ? 100 : 0,
        lastUpdate: new Date()
      }
    ];
    this.devicesSubject.next(devices);
  }

  private getLightStatus(luz: number): 'normal' | 'warning' | 'danger' {
    if (luz < 200) return 'danger';
    if (luz < 400) return 'warning';
    return 'normal';
  }

  private getHumidityStatus(humedad: number): 'normal' | 'warning' | 'danger' {
    if (humedad > 70 || humedad < 30) return 'danger';
    if (humedad > 60 || humedad < 40) return 'warning';
    return 'normal';
  }

  private getTemperatureStatus(temperatura: number): 'normal' | 'warning' | 'danger' {
    if (temperatura > 28 || temperatura < 18) return 'danger';
    if (temperatura > 25 || temperatura < 20) return 'warning';
    return 'normal';
  }

  private updateHistory(currentHistory: number[], newValue: number): number[] {
    const history = [...currentHistory, newValue];
    // Mantener solo las últimas 10 mediciones
    return history.slice(-10);
  }

  getApiUrl(): string {
    return this.apiUrl;
  }

  isUsingRealData(): boolean {
    return this.useRealData;
  }

  // Métodos para construir URLs de API
  getSensorsApiUrl(): string {
    return `${this.apiUrl}/api/v1/sensors/stream`;
  }

  getDevicesApiUrl(): string {
    return `${this.apiUrl}/api/v1/devices`;
  }

  getDeviceControlApiUrl(deviceId: string): string {
    return `${this.apiUrl}/api/v1/devices/${deviceId}/control`;
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
        max: 1000,
        history: [650]
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
        max: 100,
        history: [55]
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
        max: 35,
        history: [22]
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
    // Simular actualización de datos cada 3 segundos solo si no está usando datos reales
    if (this.useRealData) return;
    
    interval(3000).subscribe(() => {
      if (!this.useRealData) {
        this.updateSensorData();
      }
    });
  }

  private updateSensorData(): void {
    const sensors = this.sensorsSubject.value.map((sensor: SensorData) => {
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

      const roundedValue = Math.round(newValue * 10) / 10;

      return {
        ...sensor,
        value: roundedValue,
        timestamp: new Date(),
        status,
        history: this.updateHistory(sensor.history || [], roundedValue)
      };
    });
    
    this.sensorsSubject.next(sensors);
  }

  ngOnDestroy(): void {
    this.disconnectSSE();
  }
}
