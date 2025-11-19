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

 Ticket Status Automation Rules Model
 Defines rules for automatic ticket status changes based on events and user roles
 **/

var mongoose = require('mongoose')
var utils = require('../helpers/utils')

var COLLECTION = 'ticketstatusautomationrules'

// Definición de eventos válidos del sistema
var TICKET_EVENTS = [
  'ticket_created',
  'ticket_updated',
  'ticket_new_comment',
  'ticket_assigned',
  'ticket_status_changed',
  'ticket_closed',
  'ticket_reopened',
  'ticket_note_added'
]

var automationRuleSchema = mongoose.Schema(
  {
    ticketEvent: {
      type: String,
      required: true,
      enum: TICKET_EVENTS,
      index: true
    },
    userRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'roles',
      required: true,
      autopopulate: { maxDepth: 1 }
    },
    newTicketStatus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'statuses',
      required: true,
      autopopulate: { maxDepth: 1 }
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    order: {
      type: Number,
      default: 1,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
  }
)

// Plugin para auto-población de referencias
automationRuleSchema.plugin(require('mongoose-autopopulate'))

// Hook pre-save para validación y sanitización
automationRuleSchema.pre('save', function (next) {
  // Sanitizar ticketEvent
  if (this.ticketEvent) {
    this.ticketEvent = this.ticketEvent.trim()
  }

  // Validar que el evento sea válido
  if (!TICKET_EVENTS.includes(this.ticketEvent)) {
    return next(new Error(`Invalid ticket event: ${this.ticketEvent}`))
  }

  // Asegurar que order sea un número válido
  if (!this.order || this.order < 0) {
    this.order = 1
  }

  return next()
})

// Método estático: Obtener todas las reglas
automationRuleSchema.statics.getRules = function (callback) {
  return this.model(COLLECTION)
    .find({})
    .sort({ order: 1, createdAt: 1 })
    .exec(callback)
}

// Método estático: Obtener reglas activas
automationRuleSchema.statics.getActiveRules = function (callback) {
  return this.model(COLLECTION)
    .find({ isActive: true })
    .sort({ order: 1, createdAt: 1 })
    .exec(callback)
}

// Método estático: Obtener regla por ID
automationRuleSchema.statics.getRule = function (_id, callback) {
  return this.model(COLLECTION)
    .findOne({ _id: _id })
    .exec(callback)
}

// Método estático: Obtener reglas por evento
automationRuleSchema.statics.getRulesByEvent = function (ticketEvent, callback) {
  return this.model(COLLECTION)
    .find({ ticketEvent: ticketEvent, isActive: true })
    .sort({ order: 1, createdAt: 1 })
    .exec(callback)
}

// Método estático: Buscar reglas que coincidan con evento y rol
automationRuleSchema.statics.findMatchingRules = function (ticketEvent, userRoleId, callback) {
  return this.model(COLLECTION)
    .find({
      ticketEvent: ticketEvent,
      userRole: userRoleId,
      isActive: true
    })
    .sort({ order: 1, createdAt: 1 })
    .exec(callback)
}

// Método estático: Buscar la primera regla que coincida (por orden)
automationRuleSchema.statics.findFirstMatchingRule = function (ticketEvent, userRoleId, callback) {
  return this.model(COLLECTION)
    .findOne({
      ticketEvent: ticketEvent,
      userRole: userRoleId,
      isActive: true
    })
    .sort({ order: 1, createdAt: 1 })
    .exec(callback)
}

// Método estático: Crear una nueva regla
automationRuleSchema.statics.createRule = function (ruleData, callback) {
  var rule = new this(ruleData)
  return rule.save(callback)
}

// Método de instancia: Actualizar regla
automationRuleSchema.methods.updateRule = function (updates, callback) {
  if (updates.ticketEvent) this.ticketEvent = updates.ticketEvent
  if (updates.userRole) this.userRole = updates.userRole
  if (updates.newTicketStatus) this.newTicketStatus = updates.newTicketStatus
  if (updates.isActive !== undefined) this.isActive = updates.isActive
  if (updates.order !== undefined) this.order = updates.order

  return this.save(callback)
}

// Método de instancia: Activar/desactivar regla
automationRuleSchema.methods.setActive = function (isActive, callback) {
  this.isActive = isActive
  return this.save(callback)
}

// Exportar constantes y modelo
module.exports = mongoose.model(COLLECTION, automationRuleSchema)
module.exports.TICKET_EVENTS = TICKET_EVENTS
