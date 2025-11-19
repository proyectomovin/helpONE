import { Map, List, fromJS } from 'immutable'
import { handleActions } from 'redux-actions'
import {
  FETCH_AUTOMATION_RULES,
  FETCH_AUTOMATION_EVENTS,
  CREATE_AUTOMATION_RULE,
  UPDATE_AUTOMATION_RULE,
  DELETE_AUTOMATION_RULE,
  TOGGLE_AUTOMATION_RULE
} from 'actions/types'

const initialState = {
  byId: Map(),
  allIds: List(),
  events: List(),
  loading: false,
  loaded: false,
  eventsLoaded: false
}

const reducer = handleActions(
  {
    [FETCH_AUTOMATION_RULES.PENDING]: state => ({
      ...state,
      loading: true
    }),

    [FETCH_AUTOMATION_RULES.SUCCESS]: (state, action) => {
      const rules = action.response && action.response.rules ? action.response.rules : []

      const byId = Map().withMutations(map => {
        rules.forEach(rule => {
          if (rule && rule._id) {
            map.set(rule._id, fromJS(rule))
          }
        })
      })

      const allIds = List(rules.map(rule => rule._id))

      return {
        ...state,
        byId,
        allIds,
        loading: false,
        loaded: true
      }
    },

    [FETCH_AUTOMATION_RULES.ERROR]: state => ({
      ...state,
      loading: false
    }),

    [FETCH_AUTOMATION_EVENTS.SUCCESS]: (state, action) => {
      const events = action.response && action.response.events ? action.response.events : []

      return {
        ...state,
        events: List(events),
        eventsLoaded: true
      }
    },

    [CREATE_AUTOMATION_RULE.SUCCESS]: (state, action) => {
      const rule = action.response && action.response.rule ? action.response.rule : action.response
      if (!rule || !rule._id) return state

      const nextById = state.byId.set(rule._id, fromJS(rule))
      const alreadyExists = state.allIds.find(id => id === rule._id)
      const nextIds = alreadyExists ? state.allIds : state.allIds.push(rule._id)

      return {
        ...state,
        byId: nextById,
        allIds: nextIds
      }
    },

    [UPDATE_AUTOMATION_RULE.SUCCESS]: (state, action) => {
      const rule = action.response && action.response.rule ? action.response.rule : action.response
      if (!rule || !rule._id) return state

      return {
        ...state,
        byId: state.byId.set(rule._id, fromJS(rule))
      }
    },

    [TOGGLE_AUTOMATION_RULE.SUCCESS]: (state, action) => {
      const rule = action.response && action.response.rule ? action.response.rule : action.response
      if (!rule || !rule._id) return state

      return {
        ...state,
        byId: state.byId.set(rule._id, fromJS(rule))
      }
    },

    [DELETE_AUTOMATION_RULE.SUCCESS]: (state, action) => {
      const ruleId = action.payload && action.payload._id ? action.payload._id : action.payload
      if (!ruleId) return state

      return {
        ...state,
        byId: state.byId.delete(ruleId),
        allIds: state.allIds.filter(id => id !== ruleId)
      }
    }
  },
  initialState
)

export default reducer
