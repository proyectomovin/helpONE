/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Author:     Chris Brame
 *  Updated:    1/20/2019 4:46 PM
 *  Copyright (c) 2014-2019. All rights reserved.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { fetchDashboardTimeTracking } from 'actions/dashboard'
import helpers from 'lib/helpers'

class TimeTrackingStatsWidget extends React.Component {
  componentDidMount() {
    this.props.fetchDashboardTimeTracking()
  }

  formatHours = (hours) => {
    if (!hours || hours === 0) return '0h'
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }

  render() {
    const { timeTrackingStats, loading } = this.props

    if (loading) {
      return (
        <div className='uk-width-1-3@l uk-width-1-2@m uk-width-1-1@s'>
          <div className='dash-card'>
            <div className='dash-card-header'>
              <h4>Time Tracking</h4>
            </div>
            <div className='dash-card-body'>
              <div className='uk-text-center'>
                <i className='fa fa-spinner fa-spin fa-2x'></i>
              </div>
            </div>
          </div>
        </div>
      )
    }

    const totalHours = timeTrackingStats.get('totalHours', 0)
    const totalTickets = timeTrackingStats.get('totalTickets', 0)
    const averageHours = timeTrackingStats.get('averageHours', 0)
    const topAgents = timeTrackingStats.get('topAgents', [])
    const recentEntries = timeTrackingStats.get('recentEntries', [])

    return (
      <div className='uk-width-1-3@l uk-width-1-2@m uk-width-1-1@s'>
        <div className='dash-card'>
          <div className='dash-card-header'>
            <h4>
              <i className='fa fa-clock-o'></i> Time Tracking
            </h4>
          </div>
          <div className='dash-card-body'>
            {/* Summary Stats */}
            <div className='uk-grid uk-grid-small uk-margin-bottom'>
              <div className='uk-width-1-3'>
                <div className='uk-text-center'>
                  <div className='dash-stat-number'>{this.formatHours(totalHours)}</div>
                  <div className='dash-stat-label'>Total Hours</div>
                </div>
              </div>
              <div className='uk-width-1-3'>
                <div className='uk-text-center'>
                  <div className='dash-stat-number'>{totalTickets}</div>
                  <div className='dash-stat-label'>Tickets</div>
                </div>
              </div>
              <div className='uk-width-1-3'>
                <div className='uk-text-center'>
                  <div className='dash-stat-number'>{this.formatHours(averageHours)}</div>
                  <div className='dash-stat-label'>Avg/Ticket</div>
                </div>
              </div>
            </div>

            {/* Top Agents */}
            {topAgents && topAgents.size > 0 && (
              <div className='uk-margin-bottom'>
                <h5 className='uk-margin-small-bottom'>Top Agents</h5>
                <div className='uk-list uk-list-divider uk-margin-remove'>
                  {topAgents.slice(0, 3).map((agent, index) => (
                    <div key={index} className='uk-flex uk-flex-between uk-flex-middle'>
                      <div className='uk-flex uk-flex-middle'>
                        <img
                          src={`/uploads/users/${agent.get('image') || 'defaultProfile.jpg'}`}
                          alt={agent.get('fullname')}
                          className='uk-border-circle'
                          style={{ width: '24px', height: '24px', marginRight: '8px' }}
                        />
                        <span className='uk-text-small'>{agent.get('fullname')}</span>
                      </div>
                      <span className='uk-text-small uk-text-muted'>
                        {this.formatHours(agent.get('totalHours', 0))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Entries */}
            {recentEntries && recentEntries.size > 0 && (
              <div>
                <h5 className='uk-margin-small-bottom'>Recent Entries</h5>
                <div className='uk-list uk-list-divider uk-margin-remove'>
                  {recentEntries.slice(0, 3).map((entry, index) => (
                    <div key={index} className='uk-text-small'>
                      <div className='uk-flex uk-flex-between uk-flex-middle'>
                        <div>
                          <span className='uk-text-bold'>#{entry.get('ticketUid')}</span>
                          <span className='uk-text-muted uk-margin-small-left'>
                            {entry.get('description') && entry.get('description').length > 30
                              ? `${entry.get('description').substring(0, 30)}...`
                              : entry.get('description')}
                          </span>
                        </div>
                        <span className='uk-text-muted'>
                          {this.formatHours(entry.get('actualHours', 0))}
                        </span>
                      </div>
                      <div className='uk-text-meta uk-margin-small-top'>
                        {entry.get('agentName')} • {helpers.formatDate(entry.get('workDate'), 'MM/DD')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {(!topAgents || topAgents.size === 0) && (!recentEntries || recentEntries.size === 0) && (
              <div className='uk-text-center uk-text-muted'>
                <i className='fa fa-clock-o fa-2x uk-margin-bottom'></i>
                <div>No time tracking data available</div>
                <div className='uk-text-small'>Start tracking time on tickets to see statistics</div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}

TimeTrackingStatsWidget.propTypes = {
  timeTrackingStats: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  fetchDashboardTimeTracking: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  timeTrackingStats: state.dashboardState.timeTrackingStats,
  loading: state.dashboardState.loadingTimeTracking
})

export default connect(mapStateToProps, { fetchDashboardTimeTracking })(TimeTrackingStatsWidget)