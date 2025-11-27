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

var EmailTemplate = require('../../../models/emailTemplate')
var emailModule = require('../../../email')
var variablesHelper = require('../../../email/templates/variables')
var templateEngine = require('../../../email/templates/engine')
var apiUtils = require('../apiUtils')

var emailTemplatesApi = {}

/**
 * @api {get} /api/v2/email-templates Get All Templates
 * @apiName getTemplates
 * @apiDescription Get all email templates
 * @apiVersion 2.0.0
 * @apiGroup EmailTemplates
 * @apiHeader {String} accesstoken The access token for the logged in user
 *
 * @apiExample Example usage:
 * curl -X GET -H "accesstoken: {accesstoken}" -L http://localhost/api/v2/email-templates
 *
 * @apiSuccess {Boolean} success Success status
 * @apiSuccess {Array} templates Array of email templates
 */
emailTemplatesApi.get = function (req, res) {
  var query = {}

  // Filter by type
  if (req.query.type) {
    query.type = req.query.type
  }

  // Filter by language
  if (req.query.language) {
    query.language = req.query.language
  }

  // Filter by active status
  if (req.query.active !== undefined) {
    query.isActive = req.query.active === 'true'
  }

  EmailTemplate.find(query)
    .sort({ type: 1, language: 1, createdAt: -1 })
    .select('-grapesData') // Exclude heavy grapes data from list
    .exec(function (err, templates) {
      if (err) return apiUtils.sendApiError(res, 500, err.message)

      return apiUtils.sendApiSuccess(res, { templates: templates })
    })
}

/**
 * @api {get} /api/v2/email-templates/:id Get Single Template
 * @apiName getTemplate
 * @apiDescription Get a single email template by ID
 * @apiVersion 2.0.0
 * @apiGroup EmailTemplates
 * @apiHeader {String} accesstoken The access token for the logged in user
 */
emailTemplatesApi.single = function (req, res) {
  var templateId = req.params.id

  if (!templateId) {
    return apiUtils.sendApiError(res, 400, 'Invalid template ID')
  }

  EmailTemplate.findById(templateId).exec(function (err, template) {
    if (err) return apiUtils.sendApiError(res, 500, err.message)
    if (!template) return apiUtils.sendApiError(res, 404, 'Template not found')

    return apiUtils.sendApiSuccess(res, { template: template })
  })
}

/**
 * @api {post} /api/v2/email-templates Create Template
 * @apiName createTemplate
 * @apiDescription Create a new email template
 * @apiVersion 2.0.0
 * @apiGroup EmailTemplates
 * @apiHeader {String} accesstoken The access token for the logged in user
 */
emailTemplatesApi.create = function (req, res) {
  var data = req.body

  if (!data.name || !data.slug || !data.type || !data.subject || !data.htmlContent) {
    return apiUtils.sendApiError(res, 400, 'Missing required fields')
  }

  // Check if slug already exists
  EmailTemplate.findOne({ slug: data.slug }).exec(function (err, existing) {
    if (err) return apiUtils.sendApiError(res, 500, err.message)
    if (existing) return apiUtils.sendApiError(res, 400, 'Template with this slug already exists')

    // Extract variables from template
    var htmlVariables = templateEngine.extractVariables(data.htmlContent)
    var subjectVariables = templateEngine.extractVariables(data.subject)
    var allVariables = htmlVariables.concat(subjectVariables).filter(function (value, index, self) {
      return self.indexOf(value) === index
    })

    var template = new EmailTemplate({
      name: data.name,
      slug: data.slug,
      displayName: data.displayName,
      description: data.description,
      type: data.type,
      subject: data.subject,
      htmlContent: data.htmlContent,
      textContent: data.textContent,
      grapesData: data.grapesData,
      variables: allVariables,
      language: data.language || 'es',
      isDefault: data.isDefault || false,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdBy: req.user._id
    })

    template.save(function (err, savedTemplate) {
      if (err) return apiUtils.sendApiError(res, 500, err.message)

      return apiUtils.sendApiSuccess(res, { template: savedTemplate })
    })
  })
}

/**
 * @api {put} /api/v2/email-templates/:id Update Template
 * @apiName updateTemplate
 * @apiDescription Update an email template
 * @apiVersion 2.0.0
 * @apiGroup EmailTemplates
 * @apiHeader {String} accesstoken The access token for the logged in user
 */
emailTemplatesApi.update = function (req, res) {
  var templateId = req.params.id
  var data = req.body

  if (!templateId) {
    return apiUtils.sendApiError(res, 400, 'Invalid template ID')
  }

  EmailTemplate.findById(templateId).exec(function (err, template) {
    if (err) return apiUtils.sendApiError(res, 500, err.message)
    if (!template) return apiUtils.sendApiError(res, 404, 'Template not found')

    // Update fields
    if (data.name) template.name = data.name
    if (data.displayName !== undefined) template.displayName = data.displayName
    if (data.description !== undefined) template.description = data.description
    if (data.subject) template.subject = data.subject
    if (data.htmlContent) template.htmlContent = data.htmlContent
    if (data.textContent !== undefined) template.textContent = data.textContent
    if (data.grapesData !== undefined) template.grapesData = data.grapesData
    if (data.language) template.language = data.language
    if (data.isActive !== undefined) template.isActive = data.isActive

    // Re-extract variables
    var htmlVariables = templateEngine.extractVariables(template.htmlContent)
    var subjectVariables = templateEngine.extractVariables(template.subject)
    template.variables = htmlVariables.concat(subjectVariables).filter(function (value, index, self) {
      return self.indexOf(value) === index
    })

    template.updatedBy = req.user._id

    template.save(function (err, updatedTemplate) {
      if (err) return apiUtils.sendApiError(res, 500, err.message)

      return apiUtils.sendApiSuccess(res, { template: updatedTemplate })
    })
  })
}

/**
 * @api {delete} /api/v2/email-templates/:id Delete Template
 * @apiName deleteTemplate
 * @apiDescription Delete an email template
 * @apiVersion 2.0.0
 * @apiGroup EmailTemplates
 * @apiHeader {String} accesstoken The access token for the logged in user
 */
emailTemplatesApi.delete = function (req, res) {
  var templateId = req.params.id

  if (!templateId) {
    return apiUtils.sendApiError(res, 400, 'Invalid template ID')
  }

  EmailTemplate.findById(templateId).exec(function (err, template) {
    if (err) return apiUtils.sendApiError(res, 500, err.message)
    if (!template) return apiUtils.sendApiError(res, 404, 'Template not found')

    // Prevent deletion of default templates
    if (template.isDefault) {
      return apiUtils.sendApiError(res, 400, 'Cannot delete default template. Set another template as default first.')
    }

    template.deleteOne(function (err) {
      if (err) return apiUtils.sendApiError(res, 500, err.message)

      return apiUtils.sendApiSuccess(res, { success: true })
    })
  })
}

/**
 * @api {post} /api/v2/email-templates/:id/clone Clone Template
 * @apiName cloneTemplate
 * @apiDescription Clone an email template
 * @apiVersion 2.0.0
 * @apiGroup EmailTemplates
 * @apiHeader {String} accesstoken The access token for the logged in user
 */
emailTemplatesApi.clone = function (req, res) {
  var templateId = req.params.id
  var newName = req.body.name

  if (!templateId) {
    return apiUtils.sendApiError(res, 400, 'Invalid template ID')
  }

  if (!newName) {
    return apiUtils.sendApiError(res, 400, 'New template name is required')
  }

  EmailTemplate.findById(templateId).exec(function (err, template) {
    if (err) return apiUtils.sendApiError(res, 500, err.message)
    if (!template) return apiUtils.sendApiError(res, 404, 'Template not found')

    template.clone(newName, function (err, clonedTemplate) {
      if (err) return apiUtils.sendApiError(res, 500, err.message)

      clonedTemplate.createdBy = req.user._id
      clonedTemplate.save(function (err, savedTemplate) {
        if (err) return apiUtils.sendApiError(res, 500, err.message)

        return apiUtils.sendApiSuccess(res, { template: savedTemplate })
      })
    })
  })
}

/**
 * @api {post} /api/v2/email-templates/:id/set-default Set as Default
 * @apiName setDefaultTemplate
 * @apiDescription Set template as default for its type
 * @apiVersion 2.0.0
 * @apiGroup EmailTemplates
 * @apiHeader {String} accesstoken The access token for the logged in user
 */
emailTemplatesApi.setDefault = function (req, res) {
  var templateId = req.params.id

  if (!templateId) {
    return apiUtils.sendApiError(res, 400, 'Invalid template ID')
  }

  EmailTemplate.findById(templateId).exec(function (err, template) {
    if (err) return apiUtils.sendApiError(res, 500, err.message)
    if (!template) return apiUtils.sendApiError(res, 404, 'Template not found')

    template.setAsDefault(function (err) {
      if (err) return apiUtils.sendApiError(res, 500, err.message)

      return apiUtils.sendApiSuccess(res, { success: true })
    })
  })
}

/**
 * @api {post} /api/v2/email-templates/:id/preview Preview Template
 * @apiName previewTemplate
 * @apiDescription Preview template rendering with sample or custom data
 * @apiVersion 2.0.0
 * @apiGroup EmailTemplates
 * @apiHeader {String} accesstoken The access token for the logged in user
 */
emailTemplatesApi.preview = function (req, res) {
  var templateId = req.params.id
  var useSampleData = req.body.useSampleData !== false
  var customData = req.body.data

  if (!templateId) {
    return apiUtils.sendApiError(res, 400, 'Invalid template ID')
  }

  var data = useSampleData ? variablesHelper.getSampleData() : customData

  emailModule.previewTemplate(templateId, data, function (err, result) {
    if (err) return apiUtils.sendApiError(res, 500, err.message)

    return apiUtils.sendApiSuccess(res, result)
  })
}

/**
 * @api {post} /api/v2/email-templates/:id/test Send Test Email
 * @apiName testTemplate
 * @apiDescription Send a test email using the template
 * @apiVersion 2.0.0
 * @apiGroup EmailTemplates
 * @apiHeader {String} accesstoken The access token for the logged in user
 *
 * @apiParam {String} email Email address to send test to
 * @apiParam {Boolean} [useSampleData=true] Use sample data or custom data
 * @apiParam {Object} [data] Custom data for template rendering
 */
emailTemplatesApi.test = function (req, res) {
  var templateId = req.params.id
  var testEmail = req.body.email
  var useSampleData = req.body.useSampleData !== false
  var customData = req.body.data

  if (!templateId) {
    return apiUtils.sendApiError(res, 400, 'Invalid template ID')
  }

  if (!testEmail) {
    return apiUtils.sendApiError(res, 400, 'Email address is required')
  }

  // Validate email format
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(testEmail)) {
    return apiUtils.sendApiError(res, 400, 'Invalid email address format')
  }

  emailModule.sendTestEmail(templateId, testEmail, useSampleData, customData, function (err, result) {
    if (err) return apiUtils.sendApiError(res, 500, err.message)

    return apiUtils.sendApiSuccess(res, result)
  })
}

/**
 * @api {post} /api/v2/email-templates/validate Validate Template
 * @apiName validateTemplate
 * @apiDescription Validate template variables and syntax
 * @apiVersion 2.0.0
 * @apiGroup EmailTemplates
 * @apiHeader {String} accesstoken The access token for the logged in user
 */
emailTemplatesApi.validate = function (req, res) {
  var htmlContent = req.body.htmlContent
  var subject = req.body.subject

  if (!htmlContent || !subject) {
    return apiUtils.sendApiError(res, 400, 'HTML content and subject are required')
  }

  emailModule.validateTemplate(htmlContent, subject, function (err, result) {
    if (err) return apiUtils.sendApiError(res, 500, err.message)

    return apiUtils.sendApiSuccess(res, result)
  })
}

/**
 * @api {get} /api/v2/email-templates/variables Get Available Variables
 * @apiName getVariables
 * @apiDescription Get documentation for all available template variables
 * @apiVersion 2.0.0
 * @apiGroup EmailTemplates
 * @apiHeader {String} accesstoken The access token for the logged in user
 */
emailTemplatesApi.getVariables = function (req, res) {
  var documentation = variablesHelper.getVariablesDocumentation()
  return apiUtils.sendApiSuccess(res, { variables: documentation })
}

/**
 * @api {get} /api/v2/email-templates/sample-data Get Sample Data
 * @apiName getSampleData
 * @apiDescription Get sample data for testing templates
 * @apiVersion 2.0.0
 * @apiGroup EmailTemplates
 * @apiHeader {String} accesstoken The access token for the logged in user
 */
emailTemplatesApi.getSampleData = function (req, res) {
  var sampleData = variablesHelper.getSampleData()
  return apiUtils.sendApiSuccess(res, { data: sampleData })
}

module.exports = emailTemplatesApi
