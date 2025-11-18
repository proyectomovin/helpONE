import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { fetchGroups } from 'actions/groups'
import { fetchAccounts } from 'actions/accounts'
import { generateReport } from 'actions/reports'

import Grid from 'components/Grid'
import GridItem from 'components/Grid/GridItem'
import TruCard from 'components/TruCard'
import Button from 'components/Button'
import DatePicker from 'components/DatePicker'
import SingleSelect from 'components/SingleSelect'

import moment from 'moment-timezone'
import helpers from 'lib/helpers'

const ReportTimeTracking = () => {
  const groupsState = useSelector(state => state.groupsState)
  const accountsState = useSelector(state => state.accountsState)
  const dispatch = useDispatch()

  const [groups, setGroups] = useState([])
  const [agents, setAgents] = useState([])

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedGroups, setSelectedGroups] = useState([])
  const [selectedAgents, setSelectedAgents] = useState([])
  const [reportType, setReportType] = useState('summary')

  const reportTypes = [
    { text: 'Summary Report', value: 'summary' },
    { text: 'Detailed Report', value: 'detailed' },
    { text: 'Agent Performance', value: 'agent_performance' },
    { text: 'Time Variance Analysis', value: 'variance' }
  ]

  useEffect(() => {
    helpers.UI.inputs()
    helpers.formvalidator()

    dispatch(fetchGroups())
    dispatch(fetchAccounts({ type: 'agents' }))

    setStartDate(
      moment()
        .utc(true)
        .subtract(30, 'days')
        .format(helpers.getShortDateFormat())
    )

    setEndDate(
      moment()
        .utc(true)
        .format(helpers.getShortDateFormat())
    )
  }, [])

  useEffect(() => {
    helpers.UI.reRenderInputs()
  }, [startDate, endDate])

  useEffect(() => {
    const g = groupsState.groups.map(group => ({ text: group.get('name'), value: group.get('_id') })).toArray()
    setGroups(g)
  }, [groupsState])

  useEffect(() => {
    if (accountsState.accounts) {
      const a = accountsState.accounts
        .filter(account => account.get('role').get('isAgent'))
        .map(account => ({ 
          text: `${account.get('fullname')} (${account.get('username')})`, 
          value: account.get('_id') 
        }))
        .toArray()
      setAgents(a)
    }
  }, [accountsState])

  const onFormSubmit = e => {
    e.preventDefault()
    
    const reportTypeText = reportTypes.find(rt => rt.value === reportType)?.text || 'Time Tracking'
    
    dispatch(
      generateReport({
        type: 'time_tracking',
        subtype: reportType,
        filename: `report_time_tracking_${reportType}_${moment(startDate).format('MMDDYYYY')}`,
        startDate,
        endDate,
        groups: selectedGroups,
        agents: selectedAgents
      })
    )
  }

  return (
    <div>
      <TruCard
        hover={false}
        header={
          <div style={{ padding: '10px 15px' }}>
            <h4 style={{ width: '100%', textAlign: 'left', fontSize: '14px', margin: 0 }}>Time Tracking Reports</h4>
          </div>
        }
        extraContentClass={'nopadding'}
        content={
          <div>
            <p className='padding-15 nomargin uk-text-muted'>
              Generate comprehensive time tracking reports including agent performance, time variance analysis, and detailed time logs.
            </p>
            <hr className='uk-margin-large-bottom' style={{ marginTop: 0 }} />
            <div className={'padding-15'}>
              <form onSubmit={e => onFormSubmit(e)}>
                <Grid>
                  <GridItem width={'1-2'}>
                    <label htmlFor='filterDate_Start' className={'uk-form-label nopadding nomargin'}>
                      Start Date
                    </label>
                    <DatePicker
                      name={'filterDate_start'}
                      format={helpers.getShortDateFormat()}
                      onChange={e => {
                        setStartDate(e.target.value)
                      }}
                      value={startDate}
                    />
                  </GridItem>
                  <GridItem width={'1-2'}>
                    <label htmlFor='filterDate_End' className={'uk-form-label nopadding nomargin'}>
                      End Date
                    </label>
                    <DatePicker
                      name={'filterDate_End'}
                      format={helpers.getShortDateFormat()}
                      onChange={e => {
                        setEndDate(e.target.value)
                      }}
                      value={endDate}
                    />
                  </GridItem>
                  <GridItem width={'1-1'}>
                    <div className='uk-margin-medium-top'>
                      <label htmlFor='reportType' className={'uk-form-label'}>
                        Report Type
                      </label>
                      <SingleSelect
                        items={reportTypes}
                        value={reportType}
                        onSelectChange={(e, value) => {
                          setReportType(value)
                        }}
                      />
                    </div>
                  </GridItem>
                  <GridItem width={'1-2'}>
                    <div className='uk-margin-medium-top'>
                      <label htmlFor='groups' className={'uk-form-label'}>
                        Groups (Optional)
                      </label>
                      <SingleSelect
                        multiple={true}
                        items={groups}
                        value={selectedGroups}
                        onSelectChange={(e, value) => {
                          setSelectedGroups(value)
                        }}
                      />
                    </div>
                  </GridItem>
                  <GridItem width={'1-2'}>
                    <div className='uk-margin-medium-top'>
                      <label htmlFor='agents' className={'uk-form-label'}>
                        Agents (Optional)
                      </label>
                      <SingleSelect
                        multiple={true}
                        items={agents}
                        value={selectedAgents}
                        onSelectChange={(e, value) => {
                          setSelectedAgents(value)
                        }}
                      />
                    </div>
                  </GridItem>
                  <GridItem width={'1-1'}>
                    <div className='uk-margin-medium-top'>
                      <Button text={'Generate Report'} type={'submit'} style={'primary'} waves={true} small={true} />
                    </div>
                  </GridItem>
                </Grid>
              </form>
            </div>
          </div>
        }
      />
    </div>
  )
}

export default ReportTimeTracking