import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import BaseModal from 'containers/Modals/BaseModal'
import Button from 'components/Button'

import { createAutomationRule, updateAutomationRule } from 'actions/automationRules'
import { fetchRoles } from 'actions/common'
import { fetchTicketStatus } from 'actions/tickets'
import { t } from 'helpers/i18n'
import helpers from 'lib/helpers'

class AutomationRuleFormModal extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      ticketEvent: '',
      userRole: '',
      newTicketStatus: '',
      isActive: true,
      order: 1
    }
  }

  componentDidMount () {
    helpers.UI.inputs()
    helpers.UI.reRenderInputs()
    helpers.formvalidator()

    // Cargar roles y estados si no están cargados
    if (!this.props.roles || (this.props.roles.size !== undefined && this.props.roles.size === 0)) {
      this.props.fetchRoles()
    }
    if (!this.props.statuses || (this.props.statuses.size !== undefined && this.props.statuses.size === 0)) {
      this.props.fetchTicketStatus()
    }

    this.hydrateFromRule(this.props.rule)
  }

  componentDidUpdate (prevProps) {
    if (prevProps.rule !== this.props.rule) {
      this.hydrateFromRule(this.props.rule)
    }
    helpers.UI.reRenderInputs()
  }

  hydrateFromRule (rule) {
    if (!rule) {
      this.setState({
        ticketEvent: '',
        userRole: '',
        newTicketStatus: '',
        isActive: true,
        order: 1
      })
      return
    }

    const data = rule.toJS ? rule.toJS() : rule
    this.setState({
      ticketEvent: data.ticketEvent || '',
      userRole: data.userRole?._id || '',
      newTicketStatus: data.newTicketStatus?._id || '',
      isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
      order: data.order || 1
    })
  }

  handleInputChange = e => {
    const { name, value } = e.target
    this.setState({ [name]: value })
  }

  handleCheckboxChange = e => {
    const { name, checked } = e.target
    this.setState({ [name]: checked })
  }

  handleSubmit = e => {
    e.preventDefault()

    const { ticketEvent, userRole, newTicketStatus, isActive, order } = this.state
    const { mode, rule } = this.props

    const payload = {
      ticketEvent,
      userRole,
      newTicketStatus,
      isActive,
      order: parseInt(order, 10) || 1
    }

    if (mode === 'edit' && rule) {
      const ruleData = rule.toJS ? rule.toJS() : rule
      payload._id = ruleData._id
      this.props.updateAutomationRule(payload)
    } else {
      this.props.createAutomationRule(payload)
    }
  }

  getEventOptions () {
    return [
      { value: 'ticket_created', label: 'Ticket creado' },
      { value: 'ticket_updated', label: 'Ticket actualizado' },
      { value: 'ticket_new_comment', label: 'Nuevo comentario' },
      { value: 'ticket_assigned', label: 'Ticket asignado' },
      { value: 'ticket_status_changed', label: 'Estado cambiado' },
      { value: 'ticket_closed', label: 'Ticket cerrado' },
      { value: 'ticket_reopened', label: 'Ticket reabierto' },
      { value: 'ticket_note_added', label: 'Nota añadida' }
    ]
  }

  render () {
    const { mode } = this.props
    const { ticketEvent, userRole, newTicketStatus, isActive, order } = this.state

    const roles = this.props.roles ? this.props.roles.toArray() : []
    const statuses = this.props.statuses ? this.props.statuses.toArray() : []

    return (
      <BaseModal
        options={{
          bgclose: false,
          keyboard: false
        }}
      >
        <div className='uk-margin-medium-bottom'>
          <h2>{mode === 'edit' ? 'Editar Regla' : 'Crear Regla de Automatización'}</h2>
        </div>
        <form onSubmit={this.handleSubmit}>
          <div className='uk-margin-medium-bottom'>
            <label>Evento del Ticket *</label>
            <select
              name='ticketEvent'
              className='uk-select'
              value={ticketEvent}
              onChange={this.handleInputChange}
              required
            >
              <option value=''>Seleccione un evento...</option>
              {this.getEventOptions().map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className='uk-margin-medium-bottom'>
            <label>Rol de Usuario (actor) *</label>
            <select
              name='userRole'
              className='uk-select'
              value={userRole}
              onChange={this.handleInputChange}
              required
            >
              <option value=''>Seleccione un rol...</option>
              {roles.map(role => {
                const roleData = role.toJS ? role.toJS() : role
                return (
                  <option key={roleData._id} value={roleData._id}>
                    {roleData.name}
                  </option>
                )
              })}
            </select>
          </div>

          <div className='uk-margin-medium-bottom'>
            <label>Nuevo Estado del Ticket *</label>
            <select
              name='newTicketStatus'
              className='uk-select'
              value={newTicketStatus}
              onChange={this.handleInputChange}
              required
            >
              <option value=''>Seleccione un estado...</option>
              {statuses.map(status => {
                const statusData = status.toJS ? status.toJS() : status
                return (
                  <option key={statusData._id} value={statusData._id}>
                    {statusData.name}
                  </option>
                )
              })}
            </select>
          </div>

          <div className='uk-margin-medium-bottom'>
            <label>Orden (prioridad)</label>
            <input
              type='number'
              name='order'
              className='md-input'
              value={order}
              onChange={this.handleInputChange}
              min='1'
            />
            <small className='uk-text-muted'>Las reglas con menor orden se evalúan primero</small>
          </div>

          <div className='uk-margin-medium-bottom'>
            <label>
              <input
                type='checkbox'
                name='isActive'
                checked={isActive}
                onChange={this.handleCheckboxChange}
              />
              <span className='uk-margin-small-left'>Regla activa</span>
            </label>
          </div>

          <div className='uk-modal-footer uk-text-right'>
            <Button
              text={t('actions.cancel')}
              extraClass='uk-modal-close uk-margin-small-right'
              flat={true}
            />
            <Button
              text={mode === 'edit' ? t('actions.save') : 'Crear'}
              type='submit'
              style='success'
              flat={true}
            />
          </div>
        </form>
      </BaseModal>
    )
  }
}

AutomationRuleFormModal.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
  rule: PropTypes.object,
  createAutomationRule: PropTypes.func.isRequired,
  updateAutomationRule: PropTypes.func.isRequired,
  fetchRoles: PropTypes.func.isRequired,
  fetchTicketStatus: PropTypes.func.isRequired,
  roles: PropTypes.object,
  statuses: PropTypes.object
}

const mapStateToProps = (state, ownProps) => {
  const { ruleId } = ownProps
  return {
    roles: state.shared.roles,
    statuses: state.ticketsState.ticketStatuses,
    rule: ruleId ? state.automationRulesState.byId.get(ruleId) : null
  }
}

export default connect(mapStateToProps, {
  createAutomationRule,
  updateAutomationRule,
  fetchRoles,
  fetchTicketStatus
})(AutomationRuleFormModal)
