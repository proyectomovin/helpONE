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

const winston = require('../../../logger')
const apiUtil = require('../apiUtils')
const EmailPreferenceService = require('../../../services/emailPreferenceService')
const EmailTrackingService = require('../../../services/emailTrackingService')

const emailPreferencesApi = {}

/**
 * Get email preferences for current user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
emailPreferencesApi.get = async (req, res) => {
  try {
    if (!req.user) return apiUtil.sendApiError(res, 401, 'Unauthorized')

    const preferences = await EmailPreferenceService.getPreferences(req.user._id)
    return res.json({ success: true, preferences })
  } catch (error) {
    winston.error('[emailPreferencesApi.get] Error:', error)
    return apiUtil.sendApiError(res, 500, error.message)
  }
}

/**
 * Update email preferences for current user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
emailPreferencesApi.update = async (req, res) => {
  try {
    if (!req.user) return apiUtil.sendApiError(res, 401, 'Unauthorized')

    const updates = {}

    // Update notifications preferences
    if (req.body.notifications) {
      updates.notifications = req.body.notifications
    }

    // Update frequency
    if (req.body.frequency) {
      if (!['immediate', 'disabled'].includes(req.body.frequency)) {
        return apiUtil.sendApiError(res, 400, 'Invalid frequency value')
      }
      updates.frequency = req.body.frequency
    }

    // Update priority overrides
    if (req.body.priorityOverride) {
      updates.priorityOverride = req.body.priorityOverride
    }

    const preferences = await EmailPreferenceService.updatePreferences(req.user._id, updates)
    return res.json({ success: true, preferences })
  } catch (error) {
    winston.error('[emailPreferencesApi.update] Error:', error)
    return apiUtil.sendApiError(res, 500, error.message)
  }
}

/**
 * Reset email preferences to default
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
emailPreferencesApi.reset = async (req, res) => {
  try {
    if (!req.user) return apiUtil.sendApiError(res, 401, 'Unauthorized')

    const preferences = await EmailPreferenceService.resetToDefault(req.user._id)
    return res.json({ success: true, preferences })
  } catch (error) {
    winston.error('[emailPreferencesApi.reset] Error:', error)
    return apiUtil.sendApiError(res, 500, error.message)
  }
}

/**
 * Get email logs for current user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
emailPreferencesApi.getLogs = async (req, res) => {
  try {
    if (!req.user) return apiUtil.sendApiError(res, 401, 'Unauthorized')

    const limit = parseInt(req.query.limit) || 50
    const logs = await EmailTrackingService.getLogsForUser(req.user._id, limit)

    return res.json({ success: true, logs })
  } catch (error) {
    winston.error('[emailPreferencesApi.getLogs] Error:', error)
    return apiUtil.sendApiError(res, 500, error.message)
  }
}

/**
 * Get all email logs (admin only)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
emailPreferencesApi.getAllLogs = async (req, res) => {
  try {
    if (!req.user || !req.user.role || !req.user.role.isAdmin) {
      return apiUtil.sendApiError(res, 403, 'Forbidden - Admin access required')
    }

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 50
    const filters = {
      status: req.query.status,
      template: req.query.template,
      to: req.query.to,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    }

    const result = await EmailTrackingService.getRecentLogs(page, limit, filters)
    return res.json({ success: true, ...result })
  } catch (error) {
    winston.error('[emailPreferencesApi.getAllLogs] Error:', error)
    return apiUtil.sendApiError(res, 500, error.message)
  }
}

/**
 * Get email statistics (admin only)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
emailPreferencesApi.getStats = async (req, res) => {
  try {
    if (!req.user || !req.user.role || !req.user.role.isAdmin) {
      return apiUtil.sendApiError(res, 403, 'Forbidden - Admin access required')
    }

    const days = parseInt(req.query.days) || 7
    const stats = await EmailTrackingService.getDeliveryRate(days)

    return res.json({ success: true, stats })
  } catch (error) {
    winston.error('[emailPreferencesApi.getStats] Error:', error)
    return apiUtil.sendApiError(res, 500, error.message)
  }
}

/**
 * Get template usage statistics (admin only)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
emailPreferencesApi.getTemplateUsage = async (req, res) => {
  try {
    if (!req.user || !req.user.role || !req.user.role.isAdmin) {
      return apiUtil.sendApiError(res, 403, 'Forbidden - Admin access required')
    }

    const startDate = req.query.startDate || null
    const endDate = req.query.endDate || null
    const usage = await EmailTrackingService.getTemplateUsage(startDate, endDate)

    return res.json({ success: true, usage })
  } catch (error) {
    winston.error('[emailPreferencesApi.getTemplateUsage] Error:', error)
    return apiUtil.sendApiError(res, 500, error.message)
  }
}

/**
 * Get email logs for a specific ticket (admin only)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
emailPreferencesApi.getTicketLogs = async (req, res) => {
  try {
    if (!req.user) return apiUtil.sendApiError(res, 401, 'Unauthorized')

    const ticketId = req.params.ticketId
    if (!ticketId) return apiUtil.sendApiError(res, 400, 'Ticket ID is required')

    const logs = await EmailTrackingService.getLogsForTicket(ticketId)
    return res.json({ success: true, logs })
  } catch (error) {
    winston.error('[emailPreferencesApi.getTicketLogs] Error:', error)
    return apiUtil.sendApiError(res, 500, error.message)
  }
}

module.exports = emailPreferencesApi
