# Dashboard IoT - Salón de Clases

Dashboard profesional en Angular para visualizar mediciones de sensores y controlar dispositivos inteligentes en un salón de clases mediante comandos de voz con Alexa.

## 🎯 Características

- **Monitoreo en Tiempo Real**: Visualización de datos de sensores (LDR, Humedad, Temperatura)
- **Control de Dispositivos**: Gestión de persianas y ventilador
- **Configuración Dinámica de API**: Panel integrado para configurar la URL base de tu API
- **Interfaz Moderna**: Diseño profesional con animaciones y efectos visuales
- **Responsive**: Adaptable a cualquier dispositivo
- **Sistema de Alertas**: Indicadores de estado según rangos de valores
- **Actualizaciones Automáticas**: Los datos se actualizan cada 3 segundos

## 🚀 Instalación

1. **Instalar dependencias**:
```bash
npm install
```

2. **Iniciar servidor de desarrollo**:
```bash
npm start
```

3. **Abrir en navegador**:
```
http://localhost:4200
```

## 📦 Tecnologías

- Angular 17 (Standalone Components)
- TypeScript
- RxJS
- CSS3 con variables y animaciones
- Google Fonts (Inter)

## 🎨 Características del Dashboard

### Sensores Monitoreados
- **LDR (Sensor de Luz)**: Mide la iluminación del salón (0-1000 lux)
- **Sensor de Humedad**: Mide la humedad relativa (0-100%)
- **Sensor de Temperatura**: Mide la temperatura ambiente (15-35°C)

### Dispositivos Controlables
- **Persianas**: Control de apertura (0-100%)
- **Ventilador**: Control de velocidad (0-100%)

Cada dispositivo tiene tres modos:
- ✅ **Encendido**: Funcionamiento manual
- ⭕ **Apagado**: Dispositivo desactivado
- 🔵 **Automático**: Control automático basado en sensores

## 🎤 Integración con Alexa

Este dashboard está diseñado para trabajar en conjunto con un sistema de control por voz mediante Alexa, permitiendo:
- Consultar valores de sensores
- Controlar dispositivos mediante comandos de voz
- Recibir alertas sobre condiciones del ambiente

## 📱 Diseño Responsive

El dashboard se adapta perfectamente a:
- 💻 Escritorio (1920px+)
- 💻 Laptop (1366px+)
- 📱 Tablet (768px+)
- 📱 Móvil (320px+)

## 🔧 Estructura del Proyecto

```
src/
├── app/
│   ├── models/
│   │   └── sensor.model.ts       # Interfaces y tipos
│   ├── services/
│   │   └── data.service.ts       # Servicio de datos
│   ├── app.component.ts          # Componente principal
│   ├── app.component.html        # Template principal
│   └── app.component.css         # Estilos del dashboard
├── index.html                     # HTML principal
├── main.ts                        # Punto de entrada
└── styles.css                     # Estilos globales
```

## 🎨 Paleta de Colores

- **Primario**: #6366f1 (Indigo)
- **Secundario**: #10b981 (Verde)
- **Peligro**: #ef4444 (Rojo)
- **Advertencia**: #f59e0b (Ámbar)
- **Fondo**: #0f172a - #1e293b (Degradado oscuro)

## 🔄 Actualización de Datos

### Configuración de API

El dashboard incluye un **panel de configuración de API** accesible desde el botón ⚙️ en la esquina superior derecha del header. Este panel te permite:

1. **Configurar la URL base de tu API**: Ingresa la URL de tu backend (ej: `http://172.20.10.2:8000`)
2. **Modo de datos**:
   - 🟢 **Datos Simulados**: Genera datos de prueba localmente (por defecto)
   - 🔴 **Datos Reales (SSE)**: Conecta al servidor mediante Server-Sent Events
3. **Visualizar endpoints generados**: El sistema automáticamente construye las URLs para:
   - `{apiUrl}/api/v1/sensors/stream` - Stream SSE de sensores en tiempo real
   - `{apiUrl}/api/v1/devices` - Estado de dispositivos
   - `{apiUrl}/api/v1/devices/:id/control` - Control de dispositivos
4. **Persistencia**: La configuración se guarda en el localStorage del navegador

### Integración con Server-Sent Events (SSE)

El dashboard está diseñado para consumir datos en tiempo real mediante SSE. La API debe enviar eventos con el siguiente formato JSON:

```json
{
  "temperatura": 22.5,
  "humedad": 55,
  "luz": 650,
  "ventilador": true,
  "persianas": false,
  "bulbs": true
}
```

**Mapeo de Sensores:**
- `temperatura` → Sensor de Temperatura (°C)
- `humedad` → Sensor de Humedad Relativa (%)
- `luz` → Sensor LDR de Luz Ambiente (lux)

**Mapeo de Dispositivos:**
- `ventilador` → Estado del Ventilador (true/false)
- `persianas` → Estado de Persianas (true=Abiertas/false=Cerradas)
- `bulbs` → Estado de Luces (true/false)

### Reconexión Automática

El servicio incluye reconexión automática en caso de pérdida de conexión SSE (cada 5 segundos).

## 📝 Licencia

Este proyecto está bajo la licencia MIT.

## 👨‍💻 Desarrollo

Proyecto desarrollado como parte del sistema IoT para control inteligente de aulas.