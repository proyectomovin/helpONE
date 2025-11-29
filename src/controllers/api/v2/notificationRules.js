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

var NotificationRule = require('../../../models/notificationRule')
var ruleEngine = require('../../../email/rules/engine')
var conditionsHelper = require('../../../email/rules/conditions')
var actionsHelper = require('../../../email/rules/actions')
var apiUtils = require('../apiUtils')

var notificationRulesApi = {}

/**
 * GET /api/v2/notification-rules
 * Get all notification rules with optional filters
 */
notificationRulesApi.list = function (req, res) {
  var query = {}

  // Filter by active status
  if (req.query.isActive !== undefined) {
    query.isActive = req.query.isActive === 'true'
  }

  // Filter by event type
  if (req.query.eventType) {
    query.eventType = req.query.eventType
  }

  // Filter by creator
  if (req.query.createdBy) {
    query.createdBy = req.query.createdBy
  }

  NotificationRule.find(query)
    .sort({ priority: 1, createdAt: -1 })
    .populate('createdBy', 'fullname email')
    .populate('updatedBy', 'fullname email')
    .exec(function (err, rules) {
      if (err) {
        return apiUtils.sendApiError(res, 500, err.message)
      }

      return apiUtils.sendApiSuccess(res, {
        rules: rules,
        total: rules.length
      })
    })
}

/**
 * GET /api/v2/notification-rules/:id
 * Get a single notification rule by ID
 */
notificationRulesApi.get = function (req, res) {
  var ruleId = req.params.id

  NotificationRule.findById(ruleId)
    .populate('createdBy', 'fullname email')
    .populate('updatedBy', 'fullname email')
    .exec(function (err, rule) {
      if (err) {
        return apiUtils.sendApiError(res, 500, err.message)
      }

      if (!rule) {
        return apiUtils.sendApiError(res, 404, 'Rule not found')
      }

      return apiUtils.sendApiSuccess(res, { rule: rule })
    })
}

/**
 * POST /api/v2/notification-rules
 * Create a new notification rule
 */
notificationRulesApi.create = function (req, res) {
  var ruleData = req.body

  // Validate rule
  var validation = ruleEngine.validateRule(ruleData)
  if (!validation.valid) {
    return apiUtils.sendApiError(res, 400, 'Validation failed', validation.errors)
  }

  // Set creator
  if (req.user && req.user._id) {
    ruleData.createdBy = req.user._id
    ruleData.updatedBy = req.user._id
  }

  var rule = new NotificationRule(ruleData)

  rule.save(function (err, savedRule) {
    if (err) {
      if (err.name === 'ValidationError') {
        var errors = Object.keys(err.errors).map(function (key) {
          return err.errors[key].message
        })
        return apiUtils.sendApiError(res, 400, 'Validation failed', errors)
      }
      return apiUtils.sendApiError(res, 500, err.message)
    }

    return apiUtils.sendApiSuccess(res, {
      rule: savedRule,
      message: 'Notification rule created successfully'
    })
  })
}

/**
 * PUT /api/v2/notification-rules/:id
 * Update an existing notification rule
 */
notificationRulesApi.update = function (req, res) {
  var ruleId = req.params.id
  var updateData = req.body

  // Validate rule
  var validation = ruleEngine.validateRule(updateData)
  if (!validation.valid) {
    return apiUtils.sendApiError(res, 400, 'Validation failed', validation.errors)
  }

  NotificationRule.findById(ruleId).exec(function (err, rule) {
    if (err) {
      return apiUtils.sendApiError(res, 500, err.message)
    }

    if (!rule) {
      return apiUtils.sendApiError(res, 404, 'Rule not found')
    }

    // Update fields
    var allowedFields = [
      'name', 'description', 'isActive', 'priority', 'eventType',
      'conditions', 'conditionGroups', 'actions', 'schedule',
      'throttle'
    ]

    allowedFields.forEach(function (field) {
      if (updateData[field] !== undefined) {
        rule[field] = updateData[field]
      }
    })

    // Set updater
    if (req.user && req.user._id) {
      rule.updatedBy = req.user._id
    }

    rule.save(function (err, savedRule) {
      if (err) {
        if (err.name === 'ValidationError') {
          var errors = Object.keys(err.errors).map(function (key) {
            return err.errors[key].message
          })
          return apiUtils.sendApiError(res, 400, 'Validation failed', errors)
        }
        return apiUtils.sendApiError(res, 500, err.message)
      }

      return apiUtils.sendApiSuccess(res, {
        rule: savedRule,
        message: 'Notification rule updated successfully'
      })
    })
  })
}

/**
 * DELETE /api/v2/notification-rules/:id
 * Delete a notification rule
 */
notificationRulesApi.delete = function (req, res) {
  var ruleId = req.params.id

  NotificationRule.findByIdAndRemove(ruleId).exec(function (err, rule) {
    if (err) {
      return apiUtils.sendApiError(res, 500, err.message)
    }

    if (!rule) {
      return apiUtils.sendApiError(res, 404, 'Rule not found')
    }

    return apiUtils.sendApiSuccess(res, {
      message: 'Notification rule deleted successfully'
    })
  })
}

/**
 * POST /api/v2/notification-rules/:id/toggle
 * Toggle rule active status
 */
notificationRulesApi.toggle = function (req, res) {
  var ruleId = req.params.id

  NotificationRule.findById(ruleId).exec(function (err, rule) {
    if (err) {
      return apiUtils.sendApiError(res, 500, err.message)
    }

    if (!rule) {
      return apiUtils.sendApiError(res, 404, 'Rule not found')
    }

    rule.isActive = !rule.isActive

    if (req.user && req.user._id) {
      rule.updatedBy = req.user._id
    }

    rule.save(function (err, savedRule) {
      if (err) {
        return apiUtils.sendApiError(res, 500, err.message)
      }

      return apiUtils.sendApiSuccess(res, {
        rule: savedRule,
        message: 'Rule ' + (savedRule.isActive ? 'activated' : 'deactivated') + ' successfully'
      })
    })
  })
}

/**
 * POST /api/v2/notification-rules/:id/clone
 * Clone an existing rule
 */
notificationRulesApi.clone = function (req, res) {
  var ruleId = req.params.id
  var newName = req.body.name

  NotificationRule.findById(ruleId).exec(function (err, rule) {
    if (err) {
      return apiUtils.sendApiError(res, 500, err.message)
    }

    if (!rule) {
      return apiUtils.sendApiError(res, 404, 'Rule not found')
    }

    rule.clone(newName, function (err, newRule) {
      if (err) {
        return apiUtils.sendApiError(res, 500, err.message)
      }

      // Set creator
      if (req.user && req.user._id) {
        newRule.createdBy = req.user._id
        newRule.updatedBy = req.user._id
        newRule.save(function (err, savedRule) {
          if (err) {
            return apiUtils.sendApiError(res, 500, err.message)
          }

          return apiUtils.sendApiSuccess(res, {
            rule: savedRule,
            message: 'Rule cloned successfully'
          })
        })
      } else {
        return apiUtils.sendApiSuccess(res, {
          rule: newRule,
          message: 'Rule cloned successfully'
        })
      }
    })
  })
}

/**
 * POST /api/v2/notification-rules/:id/test
 * Test a rule with sample data
 */
notificationRulesApi.test = function (req, res) {
  var ruleId = req.params.id
  var testContext = req.body.context || {}

  // Add default test data if not provided
  if (!testContext.ticket) {
    testContext.ticket = {
      uid: 12345,
      subject: 'Test Ticket',
      issue: 'This is a test ticket description',
      status: { name: 'Open' },
      priority: { name: 'High' },
      type: { name: 'Incident' },
      group: { name: 'IT Support' },
      assignee: {
        fullname: 'John Doe',
        email: 'john.doe@example.com'
      },
      owner: {
        fullname: 'Jane Smith',
        email: 'jane.smith@example.com'
      },
      tags: ['urgent', 'customer-facing'],
      date: new Date(),
      updated: new Date()
    }
  }

  if (!testContext.user) {
    testContext.user = {
      fullname: 'Test User',
      email: 'test.user@example.com',
      role: 'agent'
    }
  }

  if (!testContext.baseUrl) {
    testContext.baseUrl = req.protocol + '://' + req.get('host')
  }

  ruleEngine.testRule(ruleId, testContext, function (err, result) {
    if (err) {
      return apiUtils.sendApiError(res, 500, err.message)
    }

    return apiUtils.sendApiSuccess(res, {
      test: result,
      message: 'Rule test completed'
    })
  })
}

/**
 * POST /api/v2/notification-rules/:id/reset-stats
 * Reset rule statistics
 */
notificationRulesApi.resetStats = function (req, res) {
  var ruleId = req.params.id

  NotificationRule.findById(ruleId).exec(function (err, rule) {
    if (err) {
      return apiUtils.sendApiError(res, 500, err.message)
    }

    if (!rule) {
      return apiUtils.sendApiError(res, 404, 'Rule not found')
    }

    rule.resetStats(function (err) {
      if (err) {
        return apiUtils.sendApiError(res, 500, err.message)
      }

      return apiUtils.sendApiSuccess(res, {
        message: 'Rule statistics reset successfully'
      })
    })
  })
}

/**
 * GET /api/v2/notification-rules/stats/summary
 * Get overall statistics summary
 */
notificationRulesApi.statsSummary = function (req, res) {
  NotificationRule.getStatsSummary(function (err, stats) {
    if (err) {
      return apiUtils.sendApiError(res, 500, err.message)
    }

    return apiUtils.sendApiSuccess(res, {
      stats: stats
    })
  })
}

/**
 * GET /api/v2/notification-rules/config/fields
 * Get available fields for conditions
 */
notificationRulesApi.getAvailableFields = function (req, res) {
  var fields = conditionsHelper.getAvailableFields()

  return apiUtils.sendApiSuccess(res, {
    fields: fields
  })
}

/**
 * GET /api/v2/notification-rules/config/operators
 * Get available operators for a field type
 */
notificationRulesApi.getOperators = function (req, res) {
  var fieldType = req.query.fieldType || 'string'
  var operators = conditionsHelper.getOperatorsForFieldType(fieldType)

  return apiUtils.sendApiSuccess(res, {
    operators: operators
  })
}

/**
 * GET /api/v2/notification-rules/config/actions
 * Get available actions
 */
notificationRulesApi.getAvailableActions = function (req, res) {
  var actions = actionsHelper.getAvailableActions()

  return apiUtils.sendApiSuccess(res, {
    actions: actions
  })
}

/**
 * GET /api/v2/notification-rules/config/event-types
 * Get available event types
 */
notificationRulesApi.getEventTypes = function (req, res) {
  var eventTypes = [
    { value: 'ticket-created', label: 'Ticket Created', category: 'Ticket' },
    { value: 'ticket-updated', label: 'Ticket Updated', category: 'Ticket' },
    { value: 'ticket-assigned', label: 'Ticket Assigned', category: 'Ticket' },
    { value: 'ticket-closed', label: 'Ticket Closed', category: 'Ticket' },
    { value: 'ticket-reopened', label: 'Ticket Reopened', category: 'Ticket' },
    { value: 'ticket-comment-added', label: 'Comment Added', category: 'Ticket' },
    { value: 'ticket-status-changed', label: 'Status Changed', category: 'Ticket' },
    { value: 'ticket-priority-changed', label: 'Priority Changed', category: 'Ticket' },
    { value: 'ticket-sla-warning', label: 'SLA Warning', category: 'SLA' },
    { value: 'ticket-sla-exceeded', label: 'SLA Exceeded', category: 'SLA' },
    { value: 'user-created', label: 'User Created', category: 'User' },
    { value: 'user-login', label: 'User Login', category: 'User' },
    { value: 'password-reset-requested', label: 'Password Reset', category: 'User' },
    { value: 'scheduled-daily', label: 'Daily Schedule', category: 'Scheduled' },
    { value: 'scheduled-weekly', label: 'Weekly Schedule', category: 'Scheduled' },
    { value: 'scheduled-monthly', label: 'Monthly Schedule', category: 'Scheduled' }
  ]

  return apiUtils.sendApiSuccess(res, {
    eventTypes: eventTypes
  })
}

/**
 * POST /api/v2/notification-rules/validate
 * Validate rule configuration without saving
 */
notificationRulesApi.validate = function (req, res) {
  var ruleData = req.body

  var validation = ruleEngine.validateRule(ruleData)

  if (validation.valid) {
    return apiUtils.sendApiSuccess(res, {
      valid: true,
      message: 'Rule configuration is valid'
    })
  } else {
    return apiUtils.sendApiSuccess(res, {
      valid: false,
      errors: validation.errors
    })
  }
}

module.exports = notificationRulesApi
