/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Author:     OpenHands AI
 *  Updated:    2025-11-18
 *  Copyright (c) 2025. All rights reserved.
 */

const _ = require('lodash')
const async = require('async')
const logger = require('../../../logger')
const apiUtils = require('../apiUtils')
const Models = require('../../../models')
const permissions = require('../../../permissions')

const timeTrackingV2 = {}

/**
 * Create a new time tracking entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
timeTrackingV2.create = async function (req, res) {
  try {
    const timeData = req.body
    
    if (!timeData) {
      return apiUtils.sendApiError_InvalidPostData(res)
    }

    // Validate required fields
    if (!timeData.ticketId || !timeData.actualHours) {
      return apiUtils.sendApiError(res, 400, 'Missing required fields: ticketId and actualHours')
    }

    // Check if user has permission to track time
    if (!permissions.canThis(req.user.role, 'tickets:edit', false)) {
      return apiUtils.sendApiError(res, 403, 'Insufficient permissions')
    }

    // Verify ticket exists and user has access
    const ticket = await Models.Ticket.findOne({ _id: timeData.ticketId, deleted: false })
    if (!ticket) {
      return apiUtils.sendApiError(res, 404, 'Ticket not found')
    }

    // Check if time tracking is enabled for this ticket
    if (!ticket.timeTrackingEnabled) {
      return apiUtils.sendApiError(res, 400, 'Time tracking is not enabled for this ticket')
    }

    // Create time tracking entry
    const timeEntry = new Models.TimeTracking({
      ticket: timeData.ticketId,
      agent: req.user._id,
      actualHours: timeData.actualHours,
      estimatedHours: timeData.estimatedHours || 0,
      description: timeData.description || '',
      workDate: timeData.workDate || new Date(),
      category: timeData.category || 'general',
      billable: timeData.billable || false
    })

    const savedEntry = await timeEntry.save()
    await savedEntry.populate('agent', 'fullname email')
    await savedEntry.populate('ticket', 'uid subject')

    return apiUtils.sendApiSuccess(res, { timeEntry: savedEntry })
  } catch (err) {
    logger.warn(err)
    return apiUtils.sendApiError(res, 500, err.message)
  }
}

/**
 * Get time tracking entries
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
timeTrackingV2.get = async function (req, res) {
  try {
    const query = req.query
    let limit = 50
    let page = 0

    try {
      limit = query.limit ? parseInt(query.limit) : limit
      page = query.page ? parseInt(query.page) : page
    } catch (e) {
      logger.warn(e)
      return apiUtils.sendApiError_InvalidPostData(res)
    }

    const filter = { deleted: false }

    // Filter by ticket if specified
    if (query.ticketId) {
      filter.ticket = query.ticketId
    }

    // Filter by agent if specified
    if (query.agentId) {
      filter.agent = query.agentId
    }

    // Filter by date range if specified
    if (query.startDate || query.endDate) {
      filter.workDate = {}
      if (query.startDate) {
        filter.workDate.$gte = new Date(query.startDate)
      }
      if (query.endDate) {
        filter.workDate.$lte = new Date(query.endDate)
      }
    }

    // Filter by category if specified
    if (query.category) {
      filter.category = query.category
    }

    // Filter by billable status if specified
    if (query.billable !== undefined) {
      filter.billable = query.billable === 'true'
    }

    // Check permissions - agents can only see their own entries unless they have viewall permission
    if (!permissions.canThis(req.user.role, 'tickets:viewall', false)) {
      filter.agent = req.user._id
    }

    const timeEntries = await Models.TimeTracking.find(filter)
      .populate('agent', 'fullname email')
      .populate('ticket', 'uid subject status')
      .sort({ workDate: -1 })
      .limit(limit)
      .skip(page * limit)

    const totalCount = await Models.TimeTracking.countDocuments(filter)

    return apiUtils.sendApiSuccess(res, {
      timeEntries,
      count: timeEntries.length,
      totalCount,
      page,
      prevPage: page === 0 ? 0 : page - 1,
      nextPage: page * limit + limit <= totalCount ? page + 1 : page
    })
  } catch (err) {
    logger.warn(err)
    return apiUtils.sendApiError(res, 500, err.message)
  }
}

/**
 * Get a single time tracking entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
timeTrackingV2.single = async function (req, res) {
  try {
    const entryId = req.params.id
    if (!entryId) {
      return apiUtils.sendApiError(res, 400, 'Invalid Parameters')
    }

    const timeEntry = await Models.TimeTracking.findOne({ _id: entryId, deleted: false })
      .populate('agent', 'fullname email')
      .populate('ticket', 'uid subject status')

    if (!timeEntry) {
      return apiUtils.sendApiError(res, 404, 'Time entry not found')
    }

    // Check permissions - agents can only see their own entries unless they have viewall permission
    if (!permissions.canThis(req.user.role, 'tickets:viewall', false) && 
        timeEntry.agent._id.toString() !== req.user._id.toString()) {
      return apiUtils.sendApiError(res, 403, 'Insufficient permissions')
    }

    return apiUtils.sendApiSuccess(res, { timeEntry })
  } catch (err) {
    logger.warn(err)
    return apiUtils.sendApiError(res, 500, err.message)
  }
}

/**
 * Update a time tracking entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
timeTrackingV2.update = async function (req, res) {
  try {
    const entryId = req.params.id
    const updateData = req.body

    if (!entryId || !updateData) {
      return apiUtils.sendApiError_InvalidPostData(res)
    }

    const timeEntry = await Models.TimeTracking.findOne({ _id: entryId, deleted: false })
    if (!timeEntry) {
      return apiUtils.sendApiError(res, 404, 'Time entry not found')
    }

    // Check permissions - agents can only edit their own entries unless they have edit permission
    if (!permissions.canThis(req.user.role, 'tickets:edit', false) && 
        timeEntry.agent.toString() !== req.user._id.toString()) {
      return apiUtils.sendApiError(res, 403, 'Insufficient permissions')
    }

    // Update allowed fields
    const allowedFields = ['actualHours', 'estimatedHours', 'description', 'workDate', 'category', 'billable']
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        timeEntry[field] = updateData[field]
      }
    })

    const updatedEntry = await timeEntry.save()
    await updatedEntry.populate('agent', 'fullname email')
    await updatedEntry.populate('ticket', 'uid subject')

    return apiUtils.sendApiSuccess(res, { timeEntry: updatedEntry })
  } catch (err) {
    logger.warn(err)
    return apiUtils.sendApiError(res, 500, err.message)
  }
}

/**
 * Delete a time tracking entry (soft delete)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
timeTrackingV2.delete = async function (req, res) {
  try {
    const entryId = req.params.id
    if (!entryId) {
      return apiUtils.sendApiError(res, 400, 'Invalid Parameters')
    }

    const timeEntry = await Models.TimeTracking.findOne({ _id: entryId, deleted: false })
    if (!timeEntry) {
      return apiUtils.sendApiError(res, 404, 'Time entry not found')
    }

    // Check permissions - agents can only delete their own entries unless they have delete permission
    if (!permissions.canThis(req.user.role, 'tickets:delete', false) && 
        timeEntry.agent.toString() !== req.user._id.toString()) {
      return apiUtils.sendApiError(res, 403, 'Insufficient permissions')
    }

    timeEntry.deleted = true
    await timeEntry.save()

    return apiUtils.sendApiSuccess(res, { message: 'Time entry deleted successfully' })
  } catch (err) {
    logger.warn(err)
    return apiUtils.sendApiError(res, 500, err.message)
  }
}

/**
 * Get time tracking statistics for a ticket
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
timeTrackingV2.getTicketStats = async function (req, res) {
  try {
    const ticketId = req.params.ticketId
    if (!ticketId) {
      return apiUtils.sendApiError(res, 400, 'Invalid Parameters')
    }

    const ticket = await Models.Ticket.findOne({ _id: ticketId, deleted: false })
    if (!ticket) {
      return apiUtils.sendApiError(res, 404, 'Ticket not found')
    }

    const stats = await Models.TimeTracking.getTicketStatistics(ticketId)
    
    return apiUtils.sendApiSuccess(res, { 
      ticketId,
      statistics: stats
    })
  } catch (err) {
    logger.warn(err)
    return apiUtils.sendApiError(res, 500, err.message)
  }
}

/**
 * Get time tracking statistics for an agent
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
timeTrackingV2.getAgentStats = async function (req, res) {
  try {
    const agentId = req.params.agentId || req.user._id
    const query = req.query

    // Check permissions - agents can only see their own stats unless they have viewall permission
    if (!permissions.canThis(req.user.role, 'tickets:viewall', false) && 
        agentId !== req.user._id.toString()) {
      return apiUtils.sendApiError(res, 403, 'Insufficient permissions')
    }

    const dateRange = {}
    if (query.startDate) dateRange.startDate = new Date(query.startDate)
    if (query.endDate) dateRange.endDate = new Date(query.endDate)

    const stats = await Models.TimeTracking.getAgentStatistics(agentId, dateRange)
    
    return apiUtils.sendApiSuccess(res, { 
      agentId,
      statistics: stats
    })
  } catch (err) {
    logger.warn(err)
    return apiUtils.sendApiError(res, 500, err.message)
  }
}

/**
 * Get time tracking summary report
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
timeTrackingV2.getSummaryReport = async function (req, res) {
  try {
    const query = req.query

    // Check permissions
    if (!permissions.canThis(req.user.role, 'reports:view', false)) {
      return apiUtils.sendApiError(res, 403, 'Insufficient permissions')
    }

    const filter = {}
    if (query.startDate) filter.startDate = new Date(query.startDate)
    if (query.endDate) filter.endDate = new Date(query.endDate)
    if (query.agentId) filter.agentId = query.agentId
    if (query.category) filter.category = query.category
    if (query.billable !== undefined) filter.billable = query.billable === 'true'

    const report = await Models.TimeTracking.getSummaryReport(filter)
    
    return apiUtils.sendApiSuccess(res, { report })
  } catch (err) {
    logger.warn(err)
    return apiUtils.sendApiError(res, 500, err.message)
  }
}

module.exports = timeTrackingV2