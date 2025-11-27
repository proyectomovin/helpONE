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

var COLLECTION = 'emailLogs'

/**
 * Email Log Schema
 * Stores audit trail of all emails sent by the system
 */
var emailLogSchema = mongoose.Schema({
  // Template information
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'emailTemplates' },
  templateName: String,
  templateType: String,

  // Email details
  recipients: [String],
  cc: [String],
  bcc: [String],
  subject: String,
  from: String,

  // Status tracking
  status: {
    type: String,
    enum: ['queued', 'sending', 'sent', 'failed', 'bounced', 'delivered'],
    default: 'queued',
    index: true
  },

  // Error tracking
  error: String,
  errorCode: String,
  errorDetails: mongoose.Schema.Types.Mixed,

  // Delivery tracking
  messageId: String,
  sentAt: Date,
  deliveredAt: Date,
  openedAt: Date,
  clickedAt: Date,
  bouncedAt: Date,

  // Opens and clicks tracking
  openCount: { type: Number, default: 0 },
  clickCount: { type: Number, default: 0 },
  uniqueOpens: { type: Number, default: 0 },
  uniqueClicks: { type: Number, default: 0 },

  // Related entities
  relatedTicket: { type: mongoose.Schema.Types.ObjectId, ref: 'tickets' },
  relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'accounts' },
  relatedComment: { type: mongoose.Schema.Types.ObjectId, ref: 'comments' },

  // Metadata
  provider: String, // 'smtp', 'sendgrid', 'mailgun', etc.
  providerResponse: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,

  // Calendar attachment info
  hasCalendarAttachment: { type: Boolean, default: false },
  calendarEventId: String,

  // Timestamps
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
})

// Indexes for performance
emailLogSchema.index({ status: 1, createdAt: -1 })
emailLogSchema.index({ relatedTicket: 1, createdAt: -1 })
emailLogSchema.index({ relatedUser: 1, createdAt: -1 })
emailLogSchema.index({ templateType: 1, createdAt: -1 })
emailLogSchema.index({ recipients: 1 })
emailLogSchema.index({ sentAt: -1 })

// Pre-save middleware
emailLogSchema.pre('save', function (next) {
  this.updatedAt = Date.now()
  return next()
})

/**
 * Mark email as sent
 */
emailLogSchema.methods.markAsSent = function (messageId, callback) {
  this.status = 'sent'
  this.sentAt = new Date()
  this.messageId = messageId
  this.save(callback)
}

/**
 * Mark email as failed
 */
emailLogSchema.methods.markAsFailed = function (error, callback) {
  this.status = 'failed'
  this.error = error.message || error
  this.errorCode = error.code
  this.errorDetails = error
  this.save(callback)
}

/**
 * Mark email as delivered
 */
emailLogSchema.methods.markAsDelivered = function (callback) {
  this.status = 'delivered'
  this.deliveredAt = new Date()
  this.save(callback)
}

/**
 * Track email open
 */
emailLogSchema.methods.trackOpen = function (callback) {
  if (!this.openedAt) {
    this.openedAt = new Date()
    this.uniqueOpens = 1
  }
  this.openCount += 1
  this.save(callback)
}

/**
 * Track email click
 */
emailLogSchema.methods.trackClick = function (callback) {
  if (!this.clickedAt) {
    this.clickedAt = new Date()
    this.uniqueClicks = 1
  }
  this.clickCount += 1
  this.save(callback)
}

/**
 * Get email stats
 */
emailLogSchema.statics.getStats = function (filter, callback) {
  const query = filter || {}

  return this.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalOpens: { $sum: '$openCount' },
        totalClicks: { $sum: '$clickCount' },
        uniqueOpens: { $sum: '$uniqueOpens' },
        uniqueClicks: { $sum: '$uniqueClicks' }
      }
    }
  ]).exec(callback)
}

/**
 * Get recent logs
 */
emailLogSchema.statics.getRecent = function (limit, callback) {
  return this.find({})
    .sort({ createdAt: -1 })
    .limit(limit || 50)
    .populate('templateId', 'name type')
    .populate('relatedTicket', 'uid subject')
    .populate('relatedUser', 'fullname email')
    .exec(callback)
}

/**
 * Get logs by ticket
 */
emailLogSchema.statics.getByTicket = function (ticketId, callback) {
  return this.find({ relatedTicket: ticketId })
    .sort({ createdAt: -1 })
    .populate('templateId', 'name type')
    .exec(callback)
}

/**
 * Get logs by user
 */
emailLogSchema.statics.getByUser = function (userId, callback) {
  return this.find({ relatedUser: userId })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('templateId', 'name type')
    .exec(callback)
}

/**
 * Clean old logs (retention policy)
 */
emailLogSchema.statics.cleanOldLogs = function (daysToKeep, callback) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    status: { $in: ['sent', 'delivered'] }
  }).exec(callback)
}

module.exports = mongoose.model(COLLECTION, emailLogSchema)
