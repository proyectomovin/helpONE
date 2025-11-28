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

/**
 * Notification Preferences Manager
 * Manages user notification preferences and filtering
 */

var UserNotificationPreferences = require('../../models/userNotificationPreferences')
var winston = require('../../logger')

var preferencesManager = {}

/**
 * Check if user should receive notification
 * @param {String} userId - User ID
 * @param {String} eventType - Event type
 * @param {Object} context - Notification context
 * @param {Function} callback - Callback function
 */
preferencesManager.shouldReceiveNotification = function (userId, eventType, context, callback) {
  if (!userId) {
    return callback(null, true) // Default to send if no user specified
  }

  UserNotificationPreferences.getOrCreateForUser(userId, function (err, preferences) {
    if (err) {
      winston.error('Error getting user preferences: ' + err.message)
      return callback(null, true) // Default to send on error
    }

    var shouldReceive = preferences.shouldReceiveNotification(eventType, context)

    if (!shouldReceive) {
      winston.debug('User ' + userId + ' should not receive ' + eventType + ' notification')
      preferences.incrementNotificationsSkipped(function () {})
    }

    callback(null, shouldReceive)
  })
}

/**
 * Filter recipients based on preferences
 * @param {Array} recipients - Array of recipient user IDs or emails
 * @param {String} eventType - Event type
 * @param {Object} context - Notification context
 * @param {Function} callback - Callback function
 */
preferencesManager.filterRecipients = function (recipients, eventType, context, callback) {
  if (!recipients || recipients.length === 0) {
    return callback(null, [])
  }

  var filteredRecipients = []
  var checkCount = 0

  recipients.forEach(function (recipient) {
    // If recipient is an email string, include it (can't check preferences)
    if (typeof recipient === 'string' && recipient.includes('@')) {
      filteredRecipients.push(recipient)
      checkCount++

      if (checkCount === recipients.length) {
        callback(null, filteredRecipients)
      }
      return
    }

    // Get user ID from recipient object or string
    var userId = recipient._id || recipient.id || recipient

    preferencesManager.shouldReceiveNotification(userId, eventType, context, function (err, should) {
      if (should) {
        filteredRecipients.push(recipient)
      }

      checkCount++
      if (checkCount === recipients.length) {
        callback(null, filteredRecipients)
      }
    })
  })
}

/**
 * Get preferred channels for user
 * @param {String} userId - User ID
 * @param {String} eventType - Event type
 * @param {Function} callback - Callback function
 */
preferencesManager.getPreferredChannels = function (userId, eventType, callback) {
  UserNotificationPreferences.getOrCreateForUser(userId, function (err, preferences) {
    if (err) {
      winston.error('Error getting user preferences: ' + err.message)
      return callback(null, ['email']) // Default to email
    }

    var channels = preferences.getPreferredChannels(eventType)
    callback(null, channels)
  })
}

/**
 * Get email frequency for user
 * @param {String} userId - User ID
 * @param {Function} callback - Callback function
 */
preferencesManager.getEmailFrequency = function (userId, callback) {
  UserNotificationPreferences.getOrCreateForUser(userId, function (err, preferences) {
    if (err) {
      winston.error('Error getting user preferences: ' + err.message)
      return callback(null, 'immediate')
    }

    callback(null, preferences.channels.email.frequency)
  })
}

/**
 * Queue notification for digest
 * @param {String} userId - User ID
 * @param {String} eventType - Event type
 * @param {Object} data - Notification data
 * @param {Function} callback - Callback function
 */
preferencesManager.queueForDigest = function (userId, eventType, data, callback) {
  var DigestQueue = require('../../models/digestQueue')

  var queueItem = new DigestQueue({
    userId: userId,
    eventType: eventType,
    data: data,
    createdAt: new Date()
  })

  queueItem.save(function (err) {
    if (err) {
      winston.error('Error queuing notification for digest: ' + err.message)
      return callback(err)
    }

    winston.debug('Queued notification for user ' + userId + ' digest')
    callback(null, queueItem)
  })
}

/**
 * Check if notification should be batched
 * @param {String} userId - User ID
 * @param {Function} callback - Callback function
 */
preferencesManager.shouldBatchNotification = function (userId, callback) {
  UserNotificationPreferences.getOrCreateForUser(userId, function (err, preferences) {
    if (err) {
      return callback(null, false)
    }

    callback(null, preferences.batching.enabled)
  })
}

/**
 * Get batching window for user
 * @param {String} userId - User ID
 * @param {Function} callback - Callback function
 */
preferencesManager.getBatchingWindow = function (userId, callback) {
  UserNotificationPreferences.getOrCreateForUser(userId, function (err, preferences) {
    if (err) {
      return callback(null, 5) // Default 5 minutes
    }

    callback(null, preferences.batching.windowMinutes)
  })
}

/**
 * Check if user is in quiet hours
 * @param {String} userId - User ID
 * @param {Function} callback - Callback function
 */
preferencesManager.isInQuietHours = function (userId, callback) {
  UserNotificationPreferences.getOrCreateForUser(userId, function (err, preferences) {
    if (err) {
      return callback(null, false)
    }

    callback(null, preferences.isInQuietHours())
  })
}

/**
 * Check if user is out of office
 * @param {String} userId - User ID
 * @param {Function} callback - Callback function
 */
preferencesManager.isOutOfOffice = function (userId, callback) {
  UserNotificationPreferences.getOrCreateForUser(userId, function (err, preferences) {
    if (err) {
      return callback(null, false)
    }

    if (!preferences.outOfOffice.enabled) {
      return callback(null, false)
    }

    var now = new Date()
    var isOOO = now >= preferences.outOfOffice.startDate && now <= preferences.outOfOffice.endDate

    callback(null, isOOO, preferences.outOfOffice)
  })
}

/**
 * Get OOO auto-responder settings
 * @param {String} userId - User ID
 * @param {Function} callback - Callback function
 */
preferencesManager.getAutoResponder = function (userId, callback) {
  UserNotificationPreferences.getOrCreateForUser(userId, function (err, preferences) {
    if (err) {
      return callback(null, null)
    }

    if (!preferences.outOfOffice.enabled || !preferences.outOfOffice.autoResponder) {
      return callback(null, null)
    }

    callback(null, {
      message: preferences.outOfOffice.autoResponderMessage,
      forwardTo: preferences.outOfOffice.forwardTo
    })
  })
}

/**
 * Update user preferences
 * @param {String} userId - User ID
 * @param {Object} updates - Preference updates
 * @param {Function} callback - Callback function
 */
preferencesManager.updatePreferences = function (userId, updates, callback) {
  UserNotificationPreferences.getOrCreateForUser(userId, function (err, preferences) {
    if (err) {
      return callback(err)
    }

    // Update allowed fields
    var allowedUpdates = [
      'globalEnabled',
      'doNotDisturb',
      'channels',
      'eventPreferences',
      'priorityFilter',
      'groupFilter',
      'tagFilter',
      'quietHours',
      'outOfOffice',
      'digestSettings',
      'batching'
    ]

    allowedUpdates.forEach(function (field) {
      if (updates[field] !== undefined) {
        preferences[field] = updates[field]
      }
    })

    preferences.save(function (err, saved) {
      if (err) {
        winston.error('Error saving preferences: ' + err.message)
        return callback(err)
      }

      winston.debug('Updated preferences for user ' + userId)
      callback(null, saved)
    })
  })
}

/**
 * Reset preferences to default
 * @param {String} userId - User ID
 * @param {Function} callback - Callback function
 */
preferencesManager.resetToDefaults = function (userId, callback) {
  UserNotificationPreferences.findOneAndRemove({ userId: userId }).exec(function (err) {
    if (err) {
      return callback(err)
    }

    // Create new default preferences
    UserNotificationPreferences.getOrCreateForUser(userId, callback)
  })
}

/**
 * Get notification statistics for user
 * @param {String} userId - User ID
 * @param {Function} callback - Callback function
 */
preferencesManager.getStatistics = function (userId, callback) {
  UserNotificationPreferences.getOrCreateForUser(userId, function (err, preferences) {
    if (err) {
      return callback(err)
    }

    callback(null, preferences.stats)
  })
}

/**
 * Increment notification sent counter
 * @param {String} userId - User ID
 * @param {Function} callback - Callback function
 */
preferencesManager.incrementNotificationsSent = function (userId, callback) {
  UserNotificationPreferences.getOrCreateForUser(userId, function (err, preferences) {
    if (err) {
      winston.error('Error incrementing notifications sent: ' + err.message)
      return callback ? callback(err) : null
    }

    preferences.incrementNotificationsSent(callback)
  })
}

/**
 * Export preferences
 * @param {String} userId - User ID
 * @param {Function} callback - Callback function
 */
preferencesManager.exportPreferences = function (userId, callback) {
  UserNotificationPreferences.getOrCreateForUser(userId, function (err, preferences) {
    if (err) {
      return callback(err)
    }

    var exported = preferences.toObject()
    delete exported._id
    delete exported.__v
    delete exported.stats

    callback(null, exported)
  })
}

/**
 * Import preferences
 * @param {String} userId - User ID
 * @param {Object} importData - Preference data to import
 * @param {Function} callback - Callback function
 */
preferencesManager.importPreferences = function (userId, importData, callback) {
  delete importData.userId
  delete importData._id
  delete importData.stats

  preferencesManager.updatePreferences(userId, importData, callback)
}

module.exports = preferencesManager
