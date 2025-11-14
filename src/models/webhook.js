/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Author:     helpONE Contributors
 */

const mongoose = require('mongoose')

const COLLECTION = 'webhooks'

const headerSchema = new mongoose.Schema(
  {
    key: { type: String, trim: true, required: true },
    value: { type: String, trim: true, required: true }
  },
  { _id: false }
)

const webhookSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    targetUrl: { type: String, required: true, trim: true },
    events: { type: [String], default: [], required: true },
    secret: { type: String, default: null },
    method: {
      type: String,
      enum: ['POST', 'PUT', 'PATCH', 'GET', 'DELETE'],
      default: 'POST'
    },
    headers: { type: [headerSchema], default: [] },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model(COLLECTION, webhookSchema)
