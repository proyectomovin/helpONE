/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Updated:    2025-11-27
 *  Copyright (c) 2014-2025. All rights reserved.
 */

var moment = require('moment')

/**
 * Available variables for email templates
 */
var availableVariables = {
  // Ticket variables
  ticket: [
    'uid',
    'subject',
    'issue',
    'priority',
    'status',
    'type',
    'dateFormatted',
    'dateTimeFormatted',
    'date',
    'closedDate',
    'updatedAt',
    'url',
    'group.name',
    'assignee.fullname',
    'assignee.email',
    'owner.fullname',
    'owner.email',
    'tags',
    'comments.length'
  ],

  // User variables
  user: ['fullname', 'email', 'username', 'title', 'role'],

  // Comment variables
  comment: ['text', 'owner.fullname', 'owner.email', 'date', 'dateFormatted'],

  // Company/System variables
  company: ['name', 'logo', 'url', 'supportEmail'],

  // Action variables
  action: ['url', 'label']
}

/**
 * Get sample data for testing templates
 */
function getSampleData() {
  return {
    ticket: {
      uid: 1001,
      subject: 'Error en módulo de facturación',
      issue: 'El sistema muestra un error al intentar generar una factura para el cliente XYZ.',
      priority: 'Normal',
      status: 'Open',
      type: 'Issue',
      date: new Date(),
      dateFormatted: moment().format('DD/MM/YYYY'),
      dateTimeFormatted: moment().format('DD/MM/YYYY HH:mm'),
      closedDate: null,
      updatedAt: new Date(),
      url: 'https://helpdesk.example.com/tickets/1001',
      group: {
        name: 'Soporte Técnico'
      },
      assignee: {
        fullname: 'Juan Pérez',
        email: 'juan.perez@example.com'
      },
      owner: {
        fullname: 'María González',
        email: 'maria.gonzalez@example.com'
      },
      tags: ['facturación', 'urgente'],
      comments: {
        length: 3
      }
    },
    user: {
      fullname: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@example.com',
      username: 'crodriguez',
      title: 'Ingeniero de Soporte',
      role: 'Agent'
    },
    comment: {
      text: 'Estoy revisando el problema. Parece ser un error de configuración en el módulo de pagos.',
      owner: {
        fullname: 'Juan Pérez',
        email: 'juan.perez@example.com'
      },
      date: new Date(),
      dateFormatted: moment().format('DD/MM/YYYY HH:mm')
    },
    company: {
      name: 'HelpONE Support',
      logo: 'https://helpdesk.example.com/logo.png',
      url: 'https://helpdesk.example.com',
      supportEmail: 'soporte@example.com'
    },
    action: {
      url: 'https://helpdesk.example.com/tickets/1001',
      label: 'Ver Ticket'
    }
  }
}

/**
 * Format ticket data for template rendering
 */
function formatTicketData(ticket, baseUrl) {
  if (!ticket) return null

  const formatted = {
    uid: ticket.uid,
    subject: ticket.subject,
    issue: ticket.issue,
    priority: ticket.priority ? ticket.priority.name : 'Normal',
    status: ticket.status ? ticket.status.name : ticket.status,
    type: ticket.type ? ticket.type.name : ticket.type,
    date: ticket.date,
    dateFormatted: moment(ticket.date).format('DD/MM/YYYY'),
    dateTimeFormatted: moment(ticket.date).format('DD/MM/YYYY HH:mm'),
    closedDate: ticket.closedDate,
    updatedAt: ticket.updatedAt,
    url: baseUrl ? `${baseUrl}/tickets/${ticket.uid}` : `/tickets/${ticket.uid}`
  }

  // Group
  if (ticket.group) {
    formatted.group = {
      name: ticket.group.name
    }
  }

  // Assignee
  if (ticket.assignee) {
    formatted.assignee = {
      fullname: ticket.assignee.fullname,
      email: ticket.assignee.email
    }
  }

  // Owner
  if (ticket.owner) {
    formatted.owner = {
      fullname: ticket.owner.fullname,
      email: ticket.owner.email
    }
  }

  // Tags
  if (ticket.tags && Array.isArray(ticket.tags)) {
    formatted.tags = ticket.tags.map(tag => (tag.name ? tag.name : tag)).join(', ')
  }

  // Comments count
  if (ticket.comments) {
    formatted.comments = {
      length: ticket.comments.length
    }
  }

  return formatted
}

/**
 * Format user data for template rendering
 */
function formatUserData(user) {
  if (!user) return null

  return {
    fullname: user.fullname,
    email: user.email,
    username: user.username,
    title: user.title || '',
    role: user.role ? user.role.name : user.role
  }
}

/**
 * Format comment data for template rendering
 */
function formatCommentData(comment) {
  if (!comment) return null

  const formatted = {
    text: comment.comment,
    date: comment.date,
    dateFormatted: moment(comment.date).format('DD/MM/YYYY HH:mm')
  }

  if (comment.owner) {
    formatted.owner = {
      fullname: comment.owner.fullname,
      email: comment.owner.email
    }
  }

  return formatted
}

/**
 * Format company data for template rendering
 */
function formatCompanyData(settings, baseUrl) {
  return {
    name: settings.companyName || 'HelpONE',
    logo: settings.companyLogo || `${baseUrl}/img/logo.png`,
    url: baseUrl || '',
    supportEmail: settings.mailerFrom || 'support@helpone.com'
  }
}

/**
 * Get all available variables documentation
 */
function getVariablesDocumentation() {
  return {
    ticket: {
      description: 'Variables relacionadas con el ticket',
      variables: {
        'ticket.uid': 'ID único del ticket',
        'ticket.subject': 'Asunto del ticket',
        'ticket.issue': 'Descripción del problema',
        'ticket.priority': 'Prioridad (Normal, Urgente, Critical)',
        'ticket.status': 'Estado actual',
        'ticket.type': 'Tipo de ticket',
        'ticket.dateFormatted': 'Fecha de creación formateada',
        'ticket.dateTimeFormatted': 'Fecha y hora formateada',
        'ticket.url': 'URL del ticket',
        'ticket.group.name': 'Nombre del grupo asignado',
        'ticket.assignee.fullname': 'Nombre del agente asignado',
        'ticket.assignee.email': 'Email del agente asignado',
        'ticket.owner.fullname': 'Nombre del solicitante',
        'ticket.owner.email': 'Email del solicitante',
        'ticket.tags': 'Etiquetas del ticket',
        'ticket.comments.length': 'Número de comentarios'
      }
    },
    user: {
      description: 'Variables del usuario que recibe el email',
      variables: {
        'user.fullname': 'Nombre completo',
        'user.email': 'Correo electrónico',
        'user.username': 'Nombre de usuario',
        'user.title': 'Cargo',
        'user.role': 'Rol en el sistema'
      }
    },
    comment: {
      description: 'Variables del comentario (solo para notificaciones de comentarios)',
      variables: {
        'comment.text': 'Texto del comentario',
        'comment.owner.fullname': 'Nombre de quien comentó',
        'comment.owner.email': 'Email de quien comentó',
        'comment.dateFormatted': 'Fecha del comentario'
      }
    },
    company: {
      description: 'Variables de la empresa/sistema',
      variables: {
        'company.name': 'Nombre de la empresa',
        'company.logo': 'URL del logo',
        'company.url': 'URL del sistema',
        'company.supportEmail': 'Email de soporte'
      }
    },
    action: {
      description: 'Variables para botones de acción',
      variables: {
        'action.url': 'URL del botón',
        'action.label': 'Texto del botón'
      }
    }
  }
}

module.exports = {
  availableVariables: availableVariables,
  getSampleData: getSampleData,
  formatTicketData: formatTicketData,
  formatUserData: formatUserData,
  formatCommentData: formatCommentData,
  formatCompanyData: formatCompanyData,
  getVariablesDocumentation: getVariablesDocumentation
}
