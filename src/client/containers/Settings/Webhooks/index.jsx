import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import SettingItem from 'components/Settings/SettingItem'
import Button from 'components/Button'

import { fetchWebhooks } from 'actions/webhooks'
import { showModal } from 'actions/common'

import { DEFAULT_WEBHOOK_EVENTS } from './constants'
import {
  CREATE_WEBHOOK_MODAL,
  EDIT_WEBHOOK_MODAL,
  TEST_WEBHOOK_MODAL,
  DELETE_WEBHOOK_MODAL
} from './modalTypes'

class WebhooksSettingsContainer extends React.Component {
  componentDidMount () {
    if (!this.props.webhooks.loaded) {
      this.props.fetchWebhooks()
    }
  }

  componentDidUpdate (prevProps) {
    if (!prevProps.active && this.props.active && !this.props.webhooks.loaded) {
      this.props.fetchWebhooks()
    }
  }

  handleCreate = () => {
    this.props.showModal(CREATE_WEBHOOK_MODAL, { eventOptions: DEFAULT_WEBHOOK_EVENTS, mode: 'create' })
  }

  handleEdit = webhookId => {
    this.props.showModal(EDIT_WEBHOOK_MODAL, { webhookId, eventOptions: DEFAULT_WEBHOOK_EVENTS, mode: 'edit' })
  }

  handleDelete = webhookId => {
    this.props.showModal(DELETE_WEBHOOK_MODAL, { webhookId })
  }

  handleTest = webhookId => {
    this.props.showModal(TEST_WEBHOOK_MODAL, { webhookId })
  }

  renderWebhookList () {
    const { webhooks } = this.props

    if (webhooks.loading && webhooks.allIds.size === 0) {
      return <p className='uk-text-muted'>Loading webhooks…</p>
    }

    const entries = webhooks.allIds
      .toArray()
      .map(id => {
        const data = webhooks.byId.get(id)
        return data ? { id, data: data.toJS ? data.toJS() : data } : null
      })
      .filter(Boolean)

    if (!entries.length) {
      return <p className='uk-text-muted'>No webhooks have been configured yet.</p>
    }

    return (
      <ul className='uk-list uk-list-striped'>
        {entries.map(({ id, data }) => {
          const isActive = typeof data.isActive === 'boolean' ? data.isActive : true
          const eventsList = Array.isArray(data.events) && data.events.length ? data.events.join(', ') : '—'
          const method = (data.method || 'POST').toUpperCase()
          const headers = Array.isArray(data.headers)
            ? data.headers
              .filter(header => header && header.key)
              .map(header => `${header.key}: ${header.value || ''}`)
            : []
          const headerSummary = headers.length ? headers.join(', ') : 'None'
          const targetUrl = data.targetUrl || data.url || ''

          return (
            <li key={id} className='uk-clearfix'>
              <div className='uk-float-left' style={{ maxWidth: '70%' }}>
                <h5 style={{ margin: 0 }}>
                  {data.name || targetUrl}
                  {!isActive && (
                    <span className='uk-badge uk-badge-danger' style={{ marginLeft: 8 }}>
                      Inactive
                    </span>
                  )}
                </h5>
                <p style={{ margin: '4px 0 0 0', wordBreak: 'break-all' }} className='uk-text-muted'>
                  {targetUrl}
                </p>
                <p style={{ margin: '4px 0 0 0' }} className='uk-text-small'>
                  Events: {eventsList}
                </p>
                <p style={{ margin: '4px 0 0 0' }} className='uk-text-small'>
                  Method: {method}
                </p>
                <p style={{ margin: '4px 0 0 0' }} className='uk-text-small'>
                  Headers: {headerSummary}
                </p>
                {data.secret && (
                  <p style={{ margin: '4px 0 0 0' }} className='uk-text-small uk-text-muted'>
                    Secret configured
                  </p>
                )}
              </div>
              <div className='uk-float-right'>
                <Button
                  text='Test'
                  small
                  waves
                  style='primary'
                  onClick={() => this.handleTest(id)}
                  extraClass='uk-margin-small-right'
                />
                <Button text='Edit' small waves onClick={() => this.handleEdit(id)} extraClass='uk-margin-small-right' />
                <Button text='Delete' small waves style='danger' onClick={() => this.handleDelete(id)} />
              </div>
            </li>
          )
        })}
      </ul>
    )
  }

  render () {
    const { active } = this.props
    return (
      <div className={active ? 'active' : 'hide'}>
        <SettingItem
          title='Webhooks'
          subtitle='Manage outgoing webhooks that notify external services about events.'
          component={<Button text='Add Webhook' style='primary' waves onClick={this.handleCreate} />}
        >
          {this.renderWebhookList()}
        </SettingItem>
      </div>
    )
  }
}

WebhooksSettingsContainer.propTypes = {
  active: PropTypes.bool.isRequired,
  fetchWebhooks: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
  webhooks: PropTypes.shape({
    byId: PropTypes.object.isRequired,
    allIds: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    loaded: PropTypes.bool.isRequired
  }).isRequired
}

const mapStateToProps = state => ({
  webhooks: state.webhooksState
})

export default connect(mapStateToProps, { fetchWebhooks, showModal })(WebhooksSettingsContainer)
