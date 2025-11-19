/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Author:     Claude
 *  Created:    11/19/2025
 *  Copyright (c) 2014-2025. All rights reserved.
 */

import { createAction } from 'redux-actions'
import {
  FETCH_AUTOMATION_RULES,
  FETCH_AUTOMATION_EVENTS,
  CREATE_AUTOMATION_RULE,
  UPDATE_AUTOMATION_RULE,
  DELETE_AUTOMATION_RULE,
  TOGGLE_AUTOMATION_RULE
} from './types'

export const fetchAutomationRules = createAction(FETCH_AUTOMATION_RULES.ACTION)

export const fetchAutomationEvents = createAction(FETCH_AUTOMATION_EVENTS.ACTION)

export const createAutomationRule = createAction(
  CREATE_AUTOMATION_RULE.ACTION,
  payload => payload,
  () => ({ thunk: true })
)

export const updateAutomationRule = createAction(
  UPDATE_AUTOMATION_RULE.ACTION,
  payload => payload,
  () => ({ thunk: true })
)

export const deleteAutomationRule = createAction(
  DELETE_AUTOMATION_RULE.ACTION,
  payload => payload,
  () => ({ thunk: true })
)

export const toggleAutomationRule = createAction(
  TOGGLE_AUTOMATION_RULE.ACTION,
  payload => payload,
  () => ({ thunk: true })
)
