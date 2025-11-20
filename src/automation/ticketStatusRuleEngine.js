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

 Ticket Status Automation Rule Engine
 Evalúa y ejecuta reglas de cambio automático de estado de tickets
 **/

const winston = require('../logger')
const AutomationRuleSchema = require('../models/ticketStatusAutomationRule')
const TicketSchema = require('../models/ticket')
const _ = require('lodash')

/**
 * Procesa las reglas de automatización para un evento de ticket
 * @param {String} ticketEvent - El evento disparado (ej. 'ticket_new_comment')
 * @param {Object} ticket - El ticket afectado (debe estar poblado con refs)
 * @param {Object} actor - El usuario que disparó el evento
 */
async function processAutomationRules (ticketEvent, ticket, actor) {
  try {
    winston.info(`AutomationRules: Processing event="${ticketEvent}"`)

    // Validar parámetros
    if (!ticketEvent || !ticket || !actor) {
      winston.warn('AutomationRules: Missing required parameters', { ticketEvent, ticket: !!ticket, actor: !!actor })
      return
    }

    winston.info(`AutomationRules: Ticket #${ticket.uid || ticket._id}, Actor: ${actor.username || actor._id}`)

    // Obtener el rol del actor
    const userRoleId = actor.role?._id || actor.role
    if (!userRoleId) {
      winston.warn(`AutomationRules: Actor ${actor.username} has no role`, { actor })
      return
    }

    winston.info(`AutomationRules: Looking for rules with event="${ticketEvent}" and roleId="${userRoleId}"`)

    // Buscar reglas que coincidan con el evento y rol
    const matchingRules = await AutomationRuleSchema.findMatchingRules(ticketEvent, userRoleId)

    winston.info(`AutomationRules: Found ${matchingRules ? matchingRules.length : 0} matching rules`)

    if (!matchingRules || matchingRules.length === 0) {
      winston.info(`AutomationRules: No matching rules for event="${ticketEvent}" roleId="${userRoleId}"`)
      return
    }

    // Tomar la primera regla (ya están ordenadas por order y createdAt)
    const rule = matchingRules[0]

    winston.info(
      `AutomationRules: Applying rule ${rule._id} - Event: ${ticketEvent}, Actor: ${actor.username}, New Status: ${rule.newTicketStatus.name}`
    )

    // Aplicar el cambio de estado
    await applyStatusChange(ticket, rule.newTicketStatus, actor)

    return rule
  } catch (err) {
    winston.error('AutomationRules: Error processing rules', err)
  }
}

/**
 * Aplica un cambio de estado al ticket
 * @param {Object} ticket - El ticket a modificar
 * @param {Object} newStatus - El nuevo estado
 * @param {Object} actor - El usuario que disparó el cambio
 */
async function applyStatusChange (ticket, newStatus, actor) {
  try {
    // Obtener el ticket completo si solo tenemos el ID
    let fullTicket = ticket
    if (typeof ticket === 'string' || !ticket.setStatus) {
      fullTicket = await TicketSchema.getTicketById(ticket._id || ticket)
    }

    if (!fullTicket) {
      winston.warn(`AutomationRules: Ticket not found: ${ticket._id || ticket}`)
      return
    }

    // Verificar si el estado ya es el mismo
    const currentStatusId = fullTicket.status?._id?.toString() || fullTicket.status?.toString()
    const newStatusId = newStatus._id?.toString() || newStatus.toString()

    if (currentStatusId === newStatusId) {
      winston.debug(`AutomationRules: Ticket ${fullTicket.uid} already has status ${newStatus.name}`)
      return
    }

    // Cambiar el estado usando el método del modelo
    await fullTicket.setStatus(newStatusId)

    winston.info(
      `AutomationRules: Changed ticket ${fullTicket.uid} status to "${newStatus.name}" (triggered by ${actor.username})`
    )
  } catch (err) {
    winston.error('AutomationRules: Error applying status change', err)
  }
}

/**
 * Mapea los eventos del sistema a los eventos de las reglas
 */
const EVENT_MAPPING = {
  'ticket:created': 'ticket_created',
  'ticket:updated': 'ticket_updated',
  'ticket:comment:added': 'ticket_new_comment',
  'ticket:note:added': 'ticket_note_added',
  'ticket:assignee_set': 'ticket_assigned',
  'ticket:status_changed': 'ticket_status_changed'
}

/**
 * Obtiene el evento de regla correspondiente a un evento del sistema
 */
function getRuleEvent (systemEvent) {
  return EVENT_MAPPING[systemEvent] || null
}

module.exports = {
  processAutomationRules,
  applyStatusChange,
  getRuleEvent,
  EVENT_MAPPING
}
