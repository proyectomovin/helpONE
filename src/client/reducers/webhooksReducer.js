import { Map, List, fromJS } from 'immutable'
import { handleActions } from 'redux-actions'
import {
  FETCH_WEBHOOKS,
  CREATE_WEBHOOK,
  UPDATE_WEBHOOK,
  DELETE_WEBHOOK
} from 'actions/types'

const initialState = {
  byId: Map(),
  allIds: List(),
  loading: false,
  loaded: false
}

const reducer = handleActions(
  {
    [FETCH_WEBHOOKS.PENDING]: state => ({
      ...state,
      loading: true
    }),

    [FETCH_WEBHOOKS.SUCCESS]: (state, action) => {
      const webhooks = action.response && action.response.webhooks ? action.response.webhooks : []

      const byId = Map().withMutations(map => {
        webhooks.forEach(webhook => {
          if (webhook && webhook._id) {
            map.set(webhook._id, fromJS(webhook))
          }
        })
      })

      const allIds = List(webhooks.map(webhook => webhook._id))

      return {
        ...state,
        byId,
        allIds,
        loading: false,
        loaded: true
      }
    },

    [FETCH_WEBHOOKS.ERROR]: state => ({
      ...state,
      loading: false
    }),

    [CREATE_WEBHOOK.SUCCESS]: (state, action) => {
      const webhook = action.response && action.response.webhook ? action.response.webhook : action.response
      if (!webhook || !webhook._id) return state

      const nextById = state.byId.set(webhook._id, fromJS(webhook))
      const alreadyExists = state.allIds.find(id => id === webhook._id)
      const nextIds = alreadyExists ? state.allIds : state.allIds.push(webhook._id)

      return {
        ...state,
        byId: nextById,
        allIds: nextIds
      }
    },

    [UPDATE_WEBHOOK.SUCCESS]: (state, action) => {
      const webhook = action.response && action.response.webhook ? action.response.webhook : action.response
      if (!webhook || !webhook._id) return state

      return {
        ...state,
        byId: state.byId.set(webhook._id, fromJS(webhook))
      }
    },

    [DELETE_WEBHOOK.SUCCESS]: (state, action) => {
      const webhookId = action.payload && action.payload._id ? action.payload._id : action.payload
      if (!webhookId) return state

      return {
        ...state,
        byId: state.byId.delete(webhookId),
        allIds: state.allIds.filter(id => id !== webhookId)
      }
    }
  },
  initialState
)

export default reducer
