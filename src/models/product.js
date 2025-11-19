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

const COLLECTION = 'products'

/**
 * Product Schema
 * @module models/product
 * @class Product
 *
 * @property {object} _id ```Required``` ```unique``` MongoDB Object ID
 * @property {String} name ```Required``` ```unique``` Name of Product
 * @property {String} description Description of the product
 * @property {Boolean} enabled If the product is enabled
 */
const productSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  enabled: { type: Boolean, default: true, required: true }
})

productSchema.pre('save', function (next) {
  this.name = utils.sanitizeFieldPlainText(this.name.trim())
  if (this.description) {
    this.description = utils.sanitizeFieldPlainText(this.description.trim())
  }

  return next()
})

productSchema.statics.getProduct = function (_id, callback) {
  return this.model(COLLECTION)
    .findOne({ _id: _id })
    .exec(callback)
}

productSchema.statics.getProducts = function (callback) {
  return this.model(COLLECTION)
    .find({})
    .sort('name')
    .exec(callback)
}

productSchema.statics.getEnabledProducts = function (callback) {
  return this.model(COLLECTION)
    .find({ enabled: true })
    .sort('name')
    .exec(callback)
}

productSchema.statics.getProductByName = function (name, callback) {
  return this.model(COLLECTION)
    .findOne({ name: name })
    .exec(callback)
}

module.exports = mongoose.model(COLLECTION, productSchema)
