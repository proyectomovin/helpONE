/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Updated:    2025-11-27
 *  Copyright (c) 2014-2025. All rights reserved.
 */

/**
 * Rule Evaluation Engine
 * Core system for evaluating notification rules and executing actions
 */

var NotificationRule = require('../../models/notificationRule')
var conditionsHelper = require('./conditions')
var actionsHelper = require('./actions')
var winston = require('../../logger')

var ruleEngine = {}

/**
 * Process event and execute matching rules
 * @param {String} eventType - Type of event (e.g., 'ticket-created')
 * @param {Object} context - Event context data
 * @param {Object} context.ticket - Ticket object (if applicable)
 * @param {Object} context.user - User object (if applicable)
 * @param {Object} context.comment - Comment object (if applicable)
 * @param {Object} context.previousData - Previous state (for change detection)
 * @param {Object} context.baseUrl - Base URL for links
 * @param {Function} callback - Callback function
 */
ruleEngine.processEvent = function (eventType, context, callback) {
  if (!eventType || !context) {
    return callback(new Error('Event type and context are required'))
  }

  winston.debug('Processing event: ' + eventType)

  // Get active rules for this event type
  NotificationRule.getActiveRulesForEvent(eventType, function (err, rules) {
    if (err) {
      winston.error('Error getting rules for event: ' + err.message)
      return callback(err)
    }

    if (!rules || rules.length === 0) {
      winston.debug('No active rules found for event: ' + eventType)
      return callback(null, { executedRules: 0, results: [] })
    }

    winston.debug('Found ' + rules.length + ' active rules for event: ' + eventType)

    // Process each rule
    var results = []
    var executedCount = 0

    processRulesSequentially(rules, context, function (ruleResults) {
      results = ruleResults
      executedCount = ruleResults.filter(function (r) { return r.executed }).length

      winston.debug('Event processing completed. Executed ' + executedCount + ' rules.')

      callback(null, {
        executedRules: executedCount,
        totalRules: rules.length,
        results: results
      })
    })
  })
}

/**
 * Process rules sequentially (respecting priority)
 */
function processRulesSequentially(rules, context, callback) {
  var results = []
  var currentIndex = 0

  function processNext() {
    if (currentIndex >= rules.length) {
      return callback(results)
    }

    var rule = rules[currentIndex]
    currentIndex++

    ruleEngine.evaluateRule(rule, context, function (err, result) {
      results.push(result)

      // Continue to next rule
      setImmediate(processNext)
    })
  }

  processNext()
}

/**
 * Evaluate a single rule
 * @param {Object} rule - NotificationRule object
 * @param {Object} context - Event context
 * @param {Function} callback - Callback function
 */
ruleEngine.evaluateRule = function (rule, context, callback) {
  var startTime = Date.now()

  winston.debug('Evaluating rule: ' + rule.name + ' (ID: ' + rule._id + ')')

  var result = {
    ruleId: rule._id,
    ruleName: rule.name,
    executed: false,
    conditionsMet: false,
    actionsExecuted: [],
    errors: [],
    executionTime: 0
  }

  try {
    // Check throttling
    if (rule.shouldThrottle(context)) {
      winston.debug('Rule throttled: ' + rule.name)
      result.skipped = true
      result.skipReason = 'throttled'
      result.executionTime = Date.now() - startTime

      rule.incrementExecutionCount('skipped', result.executionTime, null, function () {})

      return callback(null, result)
    }

    // Evaluate conditions
    var conditionsMet = ruleEngine.evaluateConditions(rule, context)
    result.conditionsMet = conditionsMet

    if (!conditionsMet) {
      winston.debug('Rule conditions not met: ' + rule.name)
      result.executionTime = Date.now() - startTime
      return callback(null, result)
    }

    winston.debug('Rule conditions met: ' + rule.name + '. Executing actions...')

    // Execute actions
    ruleEngine.executeActions(rule, context, function (err, actionResults) {
      result.executed = true
      result.actionsExecuted = actionResults || []

      if (err) {
        result.errors.push(err.message || err)
        winston.error('Error executing actions for rule ' + rule.name + ': ' + err.message)
      }

      result.executionTime = Date.now() - startTime

      // Update rule execution stats
      var status = err ? 'failed' : (result.errors.length > 0 ? 'partial' : 'success')
      rule.incrementExecutionCount(status, result.executionTime, err, function () {})

      winston.debug('Rule executed: ' + rule.name + ' (Status: ' + status + ', Time: ' + result.executionTime + 'ms)')

      callback(null, result)
    })
  } catch (err) {
    winston.error('Error evaluating rule ' + rule.name + ': ' + err.message)
    result.errors.push(err.message)
    result.executionTime = Date.now() - startTime

    rule.incrementExecutionCount('failed', result.executionTime, err, function () {})

    callback(err, result)
  }
}

/**
 * Evaluate rule conditions
 * @param {Object} rule - NotificationRule object
 * @param {Object} context - Event context
 * @returns {Boolean} - True if all conditions are met
 */
ruleEngine.evaluateConditions = function (rule, context) {
  // If no conditions, rule always matches
  if ((!rule.conditions || rule.conditions.length === 0) &&
      (!rule.conditionGroups || rule.conditionGroups.length === 0)) {
    return true
  }

  // Evaluate simple conditions (AND logic)
  if (rule.conditions && rule.conditions.length > 0) {
    var simpleConditionsMet = rule.conditions.every(function (condition) {
      return conditionsHelper.evaluateCondition(condition, context)
    })

    if (!simpleConditionsMet) {
      return false
    }
  }

  // Evaluate condition groups (OR between groups, AND within groups)
  if (rule.conditionGroups && rule.conditionGroups.length > 0) {
    var groupsMet = rule.conditionGroups.some(function (group) {
      if (group.operator === 'AND') {
        return group.conditions.every(function (condition) {
          return conditionsHelper.evaluateCondition(condition, context)
        })
      } else if (group.operator === 'OR') {
        return group.conditions.some(function (condition) {
          return conditionsHelper.evaluateCondition(condition, context)
        })
      }
      return false
    })

    return groupsMet
  }

  return true
}

/**
 * Execute rule actions
 * @param {Object} rule - NotificationRule object
 * @param {Object} context - Event context
 * @param {Function} callback - Callback function
 */
ruleEngine.executeActions = function (rule, context, callback) {
  if (!rule.actions || rule.actions.length === 0) {
    winston.debug('No actions to execute for rule: ' + rule.name)
    return callback(null, [])
  }

  var actionResults = []
  var hasError = false

  // Execute actions sequentially
  executeActionsSequentially(rule.actions, context, function (results, error) {
    callback(error, results)
  })

  function executeActionsSequentially(actions, context, cb) {
    var results = []
    var currentIndex = 0

    function executeNext() {
      if (currentIndex >= actions.length) {
        return cb(results, hasError ? new Error('Some actions failed') : null)
      }

      var action = actions[currentIndex]
      currentIndex++

      actionsHelper.executeAction(action, context, function (err, result) {
        if (err) {
          winston.warn('Action failed: ' + action.type + ' - ' + err.message)
          hasError = true
          results.push({
            type: action.type,
            success: false,
            error: err.message
          })
        } else {
          results.push({
            type: action.type,
            success: true,
            result: result
          })
        }

        // Continue to next action
        setImmediate(executeNext)
      })
    }

    executeNext()
  }
}

/**
 * Test rule evaluation without executing actions
 * @param {String} ruleId - Rule ID
 * @param {Object} testContext - Test context data
 * @param {Function} callback - Callback function
 */
ruleEngine.testRule = function (ruleId, testContext, callback) {
  NotificationRule.findById(ruleId).exec(function (err, rule) {
    if (err) return callback(err)
    if (!rule) return callback(new Error('Rule not found'))

    winston.debug('Testing rule: ' + rule.name)

    var conditionsMet = ruleEngine.evaluateConditions(rule, testContext)

    var result = {
      ruleId: rule._id,
      ruleName: rule.name,
      conditionsMet: conditionsMet,
      conditions: [],
      actions: rule.actions.map(function (action) {
        return {
          type: action.type,
          config: action
        }
      })
    }

    // Evaluate each condition individually for debugging
    if (rule.conditions && rule.conditions.length > 0) {
      result.conditions = rule.conditions.map(function (condition) {
        var met = conditionsHelper.evaluateCondition(condition, testContext)
        var value = conditionsHelper.getFieldValue(condition.field, testContext)

        return {
          field: condition.field,
          operator: condition.operator,
          expectedValue: condition.value,
          actualValue: value,
          met: met
        }
      })
    }

    // Evaluate condition groups
    if (rule.conditionGroups && rule.conditionGroups.length > 0) {
      result.conditionGroups = rule.conditionGroups.map(function (group) {
        var groupMet = false

        if (group.operator === 'AND') {
          groupMet = group.conditions.every(function (condition) {
            return conditionsHelper.evaluateCondition(condition, testContext)
          })
        } else if (group.operator === 'OR') {
          groupMet = group.conditions.some(function (condition) {
            return conditionsHelper.evaluateCondition(condition, testContext)
          })
        }

        return {
          operator: group.operator,
          met: groupMet,
          conditions: group.conditions.map(function (condition) {
            var met = conditionsHelper.evaluateCondition(condition, testContext)
            var value = conditionsHelper.getFieldValue(condition.field, testContext)

            return {
              field: condition.field,
              operator: condition.operator,
              expectedValue: condition.value,
              actualValue: value,
              met: met
            }
          })
        }
      })
    }

    callback(null, result)
  })
}

/**
 * Validate rule configuration
 * @param {Object} ruleData - Rule data object
 * @returns {Object} - Validation result {valid: Boolean, errors: Array}
 */
ruleEngine.validateRule = function (ruleData) {
  var errors = []

  // Validate basic fields
  if (!ruleData.name || ruleData.name.trim() === '') {
    errors.push('Rule name is required')
  }

  if (!ruleData.eventType) {
    errors.push('Event type is required')
  }

  // Validate conditions
  if (ruleData.conditions && ruleData.conditions.length > 0) {
    ruleData.conditions.forEach(function (condition, index) {
      if (!condition.field) {
        errors.push('Condition ' + (index + 1) + ': field is required')
      }
      if (!condition.operator) {
        errors.push('Condition ' + (index + 1) + ': operator is required')
      }
      // Some operators don't require a value (is_empty, is_not_empty)
      if (!['is_empty', 'is_not_empty', 'changed'].includes(condition.operator)) {
        if (condition.value === undefined || condition.value === null || condition.value === '') {
          errors.push('Condition ' + (index + 1) + ': value is required for operator ' + condition.operator)
        }
      }
    })
  }

  // Validate actions
  if (!ruleData.actions || ruleData.actions.length === 0) {
    errors.push('At least one action is required')
  } else {
    ruleData.actions.forEach(function (action, index) {
      if (!action.type) {
        errors.push('Action ' + (index + 1) + ': type is required')
      }

      // Validate action-specific config
      if (action.type === 'send-email' || action.type === 'send-email-calendar') {
        if (!action.emailConfig) {
          errors.push('Action ' + (index + 1) + ': emailConfig is required for email actions')
        } else {
          if (!action.emailConfig.templateType && !action.emailConfig.templateSlug) {
            errors.push('Action ' + (index + 1) + ': emailConfig must have templateType or templateSlug')
          }
          if (!action.emailConfig.recipients) {
            errors.push('Action ' + (index + 1) + ': emailConfig.recipients is required')
          }
        }
      }

      if (action.type === 'webhook') {
        if (!action.webhookConfig || !action.webhookConfig.url) {
          errors.push('Action ' + (index + 1) + ': webhookConfig.url is required for webhook actions')
        }
      }
    })
  }

  return {
    valid: errors.length === 0,
    errors: errors
  }
}

module.exports = ruleEngine
