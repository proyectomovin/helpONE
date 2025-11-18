/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Author:     OpenHands Agent
 *  Updated:    11/18/24
 *  Copyright (c) 2024. All rights reserved.
 */

const mongoose = require('mongoose')
const _ = require('lodash')

const COLLECTION = 'timetracking'

/**
 * TimeTracking Schema
 * @module models/timeTracking
 * @class TimeTracking
 * @requires {@link Ticket}
 * @requires {@link User}
 *
 * @property {object} _id ```Required``` ```unique``` MongoDB Object ID
 * @property {Ticket} ticket ```Required``` Reference to Ticket Object
 * @property {User} agent ```Required``` Reference to User Object (agent who logged time)
 * @property {Number} estimatedHours Estimated hours for the task
 * @property {Number} actualHours ```Required``` Actual hours spent on the task
 * @property {String} description ```Required``` Description of work performed
 * @property {Date} dateLogged ```Required``` [default: Date.now] Date when time was logged
 * @property {Date} workDate Date when the actual work was performed
 * @property {String} category Category of work (e.g., 'development', 'testing', 'support', 'analysis')
 * @property {Boolean} billable [default: false] Whether this time is billable
 * @property {User} createdBy Reference to User who created this entry
 * @property {Date} createdAt ```Required``` [default: Date.now] Creation timestamp
 * @property {Date} updatedAt Last update timestamp
 */
const timeTrackingSchema = mongoose.Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'tickets',
    index: true
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'accounts',
    index: true
  },
  estimatedHours: {
    type: Number,
    min: 0,
    max: 999.99,
    validate: {
      validator: function(v) {
        return v === null || v === undefined || (v >= 0 && v <= 999.99)
      },
      message: 'Estimated hours must be between 0 and 999.99'
    }
  },
  actualHours: {
    type: Number,
    required: true,
    min: 0.01,
    max: 999.99,
    validate: {
      validator: function(v) {
        return v >= 0.01 && v <= 999.99
      },
      message: 'Actual hours must be between 0.01 and 999.99'
    }
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
    validate: {
      validator: function(v) {
        return v && v.trim().length > 0
      },
      message: 'Description is required and cannot be empty'
    }
  },
  dateLogged: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  workDate: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['development', 'testing', 'support', 'analysis', 'documentation', 'meeting', 'research', 'other'],
    default: 'support',
    index: true
  },
  billable: {
    type: Boolean,
    default: false,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'accounts'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Compound indexes for efficient queries
timeTrackingSchema.index({ ticket: 1, agent: 1 })
timeTrackingSchema.index({ agent: 1, workDate: -1 })
timeTrackingSchema.index({ ticket: 1, workDate: -1 })
timeTrackingSchema.index({ workDate: -1, billable: 1 })

// Update the updatedAt field before saving
timeTrackingSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  
  // Ensure workDate is not in the future
  if (this.workDate > new Date()) {
    this.workDate = new Date()
  }
  
  // Set createdBy if not set and agent is available
  if (!this.createdBy && this.agent) {
    this.createdBy = this.agent
  }
  
  next()
})

// Virtual for total time variance
timeTrackingSchema.virtual('timeVariance').get(function() {
  if (!this.estimatedHours || this.estimatedHours === 0) {
    return null
  }
  return this.actualHours - this.estimatedHours
})

// Virtual for time variance percentage
timeTrackingSchema.virtual('timeVariancePercentage').get(function() {
  if (!this.estimatedHours || this.estimatedHours === 0) {
    return null
  }
  return ((this.actualHours - this.estimatedHours) / this.estimatedHours) * 100
})

/**
 * Get time tracking entries for a specific ticket
 * @static
 * @method getByTicket
 * @memberof TimeTracking
 * @param {String} ticketId - Ticket ID
 * @param {Function} callback - Callback function
 */
timeTrackingSchema.statics.getByTicket = function(ticketId, callback) {
  return this.find({ ticket: ticketId })
    .populate('agent', 'username fullname email')
    .populate('createdBy', 'username fullname')
    .sort({ workDate: -1, createdAt: -1 })
    .exec(callback)
}

/**
 * Get time tracking entries for a specific agent
 * @static
 * @method getByAgent
 * @memberof TimeTracking
 * @param {String} agentId - Agent ID
 * @param {Date} startDate - Start date filter
 * @param {Date} endDate - End date filter
 * @param {Function} callback - Callback function
 */
timeTrackingSchema.statics.getByAgent = function(agentId, startDate, endDate, callback) {
  const query = { agent: agentId }
  
  if (startDate || endDate) {
    query.workDate = {}
    if (startDate) query.workDate.$gte = startDate
    if (endDate) query.workDate.$lte = endDate
  }
  
  return this.find(query)
    .populate('ticket', 'uid subject status')
    .populate('agent', 'username fullname')
    .sort({ workDate: -1, createdAt: -1 })
    .exec(callback)
}

/**
 * Get time tracking statistics for a ticket
 * @static
 * @method getTicketStats
 * @memberof TimeTracking
 * @param {String} ticketId - Ticket ID
 * @param {Function} callback - Callback function
 */
timeTrackingSchema.statics.getTicketStats = function(ticketId, callback) {
  return this.aggregate([
    { $match: { ticket: mongoose.Types.ObjectId(ticketId) } },
    {
      $group: {
        _id: '$ticket',
        totalEstimatedHours: { $sum: '$estimatedHours' },
        totalActualHours: { $sum: '$actualHours' },
        totalEntries: { $sum: 1 },
        avgActualHours: { $avg: '$actualHours' },
        categories: { $addToSet: '$category' },
        agents: { $addToSet: '$agent' }
      }
    }
  ]).exec(callback)
}

/**
 * Get time tracking statistics for an agent
 * @static
 * @method getAgentStats
 * @memberof TimeTracking
 * @param {String} agentId - Agent ID
 * @param {Date} startDate - Start date filter
 * @param {Date} endDate - End date filter
 * @param {Function} callback - Callback function
 */
timeTrackingSchema.statics.getAgentStats = function(agentId, startDate, endDate, callback) {
  const matchQuery = { agent: mongoose.Types.ObjectId(agentId) }
  
  if (startDate || endDate) {
    matchQuery.workDate = {}
    if (startDate) matchQuery.workDate.$gte = startDate
    if (endDate) matchQuery.workDate.$lte = endDate
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$agent',
        totalEstimatedHours: { $sum: '$estimatedHours' },
        totalActualHours: { $sum: '$actualHours' },
        totalBillableHours: { 
          $sum: { 
            $cond: [{ $eq: ['$billable', true] }, '$actualHours', 0] 
          } 
        },
        totalEntries: { $sum: 1 },
        avgActualHours: { $avg: '$actualHours' },
        categoriesWorked: { $addToSet: '$category' },
        ticketsWorked: { $addToSet: '$ticket' }
      }
    }
  ]).exec(callback)
}

/**
 * Update time tracking entry
 * @instance
 * @method updateEntry
 * @memberof TimeTracking
 * @param {Object} updateData - Data to update
 * @param {Function} callback - Callback function
 */
timeTrackingSchema.methods.updateEntry = function(updateData, callback) {
  const allowedFields = ['estimatedHours', 'actualHours', 'description', 'workDate', 'category', 'billable']
  const self = this
  
  allowedFields.forEach(field => {
    if (updateData.hasOwnProperty(field)) {
      self[field] = updateData[field]
    }
  })
  
  self.updatedAt = new Date()
  
  return self.save(callback)
}

module.exports = mongoose.model('timetracking', timeTrackingSchema, COLLECTION)