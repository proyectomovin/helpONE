/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Updated:    2025-11-28
 *  Copyright (c) 2014-2025. All rights reserved.
 */

/**
 * Email Provider Manager
 * Manages multiple email providers with failover and load balancing
 */

var EmailProvider = require('../../models/emailProvider')
var winston = require('../../logger')
var nodemailer = require('nodemailer')

var providerManager = {}
var transportCache = {}

/**
 * Send email using best available provider
 * @param {Object} mailOptions - Email options
 * @param {Object} context - Context for provider selection
 * @param {Function} callback - Callback function
 */
providerManager.sendMail = function (mailOptions, context, callback) {
  // If no callback provided, context is the callback
  if (typeof context === 'function') {
    callback = context
    context = {}
  }

  context = context || {}

  // Select best provider
  providerManager.selectProvider(context, function (err, provider) {
    if (err || !provider) {
      winston.error('No available email provider: ' + (err ? err.message : 'No providers configured'))
      return callback(new Error('No email provider available'))
    }

    winston.debug('Using email provider: ' + provider.name + ' (' + provider.type + ')')

    // Send with selected provider
    providerManager.sendWithProvider(provider, mailOptions, function (err, result) {
      if (err) {
        winston.error('Error sending with provider ' + provider.name + ': ' + err.message)

        // Try failover if enabled
        if (provider.failover.enabled) {
          return providerManager.handleFailover(provider, mailOptions, context, callback)
        }

        return callback(err)
      }

      callback(null, result)
    })
  })
}

/**
 * Select best provider based on context
 * @param {Object} context - Selection context
 * @param {Function} callback - Callback function
 */
providerManager.selectProvider = function (context, callback) {
  EmailProvider.getActiveProviders(function (err, providers) {
    if (err) {
      return callback(err)
    }

    if (!providers || providers.length === 0) {
      return callback(new Error('No active providers'))
    }

    // Filter by rules
    var eligible = providers.filter(function (provider) {
      // Check rate limits
      if (provider.isRateLimitExceeded()) {
        winston.debug('Provider ' + provider.name + ' rate limit exceeded')
        return false
      }

      // Check rules match
      if (!provider.matchesRules(context)) {
        winston.debug('Provider ' + provider.name + ' does not match rules')
        return false
      }

      return true
    })

    if (eligible.length === 0) {
      winston.warn('No eligible providers after filtering')
      // Fall back to any healthy provider
      eligible = providers.filter(function (p) {
        return p.health.status !== 'unhealthy' && !p.isRateLimitExceeded()
      })
    }

    if (eligible.length === 0) {
      return callback(new Error('No eligible providers'))
    }

    // Select by priority (lowest number = highest priority)
    eligible.sort(function (a, b) {
      return a.priority - b.priority
    })

    callback(null, eligible[0])
  })
}

/**
 * Send email with specific provider
 * @param {Object} provider - EmailProvider document
 * @param {Object} mailOptions - Email options
 * @param {Function} callback - Callback function
 */
providerManager.sendWithProvider = function (provider, mailOptions, callback) {
  var startTime = Date.now()

  // Get or create transport
  providerManager.getTransport(provider, function (err, transport) {
    if (err) {
      provider.incrementFailed(function () {})
      return callback(err)
    }

    // Add from address if not specified
    if (!mailOptions.from) {
      mailOptions.from = providerManager.getFromAddress(provider)
    }

    // Send email
    transport.sendMail(mailOptions, function (err, info) {
      var responseTime = Date.now() - startTime

      if (err) {
        winston.error('Provider ' + provider.name + ' send failed: ' + err.message)
        provider.incrementFailed(function () {})
        return callback(err)
      }

      winston.info('Email sent via ' + provider.name + ' in ' + responseTime + 'ms')
      provider.incrementSent(responseTime, function () {})

      callback(null, info)
    })
  })
}

/**
 * Get or create transport for provider
 * @param {Object} provider - EmailProvider document
 * @param {Function} callback - Callback function
 */
providerManager.getTransport = function (provider, callback) {
  var cacheKey = provider._id.toString()

  // Return cached transport if exists
  if (transportCache[cacheKey]) {
    return callback(null, transportCache[cacheKey])
  }

  // Create new transport based on type
  var transport

  try {
    switch (provider.type) {
      case 'smtp':
        transport = providerManager.createSMTPTransport(provider)
        break

      case 'sendgrid':
        transport = providerManager.createSendGridTransport(provider)
        break

      case 'mailgun':
        transport = providerManager.createMailgunTransport(provider)
        break

      case 'ses':
        transport = providerManager.createSESTransport(provider)
        break

      case 'postmark':
        transport = providerManager.createPostmarkTransport(provider)
        break

      case 'sparkpost':
        transport = providerManager.createSparkPostTransport(provider)
        break

      default:
        return callback(new Error('Unsupported provider type: ' + provider.type))
    }

    // Cache transport
    transportCache[cacheKey] = transport

    callback(null, transport)
  } catch (err) {
    winston.error('Error creating transport for ' + provider.name + ': ' + err.message)
    callback(err)
  }
}

/**
 * Create SMTP transport
 */
providerManager.createSMTPTransport = function (provider) {
  if (!provider.config.smtp) {
    throw new Error('SMTP configuration not found')
  }

  return nodemailer.createTransport(provider.config.smtp)
}

/**
 * Create SendGrid transport
 */
providerManager.createSendGridTransport = function (provider) {
  if (!provider.config.sendgrid || !provider.config.sendgrid.apiKey) {
    throw new Error('SendGrid configuration not found')
  }

  return nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
      user: 'apikey',
      pass: provider.config.sendgrid.apiKey
    }
  })
}

/**
 * Create Mailgun transport
 */
providerManager.createMailgunTransport = function (provider) {
  if (!provider.config.mailgun || !provider.config.mailgun.apiKey || !provider.config.mailgun.domain) {
    throw new Error('Mailgun configuration not found')
  }

  var username = provider.config.mailgun.username || 'postmaster@' + provider.config.mailgun.domain

  return nodemailer.createTransport({
    host: provider.config.mailgun.host || 'smtp.mailgun.org',
    port: provider.config.mailgun.port || 587,
    secure: false,
    auth: {
      user: username,
      pass: provider.config.mailgun.apiKey
    }
  })
}

/**
 * Create AWS SES transport
 */
providerManager.createSESTransport = function (provider) {
  if (!provider.config.ses || !provider.config.ses.accessKeyId || !provider.config.ses.secretAccessKey) {
    throw new Error('AWS SES configuration not found')
  }

  var region = provider.config.ses.region || 'us-east-1'
  var smtpHost = provider.config.ses.smtpHost || 'email-smtp.' + region + '.amazonaws.com'

  return nodemailer.createTransport({
    host: smtpHost,
    port: provider.config.ses.port || 587,
    secure: false,
    auth: {
      // Prefer explicit SMTP credentials but fall back to access key for compatibility
      user: provider.config.ses.smtpUser || provider.config.ses.accessKeyId,
      pass: provider.config.ses.smtpPassword || provider.config.ses.secretAccessKey
    }
  })
}

/**
 * Create Postmark transport
 */
providerManager.createPostmarkTransport = function (provider) {
  if (!provider.config.postmark || !provider.config.postmark.serverToken) {
    throw new Error('Postmark configuration not found')
  }

  return nodemailer.createTransport({
    host: provider.config.postmark.host || 'smtp.postmarkapp.com',
    port: provider.config.postmark.port || 587,
    secure: false,
    auth: {
      user: provider.config.postmark.smtpUser || 'postmark',
      pass: provider.config.postmark.serverToken
    }
  })
}

/**
 * Create SparkPost transport
 */
providerManager.createSparkPostTransport = function (provider) {
  if (!provider.config.sparkpost || !provider.config.sparkpost.apiKey) {
    throw new Error('SparkPost configuration not found')
  }

  return nodemailer.createTransport({
    host: provider.config.sparkpost.host || 'smtp.sparkpostmail.com',
    port: provider.config.sparkpost.port || 587,
    secure: false,
    auth: {
      user: provider.config.sparkpost.smtpUser || 'SMTP_Injection',
      pass: provider.config.sparkpost.apiKey
    }
  })
}

/**
 * Get from address for provider
 */
providerManager.getFromAddress = function (provider) {
  var config = provider.config[provider.type]
  if (!config) {
    return null
  }

  var fromEmail = config.fromEmail
  var fromName = config.fromName

  if (fromName) {
    return '"' + fromName + '" <' + fromEmail + '>'
  }

  return fromEmail
}

/**
 * Handle failover to backup provider
 * @param {Object} failedProvider - Provider that failed
 * @param {Object} mailOptions - Email options
 * @param {Object} context - Context
 * @param {Function} callback - Callback function
 */
providerManager.handleFailover = function (failedProvider, mailOptions, context, callback) {
  winston.info('Attempting failover from ' + failedProvider.name)

  // Check if has specific fallback provider
  if (failedProvider.failover.fallbackProviderId) {
    EmailProvider.findById(failedProvider.failover.fallbackProviderId).exec(function (err, fallback) {
      if (err || !fallback || !fallback.isActive) {
        winston.warn('Fallback provider not available, trying any provider')
        return providerManager.tryAnyProvider(failedProvider, mailOptions, callback)
      }

      winston.debug('Failing over to designated fallback: ' + fallback.name)
      providerManager.sendWithProvider(fallback, mailOptions, callback)
    })
  } else {
    // Try any other provider
    providerManager.tryAnyProvider(failedProvider, mailOptions, callback)
  }
}

/**
 * Try sending with any available provider
 * @param {Object} excludeProvider - Provider to exclude
 * @param {Object} mailOptions - Email options
 * @param {Function} callback - Callback function
 */
providerManager.tryAnyProvider = function (excludeProvider, mailOptions, callback) {
  EmailProvider.getActiveProviders(function (err, providers) {
    if (err || !providers || providers.length === 0) {
      return callback(new Error('No backup providers available'))
    }

    // Filter out the failed provider
    var alternatives = providers.filter(function (p) {
      return p._id.toString() !== excludeProvider._id.toString() &&
             p.health.status !== 'unhealthy' &&
             !p.isRateLimitExceeded()
    })

    if (alternatives.length === 0) {
      return callback(new Error('No healthy backup providers available'))
    }

    // Try first alternative
    winston.debug('Failing over to alternative provider: ' + alternatives[0].name)
    providerManager.sendWithProvider(alternatives[0], mailOptions, callback)
  })
}

/**
 * Test provider connection
 * @param {Object} provider - EmailProvider document
 * @param {Function} callback - Callback function
 */
providerManager.testProvider = function (provider, callback) {
  providerManager.getTransport(provider, function (err, transport) {
    if (err) {
      return callback(err)
    }

    // Verify transport
    transport.verify(function (err, success) {
      if (err) {
        return callback(err)
      }

      callback(null, {
        success: true,
        message: 'Provider connection successful',
        provider: provider.name
      })
    })
  })
}

/**
 * Clear transport cache
 * @param {String} providerId - Provider ID (optional, clears all if not specified)
 */
providerManager.clearCache = function (providerId) {
  if (providerId) {
    delete transportCache[providerId]
    winston.debug('Cleared transport cache for provider: ' + providerId)
  } else {
    transportCache = {}
    winston.debug('Cleared all transport cache')
  }
}

/**
 * Get provider statistics
 * @param {Function} callback - Callback function
 */
providerManager.getStatistics = function (callback) {
  EmailProvider.find({}).exec(function (err, providers) {
    if (err) {
      return callback(err)
    }

    var stats = {
      total: providers.length,
      active: 0,
      healthy: 0,
      degraded: 0,
      unhealthy: 0,
      byType: {},
      totalSent: 0,
      totalFailed: 0,
      averageSuccessRate: 0
    }

    providers.forEach(function (provider) {
      if (provider.isActive) stats.active++

      // Count by health
      if (provider.health.status === 'healthy') stats.healthy++
      else if (provider.health.status === 'degraded') stats.degraded++
      else if (provider.health.status === 'unhealthy') stats.unhealthy++

      // Count by type
      stats.byType[provider.type] = (stats.byType[provider.type] || 0) + 1

      // Aggregate totals
      stats.totalSent += provider.stats.totalSent
      stats.totalFailed += provider.stats.totalFailed
    })

    // Calculate average success rate
    if (providers.length > 0) {
      var totalSuccessRate = providers.reduce(function (sum, p) {
        return sum + (p.stats.successRate || 0)
      }, 0)
      stats.averageSuccessRate = totalSuccessRate / providers.length
    }

    callback(null, stats)
  })
}

module.exports = providerManager
