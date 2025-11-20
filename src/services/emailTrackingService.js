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

const EmailLog = require('../models/emailLog')

/**
 * Email Tracking Service
 * Handles email logging and tracking
 */
class EmailTrackingService {
  /**
   * Log a successful email send
   * @param {Object} emailData - Email data
   * @param {String} emailData.to - Recipient email
   * @param {String} emailData.subject - Email subject
   * @param {String} emailData.template - Template name
   * @param {Object} emailData.metadata - Additional metadata
   * @returns {Promise<Object>} Created log entry
   */
  static async logSuccess(emailData) {
    return new Promise((resolve, reject) => {
      EmailLog.logSuccess(emailData, (err, log) => {
        if (err) {
          console.error('Error logging email success:', err)
          return reject(err)
        }
        resolve(log)
      })
    })
  }

  /**
   * Log a failed email send
   * @param {Object} emailData - Email data
   * @param {String} emailData.to - Recipient email
   * @param {String} emailData.subject - Email subject
   * @param {String} emailData.template - Template name
   * @param {Object} emailData.metadata - Additional metadata
   * @param {Error} error - Error object
   * @returns {Promise<Object>} Created log entry
   */
  static async logFailure(emailData, error) {
    return new Promise((resolve, reject) => {
      EmailLog.logFailure(emailData, error, (err, log) => {
        if (err) {
          console.error('Error logging email failure:', err)
          return reject(err)
        }
        resolve(log)
      })
    })
  }

  /**
   * Get email statistics for a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Object>} Statistics object
   */
  static async getStats(startDate, endDate) {
    return new Promise((resolve, reject) => {
      EmailLog.getStats(startDate, endDate, (err, stats) => {
        if (err) return reject(err)
        resolve(stats)
      })
    })
  }

  /**
   * Get recent email logs with pagination
   * @param {Number} page - Page number (starts at 1)
   * @param {Number} limit - Items per page
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Paginated logs
   */
  static async getRecentLogs(page = 1, limit = 50, filters = {}) {
    return new Promise((resolve, reject) => {
      const skip = (page - 1) * limit
      const query = {}

      // Apply filters
      if (filters.status) {
        query.status = filters.status
      }
      if (filters.template) {
        query.template = filters.template
      }
      if (filters.to) {
        query.to = new RegExp(filters.to, 'i')
      }
      if (filters.startDate || filters.endDate) {
        query.createdAt = {}
        if (filters.startDate) {
          query.createdAt.$gte = new Date(filters.startDate)
        }
        if (filters.endDate) {
          query.createdAt.$lte = new Date(filters.endDate)
        }
      }

      // Get total count
      EmailLog.countDocuments(query, (err, total) => {
        if (err) return reject(err)

        // Get logs
        EmailLog.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec((err, logs) => {
            if (err) return reject(err)

            resolve({
              logs,
              pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
              }
            })
          })
      })
    })
  }

  /**
   * Get email logs for a specific ticket
   * @param {ObjectId} ticketId - Ticket ID
   * @returns {Promise<Array>} Array of email logs
   */
  static async getLogsForTicket(ticketId) {
    return new Promise((resolve, reject) => {
      EmailLog.getByTicket(ticketId, (err, logs) => {
        if (err) return reject(err)
        resolve(logs)
      })
    })
  }

  /**
   * Get email logs for a specific user
   * @param {ObjectId} userId - User ID
   * @param {Number} limit - Limit results
   * @returns {Promise<Array>} Array of email logs
   */
  static async getLogsForUser(userId, limit = 50) {
    return new Promise((resolve, reject) => {
      EmailLog.getByUser(userId, limit, (err, logs) => {
        if (err) return reject(err)
        resolve(logs)
      })
    })
  }

  /**
   * Get email delivery rate for the last N days
   * @param {Number} days - Number of days to look back
   * @returns {Promise<Object>} Delivery statistics
   */
  static async getDeliveryRate(days = 7) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const stats = await this.getStats(startDate, endDate)

    const deliveryRate = stats.total > 0
      ? ((stats.sent / stats.total) * 100).toFixed(2)
      : 0

    return {
      period: { startDate, endDate, days },
      total: stats.total,
      sent: stats.sent,
      failed: stats.failed,
      deliveryRate: parseFloat(deliveryRate),
      failureRate: parseFloat((100 - deliveryRate).toFixed(2))
    }
  }

  /**
   * Delete old logs (cleanup)
   * @param {Number} daysToKeep - Keep logs from last N days
   * @returns {Promise<Number>} Number of deleted logs
   */
  static async cleanupOldLogs(daysToKeep = 90) {
    return new Promise((resolve, reject) => {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      EmailLog.deleteMany({ createdAt: { $lt: cutoffDate } }, (err, result) => {
        if (err) return reject(err)
        resolve(result.deletedCount || 0)
      })
    })
  }

  /**
   * Get template usage statistics
   * @param {Date} startDate - Start date (optional)
   * @param {Date} endDate - End date (optional)
   * @returns {Promise<Array>} Template usage stats
   */
  static async getTemplateUsage(startDate = null, endDate = null) {
    return new Promise((resolve, reject) => {
      const match = {}

      if (startDate || endDate) {
        match.createdAt = {}
        if (startDate) match.createdAt.$gte = new Date(startDate)
        if (endDate) match.createdAt.$lte = new Date(endDate)
      }

      EmailLog.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$template',
            count: { $sum: 1 },
            sent: {
              $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] }
            },
            failed: {
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
            }
          }
        },
        {
          $project: {
            template: '$_id',
            count: 1,
            sent: 1,
            failed: 1,
            successRate: {
              $multiply: [
                { $divide: ['$sent', '$count'] },
                100
              ]
            }
          }
        },
        { $sort: { count: -1 } }
      ])
        .then(results => resolve(results))
        .catch(reject)
    })
  }
}

module.exports = EmailTrackingService
