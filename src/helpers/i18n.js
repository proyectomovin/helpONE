/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Author:     Trudesk, Inc.
 *  Updated:    Translated to Spanish
 *  Desc:       Spanish translations for Trudesk
 */

const es = {
  // Navigation & Sidebar
  nav: {
    dashboard: 'Panel de Control',
    tickets: 'Tickets',
    active: 'Activos',
    assigned: 'Asignados',
    unassigned: 'Sin Asignar',
    messages: 'Mensajes',
    accounts: 'Cuentas',
    customers: 'Clientes',
    agents: 'Agentes',
    admins: 'Administradores',
    customerGroups: 'Grupos de Clientes',
    teams: 'Equipos',
    departments: 'Departamentos',
    reports: 'Reportes',
    generate: 'Generar',
    groupBreakdown: 'Desglose por Grupo',
    userBreakdown: 'Desglose por Usuario',
    plugins: 'Plugins',
    notices: 'Avisos',
    settings: 'Configuración',
    general: 'General',
    appearance: 'Apariencia',
    permissions: 'Permisos',
    mailer: 'Correo',
    elasticsearch: 'Elasticsearch',
    backupRestore: 'Respaldo/Restauración',
    server: 'Servidor',
    legal: 'Legal',
    logs: 'Registros',
    about: 'Acerca de',
    collapseMenu: 'Contraer Menú',
    webhooks: 'Webhooks'
  },

  // Topbar/Header
  topbar: {
    createTicket: 'Crear Ticket',
    conversations: 'Conversaciones',
    notifications: 'Notificaciones',
    onlineUsers: 'Usuarios en Línea',
    profileSettings: 'Configuración de Perfil',
    keyboardShortcuts: 'Atajos de Teclado',
    logout: 'Cerrar Sesión',
    community: 'Comunidad',
    privacyPolicy: 'Política de Privacidad'
  },

  // Dashboard
  dashboard: {
    title: 'Panel de Control',
    lastUpdated: 'Última Actualización:',
    cacheLoading: 'Cache Aún Cargando...',
    last30Days: 'Últimos 30 Días',
    last60Days: 'Últimos 60 Días',
    last90Days: 'Últimos 90 Días',
    last180Days: 'Últimos 180 Días',
    last365Days: 'Últimos 365 Días',
    totalTickets: 'Total de Tickets (últimos',
    ticketsCompleted: 'Tickets Completados',
    avgResponseTime: 'Tiempo Promedio de Respuesta',
    hours: 'horas',
    ticketBreakdown: 'Desglose de Tickets',
    top5Groups: 'Top 5 Grupos',
    top10Tags: 'Top 10 Etiquetas',
    overdueTickets: 'Tickets Vencidos',
    ticket: 'Ticket',
    status: 'Estado',
    subject: 'Asunto',
    lastUpdatedCol: 'Última Actualización',
    open: 'Abierto',
    quickStats: 'Estadísticas Rápidas (Últimos 365 Días)',
    stat: 'Estadística',
    value: 'Valor',
    mostTicketsBy: 'Más tickets por...',
    mostCommentsBy: 'Más comentarios por...',
    mostAssignedUser: 'Usuario de soporte más asignado...',
    mostActiveTicket: 'Ticket más activo...'
  },

  // Common Actions/Buttons
  actions: {
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    create: 'Crear',
    edit: 'Editar',
    update: 'Actualizar',
    submit: 'Enviar',
    add: 'Agregar',
    remove: 'Quitar',
    close: 'Cerrar',
    confirm: 'Confirmar',
    yes: 'Sí',
    no: 'No',
    back: 'Atrás',
    next: 'Siguiente',
    previous: 'Anterior',
    continue: 'Continuar',
    finish: 'Finalizar',
    upload: 'Subir',
    download: 'Descargar',
    export: 'Exportar',
    import: 'Importar',
    search: 'Buscar',
    filter: 'Filtrar',
    clear: 'Limpiar',
    apply: 'Aplicar',
    reset: 'Restablecer',
    enable: 'Habilitar',
    disable: 'Deshabilitar',
    test: 'Probar'
  },

  // Create Ticket Modal
  createTicket: {
    title: 'Crear Ticket',
    subject: 'Asunto',
    owner: 'Propietario',
    group: 'Grupo',
    type: 'Tipo',
    tags: 'Etiquetas',
    priority: 'Prioridad',
    description: 'Descripción',
    descriptionPlaceholder: 'Por favor, intente ser lo más específico posible. Incluya cualquier detalle que crea relevante, como pasos de solución de problemas que haya tomado.',
    validationSubject: 'Por favor ingrese un Asunto válido. El Asunto debe contener al menos',
    validationDescription: 'Por favor ingrese una descripción válida. La descripción debe contener al menos',
    characters: 'caracteres'
  },

  // Account Modal
  accountModal: {
    editAccount: 'Editar Cuenta',
    createAccount: 'Crear Cuenta',
    createAccountSubtitle: 'Por favor proporcione los detalles de la cuenta a continuación',
    username: 'Nombre de Usuario',
    name: 'Nombre',
    title: 'Título',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    role: 'Rol',
    groups: 'Grupos',
    teams: 'Equipos',
    departments: 'Departamentos',
    usernameValidation: 'El nombre de usuario debe contener al menos 4 caracteres.',
    nameValidation: 'El nombre debe contener al menos 1 carácter.',
    roleValidation: 'Por favor seleccione un rol para este usuario',
    groupValidation: 'Por favor seleccione un grupo para este usuario.',
    saveAccount: 'Guardar Cuenta'
  },

  // Profile Page
  profile: {
    editProfile: 'Editar Perfil',
    saveProfile: 'Guardar Perfil',
    fullname: 'Nombre Completo',
    title: 'Título',
    email: 'Correo Electrónico',
    workNumber: 'Teléfono de Trabajo',
    mobileNumber: 'Teléfono Móvil',
    companyName: 'Nombre de la Empresa',
    facebookUrl: 'URL de Facebook',
    linkedinUrl: 'URL de LinkedIn',
    twitterUrl: 'URL de Twitter',
    timezone: 'Zona Horaria',
    currentPassword: 'Contraseña Actual',
    newPassword: 'Nueva Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    updatePassword: 'Actualizar Contraseña',
    passwordUpdated: 'Contraseña Actualizada Correctamente',
    invalidEmail: 'Correo Electrónico Inválido',
    fieldTooLong: 'Longitud del campo demasiado larga',
    profileSaved: 'Perfil guardado exitosamente',
    invalidFormData: 'Datos de formulario inválidos',
    passwordTooShort: 'La contraseña es demasiado corta',
    passwordTooLong: 'La contraseña es demasiado larga',
    profileTab: 'Perfil',
    security: 'Seguridad',
    preferences: 'Preferencias',
    workInformation: 'Información Laboral',
    otherInformation: 'Otra Información',
    changePassword: 'Cambiar Contraseña',
    passwordChangeWarning: 'Después de cambiar su contraseña, se cerrará la sesión en todos los dispositivos.',
    twoFactorAuth: 'Autenticación de Dos Factores',
    twoFactorNotEnabled: 'La autenticación de dos factores aún no está habilitada',
    twoFactorDescription: 'Habilitar la autenticación de dos factores agrega una capa adicional de seguridad a su cuenta. Una vez habilitada, se le pedirá que ingrese tanto su contraseña como un código de autenticación para iniciar sesión en su cuenta. Después de habilitar exitosamente la autenticación de dos factores, no podrá iniciar sesión a menos que ingrese el código de autenticación correcto.',
    scanQRCode: 'Escanee el código QR a continuación usando cualquier aplicación de autenticación como Authy, Google Authenticator, LastPass Authenticator, Microsoft Authenticator',
    cantScanQR: '¿No puede escanear el código QR?',
    manualKeyInstructions: 'Si no puede escanear el código QR, abra la aplicación de autenticación y seleccione la opción que le permite ingresar la clave a continuación manualmente.',
    verificationCodeInstructions: 'Después de escanear el código QR, ingrese el código de verificación de 6 dígitos a continuación para activar la autenticación de dos factores en su cuenta.',
    verificationCode: 'Código de Verificación',
    verifyAndContinue: 'Verificar y continuar',
    twoFactorIs: 'La autenticación de dos factores está',
    enabled: 'habilitada',
    disableTwoFactorWarning: 'Al deshabilitar la autenticación de dos factores, su cuenta estará protegida solo con su contraseña.',
    uiPreferences: 'Preferencias de Interfaz',
    savePreferences: 'Guardar Preferencias'
  },

  // Settings - General
  settingsGeneral: {
    title: 'Configuración General',
    siteTitle: 'Título del Sitio',
    siteTitleHelp: 'Título del sitio. Se usa como título de página. Por defecto: Trudesk',
    siteUrl: 'URL del Sitio',
    siteUrlHelp: 'URL públicamente accesible de este sitio.',
    serverTimezone: 'Zona Horaria del Servidor',
    serverTimezoneHelp: 'Establecer la zona horaria local del servidor para visualización de fechas',
    timezoneOverride: 'El usuario puede sobrescribir en su perfil. Requiere Reinicio del Servidor',
    timeDateFormat: 'Formato de Hora y Fecha',
    momentFormatOptions: 'Opciones de Formato Moment.js',
    timeFormat: 'Formato de Hora',
    timeFormatHelp: 'Establecer el formato para visualización de hora',
    shortDateFormat: 'Formato de Fecha Corta',
    shortDateFormatHelp: 'Establecer el formato para fechas cortas',
    longDateFormat: 'Formato de Fecha Larga',
    longDateFormatHelp: 'Establecer el formato para fechas largas'
  },

  // Settings - Webhooks
  settingsWebhooks: {
    title: 'Webhooks',
    description: 'Gestionar webhooks salientes que notifican a servicios externos sobre eventos.',
    addWebhook: 'Agregar Webhook',
    loading: 'Cargando webhooks…',
    noWebhooks: 'No se han configurado webhooks aún.',
    events: 'Eventos:',
    secretConfigured: 'Secreto configurado',
    editWebhook: 'Editar Webhook',
    createWebhook: 'Crear Webhook',
    name: 'Nombre',
    url: 'URL',
    secret: 'Secreto (opcional)',
    secretPlaceholder: 'Secreto compartido usado para firmar cargas de webhooks',
    method: 'Método',
    headers: 'Encabezados (opcional)',
    headerName: 'Nombre del encabezado',
    headerValue: 'Valor del encabezado',
    addHeader: 'Agregar Encabezado',
    eventsLabel: 'Eventos',
    active: 'Activo',
    saveChanges: 'Guardar Cambios',
    nameValidation: 'Por favor proporcione un nombre válido.',
    urlValidation: 'Por favor proporcione una URL válida.',
    eventRequired: 'Por favor seleccione al menos un evento.',
    nameRequired: 'El nombre del webhook es requerido.',
    urlRequired: 'La URL del webhook es requerida.',
    sendTestEvent: 'Enviar Evento de Prueba',
    testDescription: 'Activar una entrega de webhook de muestra para verificar su integración.',
    event: 'Evento',
    customPayload: 'Carga Personalizada (JSON)',
    customPayloadPlaceholder: 'Sobrescritura de carga JSON opcional',
    sendTest: 'Enviar Prueba',
    selectEventTest: 'Por favor seleccione un evento para probar.',
    payloadValidJson: 'La carga debe ser JSON válido.',
    deleteWebhook: 'Eliminar Webhook',
    deleteConfirm: '¿Está seguro de que desea eliminar',
    deleteWarning: 'Esta acción no se puede deshacer.',
    thisWebhook: 'este webhook'
  },

  // Settings - Accounts
  settingsAccounts: {
    title: 'Configuración de Cuentas',
    allowUserRegistration: 'Permitir Registro de Usuarios',
    allowUserRegistrationHelp: 'Permitir a los usuarios crear cuentas en la pantalla de inicio de sesión.',
    passwordComplexity: 'Complejidad de Contraseña',
    passwordComplexityHelp: 'Requerir que las contraseñas de los usuarios cumplan con la complejidad mínima',
    passwordComplexityTooltip: 'Mínimo 8 caracteres con mayúsculas y numéricos.',
    enable: 'Habilitar',
    restartServerError: 'No se puede reiniciar el servidor. ¿Es usted Administrador?'
  },

  // Settings - Appearance
  settingsAppearance: {
    title: 'Configuración de Apariencia',
    siteLogo: 'Logo del Sitio',
    siteLogoHelp: 'Subir logo del sitio para mostrar en la navegación superior.',
    siteLogoNote: 'Nota: Redimensionar a un ancho máximo de 140px',
    pageLogo: 'Logo de Página',
    pageLogoHelp: 'Subir logo para mostrar dentro de las vistas de página.',
    pageLogoNote: 'Nota: Usado en la página de inicio de sesión (ancho mínimo: 400px)',
    favicon: 'Favicon',
    faviconHelp: 'Subir un favicon personalizado',
    uploadLogo: 'Subir Logo',
    uploadFavicon: 'Subir Favicon',
    colorScheme: 'Esquema de Color',
    colorSchemeHelp: 'Seleccionar los colores para su esquema de color.',
    builtInColorScheme: 'Esquema de Color Incorporado',
    builtInColorSchemeHelp: 'Seleccionar un esquema de color predefinido',
    lightDefault: 'Claro (Predeterminado)',
    dark: 'Oscuro',
    blueJean: 'Blue Jean',
    midnight: 'Midnight',
    moonlight: 'Moonlight',
    purpleRain: 'Purple Rain',
    sandstone: 'Sandstone',
    wintersFire: "Winter's Fire",
    headerBackground: 'Fondo del Encabezado',
    headerBackgroundHelp: 'Color de fondo del encabezado',
    headerPrimary: 'Primario del Encabezado',
    headerPrimaryHelp: 'Color del texto e iconos dentro del encabezado',
    primary: 'Primario',
    primaryHelp: 'La mayoría del texto e iconos',
    secondary: 'Secundario',
    secondaryHelp: 'El color de fondo principal',
    tertiary: 'Terciario',
    tertiaryHelp: 'Color de acento, usado para enlaces, algunos botones y notificaciones',
    quaternary: 'Cuaternario',
    quaternaryHelp: 'Color de fondo de la barra lateral'
  },

  // Settings - Legal
  settingsLegal: {
    title: 'Configuración Legal',
    privacyPolicy: 'Política de Privacidad',
    privacyPolicyHelp: 'Pegue HTML/Texto de su política de privacidad.',
    privacyPolicyUpdated: 'Política de Privacidad Actualizada'
  },

  // Tickets
  tickets: {
    title: 'Tickets',
    active: 'Activos',
    assigned: 'Asignados',
    unassigned: 'Sin Asignar',
    priorityNotExist: 'La Prioridad seleccionada no existe para este tipo de ticket. La Prioridad se ha restablecido a la predeterminada para este tipo. Por favor seleccione una nueva prioridad',
    assignee: 'Asignado a',
    issue: 'Problema',
    addComment: 'Agregar Comentario',
    addNote: 'Agregar Nota',
    comments: 'Comentarios',
    notes: 'Notas',
    history: 'Historial',
    changeStatus: 'Cambiar Estado',
    set: 'Establecer',
    statusSetTo: 'Estado del ticket establecido a',
    noTicketsFound: 'No se encontraron tickets',
    requester: 'Solicitante',
    customer: 'Cliente',
    attachmentUploaded: 'Adjunto subido exitosamente',
    attachmentRemoved: 'Adjunto eliminado',
    ticketNumber: 'Ticket #{{number}}',
    setAssignee: 'Establecer Asignado',
    noUserAssigned: 'Sin Usuario Asignado',
    actionBy: 'Acción por',
    transferToThirdParty: 'Transferir a Terceros',
    comment: 'Comentario',
    internalNote: 'Nota Interna',
    postComment: 'Publicar Comentario',
    saveNote: 'Guardar Nota',
    saveEdit: 'Guardar Edición',
    ticket: 'Ticket',
    re: 'Re',
    note: 'NOTA',
    selectAssignee: 'Seleccionar Asignado',
    clearAssignee: 'Limpiar Asignado'
  },

  // Messages
  messages: {
    title: 'Mensajes',
    conversations: 'Conversaciones',
    newConversation: 'Nueva Conversación',
    typing: 'escribiendo...',
    sendMessage: 'Enviar Mensaje',
    startConversation: 'Iniciar Conversación',
    invalidParticipants: 'Participantes inválidos',
    deleteConfirm: '¿Está seguro de que desea eliminar esta conversación?',
    conversationStarted: 'Conversación iniciada el',
    conversationDeleted: 'Conversación eliminada el',
    typeMessage: 'Escribe tu mensaje...',
    send: 'ENVIAR',
    deleteConversation: 'Eliminar Conversación'
  },

  // Reports
  reports: {
    title: 'Reportes',
    generate: 'Generar Reporte',
    selectReport: 'Seleccionar Reporte',
    selectReportType: 'Por favor seleccione un tipo de reporte',
    ticketsByGroups: 'Tickets por Grupos',
    ticketsByPriorities: 'Tickets por Prioridades',
    ticketsByStatus: 'Tickets por Estado',
    ticketsByTags: 'Tickets por Etiquetas',
    ticketsByTypes: 'Tickets por Tipos',
    ticketsByAssignee: 'Tickets por Asignado',
    instruction: 'Por favor seleccione las fechas de inicio y fin y qué grupos incluir en el reporte.',
    generateButton: 'Generar'
  },

  // Teams
  teams: {
    title: 'Equipos',
    createTeam: 'Crear Equipo',
    editTeam: 'Editar Equipo',
    deleteTeam: 'Eliminar Equipo',
    deleteConfirm: '¿Está seguro?',
    deletePermanent: 'Esta es una acción permanente.',
    deleteWarning: 'Los agentes pueden perder acceso a recursos una vez que este equipo sea eliminado.',
    teamName: 'Nombre del Equipo',
    teamNameValidation: 'Por favor ingrese un nombre de equipo válido. (Debe contener 2 caracteres)',
    teamMembers: 'Miembros del Equipo',
    teamActions: 'Acciones del Equipo',
    saveTeam: 'Guardar Equipo',
    noTeams: 'Sin Equipos',
    members: 'Miembros'
  },

  // Departments
  departments: {
    title: 'Departamentos',
    createDepartment: 'Crear Departamento',
    editDepartment: 'Editar Departamento',
    deleteDepartment: 'Eliminar Departamento',
    departmentName: 'Nombre del Departamento',
    departmentNameValidation: 'Por favor ingrese un nombre de departamento válido. (Debe contener 2 caracteres)',
    saveDepartment: 'Guardar Departamento',
    allGroupsQuestion: '¿Acceso a todos los grupos de clientes actuales y nuevos?',
    publicGroupsQuestion: '¿Acceso a todos los grupos públicos actuales y nuevos?',
    groupRequiredError: 'No se puede crear un departamento sin un grupo seleccionado o todos los grupos habilitados!',
    teamRequiredError: 'No se puede crear un departamento sin un equipo seleccionado!',
    allGroups: 'Todos los Grupos',
    allPublicGroups: 'Todos los Grupos Públicos',
    deleteConfirm: '¿Está seguro?',
    deletePermanent: 'Esta es una acción permanente.',
    deleteWarning: 'Los agentes pueden perder acceso a recursos una vez que este departamento sea eliminado.'
  },

  // Groups
  groups: {
    title: 'Grupos de Clientes',
    createGroup: 'Crear Grupo',
    editGroup: 'Editar Grupo',
    deleteGroup: 'Eliminar Grupo',
    groupName: 'Nombre del Grupo',
    groupNameValidation: 'Por favor ingrese un nombre de grupo válido. (Debe contener 2 caracteres)',
    groupMembers: 'Miembros del Grupo',
    saveGroup: 'Guardar Grupo',
    sendNotificationsTo: 'Enviar Notificaciones A',
    groupActions: 'Acciones del Grupo',
    deleteConfirm: '¿Está seguro?',
    deletePermanent: 'Esta es una acción permanente.',
    deleteWarning: 'Los agentes pueden perder acceso a recursos una vez que este grupo sea eliminado.',
    deleteTicketWarning: 'Los grupos que están asociados con tickets no pueden ser eliminados.'
  },

  // Notices
  notices: {
    title: 'Avisos',
    createNotice: 'Crear Aviso',
    editNotice: 'Editar Aviso',
    deleteNotice: 'Eliminar Aviso',
    noticeTitle: 'Título del Aviso',
    message: 'Mensaje',
    active: 'Activo',
    noticeNameValidation: 'Por favor ingrese un nombre de aviso. (Debe contener 2 caracteres)',
    messageValidation: 'Por favor ingrese un mensaje de aviso. (Debe contener 10 caracteres)',
    backgroundColor: 'Color de Fondo',
    fontColor: 'Color de Fuente',
    saveNotice: 'Guardar Aviso'
  },

  // Login & Authentication
  login: {
    username: 'Usuario',
    password: 'Contraseña',
    login: 'Iniciar Sesión',
    createAccount: 'Crear una Cuenta.',
    forgotPassword: '¿Olvidó su contraseña?',
    email: 'Correo Electrónico',
    forgotPasswordTitle: 'Recuperar Contraseña',
    backToLogin: 'Volver al Inicio de Sesión',
    resetEmailSent: '¡Correo de Restablecimiento de Contraseña Enviado!'
  },

  // Error Pages
  errors: {
    404: '404',
    pageNotFound: '¡Ups! Página No Encontrada',
    500: '500',
    serverError: 'Error Desconocido del Servidor',
    429: 'Demasiadas Solicitudes',
    503: 'Servicio No Disponible'
  },

  // Validation Messages
  validation: {
    required: 'Este campo es requerido',
    invalidEmail: 'Correo electrónico inválido',
    passwordMismatch: 'Las contraseñas no coinciden',
    minLength: 'Debe contener al menos',
    maxLength: 'No puede exceder',
    characters: 'caracteres',
    invalidFormat: 'Formato inválido'
  },

  // Table Headers
  table: {
    name: 'Nombre',
    status: 'Estado',
    created: 'Creado',
    updated: 'Actualizado',
    actions: 'Acciones',
    subject: 'Asunto',
    priority: 'Prioridad',
    group: 'Grupo',
    assignee: 'Asignado',
    type: 'Tipo',
    date: 'Fecha',
    lastUpdated: 'Última Actualización',
    dueDate: 'Fecha de Vencimiento',
    createdBy: 'Creado por',
    owner: 'Propietario'
  },

  // Priorities
  priorities: {
    low: 'Baja',
    normal: 'Normal',
    high: 'Alta',
    urgent: 'Urgente',
    critical: 'Crítica'
  },

  // Status
  ticketStatus: {
    new: 'Nuevo',
    open: 'Abierto',
    pending: 'Pendiente',
    closed: 'Cerrado',
    resolved: 'Resuelto'
  },

  // Tooltips & Help
  tooltips: {
    createTicket: 'Crear Ticket',
    notifications: 'Notificaciones',
    onlineUsers: 'Usuarios en Línea',
    search: 'Buscar',
    filter: 'Filtrar',
    refresh: 'Refrescar',
    settings: 'Configuración',
    help: 'Ayuda'
  },

  // Common Labels
  common: {
    loading: 'Cargando...',
    saving: 'Guardando...',
    saved: 'Guardado',
    error: 'Error',
    success: 'Éxito',
    warning: 'Advertencia',
    info: 'Información',
    confirm: 'Confirmar',
    confirmAction: '¿Está seguro de que desea continuar?',
    noResults: 'No se encontraron resultados',
    selectAll: 'Seleccionar Todo',
    deselectAll: 'Deseleccionar Todo',
    showing: 'Mostrando',
    of: 'de',
    entries: 'entradas',
    page: 'Página',
    perPage: 'por página',
    total: 'Total',
    all: 'Todos',
    none: 'Ninguno',
    other: 'Otro',
    custom: 'Personalizado',
    unknown: 'Desconocido',
    unknownError: 'Ocurrió un error desconocido',
    errorOccurred: 'Ocurrió un error. Por favor verifique la consola.'
  },

  // Accounts Page
  accounts: {
    title: 'Cuentas',
    customers: 'Clientes',
    agents: 'Agentes',
    admins: 'Administradores',
    createAccount: 'Crear Cuenta',
    editAccount: 'Editar Cuenta',
    deleteAccount: 'Eliminar Cuenta',
    enableAccount: 'Habilitar Cuenta',
    disableAccount: 'Deshabilitar Cuenta',
    searchAccounts: 'Buscar Cuentas',
    role: 'Rol',
    lastLogin: 'Último Inicio de Sesión',
    accountType: 'Tipo de Cuenta'
  },

  // Accounts Import
  accountsImport: {
    title: 'Importar Cuentas',
    selectImportType: 'Seleccionar Tipo de Importación',
    csv: 'CSV',
    csvDescription: 'Importar cuentas desde un archivo csv subido',
    json: 'JSON',
    jsonDescription: 'Importar cuentas desde un archivo json subido',
    ldap: 'LDAP',
    ldapDescription: 'Importar cuentas desde un servidor ldap empresarial.',
    csvWizardTitle: 'Asistente de Importación de Cuentas CSV',
    csvWizardSubtitle: 'Este asistente le guiará en la importación de cuentas desde un archivo CSV.',
    jsonWizardTitle: 'Asistente de Importación de Cuentas JSON',
    jsonWizardSubtitle: 'Este asistente le guiará en la importación de cuentas desde un archivo JSON.',
    ldapWizardTitle: 'Asistente de Importación de Cuentas LDAP',
    ldapWizardSubtitle: 'Este asistente le guiará en la conexión e importación de usuarios desde un servidor LDAP.',
    fileUpload: 'Subir Archivo',
    fileUploadDescription: 'Subir archivo json que contiene datos de usuario para importar.',
    dropFileToUpload: 'Soltar archivo para subir',
    or: 'o',
    chooseFile: 'elegir archivo',
    reviewUploadedData: 'Revisar Datos Subidos',
    reviewUploadedDataDescription: 'A continuación se muestra el contenido analizado del archivo csv subido.',
    importAccounts: 'Importar Cuentas',
    importingAccounts: 'Importando Cuentas..',
    importingAccountsDescription: 'Por favor espere mientras se importan sus cuentas.',
    doNotNavigateAway: 'Por favor no navegue fuera de esta página. Algunos elementos de la interfaz han sido deshabilitados.',
    connectionInformation: 'Información de Conexión',
    connectionInformationDescription: 'Para importar usuarios desde un servidor LDAP, necesitamos un poco de información de conexión.',
    ldapServer: 'Servidor LDAP',
    bindDN: 'Bind DN (CN=Administrator,DC=domain,DC=com)',
    searchBase: 'Base de Búsqueda',
    searchFilter: 'Filtro de Búsqueda (Por defecto Usuarios)',
    verifyConnection: 'Verificar Conexión',
    verifyConnectionDescription: 'Por favor espere mientras intentamos conectar con su servidor ldap...',
    reviewAccounts: 'Revisar Cuentas',
    reviewAccountsDescription: 'Por favor revise las cuentas a continuación antes de continuar. El siguiente paso importará las cuentas.'
  },

  // Tags
  tags: {
    title: 'Etiquetas',
    createTag: 'Crear Etiqueta',
    editTag: 'Editar Etiqueta',
    deleteTag: 'Eliminar Etiqueta',
    tagName: 'Nombre de Etiqueta',
    addTags: 'Agregar Etiquetas',
    manageTags: 'Gestionar Etiquetas',
    saveTags: 'Guardar Etiquetas',
    noTagsFound: 'No se encontraron etiquetas para '
  },

  // Plugins
  plugins: {
    title: 'Plugins',
    installed: 'Instalados',
    available: 'Disponibles',
    install: 'Instalar',
    uninstall: 'Desinstalar',
    configure: 'Configurar',
    enabled: 'Habilitado',
    disabled: 'Deshabilitado'
  },

  // About
  about: {
    title: 'Acerca de Trudesk',
    version: 'Versión',
    license: 'Licencia',
    documentation: 'Documentación',
    support: 'Soporte'
  },

  // Calendar
  calendar: {
    title: 'Calendario',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda'
  },

  // Backup & Restore
  backup: {
    title: 'Respaldo y Restauración',
    createBackup: 'Crear Respaldo',
    restoreBackup: 'Restaurar Respaldo',
    downloadBackup: 'Descargar Respaldo',
    uploadBackup: 'Subir Respaldo',
    backupCreated: 'Respaldo Creado',
    backupRestored: 'Respaldo Restaurado',
    selectBackup: 'Seleccionar Respaldo'
  },

  // Actions
  actions: {
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    create: 'Crear',
    close: 'Cerrar',
    submit: 'Enviar',
    yes: 'Sí',
    no: 'No',
    clear: 'Limpiar',
    add: 'Agregar',
    remove: 'Eliminar',
    upload: 'Subir',
    download: 'Descargar',
    apply: 'Aplicar',
    enable: 'Habilitar'
  },

  // Filters
  filters: {
    dateStart: 'Fecha de Inicio',
    dateEnd: 'Fecha de Fin',
    ticketTags: 'Etiquetas de Tickets',
    ticketType: 'Tipo de Ticket',
    groups: 'Grupos',
    priorities: 'Prioridades',
    status: 'Estado',
    tags: 'Etiquetas',
    types: 'Tipos',
    assignee: 'Asignado',
    applyFilter: 'Aplicar Filtro'
  },

  // Additional modals
  modals: {
    createPriority: 'Crear Prioridad',
    editPriority: 'Editar Prioridad',
    deletePriority: 'Eliminar Prioridad',
    removePriority: 'Eliminar Prioridad',
    createStatus: 'Crear Estado',
    editStatus: 'Editar Estado',
    deleteStatus: 'Eliminar Estado',
    removeTicketStatus: 'Eliminar Estado de Ticket',
    createType: 'Crear Tipo',
    editType: 'Editar Tipo',
    deleteType: 'Eliminar Tipo',
    createTicketType: 'Crear Tipo de Ticket',
    removeTicketType: 'Eliminar Tipo de Ticket',
    createRole: 'Crear Rol',
    editRole: 'Editar Rol',
    deleteRole: 'Eliminar Rol',
    removeRole: 'Eliminar Rol',
    createTag: 'Crear Etiqueta',
    filterTickets: 'Filtrar Tickets',
    linkWarning: 'Advertencia de Enlace',
    passwordPrompt: 'Solicitud de Contraseña',
    privacyPolicy: 'Política de Privacidad',
    viewAllNotifications: 'Ver Todas las Notificaciones',
    addPriorities: 'Agregar Prioridades',
    redirectWarning: 'Advertencia de Redirección',
    confirmPassword: 'Confirmar Contraseña',
    notifications: 'Notificaciones',
    // Modal descriptions and messages
    priorityName: 'Nombre de Prioridad',
    slaOverdue: 'SLA Vencido (minutos)',
    statusName: 'Nombre de Estado',
    typeName: 'Nombre de Tipo',
    roleName: 'Nombre de Rol',
    selectPriorityReassign: 'Por favor seleccione la prioridad a la que desea reasignar tickets para eliminar esta prioridad',
    selectStatusReassign: 'Por favor seleccione el estado de ticket al que desea reasignar tickets para eliminar este estado de ticket.',
    selectTypeReassign: 'Por favor seleccione el tipo de ticket al que desea reasignar tickets para eliminar este tipo de ticket.',
    selectRoleReassign: 'Por favor seleccione el rol al que desea asignar TODOS los usuarios',
    warningChangePriority: 'ADVERTENCIA: Esto cambiará todos los tickets con prioridad de:',
    warningChangeStatus: 'ADVERTENCIA: Esto cambiará todos los tickets con estado',
    warningChangeType: 'ADVERTENCIA: Esto cambiará todos los tickets con tipo',
    warningChangeRole: 'ADVERTENCIA: Esto cambiará todas las cuentas con rol',
    toSelectedPriority: 'a la prioridad seleccionada arriba.',
    toSelectedStatus: 'al estado de ticket seleccionado.',
    toSelectedType: 'al tipo de ticket seleccionado.',
    toSelectedRole: 'al rol seleccionado arriba.',
    thisIsPermanent: 'Esto es permanente!',
    invalidNameMin3: 'Nombre inválido (3+ caracteres)',
    invalidSlaTime: 'Tiempo SLA inválido (1-525600)',
    createTicketTypeDesc: 'Crear un tipo de ticket',
    tagsCategorizeTickets: 'Las etiquetas categorizan tickets, facilitando la identificación de problemas',
    invalidTagName: 'Por favor ingrese un nombre de etiqueta válido. El nombre de etiqueta debe contener al menos 2 caracteres.',
    invalidTypeName: 'Por favor ingrese un nombre de tipo válido. El nombre de tipo debe contener al menos 3 caracteres',
    invalidRoleName: 'Por favor ingrese un nombre de rol válido. El nombre de rol debe contener al menos 3 caracteres.',
    roleEditableAfterCreate: 'Una vez creado, el rol será editable en el editor de permisos',
    redirectOutsideDomain: 'Está siendo redirigido a un sitio fuera de este dominio. Proceda con precaución.',
    proceed: 'Proceder',
    pleaseConfirmPassword: 'Por favor confirme su contraseña.',
    currentPassword: 'Contraseña Actual',
    verifyPassword: 'Verificar Contraseña',
    important: 'Importante:',
    type: 'Tipo',
    title: 'Título',
    date: 'Fecha',
    addPrioritiesDesc: 'Por favor seleccione las prioridades que desea agregar al tipo:',
    adminRoleWarning: 'El rol que está a punto de eliminar es un rol de administrador. ¡Asegúrese de que haya otro rol de Administrador o podría quedar bloqueado!',
    add: 'Agregar',
    unableToGetPriority: 'No se puede obtener la nueva prioridad. Abortando...',
    unableToGetStatus: 'No se puede obtener el nuevo estado de ticket. Abortando...',
    unableToGetType: 'No se puede obtener el nuevo tipo de ticket. Abortando...'
  },

  // Time & Dates
  time: {
    seconds: 'segundos',
    minutes: 'minutos',
    hours: 'horas',
    days: 'días',
    weeks: 'semanas',
    months: 'meses',
    years: 'años',
    ago: 'hace',
    justNow: 'Justo ahora',
    today: 'Hoy',
    yesterday: 'Ayer',
    tomorrow: 'Mañana'
  },

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
    deleteTypeWarning: 'Una vez que elimine un tipo de ticket, no hay vuelta atrás. Por favor esté seguro.',
    defaultTicketType: 'Tipo de Ticket Predeterminado',
    defaultTicketTypeSubtitle: 'Tipo de ticket predeterminado para tickets recién creados.',
    allowPublicTickets: 'Permitir Tickets Públicos',
    allowPublicTicketsSubtitle: 'Permitir la creación de tickets por usuarios no registrados.',
    allowAgentUserTickets: 'Permitir a los Agentes Enviar Tickets en Nombre del Usuario',
    allowAgentUserTicketsSubtitle: 'Permitir la creación de tickets por agentes en nombre de los usuarios.',
    allowAgentUserTicketsTooltip: 'La configuración surte efecto después de refrescar.',
    showOverdueTickets: 'Mostrar Tickets Vencidos',
    showOverdueTicketsSubtitle: 'Habilitar/Deshabilitar parpadeo de tickets basado en el tiempo SLA de prioridad del tipo.',
    showOverdueTicketsTooltip: 'Si está deshabilitado, los tiempos SLA de prioridad no marcarán tickets como vencidos.',
    minSubjectLength: 'Longitud Mínima del Asunto',
    minSubjectLengthSubtitle: 'Límite mínimo de caracteres para el asunto del ticket',
    minIssueLength: 'Longitud Mínima del Problema',
    minIssueLengthSubtitle: 'Límite mínimo de caracteres para el problema del ticket',
    ticketTypes: 'Tipos de Tickets',
    createModifyTicketTypes: 'Crear/Modificar Tipos de Tickets',
    ticketPriorities: 'Prioridades de Tickets',
    ticketPrioritiesSubtitle: 'Las prioridades de tickets establecen el nivel de SLAs para cada ticket.',
    ticketTags: 'Etiquetas de Tickets',
    createModifyTicketTags: 'Crear/Modificar Etiquetas de Tickets',
    noTagsFound: 'No se Encontraron Etiquetas',
    deleteTagConfirm: '¿Realmente eliminar etiqueta',
    deleteTagNote: 'Esto eliminará la etiqueta de todos los tickets asociados.',
    tagRemoved: 'Etiqueta eliminada exitosamente',
    tagUpdated: 'Etiqueta actualizada exitosamente',
    invalidTagName: 'Nombre de Etiqueta Inválido'
  },

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
    dangerZone: 'Zona de Peligro',
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
  }
}

// Helper function to get translation with interpolation support
export const t = (key, params = {}) => {
  const keys = key.split('.')
  let result = es

  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k]
    } else {
      console.warn(`Translation key not found: ${key}`)
      return key
    }
  }

  // Handle interpolation for strings like "Ticket #{{number}}"
  if (typeof result === 'string' && Object.keys(params).length > 0) {
    return result.replace(/\{\{(\w+)\}\}/g, (match, param) => {
      return params[param] !== undefined ? params[param] : match
    })
  }

  return result
}

// Export default translations
export default es
