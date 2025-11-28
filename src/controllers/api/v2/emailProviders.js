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

var EmailProvider = require('../../../models/emailProvider')
var providerManager = require('../../../email/providers/manager')
var apiUtils = require('../apiUtils')

var emailProvidersApi = {}

/**
 * GET /api/v2/email-providers
 * Get all email providers
 */
emailProvidersApi.list = function (req, res) {
  var query = {}

  if (req.query.isActive !== undefined) {
    query.isActive = req.query.isActive === 'true'
  }

  if (req.query.type) {
    query.type = req.query.type
  }

  EmailProvider.find(query)
    .sort({ priority: 1, createdAt: -1 })
    .populate('createdBy', 'fullname email')
    .populate('failover.fallbackProviderId', 'name type')
    .exec(function (err, providers) {
      if (err) {
        return apiUtils.sendApiError(res, 500, err.message)
      }

      return apiUtils.sendApiSuccess(res, {
        providers: providers,
        total: providers.length
      })
    })
}

/**
 * GET /api/v2/email-providers/:id
 * Get single email provider
 */
emailProvidersApi.get = function (req, res) {
  var providerId = req.params.id

  EmailProvider.findById(providerId)
    .populate('createdBy', 'fullname email')
    .populate('failover.fallbackProviderId', 'name type')
    .exec(function (err, provider) {
      if (err) {
        return apiUtils.sendApiError(res, 500, err.message)
      }

      if (!provider) {
        return apiUtils.sendApiError(res, 404, 'Provider not found')
      }

      return apiUtils.sendApiSuccess(res, { provider: provider })
    })
}

/**
 * POST /api/v2/email-providers
 * Create new email provider
 */
emailProvidersApi.create = function (req, res) {
  var providerData = req.body

  // Set creator
  if (req.user && req.user._id) {
    providerData.createdBy = req.user._id
    providerData.updatedBy = req.user._id
  }

  // If this is set as primary, unset others
  if (providerData.isPrimary) {
    EmailProvider.updateMany(
      { isPrimary: true },
      { $set: { isPrimary: false } }
    ).exec(function (err) {
      if (err) {
        return apiUtils.sendApiError(res, 500, err.message)
      }

      createProvider()
    })
  } else {
    createProvider()
  }

  function createProvider() {
    var provider = new EmailProvider(providerData)

    provider.save(function (err, savedProvider) {
      if (err) {
        if (err.name === 'ValidationError') {
          var errors = Object.keys(err.errors).map(function (key) {
            return err.errors[key].message
          })
          return apiUtils.sendApiError(res, 400, 'Validation failed', errors)
        }
        return apiUtils.sendApiError(res, 500, err.message)
      }

      // Clear transport cache
      providerManager.clearCache()

      return apiUtils.sendApiSuccess(res, {
        provider: savedProvider,
        message: 'Email provider created successfully'
      })
    })
  }
}

/**
 * PUT /api/v2/email-providers/:id
 * Update email provider
 */
emailProvidersApi.update = function (req, res) {
  var providerId = req.params.id
  var updateData = req.body

  EmailProvider.findById(providerId).exec(function (err, provider) {
    if (err) {
      return apiUtils.sendApiError(res, 500, err.message)
    }

    if (!provider) {
      return apiUtils.sendApiError(res, 404, 'Provider not found')
    }

    // Update allowed fields
    var allowedFields = [
      'name', 'description', 'isActive', 'isPrimary', 'priority',
      'config', 'rateLimit', 'rules', 'failover'
    ]

    allowedFields.forEach(function (field) {
      if (updateData[field] !== undefined) {
        provider[field] = updateData[field]
      }
    })

    // Set updater
    if (req.user && req.user._id) {
      provider.updatedBy = req.user._id
    }

    // If setting as primary, unset others
    if (updateData.isPrimary && !provider.isPrimary) {
      EmailProvider.updateMany(
        { _id: { $ne: providerId }, isPrimary: true },
        { $set: { isPrimary: false } }
      ).exec(function () {})
    }

    provider.save(function (err, savedProvider) {
      if (err) {
        if (err.name === 'ValidationError') {
          var errors = Object.keys(err.errors).map(function (key) {
            return err.errors[key].message
          })
          return apiUtils.sendApiError(res, 400, 'Validation failed', errors)
        }
        return apiUtils.sendApiError(res, 500, err.message)
      }

      // Clear transport cache for this provider
      providerManager.clearCache(providerId)

      return apiUtils.sendApiSuccess(res, {
        provider: savedProvider,
        message: 'Email provider updated successfully'
      })
    })
  })
}

/**
 * DELETE /api/v2/email-providers/:id
 * Delete email provider
 */
emailProvidersApi.delete = function (req, res) {
  var providerId = req.params.id

  EmailProvider.findByIdAndRemove(providerId).exec(function (err, provider) {
    if (err) {
      return apiUtils.sendApiError(res, 500, err.message)
    }

    if (!provider) {
      return apiUtils.sendApiError(res, 404, 'Provider not found')
    }

    // Clear transport cache
    providerManager.clearCache(providerId)

    return apiUtils.sendApiSuccess(res, {
      message: 'Email provider deleted successfully'
    })
  })
}

/**
 * POST /api/v2/email-providers/:id/toggle
 * Toggle provider active status
 */
emailProvidersApi.toggle = function (req, res) {
  var providerId = req.params.id

  EmailProvider.findById(providerId).exec(function (err, provider) {
    if (err) {
      return apiUtils.sendApiError(res, 500, err.message)
    }

    if (!provider) {
      return apiUtils.sendApiError(res, 404, 'Provider not found')
    }

    provider.isActive = !provider.isActive

    if (req.user && req.user._id) {
      provider.updatedBy = req.user._id
    }

    provider.save(function (err, savedProvider) {
      if (err) {
        return apiUtils.sendApiError(res, 500, err.message)
      }

      // Clear transport cache
      providerManager.clearCache(providerId)

      return apiUtils.sendApiSuccess(res, {
        provider: savedProvider,
        message: 'Provider ' + (savedProvider.isActive ? 'activated' : 'deactivated') + ' successfully'
      })
    })
  })
}

/**
 * POST /api/v2/email-providers/:id/test
 * Test provider connection
 */
emailProvidersApi.test = function (req, res) {
  var providerId = req.params.id

  EmailProvider.findById(providerId).exec(function (err, provider) {
    if (err) {
      return apiUtils.sendApiError(res, 500, err.message)
    }

    if (!provider) {
      return apiUtils.sendApiError(res, 404, 'Provider not found')
    }

    provider.testConnection(function (err, result) {
      if (err) {
        return apiUtils.sendApiError(res, 500, 'Connection test failed: ' + err.message)
      }

      return apiUtils.sendApiSuccess(res, {
        test: result,
        message: 'Connection test successful'
      })
    })
  })
}

/**
 * POST /api/v2/email-providers/:id/reset-stats
 * Reset provider statistics
 */
emailProvidersApi.resetStats = function (req, res) {
  var providerId = req.params.id

  EmailProvider.findById(providerId).exec(function (err, provider) {
    if (err) {
      return apiUtils.sendApiError(res, 500, err.message)
    }

    if (!provider) {
      return apiUtils.sendApiError(res, 404, 'Provider not found')
    }

    provider.resetStats(function (err) {
      if (err) {
        return apiUtils.sendApiError(res, 500, err.message)
      }

      return apiUtils.sendApiSuccess(res, {
        message: 'Provider statistics reset successfully'
      })
    })
  })
}

/**
 * GET /api/v2/email-providers/stats/summary
 * Get overall provider statistics
 */
emailProvidersApi.statsSummary = function (req, res) {
  providerManager.getStatistics(function (err, stats) {
    if (err) {
      return apiUtils.sendApiError(res, 500, err.message)
    }

    return apiUtils.sendApiSuccess(res, {
      stats: stats
    })
  })
}

/**
 * GET /api/v2/email-providers/types
 * Get supported provider types
 */
emailProvidersApi.getTypes = function (req, res) {
  var types = [
    {
      value: 'smtp',
      label: 'SMTP',
      description: 'Standard SMTP server',
      configFields: ['host', 'port', 'secure', 'auth.user', 'auth.pass']
    },
    {
      value: 'sendgrid',
      label: 'SendGrid',
      description: 'SendGrid email service',
      configFields: ['apiKey', 'fromEmail', 'fromName']
    },
    {
      value: 'mailgun',
      label: 'Mailgun',
      description: 'Mailgun email service',
      configFields: ['apiKey', 'domain', 'host', 'fromEmail', 'fromName']
    },
    {
      value: 'ses',
      label: 'Amazon SES',
      description: 'Amazon Simple Email Service',
      configFields: ['accessKeyId', 'secretAccessKey', 'region', 'fromEmail', 'fromName']
    },
    {
      value: 'postmark',
      label: 'Postmark',
      description: 'Postmark email service',
      configFields: ['serverToken', 'fromEmail', 'fromName']
    },
    {
      value: 'sparkpost',
      label: 'SparkPost',
      description: 'SparkPost email service',
      configFields: ['apiKey', 'endpoint', 'fromEmail', 'fromName']
    }
  ]

  return apiUtils.sendApiSuccess(res, {
    types: types
  })
}

module.exports = emailProvidersApi
