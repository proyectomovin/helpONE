/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Created:    2025
 *  Copyright (c) 2014-2025. All rights reserved.
 */

const mongoose = require('mongoose')
const utils = require('../helpers/utils')

const COLLECTION = 'modules'

/**
 * Module Schema
 * @module models/module
 * @class Module
 *
 * @property {object} _id ```Required``` ```unique``` MongoDB Object ID
 * @property {String} name ```Required``` Name of Module
 * @property {String} description Description of the module
 * @property {Product} product Parent product (optional)
 * @property {Boolean} enabled If the module is enabled
 */
const moduleSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'products'
  },
  enabled: { type: Boolean, default: true, required: true }
})

moduleSchema.index({ name: 1, product: 1 }, { unique: true })

moduleSchema.pre('save', function (next) {
  this.name = utils.sanitizeFieldPlainText(this.name.trim())
  if (this.description) {
    this.description = utils.sanitizeFieldPlainText(this.description.trim())
  }

  return next()
})

moduleSchema.statics.getModule = function (_id, callback) {
  return this.model(COLLECTION)
    .findOne({ _id: _id })
    .populate('product')
    .exec(callback)
}

moduleSchema.statics.getModules = function (callback) {
  return this.model(COLLECTION)
    .find({})
    .populate('product')
    .sort('name')
    .exec(callback)
}

moduleSchema.statics.getEnabledModules = function (callback) {
  return this.model(COLLECTION)
    .find({ enabled: true })
    .populate('product')
    .sort('name')
    .exec(callback)
}

moduleSchema.statics.getModulesByProduct = function (productId, callback) {
  return this.model(COLLECTION)
    .find({ product: productId, enabled: true })
    .sort('name')
    .exec(callback)
}

moduleSchema.statics.getModulesWithoutProduct = function (callback) {
  return this.model(COLLECTION)
    .find({ product: { $exists: false }, enabled: true })
    .sort('name')
    .exec(callback)
}

module.exports = mongoose.model(COLLECTION, moduleSchema)
