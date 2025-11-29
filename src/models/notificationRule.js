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

var mongoose = require('mongoose')

var COLLECTION = 'notificationRules'

/**
 * Notification Rule Schema
 * Defines automation rules for email notifications based on events and conditions
 */
var notificationRuleSchema = mongoose.Schema({
  // Basic information
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },

  // Rule status
  isActive: { type: Boolean, default: true, index: true },
  priority: { type: Number, default: 100, index: true }, // Lower number = higher priority

  // Event trigger
  eventType: {
    type: String,
    required: true,
    enum: [
      'ticket-created',
      'ticket-updated',
      'ticket-assigned',
      'ticket-closed',
      'ticket-reopened',
      'ticket-comment-added',
      'ticket-status-changed',
      'ticket-priority-changed',
      'ticket-sla-warning',
      'ticket-sla-exceeded',
      'user-created',
      'user-login',
      'password-reset-requested',
      'scheduled-daily',
      'scheduled-weekly',
      'scheduled-monthly'
    ],
    index: true
  },

  // Conditions (IF)
  // All conditions must be met (AND logic)
  // Each condition group is OR logic
  conditions: {
    type: [{
      field: {
        type: String,
        required: true
        // Examples: 'ticket.priority.name', 'ticket.status.name', 'ticket.assignee', 'ticket.tags'
      },
      operator: {
        type: String,
        required: true,
        enum: [
          'equals',           // field === value
          'not_equals',       // field !== value
          'contains',         // field.includes(value)
          'not_contains',     // !field.includes(value)
          'starts_with',      // field.startsWith(value)
          'ends_with',        // field.endsWith(value)
          'greater_than',     // field > value
          'less_than',        // field < value
          'greater_or_equal', // field >= value
          'less_or_equal',    // field <= value
          'is_empty',         // !field || field.length === 0
          'is_not_empty',     // field && field.length > 0
          'in_list',          // value.includes(field)
          'not_in_list',      // !value.includes(field)
          'changed',          // field changed from previous value
          'changed_from',     // field changed from specific value
          'changed_to',       // field changed to specific value
          'matches_regex'     // field.match(value)
        ]
      },
      value: mongoose.Schema.Types.Mixed, // Can be string, number, array, etc.
      valueType: {
        type: String,
        enum: ['string', 'number', 'boolean', 'array', 'date', 'user', 'group'],
        default: 'string'
      }
    }],
    default: []
  },

  // Condition groups (OR logic between groups, AND within groups)
  conditionGroups: {
    type: [{
      operator: { type: String, enum: ['AND', 'OR'], default: 'AND' },
      conditions: [{
        field: String,
        operator: String,
        value: mongoose.Schema.Types.Mixed,
        valueType: String
      }]
    }],
    default: []
  },

  // Actions (THEN)
  // All actions will be executed
  actions: {
    type: [{
      type: {
        type: String,
        required: true,
        enum: [
          'send-email',
          'send-email-calendar',
          'assign-ticket',
          'add-tag',
          'remove-tag',
          'update-priority',
          'update-status',
          'add-comment',
          'create-task',
          'notify-user',
          'notify-group',
          'webhook',
          'delay'
        ]
      },

      // Email action config
      emailConfig: {
        templateType: String,    // 'ticket-assigned', 'ticket-sla-warning', etc.
        templateSlug: String,    // Custom template slug
        recipients: {
          type: String,
          enum: [
            'ticket-owner',
            'ticket-assignee',
            'ticket-group',
            'custom-users',
            'custom-groups',
            'custom-emails'
          ]
        },
        customRecipients: [String], // User IDs, group IDs, or email addresses
        includeCalendar: { type: Boolean, default: false },
        calendarType: { type: String, enum: ['sla', 'assignment', 'meeting'] }
      },

      // Ticket action config
      ticketConfig: {
        assigneeId: mongoose.Schema.Types.ObjectId,
        groupId: mongoose.Schema.Types.ObjectId,
        priorityId: mongoose.Schema.Types.ObjectId,
        statusId: mongoose.Schema.Types.ObjectId,
        tags: [String],
        comment: String,
        internalNote: { type: Boolean, default: false }
      },

      // Webhook action config
      webhookConfig: {
        url: String,
        method: { type: String, enum: ['GET', 'POST', 'PUT', 'PATCH'], default: 'POST' },
        headers: mongoose.Schema.Types.Mixed,
        body: mongoose.Schema.Types.Mixed,
        timeout: { type: Number, default: 5000 }
      },

      // Delay action config
      delayConfig: {
        duration: Number, // in minutes
        unit: { type: String, enum: ['minutes', 'hours', 'days'], default: 'minutes' }
      }
    }],
    default: []
  },

  // Schedule settings (for scheduled events)
  schedule: {
    enabled: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'cron'],
      default: 'daily'
    },
    time: String,        // HH:mm format
    dayOfWeek: Number,   // 0-6 (Sunday-Saturday)
    dayOfMonth: Number,  // 1-31
    cronExpression: String,
    timezone: { type: String, default: 'UTC' }
  },

  // Throttling (prevent spam)
  throttle: {
    enabled: { type: Boolean, default: false },
    maxExecutions: Number,     // Max executions per period
    period: Number,            // Period in minutes
    perTicket: { type: Boolean, default: false }, // Throttle per ticket or globally
    perUser: { type: Boolean, default: false }     // Throttle per user
  },

  // Execution tracking
  executionCount: { type: Number, default: 0 },
  lastExecutedAt: Date,
  lastExecutionStatus: {
    type: String,
    enum: ['success', 'failed', 'partial', 'skipped'],
    default: null
  },
  lastExecutionError: String,

  // Statistics
  stats: {
    totalExecutions: { type: Number, default: 0 },
    successfulExecutions: { type: Number, default: 0 },
    failedExecutions: { type: Number, default: 0 },
    skippedExecutions: { type: Number, default: 0 },
    averageExecutionTime: { type: Number, default: 0 }, // in milliseconds
    lastResetAt: Date
  },

  // Metadata
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'accounts' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'accounts' },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Indexes for performance
notificationRuleSchema.index({ isActive: 1, eventType: 1, priority: 1 })
notificationRuleSchema.index({ eventType: 1, createdAt: -1 })
notificationRuleSchema.index({ createdBy: 1 })
notificationRuleSchema.index({ lastExecutedAt: -1 })

// Pre-save middleware
notificationRuleSchema.pre('save', function (next) {
  this.updatedAt = Date.now()
  return next()
})

/**
 * Get active rules for an event type
 * @param {String} eventType - Event type to filter by
 * @param {Function} callback - Callback function
 */
notificationRuleSchema.statics.getActiveRulesForEvent = function (eventType, callback) {
  return this.find({
    isActive: true,
    eventType: eventType
  })
    .sort({ priority: 1 }) // Lower priority number executes first
    .exec(callback)
}

/**
 * Increment execution count
 */
notificationRuleSchema.methods.incrementExecutionCount = function (status, executionTime, error, callback) {
  this.executionCount += 1
  this.lastExecutedAt = new Date()
  this.lastExecutionStatus = status

  if (error) {
    this.lastExecutionError = error.message || error
  } else {
    this.lastExecutionError = null
  }

  // Update stats
  this.stats.totalExecutions += 1

  if (status === 'success') {
    this.stats.successfulExecutions += 1
  } else if (status === 'failed') {
    this.stats.failedExecutions += 1
  } else if (status === 'skipped') {
    this.stats.skippedExecutions += 1
  }

  // Update average execution time
  if (executionTime) {
    var totalTime = this.stats.averageExecutionTime * (this.stats.totalExecutions - 1)
    this.stats.averageExecutionTime = (totalTime + executionTime) / this.stats.totalExecutions
  }

  this.save(callback)
}

/**
 * Check if rule should be throttled
 * @param {Object} context - Context object (ticket, user, etc.)
 * @returns {Boolean} - True if should be throttled
 */
notificationRuleSchema.methods.shouldThrottle = function (context) {
  if (!this.throttle.enabled) {
    return false
  }

  // Calculate time window
  var windowStart = new Date()
  windowStart.setMinutes(windowStart.getMinutes() - this.throttle.period)

  // Check execution count in window
  // This is a simple check - in production you might want to store execution history
  if (this.lastExecutedAt && this.lastExecutedAt > windowStart) {
    if (this.executionCount >= this.throttle.maxExecutions) {
      return true
    }
  } else {
    // Reset counter if outside window
    this.executionCount = 0
  }

  return false
}

/**
 * Reset statistics
 */
notificationRuleSchema.methods.resetStats = function (callback) {
  this.stats = {
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    skippedExecutions: 0,
    averageExecutionTime: 0,
    lastResetAt: new Date()
  }
  this.executionCount = 0
  this.save(callback)
}

/**
 * Clone rule
 */
notificationRuleSchema.methods.clone = function (newName, callback) {
  var ruleData = this.toObject()
  delete ruleData._id
  delete ruleData.createdAt
  delete ruleData.updatedAt
  delete ruleData.executionCount
  delete ruleData.lastExecutedAt
  delete ruleData.lastExecutionStatus
  delete ruleData.stats

  ruleData.name = newName || (this.name + ' (Copy)')
  ruleData.isActive = false // New clones start inactive

  var newRule = new this.constructor(ruleData)
  newRule.save(callback)
}

/**
 * Get rules by creator
 */
notificationRuleSchema.statics.getByCreator = function (userId, callback) {
  return this.find({ createdBy: userId })
    .sort({ createdAt: -1 })
    .exec(callback)
}

/**
 * Get rule statistics summary
 */
notificationRuleSchema.statics.getStatsSummary = function (callback) {
  return this.aggregate([
    {
      $group: {
        _id: '$eventType',
        totalRules: { $sum: 1 },
        activeRules: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        totalExecutions: { $sum: '$stats.totalExecutions' },
        successfulExecutions: { $sum: '$stats.successfulExecutions' },
        failedExecutions: { $sum: '$stats.failedExecutions' }
      }
    },
    {
      $sort: { totalExecutions: -1 }
    }
  ]).exec(callback)
}

module.exports = mongoose.model(COLLECTION, notificationRuleSchema)
