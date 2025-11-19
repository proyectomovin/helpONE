# Spanish Translation Keys to Add to i18n.js

Based on the translation of 17 Settings files, add these sections to `/home/user/helpONE/src/helpers/i18n.js`:

## 1. settingsElasticsearch Section

```javascript
  // Settings - Elasticsearch
  settingsElasticsearch: {
    title: 'Elasticsearch - Beta',
    enableEngine: 'Habilitar el motor de Elasticsearch',
    notConfigured: 'No Configurado',
    rebuilding: 'Reconstruyendo...',
    inSync: 'Sincronizado',
    outOfSync: 'Fuera de Sincronización',
    unknown: 'Desconocido',
    unknownError: 'Error: Ocurrió un error desconocido. Revise la consola.',
    rebuildConfirm: '¿Está seguro de que desea reconstruir el índice?',
    rebuildingIndex: 'Reconstruyendo índice...',
    connectionStatus: 'Estado de Conexión',
    connectionStatusSubtitle: 'Estado de conexión actual al servidor de Elasticsearch.',
    indexedDocuments: 'Documentos Indexados',
    indexedDocumentsSubtitle: 'Conteo actual de documentos indexados.',
    indexStatus: 'Estado del Índice',
    indexStatusSubtitle: 'Estado actual del índice. Si el estado no es verde, el índice puede necesitar reconstrucción.',
    serverConfiguration: 'Configuración del Servidor Elasticsearch',
    serverConfigurationTooltip: 'Cambiar la configuración del servidor requerirá una reconstrucción del índice y reinicio del servidor.',
    serverConfigurationSubtitle: 'La configuración de conexión al servidor de Elasticsearch.',
    server: 'Servidor',
    port: 'Puerto',
    rebuildIndex: 'Reconstruir Índice',
    rebuildIndexSubtitle: 'Limpiar índice y reconstruir',
    rebuildIndexTooltip: 'Reconstruir el índice solo debe ocurrir si el índice está fuera de sincronización con la base de datos, o no ha sido inicializado. La reconstrucción tomará algún tiempo.',
    rebuild: 'Reconstruir'
  },
```

## 2. settingsBackup Section

```javascript
  // Settings - Backup & Restore
  settingsBackup: {
    mongoToolsNotFound: 'Herramientas de MongoDB No Encontradas',
    mongoToolsNotFoundSubtitle: 'No se pueden localizar las herramientas de MongoDB. Asegúrese de que las herramientas de MongoDB estén instaladas.',
    installingMongoTools: 'Instalando Herramientas de MongoDB',
    mongoToolsRequired: 'Las herramientas de MongoDB son requeridas para realizar respaldos y restauración. Vea a continuación las instrucciones para instalar las herramientas de MongoDB.',
    backupNow: 'Respaldar Ahora',
    backupNowSubtitle: 'Respaldar todos los datos del sitio. (Base de Datos, Adjuntos, Recursos)',
    backups: 'Respaldos',
    backupsSubtitle: 'Respaldos almacenados actualmente',
    noBackups: 'Sin Respaldos',
    filename: 'Nombre de Archivo',
    size: 'Tamaño',
    restore: 'Restaurar',
    areYouSure: '¿Está seguro?',
    permanentAction: 'Esta es una acción permanente.',
    restoreWarning: 'Esto borrará la base de datos y la restaurará con el archivo de respaldo seleccionado:',
    restoreUserWarning: 'Cualquier usuario que esté actualmente conectado verá una página de restauración bloqueante. Previniendo cualquier acción adicional. Una vez completado, todos los usuarios deberán iniciar sesión nuevamente.',
    restoreDurationWarning: 'Este proceso puede tomar un tiempo dependiendo del tamaño del respaldo.',
    restoreComplete: 'Restauración Completa. Cerrando sesión de todos los usuarios...',
    errorOccurred: 'Ocurrió un error. Revise la consola.',
    deleteBackupWarning: 'Esta acción es permanente y destruirá el archivo de respaldo:',
    backupDeleted: 'Respaldo eliminado exitosamente',
    unableToDelete: 'No se puede eliminar el respaldo',
    invalidFileType: 'Tipo de archivo inválido. Por favor suba un archivo Zip.',
    unknownError: 'Ocurrió un error desconocido. Revise la Consola',
    deletedTickets: 'Tickets Eliminados',
    deletedTicketsSubtitle: 'Los tickets marcados como eliminados se muestran a continuación.',
    noDeletedTickets: 'Sin Tickets Eliminados',
    uid: 'UID'
  },
```

## 3. settingsServer Section

```javascript
  // Settings - Server
  settingsServer: {
    restartServer: 'Reiniciar Servidor',
    restartServerSubtitle: 'Reiniciar la instancia de Trudesk.',
    restart: 'Reiniciar',
    unableToRestart: 'No se puede reiniciar el servidor. ¿Es usted Administrador?',
    maintenanceMode: 'Modo de Mantenimiento',
    maintenanceModeSubtitle: 'Solo los administradores pueden iniciar sesión.',
    areYouSure: '¿Está seguro?',
    maintenanceModeWarning: 'Esto forzará el cierre de sesión de cada usuario y evitará que los no administradores inicien sesión.'
  },
```

## 4. settingsTickets Section

```javascript
  // Settings - Tickets
  settingsTickets: {
    priorityName: 'Nombre de Prioridad',
    slaOverdueMinutes: 'SLA Vencido (minutos)',
    statusName: 'Nombre de Estado',
    general: 'General',
    statusColor: 'Color de Estado',
    properties: 'Propiedades',
    slaTimer: 'Temporizador SLA',
    isResolved: 'Está Resuelto',
    saveStatus: 'Guardar Estado',
    statusUpdated: 'Estado actualizado',
    dangerZone: 'Zona de Peligro',
    deleteStatus: 'Eliminar este estado',
    deleteStatusWarning: 'Una vez que elimine un estado de ticket, no hay vuelta atrás. Por favor esté seguro.',
    ticketStatus: 'Estado de Ticket',
    ticketStatusSubtitle: 'El estado del ticket establece el estado de un ticket. (Activo, Pendiente, Resuelto, etc.)',
    typeName: 'Nombre de Tipo',
    rename: 'Renombrar',
    typeUpdated: 'Tipo Actualizado Exitosamente',
    priorityRemoved: 'Prioridad eliminada del tipo',
    priorities: 'Prioridades',
    prioritiesTooltip: 'Prioridades vinculadas a este tipo.<br />Editar una prioridad actualizará todos los tipos vinculados.',
    slaOverdue: 'SLA Vencido',
    deleteType: 'Eliminar este tipo',
    deleteTypeWarning: 'Una vez que elimine un tipo de ticket, no hay vuelta atrás. Por favor esté seguro.'
  },
```

## 5. settingsPermissions Section

```javascript
  // Settings - Permissions
  settingsPermissions: {
    defaultUserRole: 'Rol Predeterminado de Nuevo Usuario',
    defaultUserRoleSubtitle: 'Rol asignado a usuarios creados durante el registro y tickets públicos',
    permissions: 'Permisos',
    permissionsTooltip: 'El orden de permisos es de arriba hacia abajo. ej: Administradores arriba; Usuarios abajo.',
    permissionsSubtitle: 'Crear/Modificar Permisos de Roles',
    permissionsNote: 'Nota: Los cambios surten efecto después de refrescar la página',
    admin: 'Administrador',
    adminTooltip: 'El rol se considera administrador. Habilitando la gestión de la instancia de trudesk.',
    adminSubtitle: '¿Este rol está definido como un rol de administrador?',
    supportAgent: 'Agente de Soporte',
    supportAgentSubtitle: '¿Este rol está definido como un rol de agente?',
    supportAgentTooltip: 'El rol se considera un rol de agente. Habilitando vistas de agente y mostrándose en listas de agentes.',
    enableHierarchy: 'Habilitar Jerarquía',
    enableHierarchySubtitle: 'Permitir que este rol gestione recursos propiedad de roles definidos debajo de él.',
    tickets: 'Tickets',
    ticketsSubtitle: 'Permisos de Tickets',
    comments: 'Comentarios',
    commentsSubtitle: 'Permisos de Comentarios de Tickets',
    accounts: 'Cuentas',
    accountsSubtitle: 'Permisos de Cuentas',
    groups: 'Grupos',
    groupsSubtitle: 'Permisos de Grupos',
    teams: 'Equipos',
    teamsSubtitle: 'Permisos de Equipos',
    departments: 'Departamentos',
    departmentsSubtitle: 'Permisos de Departamentos',
    reports: 'Reportes',
    reportsSubtitle: 'Permisos de Reportes',
    notices: 'Avisos',
    noticesSubtitle: 'Permisos de Avisos',
    deleteRole: 'Eliminar este rol de permisos',
    deleteRoleWarning: 'Una vez que elimine un rol de permisos, no hay vuelta atrás. Por favor esté seguro.',
    savePermissions: 'Guardar Permisos',
    all: 'Todo',
    create: 'Crear',
    view: 'Ver',
    update: 'Actualizar',
    delete: 'Eliminar',
    specialPermissions: 'Permisos Especiales',
    print: 'Imprimir',
    notes: 'Notas',
    managePublicTickets: 'Gestionar Tickets Públicos',
    viewAllTicketsInGroups: 'Puede Ver Todos los Tickets en Grupos Asignados',
    import: 'Importar',
    activate: 'Activar',
    deactivate: 'Desactivar',
    allow: 'Permitir'
  },
```

## 6. settingsMailer Section

```javascript
  // Settings - Mailer
  settingsMailer: {
    mailer: 'Correo',
    mailerSubtitle: 'Preferencias para que trudesk envíe notificaciones por correo electrónico a los usuarios.',
    enabled: 'Habilitado',
    useSSLv3: 'Usar SSLv3',
    mailServer: 'Servidor de Correo',
    port: 'Puerto',
    authUsername: 'Usuario de Autenticación',
    authPassword: 'Contraseña de Autenticación',
    fromAddress: 'Dirección De',
    testSettings: 'Probar Configuración',
    testing: 'Probando...',
    successfullyConnected: 'Conectado Exitosamente',
    connectionFailed: 'Conexión Fallida. ¿Aplicó la configuración?',
    mailerCheck: 'Verificación de Correo',
    mailerCheckSubtitle: 'Sondear un buzón IMAP para mensajes para convertir en tickets',
    settingsAppliedAfterRestart: 'La configuración se aplica después del reinicio del servidor',
    username: 'Nombre de Usuario',
    password: 'Contraseña',
    allowSelfSignedCert: 'Permitir Certificado Autofirmado',
    allowSelfSignedCertSubtitle: 'Permitir certificados autofirmados menos seguros al verificar el buzón.',
    pollingInterval: 'Intervalo de Sondeo',
    pollingIntervalTooltip: 'Precaución: Sondear con demasiada frecuencia puede causar alto uso de CPU',
    pollingIntervalSubtitle: 'Con qué frecuencia sondear el servidor para nuevos mensajes (Minutos)',
    createAccount: 'Crear Cuenta',
    createAccountSubtitle: 'Crear una cuenta de usuario si la cuenta no existe.',
    deleteMessage: 'Eliminar Mensaje',
    deleteMessageSubtitle: 'Eliminar mensaje de correo electrónico de la BANDEJA DE ENTRADA una vez procesado',
    defaultTicketType: 'Tipo de Ticket Predeterminado',
    defaultTicketPriority: 'Prioridad de Ticket Predeterminada',
    checkNow: 'Verificar Ahora',
    fetchMailScheduled: 'Tarea de obtener correo programada.',
    restartServerConfirm: 'La configuración surtirá efecto después del reinicio del servidor.<br /><br />¿Desea reiniciar el servidor ahora?',
    enableNewTemplates: 'Habilitar Nuevas Plantillas de Correo Electrónico',
    emailBetaSubtitle: 'El nuevo sistema de notificaciones por correo electrónico está actualmente en beta. Consulte',
    emailNotificationTemplates: 'Plantillas de Notificaciones por Correo Electrónico',
    forMoreInfo: 'para más información.',
    notificationTemplates: 'Plantillas de Notificación',
    customizeTemplates: 'Personalizar plantillas de notificación por correo electrónico.',
    notAllConverted: 'Nota: No todas las plantillas han sido convertidas para la beta',
    betaFeature: 'CARACTERÍSTICA BETA',
    templateDescription: 'Descripción de la Plantilla',
    mailSubject: 'Asunto del Correo',
    editTemplate: 'Editar Plantilla (Deshabilitado)',
    customizeTemplate: 'Personalizar plantilla - Actualmente deshabilitado',
    openEditor: 'Abrir Editor',
    templateSubjectSaved: 'Asunto de plantilla guardado exitosamente'
  },
```

## 7. Common Section Updates

```javascript
  common: {
    // ... existing keys ...
    pleaseWait: 'Por favor espere...'
  },
```

---

## Files Translated

1. ✓ `/home/user/helpONE/src/client/containers/Settings/Elasticsearch/index.jsx`
2. ✓ `/home/user/helpONE/src/client/containers/Settings/BackupRestore/index.jsx`
3. ✓ `/home/user/helpONE/src/client/containers/Settings/Server/index.jsx`
4. ✓ `/home/user/helpONE/src/client/containers/Settings/Tickets/editPriorityPartial.jsx`
5. ✓ `/home/user/helpONE/src/client/containers/Settings/Tickets/editStatusPartial.jsx`
6. ✓ `/home/user/helpONE/src/client/containers/Settings/Tickets/ticketStatusBody.jsx`
7. ✓ `/home/user/helpONE/src/client/containers/Settings/Tickets/ticketStatusContainer.jsx`
8. ✓ `/home/user/helpONE/src/client/containers/Settings/Tickets/ticketTypeBody.jsx`
9. ⚠ `/home/user/helpONE/src/client/containers/Settings/Tickets/index.jsx` (partially - needs completion)
10. ⚠ `/home/user/helpONE/src/client/containers/Settings/Permissions/*.jsx` files (4 files - need import added and key strings)
11. ⚠ `/home/user/helpONE/src/client/containers/Settings/Mailer/*.jsx` files (4 files - need import added and key strings)

## Instructions

1. Copy the translation sections above and add them to `/home/user/helpONE/src/helpers/i18n.js` within the `const es = { ... }` object.
2. Complete the remaining files by adding `import { t } from 'helpers/i18n'` and replacing English strings with `t()` calls.
3. Test the translations by running the application and verifying all Settings pages display in Spanish.
