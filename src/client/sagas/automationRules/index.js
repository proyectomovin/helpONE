import { call, put, takeLatest } from 'redux-saga/effects'
import {
  CREATE_AUTOMATION_RULE,
  DELETE_AUTOMATION_RULE,
  FETCH_AUTOMATION_RULES,
  FETCH_AUTOMATION_EVENTS,
  HIDE_MODAL,
  TOGGLE_AUTOMATION_RULE,
  UPDATE_AUTOMATION_RULE
} from 'actions/types'

import api from '../../api'
import Log from '../../logger'
import helpers from 'lib/helpers'

function * fetchAutomationRules ({ payload }) {
  try {
    yield put({ type: FETCH_AUTOMATION_RULES.PENDING })
    const response = yield call(api.automationRules.fetch, payload)
    yield put({ type: FETCH_AUTOMATION_RULES.SUCCESS, response })
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error.message || error
    helpers.UI.showSnackbar(`Error: ${errorText}`, true)
    yield put({ type: FETCH_AUTOMATION_RULES.ERROR, error })
    Log.error(errorText, error)
  }
}

function * fetchAutomationEvents ({ payload }) {
  try {
    yield put({ type: FETCH_AUTOMATION_EVENTS.PENDING })
    const response = yield call(api.automationRules.fetchEvents, payload)
    yield put({ type: FETCH_AUTOMATION_EVENTS.SUCCESS, response })
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error.message || error
    helpers.UI.showSnackbar(`Error: ${errorText}`, true)
    yield put({ type: FETCH_AUTOMATION_EVENTS.ERROR, error })
    Log.error(errorText, error)
  }
}

function * createAutomationRule ({ payload }) {
  try {
    yield put({ type: CREATE_AUTOMATION_RULE.PENDING })
    const response = yield call(api.automationRules.create, payload)
    yield put({ type: CREATE_AUTOMATION_RULE.SUCCESS, response })
    yield put({ type: HIDE_MODAL.ACTION })
    helpers.UI.showSnackbar('Regla de automatización creada exitosamente')
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error.message || error
    helpers.UI.showSnackbar(`Error: ${errorText}`, true)
    yield put({ type: CREATE_AUTOMATION_RULE.ERROR, error })
    Log.error(errorText, error)
  }
}

function * updateAutomationRule ({ payload }) {
  try {
    yield put({ type: UPDATE_AUTOMATION_RULE.PENDING })
    const response = yield call(api.automationRules.update, payload)
    yield put({ type: UPDATE_AUTOMATION_RULE.SUCCESS, response })
    yield put({ type: HIDE_MODAL.ACTION })
    helpers.UI.showSnackbar('Regla de automatización actualizada exitosamente')
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error.message || error
    helpers.UI.showSnackbar(`Error: ${errorText}`, true)
    yield put({ type: UPDATE_AUTOMATION_RULE.ERROR, error })
    Log.error(errorText, error)
  }
}

function * toggleAutomationRule ({ payload }) {
  try {
    yield put({ type: TOGGLE_AUTOMATION_RULE.PENDING })
    const response = yield call(api.automationRules.toggle, payload)
    yield put({ type: TOGGLE_AUTOMATION_RULE.SUCCESS, response })
    const status = payload.isActive ? 'activada' : 'desactivada'
    helpers.UI.showSnackbar(`Regla ${status} exitosamente`)
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error.message || error
    helpers.UI.showSnackbar(`Error: ${errorText}`, true)
    yield put({ type: TOGGLE_AUTOMATION_RULE.ERROR, error })
    Log.error(errorText, error)
  }
}

function * deleteAutomationRule ({ payload }) {
  try {
    yield put({ type: DELETE_AUTOMATION_RULE.PENDING })
    const response = yield call(api.automationRules.delete, payload)
    yield put({ type: DELETE_AUTOMATION_RULE.SUCCESS, payload, response })
    yield put({ type: HIDE_MODAL.ACTION })
    helpers.UI.showSnackbar('Regla de automatización eliminada exitosamente')
  } catch (error) {
    const errorText = error.response ? error.response.data.error : error.message || error
    helpers.UI.showSnackbar(`Error: ${errorText}`, true)
    yield put({ type: DELETE_AUTOMATION_RULE.ERROR, error })
    Log.error(errorText, error)
  }
}

export default function * watcher () {
  yield takeLatest(FETCH_AUTOMATION_RULES.ACTION, fetchAutomationRules)
  yield takeLatest(FETCH_AUTOMATION_EVENTS.ACTION, fetchAutomationEvents)
  yield takeLatest(CREATE_AUTOMATION_RULE.ACTION, createAutomationRule)
  yield takeLatest(UPDATE_AUTOMATION_RULE.ACTION, updateAutomationRule)
  yield takeLatest(TOGGLE_AUTOMATION_RULE.ACTION, toggleAutomationRule)
  yield takeLatest(DELETE_AUTOMATION_RULE.ACTION, deleteAutomationRule)
}
