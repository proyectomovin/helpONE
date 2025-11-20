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
import Avatar from 'components/Avatar/Avatar'

import helpers from 'lib/helpers'

class TimeEntryPartial extends React.Component {
  render () {
    const { timeEntry, dateFormat, onEditClick, onRemoveClick, ticketStatus } = this.props
    const dateFormatted = helpers.formatDate(timeEntry.date, dateFormat)

    return (
      <div className='ticket-time-entry' style={{ marginBottom: 15, padding: 15, backgroundColor: '#f9f9f9', borderRadius: 5 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <Avatar image={timeEntry.owner.image} userId={timeEntry.owner._id} />
          <div style={{ flex: 1, marginLeft: 15 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                  {timeEntry.owner.fullname}
                </h4>
                <a className='comment-email-link' href={`mailto:${timeEntry.owner.email}`} style={{ fontSize: 12 }}>
                  &lt;{timeEntry.owner.email}&gt;
                </a>
                <div style={{ marginTop: 5, fontSize: 12, color: '#666' }}>
                  <time dateTime={dateFormatted} title={dateFormatted} data-uk-tooltip='{delay: 200}'>
                    {helpers.calendarDate(timeEntry.date)}
                  </time>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  padding: '5px 15px',
                  borderRadius: 20,
                  fontSize: 14,
                  fontWeight: 600
                }}>
                  {timeEntry.hours}h
                </div>
                {ticketStatus && ticketStatus.isResolved === false && (
                  <div style={{ display: 'flex', gap: 5 }}>
                    {helpers.hasPermOverRole(timeEntry.owner.role, null, 'tickets:timetracking:create', true) && (
                      <div className='edit-comment' onClick={onEditClick} style={{ cursor: 'pointer' }}>
                        <i className='material-icons'>&#xE254;</i>
                      </div>
                    )}
                    {helpers.hasPermOverRole(timeEntry.owner.role, null, 'tickets:timetracking:create', true) && (
                      <div className='remove-comment' onClick={onRemoveClick} style={{ cursor: 'pointer' }}>
                        <i className='material-icons'>&#xE5CD;</i>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.5 }}>
              {timeEntry.description}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

TimeEntryPartial.propTypes = {
  timeEntry: PropTypes.object.isRequired,
  dateFormat: PropTypes.string.isRequired,
  ticketStatus: PropTypes.object,
  onEditClick: PropTypes.func.isRequired,
  onRemoveClick: PropTypes.func.isRequired
}

export default TimeEntryPartial
