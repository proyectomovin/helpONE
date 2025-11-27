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

var mongoose = require('mongoose')

var COLLECTION = 'emailTemplates'

/**
 * Email Template Schema
 * Stores email templates for notifications with support for visual editor
 */
var emailTemplateSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true, index: true },
  displayName: String,
  description: String,

  // Template type/category
  type: {
    type: String,
    required: true,
    enum: [
      'ticket-created',
      'ticket-assigned',
      'ticket-updated',
      'ticket-closed',
      'ticket-reopened',
      'ticket-comment-added',
      'ticket-note-added',
      'ticket-priority-changed',
      'ticket-status-changed',
      'ticket-transferred',
      'ticket-attachment-added',
      'ticket-mention',
      'ticket-sla-warning',
      'ticket-sla-exceeded',
      'ticket-no-response',
      'ticket-satisfaction-survey',
      'password-reset',
      'l2auth-reset',
      'l2auth-cleared',
      'new-password',
      'public-account-created',
      'digest-daily',
      'digest-weekly',
      'custom'
    ]
  },

  // Email content
  subject: { type: String, required: true },
  htmlContent: { type: String, required: true },
  textContent: String, // Plain text version

  // GrapesJS editor data
  grapesData: {
    type: Object,
    default: null
  },

  // Available variables for this template
  variables: [String],

  // Template settings
  isDefault: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  language: { type: String, default: 'es' },

  // Metadata
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'accounts' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'accounts' },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Indexes for better query performance
emailTemplateSchema.index({ type: 1, language: 1 })
emailTemplateSchema.index({ isActive: 1 })
emailTemplateSchema.index({ isDefault: 1 })

// Pre-save middleware
emailTemplateSchema.pre('save', function (next) {
  this.name = this.name.trim()
  this.slug = this.slug.trim().toLowerCase()
  this.updatedAt = Date.now()
  return next()
})

/**
 * Get template by slug
 */
emailTemplateSchema.statics.getBySlug = function (slug, callback) {
  return this.model(COLLECTION)
    .findOne({ slug: slug, isActive: true })
    .exec(callback)
}

/**
 * Get template by type and language
 */
emailTemplateSchema.statics.getByType = function (type, language, callback) {
  const query = { type: type, isActive: true }
  if (language) {
    query.language = language
  }

  return this.model(COLLECTION)
    .findOne(query)
    .sort({ isDefault: -1, createdAt: -1 })
    .exec(callback)
}

/**
 * Get all templates by type
 */
emailTemplateSchema.statics.getAllByType = function (type, callback) {
  return this.model(COLLECTION)
    .find({ type: type })
    .sort({ language: 1, createdAt: -1 })
    .exec(callback)
}

/**
 * Get default template for type
 */
emailTemplateSchema.statics.getDefault = function (type, callback) {
  return this.model(COLLECTION)
    .findOne({ type: type, isDefault: true, isActive: true })
    .exec(callback)
}

/**
 * Set as default template
 */
emailTemplateSchema.methods.setAsDefault = function (callback) {
  const self = this

  // First, unset all other defaults for this type
  this.model(COLLECTION).updateMany(
    { type: this.type, _id: { $ne: this._id } },
    { $set: { isDefault: false } },
    function (err) {
      if (err) return callback(err)

      // Then set this one as default
      self.isDefault = true
      self.save(callback)
    }
  )
}

/**
 * Clone template
 */
emailTemplateSchema.methods.clone = function (newName, callback) {
  const clonedTemplate = new this.constructor({
    name: newName,
    slug: newName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    displayName: this.displayName + ' (Copy)',
    description: this.description,
    type: this.type,
    subject: this.subject,
    htmlContent: this.htmlContent,
    textContent: this.textContent,
    grapesData: this.grapesData,
    variables: this.variables,
    language: this.language,
    isDefault: false,
    isActive: false
  })

  clonedTemplate.save(callback)
}

module.exports = mongoose.model(COLLECTION, emailTemplateSchema)
