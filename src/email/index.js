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

var mailer = require('../mailer')
var EmailTemplate = require('../models/emailTemplate')
var templateEngine = require('./templates/engine')
var variablesHelper = require('./templates/variables')
var winston = require('../logger')

var emailModule = {}

/**
 * Send email using template
 * @param {Object} options - Options object
 * @param {String} options.templateSlug - Template slug
 * @param {String} options.templateType - Template type (if slug not provided)
 * @param {String|Array} options.to - Recipient email(s)
 * @param {Object} options.data - Data for template rendering
 * @param {Function} callback - Callback function
 */
emailModule.sendTemplateEmail = function (options, callback) {
  if (!options.to) {
    return callback(new Error('Recipient email is required'))
  }

  // Get template
  var templateQuery = options.templateSlug
    ? EmailTemplate.getBySlug(options.templateSlug)
    : EmailTemplate.getByType(options.templateType, options.language || 'es')

  templateQuery.exec(function (err, template) {
    if (err) return callback(err)
    if (!template) {
      return callback(new Error('Email template not found'))
    }

    try {
      // Render template
      var rendered = templateEngine.renderEmailTemplate(template, options.data)

      // Prepare email
      var mailOptions = {
        to: Array.isArray(options.to) ? options.to.join(',') : options.to,
        subject: rendered.subject,
        html: rendered.html,
        generateTextFromHTML: true
      }

      if (rendered.text) {
        mailOptions.text = rendered.text
      }

      // Send email
      mailer.sendMail(mailOptions, function (err, info) {
        if (err) {
          winston.warn('Error sending template email: ' + err.message)
          return callback(err)
        }

        winston.debug('Template email sent successfully: ' + template.name)
        callback(null, info)
      })
    } catch (err) {
      winston.error('Error rendering email template: ' + err.message)
      callback(err)
    }
  })
}

/**
 * Send test email
 * @param {String} templateId - Template ID
 * @param {String} testEmail - Email to send test to
 * @param {Boolean} useSampleData - Use sample data or real data
 * @param {Object} customData - Custom data for testing
 * @param {Function} callback - Callback function
 */
emailModule.sendTestEmail = function (templateId, testEmail, useSampleData, customData, callback) {
  if (!testEmail) {
    return callback(new Error('Test email address is required'))
  }

  EmailTemplate.findById(templateId).exec(function (err, template) {
    if (err) return callback(err)
    if (!template) {
      return callback(new Error('Template not found'))
    }

    try {
      // Use sample data or custom data
      var data = useSampleData ? variablesHelper.getSampleData() : customData

      // Render template
      var rendered = templateEngine.renderEmailTemplate(template, data)

      // Prepare test email
      var mailOptions = {
        to: testEmail,
        subject: '[TEST] ' + rendered.subject,
        html: rendered.html,
        generateTextFromHTML: true
      }

      if (rendered.text) {
        mailOptions.text = rendered.text
      }

      // Send test email
      mailer.sendMail(mailOptions, function (err, info) {
        if (err) {
          winston.warn('Error sending test email: ' + err.message)
          return callback(err)
        }

        winston.debug('Test email sent successfully to: ' + testEmail)
        callback(null, {
          success: true,
          message: 'Test email sent successfully',
          info: info
        })
      })
    } catch (err) {
      winston.error('Error sending test email: ' + err.message)
      callback(err)
    }
  })
}

/**
 * Preview template rendering without sending
 * @param {String} templateId - Template ID
 * @param {Object} data - Data for rendering
 * @param {Function} callback - Callback function
 */
emailModule.previewTemplate = function (templateId, data, callback) {
  EmailTemplate.findById(templateId).exec(function (err, template) {
    if (err) return callback(err)
    if (!template) {
      return callback(new Error('Template not found'))
    }

    try {
      // Use sample data if no data provided
      var renderData = data || variablesHelper.getSampleData()

      // Render template
      var rendered = templateEngine.renderEmailTemplate(template, renderData)

      callback(null, {
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text
      })
    } catch (err) {
      winston.error('Error previewing template: ' + err.message)
      callback(err)
    }
  })
}

/**
 * Validate template
 * @param {String} htmlContent - HTML content
 * @param {String} subject - Subject line
 * @param {Function} callback - Callback function
 */
emailModule.validateTemplate = function (htmlContent, subject, callback) {
  try {
    var htmlValidation = templateEngine.validateTemplate(htmlContent)
    var subjectValidation = templateEngine.validateTemplate(subject)

    var allUnknownVariables = htmlValidation.unknownVariables.concat(subjectValidation.unknownVariables)
    var uniqueUnknownVariables = allUnknownVariables.filter(function (value, index, self) {
      return self.indexOf(value) === index
    })

    callback(null, {
      valid: htmlValidation.valid && subjectValidation.valid,
      unknownVariables: uniqueUnknownVariables,
      htmlVariables: htmlValidation.usedVariables,
      subjectVariables: subjectValidation.usedVariables
    })
  } catch (err) {
    callback(err)
  }
}

module.exports = emailModule
