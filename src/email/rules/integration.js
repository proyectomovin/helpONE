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
 * Rule Integration Module
 * Integrates notification rules with the event system
 */

var emitter = require('../../emitter')
var ruleEngine = require('./engine')
var winston = require('../../logger')
var settingsSchema = require('../../models/setting')

var integration = {}

/**
 * Initialize rule integration with event system
 */
integration.init = function () {
  winston.info('Initializing notification rules integration...')

  // Check if rules are enabled
  settingsSchema.getSetting('notification:rules:enabled', function (err, setting) {
    if (err) {
      winston.warn('Could not check notification rules setting: ' + err.message)
      // Default to enabled if setting doesn't exist
      integration.registerEventHandlers()
      return
    }

    var enabled = setting ? setting.value : true

    if (enabled) {
      integration.registerEventHandlers()
      winston.info('Notification rules integration initialized successfully')
    } else {
      winston.info('Notification rules are disabled via settings')
    }
  })
}

/**
 * Register event handlers
 */
integration.registerEventHandlers = function () {
  winston.debug('Registering notification rule event handlers...')

  // Ticket created
  emitter.on('ticket:created', function (data) {
    integration.handleTicketCreated(data)
  })

  // Ticket updated
  emitter.on('ticket:updated', function (ticket) {
    integration.handleTicketUpdated(ticket)
  })

  // Ticket assigned
  emitter.on('ticket:assigned', function (data) {
    integration.handleTicketAssigned(data)
  })

  // Ticket closed
  emitter.on('ticket:closed', function (ticket) {
    integration.handleTicketClosed(ticket)
  })

  // Ticket reopened
  emitter.on('ticket:reopened', function (ticket) {
    integration.handleTicketReopened(ticket)
  })

  // Comment added
  emitter.on('ticket:comment:added', function (ticket, comment, hostname) {
    integration.handleCommentAdded(ticket, comment, hostname)
  })

  // Status changed
  emitter.on('ticket:status:changed', function (data) {
    integration.handleStatusChanged(data)
  })

  // Priority changed
  emitter.on('ticket:priority:changed', function (data) {
    integration.handlePriorityChanged(data)
  })

  winston.debug('Event handlers registered successfully')
}

/**
 * Handle ticket created event
 */
integration.handleTicketCreated = function (data) {
  winston.debug('Processing ticket:created event for notification rules')

  var context = integration.buildContext('ticket-created', data)

  ruleEngine.processEvent('ticket-created', context, function (err, result) {
    if (err) {
      winston.error('Error processing ticket:created rules: ' + err.message)
      return
    }

    winston.debug('Processed ticket:created - Executed ' + result.executedRules + ' rules')
  })
}

/**
 * Handle ticket updated event
 */
integration.handleTicketUpdated = function (ticket) {
  winston.debug('Processing ticket:updated event for notification rules')

  var context = integration.buildContext('ticket-updated', { ticket: ticket })

  ruleEngine.processEvent('ticket-updated', context, function (err, result) {
    if (err) {
      winston.error('Error processing ticket:updated rules: ' + err.message)
      return
    }

    winston.debug('Processed ticket:updated - Executed ' + result.executedRules + ' rules')
  })
}

/**
 * Handle ticket assigned event
 */
integration.handleTicketAssigned = function (data) {
  winston.debug('Processing ticket:assigned event for notification rules')

  var context = integration.buildContext('ticket-assigned', data)

  ruleEngine.processEvent('ticket-assigned', context, function (err, result) {
    if (err) {
      winston.error('Error processing ticket:assigned rules: ' + err.message)
      return
    }

    winston.debug('Processed ticket:assigned - Executed ' + result.executedRules + ' rules')
  })
}

/**
 * Handle ticket closed event
 */
integration.handleTicketClosed = function (ticket) {
  winston.debug('Processing ticket:closed event for notification rules')

  var context = integration.buildContext('ticket-closed', { ticket: ticket })

  ruleEngine.processEvent('ticket-closed', context, function (err, result) {
    if (err) {
      winston.error('Error processing ticket:closed rules: ' + err.message)
      return
    }

    winston.debug('Processed ticket:closed - Executed ' + result.executedRules + ' rules')
  })
}

/**
 * Handle ticket reopened event
 */
integration.handleTicketReopened = function (ticket) {
  winston.debug('Processing ticket:reopened event for notification rules')

  var context = integration.buildContext('ticket-reopened', { ticket: ticket })

  ruleEngine.processEvent('ticket-reopened', context, function (err, result) {
    if (err) {
      winston.error('Error processing ticket:reopened rules: ' + err.message)
      return
    }

    winston.debug('Processed ticket:reopened - Executed ' + result.executedRules + ' rules')
  })
}

/**
 * Handle comment added event
 */
integration.handleCommentAdded = function (ticket, comment, hostname) {
  winston.debug('Processing ticket:comment:added event for notification rules')

  var context = integration.buildContext('ticket-comment-added', {
    ticket: ticket,
    comment: comment,
    hostname: hostname
  })

  ruleEngine.processEvent('ticket-comment-added', context, function (err, result) {
    if (err) {
      winston.error('Error processing ticket:comment:added rules: ' + err.message)
      return
    }

    winston.debug('Processed ticket:comment:added - Executed ' + result.executedRules + ' rules')
  })
}

/**
 * Handle status changed event
 */
integration.handleStatusChanged = function (data) {
  winston.debug('Processing ticket:status:changed event for notification rules')

  var context = integration.buildContext('ticket-status-changed', data)

  ruleEngine.processEvent('ticket-status-changed', context, function (err, result) {
    if (err) {
      winston.error('Error processing ticket:status:changed rules: ' + err.message)
      return
    }

    winston.debug('Processed ticket:status:changed - Executed ' + result.executedRules + ' rules')
  })
}

/**
 * Handle priority changed event
 */
integration.handlePriorityChanged = function (data) {
  winston.debug('Processing ticket:priority:changed event for notification rules')

  var context = integration.buildContext('ticket-priority-changed', data)

  ruleEngine.processEvent('ticket-priority-changed', context, function (err, result) {
    if (err) {
      winston.error('Error processing ticket:priority:changed rules: ' + err.message)
      return
    }

    winston.debug('Processed ticket:priority:changed - Executed ' + result.executedRules + ' rules')
  })
}

/**
 * Build context object for rule evaluation
 * @param {String} eventType - Type of event
 * @param {Object} data - Event data
 * @returns {Object} Context object
 */
integration.buildContext = function (eventType, data) {
  var context = {
    eventType: eventType,
    timestamp: new Date()
  }

  // Add ticket data
  if (data.ticket) {
    context.ticket = data.ticket
  }

  // Add user data
  if (data.user) {
    context.user = data.user
  }

  // Add comment data
  if (data.comment) {
    context.comment = data.comment
  }

  // Add assignee data
  if (data.assignee) {
    context.assignee = data.assignee
  }

  // Add previous data for change detection
  if (data.previousData) {
    context.previousData = data.previousData
  }

  // Add hostname/baseUrl
  if (data.hostname) {
    context.baseUrl = data.hostname
  } else {
    // Fallback - get from settings
    settingsSchema.getSetting('gen:siteurl', function (err, setting) {
      if (!err && setting) {
        context.baseUrl = setting.value
      }
    })
  }

  // Add SLA data if available
  if (data.slaDeadline) {
    context.slaDeadline = data.slaDeadline
  }

  // Add meeting data if available
  if (data.meetingDate) {
    context.meetingDate = data.meetingDate
  }

  if (data.meetingDuration) {
    context.meetingDuration = data.meetingDuration
  }

  if (data.attendees) {
    context.attendees = data.attendees
  }

  return context
}

/**
 * Manually trigger rules for an event (for testing)
 * @param {String} eventType - Event type
 * @param {Object} context - Context data
 * @param {Function} callback - Callback function
 */
integration.triggerRules = function (eventType, context, callback) {
  winston.debug('Manually triggering rules for event: ' + eventType)

  ruleEngine.processEvent(eventType, context, function (err, result) {
    if (err) {
      winston.error('Error manually triggering rules: ' + err.message)
      return callback(err)
    }

    winston.debug('Manually triggered rules - Executed ' + result.executedRules + ' rules')
    callback(null, result)
  })
}

/**
 * Enable or disable rules integration
 * @param {Boolean} enabled - Enable or disable
 * @param {Function} callback - Callback function
 */
integration.setEnabled = function (enabled, callback) {
  settingsSchema.getSettingByName('notification:rules:enabled', function (err, setting) {
    if (err) return callback(err)

    if (!setting) {
      // Create setting
      var newSetting = new settingsSchema({
        name: 'notification:rules:enabled',
        value: enabled
      })

      newSetting.save(function (err) {
        if (err) return callback(err)

        winston.info('Notification rules ' + (enabled ? 'enabled' : 'disabled'))

        if (enabled) {
          integration.registerEventHandlers()
        }

        callback(null, { enabled: enabled })
      })
    } else {
      // Update setting
      setting.value = enabled
      setting.save(function (err) {
        if (err) return callback(err)

        winston.info('Notification rules ' + (enabled ? 'enabled' : 'disabled'))

        if (enabled) {
          integration.registerEventHandlers()
        }

        callback(null, { enabled: enabled })
      })
    }
  })
}

module.exports = integration
