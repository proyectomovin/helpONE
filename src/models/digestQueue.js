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

var COLLECTION = 'digestQueue'

/**
 * Digest Queue Schema
 * Stores notifications queued for digest delivery
 */
var digestQueueSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'accounts',
    required: true,
    index: true
  },

  eventType: {
    type: String,
    required: true,
    index: true
  },

  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },

  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'tickets'
  },

  priority: {
    type: String,
    enum: ['Low', 'Normal', 'High', 'Critical'],
    default: 'Normal'
  },

  processed: {
    type: Boolean,
    default: false,
    index: true
  },

  processedAt: Date,

  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
})

// Compound indexes
digestQueueSchema.index({ userId: 1, processed: 1, createdAt: -1 })
digestQueueSchema.index({ userId: 1, ticket: 1 })

/**
 * Get pending items for user
 * @param {String} userId - User ID
 * @param {Function} callback - Callback function
 */
digestQueueSchema.statics.getPendingForUser = function (userId, callback) {
  this.find({
    userId: userId,
    processed: false
  })
    .sort({ createdAt: -1 })
    .populate('ticket')
    .exec(callback)
}

/**
 * Get pending items for user by ticket
 * @param {String} userId - User ID
 * @param {Function} callback - Callback function
 */
digestQueueSchema.statics.getPendingGroupedByTicket = function (userId, callback) {
  this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        processed: false
      }
    },
    {
      $group: {
        _id: '$ticket',
        count: { $sum: 1 },
        events: { $push: '$$ROOT' },
        latestEvent: { $max: '$createdAt' }
      }
    },
    {
      $sort: { latestEvent: -1 }
    }
  ]).exec(callback)
}

/**
 * Mark items as processed
 * @param {Array} itemIds - Array of item IDs
 * @param {Function} callback - Callback function
 */
digestQueueSchema.statics.markAsProcessed = function (itemIds, callback) {
  this.updateMany(
    { _id: { $in: itemIds } },
    {
      $set: {
        processed: true,
        processedAt: new Date()
      }
    }
  ).exec(callback)
}

/**
 * Clear old processed items
 * @param {Number} daysOld - Days old to clear (default: 30)
 * @param {Function} callback - Callback function
 */
digestQueueSchema.statics.clearOldProcessed = function (daysOld, callback) {
  daysOld = daysOld || 30
  var cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)

  this.deleteMany({
    processed: true,
    processedAt: { $lt: cutoffDate }
  }).exec(callback)
}

module.exports = mongoose.model(COLLECTION, digestQueueSchema)
