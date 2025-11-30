# Email Template Editor - Plan de Pruebas V1

## ✅ Verificaciones Previas (Completadas)

### 1. Compilación
- ✅ Webpack compilado exitosamente
- ✅ Monaco Editor incluido en bundle
- ✅ EmailTemplateEditor component en archivo 5.js
- ✅ Renderer configurado correctamente
- ✅ Componentes React integrados

### 2. Archivos Verificados
- ✅ `/src/client/containers/EmailTemplateEditor/index.jsx` - Componente principal
- ✅ `/src/client/containers/EmailTemplateEditor/EmailTemplateEditorContainer.jsx` - Container
- ✅ `/src/client/renderer.jsx` - Integración React
- ✅ `/src/views/editor.hbs` - Vista HTML
- ✅ `/src/controllers/editor.js` - Controlador backend
- ✅ `/src/controllers/api/v1/routes.js` - Rutas API (línea 260-264)
- ✅ `/src/routes/index.js` - Ruta principal (línea 354)

### 3. Templates Disponibles
```
- l2auth-cleared
- l2auth-reset
- new-password
- new-ticket          ← Template de prueba recomendado
- password-reset
- public-account-created
- ticket-comment-added
- ticket-updated
```

---

## 🧪 Plan de Pruebas Funcionales

### Pre-requisitos
1. MongoDB debe estar corriendo
2. Aplicación iniciada con `npm start` o `node app.js`
3. Usuario con permisos de Admin logueado

---

### Test 1: Navegación a Settings/Mailer
**Objetivo:** Verificar que el botón "Open Editor" está habilitado

**Pasos:**
1. Ir a `http://localhost:8080/settings` (o puerto configurado)
2. Click en "Mailer" en el menú lateral
3. Scroll down a "Notification Templates"
4. Verificar que se muestre la lista de templates

**Resultado Esperado:**
- ✅ Lista de templates visible
- ✅ Cada template tiene botón "Open Editor" en AZUL (md-btn-primary)
- ✅ Botón NO está deshabilitado

**Archivos relacionados:**
- `src/client/containers/Settings/Mailer/mailerSettingsTemplates.jsx:63-69`

---

### Test 2: Abrir Editor
**Objetivo:** Verificar que el editor carga correctamente

**Pasos:**
1. Desde Settings → Mailer → Notification Templates
2. Seleccionar template "New Ticket Notification"
3. Click en "Open Editor"

**Resultado Esperado:**
- ✅ Navegación a `/settings/editor/new-ticket`
- ✅ Editor carga sin errores
- ✅ Se muestra header "Edit Template: new-ticket"
- ✅ Monaco Editor visible con syntax highlighting
- ✅ Contenido del template cargado

**Posibles errores:**
- Si aparece "404: Invalid Template" → Verificar que template existe en DB
- Si editor no carga → Revisar console del navegador para errores JavaScript
- Si muestra "Loading template..." infinitamente → Problema con API

**Archivos relacionados:**
- `src/views/editor.hbs:1`
- `src/client/containers/EmailTemplateEditor/index.jsx:41-69`

---

### Test 3: Pestañas del Editor
**Objetivo:** Verificar que las pestañas funcionan correctamente

**Pasos:**
1. Con el editor abierto (Test 2)
2. Click en pestaña "Template Editor"
3. Click en pestaña "Available Variables"
4. Volver a "Template Editor"

**Resultado Esperado:**
- ✅ Pestaña "Template Editor" muestra Monaco Editor
- ✅ Pestaña "Available Variables" muestra:
  - Ticket Variables (7 items)
  - User Variables (4 items)
  - Comment Variables (2 items)
  - System Variables (2 items)
  - Ejemplos de Handlebars
- ✅ Cambio entre pestañas es inmediato

**Archivos relacionados:**
- `src/client/containers/EmailTemplateEditor/index.jsx:137-201`

---

### Test 4: Edición de Template
**Objetivo:** Verificar que se puede editar el contenido

**Pasos:**
1. Con el editor abierto en pestaña "Template Editor"
2. Modificar el contenido HTML (ej: cambiar "A ticket has been submitted" por "A NEW ticket has been submitted")
3. Verificar que syntax highlighting funciona
4. Agregar una variable Handlebars nueva (ej: `{{ticket.uid}}`)

**Resultado Esperado:**
- ✅ Editor permite escribir sin lag
- ✅ Syntax highlighting en tiempo real
- ✅ Variables Handlebars coloreadas correctamente
- ✅ Autocompletado de HTML tags funciona

**Archivos relacionados:**
- `src/client/containers/EmailTemplateEditor/index.jsx:71-73`

---

### Test 5: Vista Previa
**Objetivo:** Verificar que la vista previa funciona

**Pasos:**
1. Con cambios realizados en Test 4
2. Click en botón "Show Preview"
3. Verificar que aparece panel derecho
4. Hacer un cambio en el editor
5. Click en "Hide Preview"

**Resultado Esperado:**
- ✅ Panel de preview aparece a la derecha
- ✅ Editor se hace más estrecho (split view)
- ✅ Template renderizado en iframe
- ✅ Cambios NO se reflejan automáticamente (necesita volver a "Show Preview")
- ✅ "Hide Preview" oculta el panel

**Nota:** La vista previa actualmente es estática. Para v2 podríamos agregar refresh automático.

**Archivos relacionados:**
- `src/client/containers/EmailTemplateEditor/index.jsx:122-135`

---

### Test 6: Guardar Template
**Objetivo:** Verificar que se puede guardar el template

**Pasos:**
1. Con cambios realizados en Test 4
2. Click en botón "Save Template"
3. Esperar confirmación
4. Recargar la página (F5)

**Resultado Esperado:**
- ✅ Botón cambia a "Saving..." mientras guarda
- ✅ Snackbar verde aparece: "Template saved successfully"
- ✅ Botón vuelve a "Save Template"
- ✅ Al recargar, cambios persisten

**Si falla:**
- Revisar Network tab para ver respuesta de API
- Verificar que endpoint POST `/api/v1/editor/save` responde 200
- Revisar que template se guarda en MongoDB

**Archivos relacionados:**
- `src/client/containers/EmailTemplateEditor/index.jsx:75-97`
- `src/controllers/editor.js:167-180`

---

### Test 7: Cerrar Editor
**Objetivo:** Verificar navegación de vuelta

**Pasos:**
1. Click en botón "Close"

**Resultado Esperado:**
- ✅ Navegación de vuelta a `/settings/mailer`
- ✅ Sin pérdida de datos en settings

---

### Test 8: API Endpoints (Verificación técnica)
**Objetivo:** Verificar que las APIs funcionan correctamente

**Usando curl o Postman:**

#### GET Template
```bash
curl -X GET http://localhost:8080/api/v1/editor/load/new-ticket \
  -H "Cookie: your-session-cookie"
```

**Resultado Esperado:**
```json
{
  "html": "<!doctype html>...",
  "gjs-html": "...",
  "_id": "...",
  ...
}
```

#### POST Save Template
```bash
curl -X POST http://localhost:8080/api/v1/editor/save \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "template": "new-ticket",
    "html": "<html>...</html>",
    "gjs-html": "<html>...</html>"
  }'
```

**Resultado Esperado:**
```json
{
  "success": true,
  "template": {...}
}
```

---

## 🐛 Troubleshooting

### Error: "Failed to load template"
**Causa:** Template no existe en base de datos
**Solución:**
1. Verificar que MongoDB está corriendo
2. Verificar que template existe: `db.templates.find({name: "new-ticket"})`
3. Si no existe, ejecutar script de inicialización de templates

### Error: Editor muestra pantalla blanca
**Causa:** JavaScript error en componente React
**Solución:**
1. Abrir DevTools Console
2. Buscar error en red (React component error)
3. Verificar que Monaco Editor se cargó: buscar error de módulo

### Error: "Template saved successfully" pero cambios no persisten
**Causa:** Posible problema con MongoDB write
**Solución:**
1. Verificar permisos de MongoDB
2. Revisar logs del servidor
3. Verificar que `findOneAndUpdate` en `editor.js:170` funciona

### Error: Variables Handlebars no se muestran
**Causa:** Pestaña no renderiza correctamente
**Solución:**
1. Verificar que `activeTab === 'variables'`
2. Limpiar caché del navegador
3. Rebuild webpack: `npm run webpackdev`

---

## 📊 Checklist de Pruebas Completas

### Frontend
- [ ] Botón "Open Editor" habilitado
- [ ] Navegación a `/settings/editor/{template}` funciona
- [ ] Editor carga template correctamente
- [ ] Monaco Editor renderiza con syntax highlighting
- [ ] Pestañas "Template Editor" y "Available Variables" funcionan
- [ ] Panel de variables muestra todas las categorías
- [ ] Edición de contenido funciona sin lag
- [ ] Vista previa muestra template renderizado
- [ ] Botón "Save Template" guarda cambios
- [ ] Snackbar de confirmación aparece
- [ ] Botón "Close" vuelve a settings

### Backend
- [ ] GET `/api/v1/editor/load/:id` retorna template
- [ ] POST `/api/v1/editor/save` guarda template
- [ ] Template persiste en MongoDB
- [ ] Errores de API devuelven mensajes apropiados

### Seguridad
- [ ] Solo usuarios Admin pueden acceder al editor
- [ ] API verifica permisos (middleware `isAdmin`)
- [ ] No hay XSS en vista previa (iframe sandbox)

---

## 🎯 Métricas de Éxito

### Performance
- [ ] Editor carga en < 2 segundos
- [ ] Monaco Editor responde sin lag
- [ ] Save completa en < 1 segundo

### UX
- [ ] Interface intuitiva
- [ ] Variables fáciles de encontrar
- [ ] Preview útil para visualizar cambios

### Funcional
- [ ] 100% de templates editables
- [ ] 100% de variables documentadas
- [ ] 0 errores en Console

---

## 📝 Notas para V2

### Mejoras planeadas:
1. **Editor Visual GrapesJS**
   - Drag & drop de componentes
   - Bloques predefinidos para emails

2. **Vista Previa Mejorada**
   - Auto-refresh al editar
   - Vista de diferentes dispositivos (mobile/desktop)
   - Test con datos reales

3. **Características Avanzadas**
   - Historial de versiones
   - Comparación de cambios (diff)
   - Export/Import de templates
   - Test de envío de email
   - Traducción/idiomas

---

## ✅ Estado Actual

**Versión:** 1.0.0
**Fecha:** 2025-11-29
**Branch:** `claude/email-notifications-config-01Ao45aPQVYj9QPK1o6SJXXn`

**Funcionalidades Implementadas:**
- ✅ Editor HTML con Monaco Editor
- ✅ Vista previa de templates
- ✅ Panel de variables Handlebars
- ✅ Guardar/cargar templates
- ✅ Interface responsive
- ✅ Integración con API existente

**Próximo paso:** Ejecutar plan de pruebas completo una vez iniciado el servidor.
