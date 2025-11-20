# Sistema de Preferencias de Email - Implementación Nivel 1

## 📋 Resumen

Implementación completa del **Nivel 1** del sistema avanzado de notificaciones por email, que incluye:

1. ✅ **Preferencias de Usuario** - Control granular sobre qué notificaciones recibir
2. ✅ **Historial y Auditoría** - Tracking completo de emails enviados
3. ✅ **API REST** - Endpoints para gestionar preferencias y consultar logs
4. ✅ **Integración con Eventos** - Sistema de filtrado automático basado en preferencias

---

## 🏗️ Arquitectura

### Nuevos Modelos

#### **EmailPreference** (`src/models/emailPreference.js`)
Almacena las preferencias de notificación por email de cada usuario.

**Campos principales:**
- `user` - Referencia al usuario (ObjectId)
- `notifications` - Objeto con tipos de notificación:
  - `ticketCreated` - Nuevos tickets creados
  - `ticketAssigned` - Tickets asignados al usuario
  - `ticketCommentAdded` - Comentarios en tickets que sigue
  - `ticketUpdated` - Actualizaciones en tickets que sigue
  - `ticketMentioned` - Menciones del usuario
  - `groupTicketCreated` - Nuevos tickets en grupos del usuario
- `frequency` - Frecuencia de envío: `'immediate'` o `'disabled'`
- `priorityOverride` - Sobrescribir preferencias por prioridad:
  - `urgentImmediate` - Siempre enviar si es urgente
  - `criticalImmediate` - Siempre enviar si es crítico

**Métodos:**
- `getOrCreateForUser(userId)` - Obtener o crear preferencias por defecto
- `shouldReceiveEmail(notificationType, options)` - Verificar si enviar email
- `filterUsersForNotification(userIds, notificationType, options)` - Filtrar usuarios en lote

---

#### **EmailLog** (`src/models/emailLog.js`)
Registra todos los emails enviados por el sistema.

**Campos principales:**
- `to` - Destinatario
- `subject` - Asunto del email
- `template` - Nombre de la plantilla utilizada
- `status` - Estado: `'sent'`, `'failed'`, `'queued'`
- `error` - Mensaje de error (si falló)
- `metadata` - Metadatos adicionales:
  - `ticketId` - ID del ticket relacionado
  - `userId` - ID del usuario relacionado
  - `groupId` - ID del grupo relacionado
  - `commentId` - ID del comentario relacionado
  - `priority` - Prioridad del ticket
- `sentAt` - Timestamp de envío
- `createdAt` - Timestamp de creación

**Métodos estáticos:**
- `logSuccess(data)` - Registrar envío exitoso
- `logFailure(data, error)` - Registrar envío fallido
- `getStats(startDate, endDate)` - Obtener estadísticas
- `getByTicket(ticketId)` - Logs de un ticket específico
- `getByUser(userId)` - Logs de un usuario específico

---

### Nuevos Servicios

#### **EmailPreferenceService** (`src/services/emailPreferenceService.js`)
Servicio para gestionar preferencias de email.

**Métodos principales:**
```javascript
// Obtener preferencias (crea defaults si no existen)
await EmailPreferenceService.getPreferences(userId)

// Actualizar preferencias
await EmailPreferenceService.updatePreferences(userId, updates)

// Filtrar usuarios por preferencias
await EmailPreferenceService.filterUsersByPreferences(userIds, notificationType, options)

// Verificar si usuario debe recibir email
await EmailPreferenceService.shouldUserReceiveEmail(userId, notificationType, options)

// Resetear a defaults
await EmailPreferenceService.resetToDefault(userId)
```

---

#### **EmailTrackingService** (`src/services/emailTrackingService.js`)
Servicio para tracking y análisis de emails.

**Métodos principales:**
```javascript
// Registrar envío exitoso
await EmailTrackingService.logSuccess(emailData)

// Registrar envío fallido
await EmailTrackingService.logFailure(emailData, error)

// Obtener estadísticas
await EmailTrackingService.getStats(startDate, endDate)

// Logs paginados
await EmailTrackingService.getRecentLogs(page, limit, filters)

// Tasa de entrega
await EmailTrackingService.getDeliveryRate(days)

// Uso de plantillas
await EmailTrackingService.getTemplateUsage(startDate, endDate)

// Logs por ticket
await EmailTrackingService.getLogsForTicket(ticketId)

// Logs por usuario
await EmailTrackingService.getLogsForUser(userId, limit)
```

---

## 🔌 API Endpoints

Base URL: `/api/v2/email-preferences`

### **Preferencias de Usuario**

#### `GET /api/v2/email-preferences`
Obtener preferencias del usuario actual.

**Autenticación:** Requerida

**Response:**
```json
{
  "success": true,
  "preferences": {
    "user": "user_id",
    "notifications": {
      "ticketCreated": true,
      "ticketAssigned": true,
      "ticketCommentAdded": true,
      "ticketUpdated": true,
      "ticketMentioned": true,
      "groupTicketCreated": true
    },
    "frequency": "immediate",
    "priorityOverride": {
      "urgentImmediate": true,
      "criticalImmediate": true
    }
  }
}
```

---

#### `PUT /api/v2/email-preferences`
Actualizar preferencias del usuario actual.

**Autenticación:** Requerida + CSRF Token

**Body:**
```json
{
  "notifications": {
    "ticketCreated": false,
    "ticketCommentAdded": true
  },
  "frequency": "immediate",
  "priorityOverride": {
    "urgentImmediate": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "preferences": { /* updated preferences */ }
}
```

---

#### `POST /api/v2/email-preferences/reset`
Resetear preferencias a valores por defecto.

**Autenticación:** Requerida + CSRF Token

**Response:**
```json
{
  "success": true,
  "preferences": { /* default preferences */ }
}
```

---

### **Email Logs**

#### `GET /api/v2/email-preferences/logs`
Obtener logs de emails del usuario actual.

**Autenticación:** Requerida

**Query Parameters:**
- `limit` (opcional, default: 50) - Número de logs a retornar

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "to": "user@example.com",
      "subject": "Ticket #123 Created",
      "template": "new-ticket",
      "status": "sent",
      "sentAt": "2024-11-20T10:30:00Z",
      "metadata": {
        "ticketId": "ticket_id",
        "priority": "High"
      }
    }
  ]
}
```

---

#### `GET /api/v2/email-preferences/logs/all` 🔒 Admin
Obtener todos los logs de emails (paginado).

**Autenticación:** Requerida + Admin

**Query Parameters:**
- `page` (opcional, default: 1)
- `limit` (opcional, default: 50)
- `status` (opcional) - Filtrar por estado: sent, failed, queued
- `template` (opcional) - Filtrar por plantilla
- `to` (opcional) - Filtrar por destinatario
- `startDate` (opcional) - Fecha inicio (ISO 8601)
- `endDate` (opcional) - Fecha fin (ISO 8601)

**Response:**
```json
{
  "success": true,
  "logs": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 250,
    "pages": 5
  }
}
```

---

#### `GET /api/v2/email-preferences/logs/ticket/:ticketId`
Obtener logs de emails de un ticket específico.

**Autenticación:** Requerida

**Response:**
```json
{
  "success": true,
  "logs": [...]
}
```

---

### **Estadísticas** 🔒 Admin

#### `GET /api/v2/email-preferences/stats`
Obtener estadísticas de delivery.

**Autenticación:** Requerida + Admin

**Query Parameters:**
- `days` (opcional, default: 7) - Días hacia atrás

**Response:**
```json
{
  "success": true,
  "stats": {
    "period": {
      "startDate": "2024-11-13T00:00:00Z",
      "endDate": "2024-11-20T23:59:59Z",
      "days": 7
    },
    "total": 1000,
    "sent": 950,
    "failed": 50,
    "deliveryRate": 95.0,
    "failureRate": 5.0
  }
}
```

---

#### `GET /api/v2/email-preferences/stats/templates`
Obtener estadísticas de uso de plantillas.

**Autenticación:** Requerida + Admin

**Query Parameters:**
- `startDate` (opcional)
- `endDate` (opcional)

**Response:**
```json
{
  "success": true,
  "usage": [
    {
      "template": "new-ticket",
      "count": 500,
      "sent": 480,
      "failed": 20,
      "successRate": 96.0
    },
    {
      "template": "ticket-comment-added",
      "count": 300,
      "sent": 295,
      "failed": 5,
      "successRate": 98.3
    }
  ]
}
```

---

## 🔄 Integración con Eventos

### **Ticket Created** (`src/emitter/events/event_ticket_created.js`)

El sistema ahora filtra automáticamente los destinatarios basándose en sus preferencias:

```javascript
// Antes
emails = [user1@email.com, user2@email.com, user3@email.com]

// Después (con preferencias)
const notificationType = 'groupTicketCreated'
const options = { priority: ticket.priority }
const filteredUserIds = await EmailPreferenceService.filterUsersByPreferences(
  userIds,
  notificationType,
  options
)
// emails = [user1@email.com, user3@email.com] // user2 desactivó esta notificación
```

### **Ticket Comment Added** (`src/emitter/events.js`)

Similar al anterior, filtra suscriptores antes de enviar:

```javascript
const notificationType = 'ticketCommentAdded'
const filteredUserIds = await EmailPreferenceService.filterUsersByPreferences(
  userIds,
  notificationType,
  { priority: ticket.priority }
)
```

---

## 📝 Tracking Automático

El sistema ahora registra automáticamente todos los emails enviados en `src/mailer/index.js`:

```javascript
// Cada email incluye metadata para tracking
const mailOptions = {
  to: 'user@example.com',
  subject: 'Ticket #123 Created',
  html: htmlContent,
  template: 'new-ticket',          // ← Nuevo
  metadata: {                       // ← Nuevo
    ticketId: ticket._id,
    groupId: group._id,
    priority: 'High'
  }
}

// Automáticamente se registra en EmailLog
mailer.sendMail(mailOptions, callback)
```

---

## 🎛️ Configuración por Defecto

Cuando un usuario no tiene preferencias configuradas, el sistema crea automáticamente:

```javascript
{
  notifications: {
    ticketCreated: true,           // ✅ Habilitado
    ticketAssigned: true,          // ✅ Habilitado
    ticketCommentAdded: true,      // ✅ Habilitado
    ticketUpdated: true,           // ✅ Habilitado
    ticketMentioned: true,         // ✅ Habilitado
    groupTicketCreated: true       // ✅ Habilitado
  },
  frequency: 'immediate',          // Envío inmediato
  priorityOverride: {
    urgentImmediate: true,         // ✅ Siempre enviar urgentes
    criticalImmediate: true        // ✅ Siempre enviar críticos
  }
}
```

---

## 🔐 Seguridad

- Todos los endpoints requieren autenticación
- Endpoints de administración verifican rol de admin
- Endpoints de modificación requieren CSRF token
- Usuarios solo pueden ver/modificar sus propias preferencias
- Admins tienen acceso a estadísticas globales

---

## 🚀 Uso en Frontend

### Ejemplo: Obtener preferencias del usuario

```javascript
fetch('/api/v2/email-preferences', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => {
  console.log('Preferencias:', data.preferences)
})
```

### Ejemplo: Actualizar preferencias

```javascript
fetch('/api/v2/email-preferences', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify({
    notifications: {
      ticketCommentAdded: false,
      ticketUpdated: false
    },
    frequency: 'immediate'
  })
})
.then(res => res.json())
.then(data => {
  console.log('Actualizado:', data.preferences)
})
```

---

## 📊 Monitoreo

### Verificar tasa de entrega (Admin)

```javascript
fetch('/api/v2/email-preferences/stats?days=30', {
  headers: { 'Authorization': `Bearer ${adminToken}` }
})
.then(res => res.json())
.then(data => {
  console.log(`Delivery rate: ${data.stats.deliveryRate}%`)
  console.log(`Total emails: ${data.stats.total}`)
})
```

### Ver plantillas más usadas (Admin)

```javascript
fetch('/api/v2/email-preferences/stats/templates', {
  headers: { 'Authorization': `Bearer ${adminToken}` }
})
.then(res => res.json())
.then(data => {
  data.usage.forEach(template => {
    console.log(`${template.template}: ${template.count} emails (${template.successRate}% éxito)`)
  })
})
```

---

## 🧪 Testing

### Verificar que las preferencias funcionan:

1. **Crear usuario de prueba**
2. **Desactivar notificación de "ticketCommentAdded"**:
   ```bash
   curl -X PUT http://localhost:3000/api/v2/email-preferences \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer TOKEN" \
     -d '{"notifications": {"ticketCommentAdded": false}}'
   ```
3. **Agregar comentario a un ticket donde el usuario es suscriptor**
4. **Verificar que NO reciba email**
5. **Verificar que otros suscriptores SÍ reciban email**

### Verificar tracking:

```bash
# Ver logs del usuario
curl http://localhost:3000/api/v2/email-preferences/logs \
  -H "Authorization: Bearer TOKEN"

# Ver logs de un ticket (Admin)
curl http://localhost:3000/api/v2/email-preferences/logs/ticket/TICKET_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 📈 Próximos Pasos (Nivel 2 - No Implementado)

Las siguientes features fueron identificadas pero NO están en el alcance actual:

- ❌ Sistema de digest (agrupar notificaciones)
- ❌ Detección de usuario activo
- ❌ Rate limiting / throttling
- ❌ Cola de emails
- ❌ Plantillas enriquecidas con botones de acción

---

## 🐛 Troubleshooting

### Problema: Los emails no se filtran por preferencias

**Solución:** Verificar que:
1. El modelo EmailPreference está cargado correctamente
2. El servicio EmailPreferenceService está importado en los eventos
3. Los logs no muestran errores de preferencias

### Problema: No se registran los emails en EmailLog

**Solución:** Verificar que:
1. El mailer/index.js tiene la integración con EmailTrackingService
2. Los mailOptions incluyen `template` y `metadata`
3. La base de datos tiene la colección `emaillogs`

---

## 📝 Changelog

### v1.0.0 - 2024-11-20

**Agregado:**
- ✅ Modelo EmailPreference
- ✅ Modelo EmailLog
- ✅ Servicio EmailPreferenceService
- ✅ Servicio EmailTrackingService
- ✅ 8 endpoints REST para preferencias y logs
- ✅ Integración automática con eventos de tickets
- ✅ Tracking automático en mailer
- ✅ Filtrado por prioridad con overrides

**Modificado:**
- 🔧 event_ticket_created.js - Filtrado por preferencias
- 🔧 events.js - Filtrado de comentarios por preferencias
- 🔧 mailer/index.js - Tracking automático
- 🔧 routes.js - Nuevas rutas
- 🔧 api.js - Registro de controlador

---

## 👥 Mantenimiento

Para mantener el sistema funcionando correctamente:

1. **Cleanup periódico de logs antiguos:**
   ```javascript
   // Eliminar logs de más de 90 días
   await EmailTrackingService.cleanupOldLogs(90)
   ```

2. **Monitorear tasa de fallos:**
   ```javascript
   const stats = await EmailTrackingService.getDeliveryRate(7)
   if (stats.failureRate > 10) {
     // Alerta: tasa de fallos alta
   }
   ```

3. **Revisar plantillas con bajo éxito:**
   ```javascript
   const usage = await EmailTrackingService.getTemplateUsage()
   usage.forEach(template => {
     if (template.successRate < 90) {
       console.warn(`Template ${template.template} tiene baja tasa de éxito`)
     }
   })
   ```

---

**Fin de la documentación**
