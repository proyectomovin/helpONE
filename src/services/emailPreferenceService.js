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

const EmailPreference = require('../models/emailPreference')

/**
 * Email Preference Service
 * Handles email preference management
 */
class EmailPreferenceService {
  /**
   * Get preferences for a user (creates default if not exists)
   * @param {ObjectId} userId - User ID
   * @returns {Promise<Object>} Email preferences
   */
  static async getPreferences(userId) {
    return new Promise((resolve, reject) => {
      EmailPreference.getOrCreateForUser(userId, (err, preferences) => {
        if (err) return reject(err)
        resolve(preferences)
      })
    })
  }

  /**
   * Update preferences for a user
   * @param {ObjectId} userId - User ID
   * @param {Object} updates - Preference updates
   * @returns {Promise<Object>} Updated preferences
   */
  static async updatePreferences(userId, updates) {
    return new Promise((resolve, reject) => {
      EmailPreference.findOneAndUpdate(
        { user: userId },
        { $set: updates },
        { new: true, upsert: true, runValidators: true },
        (err, preferences) => {
          if (err) return reject(err)
          resolve(preferences)
        }
      )
    })
  }

  /**
   * Filter users based on their email preferences
   * @param {Array} userIds - Array of user IDs
   * @param {String} notificationType - Type of notification
   * @param {Object} options - Additional options (priority, etc.)
   * @returns {Promise<Array>} Filtered array of user IDs
   */
  static async filterUsersByPreferences(userIds, notificationType, options = {}) {
    return new Promise((resolve, reject) => {
      EmailPreference.filterUsersForNotification(userIds, notificationType, options, (err, filteredIds) => {
        if (err) return reject(err)
        resolve(filteredIds)
      })
    })
  }

  /**
   * Check if a specific user should receive an email
   * @param {ObjectId} userId - User ID
   * @param {String} notificationType - Type of notification
   * @param {Object} options - Additional options (priority, etc.)
   * @returns {Promise<Boolean>} Whether user should receive email
   */
  static async shouldUserReceiveEmail(userId, notificationType, options = {}) {
    try {
      const preferences = await this.getPreferences(userId)
      return preferences.shouldReceiveEmail(notificationType, options)
    } catch (error) {
      // On error, default to sending email (backward compatibility)
      console.error('Error checking email preferences:', error)
      return true
    }
  }

  /**
   * Reset preferences to default for a user
   * @param {ObjectId} userId - User ID
   * @returns {Promise<Object>} Reset preferences
   */
  static async resetToDefault(userId) {
    const defaultPreferences = {
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
    }

    return this.updatePreferences(userId, defaultPreferences)
  }

  /**
   * Bulk get preferences for multiple users
   * @param {Array} userIds - Array of user IDs
   * @returns {Promise<Object>} Map of userId -> preferences
   */
  static async getBulkPreferences(userIds) {
    return new Promise((resolve, reject) => {
      EmailPreference.find({ user: { $in: userIds } }, (err, preferences) => {
        if (err) return reject(err)

        const preferenceMap = {}
        preferences.forEach(pref => {
          preferenceMap[pref.user.toString()] = pref
        })

        resolve(preferenceMap)
      })
    })
  }

  /**
   * Delete preferences for a user
   * @param {ObjectId} userId - User ID
   * @returns {Promise<void>}
   */
  static async deletePreferences(userId) {
    return new Promise((resolve, reject) => {
      EmailPreference.deleteOne({ user: userId }, err => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  /**
   * Get notification type based on context
   * Helps map events to preference keys
   * @param {String} eventType - Event type from emitter
   * @returns {String} Notification preference key
   */
  static getNotificationTypeForEvent(eventType) {
    const eventMap = {
      'ticket:created': 'ticketCreated',
      'ticket:comment:added': 'ticketCommentAdded',
      'ticket:updated': 'ticketUpdated',
      'group:ticket:created': 'groupTicketCreated',
      'ticket:assigned': 'ticketAssigned'
    }

    return eventMap[eventType] || 'ticketCreated'
  }
}

module.exports = EmailPreferenceService
