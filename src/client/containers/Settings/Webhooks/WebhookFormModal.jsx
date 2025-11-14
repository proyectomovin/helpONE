import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import BaseModal from 'containers/Modals/BaseModal'
import Button from 'components/Button'
import MultiSelect from 'components/MultiSelect'

import { createWebhook, updateWebhook } from 'actions/webhooks'

import helpers from 'lib/helpers'
import { DEFAULT_WEBHOOK_EVENTS } from './constants'

class WebhookFormModal extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      targetUrl: '',
      secret: '',
      events: []
    }
  }

  componentDidMount () {
    helpers.UI.inputs()
    helpers.UI.reRenderInputs()
    helpers.formvalidator()
    this.hydrateFromWebhook(this.props.webhook)
  }

  componentDidUpdate (prevProps) {
    if (prevProps.webhook !== this.props.webhook) {
      this.hydrateFromWebhook(this.props.webhook)
    }
    helpers.UI.reRenderInputs()
  }

  hydrateFromWebhook (webhook) {
    if (!webhook) {
      this.setState({
        name: '',
        targetUrl: '',
        secret: '',
        events: []
      })
      return
    }

    const data = webhook.toJS ? webhook.toJS() : webhook
    this.setState({
      name: data.name || '',
      targetUrl: data.targetUrl || data.url || '',
      secret: data.secret || '',
      events: Array.isArray(data.events) ? data.events : []
    })
  }

  handleInputChange = e => {
    const { name, value } = e.target
    this.setState({ [name]: value })
  }

  handleEventsChange = () => {
    if (this.eventsSelect) {
      this.setState({ events: this.eventsSelect.getSelected() || [] })
    }
  }

  handleSubmit = e => {
    e.preventDefault()

    const { name, targetUrl, secret, events } = this.state
    if (!events || events.length === 0) {
      helpers.UI.showSnackbar('Please select at least one event.', true)
      return
    }

    const payload = {
      name: name ? name.trim() : '',
      targetUrl: targetUrl ? targetUrl.trim() : '',
      secret: secret ? secret.trim() : undefined,
      events
    }

    if (!payload.name) {
      helpers.UI.showSnackbar('Webhook name is required.', true)
      return
    }

    if (!payload.targetUrl) {
      helpers.UI.showSnackbar('Webhook URL is required.', true)
      return
    }

    if (this.props.mode === 'edit' && this.props.webhook) {
      payload._id = this.props.webhook.get ? this.props.webhook.get('_id') : this.props.webhook._id
      this.props.updateWebhook(payload)
    } else {
      this.props.createWebhook(payload)
    }
  }

  render () {
    const { mode, eventOptions } = this.props
    const { name, targetUrl, secret, events } = this.state
    const isEdit = mode === 'edit'

    return (
      <BaseModal>
        <div className='mb-25'>
          <h2>{isEdit ? 'Edit Webhook' : 'Create Webhook'}</h2>
        </div>
        <form className='uk-form-stacked' onSubmit={this.handleSubmit}>
          <div className='uk-margin-medium-bottom'>
            <label htmlFor='webhook-name'>Name</label>
            <input
              id='webhook-name'
              name='name'
              type='text'
              className='md-input'
              value={name}
              onChange={this.handleInputChange}
              data-validation='length'
              data-validation-length='min2'
              data-validation-error-msg='Please provide a valid name.'
            />
          </div>
          <div className='uk-margin-medium-bottom'>
            <label htmlFor='webhook-url'>URL</label>
            <input
              id='webhook-url'
              name='targetUrl'
              type='text'
              className='md-input'
              value={targetUrl}
              onChange={this.handleInputChange}
              data-validation='url'
              data-validation-error-msg='Please provide a valid URL.'
            />
          </div>
          <div className='uk-margin-medium-bottom'>
            <label htmlFor='webhook-secret'>Secret (optional)</label>
            <input
              id='webhook-secret'
              name='secret'
              type='text'
              className='md-input'
              value={secret}
              onChange={this.handleInputChange}
              placeholder='Shared secret used to sign webhook payloads'
            />
          </div>
          <div className='uk-margin-medium-bottom'>
            <label style={{ marginBottom: 5 }}>Events</label>
            <MultiSelect
              ref={ref => (this.eventsSelect = ref)}
              items={eventOptions}
              onChange={this.handleEventsChange}
              initialSelected={events}
            />
          </div>
          <div className='uk-modal-footer uk-text-right'>
            <Button text='Cancel' flat waves extraClass='uk-modal-close' />
            <Button text={isEdit ? 'Save Changes' : 'Create Webhook'} flat waves style='primary' type='submit' />
          </div>
        </form>
      </BaseModal>
    )
  }
}

WebhookFormModal.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
  eventOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired
    })
  ),
  webhook: PropTypes.object,
  createWebhook: PropTypes.func.isRequired,
  updateWebhook: PropTypes.func.isRequired
}

WebhookFormModal.defaultProps = {
  webhook: null,
  eventOptions: DEFAULT_WEBHOOK_EVENTS
}

const mapStateToProps = (state, ownProps) => {
  if (!ownProps.webhookId) {
    return { webhook: null }
  }

  const webhook = state.webhooksState.byId.get(ownProps.webhookId) || null
  return { webhook }
}

export default connect(mapStateToProps, { createWebhook, updateWebhook })(WebhookFormModal)
