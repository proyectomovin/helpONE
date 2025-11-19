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
      estimatedHours: props.ticket.get('estimatedHours') || 0,
      editingEstimatedHours: false,
      showAddForm: false
    }
  }

  componentDidUpdate (prevProps) {
    if (prevProps.ticket.get('estimatedHours') !== this.props.ticket.get('estimatedHours')) {
      this.setState({ estimatedHours: this.props.ticket.get('estimatedHours') || 0 })
    }
  }

  handleAddTimeEntry = e => {
    e.preventDefault()
    const { hours, description } = this.state

    if (!hours || !description) {
      helpers.UI.showSnackbar('Please fill in all fields', true)
      return
    }

    if (parseFloat(hours) <= 0) {
      helpers.UI.showSnackbar('Hours must be greater than 0', true)
      return
    }

    this.props.onAddTimeEntry(parseFloat(hours), description)
    this.setState({ hours: '', description: '', showAddForm: false })
  }

  handleUpdateEstimatedHours = () => {
    const { estimatedHours } = this.state
    if (parseFloat(estimatedHours) < 0) {
      helpers.UI.showSnackbar('Estimated hours cannot be negative', true)
      return
    }

    this.props.onUpdateEstimatedHours(parseFloat(estimatedHours))
    this.setState({ editingEstimatedHours: false })
  }

  calculateTotalHours = () => {
    const timeEntries = this.props.ticket.get('timeEntries')
    if (!timeEntries || timeEntries.size === 0) return 0

    return timeEntries.reduce((total, entry) => {
      if (!entry.get('deleted')) {
        return total + (entry.get('hours') || 0)
      }
      return total
    }, 0)
  }

  render () {
    const { ticket, dateFormat, onEditTimeEntry, onRemoveTimeEntry } = this.props
    const { hours, description, estimatedHours, editingEstimatedHours, showAddForm } = this.state
    const timeEntries = ticket.get('timeEntries')
    const totalHours = this.calculateTotalHours()
    const ticketStatus = ticket.get('status')
    const isResolved = ticketStatus ? ticketStatus.get('isResolved') : false

    return (
      <div className='time-tracking-section' style={{ marginTop: 20 }}>
        <div style={{ backgroundColor: '#fff', padding: 20, borderRadius: 5, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, marginBottom: 20, fontSize: 18, fontWeight: 600 }}>
            Time Tracking
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
              <div style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>Estimated Hours</div>
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
                    Save
                  </button>
                  <button
                    onClick={() => this.setState({
                      editingEstimatedHours: false,
                      estimatedHours: ticket.get('estimatedHours') || 0
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
                    Cancel
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 24, fontWeight: 600, color: '#2196F3' }}>
                    {estimatedHours}h
                  </div>
                  {!isResolved && (
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
                      Edit
                    </button>
                  )}
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>Hours Consumed</div>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#4CAF50' }}>
                {totalHours.toFixed(2)}h
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>Remaining</div>
              <div style={{
                fontSize: 24,
                fontWeight: 600,
                color: (estimatedHours - totalHours) < 0 ? '#f44336' : '#FF9800'
              }}>
                {(estimatedHours - totalHours).toFixed(2)}h
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>Progress</div>
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
          {!isResolved && !showAddForm && (
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
              + Add Time Entry
            </button>
          )}

          {/* Add Time Entry Form */}
          {showAddForm && !isResolved && (
            <div style={{
              marginBottom: 20,
              padding: 15,
              backgroundColor: '#f9f9f9',
              borderRadius: 5,
              border: '1px solid #e0e0e0'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: 15, fontSize: 16 }}>Add Time Entry</h4>
              <form onSubmit={this.handleAddTimeEntry}>
                <div style={{ marginBottom: 15 }}>
                  <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 500 }}>
                    Hours Worked
                  </label>
                  <input
                    type='number'
                    step='0.25'
                    min='0.25'
                    value={hours}
                    onChange={e => this.setState({ hours: e.target.value })}
                    placeholder='e.g., 2.5'
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
                    Description of Work
                  </label>
                  <textarea
                    value={description}
                    onChange={e => this.setState({ description: e.target.value })}
                    placeholder='Describe what you worked on...'
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
                    Save Time Entry
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
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Time Entries List */}
          <div>
            <h4 style={{ marginBottom: 15, fontSize: 16 }}>Time Entries</h4>
            {timeEntries && timeEntries.size > 0 ? (
              timeEntries
                .filter(entry => !entry.get('deleted'))
                .map((entry, index) => (
                  <TimeEntryPartial
                    key={index}
                    timeEntry={entry.toJS()}
                    dateFormat={dateFormat}
                    ticketStatus={ticketStatus}
                    onEditClick={() => onEditTimeEntry(entry.get('_id'))}
                    onRemoveClick={() => onRemoveTimeEntry(entry.get('_id'))}
                  />
                ))
                .toArray()
            ) : (
              <div style={{ padding: 20, textAlign: 'center', color: '#999', fontSize: 14 }}>
                No time entries yet. Add your first time entry to start tracking!
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
