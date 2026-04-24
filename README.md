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

Antes de ejecutar el proyecto necesitas:

- Node.js >= 18
- n8n (self-hosted o cloud)
- Cuenta en OpenAI (API Key)
- Base de datos:
  - Airtable o Postgres
- (Opcional) Railway / Docker para backend

---

## ⚙️ Instalación

### 1. Clonar repositorio

```bash
git clone https://github.com/vglena/crm-urbanmetrics-ai.git
cd crm-urbanmetrics-ai
```

---

### 2. Configurar variables de entorno

Crea un archivo `.env`:

```env
OPENAI_API_KEY=your_openai_key
N8N_WEBHOOK_URL=https://tu-webhook/chat-agent
```

---

### 3. Instalar dependencias

```bash
npm install
```

---

### 4. Ejecutar frontend en local

```bash
npm run dev
```

---

## 🔌 Configuración n8n

### 1. Webhook

- Método: `POST`
- Path: `chat-agent`
- Response: `Using Respond to Webhook Node`

---

### 2. AI Agent

Configurar:

```js
{{ $json.body.message }}
```

---

### 3. Memoria (Postgres)

```js
{{ $json.body.sessionId }}
```

---

### 4. Tools

- `crear_expediente`
- `actualizar_expediente`
- `buscar_expediente`

---

### 5. Respond to Webhook

```json
{
  "message": "{{ $json.output }}"
}
```

---

## 📡 API

### Endpoint

```
POST /webhook/chat-agent
```

### Request

```json
{
  "message": "crear expediente",
  "sessionId": "user-1"
}
```

### Response

```json
{
  "message": "Expediente creado..."
}
```

---

## 💬 Ejemplo de uso

1. Crear expediente:

```
crear expediente
```

2. Introducir datos:

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

3. Resultado:

```
Expediente creado: EXP-0111
```

---

## 🧪 Testing

Puedes usar:

- Postman
- Curl
- Frontend incluido

```bash
curl -X POST https://tu-api/webhook/chat-agent \
-H "Content-Type: application/json" \
-d '{"message":"crear expediente","sessionId":"test-1"}'
```

---

## 🚀 Deploy

### 🔹 Frontend en Netlify (RECOMENDADO)

1. Subir repo a GitHub
2. Ir a https://www.netlify.com
3. Click en **"Add new site" → "Import from Git"**
4. Seleccionar el repositorio

Configurar:

- Build command:
```
npm run build
```

- Publish directory:
```
dist
```

---

### Variables de entorno en Netlify

Añadir en **Site settings → Environment variables**:

```
VITE_API_URL=https://n8n-production-989c.up.railway.app/webhook/chat-agent
```

---

### 🔹 Backend (n8n)

Opciones:

- Railway (recomendado)
- Docker
- n8n Cloud

---

## 🔐 Seguridad

- Usa HTTPS
- Protege API Keys
- Añade autenticación si el endpoint es público

---

## 📈 Roadmap

- [ ] Multiusuario
- [ ] Autenticación
- [ ] Dashboard analytics
- [ ] Integración con WhatsApp
- [ ] Roles y permisos

---

## 🤝 Contribuciones

Pull requests y mejoras son bienvenidas.

---

## 📄 Licencia

MIT
