/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Copyright (c) 2014-2019 Trudesk, Inc. All rights reserved.
 */

import React from 'react'
import PropTypes from 'prop-types'
import TimeEntryPartial from './TimeEntryPartial'
import helpers from 'lib/helpers'

class TimeTrackingPartial extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      hours: '',
      description: '',
      estimatedHours: props.ticket.estimatedHours || 0,
      editingEstimatedHours: false,
      showAddForm: false
    }
  }

  componentDidUpdate (prevProps) {
    if (prevProps.ticket.estimatedHours !== this.props.ticket.estimatedHours) {
      this.setState({ estimatedHours: this.props.ticket.estimatedHours || 0 })
    }
  }

  handleAddTimeEntry = e => {
    e.preventDefault()
    const { hours, description } = this.state

    if (!hours || !description) {
      helpers.UI.showSnackbar('Por favor complete todos los campos', true)
      return
    }

    if (parseFloat(hours) <= 0) {
      helpers.UI.showSnackbar('Las horas deben ser mayor a 0', true)
      return
    }

    this.props.onAddTimeEntry(parseFloat(hours), description)
    this.setState({ hours: '', description: '', showAddForm: false })
  }

  handleUpdateEstimatedHours = () => {
    const { estimatedHours } = this.state
    if (parseFloat(estimatedHours) < 0) {
      helpers.UI.showSnackbar('Las horas estimadas no pueden ser negativas', true)
      return
    }

    this.props.onUpdateEstimatedHours(parseFloat(estimatedHours))
    this.setState({ editingEstimatedHours: false })
  }

  calculateTotalHours = () => {
    const timeEntries = this.props.ticket.timeEntries
    if (!timeEntries || timeEntries.length === 0) return 0

    return timeEntries.reduce((total, entry) => {
      if (!entry.deleted) {
        return total + (entry.hours || 0)
      }
      return total
    }, 0)
  }

  render () {
    const { ticket, dateFormat, onEditTimeEntry, onRemoveTimeEntry } = this.props
    const { hours, description, estimatedHours, editingEstimatedHours, showAddForm } = this.state
    const timeEntries = ticket.timeEntries
    const totalHours = this.calculateTotalHours()
    const ticketStatus = ticket.status
    const isResolved = ticketStatus ? ticketStatus.isResolved : false

    // Check if time tracking is enabled for users
    const timeTrackingEnabled = helpers.getViewDataItem('timeTrackingUsersEnabled') !== false
    const isAdminOrAgent = helpers.canUser('agent:*', true) || helpers.canUser('admin:*', true)
    const canViewTimeTracking = (isAdminOrAgent || timeTrackingEnabled) && helpers.canUser('tickets:timetracking:view', true)
    const canCreateTimeTracking = (isAdminOrAgent || timeTrackingEnabled) && helpers.canUser('tickets:timetracking:create', true)

    // Si el usuario no tiene permisos de time tracking y no hay entradas, no mostrar nada
    if (!canViewTimeTracking && (!timeEntries || timeEntries.length === 0)) {
      return null
    }

    return (
      <div className='time-tracking-section' style={{ marginTop: 20 }}>
        <div style={{ backgroundColor: '#fff', padding: 20, borderRadius: 5, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, marginBottom: 20, fontSize: 18, fontWeight: 600 }}>
            Control de Tiempo
          </h3>

          {/* Summary Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 15,
            marginBottom: 20,
            padding: 15,
            backgroundColor: '#f5f5f5',
            borderRadius: 5
          }}>
            <div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>Horas Estimadas</div>
              {editingEstimatedHours ? (
                <div style={{ display: 'flex', gap: 5 }}>
                  <input
                    type='number'
                    step='0.25'
                    min='0'
                    value={estimatedHours}
                    onChange={e => this.setState({ estimatedHours: e.target.value })}
                    style={{ width: 80, padding: '5px 10px', borderRadius: 3, border: '1px solid #ddd' }}
                  />
                  <button
                    onClick={this.handleUpdateEstimatedHours}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: 3,
                      cursor: 'pointer'
                    }}
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => this.setState({
                      editingEstimatedHours: false,
                      estimatedHours: ticket.estimatedHours || 0
                    })}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#ccc',
                      color: '#333',
                      border: 'none',
                      borderRadius: 3,
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 24, fontWeight: 600, color: '#2196F3' }}>
                    {estimatedHours}h
                  </div>
                  {!isResolved && canManageTimeTracking && (
                    <button
                      onClick={() => this.setState({ editingEstimatedHours: true })}
                      style={{
                        padding: '3px 8px',
                        fontSize: 11,
                        backgroundColor: 'transparent',
                        color: '#666',
                        border: '1px solid #ddd',
                        borderRadius: 3,
                        cursor: 'pointer'
                      }}
                    >
                      Editar
                    </button>
                  )}
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>Horas Consumidas</div>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#4CAF50' }}>
                {totalHours.toFixed(2)}h
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>Restantes</div>
              <div style={{
                fontSize: 24,
                fontWeight: 600,
                color: (estimatedHours - totalHours) < 0 ? '#f44336' : '#FF9800'
              }}>
                {(estimatedHours - totalHours).toFixed(2)}h
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>Progreso</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  flex: 1,
                  height: 10,
                  backgroundColor: '#e0e0e0',
                  borderRadius: 5,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min((totalHours / (estimatedHours || 1)) * 100, 100)}%`,
                    backgroundColor: totalHours > estimatedHours ? '#f44336' : '#4CAF50',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, minWidth: 45 }}>
                  {estimatedHours > 0 ? Math.round((totalHours / estimatedHours) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Add Time Entry Button */}
          {!isResolved && !showAddForm && canManageTimeTracking && (
            <button
              onClick={() => this.setState({ showAddForm: true })}
              style={{
                marginBottom: 20,
                padding: '10px 20px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: 5,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500
              }}
            >
              + Agregar Registro de Tiempo
            </button>
          )}

          {/* Add Time Entry Form */}
          {showAddForm && !isResolved && canManageTimeTracking && (
            <div style={{
              marginBottom: 20,
              padding: 15,
              backgroundColor: '#f9f9f9',
              borderRadius: 5,
              border: '1px solid #e0e0e0'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: 15, fontSize: 16 }}>Agregar Registro de Tiempo</h4>
              <form onSubmit={this.handleAddTimeEntry}>
                <div style={{ marginBottom: 15 }}>
                  <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 500 }}>
                    Horas Trabajadas
                  </label>
                  <input
                    type='number'
                    step='0.25'
                    min='0.25'
                    value={hours}
                    onChange={e => this.setState({ hours: e.target.value })}
                    placeholder='ej. 2.5'
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 3,
                      border: '1px solid #ddd',
                      fontSize: 14
                    }}
                  />
                </div>
                <div style={{ marginBottom: 15 }}>
                  <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 500 }}>
                    Descripción del Trabajo
                  </label>
                  <textarea
                    value={description}
                    onChange={e => this.setState({ description: e.target.value })}
                    placeholder='Describe en qué trabajaste...'
                    required
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 3,
                      border: '1px solid #ddd',
                      fontSize: 14,
                      resize: 'vertical'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type='submit'
                    style={{
                      padding: '8px 20px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: 3,
                      cursor: 'pointer',
                      fontSize: 14
                    }}
                  >
                    Guardar Registro
                  </button>
                  <button
                    type='button'
                    onClick={() => this.setState({ showAddForm: false, hours: '', description: '' })}
                    style={{
                      padding: '8px 20px',
                      backgroundColor: '#ccc',
                      color: '#333',
                      border: 'none',
                      borderRadius: 3,
                      cursor: 'pointer',
                      fontSize: 14
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Time Entries List */}
          <div>
            <h4 style={{ marginBottom: 15, fontSize: 16 }}>Registros de Tiempo</h4>
            {timeEntries && timeEntries.length > 0 ? (
              timeEntries
                .filter(entry => !entry.deleted)
                .map((entry, index) => (
                  <TimeEntryPartial
                    key={entry._id || index}
                    timeEntry={entry}
                    dateFormat={dateFormat}
                    ticketStatus={ticketStatus}
                    onEditClick={() => onEditTimeEntry(entry._id)}
                    onRemoveClick={() => onRemoveTimeEntry(entry._id)}
                  />
                ))
            ) : (
              <div style={{ padding: 20, textAlign: 'center', color: '#999', fontSize: 14 }}>
                No hay registros de tiempo aún. ¡Agrega tu primer registro para empezar!
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}

TimeTrackingPartial.propTypes = {
  ticket: PropTypes.object.isRequired,
  dateFormat: PropTypes.string.isRequired,
  onAddTimeEntry: PropTypes.func.isRequired,
  onUpdateEstimatedHours: PropTypes.func.isRequired,
  onEditTimeEntry: PropTypes.func.isRequired,
  onRemoveTimeEntry: PropTypes.func.isRequired
}

export default TimeTrackingPartial
