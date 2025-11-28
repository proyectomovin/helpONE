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

/**
 * Actions Helper
 * Executes rule actions based on configuration
 */

var emailModule = require('../index')
var templateEngine = require('../templates/engine')
var winston = require('../../logger')
var axios = require('axios')

var actionsHelper = {}

/**
 * Execute a single action
 * @param {Object} action - Action configuration object
 * @param {Object} context - Event context
 * @param {Function} callback - Callback function
 */
actionsHelper.executeAction = function (action, context, callback) {
  if (!action || !action.type) {
    return callback(new Error('Invalid action: missing type'))
  }

  winston.debug('Executing action: ' + action.type)

  try {
    switch (action.type) {
      case 'send-email':
        return actionsHelper.sendEmail(action, context, callback)

      case 'send-email-calendar':
        return actionsHelper.sendEmailWithCalendar(action, context, callback)

      case 'assign-ticket':
        return actionsHelper.assignTicket(action, context, callback)

      case 'add-tag':
        return actionsHelper.addTag(action, context, callback)

      case 'remove-tag':
        return actionsHelper.removeTag(action, context, callback)

      case 'update-priority':
        return actionsHelper.updatePriority(action, context, callback)

      case 'update-status':
        return actionsHelper.updateStatus(action, context, callback)

      case 'add-comment':
        return actionsHelper.addComment(action, context, callback)

      case 'notify-user':
        return actionsHelper.notifyUser(action, context, callback)

      case 'notify-group':
        return actionsHelper.notifyGroup(action, context, callback)

      case 'webhook':
        return actionsHelper.callWebhook(action, context, callback)

      case 'delay':
        return actionsHelper.delay(action, context, callback)

      default:
        winston.warn('Unknown action type: ' + action.type)
        return callback(new Error('Unknown action type: ' + action.type))
    }
  } catch (err) {
    winston.error('Error executing action ' + action.type + ': ' + err.message)
    callback(err)
  }
}

/**
 * Send email action
 */
actionsHelper.sendEmail = function (action, context, callback) {
  if (!action.emailConfig) {
    return callback(new Error('Email action requires emailConfig'))
  }

  var emailConfig = action.emailConfig
  var recipients = actionsHelper.resolveRecipients(emailConfig, context)

  if (!recipients || recipients.length === 0) {
    return callback(new Error('No recipients resolved for email action'))
  }

  // Prepare template data
  var templateData = templateEngine.buildTemplateData({
    ticket: context.ticket,
    user: context.user,
    comment: context.comment,
    baseUrl: context.baseUrl
  })

  // Send email
  var emailOptions = {
    to: recipients,
    templateType: emailConfig.templateType,
    templateSlug: emailConfig.templateSlug,
    data: templateData,
    ticketId: context.ticket ? context.ticket._id : null,
    userId: context.user ? context.user._id : null
  }

  emailModule.sendTemplateEmail(emailOptions, function (err, result) {
    if (err) {
      winston.error('Error sending email: ' + err.message)
      return callback(err)
    }

    winston.debug('Email sent successfully')
    callback(null, { messageId: result.messageId })
  })
}

/**
 * Send email with calendar action
 */
actionsHelper.sendEmailWithCalendar = function (action, context, callback) {
  if (!action.emailConfig) {
    return callback(new Error('Email action requires emailConfig'))
  }

  var emailConfig = action.emailConfig
  var recipients = actionsHelper.resolveRecipients(emailConfig, context)

  if (!recipients || recipients.length === 0) {
    return callback(new Error('No recipients resolved for email action'))
  }

  if (!emailConfig.calendarType) {
    return callback(new Error('Calendar email requires calendarType'))
  }

  // Prepare template data
  var templateData = templateEngine.buildTemplateData({
    ticket: context.ticket,
    user: context.user,
    baseUrl: context.baseUrl
  })

  // Prepare calendar data based on type
  var calendarData = {}

  switch (emailConfig.calendarType) {
    case 'sla':
      if (!context.ticket || !context.slaDeadline) {
        return callback(new Error('SLA calendar requires ticket and slaDeadline in context'))
      }
      calendarData = {
        ticket: context.ticket,
        slaDeadline: context.slaDeadline,
        options: {
          ticketUrl: context.baseUrl + '/tickets/' + context.ticket.uid
        }
      }
      break

    case 'assignment':
      if (!context.ticket || !context.assignee) {
        return callback(new Error('Assignment calendar requires ticket and assignee in context'))
      }
      calendarData = {
        ticket: context.ticket,
        assignee: context.assignee,
        options: {
          ticketUrl: context.baseUrl + '/tickets/' + context.ticket.uid
        }
      }
      break

    case 'meeting':
      if (!context.ticket || !context.meetingDate) {
        return callback(new Error('Meeting calendar requires ticket and meetingDate in context'))
      }
      calendarData = {
        ticket: context.ticket,
        meetingDate: context.meetingDate,
        duration: context.meetingDuration || 30,
        attendees: context.attendees || [],
        options: {
          ticketUrl: context.baseUrl + '/tickets/' + context.ticket.uid
        }
      }
      break

    default:
      return callback(new Error('Invalid calendar type: ' + emailConfig.calendarType))
  }

  // Send email with calendar
  var emailOptions = {
    to: recipients,
    templateType: emailConfig.templateType,
    templateSlug: emailConfig.templateSlug,
    data: templateData,
    calendarType: emailConfig.calendarType,
    calendarData: calendarData,
    ticketId: context.ticket ? context.ticket._id : null,
    userId: context.user ? context.user._id : null
  }

  emailModule.sendEmailWithCalendar(emailOptions, function (err, result) {
    if (err) {
      winston.error('Error sending calendar email: ' + err.message)
      return callback(err)
    }

    winston.debug('Calendar email sent successfully')
    callback(null, {
      messageId: result.info.messageId,
      calendarEventId: result.calendarEventId
    })
  })
}

/**
 * Assign ticket action
 */
actionsHelper.assignTicket = function (action, context, callback) {
  if (!action.ticketConfig || !action.ticketConfig.assigneeId) {
    return callback(new Error('Assign ticket action requires ticketConfig.assigneeId'))
  }

  if (!context.ticket) {
    return callback(new Error('No ticket in context'))
  }

  var Ticket = require('../../models/ticket')

  Ticket.findById(context.ticket._id).exec(function (err, ticket) {
    if (err) return callback(err)
    if (!ticket) return callback(new Error('Ticket not found'))

    ticket.assignee = action.ticketConfig.assigneeId
    ticket.save(function (err) {
      if (err) {
        winston.error('Error assigning ticket: ' + err.message)
        return callback(err)
      }

      winston.debug('Ticket assigned successfully')
      callback(null, { ticketId: ticket._id, assigneeId: action.ticketConfig.assigneeId })
    })
  })
}

/**
 * Add tag action
 */
actionsHelper.addTag = function (action, context, callback) {
  if (!action.ticketConfig || !action.ticketConfig.tags || action.ticketConfig.tags.length === 0) {
    return callback(new Error('Add tag action requires ticketConfig.tags'))
  }

  if (!context.ticket) {
    return callback(new Error('No ticket in context'))
  }

  var Ticket = require('../../models/ticket')

  Ticket.findById(context.ticket._id).exec(function (err, ticket) {
    if (err) return callback(err)
    if (!ticket) return callback(new Error('Ticket not found'))

    // Add tags that don't already exist
    var existingTags = ticket.tags || []
    var newTags = action.ticketConfig.tags.filter(function (tag) {
      return !existingTags.includes(tag)
    })

    if (newTags.length > 0) {
      ticket.tags = existingTags.concat(newTags)
      ticket.save(function (err) {
        if (err) {
          winston.error('Error adding tags: ' + err.message)
          return callback(err)
        }

        winston.debug('Tags added successfully: ' + newTags.join(', '))
        callback(null, { ticketId: ticket._id, addedTags: newTags })
      })
    } else {
      winston.debug('Tags already exist, skipping')
      callback(null, { ticketId: ticket._id, addedTags: [] })
    }
  })
}

/**
 * Remove tag action
 */
actionsHelper.removeTag = function (action, context, callback) {
  if (!action.ticketConfig || !action.ticketConfig.tags || action.ticketConfig.tags.length === 0) {
    return callback(new Error('Remove tag action requires ticketConfig.tags'))
  }

  if (!context.ticket) {
    return callback(new Error('No ticket in context'))
  }

  var Ticket = require('../../models/ticket')

  Ticket.findById(context.ticket._id).exec(function (err, ticket) {
    if (err) return callback(err)
    if (!ticket) return callback(new Error('Ticket not found'))

    var existingTags = ticket.tags || []
    var tagsToRemove = action.ticketConfig.tags

    ticket.tags = existingTags.filter(function (tag) {
      return !tagsToRemove.includes(tag)
    })

    ticket.save(function (err) {
      if (err) {
        winston.error('Error removing tags: ' + err.message)
        return callback(err)
      }

      winston.debug('Tags removed successfully: ' + tagsToRemove.join(', '))
      callback(null, { ticketId: ticket._id, removedTags: tagsToRemove })
    })
  })
}

/**
 * Update priority action
 */
actionsHelper.updatePriority = function (action, context, callback) {
  if (!action.ticketConfig || !action.ticketConfig.priorityId) {
    return callback(new Error('Update priority action requires ticketConfig.priorityId'))
  }

  if (!context.ticket) {
    return callback(new Error('No ticket in context'))
  }

  var Ticket = require('../../models/ticket')

  Ticket.findById(context.ticket._id).exec(function (err, ticket) {
    if (err) return callback(err)
    if (!ticket) return callback(new Error('Ticket not found'))

    ticket.priority = action.ticketConfig.priorityId
    ticket.save(function (err) {
      if (err) {
        winston.error('Error updating priority: ' + err.message)
        return callback(err)
      }

      winston.debug('Ticket priority updated successfully')
      callback(null, { ticketId: ticket._id, priorityId: action.ticketConfig.priorityId })
    })
  })
}

/**
 * Update status action
 */
actionsHelper.updateStatus = function (action, context, callback) {
  if (!action.ticketConfig || !action.ticketConfig.statusId) {
    return callback(new Error('Update status action requires ticketConfig.statusId'))
  }

  if (!context.ticket) {
    return callback(new Error('No ticket in context'))
  }

  var Ticket = require('../../models/ticket')

  Ticket.findById(context.ticket._id).exec(function (err, ticket) {
    if (err) return callback(err)
    if (!ticket) return callback(new Error('Ticket not found'))

    ticket.status = action.ticketConfig.statusId
    ticket.save(function (err) {
      if (err) {
        winston.error('Error updating status: ' + err.message)
        return callback(err)
      }

      winston.debug('Ticket status updated successfully')
      callback(null, { ticketId: ticket._id, statusId: action.ticketConfig.statusId })
    })
  })
}

/**
 * Add comment action
 */
actionsHelper.addComment = function (action, context, callback) {
  if (!action.ticketConfig || !action.ticketConfig.comment) {
    return callback(new Error('Add comment action requires ticketConfig.comment'))
  }

  if (!context.ticket) {
    return callback(new Error('No ticket in context'))
  }

  var Comment = require('../../models/comment')

  var comment = new Comment({
    owner: context.user ? context.user._id : null,
    date: new Date(),
    comment: action.ticketConfig.comment,
    deleted: false
  })

  comment.save(function (err, savedComment) {
    if (err) {
      winston.error('Error creating comment: ' + err.message)
      return callback(err)
    }

    // Add comment to ticket
    var Ticket = require('../../models/ticket')

    Ticket.findById(context.ticket._id).exec(function (err, ticket) {
      if (err) return callback(err)
      if (!ticket) return callback(new Error('Ticket not found'))

      ticket.comments = ticket.comments || []
      ticket.comments.push(savedComment._id)

      ticket.save(function (err) {
        if (err) {
          winston.error('Error adding comment to ticket: ' + err.message)
          return callback(err)
        }

        winston.debug('Comment added successfully')
        callback(null, { ticketId: ticket._id, commentId: savedComment._id })
      })
    })
  })
}

/**
 * Notify user action
 */
actionsHelper.notifyUser = function (action, context, callback) {
  // This would integrate with the notification system
  // For now, just log it
  winston.debug('Notify user action executed')
  callback(null, { success: true })
}

/**
 * Notify group action
 */
actionsHelper.notifyGroup = function (action, context, callback) {
  // This would integrate with the notification system
  // For now, just log it
  winston.debug('Notify group action executed')
  callback(null, { success: true })
}

/**
 * Call webhook action
 */
actionsHelper.callWebhook = function (action, context, callback) {
  if (!action.webhookConfig || !action.webhookConfig.url) {
    return callback(new Error('Webhook action requires webhookConfig.url'))
  }

  var config = action.webhookConfig
  var method = config.method || 'POST'
  var timeout = config.timeout || 5000

  // Prepare request data
  var requestConfig = {
    method: method,
    url: config.url,
    timeout: timeout,
    headers: config.headers || { 'Content-Type': 'application/json' }
  }

  // Add body for POST/PUT/PATCH
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    requestConfig.data = config.body || {
      event: context.eventType,
      ticket: context.ticket,
      user: context.user,
      timestamp: new Date()
    }
  }

  // Make HTTP request
  axios(requestConfig)
    .then(function (response) {
      winston.debug('Webhook called successfully: ' + config.url + ' (Status: ' + response.status + ')')
      callback(null, {
        success: true,
        status: response.status,
        data: response.data
      })
    })
    .catch(function (error) {
      winston.error('Webhook call failed: ' + config.url + ' - ' + error.message)
      callback(error)
    })
}

/**
 * Delay action
 */
actionsHelper.delay = function (action, context, callback) {
  if (!action.delayConfig || !action.delayConfig.duration) {
    return callback(new Error('Delay action requires delayConfig.duration'))
  }

  var duration = action.delayConfig.duration
  var unit = action.delayConfig.unit || 'minutes'

  // Convert to milliseconds
  var ms = duration
  switch (unit) {
    case 'hours':
      ms = duration * 60 * 60 * 1000
      break
    case 'days':
      ms = duration * 24 * 60 * 60 * 1000
      break
    default: // minutes
      ms = duration * 60 * 1000
  }

  winston.debug('Delaying execution for ' + duration + ' ' + unit)

  setTimeout(function () {
    winston.debug('Delay completed')
    callback(null, { delayed: duration + ' ' + unit })
  }, ms)
}

/**
 * Resolve recipients from email config
 * @param {Object} emailConfig - Email configuration
 * @param {Object} context - Event context
 * @returns {Array} Array of email addresses
 */
actionsHelper.resolveRecipients = function (emailConfig, context) {
  var recipients = []

  switch (emailConfig.recipients) {
    case 'ticket-owner':
      if (context.ticket && context.ticket.owner && context.ticket.owner.email) {
        recipients.push(context.ticket.owner.email)
      }
      break

    case 'ticket-assignee':
      if (context.ticket && context.ticket.assignee && context.ticket.assignee.email) {
        recipients.push(context.ticket.assignee.email)
      }
      break

    case 'ticket-group':
      // This would need to fetch group members
      // For now, just return empty
      winston.warn('ticket-group recipients not yet implemented')
      break

    case 'custom-users':
    case 'custom-groups':
    case 'custom-emails':
      if (emailConfig.customRecipients && emailConfig.customRecipients.length > 0) {
        recipients = recipients.concat(emailConfig.customRecipients)
      }
      break
  }

  return recipients
}

/**
 * Get available actions
 * @returns {Array} Array of available action definitions
 */
actionsHelper.getAvailableActions = function () {
  return [
    {
      type: 'send-email',
      label: 'Send Email',
      description: 'Send an email notification using a template',
      configFields: ['templateType', 'recipients']
    },
    {
      type: 'send-email-calendar',
      label: 'Send Email with Calendar',
      description: 'Send an email with calendar attachment',
      configFields: ['templateType', 'recipients', 'calendarType']
    },
    {
      type: 'assign-ticket',
      label: 'Assign Ticket',
      description: 'Assign ticket to a user',
      configFields: ['assigneeId']
    },
    {
      type: 'add-tag',
      label: 'Add Tag',
      description: 'Add tags to ticket',
      configFields: ['tags']
    },
    {
      type: 'remove-tag',
      label: 'Remove Tag',
      description: 'Remove tags from ticket',
      configFields: ['tags']
    },
    {
      type: 'update-priority',
      label: 'Update Priority',
      description: 'Change ticket priority',
      configFields: ['priorityId']
    },
    {
      type: 'update-status',
      label: 'Update Status',
      description: 'Change ticket status',
      configFields: ['statusId']
    },
    {
      type: 'add-comment',
      label: 'Add Comment',
      description: 'Add an automated comment to ticket',
      configFields: ['comment']
    },
    {
      type: 'webhook',
      label: 'Call Webhook',
      description: 'Make HTTP request to external URL',
      configFields: ['url', 'method', 'headers', 'body']
    },
    {
      type: 'delay',
      label: 'Delay',
      description: 'Wait before executing next action',
      configFields: ['duration', 'unit']
    }
  ]
}

module.exports = actionsHelper
