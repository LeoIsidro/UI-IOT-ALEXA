# Integración con API - Server-Sent Events

## 📡 Descripción General

El dashboard consume datos en tiempo real mediante **Server-Sent Events (SSE)**, una tecnología que permite al servidor enviar actualizaciones automáticas al cliente sin necesidad de polling.

## 🔌 Configuración de Conexión

### Endpoint SSE
```
GET http://{apiUrl}/api/v1/sensors/stream
```

### Headers
```
Accept: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

## 📦 Formato de Datos

### Estructura del Evento SSE

Cada evento debe enviarse en el siguiente formato:

```
data: {"temperatura": 22.5, "humedad": 55, "luz": 650, "ventilador": true, "persianas": false, "bulbs": true}

```

### Campos Obligatorios

```typescript
interface SSEData {
  status?: string;        // "keepalive" para mantener conexión
  temperatura: number;    // Temperatura en °C (ej: 22.5)
  humedad: number;        // Humedad relativa en % (0-100)
  luz: number;           // Luz ambiente en lux (0-1000)
  ventilador: boolean;   // Estado del ventilador (true=ON, false=OFF)
  persianas: boolean;    // Estado de persianas (true=ABIERTAS, false=CERRADAS)
  bulbs: boolean;        // Estado de luces (true=ON, false=OFF)
}
```

### Ejemplo de Evento Completo

```
event: message
data: {"temperatura": 23.2, "humedad": 58, "luz": 720, "ventilador": true, "persianas": true, "bulbs": false}

```

### Keepalive

Para mantener la conexión activa, envía periódicamente:

```
data: {"status": "keepalive"}

```

## 🎯 Mapeo de Datos

### Sensores

| Campo API | Sensor Dashboard | Unidad | Rango |
|-----------|-----------------|--------|-------|
| `temperatura` | Temperatura | °C | 15-35 |
| `humedad` | Humedad Relativa | % | 0-100 |
| `luz` | Iluminación (LDR) | lux | 0-1000 |

### Dispositivos

| Campo API | Dispositivo | Estado |
|-----------|------------|--------|
| `ventilador` | Ventilador | true=ON / false=OFF |
| `persianas` | Persianas | true=ABIERTAS / false=CERRADAS |
| `bulbs` | Luces | true=ON / false=OFF |

## 🎨 Estados de Alerta

El dashboard genera automáticamente alertas basadas en los valores:

### Temperatura
- ✅ **Normal**: 20-25°C
- ⚠️ **Alerta**: 18-20°C o 25-28°C
- 🚨 **Crítico**: <18°C o >28°C

### Humedad
- ✅ **Normal**: 40-60%
- ⚠️ **Alerta**: 30-40% o 60-70%
- 🚨 **Crítico**: <30% o >70%

### Luz
- ✅ **Normal**: >400 lux
- ⚠️ **Alerta**: 200-400 lux
- 🚨 **Crítico**: <200 lux

## 🔄 Reconexión Automática

El servicio implementa reconexión automática:
- Detecta errores de conexión
- Espera 5 segundos
- Reintenta la conexión automáticamente
- Continúa indefinidamente mientras `useRealData = true`

## 💻 Ejemplo de Implementación Backend

### Python (FastAPI)
```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def event_generator():
    while True:
        data = {
            "temperatura": 22.5,
            "humedad": 55,
            "luz": 650,
            "ventilador": True,
            "persianas": False,
            "bulbs": True
        }
        yield f"data: {json.dumps(data)}\n\n"
        await asyncio.sleep(1)

@app.get("/api/v1/sensors/stream")
async def stream():
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )
```

### Node.js (Express)
```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/api/v1/sensors/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const sendData = () => {
    const data = {
      temperatura: 22.5,
      humedad: 55,
      luz: 650,
      ventilador: true,
      persianas: false,
      bulbs: true
    };
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };
  
  const interval = setInterval(sendData, 1000);
  
  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

app.listen(8000, () => {
  console.log('Server running on port 8000');
});
```

## 🛠️ Configuración en el Dashboard

1. Abre el panel de configuración (botón ⚙️)
2. Ingresa la URL de tu servidor: `http://172.20.10.2:8000`
3. Activa el toggle "Datos Reales (SSE)"
4. Guarda la configuración

El dashboard se conectará automáticamente al endpoint SSE y comenzará a mostrar datos en tiempo real.

## 🔍 Debugging

Para verificar la conexión:

1. Abre las DevTools del navegador (F12)
2. Ve a la pestaña "Console"
3. Busca mensajes:
   - `✓ Conexión SSE establecida` - Conexión exitosa
   - `Datos recibidos:` - Datos siendo procesados
   - `Error en SSE:` - Problemas de conexión

## 📝 Notas Importantes

- ✅ CORS debe estar habilitado en el servidor
- ✅ El servidor debe enviar eventos periódicamente (cada 1-3 segundos recomendado)
- ✅ Los eventos keepalive previenen timeouts de conexión
- ✅ El dashboard maneja automáticamente la reconexión
- ❌ No uses HTTP polling, usa SSE nativo
- ❌ No cierres la conexión después de cada evento
