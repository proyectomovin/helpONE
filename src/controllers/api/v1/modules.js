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

const moduleSchema = require('../../../models/module')

const apiModules = {}

apiModules.get = function (req, res) {
  moduleSchema.getModules(function (err, modules) {
    if (err) return res.status(500).json({ success: false, error: err.message })

    return res.json({ success: true, modules })
  })
}

apiModules.getEnabled = function (req, res) {
  moduleSchema.getEnabledModules(function (err, modules) {
    if (err) return res.status(500).json({ success: false, error: err.message })

    return res.json({ success: true, modules })
  })
}

apiModules.getByProduct = function (req, res) {
  const productId = req.params.productId
  moduleSchema.getModulesByProduct(productId, function (err, modules) {
    if (err) return res.status(500).json({ success: false, error: err.message })

    return res.json({ success: true, modules })
  })
}

apiModules.getSingle = function (req, res) {
  const id = req.params.id
  moduleSchema.getModule(id, function (err, module) {
    if (err) return res.status(500).json({ success: false, error: err.message })
    if (!module) return res.status(404).json({ success: false, error: 'Module not found' })

    return res.json({ success: true, module })
  })
}

apiModules.create = function (req, res) {
  const postData = req.body
  if (!postData.name) return res.status(400).json({ success: false, error: 'Name is required' })

  const module = new moduleSchema({
    name: postData.name,
    description: postData.description || '',
    product: postData.product || null,
    enabled: postData.enabled !== undefined ? postData.enabled : true
  })

  module.save(function (err, savedModule) {
    if (err) return res.status(400).json({ success: false, error: err.message })

    return res.json({ success: true, module: savedModule })
  })
}

apiModules.update = function (req, res) {
  const id = req.params.id
  const postData = req.body

  moduleSchema.getModule(id, function (err, module) {
    if (err) return res.status(500).json({ success: false, error: err.message })
    if (!module) return res.status(404).json({ success: false, error: 'Module not found' })

    if (postData.name) module.name = postData.name
    if (postData.description !== undefined) module.description = postData.description
    if (postData.product !== undefined) module.product = postData.product || null
    if (postData.enabled !== undefined) module.enabled = postData.enabled

    module.save(function (err, savedModule) {
      if (err) return res.status(400).json({ success: false, error: err.message })

      moduleSchema.getModule(savedModule._id, function (err, populatedModule) {
        if (err) return res.status(500).json({ success: false, error: err.message })
        return res.json({ success: true, module: populatedModule })
      })
    })
  })
}

apiModules.delete = function (req, res) {
  const id = req.params.id

  moduleSchema.findByIdAndDelete(id, function (err) {
    if (err) return res.status(500).json({ success: false, error: err.message })

    return res.json({ success: true })
  })
}

module.exports = apiModules
