# 🧠 CRM UrbanMetrics AI

Sistema CRM conversacional impulsado por IA para la gestión automatizada de expedientes de tasación inmobiliaria.

Permite crear, consultar y actualizar expedientes mediante lenguaje natural a través de un agente conectado a n8n.

---

## 🚀 Features

- 🤖 Agente conversacional (AI Agent)
- 📊 CRM con expedientes en tiempo real
- 🔄 Automatización con n8n
- 🧠 Memoria de conversación (Postgres)
- 🗂️ Integración con base de datos (Airtable / Postgres)
- 💬 Chat web tipo ChatGPT
- ⚡ API REST lista para producción

---

## 🧱 Arquitectura

```
Frontend (Chat UI)
        ↓  
Webhook (n8n)
        ↓  
AI Agent (LLM)
        ↓  
Tools (CRUD Expedientes)
        ↓  
Base de datos (Airtable / Postgres)
```

---

## 📦 Requisitos previos

Antes de ejecutar el proyecto necesitas tener instalado:

- Node.js >= 18 → https://nodejs.org/
- npm o yarn
- n8n (local o en la nube) → https://n8n.io/
- Cuenta OpenAI (API Key) → https://platform.openai.com/
- Base de datos:
  - Airtable (recomendado para empezar)
  - o PostgreSQL (para producción)
- (Opcional) Railway, Vercel o Docker para despliegue

---

## ⚙️ Instalación y ejecución

### 1. Clonar repositorio

```bash
git clone https://github.com/vglena/crm-urbanmetrics-ai.git
cd crm-urbanmetrics-ai
```

---

### 2. Instalar dependencias

```bash
npm install
```

---

### 3. Configurar variables de entorno

Crear archivo `.env` en la raíz:

```env
OPENAI_API_KEY=tu_api_key
N8N_WEBHOOK_URL=https://tu-n8n/webhook/chat-agent
```

---

### 4. Ejecutar el frontend

```bash
npm run dev
```

La app estará disponible en:

```
http://localhost:5173
```

---

## 🔌 Configuración n8n (OBLIGATORIO)

### 1. Crear Webhook

- Método: `POST`
- Path: `chat-agent`
- Modo: Production
- Response: `Using Respond to Webhook Node`

---

### 2. AI Agent

Configurar:

- Input del usuario:

```js
{{ $json.body.message }}
```

---

### 3. Memoria (Postgres Chat Memory)

- Session ID:

```js
{{ $json.body.sessionId }}
```

---

### 4. Tools del agente

Debes tener conectadas estas herramientas:

- `crear_expediente`
- `buscar_expediente`
- `actualizar_expediente`

Estas herramientas deben apuntar a tu base de datos (Airtable o DB).

---

### 5. Respond to Webhook

```json
{{ { "message": $json.output } }}
```

---

### 6. Activar workflow

⚠️ IMPORTANTE:

Debes activar el workflow en n8n:

```
Toggle → Active
```

---

## 📡 API

### Endpoint

```
POST https://tu-n8n/webhook/chat-agent
```

---

### Request

```json
{
  "message": "crear expediente",
  "sessionId": "user-1"
}
```

---

### Response

```json
{
  "message": "Expediente creado..."
}
```

---

## 💬 Ejemplo de uso

### 1. Crear expediente

```
crear expediente
```

---

### 2. Introducir datos

```
Nombre: Carlos  
Apellido: Lopez  
Telefono: 600111222  
Email: carlos@email.com  
Direccion: Calle Sol 5  
Municipio: Madrid  
Codigo_postal: 28001  
Inmueble: Piso  
Superficie: 90  
Habitaciones: 3  
Finalidad: Hipoteca
```

---

### 3. Resultado

```
Expediente creado: EXP-0111
```

---

## 🧪 Testing

### Con Postman

```json
{
  "message": "crear expediente",
  "sessionId": "test-1"
}
```

---

### Con curl

```bash
curl -X POST https://tu-api/webhook/chat-agent \
-H "Content-Type: application/json" \
-d '{"message":"crear expediente","sessionId":"test-1"}'
```

---

## 🚀 Deploy

Recomendado:

- Backend (n8n) → Railway o Docker
- Frontend → Vercel o Netlify

---

## 🔐 Seguridad

- Usa HTTPS en producción
- No expongas API Keys
- Añade autenticación si haces público el endpoint

---

## 📈 Roadmap

- [ ] Multiusuario
- [ ] Autenticación
- [ ] Dashboard de métricas
- [ ] Integración con WhatsApp
- [ ] Roles y permisos
- [ ] Logs y auditoría

---

## 🤝 Contribuciones

Pull requests y mejoras son bienvenidas.

---

## 📄 Licencia

MIT
