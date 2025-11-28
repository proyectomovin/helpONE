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

var mongoose = require('mongoose')
var crypto = require('crypto')

var COLLECTION = 'emailProviders'

/**
 * Email Provider Schema
 * Stores configuration for multiple email service providers
 */
var emailProviderSchema = mongoose.Schema({
  // Basic information
  name: { type: String, required: true, trim: true },
  description: String,

  // Provider type
  type: {
    type: String,
    required: true,
    enum: ['smtp', 'sendgrid', 'mailgun', 'ses', 'postmark', 'sparkpost'],
    index: true
  },

  // Status
  isActive: { type: Boolean, default: true, index: true },
  isPrimary: { type: Boolean, default: false },
  priority: { type: Number, default: 100 }, // Lower = higher priority

  // Configuration (encrypted in production)
  config: {
    // SMTP configuration
    smtp: {
      host: String,
      port: Number,
      secure: Boolean,
      auth: {
        user: String,
        pass: String
      },
      tls: {
        rejectUnauthorized: Boolean
      }
    },

    // SendGrid configuration
    sendgrid: {
      apiKey: String,
      fromEmail: String,
      fromName: String
    },

    // Mailgun configuration
    mailgun: {
      apiKey: String,
      domain: String,
      host: String, // API host (e.g., api.mailgun.net or api.eu.mailgun.net)
      fromEmail: String,
      fromName: String
    },

    // AWS SES configuration
    ses: {
      accessKeyId: String,
      secretAccessKey: String,
      region: String,
      fromEmail: String,
      fromName: String
    },

    // Postmark configuration
    postmark: {
      serverToken: String,
      fromEmail: String,
      fromName: String
    },

    // SparkPost configuration
    sparkpost: {
      apiKey: String,
      endpoint: String,
      fromEmail: String,
      fromName: String
    }
  },

  // Rate limiting
  rateLimit: {
    enabled: { type: Boolean, default: false },
    maxPerHour: Number,
    maxPerDay: Number,
    currentHourCount: { type: Number, default: 0 },
    currentDayCount: { type: Number, default: 0 },
    hourResetAt: Date,
    dayResetAt: Date
  },

  // Usage rules
  rules: {
    // Use this provider only for specific scenarios
    onlyFor: {
      priorities: [String], // ['High', 'Critical']
      emailTypes: [String], // ['transactional', 'marketing', 'digest']
      domains: [String] // ['@company.com', '@important-client.com']
    },
    // Don't use for these scenarios
    notFor: {
      priorities: [String],
      emailTypes: [String],
      domains: [String]
    }
  },

  // Health monitoring
  health: {
    status: {
      type: String,
      enum: ['healthy', 'degraded', 'unhealthy', 'unknown'],
      default: 'unknown'
    },
    lastChecked: Date,
    lastHealthy: Date,
    consecutiveFailures: { type: Number, default: 0 },
    maxConsecutiveFailures: { type: Number, default: 5 }
  },

  // Statistics
  stats: {
    totalSent: { type: Number, default: 0 },
    totalFailed: { type: Number, default: 0 },
    totalRetries: { type: Number, default: 0 },
    lastSent: Date,
    lastFailed: Date,
    averageResponseTime: { type: Number, default: 0 }, // in milliseconds
    successRate: { type: Number, default: 100 }, // percentage

    // Hourly stats
    lastHour: {
      sent: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      resetAt: Date
    },

    // Daily stats
    lastDay: {
      sent: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      resetAt: Date
    }
  },

  // Failover configuration
  failover: {
    enabled: { type: Boolean, default: true },
    fallbackProviderId: { type: mongoose.Schema.Types.ObjectId, ref: 'emailProviders' },
    retryAttempts: { type: Number, default: 3 },
    retryDelay: { type: Number, default: 1000 } // milliseconds
  },

  // Metadata
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'accounts' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'accounts' },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Indexes
emailProviderSchema.index({ isActive: 1, priority: 1 })
emailProviderSchema.index({ type: 1 })
emailProviderSchema.index({ isPrimary: 1 })
emailProviderSchema.index({ 'health.status': 1 })

// Pre-save middleware
emailProviderSchema.pre('save', function (next) {
  this.updatedAt = Date.now()
  return next()
})

/**
 * Get active providers ordered by priority
 */
emailProviderSchema.statics.getActiveProviders = function (callback) {
  return this.find({
    isActive: true,
    'health.status': { $ne: 'unhealthy' }
  })
    .sort({ priority: 1 })
    .exec(callback)
}

/**
 * Get primary provider
 */
emailProviderSchema.statics.getPrimaryProvider = function (callback) {
  return this.findOne({
    isPrimary: true,
    isActive: true,
    'health.status': { $ne: 'unhealthy' }
  }).exec(callback)
}

/**
 * Get providers by type
 */
emailProviderSchema.statics.getByType = function (type, callback) {
  return this.find({
    type: type,
    isActive: true,
    'health.status': { $ne: 'unhealthy' }
  })
    .sort({ priority: 1 })
    .exec(callback)
}

/**
 * Increment sent counter
 */
emailProviderSchema.methods.incrementSent = function (responseTime, callback) {
  var now = new Date()

  // Update total stats
  this.stats.totalSent += 1
  this.stats.lastSent = now

  // Update average response time
  var totalTime = this.stats.averageResponseTime * (this.stats.totalSent - 1)
  this.stats.averageResponseTime = (totalTime + responseTime) / this.stats.totalSent

  // Update success rate
  var total = this.stats.totalSent + this.stats.totalFailed
  this.stats.successRate = (this.stats.totalSent / total) * 100

  // Reset hourly counter if needed
  if (!this.stats.lastHour.resetAt || now - this.stats.lastHour.resetAt > 3600000) {
    this.stats.lastHour.sent = 0
    this.stats.lastHour.failed = 0
    this.stats.lastHour.resetAt = now
  }
  this.stats.lastHour.sent += 1

  // Reset daily counter if needed
  if (!this.stats.lastDay.resetAt || now - this.stats.lastDay.resetAt > 86400000) {
    this.stats.lastDay.sent = 0
    this.stats.lastDay.failed = 0
    this.stats.lastDay.resetAt = now
  }
  this.stats.lastDay.sent += 1

  // Update rate limit counters
  if (this.rateLimit.enabled) {
    // Reset hour counter
    if (!this.rateLimit.hourResetAt || now - this.rateLimit.hourResetAt > 3600000) {
      this.rateLimit.currentHourCount = 0
      this.rateLimit.hourResetAt = now
    }
    this.rateLimit.currentHourCount += 1

    // Reset day counter
    if (!this.rateLimit.dayResetAt || now - this.rateLimit.dayResetAt > 86400000) {
      this.rateLimit.currentDayCount = 0
      this.rateLimit.dayResetAt = now
    }
    this.rateLimit.currentDayCount += 1
  }

  // Reset consecutive failures on success
  this.health.consecutiveFailures = 0
  this.health.lastHealthy = now
  this.health.status = 'healthy'

  this.save(callback)
}

/**
 * Increment failed counter
 */
emailProviderSchema.methods.incrementFailed = function (callback) {
  var now = new Date()

  this.stats.totalFailed += 1
  this.stats.lastFailed = now

  // Update success rate
  var total = this.stats.totalSent + this.stats.totalFailed
  this.stats.successRate = (this.stats.totalSent / total) * 100

  // Update hourly stats
  if (!this.stats.lastHour.resetAt || now - this.stats.lastHour.resetAt > 3600000) {
    this.stats.lastHour.sent = 0
    this.stats.lastHour.failed = 0
    this.stats.lastHour.resetAt = now
  }
  this.stats.lastHour.failed += 1

  // Update daily stats
  if (!this.stats.lastDay.resetAt || now - this.stats.lastDay.resetAt > 86400000) {
    this.stats.lastDay.sent = 0
    this.stats.lastDay.failed = 0
    this.stats.lastDay.resetAt = now
  }
  this.stats.lastDay.failed += 1

  // Increment consecutive failures
  this.health.consecutiveFailures += 1

  // Update health status
  if (this.health.consecutiveFailures >= this.health.maxConsecutiveFailures) {
    this.health.status = 'unhealthy'
  } else if (this.health.consecutiveFailures >= this.health.maxConsecutiveFailures / 2) {
    this.health.status = 'degraded'
  }

  this.save(callback)
}

/**
 * Check if rate limit exceeded
 */
emailProviderSchema.methods.isRateLimitExceeded = function () {
  if (!this.rateLimit.enabled) {
    return false
  }

  var now = new Date()

  // Check hour limit
  if (this.rateLimit.maxPerHour) {
    if (!this.rateLimit.hourResetAt || now - this.rateLimit.hourResetAt > 3600000) {
      return false // Counter will be reset
    }
    if (this.rateLimit.currentHourCount >= this.rateLimit.maxPerHour) {
      return true
    }
  }

  // Check day limit
  if (this.rateLimit.maxPerDay) {
    if (!this.rateLimit.dayResetAt || now - this.rateLimit.dayResetAt > 86400000) {
      return false // Counter will be reset
    }
    if (this.rateLimit.currentDayCount >= this.rateLimit.maxPerDay) {
      return true
    }
  }

  return false
}

/**
 * Check if provider matches rules
 */
emailProviderSchema.methods.matchesRules = function (context) {
  // Check onlyFor rules
  if (this.rules.onlyFor) {
    // Check priorities
    if (this.rules.onlyFor.priorities && this.rules.onlyFor.priorities.length > 0) {
      if (context.priority && !this.rules.onlyFor.priorities.includes(context.priority)) {
        return false
      }
    }

    // Check email types
    if (this.rules.onlyFor.emailTypes && this.rules.onlyFor.emailTypes.length > 0) {
      if (context.emailType && !this.rules.onlyFor.emailTypes.includes(context.emailType)) {
        return false
      }
    }

    // Check domains
    if (this.rules.onlyFor.domains && this.rules.onlyFor.domains.length > 0) {
      if (context.recipientDomain) {
        var matches = this.rules.onlyFor.domains.some(function (domain) {
          return context.recipientDomain.endsWith(domain)
        })
        if (!matches) return false
      }
    }
  }

  // Check notFor rules
  if (this.rules.notFor) {
    // Check priorities
    if (this.rules.notFor.priorities && this.rules.notFor.priorities.length > 0) {
      if (context.priority && this.rules.notFor.priorities.includes(context.priority)) {
        return false
      }
    }

    // Check email types
    if (this.rules.notFor.emailTypes && this.rules.notFor.emailTypes.length > 0) {
      if (context.emailType && this.rules.notFor.emailTypes.includes(context.emailType)) {
        return false
      }
    }

    // Check domains
    if (this.rules.notFor.domains && this.rules.notFor.domains.length > 0) {
      if (context.recipientDomain) {
        var matches = this.rules.notFor.domains.some(function (domain) {
          return context.recipientDomain.endsWith(domain)
        })
        if (matches) return false
      }
    }
  }

  return true
}

/**
 * Reset statistics
 */
emailProviderSchema.methods.resetStats = function (callback) {
  this.stats = {
    totalSent: 0,
    totalFailed: 0,
    totalRetries: 0,
    averageResponseTime: 0,
    successRate: 100,
    lastHour: { sent: 0, failed: 0, resetAt: new Date() },
    lastDay: { sent: 0, failed: 0, resetAt: new Date() }
  }

  this.health.consecutiveFailures = 0
  this.health.status = 'unknown'

  this.save(callback)
}

/**
 * Test provider connection
 */
emailProviderSchema.methods.testConnection = function (callback) {
  var providerManager = require('../email/providers/manager')

  providerManager.testProvider(this, function (err, result) {
    if (err) {
      this.health.status = 'unhealthy'
      this.health.lastChecked = new Date()
      this.save(function () {})
      return callback(err)
    }

    this.health.status = 'healthy'
    this.health.lastHealthy = new Date()
    this.health.lastChecked = new Date()
    this.health.consecutiveFailures = 0
    this.save(function () {})

    callback(null, result)
  }.bind(this))
}

module.exports = mongoose.model(COLLECTION, emailProviderSchema)
