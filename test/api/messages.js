/* eslint-disable no-unused-expressions */
var expect = require('chai').expect
var request = require('supertest')
var axios = require('axios')
var Conversation = require('../../src/models/chat/conversation')
var Message = require('../../src/models/chat/message')
var Webhook = require('../../src/models/webhook')
var User = require('../../src/models/user')
var webhookService = require('../../src/webhooks')
var emitter = require('../../src/emitter')

describe('api/messages.js', function () {
  var tdapikey = 'da39a3ee5e6b4b0d3255bfef95601890afd80709'
  var agent = request('http://localhost:3111')
  var axiosAdapter
  var recordedRequests = []
  var conversation
  var owner
  var participant

  before(async function () {
    this.timeout(10000)

    axiosAdapter = axios.defaults.adapter
    axios.defaults.adapter = function (config) {
      recordedRequests.push(config)
      return Promise.resolve({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config
      })
    }

    await Webhook.deleteMany({})

    owner = await User.findOne({ username: 'trudesk' }).exec()
    participant = await User.findOne({ username: 'fake.user' }).exec()

    expect(owner).to.exist
    expect(participant).to.exist

    conversation = await Conversation.create({
      participants: [owner._id, participant._id],
      userMeta: [
        { userId: owner._id, joinedAt: new Date(), lastRead: new Date() },
        { userId: participant._id, joinedAt: new Date() }
      ],
      updatedAt: new Date()
    })

    await Webhook.create({
      name: 'Message Created Test Webhook',
      targetUrl: 'http://example.com/webhook',
      method: 'POST',
      isActive: true,
      events: ['message:created']
    })

    await webhookService.reload()
  })

  after(async function () {
    this.timeout(10000)

    axios.defaults.adapter = axiosAdapter

    if (conversation) {
      await Message.deleteMany({ conversation: conversation._id })
      await Conversation.deleteOne({ _id: conversation._id })
    }

    await Webhook.deleteMany({})
    webhookService.invalidate()
  })

  beforeEach(function () {
    recordedRequests = []
  })

  it('should send chat message and dispatch webhook event', function (done) {
    this.timeout(10000)

    var listeners = emitter.listeners('message:created')
    var hasWebhookListener = listeners.some(function (listener) {
      return listener && listener.name === 'handler'
    })

    expect(hasWebhookListener).to.equal(true)

    agent
      .post('/api/v1/messages/send')
      .set('accesstoken', tdapikey)
      .set('Content-Type', 'application/json')
      .send({
        cId: conversation._id.toString(),
        owner: owner._id.toString(),
        body: 'Webhook integration test message'
      })
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)

        expect(res.body.success).to.equal(true)

        var webhookRequest = recordedRequests.find(function (config) {
          return config && config.headers && config.headers['X-Trudesk-Event'] === 'message:created'
        })

        expect(webhookRequest).to.exist
        expect(webhookRequest.data.event).to.equal('message:created')

        done()
      })
  })
})

