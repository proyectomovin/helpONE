import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import SettingItem from 'components/Settings/SettingItem'
import Button from 'components/Button'

import { fetchAutomationRules, fetchAutomationEvents, deleteAutomationRule, toggleAutomationRule } from 'actions/automationRules'
import { showModal } from 'actions/common'
import { t } from 'helpers/i18n'

import {
  CREATE_AUTOMATION_RULE_MODAL,
  EDIT_AUTOMATION_RULE_MODAL,
  DELETE_AUTOMATION_RULE_MODAL
} from './modalTypes'

class AutomationRulesContainer extends React.Component {
  componentDidMount () {
    if (!this.props.automationRules.loaded) {
      this.props.fetchAutomationRules()
      this.props.fetchAutomationEvents()
    }
  }

  componentDidUpdate (prevProps) {
    if (!prevProps.active && this.props.active && !this.props.automationRules.loaded) {
      this.props.fetchAutomationRules()
      this.props.fetchAutomationEvents()
    }
  }

  handleCreate = () => {
    this.props.showModal(CREATE_AUTOMATION_RULE_MODAL, { mode: 'create' })
  }

  handleEdit = ruleId => {
    this.props.showModal(EDIT_AUTOMATION_RULE_MODAL, { ruleId, mode: 'edit' })
  }

  handleDelete = ruleId => {
    this.props.showModal(DELETE_AUTOMATION_RULE_MODAL, { ruleId })
  }

  handleToggle = (ruleId, currentStatus) => {
    this.props.toggleAutomationRule({ _id: ruleId, isActive: !currentStatus })
  }

  getEventLabel (eventKey) {
    const eventLabels = {
      ticket_created: 'Ticket creado',
      ticket_updated: 'Ticket actualizado',
      ticket_new_comment: 'Nuevo comentario',
      ticket_assigned: 'Ticket asignado',
      ticket_status_changed: 'Estado cambiado',
      ticket_closed: 'Ticket cerrado',
      ticket_reopened: 'Ticket reabierto',
      ticket_note_added: 'Nota añadida'
    }
    return eventLabels[eventKey] || eventKey
  }

  renderRulesList () {
    const { automationRules } = this.props

    if (automationRules.loading && automationRules.allIds.size === 0) {
      return <p className='uk-text-muted'>Cargando reglas...</p>
    }

    const entries = automationRules.allIds
      .toArray()
      .map(id => {
        const data = automationRules.byId.get(id)
        return data ? { id, data: data.toJS ? data.toJS() : data } : null
      })
      .filter(Boolean)
      .sort((a, b) => (a.data.order || 0) - (b.data.order || 0))

    if (!entries.length) {
      return <p className='uk-text-muted'>No hay reglas de automatización configuradas.</p>
    }

    return (
      <div className='uk-overflow-auto'>
        <table className='uk-table uk-table-striped uk-table-small'>
          <thead>
            <tr>
              <th>Orden</th>
              <th>Evento</th>
              <th>Rol de Usuario</th>
              <th>Nuevo Estado</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(({ id, data }) => {
              const userRole = data.userRole || {}
              const newStatus = data.newTicketStatus || {}

              return (
                <tr key={id}>
                  <td>{data.order || 1}</td>
                  <td>{this.getEventLabel(data.ticketEvent)}</td>
                  <td>{userRole.name || '—'}</td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '3px',
                        backgroundColor: newStatus.htmlColor || '#29b955',
                        color: '#fff',
                        fontSize: '11px'
                      }}
                    >
                      {newStatus.name || '—'}
                    </span>
                  </td>
                  <td>
                    <label className='uk-margin-remove'>
                      <input
                        type='checkbox'
                        className='uk-checkbox'
                        checked={data.isActive}
                        onChange={() => this.handleToggle(id, data.isActive)}
                      />
                      <span className='uk-margin-small-left'>{data.isActive ? 'Activa' : 'Inactiva'}</span>
                    </label>
                  </td>
                  <td>
                    <Button
                      text={t('actions.edit')}
                      small
                      waves
                      onClick={() => this.handleEdit(id)}
                      extraClass='uk-margin-small-right'
                    />
                    <Button
                      text={t('actions.delete')}
                      small
                      waves
                      style='danger'
                      onClick={() => this.handleDelete(id)}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  render () {
    const { active } = this.props
    return (
      <div className={active ? 'active' : 'hide'}>
        <SettingItem
          title='Reglas de cambio automático de estado de ticket'
          subtitle='Configura reglas para cambiar automáticamente el estado de un ticket según eventos y roles de usuario'
          component={
            <Button
              text='Crear Regla'
              style='success'
              waves
              onClick={this.handleCreate}
            />
          }
        >
          {this.renderRulesList()}
        </SettingItem>
      </div>
    )
  }
}

AutomationRulesContainer.propTypes = {
  active: PropTypes.bool.isRequired,
  fetchAutomationRules: PropTypes.func.isRequired,
  fetchAutomationEvents: PropTypes.func.isRequired,
  toggleAutomationRule: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
  automationRules: PropTypes.shape({
    byId: PropTypes.object.isRequired,
    allIds: PropTypes.object.isRequired,
    events: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    loaded: PropTypes.bool.isRequired
  }).isRequired
}

const mapStateToProps = state => ({
  automationRules: state.automationRulesState
})

export default connect(mapStateToProps, {
  fetchAutomationRules,
  fetchAutomationEvents,
  toggleAutomationRule,
  showModal
})(AutomationRulesContainer)
