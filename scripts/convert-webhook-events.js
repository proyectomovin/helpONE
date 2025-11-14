#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const nconf = require('nconf')
const winston = require('../src/logger')

nconf.argv().env()

global.env = process.env.NODE_ENV || 'development'

const configFile = nconf.get('config')
  ? path.resolve(process.cwd(), nconf.get('config'))
  : path.join(__dirname, '..', 'config.yml')

if (fs.existsSync(configFile)) {
  nconf.file({
    file: configFile,
    format: require('nconf-yaml')
  })
} else {
  winston.warn(`Config file not found at ${configFile}. Continuing with environment variables.`)
}

const database = require('../src/database')
const Webhook = require('../src/models/webhook')

async function connectToDatabase () {
  return new Promise((resolve, reject) => {
    database.init(err => {
      if (err) {
        return reject(err)
      }

      return resolve()
    })
  })
}

function translateEventName (event) {
  if (typeof event !== 'string') return event
  if (!event.includes('.')) return event
  return event.replace(/\./g, ':')
}

async function translateWebhookEvents () {
  const query = { events: { $exists: true, $ne: [] } }
  const webhooks = await Webhook.find(query).exec()

  let updatedCount = 0
  let inspectedCount = 0

  for (const webhook of webhooks) {
    inspectedCount += 1
    const events = Array.isArray(webhook.events) ? webhook.events : []
    const translatedEvents = events.map(translateEventName)

    const hasChanges = events.some((event, index) => event !== translatedEvents[index])

    if (hasChanges) {
      webhook.events = translatedEvents
      await webhook.save()
      updatedCount += 1
      winston.info(`Updated webhook ${webhook.name || webhook._id} -> ${translatedEvents.join(', ')}`)
    }
  }

  winston.info(`Inspection complete. ${inspectedCount} webhook(s) scanned, ${updatedCount} updated.`)
}

async function shutdown (code = 0) {
  try {
    if (database.db && database.db.connection) {
      await database.db.connection.close()
    }
  } catch (err) {
    winston.warn('Error while closing MongoDB connection', err)
  }

  process.exit(code)
}

async function main () {
  try {
    await connectToDatabase()
    await translateWebhookEvents()
    await shutdown(0)
  } catch (err) {
    winston.error('Failed to translate webhook events', err)
    await shutdown(1)
  }
}

main()
