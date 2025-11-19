import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { observer } from 'mobx-react'
import { observable } from 'mobx'

import { t } from 'helpers/i18n'

import {
  fetchDashboardData,
  fetchDashboardTopGroups,
  fetchDashboardTopTags,
  fetchDashboardOverdueTickets,
  fetchDashboardTopTypes,
  fetchDashboardTopAssignees,
  fetchDashboardTopPriorities,
  fetchDashboardTopOwners,
  fetchDashboardTimeTrackingStats,
  fetchDashboardTimeTrackingByGroup
} from 'actions/dashboard'

import Grid from 'components/Grid'
import GridItem from 'components/Grid/GridItem'
import PageTitle from 'components/PageTitle'
import PageContent from 'components/PageContent'
import TruCard from 'components/TruCard'
import SingleSelect from 'components/SingleSelect'
import CountUp from 'components/CountUp'
import PeityBar from 'components/Peity/peity-bar'
import PeityPie from 'components/Peity/peity-pie'
import PeityLine from 'components/Peity/peity-line'
import MGraph from 'components/MGraph'
import D3Pie from 'components/D3/d3pie'

import moment from 'moment-timezone'
import helpers from 'lib/helpers'

@observer
class DashboardContainer extends React.Component {
  @observable timespan = 30

  constructor (props) {
    super(props)
  }

  componentDidMount () {
    helpers.UI.setupPeity()

    this.props.fetchDashboardData({ timespan: this.timespan })
    this.props.fetchDashboardTopGroups({ timespan: this.timespan })
    this.props.fetchDashboardTopTags({ timespan: this.timespan })
    this.props.fetchDashboardOverdueTickets()
    this.props.fetchDashboardTopTypes({ timespan: this.timespan })
    this.props.fetchDashboardTopAssignees({ timespan: this.timespan })
    this.props.fetchDashboardTopPriorities({ timespan: this.timespan })
    this.props.fetchDashboardTopOwners({ timespan: this.timespan })
    this.props.fetchDashboardTimeTrackingStats({ timespan: this.timespan })
    this.props.fetchDashboardTimeTrackingByGroup({ timespan: this.timespan })
  }

  onTimespanChange = e => {
    e.preventDefault()
    this.timespan = e.target.value
    this.props.fetchDashboardData({ timespan: e.target.value })
    this.props.fetchDashboardTopGroups({ timespan: e.target.value })
    this.props.fetchDashboardTopTags({ timespan: e.target.value })
    this.props.fetchDashboardTopTypes({ timespan: e.target.value })
    this.props.fetchDashboardTopAssignees({ timespan: e.target.value })
    this.props.fetchDashboardTopPriorities({ timespan: e.target.value })
    this.props.fetchDashboardTopOwners({ timespan: e.target.value })
    this.props.fetchDashboardTimeTrackingStats({ timespan: e.target.value })
    this.props.fetchDashboardTimeTrackingByGroup({ timespan: e.target.value })
  }

  render () {
    const formatString = helpers.getLongDateFormat() + ' ' + helpers.getTimeFormat()
    const tz = helpers.getTimezone()
    const lastUpdatedFormatted = this.props.dashboardState.lastUpdated
      ? moment(this.props.dashboardState.lastUpdated, 'MM/DD/YYYY hh:mm:ssa')
          .tz(tz)
          .format(formatString)
      : t('dashboard.cacheLoading')

    const closedPercent = this.props.dashboardState.closedCount
      ? Math.round((this.props.dashboardState.closedCount / this.props.dashboardState.ticketCount) * 100).toString()
      : '0'

    return (
      <div>
        <PageTitle
          title={t('dashboard.title')}
          rightComponent={
            <div>
              <div className={'uk-float-right'} style={{ minWidth: 250 }}>
                <div style={{ marginTop: 8 }}>
                  <SingleSelect
                    items={[
                      { text: t('dashboard.last30Days'), value: '30' },
                      { text: t('dashboard.last60Days'), value: '60' },
                      { text: t('dashboard.last90Days'), value: '90' },
                      { text: t('dashboard.last180Days'), value: '180' },
                      { text: t('dashboard.last365Days'), value: '365' }
                    ]}
                    defaultValue={'30'}
                    onSelectChange={e => this.onTimespanChange(e)}
                  />
                </div>
              </div>
              <div className={'uk-float-right uk-text-muted uk-text-small'} style={{ margin: '23px 25px 0 0' }}>
                <strong>{t('dashboard.lastUpdated')} </strong>
                <span>{lastUpdatedFormatted}</span>
              </div>
            </div>
          }
        />
        <PageContent>
          <Grid>
            <GridItem width={'1-3'}>
              <TruCard
                content={
                  <div>
                    <div className='right uk-margin-top uk-margin-small-right'>
                      <PeityBar values={'5,3,9,6,5,9,7'} />
                    </div>
                    <span className='uk-text-muted uk-text-small'>
                      {t('dashboard.totalTickets')} {this.timespan.toString()}d)
                    </span>

                    <h2 className='uk-margin-remove'>
                      <CountUp startNumber={0} endNumber={this.props.dashboardState.ticketCount || 0} />
                    </h2>
                  </div>
                }
              />
            </GridItem>
            <GridItem width={'1-3'}>
              <TruCard
                content={
                  <div>
                    <div className='right uk-margin-top uk-margin-small-right'>
                      <PeityPie type={'donut'} value={(closedPercent !== 'NaN' ? closedPercent : '0') + '/100'} />
                    </div>
                    <span className='uk-text-muted uk-text-small'>{t('dashboard.ticketsCompleted')}</span>

                    <h2 className='uk-margin-remove'>
                      <span>{closedPercent !== 'NaN' ? closedPercent : '0'}</span>%
                    </h2>
                  </div>
                }
              />
            </GridItem>
            <GridItem width={'1-3'}>
              <TruCard
                content={
                  <div>
                    <div className='right uk-margin-top uk-margin-small-right'>
                      <PeityLine values={'5,3,9,6,5,9,7,3,5,2'} />
                    </div>
                    <span className='uk-text-muted uk-text-small'>{t('dashboard.avgResponseTime')}</span>

                    <h2 className='uk-margin-remove'>
                      <CountUp endNumber={this.props.dashboardState.ticketAvg || 0} extraText={t('dashboard.hours')} />
                    </h2>
                  </div>
                }
              />
            </GridItem>
            <GridItem width={'1-1'} extraClass={'uk-margin-medium-top'}>
              <TruCard
                header={
                  <div className='uk-text-left'>
                    <h6 style={{ padding: 15, margin: 0, fontSize: '14px' }}>{t('dashboard.ticketBreakdown')}</h6>
                  </div>
                }
                fullSize={true}
                hover={false}
                extraContentClass={'nopadding'}
                content={
                  <div className='mGraph mGraph-panel' style={{ minHeight: 200, position: 'relative' }}>
                    <MGraph
                      height={250}
                      x_accessor={'date'}
                      y_accessor={'value'}
                      data={this.props.dashboardState.ticketBreakdownData.toJS() || []}
                    />
                  </div>
                }
              />
            </GridItem>
            <GridItem width={'1-2'} extraClass={'uk-margin-medium-top'}>
              <TruCard
                loaderActive={this.props.dashboardState.loadingTopGroups}
                animateLoader={true}
                style={{ minHeight: 256 }}
                header={
                  <div className='uk-text-left'>
                    <h6 style={{ padding: 15, margin: 0, fontSize: '14px' }}>{t('dashboard.top5Groups')}</h6>
                  </div>
                }
                content={
                  <div>
                    <D3Pie data={this.props.dashboardState.topGroups.toJS()} />
                  </div>
                }
              />
            </GridItem>
            <GridItem width={'1-2'} extraClass={'uk-margin-medium-top'}>
              <TruCard
                loaderActive={this.props.dashboardState.loadingTopTags}
                animateLoader={true}
                animateDelay={800}
                style={{ minHeight: 256 }}
                header={
                  <div className='uk-text-left'>
                    <h6 style={{ padding: 15, margin: 0, fontSize: '14px' }}>{t('dashboard.top10Tags')}</h6>
                  </div>
                }
                content={
                  <div>
                    <D3Pie type={'donut'} data={this.props.dashboardState.topTags.toJS()} />
                  </div>
                }
              />
            </GridItem>
            <GridItem width={'1-2'} extraClass={'uk-margin-medium-top'}>
              <TruCard
                style={{ minHeight: 250 }}
                header={
                  <div className='uk-text-left'>
                    <h6 style={{ padding: 15, margin: 0, fontSize: '14px' }}>{t('dashboard.overdueTickets')}</h6>
                  </div>
                }
                content={
                  <div className='uk-overflow-container'>
                    <table className='uk-table'>
                      <thead>
                        <tr>
                          <th className='uk-text-nowrap'>{t('dashboard.ticket')}</th>
                          <th className='uk-text-nowrap'>{t('dashboard.status')}</th>
                          <th className='uk-text-nowrap'>{t('dashboard.subject')}</th>
                          <th className='uk-text-nowrap uk-text-right'>{t('dashboard.lastUpdatedCol')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.props.dashboardState.overdueTickets.map(ticket => {
                          return (
                            <tr key={ticket.get('_id')} className={'uk-table-middle'}>
                              <td className={'uk-width-1-10 uk-text-nowrap'}>
                                <a href={`/tickets/${ticket.get('uid')}`}>T#{ticket.get('uid')}</a>
                              </td>
                              <td className={'uk-width-1-10 uk-text-nowrap'}>
                                <span className={'uk-badge ticket-status-open uk-width-1-1 ml-0'}>{t('dashboard.open')}</span>
                              </td>
                              <td className={'uk-width-6-10'}>{ticket.get('subject')}</td>
                              <td className={'uk-width-2-10 uk-text-right uk-text-muted uk-text-small'}>
                                {moment
                                  .utc(ticket.get('updated'))
                                  .tz(helpers.getTimezone())
                                  .format(helpers.getShortDateFormat())}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                }
              />
            </GridItem>
            <GridItem width={'1-2'} extraClass={'uk-margin-medium-top'}>
              <TruCard
                header={
                  <div className='uk-text-left'>
                    <h6 style={{ padding: 15, margin: 0, fontSize: '14px' }}>{t('dashboard.quickStats')}</h6>
                  </div>
                }
                content={
                  <div className='uk-overflow-container'>
                    <table className='uk-table'>
                      <thead>
                        <tr>
                          <th className='uk-text-nowrap'>{t('dashboard.stat')}</th>
                          <th className='uk-text-nowrap uk-text-right'>{t('dashboard.value')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className='uk-table-middle'>
                          <td className='uk-width-6-10 uk-text-nowrap uk-text-muted uk-text-small'>
                            {t('dashboard.mostTicketsBy')}
                          </td>
                          <td id='mostRequester' className='uk-width-4-10 uk-text-right  uk-text-small'>
                            {this.props.dashboardState.mostRequester
                              ? `${this.props.dashboardState.mostRequester.get(
                                  'name'
                                )} (${this.props.dashboardState.mostRequester.get('value')})`
                              : '--'}
                          </td>
                        </tr>

                        <tr className='uk-table-middle'>
                          <td className='uk-width-6-10 uk-text-nowrap uk-text-muted uk-text-small'>
                            {t('dashboard.mostCommentsBy')}
                          </td>
                          <td id='mostCommenter' className='uk-width-4-10 uk-text-right  uk-text-small'>
                            {this.props.dashboardState.mostCommenter
                              ? `${this.props.dashboardState.mostCommenter.get(
                                  'name'
                                )} (${this.props.dashboardState.mostCommenter.get('value')})`
                              : '--'}
                          </td>
                        </tr>

                        <tr className='uk-table-middle'>
                          <td className='uk-width-6-10 uk-text-nowrap uk-text-muted uk-text-small'>
                            {t('dashboard.mostAssignedUser')}
                          </td>
                          <td id='mostAssignee' className='uk-width-4-10 uk-text-right  uk-text-small'>
                            {this.props.dashboardState.mostAssignee
                              ? `${this.props.dashboardState.mostAssignee.get(
                                  'name'
                                )} (${this.props.dashboardState.mostAssignee.get('value')})`
                              : '--'}
                          </td>
                        </tr>

                        <tr className='uk-table-middle'>
                          <td className='uk-width-6-10 uk-text-nowrap uk-text-muted uk-text-small'>
                            {t('dashboard.mostActiveTicket')}
                          </td>
                          <td className='uk-width-4-10 uk-text-right  uk-text-small'>
                            <a id='mostActiveTicket' href='#'>
                              {this.props.dashboardState.mostActiveTicket
                                ? `T#${this.props.dashboardState.mostActiveTicket.get('uid')}`
                                : '--'}
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                }
              />
            </GridItem>
            <GridItem width={'1-2'} extraClass={'uk-margin-medium-top'}>
              <TruCard
                loaderActive={this.props.dashboardState.loadingTopTypes}
                animateLoader={true}
                style={{ minHeight: 256 }}
                header={
                  <div className='uk-text-left'>
                    <h6 style={{ padding: 15, margin: 0, fontSize: '14px' }}>Tickets por Tipo</h6>
                  </div>
                }
                content={
                  <div>
                    <D3Pie data={this.props.dashboardState.topTypes.toJS()} />
                loaderActive={this.props.dashboardState.loadingTimeTrackingStats}
                animateLoader={true}
                style={{ minHeight: 250 }}
                header={
                  <div className='uk-text-left'>
                    <h6 style={{ padding: 15, margin: 0, fontSize: '14px' }}>
                      Control de Tiempo (Últimos {this.timespan.toString()}d)
                    </h6>
                  </div>
                }
                content={
                  <div className='uk-overflow-container'>
                    <div className='uk-margin-bottom' style={{ padding: '0 15px' }}>
                      <div className='uk-grid uk-grid-small'>
                        <div className='uk-width-1-3'>
                          <div className='uk-text-center'>
                            <span className='uk-text-muted uk-text-small'>Horas Estimadas</span>
                            <h3 className='uk-margin-remove'>
                              {this.props.dashboardState.timeTrackingStats.get('totalEstimated') || 0}h
                            </h3>
                          </div>
                        </div>
                        <div className='uk-width-1-3'>
                          <div className='uk-text-center'>
                            <span className='uk-text-muted uk-text-small'>Horas Consumidas</span>
                            <h3 className='uk-margin-remove'>
                              {this.props.dashboardState.timeTrackingStats.get('totalConsumed') || 0}h
                            </h3>
                          </div>
                        </div>
                        <div className='uk-width-1-3'>
                          <div className='uk-text-center'>
                            <span className='uk-text-muted uk-text-small'>Progreso</span>
                            <h3 className='uk-margin-remove'>
                              {this.props.dashboardState.timeTrackingStats.get('percentageComplete') || 0}%
                            </h3>
                          </div>
                        </div>
                      </div>
                    </div>
                    <table className='uk-table'>
                      <thead>
                        <tr>
                          <th className='uk-text-nowrap'>Top Consultores</th>
                          <th className='uk-text-nowrap uk-text-right'>Horas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.props.dashboardState.timeTrackingStats.get('topConsultants') &&
                        this.props.dashboardState.timeTrackingStats.get('topConsultants').size > 0 ? (
                          this.props.dashboardState.timeTrackingStats.get('topConsultants').map((consultant, idx) => (
                            <tr key={idx} className='uk-table-middle'>
                              <td className='uk-width-6-10 uk-text-nowrap uk-text-small'>
                                {consultant.get('name')}
                              </td>
                              <td className='uk-width-4-10 uk-text-right uk-text-small'>
                                {Math.round(consultant.get('hours') * 10) / 10}h
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan='2' className='uk-text-center uk-text-muted uk-text-small'>
                              No hay datos de control de tiempo disponibles
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                }
              />
            </GridItem>
            <GridItem width={'1-2'} extraClass={'uk-margin-medium-top'}>
              <TruCard
                loaderActive={this.props.dashboardState.loadingTopAssignees}
                animateLoader={true}
                animateDelay={200}
                style={{ minHeight: 256 }}
                header={
                  <div className='uk-text-left'>
                    <h6 style={{ padding: 15, margin: 0, fontSize: '14px' }}>Tickets por Consultor</h6>
                  </div>
                }
                content={
                  <div>
                    <D3Pie type={'donut'} data={this.props.dashboardState.topAssignees.toJS()} />
                  </div>
                }
              />
            </GridItem>
            <GridItem width={'1-2'} extraClass={'uk-margin-medium-top'}>
              <TruCard
                loaderActive={this.props.dashboardState.loadingTopPriorities}
                animateLoader={true}
                animateDelay={400}
                style={{ minHeight: 256 }}
                header={
                  <div className='uk-text-left'>
                    <h6 style={{ padding: 15, margin: 0, fontSize: '14px' }}>Tickets por Prioridad</h6>
                  </div>
                }
                content={
                  <div>
                    <D3Pie data={this.props.dashboardState.topPriorities.toJS()} />
                  </div>
                }
              />
            </GridItem>
            <GridItem width={'1-2'} extraClass={'uk-margin-medium-top'}>
              <TruCard
                loaderActive={this.props.dashboardState.loadingTopOwners}
                animateLoader={true}
                animateDelay={600}
                style={{ minHeight: 256 }}
                header={
                  <div className='uk-text-left'>
                    <h6 style={{ padding: 15, margin: 0, fontSize: '14px' }}>Tickets por Cliente</h6>
                  </div>
                }
                content={
                  <div>
                    <D3Pie type={'donut'} data={this.props.dashboardState.topOwners.toJS()} />
            <GridItem width={'1-1'} extraClass={'uk-margin-medium-top'}>
              <TruCard
                loaderActive={this.props.dashboardState.loadingTimeTrackingByGroup}
                animateLoader={true}
                style={{ minHeight: 250 }}
                header={
                  <div className='uk-text-left'>
                    <h6 style={{ padding: 15, margin: 0, fontSize: '14px' }}>
                      Control de Tiempo por Empresa (Últimos {this.timespan.toString()}d)
                    </h6>
                  </div>
                }
                content={
                  <div className='uk-overflow-container'>
                    <table className='uk-table'>
                      <thead>
                        <tr>
                          <th className='uk-text-nowrap'>Empresa</th>
                          <th className='uk-text-nowrap uk-text-right'>Tickets</th>
                          <th className='uk-text-nowrap uk-text-right'>Horas Estimadas</th>
                          <th className='uk-text-nowrap uk-text-right'>Horas Consumidas</th>
                          <th className='uk-text-nowrap uk-text-right'>Progreso</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.props.dashboardState.timeTrackingByGroup &&
                        this.props.dashboardState.timeTrackingByGroup.size > 0 ? (
                          this.props.dashboardState.timeTrackingByGroup.map((group, idx) => (
                            <tr key={idx} className='uk-table-middle'>
                              <td className='uk-width-3-10 uk-text-nowrap uk-text-small'>
                                {group.get('groupName')}
                              </td>
                              <td className='uk-width-1-10 uk-text-right uk-text-small'>
                                {group.get('ticketCount')}
                              </td>
                              <td className='uk-width-2-10 uk-text-right uk-text-small'>
                                {group.get('totalEstimated')}h
                              </td>
                              <td className='uk-width-2-10 uk-text-right uk-text-small'>
                                {group.get('totalConsumed')}h
                              </td>
                              <td className='uk-width-2-10 uk-text-right'>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
                                  <div style={{
                                    width: 100,
                                    height: 8,
                                    backgroundColor: '#e0e0e0',
                                    borderRadius: 4,
                                    overflow: 'hidden'
                                  }}>
                                    <div style={{
                                      height: '100%',
                                      width: `${Math.min(group.get('percentageComplete'), 100)}%`,
                                      backgroundColor: group.get('percentageComplete') > 100 ? '#f44336' : '#4CAF50',
                                      transition: 'width 0.3s ease'
                                    }} />
                                  </div>
                                  <span className='uk-text-small uk-text-muted' style={{ minWidth: 45 }}>
                                    {group.get('percentageComplete')}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan='5' className='uk-text-center uk-text-muted uk-text-small'>
                              No hay datos de control de tiempo por empresa disponibles
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                }
              />
            </GridItem>
          </Grid>
        </PageContent>
      </div>
    )
  }
}

DashboardContainer.propTypes = {
  fetchDashboardData: PropTypes.func.isRequired,
  fetchDashboardTopGroups: PropTypes.func.isRequired,
  fetchDashboardTopTags: PropTypes.func.isRequired,
  fetchDashboardOverdueTickets: PropTypes.func.isRequired,
  fetchDashboardTopTypes: PropTypes.func.isRequired,
  fetchDashboardTopAssignees: PropTypes.func.isRequired,
  fetchDashboardTopPriorities: PropTypes.func.isRequired,
  fetchDashboardTopOwners: PropTypes.func.isRequired,
  fetchDashboardTimeTrackingStats: PropTypes.func.isRequired,
  fetchDashboardTimeTrackingByGroup: PropTypes.func.isRequired,
  dashboardState: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  dashboardState: state.dashboardState
})

export default connect(mapStateToProps, {
  fetchDashboardData,
  fetchDashboardTopGroups,
  fetchDashboardTopTags,
  fetchDashboardOverdueTickets,
  fetchDashboardTopTypes,
  fetchDashboardTopAssignees,
  fetchDashboardTopPriorities,
  fetchDashboardTopOwners
  fetchDashboardTimeTrackingStats,
  fetchDashboardTimeTrackingByGroup
})(DashboardContainer)
