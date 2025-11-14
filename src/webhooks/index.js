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
const axios = require('axios')
const crypto = require('crypto')
const winston = require('../logger')
const emitter = require('../emitter')
const Webhook = require('../models/webhook')

let cacheLoaded = false
let cachePromise = null
let cachedWebhooks = []
const listenerMap = new Map()

function delay (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function toHeadersObject (headers) {
  if (!_.isArray(headers)) return {}

  return headers.reduce((acc, header) => {
    if (!header || !header.key) return acc
    acc[header.key] = header.value
    return acc
  }, {})
}

function createRequestConfig (webhook, eventName, body) {
  const method = (webhook.method || 'POST').toUpperCase()
  const headers = Object.assign(
    {
      'Content-Type': 'application/json',
      'X-Trudesk-Event': eventName
    },
    toHeadersObject(webhook.headers)
  )

  if (webhook.secret) {
    const signature = crypto.createHmac('sha256', webhook.secret).update(JSON.stringify(body)).digest('hex')
    headers['X-Trudesk-Signature'] = signature
  }

  const config = {
    method: method,
    url: webhook.targetUrl,
    headers: headers,
    timeout: 1000 * 15
  }

  if (method === 'GET' || method === 'DELETE') {
    config.params = body
  } else {
    config.data = body
  }

  return config
}

async function deliverWithRetry (webhook, eventName, payload, attempt = 1) {
  const body = {
    event: eventName,
    timestamp: new Date().toISOString(),
    payload: payload
  }

  const config = createRequestConfig(webhook, eventName, body)
  const maxAttempts = 3

  try {
    await axios(config)
    winston.debug(
      `Webhook delivery succeeded for ${webhook.name || webhook._id} (${eventName}) on attempt ${attempt}`
    )
  } catch (error) {
    const errorMessage = error && error.message ? error.message : 'Unknown error'
    winston.warn(
      `Webhook delivery failed for ${webhook.name || webhook._id} (${eventName}) on attempt ${attempt}: ${errorMessage}`
    )

    if (attempt < maxAttempts) {
      const backoff = Math.pow(2, attempt) * 500
      await delay(backoff)
      return deliverWithRetry(webhook, eventName, payload, attempt + 1)
    }

    const finalError = new Error(
      `Webhook delivery failed for ${webhook.name || webhook._id} (${eventName}) after ${maxAttempts} attempts`
    )
    finalError.originalError = error
    winston.error(finalError.message, error)
    throw finalError
  }
}

async function ensureCache () {
  if (cacheLoaded) return cachedWebhooks
  if (cachePromise) {
    await cachePromise
    return cachedWebhooks
  }

  cachePromise = Webhook.find({ isActive: true })
    .lean()
    .exec()
    .then(webhooks => {
      cachedWebhooks = webhooks || []
      cacheLoaded = true
      registerListeners()

      return cachedWebhooks
    })
    .catch(err => {
      cacheLoaded = false
      cachedWebhooks = []
      winston.error('Failed to load webhooks', err)
      throw err
    })
    .finally(() => {
      cachePromise = null
    })

  await cachePromise
  return cachedWebhooks
}

function clearListeners () {
  listenerMap.forEach((handler, eventName) => {
    emitter.removeListener(eventName, handler)
  })
  listenerMap.clear()
}

function registerListeners () {
  clearListeners()

  const events = _.uniq(
    _.flatMap(cachedWebhooks, webhook => {
      if (!webhook || !webhook.events) return []
      return webhook.events
    })
  )

  events.forEach(eventName => {
    if (!eventName) return

    const handler = (...args) => {
      const payload = args.length <= 1 ? args[0] : args
      deliverEvent(eventName, payload)
    }

    listenerMap.set(eventName, handler)
    emitter.on(eventName, handler)
  })
}

async function deliverEvent (eventName, payload) {
  try {
    await ensureCache()
  } catch (err) {
    winston.error(`Unable to load webhooks for event ${eventName}`, err)
    return
  }

  const targets = cachedWebhooks.filter(webhook => {
    return webhook.isActive && _.includes(webhook.events, eventName)
  })

  if (!targets.length) return

  targets.forEach(webhook => {
    deliverWithRetry(webhook, eventName, payload).catch(err => {
      winston.error('Unexpected webhook delivery error', err)
    })
  })
}

async function reload () {
  cacheLoaded = false
  cachedWebhooks = []
  clearListeners()
  await ensureCache()
}

function invalidate () {
  cacheLoaded = false
  cachedWebhooks = []
  clearListeners()
}

async function test (webhookId, payload) {
  const webhook = await Webhook.findById(webhookId).lean().exec()
  if (!webhook) {
    const error = new Error('Webhook not found')
    error.name = 'WebhookNotFoundError'
    throw error
  }

  await deliverWithRetry(webhook, 'test', payload || {})
}

async function init () {
  await ensureCache()
}

module.exports = {
  init,
  reload,
  invalidate,
  test
}
