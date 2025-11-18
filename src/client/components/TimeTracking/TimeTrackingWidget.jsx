/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Updated:    11/18/24 12:00 PM
 *  Copyright (c) 2014-2024 helpONE. All rights reserved.
 */

import React, { Fragment, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import moment from 'moment'
import helpers from 'lib/helpers'

const TimeTrackingWidget = ({ ticket, sessionUser, onTimeUpdate }) => {
  const [timeEntries, setTimeEntries] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    estimatedHours: ticket?.estimatedHours || 0,
    actualHours: 0,
    description: '',
    category: 'development',
    billable: true,
    workDate: moment().format('YYYY-MM-DD')
  })

  useEffect(() => {
    if (ticket?._id) {
      fetchTimeEntries()
    }
  }, [ticket?._id])

  const fetchTimeEntries = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`/api/v2/timetracking/ticket/${ticket._id}`)
      setTimeEntries(response.data.timeEntries || [])
    } catch (error) {
      console.error('Error fetching time entries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.actualHours || !formData.description.trim()) {
      return
    }

    try {
      setIsLoading(true)
      
      // Create time entry
      const timeEntryData = {
        ticket: ticket._id,
        agent: sessionUser._id,
        actualHours: parseFloat(formData.actualHours),
        description: formData.description.trim(),
        category: formData.category,
        billable: formData.billable,
        workDate: formData.workDate
      }

      await axios.post('/api/v2/timetracking', timeEntryData)

      // Update estimated hours if changed
      if (parseFloat(formData.estimatedHours) !== (ticket.estimatedHours || 0)) {
        await axios.put(`/api/v2/tickets/${ticket._id}`, {
          estimatedHours: parseFloat(formData.estimatedHours)
        })
        
        if (onTimeUpdate) {
          onTimeUpdate()
        }
      }

      // Reset form
      setFormData({
        ...formData,
        actualHours: 0,
        description: '',
        workDate: moment().format('YYYY-MM-DD')
      })
      setShowAddForm(false)
      
      // Refresh entries
      await fetchTimeEntries()
    } catch (error) {
      console.error('Error saving time entry:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const totalTimeSpent = timeEntries.reduce((sum, entry) => sum + entry.actualHours, 0)
  const estimatedHours = ticket?.estimatedHours || 0
  const timeVariance = totalTimeSpent - estimatedHours
  const isOverBudget = timeVariance > 0

  if (!helpers.canUser('tickets:timetracking', true)) {
    return null
  }

  return (
    <div className='uk-width-1-1 padding-left-right-15'>
      <div className='tru-card ticket-details pr-0 pb-0'>
        <div className='uk-flex uk-flex-between uk-flex-middle'>
          <span>Time Tracking</span>
          {helpers.canUser('tickets:timetracking:create', true) && (
            <button
              className='uk-button uk-button-small uk-button-primary'
              onClick={() => setShowAddForm(!showAddForm)}
              disabled={isLoading}
            >
              {showAddForm ? 'Cancel' : 'Add Time'}
            </button>
          )}
        </div>
        <hr style={{ padding: 0, margin: '10px 0' }} />

        {/* Time Summary */}
        <div className='time-summary' style={{ marginBottom: 15 }}>
          <div className='uk-grid uk-grid-small'>
            <div className='uk-width-1-3'>
              <div className='time-stat'>
                <span className='label'>Estimated:</span>
                <span className='value'>{estimatedHours}h</span>
              </div>
            </div>
            <div className='uk-width-1-3'>
              <div className='time-stat'>
                <span className='label'>Actual:</span>
                <span className='value'>{totalTimeSpent.toFixed(2)}h</span>
              </div>
            </div>
            <div className='uk-width-1-3'>
              <div className='time-stat'>
                <span className='label'>Variance:</span>
                <span className={`value ${isOverBudget ? 'over-budget' : 'under-budget'}`}>
                  {timeVariance > 0 ? '+' : ''}{timeVariance.toFixed(2)}h
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Add Time Form */}
        {showAddForm && (
          <form onSubmit={handleSubmit} className='time-form' style={{ marginBottom: 15, padding: 10, backgroundColor: '#f8f9fa', borderRadius: 4 }}>
            <div className='uk-grid uk-grid-small'>
              <div className='uk-width-1-2'>
                <label>Estimated Hours</label>
                <input
                  type='number'
                  step='0.25'
                  min='0'
                  value={formData.estimatedHours}
                  onChange={(e) => handleInputChange('estimatedHours', e.target.value)}
                  className='uk-input uk-form-small'
                />
              </div>
              <div className='uk-width-1-2'>
                <label>Actual Hours *</label>
                <input
                  type='number'
                  step='0.25'
                  min='0.25'
                  value={formData.actualHours}
                  onChange={(e) => handleInputChange('actualHours', e.target.value)}
                  className='uk-input uk-form-small'
                  required
                />
              </div>
              <div className='uk-width-1-2'>
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className='uk-select uk-form-small'
                >
                  <option value='development'>Development</option>
                  <option value='testing'>Testing</option>
                  <option value='documentation'>Documentation</option>
                  <option value='meeting'>Meeting</option>
                  <option value='research'>Research</option>
                  <option value='support'>Support</option>
                  <option value='other'>Other</option>
                </select>
              </div>
              <div className='uk-width-1-2'>
                <label>Work Date</label>
                <input
                  type='date'
                  value={formData.workDate}
                  onChange={(e) => handleInputChange('workDate', e.target.value)}
                  className='uk-input uk-form-small'
                />
              </div>
              <div className='uk-width-1-1'>
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className='uk-textarea uk-form-small'
                  rows='2'
                  placeholder='Describe the work performed...'
                  required
                />
              </div>
              <div className='uk-width-1-2'>
                <label>
                  <input
                    type='checkbox'
                    checked={formData.billable}
                    onChange={(e) => handleInputChange('billable', e.target.checked)}
                    className='uk-checkbox'
                  />
                  Billable
                </label>
              </div>
              <div className='uk-width-1-2 uk-text-right'>
                <button
                  type='submit'
                  className='uk-button uk-button-primary uk-button-small'
                  disabled={isLoading || !formData.actualHours || !formData.description.trim()}
                >
                  {isLoading ? 'Saving...' : 'Save Time'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Time Entries List */}
        <div className='time-entries scrollable' style={{ maxHeight: 200 }}>
          {isLoading && timeEntries.length === 0 ? (
            <div className='uk-text-center' style={{ padding: 20 }}>
              <div className='uk-spinner'></div>
            </div>
          ) : timeEntries.length === 0 ? (
            <div className='uk-text-center uk-text-muted' style={{ padding: 20 }}>
              No time entries recorded yet
            </div>
          ) : (
            timeEntries.map(entry => (
              <div key={entry._id} className='time-entry' style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <div className='uk-flex uk-flex-between uk-flex-middle'>
                  <div className='uk-flex-1'>
                    <div className='uk-text-small uk-text-bold'>
                      {entry.actualHours}h - {entry.category}
                      {entry.billable && <span className='uk-badge uk-badge-success uk-margin-small-left'>Billable</span>}
                    </div>
                    <div className='uk-text-small uk-text-muted'>
                      {entry.description}
                    </div>
                    <div className='uk-text-small uk-text-muted'>
                      {entry.agent?.fullname} - {moment(entry.workDate).format('MMM DD, YYYY')}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .time-stat {
          text-align: center;
          padding: 5px;
        }
        .time-stat .label {
          display: block;
          font-size: 11px;
          color: #666;
          text-transform: uppercase;
        }
        .time-stat .value {
          display: block;
          font-size: 14px;
          font-weight: bold;
          margin-top: 2px;
        }
        .time-stat .value.over-budget {
          color: #f0506e;
        }
        .time-stat .value.under-budget {
          color: #32d296;
        }
        .time-form label {
          display: block;
          font-size: 11px;
          color: #666;
          margin-bottom: 3px;
          text-transform: uppercase;
        }
        .time-entry:last-child {
          border-bottom: none !important;
        }
      `}</style>
    </div>
  )
}

TimeTrackingWidget.propTypes = {
  ticket: PropTypes.object,
  sessionUser: PropTypes.object.isRequired,
  onTimeUpdate: PropTypes.func
}

export default TimeTrackingWidget