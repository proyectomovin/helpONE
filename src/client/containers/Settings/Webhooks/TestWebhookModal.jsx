import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import BaseModal from 'containers/Modals/BaseModal'
import Button from 'components/Button'
import SingleSelect from 'components/SingleSelect'

import { testWebhook } from 'actions/webhooks'

import helpers from 'lib/helpers'
import { DEFAULT_WEBHOOK_EVENTS } from './constants'

class TestWebhookModal extends React.Component {
  constructor (props) {
    super(props)
    const initialEvent = this.getEventOptions(props).length ? this.getEventOptions(props)[0].value : ''
    this.state = {
      selectedEvent: initialEvent,
      payload: ''
    }
  }

  componentDidMount () {
    helpers.UI.inputs()
    helpers.UI.reRenderInputs()
  }

  componentDidUpdate (prevProps) {
    if (prevProps.webhook !== this.props.webhook) {
      const eventOptions = this.getEventOptions()
      this.setState({ selectedEvent: eventOptions.length ? eventOptions[0].value : '' })
    }

    helpers.UI.reRenderInputs()
  }

  getEventOptions (props = this.props) {
    const { webhook } = props
    const events = webhook && webhook.get('events')
      ? webhook.get('events').toArray
        ? webhook.get('events').toArray()
        : webhook.get('events')
      : []

    if (events && events.length) {
      return events.map(event => ({ value: event.value || event, text: event.text || event }))
    }

    return DEFAULT_WEBHOOK_EVENTS
  }

  handleEventChange = (e, value) => {
    const nextValue = Array.isArray(value) ? value[0] : value
    this.setState({ selectedEvent: nextValue })
  }

  handleInputChange = e => {
    this.setState({ payload: e.target.value })
  }

  handleSubmit = e => {
    e.preventDefault()
    const { selectedEvent, payload } = this.state
    if (!selectedEvent) {
      helpers.UI.showSnackbar('Please select an event to test.', true)
      return
    }

    let parsedPayload
    if (payload && payload.trim().length) {
      try {
        parsedPayload = JSON.parse(payload)
      } catch (err) {
        helpers.UI.showSnackbar('Payload must be valid JSON.', true)
        return
      }
    }

    this.props.testWebhook({ _id: this.props.webhookId, event: selectedEvent, payload: parsedPayload })
  }

  render () {
    const { selectedEvent, payload } = this.state
    const eventOptions = this.getEventOptions()

    return (
      <BaseModal>
        <form onSubmit={this.handleSubmit} className='uk-form-stacked'>
          <div className='uk-margin-medium-bottom'>
            <h2>Send Test Event</h2>
            <p className='uk-margin-small-top'>Trigger a sample webhook delivery to verify your integration.</p>
          </div>
          <div className='uk-margin-medium-bottom'>
            <label className='uk-form-label'>Event</label>
            <SingleSelect
              key={selectedEvent || 'webhook-test-event'}
              items={eventOptions}
              showTextbox={false}
              width='100%'
              defaultValue={selectedEvent}
              onSelectChange={this.handleEventChange}
            />
          </div>
          <div className='uk-margin-medium-bottom'>
            <label htmlFor='webhook-payload'>Custom Payload (JSON)</label>
            <textarea
              id='webhook-payload'
              className='md-input'
              rows='5'
              value={payload}
              onChange={this.handleInputChange}
              placeholder='Optional JSON payload override'
            />
          </div>
          <div className='uk-modal-footer uk-text-right'>
            <Button text='Cancel' flat waves extraClass='uk-modal-close' />
            <Button text='Send Test' flat waves style='primary' type='submit' />
          </div>
        </form>
      </BaseModal>
    )
  }
}

TestWebhookModal.propTypes = {
  webhookId: PropTypes.string.isRequired,
  webhook: PropTypes.object,
  testWebhook: PropTypes.func.isRequired
}

TestWebhookModal.defaultProps = {
  webhook: null
}

const mapStateToProps = (state, ownProps) => {
  if (!ownProps.webhookId) return { webhook: null }
  return { webhook: state.webhooksState.byId.get(ownProps.webhookId) || null }
}

export default connect(mapStateToProps, { testWebhook })(TestWebhookModal)
