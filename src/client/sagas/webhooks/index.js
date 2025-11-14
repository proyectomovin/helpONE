import { call, put, takeLatest } from 'redux-saga/effects'
import {
  CREATE_WEBHOOK,
  DELETE_WEBHOOK,
  FETCH_WEBHOOKS,
  HIDE_MODAL,
  TEST_WEBHOOK,
  UPDATE_WEBHOOK
} from 'actions/types'

import api from '../../api'
import Log from '../../logger'
import helpers from 'lib/helpers'

function * fetchWebhooks ({ payload }) {
  try {
    yield put({ type: FETCH_WEBHOOKS.PENDING })
    const response = yield call(api.webhooks.fetch, payload)
    yield put({ type: FETCH_WEBHOOKS.SUCCESS, response })
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error.message || error
    helpers.UI.showSnackbar(`Error: ${errorText}`, true)
    yield put({ type: FETCH_WEBHOOKS.ERROR, error })
    Log.error(errorText, error)
  }
}

function * createWebhook ({ payload }) {
  try {
    yield put({ type: CREATE_WEBHOOK.PENDING })
    const response = yield call(api.webhooks.create, payload)
    yield put({ type: CREATE_WEBHOOK.SUCCESS, response })
    yield put({ type: HIDE_MODAL.ACTION })
    helpers.UI.showSnackbar('Webhook created successfully')
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error.message || error
    helpers.UI.showSnackbar(`Error: ${errorText}`, true)
    yield put({ type: CREATE_WEBHOOK.ERROR, error })
    Log.error(errorText, error)
  }
}

function * updateWebhook ({ payload }) {
  try {
    yield put({ type: UPDATE_WEBHOOK.PENDING })
    const response = yield call(api.webhooks.update, payload)
    yield put({ type: UPDATE_WEBHOOK.SUCCESS, response })
    yield put({ type: HIDE_MODAL.ACTION })
    helpers.UI.showSnackbar('Webhook updated successfully')
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error.message || error
    helpers.UI.showSnackbar(`Error: ${errorText}`, true)
    yield put({ type: UPDATE_WEBHOOK.ERROR, error })
    Log.error(errorText, error)
  }
}

function * deleteWebhook ({ payload }) {
  try {
    yield put({ type: DELETE_WEBHOOK.PENDING })
    const response = yield call(api.webhooks.delete, payload)
    yield put({ type: DELETE_WEBHOOK.SUCCESS, payload, response })
    yield put({ type: HIDE_MODAL.ACTION })
    helpers.UI.showSnackbar('Webhook deleted successfully')
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error.message || error
    helpers.UI.showSnackbar(`Error: ${errorText}`, true)
    yield put({ type: DELETE_WEBHOOK.ERROR, error })
    Log.error(errorText, error)
  }
}

function * testWebhook ({ payload }) {
  try {
    yield put({ type: TEST_WEBHOOK.PENDING })
    const response = yield call(api.webhooks.test, payload)
    yield put({ type: TEST_WEBHOOK.SUCCESS, response })
    yield put({ type: HIDE_MODAL.ACTION })
    const message = response && response.message ? response.message : 'Test event sent successfully'
    helpers.UI.showSnackbar(message)
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error.message || error
    helpers.UI.showSnackbar(`Error: ${errorText}`, true)
    yield put({ type: TEST_WEBHOOK.ERROR, error })
    Log.error(errorText, error)
  }
}

export default function * watcher () {
  yield takeLatest(FETCH_WEBHOOKS.ACTION, fetchWebhooks)
  yield takeLatest(CREATE_WEBHOOK.ACTION, createWebhook)
  yield takeLatest(UPDATE_WEBHOOK.ACTION, updateWebhook)
  yield takeLatest(DELETE_WEBHOOK.ACTION, deleteWebhook)
  yield takeLatest(TEST_WEBHOOK.ACTION, testWebhook)
}
