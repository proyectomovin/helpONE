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
 * Conditions Helper
 * Evaluates rule conditions against context data
 */

var winston = require('../../logger')

var conditionsHelper = {}

/**
 * Get field value from context using dot notation
 * @param {String} fieldPath - Field path (e.g., 'ticket.priority.name')
 * @param {Object} context - Context object
 * @returns {*} Field value
 */
conditionsHelper.getFieldValue = function (fieldPath, context) {
  if (!fieldPath || !context) {
    return undefined
  }

  var parts = fieldPath.split('.')
  var value = context

  for (var i = 0; i < parts.length; i++) {
    if (value === null || value === undefined) {
      return undefined
    }
    value = value[parts[i]]
  }

  return value
}

/**
 * Get previous field value (for change detection)
 * @param {String} fieldPath - Field path
 * @param {Object} context - Context object
 * @returns {*} Previous field value
 */
conditionsHelper.getPreviousFieldValue = function (fieldPath, context) {
  if (!context.previousData) {
    return undefined
  }

  return conditionsHelper.getFieldValue(fieldPath, { ticket: context.previousData })
}

/**
 * Evaluate a single condition
 * @param {Object} condition - Condition object
 * @param {Object} context - Context object
 * @returns {Boolean} - True if condition is met
 */
conditionsHelper.evaluateCondition = function (condition, context) {
  if (!condition || !condition.field || !condition.operator) {
    winston.warn('Invalid condition: missing field or operator')
    return false
  }

  var fieldValue = conditionsHelper.getFieldValue(condition.field, context)
  var expectedValue = condition.value
  var operator = condition.operator

  // winston.debug('Evaluating condition: ' + condition.field + ' ' + operator + ' ' + expectedValue + ' (actual: ' + fieldValue + ')')

  try {
    switch (operator) {
      case 'equals':
        return conditionsHelper.equals(fieldValue, expectedValue)

      case 'not_equals':
        return !conditionsHelper.equals(fieldValue, expectedValue)

      case 'contains':
        return conditionsHelper.contains(fieldValue, expectedValue)

      case 'not_contains':
        return !conditionsHelper.contains(fieldValue, expectedValue)

      case 'starts_with':
        return conditionsHelper.startsWith(fieldValue, expectedValue)

      case 'ends_with':
        return conditionsHelper.endsWith(fieldValue, expectedValue)

      case 'greater_than':
        return conditionsHelper.greaterThan(fieldValue, expectedValue)

      case 'less_than':
        return conditionsHelper.lessThan(fieldValue, expectedValue)

      case 'greater_or_equal':
        return conditionsHelper.greaterOrEqual(fieldValue, expectedValue)

      case 'less_or_equal':
        return conditionsHelper.lessOrEqual(fieldValue, expectedValue)

      case 'is_empty':
        return conditionsHelper.isEmpty(fieldValue)

      case 'is_not_empty':
        return !conditionsHelper.isEmpty(fieldValue)

      case 'in_list':
        return conditionsHelper.inList(fieldValue, expectedValue)

      case 'not_in_list':
        return !conditionsHelper.inList(fieldValue, expectedValue)

      case 'changed':
        return conditionsHelper.changed(condition.field, context)

      case 'changed_from':
        return conditionsHelper.changedFrom(condition.field, expectedValue, context)

      case 'changed_to':
        return conditionsHelper.changedTo(condition.field, expectedValue, context)

      case 'matches_regex':
        return conditionsHelper.matchesRegex(fieldValue, expectedValue)

      default:
        winston.warn('Unknown operator: ' + operator)
        return false
    }
  } catch (err) {
    winston.error('Error evaluating condition: ' + err.message)
    return false
  }
}

/**
 * Equals operator
 */
conditionsHelper.equals = function (fieldValue, expectedValue) {
  // Handle null/undefined
  if (fieldValue === null || fieldValue === undefined) {
    return expectedValue === null || expectedValue === undefined
  }

  // Convert to strings for comparison
  return String(fieldValue).toLowerCase() === String(expectedValue).toLowerCase()
}

/**
 * Contains operator (for strings and arrays)
 */
conditionsHelper.contains = function (fieldValue, expectedValue) {
  if (!fieldValue) return false

  if (Array.isArray(fieldValue)) {
    return fieldValue.some(function (item) {
      return String(item).toLowerCase().includes(String(expectedValue).toLowerCase())
    })
  }

  return String(fieldValue).toLowerCase().includes(String(expectedValue).toLowerCase())
}

/**
 * Starts with operator
 */
conditionsHelper.startsWith = function (fieldValue, expectedValue) {
  if (!fieldValue) return false
  return String(fieldValue).toLowerCase().startsWith(String(expectedValue).toLowerCase())
}

/**
 * Ends with operator
 */
conditionsHelper.endsWith = function (fieldValue, expectedValue) {
  if (!fieldValue) return false
  return String(fieldValue).toLowerCase().endsWith(String(expectedValue).toLowerCase())
}

/**
 * Greater than operator
 */
conditionsHelper.greaterThan = function (fieldValue, expectedValue) {
  var numField = Number(fieldValue)
  var numExpected = Number(expectedValue)

  if (isNaN(numField) || isNaN(numExpected)) {
    // Try date comparison
    var dateField = new Date(fieldValue)
    var dateExpected = new Date(expectedValue)

    if (!isNaN(dateField.getTime()) && !isNaN(dateExpected.getTime())) {
      return dateField > dateExpected
    }

    return false
  }

  return numField > numExpected
}

/**
 * Less than operator
 */
conditionsHelper.lessThan = function (fieldValue, expectedValue) {
  var numField = Number(fieldValue)
  var numExpected = Number(expectedValue)

  if (isNaN(numField) || isNaN(numExpected)) {
    // Try date comparison
    var dateField = new Date(fieldValue)
    var dateExpected = new Date(expectedValue)

    if (!isNaN(dateField.getTime()) && !isNaN(dateExpected.getTime())) {
      return dateField < dateExpected
    }

    return false
  }

  return numField < numExpected
}

/**
 * Greater or equal operator
 */
conditionsHelper.greaterOrEqual = function (fieldValue, expectedValue) {
  return conditionsHelper.greaterThan(fieldValue, expectedValue) ||
         conditionsHelper.equals(fieldValue, expectedValue)
}

/**
 * Less or equal operator
 */
conditionsHelper.lessOrEqual = function (fieldValue, expectedValue) {
  return conditionsHelper.lessThan(fieldValue, expectedValue) ||
         conditionsHelper.equals(fieldValue, expectedValue)
}

/**
 * Is empty operator
 */
conditionsHelper.isEmpty = function (fieldValue) {
  if (fieldValue === null || fieldValue === undefined) {
    return true
  }

  if (typeof fieldValue === 'string') {
    return fieldValue.trim() === ''
  }

  if (Array.isArray(fieldValue)) {
    return fieldValue.length === 0
  }

  if (typeof fieldValue === 'object') {
    return Object.keys(fieldValue).length === 0
  }

  return false
}

/**
 * In list operator
 */
conditionsHelper.inList = function (fieldValue, expectedValue) {
  if (!expectedValue) return false

  // Ensure expectedValue is an array
  var list = Array.isArray(expectedValue) ? expectedValue : [expectedValue]

  return list.some(function (item) {
    return conditionsHelper.equals(fieldValue, item)
  })
}

/**
 * Changed operator (field value changed from previous)
 */
conditionsHelper.changed = function (fieldPath, context) {
  if (!context.previousData) {
    return false
  }

  var currentValue = conditionsHelper.getFieldValue(fieldPath, context)
  var previousValue = conditionsHelper.getPreviousFieldValue(fieldPath, context)

  return !conditionsHelper.equals(currentValue, previousValue)
}

/**
 * Changed from operator (field changed from specific value)
 */
conditionsHelper.changedFrom = function (fieldPath, expectedValue, context) {
  if (!context.previousData) {
    return false
  }

  var previousValue = conditionsHelper.getPreviousFieldValue(fieldPath, context)

  return conditionsHelper.equals(previousValue, expectedValue)
}

/**
 * Changed to operator (field changed to specific value)
 */
conditionsHelper.changedTo = function (fieldPath, expectedValue, context) {
  if (!context.previousData) {
    return false
  }

  var currentValue = conditionsHelper.getFieldValue(fieldPath, context)
  var previousValue = conditionsHelper.getPreviousFieldValue(fieldPath, context)

  // Check if value changed AND current value matches expected
  return !conditionsHelper.equals(currentValue, previousValue) &&
         conditionsHelper.equals(currentValue, expectedValue)
}

/**
 * Matches regex operator
 */
conditionsHelper.matchesRegex = function (fieldValue, regexPattern) {
  if (!fieldValue || !regexPattern) return false

  try {
    var regex = new RegExp(regexPattern, 'i')
    return regex.test(String(fieldValue))
  } catch (err) {
    winston.error('Invalid regex pattern: ' + regexPattern + ' - ' + err.message)
    return false
  }
}

/**
 * Get available fields for condition building
 * @returns {Array} Array of available field definitions
 */
conditionsHelper.getAvailableFields = function () {
  return [
    // Ticket fields
    { field: 'ticket.uid', label: 'Ticket Number', type: 'number', category: 'Ticket' },
    { field: 'ticket.subject', label: 'Ticket Subject', type: 'string', category: 'Ticket' },
    { field: 'ticket.issue', label: 'Ticket Description', type: 'string', category: 'Ticket' },
    { field: 'ticket.status.name', label: 'Ticket Status', type: 'string', category: 'Ticket' },
    { field: 'ticket.priority.name', label: 'Ticket Priority', type: 'string', category: 'Ticket' },
    { field: 'ticket.type.name', label: 'Ticket Type', type: 'string', category: 'Ticket' },
    { field: 'ticket.group.name', label: 'Ticket Group', type: 'string', category: 'Ticket' },
    { field: 'ticket.assignee.fullname', label: 'Assignee Name', type: 'string', category: 'Ticket' },
    { field: 'ticket.assignee.email', label: 'Assignee Email', type: 'string', category: 'Ticket' },
    { field: 'ticket.owner.fullname', label: 'Requester Name', type: 'string', category: 'Ticket' },
    { field: 'ticket.owner.email', label: 'Requester Email', type: 'string', category: 'Ticket' },
    { field: 'ticket.tags', label: 'Ticket Tags', type: 'array', category: 'Ticket' },
    { field: 'ticket.date', label: 'Created Date', type: 'date', category: 'Ticket' },
    { field: 'ticket.updated', label: 'Updated Date', type: 'date', category: 'Ticket' },
    { field: 'ticket.closedDate', label: 'Closed Date', type: 'date', category: 'Ticket' },

    // User fields
    { field: 'user.fullname', label: 'User Full Name', type: 'string', category: 'User' },
    { field: 'user.email', label: 'User Email', type: 'string', category: 'User' },
    { field: 'user.role', label: 'User Role', type: 'string', category: 'User' },
    { field: 'user.title', label: 'User Title', type: 'string', category: 'User' },

    // Comment fields
    { field: 'comment.comment', label: 'Comment Text', type: 'string', category: 'Comment' },
    { field: 'comment.owner.fullname', label: 'Comment Author', type: 'string', category: 'Comment' },

    // System fields
    { field: 'baseUrl', label: 'Base URL', type: 'string', category: 'System' }
  ]
}

/**
 * Get available operators for a field type
 * @param {String} fieldType - Field type (string, number, date, array, boolean)
 * @returns {Array} Array of available operators
 */
conditionsHelper.getOperatorsForFieldType = function (fieldType) {
  var commonOperators = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'is_empty', label: 'Is Empty' },
    { value: 'is_not_empty', label: 'Is Not Empty' },
    { value: 'changed', label: 'Changed' },
    { value: 'changed_from', label: 'Changed From' },
    { value: 'changed_to', label: 'Changed To' }
  ]

  var stringOperators = [
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does Not Contain' },
    { value: 'starts_with', label: 'Starts With' },
    { value: 'ends_with', label: 'Ends With' },
    { value: 'matches_regex', label: 'Matches Regex' }
  ]

  var numberOperators = [
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'greater_or_equal', label: 'Greater or Equal' },
    { value: 'less_or_equal', label: 'Less or Equal' }
  ]

  var arrayOperators = [
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does Not Contain' },
    { value: 'in_list', label: 'In List' },
    { value: 'not_in_list', label: 'Not In List' }
  ]

  switch (fieldType) {
    case 'string':
      return commonOperators.concat(stringOperators)

    case 'number':
      return commonOperators.concat(numberOperators)

    case 'date':
      return commonOperators.concat(numberOperators)

    case 'array':
      return commonOperators.concat(arrayOperators)

    case 'boolean':
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'not_equals', label: 'Not Equals' }
      ]

    default:
      return commonOperators
  }
}

module.exports = conditionsHelper
