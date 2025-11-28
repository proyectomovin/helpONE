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

var UserNotificationPreferences = require('../../../models/userNotificationPreferences')
var preferencesManager = require('../../../email/preferences/manager')
var apiUtils = require('../apiUtils')

var userNotificationPreferencesApi = {}

/**
 * GET /api/v2/users/:userId/notification-preferences
 * Get notification preferences for a user
 */
userNotificationPreferencesApi.get = function (req, res) {
  var userId = req.params.userId || req.user._id

  // Only allow users to view their own preferences (unless admin)
  if (!req.user.role.isAdmin && userId !== req.user._id.toString()) {
    return apiUtils.sendApiError(res, 403, 'Permission denied')
  }

  UserNotificationPreferences.getOrCreateForUser(userId, function (err, preferences) {
    if (err) {
      return apiUtils.sendApiError(res, 500, err.message)
    }

    return apiUtils.sendApiSuccess(res, { preferences: preferences })
  })
}

/**
 * PUT /api/v2/users/:userId/notification-preferences
 * Update notification preferences for a user
 */
userNotificationPreferencesApi.update = function (req, res) {
  var userId = req.params.userId || req.user._id
  var updates = req.body

  // Only allow users to update their own preferences (unless admin)
  if (!req.user.role.isAdmin && userId !== req.user._id.toString()) {
    return apiUtils.sendApiError(res, 403, 'Permission denied')
  }

  preferencesManager.updatePreferences(userId, updates, function (err, preferences) {
    if (err) {
      return apiUtils.sendApiError(res, 500, err.message)
    }

    return apiUtils.sendApiSuccess(res, {
      preferences: preferences,
      message: 'Preferences updated successfully'
    })
  })
}

/**
 * POST /api/v2/users/:userId/notification-preferences/reset
 * Reset preferences to defaults
 */
userNotificationPreferencesApi.reset = function (req, res) {
  var userId = req.params.userId || req.user._id

  // Only allow users to reset their own preferences (unless admin)
  if (!req.user.role.isAdmin && userId !== req.user._id.toString()) {
    return apiUtils.sendApiError(res, 403, 'Permission denied')
  }

  preferencesManager.resetToDefaults(userId, function (err, preferences) {
    if (err) {
      return apiUtils.sendApiError(res, 500, err.message)
    }

    return apiUtils.sendApiSuccess(res, {
      preferences: preferences,
      message: 'Preferences reset to defaults'
    })
  })
}

/**
 * GET /api/v2/users/:userId/notification-preferences/stats
 * Get notification statistics for a user
 */
userNotificationPreferencesApi.stats = function (req, res) {
  var userId = req.params.userId || req.user._id

  // Only allow users to view their own stats (unless admin)
  if (!req.user.role.isAdmin && userId !== req.user._id.toString()) {
    return apiUtils.sendApiError(res, 403, 'Permission denied')
  }

  preferencesManager.getStatistics(userId, function (err, stats) {
    if (err) {
      return apiUtils.sendApiError(res, 500, err.message)
    }

    return apiUtils.sendApiSuccess(res, { stats: stats })
  })
}

/**
 * GET /api/v2/users/:userId/notification-preferences/export
 * Export preferences
 */
userNotificationPreferencesApi.export = function (req, res) {
  var userId = req.params.userId || req.user._id

  // Only allow users to export their own preferences (unless admin)
  if (!req.user.role.isAdmin && userId !== req.user._id.toString()) {
    return apiUtils.sendApiError(res, 403, 'Permission denied')
  }

  preferencesManager.exportPreferences(userId, function (err, exported) {
    if (err) {
      return apiUtils.sendApiError(res, 500, err.message)
    }

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', 'attachment; filename="notification-preferences.json"')
    return res.send(JSON.stringify(exported, null, 2))
  })
}

/**
 * POST /api/v2/users/:userId/notification-preferences/import
 * Import preferences
 */
userNotificationPreferencesApi.import = function (req, res) {
  var userId = req.params.userId || req.user._id
  var importData = req.body

  // Only allow users to import their own preferences (unless admin)
  if (!req.user.role.isAdmin && userId !== req.user._id.toString()) {
    return apiUtils.sendApiError(res, 403, 'Permission denied')
  }

  preferencesManager.importPreferences(userId, importData, function (err, preferences) {
    if (err) {
      return apiUtils.sendApiError(res, 500, err.message)
    }

    return apiUtils.sendApiSuccess(res, {
      preferences: preferences,
      message: 'Preferences imported successfully'
    })
  })
}

/**
 * POST /api/v2/users/:userId/notification-preferences/dnd
 * Toggle do not disturb mode
 */
userNotificationPreferencesApi.toggleDND = function (req, res) {
  var userId = req.params.userId || req.user._id
  var enabled = req.body.enabled

  // Only allow users to toggle their own DND (unless admin)
  if (!req.user.role.isAdmin && userId !== req.user._id.toString()) {
    return apiUtils.sendApiError(res, 403, 'Permission denied')
  }

  preferencesManager.updatePreferences(userId, { doNotDisturb: enabled }, function (err, preferences) {
    if (err) {
      return apiUtils.sendApiError(res, 500, err.message)
    }

    return apiUtils.sendApiSuccess(res, {
      doNotDisturb: preferences.doNotDisturb,
      message: 'Do not disturb ' + (enabled ? 'enabled' : 'disabled')
    })
  })
}

/**
 * POST /api/v2/users/:userId/notification-preferences/ooo
 * Set out of office status
 */
userNotificationPreferencesApi.setOutOfOffice = function (req, res) {
  var userId = req.params.userId || req.user._id
  var oooSettings = req.body

  // Only allow users to set their own OOO (unless admin)
  if (!req.user.role.isAdmin && userId !== req.user._id.toString()) {
    return apiUtils.sendApiError(res, 403, 'Permission denied')
  }

  // Validate dates
  if (oooSettings.enabled) {
    if (!oooSettings.startDate || !oooSettings.endDate) {
      return apiUtils.sendApiError(res, 400, 'Start and end dates are required')
    }

    oooSettings.startDate = new Date(oooSettings.startDate)
    oooSettings.endDate = new Date(oooSettings.endDate)

    if (oooSettings.startDate >= oooSettings.endDate) {
      return apiUtils.sendApiError(res, 400, 'End date must be after start date')
    }
  }

  preferencesManager.updatePreferences(userId, { outOfOffice: oooSettings }, function (err, preferences) {
    if (err) {
      return apiUtils.sendApiError(res, 500, err.message)
    }

    return apiUtils.sendApiSuccess(res, {
      outOfOffice: preferences.outOfOffice,
      message: 'Out of office ' + (oooSettings.enabled ? 'enabled' : 'disabled')
    })
  })
}

/**
 * GET /api/v2/notification-preferences/me
 * Shortcut to get current user's preferences
 */
userNotificationPreferencesApi.getMe = function (req, res) {
  req.params.userId = req.user._id
  userNotificationPreferencesApi.get(req, res)
}

/**
 * PUT /api/v2/notification-preferences/me
 * Shortcut to update current user's preferences
 */
userNotificationPreferencesApi.updateMe = function (req, res) {
  req.params.userId = req.user._id
  userNotificationPreferencesApi.update(req, res)
}

/**
 * POST /api/v2/notification-preferences/test
 * Test notification preferences with sample context
 */
userNotificationPreferencesApi.test = function (req, res) {
  var userId = req.user._id
  var eventType = req.body.eventType || 'ticket-created'
  var context = req.body.context || {}

  preferencesManager.shouldReceiveNotification(userId, eventType, context, function (err, shouldReceive) {
    if (err) {
      return apiUtils.sendApiError(res, 500, err.message)
    }

    preferencesManager.getPreferredChannels(userId, eventType, function (err, channels) {
      if (err) {
        return apiUtils.sendApiError(res, 500, err.message)
      }

      return apiUtils.sendApiSuccess(res, {
        shouldReceive: shouldReceive,
        channels: channels,
        message: shouldReceive
          ? 'You would receive this notification via: ' + channels.join(', ')
          : 'You would not receive this notification based on your preferences'
      })
    })
  })
}

module.exports = userNotificationPreferencesApi
