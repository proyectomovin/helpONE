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

var Handlebars = require('handlebars')
var variablesHelper = require('./variables')

/**
 * Render email template with data
 * @param {String} template - HTML template with {{variables}}
 * @param {Object} data - Data object with variables
 * @returns {String} Rendered HTML
 */
function render(template, data) {
  try {
    // Compile the template
    var compiledTemplate = Handlebars.compile(template)

    // Render with data
    return compiledTemplate(data)
  } catch (err) {
    throw new Error('Error rendering template: ' + err.message)
  }
}

/**
 * Render subject line with data
 * @param {String} subject - Subject with {{variables}}
 * @param {Object} data - Data object with variables
 * @returns {String} Rendered subject
 */
function renderSubject(subject, data) {
  try {
    var compiledSubject = Handlebars.compile(subject)
    return compiledSubject(data)
  } catch (err) {
    throw new Error('Error rendering subject: ' + err.message)
  }
}

/**
 * Build complete data object for template rendering
 * @param {Object} options - Options object
 * @param {Object} options.ticket - Ticket object
 * @param {Object} options.user - User object
 * @param {Object} options.comment - Comment object
 * @param {Object} options.settings - Settings object
 * @param {String} options.baseUrl - Base URL
 * @param {Object} options.action - Action object (url, label)
 * @param {Object} options.custom - Custom data
 * @returns {Object} Complete data object
 */
function buildTemplateData(options) {
  options = options || {}

  var data = {}

  // Format ticket data
  if (options.ticket) {
    data.ticket = variablesHelper.formatTicketData(options.ticket, options.baseUrl)
  }

  // Format user data
  if (options.user) {
    data.user = variablesHelper.formatUserData(options.user)
  }

  // Format comment data
  if (options.comment) {
    data.comment = variablesHelper.formatCommentData(options.comment)
  }

  // Format company data
  if (options.settings || options.baseUrl) {
    data.company = variablesHelper.formatCompanyData(options.settings || {}, options.baseUrl || '')
  }

  // Action data
  if (options.action) {
    data.action = options.action
  }

  // Custom data
  if (options.custom) {
    Object.keys(options.custom).forEach(function (key) {
      data[key] = options.custom[key]
    })
  }

  return data
}

/**
 * Render complete email template
 * @param {Object} emailTemplate - EmailTemplate model instance
 * @param {Object} data - Data object for rendering
 * @returns {Object} { subject, html, text }
 */
function renderEmailTemplate(emailTemplate, data) {
  if (!emailTemplate) {
    throw new Error('Email template is required')
  }

  return {
    subject: renderSubject(emailTemplate.subject, data),
    html: render(emailTemplate.htmlContent, data),
    text: emailTemplate.textContent ? render(emailTemplate.textContent, data) : null
  }
}

/**
 * Extract variables from template string
 * @param {String} template - Template string
 * @returns {Array} Array of variable names
 */
function extractVariables(template) {
  if (!template) return []

  var variableRegex = /\{\{([^}]+)\}\}/g
  var matches = []
  var match

  while ((match = variableRegex.exec(template)) !== null) {
    var variable = match[1].trim()
    if (matches.indexOf(variable) === -1) {
      matches.push(variable)
    }
  }

  return matches
}

/**
 * Validate template variables
 * @param {String} template - Template string
 * @returns {Object} { valid: Boolean, unknownVariables: Array }
 */
function validateTemplate(template) {
  var usedVariables = extractVariables(template)
  var knownVariables = []

  // Build list of all known variables
  Object.keys(variablesHelper.availableVariables).forEach(function (category) {
    variablesHelper.availableVariables[category].forEach(function (variable) {
      knownVariables.push(category + '.' + variable)
    })
  })

  // Check for unknown variables
  var unknownVariables = usedVariables.filter(function (variable) {
    // Skip Handlebars helpers and special syntax
    if (variable.startsWith('#') || variable.startsWith('/') || variable.startsWith('else')) {
      return false
    }

    return knownVariables.indexOf(variable) === -1
  })

  return {
    valid: unknownVariables.length === 0,
    unknownVariables: unknownVariables,
    usedVariables: usedVariables
  }
}

/**
 * Register custom Handlebars helpers
 */
function registerHelpers() {
  // Helper: formatDate
  Handlebars.registerHelper('formatDate', function (date, format) {
    var moment = require('moment')
    if (!date) return ''
    return moment(date).format(format || 'DD/MM/YYYY')
  })

  // Helper: eq (equals)
  Handlebars.registerHelper('eq', function (a, b) {
    return a === b
  })

  // Helper: ne (not equals)
  Handlebars.registerHelper('ne', function (a, b) {
    return a !== b
  })

  // Helper: gt (greater than)
  Handlebars.registerHelper('gt', function (a, b) {
    return a > b
  })

  // Helper: lt (less than)
  Handlebars.registerHelper('lt', function (a, b) {
    return a < b
  })

  // Helper: uppercase
  Handlebars.registerHelper('uppercase', function (str) {
    return str ? str.toUpperCase() : ''
  })

  // Helper: lowercase
  Handlebars.registerHelper('lowercase', function (str) {
    return str ? str.toLowerCase() : ''
  })

  // Helper: truncate
  Handlebars.registerHelper('truncate', function (str, length) {
    if (!str) return ''
    if (str.length <= length) return str
    return str.substring(0, length) + '...'
  })
}

// Register helpers on module load
registerHelpers()

module.exports = {
  render: render,
  renderSubject: renderSubject,
  buildTemplateData: buildTemplateData,
  renderEmailTemplate: renderEmailTemplate,
  extractVariables: extractVariables,
  validateTemplate: validateTemplate,
  registerHelpers: registerHelpers
}
