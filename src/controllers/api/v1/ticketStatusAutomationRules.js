/*
     .                              .o8                     oooo
   .o8                             "888                     `888
 .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
   888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
   888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
   888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
   "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 ========================================================================
 Created:    11/19/2025
 Author:     Claude

 Ticket Status Automation Rules API Controller
 **/

var _ = require('lodash')
var async = require('async')
var AutomationRuleSchema = require('../../../models/ticketStatusAutomationRule')

var automationRulesV1 = {}

/**
 * GET /api/v1/automation-rules
 * Obtener todas las reglas de automatización
 */
automationRulesV1.get = function (req, res) {
  AutomationRuleSchema.getRules(function (err, rules) {
    if (err) return res.status(400).json({ success: false, error: err.message })

    return res.json({
      success: true,
      rules: rules,
      events: AutomationRuleSchema.TICKET_EVENTS
    })
  })
}

/**
 * GET /api/v1/automation-rules/:id
 * Obtener una regla específica por ID
 */
automationRulesV1.getById = function (req, res) {
  var _id = req.params.id
  if (!_id) return res.status(400).json({ success: false, error: 'Invalid ID' })

  AutomationRuleSchema.getRule(_id, function (err, rule) {
    if (err) return res.status(400).json({ success: false, error: err.message })
    if (!rule) return res.status(404).json({ success: false, error: 'Rule not found' })

    return res.json({ success: true, rule: rule })
  })
}

/**
 * GET /api/v1/automation-rules/active
 * Obtener solo las reglas activas
 */
automationRulesV1.getActive = function (req, res) {
  AutomationRuleSchema.getActiveRules(function (err, rules) {
    if (err) return res.status(400).json({ success: false, error: err.message })

    return res.json({ success: true, rules: rules })
  })
}

/**
 * GET /api/v1/automation-rules/events
 * Obtener la lista de eventos disponibles
 */
automationRulesV1.getEvents = function (req, res) {
  return res.json({
    success: true,
    events: AutomationRuleSchema.TICKET_EVENTS
  })
}

/**
 * POST /api/v1/automation-rules/create
 * Crear una nueva regla de automatización
 */
automationRulesV1.create = function (req, res) {
  var data = req.body

  // Validar datos requeridos
  if (!data.ticketEvent || !data.userRole || !data.newTicketStatus) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: ticketEvent, userRole, newTicketStatus'
    })
  }

  // Validar que el evento sea válido
  if (!AutomationRuleSchema.TICKET_EVENTS.includes(data.ticketEvent)) {
    return res.status(400).json({
      success: false,
      error: `Invalid ticket event. Must be one of: ${AutomationRuleSchema.TICKET_EVENTS.join(', ')}`
    })
  }

  var ruleData = {
    ticketEvent: data.ticketEvent,
    userRole: data.userRole,
    newTicketStatus: data.newTicketStatus,
    isActive: data.isActive !== undefined ? data.isActive : true,
    order: data.order || 1
  }

  AutomationRuleSchema.createRule(ruleData, function (err, rule) {
    if (err) return res.status(400).json({ success: false, error: err.message })

    return res.json({ success: true, rule: rule })
  })
}

/**
 * PUT /api/v1/automation-rules/:id
 * Actualizar una regla existente
 */
automationRulesV1.update = function (req, res) {
  var _id = req.params.id
  var data = req.body

  if (!_id) return res.status(400).json({ success: false, error: 'Invalid ID' })

  // Validar evento si se está actualizando
  if (data.ticketEvent && !AutomationRuleSchema.TICKET_EVENTS.includes(data.ticketEvent)) {
    return res.status(400).json({
      success: false,
      error: `Invalid ticket event. Must be one of: ${AutomationRuleSchema.TICKET_EVENTS.join(', ')}`
    })
  }

  AutomationRuleSchema.getRule(_id, function (err, rule) {
    if (err) return res.status(400).json({ success: false, error: err.message })
    if (!rule) return res.status(404).json({ success: false, error: 'Rule not found' })

    rule.updateRule(data, function (err, updatedRule) {
      if (err) return res.status(400).json({ success: false, error: err.message })

      return res.json({ success: true, rule: updatedRule })
    })
  })
}

/**
 * PUT /api/v1/automation-rules/:id/toggle
 * Activar/desactivar una regla
 */
automationRulesV1.toggle = function (req, res) {
  var _id = req.params.id
  var isActive = req.body.isActive

  if (!_id) return res.status(400).json({ success: false, error: 'Invalid ID' })
  if (isActive === undefined) {
    return res.status(400).json({ success: false, error: 'isActive field is required' })
  }

  AutomationRuleSchema.getRule(_id, function (err, rule) {
    if (err) return res.status(400).json({ success: false, error: err.message })
    if (!rule) return res.status(404).json({ success: false, error: 'Rule not found' })

    rule.setActive(isActive, function (err, updatedRule) {
      if (err) return res.status(400).json({ success: false, error: err.message })

      return res.json({ success: true, rule: updatedRule })
    })
  })
}

/**
 * DELETE /api/v1/automation-rules/:id
 * Eliminar una regla
 */
automationRulesV1.delete = function (req, res) {
  var _id = req.params.id

  if (!_id) return res.status(400).json({ success: false, error: 'Invalid ID' })

  AutomationRuleSchema.deleteOne({ _id: _id }, function (err) {
    if (err) return res.status(500).json({ success: false, error: err.message })

    return res.json({ success: true })
  })
}

/**
 * GET /api/v1/automation-rules/match/:event/:roleId
 * Buscar reglas que coincidan con un evento y rol (para testing)
 */
automationRulesV1.findMatching = function (req, res) {
  var ticketEvent = req.params.event
  var userRoleId = req.params.roleId

  if (!ticketEvent || !userRoleId) {
    return res.status(400).json({ success: false, error: 'Event and roleId are required' })
  }

  AutomationRuleSchema.findMatchingRules(ticketEvent, userRoleId, function (err, rules) {
    if (err) return res.status(400).json({ success: false, error: err.message })

    return res.json({ success: true, rules: rules })
  })
}

module.exports = automationRulesV1
