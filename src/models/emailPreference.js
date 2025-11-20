/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Updated:    11/20/24
 *  Copyright (c) 2014-2024. All rights reserved.
 */

const mongoose = require('mongoose')

const COLLECTION = 'emailpreferences'

/**
 * Email Preference Schema
 * @module models/emailPreference
 * @class EmailPreference
 *
 * @property {ObjectId} user User reference
 * @property {Object} notifications Notification preferences
 * @property {Boolean} notifications.ticketCreated Receive emails for new tickets created
 * @property {Boolean} notifications.ticketAssigned Receive emails for tickets assigned to me
 * @property {Boolean} notifications.ticketCommentAdded Receive emails for comments on tickets I follow
 * @property {Boolean} notifications.ticketUpdated Receive emails for updates on tickets I follow
 * @property {Boolean} notifications.ticketMentioned Receive emails when I'm mentioned in a comment
 * @property {Boolean} notifications.groupTicketCreated Receive emails for new tickets in my groups
 * @property {String} frequency Email frequency: 'immediate', 'disabled'
 * @property {Object} priorityOverride Priority-based overrides
 * @property {Boolean} priorityOverride.urgentImmediate Always send immediate for urgent tickets
 * @property {Boolean} priorityOverride.criticalImmediate Always send immediate for critical tickets
 * @property {Date} createdAt Creation timestamp
 * @property {Date} updatedAt Last update timestamp
 */
const emailPreferenceSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'accounts',
      required: true,
      unique: true,
      index: true
    },
    notifications: {
      ticketCreated: { type: Boolean, default: true },
      ticketAssigned: { type: Boolean, default: true },
      ticketCommentAdded: { type: Boolean, default: true },
      ticketUpdated: { type: Boolean, default: true },
      ticketMentioned: { type: Boolean, default: true },
      groupTicketCreated: { type: Boolean, default: true }
    },
    frequency: {
      type: String,
      enum: ['immediate', 'disabled'],
      default: 'immediate'
    },
    priorityOverride: {
      urgentImmediate: { type: Boolean, default: true },
      criticalImmediate: { type: Boolean, default: true }
    }
  },
  {
    timestamps: true,
    collection: COLLECTION
  }
)

/**
 * Get or create default preferences for a user
 * @static
 * @method getOrCreateForUser
 * @param {ObjectId} userId - User ID
 * @param {Function} callback - Callback function
 */
emailPreferenceSchema.statics.getOrCreateForUser = function (userId, callback) {
  const self = this
  self.findOne({ user: userId }, function (err, preference) {
    if (err) return callback(err)
    if (preference) return callback(null, preference)

    // Create default preferences
    const defaultPreference = new self({
      user: userId,
      notifications: {
        ticketCreated: true,
        ticketAssigned: true,
        ticketCommentAdded: true,
        ticketUpdated: true,
        ticketMentioned: true,
        groupTicketCreated: true
      },
      frequency: 'immediate',
      priorityOverride: {
        urgentImmediate: true,
        criticalImmediate: true
      }
    })

    defaultPreference.save(callback)
  })
}

/**
 * Check if user should receive email for a given notification type
 * @method shouldReceiveEmail
 * @param {String} notificationType - Type of notification (e.g., 'ticketCreated')
 * @param {Object} options - Additional options (priority, etc.)
 * @returns {Boolean} Whether the user should receive the email
 */
emailPreferenceSchema.methods.shouldReceiveEmail = function (notificationType, options = {}) {
  // If frequency is disabled, no emails
  if (this.frequency === 'disabled') {
    return false
  }

  // Check priority override
  if (options.priority) {
    const priorityName = options.priority.name ? options.priority.name.toLowerCase() : ''
    if (priorityName === 'urgent' && this.priorityOverride.urgentImmediate) {
      return true
    }
    if (priorityName === 'critical' && this.priorityOverride.criticalImmediate) {
      return true
    }
  }

  // Check notification type preference
  if (this.notifications[notificationType] !== undefined) {
    return this.notifications[notificationType]
  }

  // Default to true for unknown types (backward compatibility)
  return true
}

/**
 * Bulk check preferences for multiple users
 * @static
 * @method filterUsersForNotification
 * @param {Array} userIds - Array of user IDs
 * @param {String} notificationType - Type of notification
 * @param {Object} options - Additional options (priority, etc.)
 * @param {Function} callback - Callback function with filtered user IDs
 */
emailPreferenceSchema.statics.filterUsersForNotification = function (userIds, notificationType, options, callback) {
  const self = this

  if (!userIds || userIds.length === 0) {
    return callback(null, [])
  }

  // Get all preferences for these users
  self.find({ user: { $in: userIds } }, function (err, preferences) {
    if (err) return callback(err)

    // Create a map of userId -> preference
    const preferenceMap = {}
    preferences.forEach(pref => {
      preferenceMap[pref.user.toString()] = pref
    })

    // Filter users based on their preferences
    const filteredUserIds = userIds.filter(userId => {
      const userIdStr = userId.toString()
      const preference = preferenceMap[userIdStr]

      // If no preference exists, create default (all enabled)
      if (!preference) {
        return true // Default: send email
      }

      return preference.shouldReceiveEmail(notificationType, options)
    })

    callback(null, filteredUserIds)
  })
}

module.exports = mongoose.model('EmailPreference', emailPreferenceSchema, COLLECTION)
