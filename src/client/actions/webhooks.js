import { createAction } from 'redux-actions'
import {
  FETCH_WEBHOOKS,
  CREATE_WEBHOOK,
  UPDATE_WEBHOOK,
  DELETE_WEBHOOK,
  TEST_WEBHOOK
} from 'actions/types'

export const fetchWebhooks = createAction(FETCH_WEBHOOKS.ACTION, payload => payload, () => ({ thunk: true }))
export const createWebhook = createAction(CREATE_WEBHOOK.ACTION)
export const updateWebhook = createAction(UPDATE_WEBHOOK.ACTION)
export const deleteWebhook = createAction(DELETE_WEBHOOK.ACTION, payload => payload, () => ({ thunk: true }))
export const testWebhook = createAction(TEST_WEBHOOK.ACTION)
