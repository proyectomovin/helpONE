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

const productSchema = require('../../../models/product')

const apiProducts = {}

apiProducts.get = function (req, res) {
  productSchema.getProducts(function (err, products) {
    if (err) return res.status(500).json({ success: false, error: err.message })

    return res.json({ success: true, products })
  })
}

apiProducts.getEnabled = function (req, res) {
  productSchema.getEnabledProducts(function (err, products) {
    if (err) return res.status(500).json({ success: false, error: err.message })

    return res.json({ success: true, products })
  })
}

apiProducts.getSingle = function (req, res) {
  const id = req.params.id
  productSchema.getProduct(id, function (err, product) {
    if (err) return res.status(500).json({ success: false, error: err.message })
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' })

    return res.json({ success: true, product })
  })
}

apiProducts.create = function (req, res) {
  const postData = req.body
  if (!postData.name) return res.status(400).json({ success: false, error: 'Name is required' })

  const product = new productSchema({
    name: postData.name,
    description: postData.description || '',
    enabled: postData.enabled !== undefined ? postData.enabled : true
  })

  product.save(function (err, savedProduct) {
    if (err) return res.status(400).json({ success: false, error: err.message })

    return res.json({ success: true, product: savedProduct })
  })
}

apiProducts.update = function (req, res) {
  const id = req.params.id
  const postData = req.body

  productSchema.getProduct(id, function (err, product) {
    if (err) return res.status(500).json({ success: false, error: err.message })
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' })

    if (postData.name) product.name = postData.name
    if (postData.description !== undefined) product.description = postData.description
    if (postData.enabled !== undefined) product.enabled = postData.enabled

    product.save(function (err, savedProduct) {
      if (err) return res.status(400).json({ success: false, error: err.message })

      return res.json({ success: true, product: savedProduct })
    })
  })
}

apiProducts.delete = function (req, res) {
  const id = req.params.id

  productSchema.findByIdAndDelete(id, function (err) {
    if (err) return res.status(500).json({ success: false, error: err.message })

    return res.json({ success: true })
  })
}

module.exports = apiProducts
