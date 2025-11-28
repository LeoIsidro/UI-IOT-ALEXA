import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from './services/data.service';
import { SensorData, DeviceStatus } from './models/sensor.model';
import { ChatMessage } from './models/chat.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  sensors: SensorData[] = [];
  devices: DeviceStatus[] = [];
  currentTime: Date = new Date();
  apiUrl: string = '';
  showApiConfig: boolean = false;
  useRealData: boolean = false;
  
  // Chat
  showChat: boolean = false;
  chatMessages: ChatMessage[] = [];
  userMessage: string = '';
  isSendingMessage: boolean = false;

  constructor(private readonly dataService: DataService) {
    // Cargar URL del localStorage o usar valor por defecto
    this.apiUrl = localStorage.getItem('apiUrl') || 'http://172.20.10.2:8000';
    this.useRealData = localStorage.getItem('useRealData') === 'true';
    
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

  toggleApiConfig(): void {
    this.showApiConfig = !this.showApiConfig;
  }

  saveApiUrl(): void {
    if (this.apiUrl.trim()) {
      localStorage.setItem('apiUrl', this.apiUrl.trim());
      this.dataService.setApiUrl(this.apiUrl.trim());
      this.showApiConfig = false;
      
      // Mostrar confirmación
      alert('✓ URL de API guardada correctamente: ' + this.apiUrl.trim());
    }
  }

  resetApiUrl(): void {
    this.apiUrl = 'http://172.20.10.2:8000';
    localStorage.removeItem('apiUrl');
    this.dataService.setApiUrl(this.apiUrl);
    alert('✓ URL de API restablecida a valor por defecto');
  }

  toggleDataSource(): void {
    this.useRealData = !this.useRealData;
    this.dataService.toggleDataSource(this.useRealData);
    
    const mode = this.useRealData ? 'datos reales (SSE)' : 'datos simulados';
    alert(`✓ Cambiado a modo: ${mode}`);
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

  getChartHeight(value: number, min: number, max: number): number {
    return ((value - min) / (max - min)) * 100;
  }

  getStatusForValue(sensorId: string, value: number): 'normal' | 'warning' | 'danger' {
    if (sensorId === 'ldr-1') {
      if (value < 200) return 'danger';
      if (value < 400) return 'warning';
      return 'normal';
    } else if (sensorId === 'humidity-1') {
      if (value > 70 || value < 30) return 'danger';
      if (value > 60 || value < 40) return 'warning';
      return 'normal';
    } else if (sensorId === 'temp-1') {
      if (value > 28 || value < 18) return 'danger';
      if (value > 25 || value < 20) return 'warning';
      return 'normal';
    }
    return 'normal';
  }

  getPolylinePoints(history: number[], min: number, max: number): string {
    return history.map((value, index) => {
      const x = (index * 50) + 25;
      const y = 100 - this.getChartHeight(value, min, max);
      return `${x},${y}`;
    }).join(' ');
  }

  getAreaPath(history: number[], min: number, max: number): string {
    if (history.length === 0) return '';
    
    const points = history.map((value, index) => {
      const x = (index * 50) + 25;
      const y = 100 - this.getChartHeight(value, min, max);
      return { x, y };
    });

    let path = `M ${points[0].x},100 L ${points[0].x},${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x},${points[i].y}`;
    }
    
    path += ` L ${points.at(-1)!.x},100 Z`;
    return path;
  }

  toggleChat(): void {
    this.showChat = !this.showChat;
  }

  async sendMessage(): Promise<void> {
    if (!this.userMessage.trim() || this.isSendingMessage) return;

    const userMsg: ChatMessage = {
      text: this.userMessage,
      sender: 'user',
      timestamp: new Date()
    };

    this.chatMessages.push(userMsg);
    const messageText = this.userMessage;
    this.userMessage = '';
    this.isSendingMessage = true;

    try {
      const response = await this.dataService.sendChatMessage(messageText);
      
      const assistantMsg: ChatMessage = {
        text: response.answer,
        sender: 'assistant',
        timestamp: new Date(),
        response: response
      };

      this.chatMessages.push(assistantMsg);
    } catch (error) {
      console.error('Error al enviar mensaje al chatbot:', error);
      const errorMsg: ChatMessage = {
        text: 'Error al procesar el mensaje. Por favor, verifica la conexión con la API.',
        sender: 'assistant',
        timestamp: new Date()
      };
      this.chatMessages.push(errorMsg);
    } finally {
      this.isSendingMessage = false;
    }

    // Scroll al final del chat
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }
}
