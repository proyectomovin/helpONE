import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import BaseModal from 'containers/Modals/BaseModal'
import Button from 'components/Button'

import { deleteWebhook } from 'actions/webhooks'
import { t } from 'helpers/i18n'

class DeleteWebhookModal extends React.Component {
  handleSubmit = e => {
    e.preventDefault()
    this.props.deleteWebhook({ _id: this.props.webhookId })
  }

  render () {
    const { webhook } = this.props
    const name = webhook ? webhook.get('name') || webhook.get('url') : t('settingsWebhooks.thisWebhook')
    return (
      <BaseModal>
        <form onSubmit={this.handleSubmit}>
          <div className='uk-margin-medium-bottom'>
            <h2>{t('settingsWebhooks.deleteWebhook')}</h2>
            <p className='uk-margin-small-top'>
              {t('settingsWebhooks.deleteConfirm')} <strong>{name}</strong>? {t('settingsWebhooks.deleteWarning')}
            </p>
          </div>
          <div className='uk-modal-footer uk-text-right'>
            <Button text={t('actions.cancel')} flat waves extraClass='uk-modal-close' />
            <Button text={t('actions.delete')} flat waves style='danger' type='submit' />
          </div>
        </form>
      </BaseModal>
    )
  }
}

DeleteWebhookModal.propTypes = {
  webhookId: PropTypes.string.isRequired,
  webhook: PropTypes.object,
  deleteWebhook: PropTypes.func.isRequired
}

DeleteWebhookModal.defaultProps = {
  webhook: null
}

const mapStateToProps = (state, ownProps) => {
  if (!ownProps.webhookId) return { webhook: null }
  return { webhook: state.webhooksState.byId.get(ownProps.webhookId) || null }
}

export default connect(mapStateToProps, { deleteWebhook })(DeleteWebhookModal)
