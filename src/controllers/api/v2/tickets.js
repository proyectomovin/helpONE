/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Author:     Chris Brame
 *  Updated:    2/14/19 12:05 AM
 *  Copyright (c) 2014-2019. All rights reserved.
 */

const _ = require('lodash')
const async = require('async')
const logger = require('../../../logger')
const apiUtils = require('../apiUtils')
const Models = require('../../../models')
const permissions = require('../../../permissions')
const ticketStatusSchema = require('../../../models/ticketStatus')

const ticketsV2 = {}

ticketsV2.create = function (req, res) {
  const postTicket = req.body
  if (!postTicket) return apiUtils.sendApiError_InvalidPostData(res)
}

ticketsV2.get = async (req, res) => {
  const query = req.query
  const type = query.type || 'all'

  let limit = 50
  let page = 0

  try {
    limit = query.limit ? parseInt(query.limit) : limit
    page = query.page ? parseInt(query.page) : page
  } catch (e) {
    logger.warn(e)
    return apiUtils.sendApiError_InvalidPostData(res)
  }

  const queryObject = {
    limit,
    page
  }

  try {
    let groups = []
    if (req.user.role.isAdmin || req.user.role.isAgent) {
      const dbGroups = await Models.Department.getDepartmentGroupsOfUser(req.user._id)
      groups = dbGroups.map(g => g._id)
    } else {
      groups = await Models.Group.getAllGroupsOfUser(req.user._id)
    }

    const mappedGroups = groups.map(g => g._id)

    const statuses = await ticketStatusSchema.find({ isResolved: false })

    switch (type.toLowerCase()) {
      case 'active':
        queryObject.status = statuses.map(i => i._id.toString())
        break
      case 'assigned':
        queryObject.filter = {
          assignee: [req.user._id]
        }
        break
      case 'unassigned':
        queryObject.unassigned = true
        break
      case 'new':
        queryObject.status = [0]
        break
      case 'open':
        queryObject.status = [1]
        break
      case 'pending':
        queryObject.status = [2]
        break
      case 'closed':
        queryObject.status = [3]
        break
      case 'filter':
        try {
          queryObject.filter = JSON.parse(query.filter)
          queryObject.status = queryObject.filter.status
        } catch (error) {
          logger.warn(error)
        }
        break
    }

    if (!permissions.canThis(req.user.role, 'tickets:viewall', false)) queryObject.owner = req.user._id

    const tickets = await Models.Ticket.getTicketsWithObject(mappedGroups, queryObject)
    const totalCount = await Models.Ticket.getCountWithObject(mappedGroups, queryObject)

    return apiUtils.sendApiSuccess(res, {
      tickets,
      count: tickets.length,
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

ticketsV2.single = async function (req, res) {
  const uid = req.params.uid
  if (!uid) return apiUtils.sendApiError(res, 400, 'Invalid Parameters')
  Models.Ticket.getTicketByUid(uid, function (err, ticket) {
    if (err) return apiUtils.sendApiError(res, 500, err)

    if (req.user.role.isAdmin || req.user.role.isAgent) {
      Models.Department.getDepartmentGroupsOfUser(req.user._id, function (err, dbGroups) {
        if (err) return apiUtils.sendApiError(res, 500, err)

        const groups = dbGroups.map(function (g) {
          return g._id.toString()
        })

        if (groups.includes(ticket.group._id.toString())) {
          return apiUtils.sendApiSuccess(res, { ticket })
        } else {
          return apiUtils.sendApiError(res, 403, 'Forbidden')
        }
      })
    } else {
      Models.Group.getAllGroupsOfUser(req.user._id, function (err, userGroups) {
        if (err) return apiUtils.sendApiError(res, 500, err)

        const groupIds = userGroups.map(function (m) {
          return m._id.toString()
        })

        if (groupIds.includes(ticket.group._id.toString())) {
          return apiUtils.sendApiSuccess(res, { ticket })
        } else {
          return apiUtils.sendApiError(res, 403, 'Forbidden')
        }
      })
    }
  })
}

ticketsV2.update = function (req, res) {
  const uid = req.params.uid
  const putTicket = req.body.ticket
  if (!uid || !putTicket) return apiUtils.sendApiError(res, 400, 'Invalid Parameters')

  // todo: complete this...
  Models.Ticket.getTicketByUid(uid, function (err, ticket) {
    if (err) return apiUtils.sendApiError(res, 500, err.message)

    return apiUtils.sendApiSuccess(res, ticket)
  })
}

ticketsV2.batchUpdate = function (req, res) {
  const batch = req.body.batch
  if (!_.isArray(batch)) return apiUtils.sendApiError_InvalidPostData(res)

  async.each(
    batch,
    function (batchTicket, next) {
      Models.Ticket.getTicketById(batchTicket.id, function (err, ticket) {
        if (err) return next(err)

        if (!_.isUndefined(batchTicket.status)) {
          ticket.status = batchTicket.status
          const HistoryItem = {
            action: 'ticket:set:status',
            description: 'status set to: ' + batchTicket.status,
            owner: req.user._id
          }

          ticket.history.push(HistoryItem)
        }

        return ticket.save(next)
      })
    },
    function (err) {
      if (err) return apiUtils.sendApiError(res, 400, err.message)

      return apiUtils.sendApiSuccess(res)
    }
  )
}

ticketsV2.delete = function (req, res) {
  const uid = req.params.uid
  if (!uid) return apiUtils.sendApiError(res, 400, 'Invalid Parameters')

  Models.Ticket.softDeleteUid(uid, function (err, success) {
    if (err) return apiUtils.sendApiError(res, 500, err.message)
    if (!success) return apiUtils.sendApiError(res, 500, 'Unable to delete ticket')

    return apiUtils.sendApiSuccess(res, { deleted: true })
  })
}

ticketsV2.permDelete = function (req, res) {
  const id = req.params.id
  if (!id) return apiUtils.sendApiError(res, 400, 'Invalid Parameters')

  Models.Ticket.deleteOne({ _id: id }, function (err, success) {
    if (err) return apiUtils.sendApiError(res, 400, err.message)
    if (!success) return apiUtils.sendApiError(res, 400, 'Unable to delete ticket')

    return apiUtils.sendApiSuccess(res, { deleted: true })
  })
}

ticketsV2.transferToThirdParty = async (req, res) => {
  const uid = req.params.uid
  if (!uid) return apiUtils.sendApiError(res, 400, 'Invalid Parameters')

  try {
    const ticket = await Models.Ticket.findOne({ uid })
    if (!ticket) return apiUtils.sendApiError(res, 400, 'Ticket not found')

    ticket.status = 3
    await ticket.save()

    const request = require('axios')
    const nconf = require('nconf')
    const thirdParty = nconf.get('thirdParty')
    const url = thirdParty.url + '/api/v2/tickets'

    const ticketObj = {
      subject: ticket.subject,
      description: ticket.issue,
      email: ticket.owner.email,
      status: 2,
      priority: 2
    }

    await request.post(url, ticketObj, { auth: { username: thirdParty.apikey, password: '1' } })
    return apiUtils.sendApiSuccess(res)
  } catch (error) {
    return apiUtils.sendApiError(res, 500, error.message)
  }
}

ticketsV2.info = {}
ticketsV2.info.types = async (req, res) => {
  try {
    const ticketTypes = await Models.TicketType.find({})
    const priorities = await Models.Priority.find({})

    return apiUtils.sendApiSuccess(res, { ticketTypes, priorities })
  } catch (err) {
    logger.warn(err)
    return apiUtils.sendApiError(res, 500, err.message)
  }
}

ticketsV2.info.tags = async (req, res) => {
  try {
    const tags = await Models.TicketTags.find({}).sort('normalized')

    return apiUtils.sendApiSuccess(res, { tags })
  } catch (err) {
    logger.warn(err)
    return apiUtils.sendApiError(res, 500, err.message)
  }
}

// Time Tracking Endpoints
ticketsV2.setEstimatedHours = async (req, res) => {
  const uid = req.params.uid
  const hours = req.body.hours

  if (!uid || hours === undefined || hours === null) {
    return apiUtils.sendApiError(res, 400, 'Invalid Parameters')
  }

  try {
    const ticket = await Models.Ticket.getTicketByUid(uid)
    if (!ticket) return apiUtils.sendApiError(res, 404, 'Ticket not found')

    await ticket.setEstimatedHours(req.user._id, parseFloat(hours))
    await ticket.save()

    const updatedTicket = await Models.Ticket.getTicketByUid(uid)
    return apiUtils.sendApiSuccess(res, { ticket: updatedTicket })
  } catch (err) {
    logger.warn(err)
    return apiUtils.sendApiError(res, 500, err.message)
  }
}

ticketsV2.addTimeEntry = async (req, res) => {
  const uid = req.params.uid
  const { hours, description } = req.body

  if (!uid || !hours || !description) {
    return apiUtils.sendApiError(res, 400, 'Invalid Parameters - hours and description are required')
  }

  try {
    const ticket = await Models.Ticket.getTicketByUid(uid)
    if (!ticket) return apiUtils.sendApiError(res, 404, 'Ticket not found')

    await ticket.addTimeEntry(req.user._id, parseFloat(hours), description)
    await ticket.save()

    const updatedTicket = await Models.Ticket.getTicketByUid(uid)
    return apiUtils.sendApiSuccess(res, { ticket: updatedTicket })
  } catch (err) {
    logger.warn(err)
    return apiUtils.sendApiError(res, 500, err.message)
  }
}

ticketsV2.updateTimeEntry = async (req, res) => {
  const uid = req.params.uid
  const timeEntryId = req.params.timeEntryId
  const { hours, description } = req.body

  if (!uid || !timeEntryId) {
    return apiUtils.sendApiError(res, 400, 'Invalid Parameters')
  }

  try {
    const ticket = await Models.Ticket.getTicketByUid(uid)
    if (!ticket) return apiUtils.sendApiError(res, 404, 'Ticket not found')

    await ticket.updateTimeEntry(req.user._id, timeEntryId, parseFloat(hours), description)
    await ticket.save()

    const updatedTicket = await Models.Ticket.getTicketByUid(uid)
    return apiUtils.sendApiSuccess(res, { ticket: updatedTicket })
  } catch (err) {
    logger.warn(err)
    return apiUtils.sendApiError(res, 500, err.message)
  }
}

ticketsV2.deleteTimeEntry = async (req, res) => {
  const uid = req.params.uid
  const timeEntryId = req.params.timeEntryId

  if (!uid || !timeEntryId) {
    return apiUtils.sendApiError(res, 400, 'Invalid Parameters')
  }

  try {
    const ticket = await Models.Ticket.getTicketByUid(uid)
    if (!ticket) return apiUtils.sendApiError(res, 404, 'Ticket not found')

    await ticket.removeTimeEntry(req.user._id, timeEntryId)
    await ticket.save()

    const updatedTicket = await Models.Ticket.getTicketByUid(uid)
    return apiUtils.sendApiSuccess(res, { ticket: updatedTicket })
  } catch (err) {
    logger.warn(err)
    return apiUtils.sendApiError(res, 500, err.message)
  }
}

// Time Tracking Stats
ticketsV2.getTimeTrackingStats = async (req, res) => {
  try {
    const timespan = parseInt(req.params.timespan) || 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - timespan)

    // Get all tickets with time tracking data in the timespan
    const tickets = await Models.Ticket.find({
      $or: [
        { estimatedHours: { $exists: true, $gt: 0 } },
        { 'timeEntries.0': { $exists: true } }
      ],
      date: { $gte: startDate },
      deleted: false
    }).populate('timeEntries.owner', 'fullname email image')

    // Calculate statistics
    let totalEstimated = 0
    let totalConsumed = 0
    let ticketsWithTracking = 0
    const consultantStats = {}

    tickets.forEach(ticket => {
      if (ticket.estimatedHours > 0 || (ticket.timeEntries && ticket.timeEntries.length > 0)) {
        ticketsWithTracking++

        if (ticket.estimatedHours) {
          totalEstimated += ticket.estimatedHours
        }

        if (ticket.timeEntries && ticket.timeEntries.length > 0) {
          ticket.timeEntries.forEach(entry => {
            if (!entry.deleted) {
              totalConsumed += entry.hours

              // Track per consultant
              if (entry.owner) {
                const ownerId = entry.owner._id.toString()
                if (!consultantStats[ownerId]) {
                  consultantStats[ownerId] = {
                    name: entry.owner.fullname,
                    email: entry.owner.email,
                    hours: 0,
                    entries: 0
                  }
                }
                consultantStats[ownerId].hours += entry.hours
                consultantStats[ownerId].entries++
              }
            }
          })
        }
      }
    })

    // Get top 5 consultants by hours
    const topConsultants = Object.values(consultantStats)
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5)

    const stats = {
      totalEstimated: Math.round(totalEstimated * 10) / 10,
      totalConsumed: Math.round(totalConsumed * 10) / 10,
      percentageComplete: totalEstimated > 0 ? Math.round((totalConsumed / totalEstimated) * 100) : 0,
      ticketsWithTracking,
      topConsultants,
      timespan
    }

    return res.json({ success: true, stats })
  } catch (error) {
    logger.error('Error getting time tracking stats:', error)
    return apiUtils.sendApiError(res, 500, error.message)
  }
}

// Time Tracking Stats By Group
ticketsV2.getTimeTrackingStatsByGroup = async (req, res) => {
  try {
    const timespan = parseInt(req.params.timespan) || 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - timespan)

    // Get all tickets with time tracking data in the timespan
    const tickets = await Models.Ticket.find({
      $or: [
        { estimatedHours: { $exists: true, $gt: 0 } },
        { 'timeEntries.0': { $exists: true } }
      ],
      date: { $gte: startDate },
      deleted: false
    }).populate('timeEntries.owner', 'fullname email image')
      .populate('group', 'name')

    // Calculate statistics grouped by group
    const groupStats = {}

    tickets.forEach(ticket => {
      if (ticket.estimatedHours > 0 || (ticket.timeEntries && ticket.timeEntries.length > 0)) {
        const groupId = ticket.group ? ticket.group._id.toString() : 'unassigned'
        const groupName = ticket.group ? ticket.group.name : 'Sin Grupo'

        if (!groupStats[groupId]) {
          groupStats[groupId] = {
            groupId,
            groupName,
            totalEstimated: 0,
            totalConsumed: 0,
            ticketCount: 0
          }
        }

        groupStats[groupId].ticketCount++

        if (ticket.estimatedHours) {
          groupStats[groupId].totalEstimated += ticket.estimatedHours
        }

        if (ticket.timeEntries && ticket.timeEntries.length > 0) {
          ticket.timeEntries.forEach(entry => {
            if (!entry.deleted) {
              groupStats[groupId].totalConsumed += entry.hours
            }
          })
        }
      }
    })

    // Format and sort groups by total consumed hours
    const groupsArray = Object.values(groupStats).map(group => ({
      groupId: group.groupId,
      groupName: group.groupName,
      totalEstimated: Math.round(group.totalEstimated * 10) / 10,
      totalConsumed: Math.round(group.totalConsumed * 10) / 10,
      percentageComplete: group.totalEstimated > 0
        ? Math.round((group.totalConsumed / group.totalEstimated) * 100)
        : 0,
      ticketCount: group.ticketCount
    })).sort((a, b) => b.totalConsumed - a.totalConsumed)

    return res.json({ success: true, groups: groupsArray, timespan })
  } catch (error) {
    logger.error('Error getting time tracking stats by group:', error)
    return apiUtils.sendApiError(res, 500, error.message)
  }
}

module.exports = ticketsV2
