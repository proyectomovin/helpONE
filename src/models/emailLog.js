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

const COLLECTION = 'emaillogs'

/**
 * Email Log Schema
 * @module models/emailLog
 * @class EmailLog
 *
 * @property {String} to Recipient email address
 * @property {String} subject Email subject
 * @property {String} template Template name used
 * @property {String} status Status: 'sent', 'failed', 'queued'
 * @property {String} error Error message if failed
 * @property {Object} metadata Additional metadata
 * @property {ObjectId} metadata.ticketId Related ticket ID
 * @property {ObjectId} metadata.userId Related user ID
 * @property {ObjectId} metadata.groupId Related group ID
 * @property {ObjectId} metadata.commentId Related comment ID
 * @property {Date} sentAt Timestamp when email was sent
 * @property {Date} createdAt Creation timestamp
 */
const emailLogSchema = mongoose.Schema(
  {
    to: {
      type: String,
      required: true,
      index: true
    },
    subject: {
      type: String,
      required: true
    },
    template: {
      type: String,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'queued'],
      default: 'queued',
      index: true
    },
    error: {
      type: String,
      default: null
    },
    metadata: {
      ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'tickets' },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'accounts' },
      groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'groups' },
      commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'comments' },
      priority: { type: String }
    },
    sentAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: COLLECTION
  }
)

// Index for efficient queries
emailLogSchema.index({ createdAt: -1 })
emailLogSchema.index({ 'metadata.ticketId': 1 })
emailLogSchema.index({ 'metadata.userId': 1 })

/**
 * Log a successful email send
 * @static
 * @method logSuccess
 * @param {Object} data - Email data
 * @param {Function} callback - Callback function
 */
emailLogSchema.statics.logSuccess = function (data, callback) {
  const log = new this({
    to: data.to,
    subject: data.subject,
    template: data.template,
    status: 'sent',
    metadata: data.metadata || {},
    sentAt: new Date()
  })

  log.save(callback)
}

/**
 * Log a failed email send
 * @static
 * @method logFailure
 * @param {Object} data - Email data
 * @param {String} error - Error message
 * @param {Function} callback - Callback function
 */
emailLogSchema.statics.logFailure = function (data, error, callback) {
  const log = new this({
    to: data.to,
    subject: data.subject,
    template: data.template,
    status: 'failed',
    error: error.toString(),
    metadata: data.metadata || {},
    sentAt: null
  })

  log.save(callback)
}

/**
 * Get email stats for a date range
 * @static
 * @method getStats
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {Function} callback - Callback function
 */
emailLogSchema.statics.getStats = function (startDate, endDate, callback) {
  const match = {
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  }

  this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ])
    .then(results => {
      const stats = {
        total: 0,
        sent: 0,
        failed: 0,
        queued: 0
      }

      results.forEach(result => {
        stats[result._id] = result.count
        stats.total += result.count
      })

      callback(null, stats)
    })
    .catch(callback)
}

/**
 * Get email logs for a specific ticket
 * @static
 * @method getByTicket
 * @param {ObjectId} ticketId - Ticket ID
 * @param {Function} callback - Callback function
 */
emailLogSchema.statics.getByTicket = function (ticketId, callback) {
  this.find({ 'metadata.ticketId': ticketId })
    .sort({ createdAt: -1 })
    .limit(50)
    .exec(callback)
}

/**
 * Get email logs for a specific user
 * @static
 * @method getByUser
 * @param {ObjectId} userId - User ID
 * @param {Number} limit - Limit results
 * @param {Function} callback - Callback function
 */
emailLogSchema.statics.getByUser = function (userId, limit = 50, callback) {
  this.find({ 'metadata.userId': userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .exec(callback)
}

module.exports = mongoose.model('EmailLog', emailLogSchema, COLLECTION)
