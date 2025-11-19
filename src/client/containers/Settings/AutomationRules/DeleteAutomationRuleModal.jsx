import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import BaseModal from 'containers/Modals/BaseModal'
import Button from 'components/Button'

import { deleteAutomationRule } from 'actions/automationRules'
import { t } from 'helpers/i18n'

class DeleteAutomationRuleModal extends React.Component {
  handleDelete = () => {
    const { ruleId } = this.props
    if (ruleId) {
      this.props.deleteAutomationRule({ _id: ruleId })
    }
  }

  render () {
    const { rule } = this.props

    if (!rule) {
      return null
    }

    const ruleData = rule.toJS ? rule.toJS() : rule
    const userRole = ruleData.userRole || {}
    const newStatus = ruleData.newTicketStatus || {}

    return (
      <BaseModal
        options={{
          bgclose: false,
          keyboard: false
        }}
      >
        <div className='uk-margin-medium-bottom'>
          <h2>Eliminar Regla de Automatización</h2>
        </div>

        <div className='uk-margin-medium-bottom'>
          <p>¿Está seguro que desea eliminar esta regla?</p>
          <div className='uk-panel uk-panel-box uk-margin-top'>
            <p>
              <strong>Evento:</strong> {ruleData.ticketEvent}
            </p>
            <p>
              <strong>Rol:</strong> {userRole.name || '—'}
            </p>
            <p>
              <strong>Nuevo Estado:</strong> {newStatus.name || '—'}
            </p>
          </div>
        </div>

        <div className='uk-modal-footer uk-text-right'>
          <Button
            text={t('actions.cancel')}
            extraClass='uk-modal-close uk-margin-small-right'
            flat={true}
          />
          <Button
            text={t('actions.delete')}
            style='danger'
            flat={true}
            onClick={this.handleDelete}
            extraClass='uk-modal-close'
          />
        </div>
      </BaseModal>
    )
  }
}

DeleteAutomationRuleModal.propTypes = {
  ruleId: PropTypes.string,
  rule: PropTypes.object,
  deleteAutomationRule: PropTypes.func.isRequired
}

const mapStateToProps = (state, ownProps) => {
  const { ruleId } = ownProps
  return {
    rule: ruleId ? state.automationRulesState.byId.get(ruleId) : null
  }
}

export default connect(mapStateToProps, { deleteAutomationRule })(DeleteAutomationRuleModal)
