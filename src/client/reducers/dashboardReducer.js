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
 *  Updated:    7/1/22 12:16 AM
 *  Copyright (c) 2014-2022. Trudesk, Inc (Chris Brame) All rights reserved.
 */

import { fromJS, Map, List } from 'immutable'
import { handleActions } from 'redux-actions'
import { sortBy, map } from 'lodash'
import {
  FETCH_DASHBOARD_DATA,
  FETCH_DASHBOARD_OVERDUE_TICKETS,
  FETCH_DASHBOARD_TOP_GROUPS,
  FETCH_DASHBOARD_TOP_TAGS,
  FETCH_DASHBOARD_TOP_TYPES,
  FETCH_DASHBOARD_TOP_ASSIGNEES,
  FETCH_DASHBOARD_TOP_PRIORITIES,
  FETCH_DASHBOARD_TOP_OWNERS,
  FETCH_DASHBOARD_TIMETRACKING_STATS,
  FETCH_DASHBOARD_TIMETRACKING_BY_GROUP
} from 'actions/types'

const initialState = {
  loading: false,
  lastUpdated: null,
  ticketBreakdownData: List([]),
  mostActiveTicket: null,
  mostAssignee: null,
  mostCommenter: null,
  mostRequester: null,
  ticketAvg: null,
  ticketCount: 0,
  closedCount: 0,

  loadingTopGroups: false,
  topGroups: List([]),

  loadingTopTags: false,
  topTags: List([]),

  loadingOverdueTickets: false,
  overdueTickets: List([]),

  loadingTopTypes: false,
  topTypes: List([]),

  loadingTopAssignees: false,
  topAssignees: List([]),

  loadingTopPriorities: false,
  topPriorities: List([]),

  loadingTopOwners: false,
  topOwners: List([]),

  loadingTimeTrackingStats: false,
  timeTrackingStats: Map({
    totalEstimated: 0,
    totalConsumed: 0,
    percentageComplete: 0,
    ticketsWithTracking: 0,
    topConsultants: List([])
  }),

  loadingTimeTrackingByGroup: false,
  timeTrackingByGroup: List([])
}

const reducer = handleActions(
  {
    [FETCH_DASHBOARD_DATA.PENDING]: state => {
      return {
        ...state,
        loading: true
      }
    },

    [FETCH_DASHBOARD_DATA.SUCCESS]: (state, action) => {
      return {
        ...state,
        loading: false,
        lastUpdated: action.response.lastUpdated,
        ticketBreakdownData: fromJS(action.response.data),
        mostActiveTicket: fromJS(action.response.mostActiveTicket),
        mostCommenter: fromJS(action.response.mostCommenter),
        mostRequester: fromJS(action.response.mostRequester),
        mostAssignee: fromJS(action.response.mostAssignee),
        ticketAvg: fromJS(action.response.ticketAvg),
        ticketCount: action.response.ticketCount,
        closedCount: action.response.closedCount
      }
    },

    [FETCH_DASHBOARD_TOP_GROUPS.PENDING]: state => {
      return {
        ...state,
        loadingTopGroups: true
      }
    },

    [FETCH_DASHBOARD_TOP_GROUPS.SUCCESS]: (state, action) => {
      const items = action.response.items
      let top5 = sortBy(items, i => i.count)
        .reverse()
        .slice(0, 5)

      top5 = map(top5, v => [v.name, v.count])

      return {
        ...state,
        loadingTopGroups: false,
        topGroups: fromJS(top5)
      }
    },

    [FETCH_DASHBOARD_TOP_TAGS.PENDING]: state => {
      return {
        ...state,
        loadingTopTags: true
      }
    },

    [FETCH_DASHBOARD_TOP_TAGS.SUCCESS]: (state, action) => {
      const items = action.response.tags
      const topTags = map(items, (v, k) => [k, v])
      return {
        ...state,
        loadingTopTags: false,
        topTags: fromJS(topTags)
      }
    },

    [FETCH_DASHBOARD_OVERDUE_TICKETS.PENDING]: state => {
      return {
        ...state,
        loadingOverdueTickets: true
      }
    },

    [FETCH_DASHBOARD_OVERDUE_TICKETS.SUCCESS]: (state, action) => {
      if (action.response.success && action.response.error) {
        return { ...state, loadingOverdueTickets: false, overdueTickets: initialState.overdueTickets }
      }

      return {
        ...state,
        loadingOverdueTickets: false,
        overdueTickets: fromJS(action.response.tickets)
      }
    },

    [FETCH_DASHBOARD_TOP_TYPES.PENDING]: state => {
      return {
        ...state,
        loadingTopTypes: true
      }
    },

    [FETCH_DASHBOARD_TOP_TYPES.SUCCESS]: (state, action) => {
      const items = action.response.items
      let topTypes = sortBy(items, i => i.count)
        .reverse()
        .slice(0, 10)

      topTypes = map(topTypes, v => [v.name, v.count])

      return {
        ...state,
        loadingTopTypes: false,
        topTypes: fromJS(topTypes)
      }
    },

    [FETCH_DASHBOARD_TOP_ASSIGNEES.PENDING]: state => {
      return {
        ...state,
        loadingTopAssignees: true
      }
    },

    [FETCH_DASHBOARD_TOP_ASSIGNEES.SUCCESS]: (state, action) => {
      const items = action.response.items
      let topAssignees = sortBy(items, i => i.count)
        .reverse()
        .slice(0, 10)

      topAssignees = map(topAssignees, v => [v.name, v.count])

      return {
        ...state,
        loadingTopAssignees: false,
        topAssignees: fromJS(topAssignees)
      }
    },

    [FETCH_DASHBOARD_TOP_PRIORITIES.PENDING]: state => {
      return {
        ...state,
        loadingTopPriorities: true
      }
    },

    [FETCH_DASHBOARD_TOP_PRIORITIES.SUCCESS]: (state, action) => {
      const items = action.response.items
      let topPriorities = sortBy(items, i => i.count)
        .reverse()
        .slice(0, 10)

      topPriorities = map(topPriorities, v => [v.name, v.count])

      return {
        ...state,
        loadingTopPriorities: false,
        topPriorities: fromJS(topPriorities)
      }
    },

    [FETCH_DASHBOARD_TOP_OWNERS.PENDING]: state => {
      return {
        ...state,
        loadingTopOwners: true
      }
    },

    [FETCH_DASHBOARD_TOP_OWNERS.SUCCESS]: (state, action) => {
      const items = action.response.items
      let topOwners = sortBy(items, i => i.count)
        .reverse()
        .slice(0, 10)

      topOwners = map(topOwners, v => [v.name, v.count])

      return {
        ...state,
        loadingTopOwners: false,
        topOwners: fromJS(topOwners)
    [FETCH_DASHBOARD_TIMETRACKING_STATS.PENDING]: state => {
      return {
        ...state,
        loadingTimeTrackingStats: true
      }
    },

    [FETCH_DASHBOARD_TIMETRACKING_STATS.SUCCESS]: (state, action) => {
      return {
        ...state,
        loadingTimeTrackingStats: false,
        timeTrackingStats: fromJS(action.response.stats)
      }
    },

    [FETCH_DASHBOARD_TIMETRACKING_BY_GROUP.PENDING]: state => {
      return {
        ...state,
        loadingTimeTrackingByGroup: true
      }
    },

    [FETCH_DASHBOARD_TIMETRACKING_BY_GROUP.SUCCESS]: (state, action) => {
      return {
        ...state,
        loadingTimeTrackingByGroup: false,
        timeTrackingByGroup: fromJS(action.response.groups)
      }
    }
  },
  initialState
)

export default reducer
