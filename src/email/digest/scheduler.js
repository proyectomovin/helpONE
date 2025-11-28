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
 * Digest Scheduler
 * Sends digest emails on schedule (hourly, daily, weekly)
 */

var UserNotificationPreferences = require('../../models/userNotificationPreferences')
var DigestQueue = require('../../models/digestQueue')
var emailModule = require('../index')
var winston = require('../../logger')
var cron = require('node-cron')

var scheduler = {}
var scheduledJobs = {}

/**
 * Initialize digest scheduler
 */
scheduler.init = function () {
  winston.info('Initializing digest scheduler...')

  // Schedule hourly digest (every hour at :00)
  scheduledJobs.hourly = cron.schedule('0 * * * *', function () {
    winston.debug('Running hourly digest job')
    scheduler.processDigests('digest-hourly')
  })

  // Schedule daily digest (every day at 9:00 AM)
  scheduledJobs.daily = cron.schedule('0 9 * * *', function () {
    winston.debug('Running daily digest job')
    scheduler.processDigests('digest-daily')
  })

  // Schedule weekly digest (every Monday at 9:00 AM)
  scheduledJobs.weekly = cron.schedule('0 9 * * 1', function () {
    winston.debug('Running weekly digest job')
    scheduler.processDigests('digest-weekly')
  })

  // Clean up old processed items daily at midnight
  scheduledJobs.cleanup = cron.schedule('0 0 * * *', function () {
    winston.debug('Cleaning up old digest queue items')
    DigestQueue.clearOldProcessed(30, function (err, result) {
      if (err) {
        winston.error('Error cleaning up digest queue: ' + err.message)
      } else {
        winston.info('Cleaned up ' + result.deletedCount + ' old digest items')
      }
    })
  })

  winston.info('Digest scheduler initialized successfully')
}

/**
 * Process digests for a specific frequency
 * @param {String} frequency - Frequency (digest-hourly, digest-daily, digest-weekly)
 */
scheduler.processDigests = function (frequency) {
  winston.info('Processing ' + frequency + ' digests')

  UserNotificationPreferences.getUsersForDigest(frequency, function (err, users) {
    if (err) {
      winston.error('Error getting users for digest: ' + err.message)
      return
    }

    if (!users || users.length === 0) {
      winston.debug('No users configured for ' + frequency + ' digest')
      return
    }

    winston.info('Found ' + users.length + ' users for ' + frequency + ' digest')

    users.forEach(function (userPrefs) {
      if (!userPrefs.userId) {
        return
      }

      scheduler.sendDigestForUser(userPrefs.userId._id, userPrefs, function (err) {
        if (err) {
          winston.error('Error sending digest for user ' + userPrefs.userId._id + ': ' + err.message)
        }
      })
    })
  })
}

/**
 * Send digest email for a specific user
 * @param {String} userId - User ID
 * @param {Object} userPrefs - User preferences
 * @param {Function} callback - Callback function
 */
scheduler.sendDigestForUser = function (userId, userPrefs, callback) {
  winston.debug('Sending digest for user: ' + userId)

  // Get pending notifications from queue
  DigestQueue.getPendingForUser(userId, function (err, items) {
    if (err) {
      return callback(err)
    }

    if (!items || items.length === 0) {
      winston.debug('No pending notifications for user ' + userId)
      return callback(null)
    }

    winston.info('Processing ' + items.length + ' notifications for user ' + userId)

    // Group by ticket if preferences indicate
    var groupedData
    if (userPrefs.digestSettings && userPrefs.digestSettings.groupByTicket) {
      DigestQueue.getPendingGroupedByTicket(userId, function (err, grouped) {
        if (err) {
          winston.warn('Error grouping by ticket, using ungrouped: ' + err.message)
          groupedData = scheduler.buildDigestData(items, userPrefs)
        } else {
          groupedData = scheduler.buildGroupedDigestData(grouped, userPrefs)
        }

        scheduler.sendDigestEmail(userId, userPrefs.userId, groupedData, items, callback)
      })
    } else {
      groupedData = scheduler.buildDigestData(items, userPrefs)
      scheduler.sendDigestEmail(userId, userPrefs.userId, groupedData, items, callback)
    }
  })
}

/**
 * Build digest data from notifications
 * @param {Array} items - Queue items
 * @param {Object} userPrefs - User preferences
 * @returns {Object} Digest data
 */
scheduler.buildDigestData = function (items, userPrefs) {
  var settings = userPrefs.digestSettings || {}
  var maxItems = settings.maxItemsPerDigest || 50

  // Sort items
  var sortBy = settings.sortBy || 'date'
  items.sort(function (a, b) {
    switch (sortBy) {
      case 'priority':
        var priorities = { Low: 0, Normal: 1, High: 2, Critical: 3 }
        return priorities[b.priority] - priorities[a.priority]
      case 'ticket':
        return a.ticket - b.ticket
      default: // date
        return b.createdAt - a.createdAt
    }
  })

  // Limit items
  if (items.length > maxItems) {
    items = items.slice(0, maxItems)
  }

  // Build digest summary
  var summary = {
    totalNotifications: items.length,
    byEventType: {},
    byPriority: {}
  }

  items.forEach(function (item) {
    // Count by event type
    summary.byEventType[item.eventType] = (summary.byEventType[item.eventType] || 0) + 1

    // Count by priority
    if (item.priority) {
      summary.byPriority[item.priority] = (summary.byPriority[item.priority] || 0) + 1
    }
  })

  return {
    items: items,
    summary: summary,
    frequency: userPrefs.channels.email.frequency
  }
}

/**
 * Build grouped digest data
 * @param {Array} grouped - Grouped items
 * @param {Object} userPrefs - User preferences
 * @returns {Object} Digest data
 */
scheduler.buildGroupedDigestData = function (grouped, userPrefs) {
  var settings = userPrefs.digestSettings || {}
  var totalNotifications = 0

  grouped.forEach(function (group) {
    totalNotifications += group.count
  })

  return {
    groups: grouped,
    summary: {
      totalNotifications: totalNotifications,
      totalTickets: grouped.length
    },
    frequency: userPrefs.channels.email.frequency
  }
}

/**
 * Send digest email
 * @param {String} userId - User ID
 * @param {Object} user - User object
 * @param {Object} digestData - Digest data
 * @param {Array} items - Queue items (for marking as processed)
 * @param {Function} callback - Callback function
 */
scheduler.sendDigestEmail = function (userId, user, digestData, items, callback) {
  if (!user || !user.email) {
    winston.warn('User has no email address, skipping digest')
    return callback(null)
  }

  var templateData = {
    user: user,
    digest: digestData,
    generatedAt: new Date()
  }

  var emailOptions = {
    to: user.email,
    templateType: 'digest-' + digestData.frequency.replace('digest-', ''),
    data: templateData,
    userId: userId
  }

  emailModule.sendTemplateEmail(emailOptions, function (err, result) {
    if (err) {
      winston.error('Error sending digest email: ' + err.message)
      return callback(err)
    }

    winston.info('Digest email sent to ' + user.email)

    // Mark items as processed
    var itemIds = items.map(function (item) {
      return item._id
    })

    DigestQueue.markAsProcessed(itemIds, function (err) {
      if (err) {
        winston.error('Error marking digest items as processed: ' + err.message)
      }

      // Update user preferences stats
      UserNotificationPreferences.findOneAndUpdate(
        { userId: userId },
        {
          $set: {
            'stats.lastDigestSent': new Date()
          }
        }
      ).exec(function () {})

      callback(null, result)
    })
  })
}

/**
 * Stop all scheduled jobs
 */
scheduler.stop = function () {
  winston.info('Stopping digest scheduler')

  Object.keys(scheduledJobs).forEach(function (key) {
    if (scheduledJobs[key]) {
      scheduledJobs[key].stop()
    }
  })

  scheduledJobs = {}
}

/**
 * Manually trigger digest for a user (for testing)
 * @param {String} userId - User ID
 * @param {Function} callback - Callback function
 */
scheduler.triggerDigestForUser = function (userId, callback) {
  UserNotificationPreferences.getOrCreateForUser(userId, function (err, userPrefs) {
    if (err) {
      return callback(err)
    }

    scheduler.sendDigestForUser(userId, userPrefs, callback)
  })
}

module.exports = scheduler
