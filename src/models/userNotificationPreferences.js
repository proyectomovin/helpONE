/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Updated:    2025-11-28
 *  Copyright (c) 2014-2025. All rights reserved.
 */

var mongoose = require('mongoose')

var COLLECTION = 'userNotificationPreferences'

/**
 * User Notification Preferences Schema
 * Stores individual user preferences for email and system notifications
 */
var userNotificationPreferencesSchema = mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'accounts',
    required: true,
    unique: true,
    index: true
  },

  // Global settings
  globalEnabled: { type: Boolean, default: true },
  doNotDisturb: { type: Boolean, default: false },

  // Notification channels
  channels: {
    email: {
      enabled: { type: Boolean, default: true },
      frequency: {
        type: String,
        enum: ['immediate', 'digest-hourly', 'digest-daily', 'digest-weekly'],
        default: 'immediate'
      },
      digestTime: { type: String, default: '09:00' } // HH:mm format
    },
    inApp: {
      enabled: { type: Boolean, default: true },
      playSound: { type: Boolean, default: true },
      showDesktopNotification: { type: Boolean, default: true }
    },
    sms: {
      enabled: { type: Boolean, default: false },
      phoneNumber: String,
      onlyUrgent: { type: Boolean, default: true }
    },
    push: {
      enabled: { type: Boolean, default: true },
      onlyUrgent: { type: Boolean, default: false }
    }
  },

  // Event type preferences
  // User can enable/disable specific notification types
  eventPreferences: {
    // Ticket events
    ticketCreated: {
      enabled: { type: Boolean, default: true },
      channels: [String], // Override global channels for this event
      onlyIfAssigned: { type: Boolean, default: false },
      onlyIfOwner: { type: Boolean, default: false },
      onlyIfSubscribed: { type: Boolean, default: false }
    },
    ticketAssigned: {
      enabled: { type: Boolean, default: true },
      channels: [String],
      onlyIfMe: { type: Boolean, default: true } // Only if assigned to me
    },
    ticketUpdated: {
      enabled: { type: Boolean, default: true },
      channels: [String],
      onlyIfParticipating: { type: Boolean, default: true }
    },
    ticketClosed: {
      enabled: { type: Boolean, default: true },
      channels: [String],
      onlyIfOwner: { type: Boolean, default: false },
      onlyIfAssigned: { type: Boolean, default: false }
    },
    ticketReopened: {
      enabled: { type: Boolean, default: true },
      channels: [String]
    },
    commentAdded: {
      enabled: { type: Boolean, default: true },
      channels: [String],
      onlyIfMentioned: { type: Boolean, default: false },
      onlyIfParticipating: { type: Boolean, default: true },
      excludeOwnComments: { type: Boolean, default: true }
    },
    statusChanged: {
      enabled: { type: Boolean, default: true },
      channels: [String],
      onlyIfParticipating: { type: Boolean, default: true }
    },
    priorityChanged: {
      enabled: { type: Boolean, default: true },
      channels: [String],
      onlyIfParticipating: { type: Boolean, default: true }
    },
    // SLA events
    slaWarning: {
      enabled: { type: Boolean, default: true },
      channels: [String],
      onlyIfAssigned: { type: Boolean, default: true }
    },
    slaExceeded: {
      enabled: { type: Boolean, default: true },
      channels: [String],
      onlyIfAssigned: { type: Boolean, default: true }
    },
    // User events
    mentioned: {
      enabled: { type: Boolean, default: true },
      channels: [String]
    },
    directMessage: {
      enabled: { type: Boolean, default: true },
      channels: [String]
    }
  },

  // Priority filters
  priorityFilter: {
    enabled: { type: Boolean, default: false },
    minimumPriority: {
      type: String,
      enum: ['Low', 'Normal', 'High', 'Critical'],
      default: 'Normal'
    }
  },

  // Group filters
  groupFilter: {
    enabled: { type: Boolean, default: false },
    includedGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'groups' }],
    excludedGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'groups' }]
  },

  // Tag filters
  tagFilter: {
    enabled: { type: Boolean, default: false },
    includedTags: [String],
    excludedTags: [String]
  },

  // Quiet hours (do not send notifications during these times)
  quietHours: {
    enabled: { type: Boolean, default: false },
    startTime: { type: String, default: '22:00' }, // HH:mm
    endTime: { type: String, default: '08:00' }, // HH:mm
    timezone: { type: String, default: 'UTC' },
    allowUrgent: { type: Boolean, default: true } // Allow urgent notifications even during quiet hours
  },

  // Vacation/OOO mode
  outOfOffice: {
    enabled: { type: Boolean, default: false },
    startDate: Date,
    endDate: Date,
    autoResponder: { type: Boolean, default: false },
    autoResponderMessage: String,
    forwardTo: { type: mongoose.Schema.Types.ObjectId, ref: 'accounts' }
  },

  // Digest settings
  digestSettings: {
    maxItemsPerDigest: { type: Number, default: 50 },
    groupByTicket: { type: Boolean, default: true },
    includeResolved: { type: Boolean, default: false },
    sortBy: {
      type: String,
      enum: ['date', 'priority', 'ticket'],
      default: 'date'
    }
  },

  // Notification batching (group multiple notifications)
  batching: {
    enabled: { type: Boolean, default: false },
    windowMinutes: { type: Number, default: 5 }, // Wait 5 minutes before sending batch
    maxBatchSize: { type: Number, default: 10 }
  },

  // Statistics
  stats: {
    totalNotificationsSent: { type: Number, default: 0 },
    totalNotificationsSkipped: { type: Number, default: 0 },
    lastNotificationSent: Date,
    lastDigestSent: Date,
    lastUpdated: Date
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Indexes
userNotificationPreferencesSchema.index({ userId: 1 })
userNotificationPreferencesSchema.index({ 'channels.email.frequency': 1 })

// Pre-save middleware
userNotificationPreferencesSchema.pre('save', function (next) {
  this.updatedAt = Date.now()
  this.stats.lastUpdated = Date.now()
  return next()
})

/**
 * Get preferences for a user, create default if doesn't exist
 * @param {String} userId - User ID
 * @param {Function} callback - Callback function
 */
userNotificationPreferencesSchema.statics.getOrCreateForUser = function (userId, callback) {
  this.findOne({ userId: userId }).exec(function (err, preferences) {
    if (err) return callback(err)

    if (preferences) {
      return callback(null, preferences)
    }

    // Create default preferences
    var defaultPreferences = new this({
      userId: userId
    })

    defaultPreferences.save(function (err, saved) {
      if (err) return callback(err)
      callback(null, saved)
    })
  })
}

/**
 * Check if user should receive notification for a specific event
 * @param {String} eventType - Event type
 * @param {Object} context - Notification context
 * @returns {Boolean} - True if should receive notification
 */
userNotificationPreferencesSchema.methods.shouldReceiveNotification = function (eventType, context) {
  // Global disable check
  if (!this.globalEnabled || this.doNotDisturb) {
    return false
  }

  // Out of office check
  if (this.outOfOffice.enabled) {
    var now = new Date()
    if (this.outOfOffice.startDate && this.outOfOffice.endDate) {
      if (now >= this.outOfOffice.startDate && now <= this.outOfOffice.endDate) {
        // Skip notification if OOO (unless it's urgent and allowed)
        if (!context.isUrgent || !this.outOfOffice.allowUrgent) {
          return false
        }
      }
    }
  }

  // Quiet hours check
  if (this.quietHours.enabled) {
    if (this.isInQuietHours()) {
      if (!context.isUrgent || !this.quietHours.allowUrgent) {
        return false
      }
    }
  }

  // Event type preference check
  var eventPref = this.getEventPreference(eventType)
  if (!eventPref || !eventPref.enabled) {
    return false
  }

  // Context-specific checks
  if (context.ticket) {
    // Priority filter
    if (this.priorityFilter.enabled) {
      if (!this.meetsMinimumPriority(context.ticket.priority)) {
        return false
      }
    }

    // Group filter
    if (this.groupFilter.enabled) {
      if (!this.isGroupAllowed(context.ticket.group)) {
        return false
      }
    }

    // Tag filter
    if (this.tagFilter.enabled) {
      if (!this.areTagsAllowed(context.ticket.tags)) {
        return false
      }
    }

    // Event-specific context checks
    if (eventPref.onlyIfAssigned && context.assigneeId) {
      if (context.assigneeId.toString() !== this.userId.toString()) {
        return false
      }
    }

    if (eventPref.onlyIfOwner && context.ticket.owner) {
      if (context.ticket.owner._id.toString() !== this.userId.toString()) {
        return false
      }
    }

    if (eventPref.onlyIfMe && context.assigneeId) {
      if (context.assigneeId.toString() !== this.userId.toString()) {
        return false
      }
    }

    if (eventPref.excludeOwnComments && context.commentAuthorId) {
      if (context.commentAuthorId.toString() === this.userId.toString()) {
        return false
      }
    }
  }

  return true
}

/**
 * Get event preference
 */
userNotificationPreferencesSchema.methods.getEventPreference = function (eventType) {
  var mapping = {
    'ticket-created': 'ticketCreated',
    'ticket-assigned': 'ticketAssigned',
    'ticket-updated': 'ticketUpdated',
    'ticket-closed': 'ticketClosed',
    'ticket-reopened': 'ticketReopened',
    'ticket-comment-added': 'commentAdded',
    'ticket-status-changed': 'statusChanged',
    'ticket-priority-changed': 'priorityChanged',
    'ticket-sla-warning': 'slaWarning',
    'ticket-sla-exceeded': 'slaExceeded'
  }

  var prefKey = mapping[eventType]
  if (prefKey && this.eventPreferences[prefKey]) {
    return this.eventPreferences[prefKey]
  }

  return null
}

/**
 * Check if in quiet hours
 */
userNotificationPreferencesSchema.methods.isInQuietHours = function () {
  if (!this.quietHours.enabled) {
    return false
  }

  var now = new Date()
  var currentTime = now.getHours() * 60 + now.getMinutes()

  var start = this.parseTime(this.quietHours.startTime)
  var end = this.parseTime(this.quietHours.endTime)

  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (start > end) {
    return currentTime >= start || currentTime < end
  } else {
    return currentTime >= start && currentTime < end
  }
}

/**
 * Parse time string (HH:mm) to minutes
 */
userNotificationPreferencesSchema.methods.parseTime = function (timeStr) {
  if (!timeStr) return 0
  var parts = timeStr.split(':')
  return parseInt(parts[0]) * 60 + parseInt(parts[1])
}

/**
 * Check if priority meets minimum
 */
userNotificationPreferencesSchema.methods.meetsMinimumPriority = function (ticketPriority) {
  if (!ticketPriority || !ticketPriority.name) return true

  var priorities = ['Low', 'Normal', 'High', 'Critical']
  var ticketLevel = priorities.indexOf(ticketPriority.name)
  var minLevel = priorities.indexOf(this.priorityFilter.minimumPriority)

  return ticketLevel >= minLevel
}

/**
 * Check if group is allowed
 */
userNotificationPreferencesSchema.methods.isGroupAllowed = function (ticketGroup) {
  if (!ticketGroup || !ticketGroup._id) return true

  var groupId = ticketGroup._id.toString()

  // Check excluded groups
  if (this.groupFilter.excludedGroups && this.groupFilter.excludedGroups.length > 0) {
    var isExcluded = this.groupFilter.excludedGroups.some(function (g) {
      return g.toString() === groupId
    })
    if (isExcluded) return false
  }

  // Check included groups (if specified, only these groups are allowed)
  if (this.groupFilter.includedGroups && this.groupFilter.includedGroups.length > 0) {
    var isIncluded = this.groupFilter.includedGroups.some(function (g) {
      return g.toString() === groupId
    })
    return isIncluded
  }

  return true
}

/**
 * Check if tags are allowed
 */
userNotificationPreferencesSchema.methods.areTagsAllowed = function (ticketTags) {
  if (!ticketTags || ticketTags.length === 0) return true

  // Check excluded tags
  if (this.tagFilter.excludedTags && this.tagFilter.excludedTags.length > 0) {
    var hasExcluded = ticketTags.some(function (tag) {
      return this.tagFilter.excludedTags.includes(tag)
    }.bind(this))
    if (hasExcluded) return false
  }

  // Check included tags (if specified, at least one must match)
  if (this.tagFilter.includedTags && this.tagFilter.includedTags.length > 0) {
    var hasIncluded = ticketTags.some(function (tag) {
      return this.tagFilter.includedTags.includes(tag)
    }.bind(this))
    return hasIncluded
  }

  return true
}

/**
 * Get preferred channels for an event
 */
userNotificationPreferencesSchema.methods.getPreferredChannels = function (eventType) {
  var eventPref = this.getEventPreference(eventType)

  // If event has custom channels, use those
  if (eventPref && eventPref.channels && eventPref.channels.length > 0) {
    return eventPref.channels
  }

  // Otherwise, return all enabled channels
  var channels = []
  if (this.channels.email.enabled) channels.push('email')
  if (this.channels.inApp.enabled) channels.push('inApp')
  if (this.channels.sms.enabled) channels.push('sms')
  if (this.channels.push.enabled) channels.push('push')

  return channels
}

/**
 * Increment notification counter
 */
userNotificationPreferencesSchema.methods.incrementNotificationsSent = function (callback) {
  this.stats.totalNotificationsSent += 1
  this.stats.lastNotificationSent = new Date()
  this.save(callback)
}

/**
 * Increment skipped counter
 */
userNotificationPreferencesSchema.methods.incrementNotificationsSkipped = function (callback) {
  this.stats.totalNotificationsSkipped += 1
  this.save(callback)
}

/**
 * Get users who should receive digest
 */
userNotificationPreferencesSchema.statics.getUsersForDigest = function (frequency, callback) {
  var query = {
    globalEnabled: true,
    'channels.email.enabled': true,
    'channels.email.frequency': frequency
  }

  this.find(query)
    .populate('userId', 'fullname email')
    .exec(callback)
}

module.exports = mongoose.model(COLLECTION, userNotificationPreferencesSchema)
