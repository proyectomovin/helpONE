/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Author:     helpONE Contributors
 */

const _ = require('lodash')
const Webhook = require('../../../models/webhook')
const winston = require('../../../logger')
const webhookService = require('../../../webhooks')

const apiWebhooks = {}

function normalizeMethod (method) {
  if (!method) return undefined
  return method.toUpperCase()
}

apiWebhooks.list = async function (req, res) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1)
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100)

    const filter = {}
    if (!_.isUndefined(req.query.active)) {
      filter.isActive = req.query.active === 'true' || req.query.active === true
    }

    if (req.query.event) {
      filter.events = req.query.event
    }

    if (req.query.search) {
      const regex = new RegExp(_.escapeRegExp(req.query.search), 'i')
      filter.$or = [{ name: regex }, { targetUrl: regex }]
    }

    const [total, webhooks] = await Promise.all([
      Webhook.countDocuments(filter).exec(),
      Webhook.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec()
    ])

    return res.json({
      success: true,
      webhooks: webhooks,
      pagination: {
        total: total,
        page: page,
        limit: limit
      }
    })
  } catch (error) {
    winston.error('Failed to list webhooks', error)
    return res.status(500).json({ success: false, error: 'Failed to list webhooks' })
  }
}

apiWebhooks.create = async function (req, res) {
  try {
    const payload = _.pick(req.body, [
      'name',
      'targetUrl',
      'events',
      'secret',
      'method',
      'headers',
      'isActive'
    ])

    if (!payload.name || !payload.targetUrl || !_.isArray(payload.events)) {
      return res.status(400).json({ success: false, error: 'Invalid payload' })
    }

    payload.method = normalizeMethod(payload.method) || 'POST'
    payload.events = _.uniq(payload.events)

    const webhook = await Webhook.create(payload)
    await webhookService.reload()

    return res.status(201).json({ success: true, webhook: webhook })
  } catch (error) {
    winston.error('Failed to create webhook', error)
    return res.status(500).json({ success: false, error: 'Failed to create webhook' })
  }
}

apiWebhooks.update = async function (req, res) {
  try {
    const webhookId = req.params.id
    const payload = _.pick(req.body, [
      'name',
      'targetUrl',
      'events',
      'secret',
      'method',
      'headers',
      'isActive'
    ])

    if (payload.events && !_.isArray(payload.events)) {
      return res.status(400).json({ success: false, error: 'Invalid payload' })
    }

    if (payload.events) {
      payload.events = _.uniq(payload.events)
    }

    if (payload.method) {
      payload.method = normalizeMethod(payload.method)
    }

    const webhook = await Webhook.findByIdAndUpdate(webhookId, payload, {
      new: true,
      runValidators: true
    }).exec()

    if (!webhook) {
      return res.status(404).json({ success: false, error: 'Webhook not found' })
    }

    await webhookService.reload()

    return res.json({ success: true, webhook: webhook })
  } catch (error) {
    winston.error('Failed to update webhook', error)
    return res.status(500).json({ success: false, error: 'Failed to update webhook' })
  }
}

apiWebhooks.remove = async function (req, res) {
  try {
    const webhookId = req.params.id
    const webhook = await Webhook.findByIdAndDelete(webhookId).exec()

    if (!webhook) {
      return res.status(404).json({ success: false, error: 'Webhook not found' })
    }

    await webhookService.reload()

    return res.json({ success: true })
  } catch (error) {
    winston.error('Failed to delete webhook', error)
    return res.status(500).json({ success: false, error: 'Failed to delete webhook' })
  }
}

apiWebhooks.test = async function (req, res) {
  try {
    const webhookId = req.params.id
    const payload = req.body && req.body.payload ? req.body.payload : {}

    await webhookService.test(webhookId, payload)

    return res.json({ success: true })
  } catch (error) {
    if (error && error.name === 'WebhookNotFoundError') {
      return res.status(404).json({ success: false, error: 'Webhook not found' })
    }

    winston.error('Failed to deliver test webhook', error)
    return res.status(500).json({ success: false, error: 'Failed to deliver test webhook' })
  }
}

module.exports = apiWebhooks
