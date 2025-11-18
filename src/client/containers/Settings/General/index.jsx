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
 *  Updated:    1/20/19 4:46 PM
 *  Copyright (c) 2014-2019. All rights reserved.
 */

import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import moment from 'moment-timezone'
import { updateSetting } from 'actions/settings'
import { useTranslation } from '../../i18n'

import SettingItem from 'components/Settings/SettingItem'

import InputWithSave from 'components/Settings/InputWithSave'
import SingleSelect from 'components/SingleSelect'
import SettingSubItem from 'components/Settings/SettingSubItem'
import Zone from 'components/ZoneBox/zone'
import ZoneBox from 'components/ZoneBox'

const GeneralSettings = ({ active, settings, viewdata, updateSetting }) => {
  const { t } = useTranslation()

  const getSettingsValue = useCallback(
    name => {
      const value = settings.getIn(['settings', name, 'value'])
      return value || ''
    },
    [settings]
  )

  const timezones = useMemo(() => {
    return moment.tz
      .names()
      .map(name => {
        const year = new Date().getUTCFullYear()
        const timezoneAtBeginningOfyear = moment.tz(year + '-01-01', name)
        return {
          utc: timezoneAtBeginningOfyear.utcOffset(),
          text: '(GMT' + timezoneAtBeginningOfyear.format('Z') + ') ' + name,
          value: name
        }
      })
      .sort((a, b) => a.utc - b.utc)
  }, [])

  const handleTimezoneChange = useCallback(
    e => {
      if (e.target.value) {
        updateSetting({ stateName: 'timezone', name: 'gen:timezone', value: e.target.value })
      }
    },
    [updateSetting]
  )

  const siteTitleMarkup = useMemo(() => {
    return { __html: t('settings.general.siteTitle.subtitle', { defaultTitle: 'Trudesk' }) }
  }, [t])

  const hostUrl = viewdata ? viewdata.get('hosturl') : ''
  const siteUrlMarkup = useMemo(() => {
    return { __html: t('settings.general.siteUrl.subtitle', { example: hostUrl || '' }) }
  }, [hostUrl, t])

  const SiteTitle = (
    <InputWithSave
      stateName='siteTitle'
      settingName='gen:sitetitle'
      initialValue={getSettingsValue('siteTitle')}
    />
  )

  const SiteUrl = (
    <InputWithSave stateName='siteUrl' settingName='gen:siteurl' initialValue={getSettingsValue('siteUrl')} />
  )

  const Timezone = (
    <SingleSelect
      stateName='timezone'
      settingName='gen:timezone'
      items={timezones}
      defaultValue={getSettingsValue('timezone')}
      onSelectChange={handleTimezoneChange}
      showTextbox={true}
    />
  )

  return (
    <div className={active ? 'active' : 'hide'}>
      <SettingItem
        title={t('settings.general.siteTitle.title')}
        subtitle={<div dangerouslySetInnerHTML={siteTitleMarkup} />}
        component={SiteTitle}
      />
      <SettingItem
        title={t('settings.general.siteUrl.title')}
        subtitle={<div dangerouslySetInnerHTML={siteUrlMarkup} />}
        component={SiteUrl}
      />
      <SettingItem
        title={t('settings.general.serverTimezone.title')}
        subtitle={t('settings.general.serverTimezone.subtitle')}
        tooltip={t('settings.general.serverTimezone.tooltip')}
        component={Timezone}
      />
      <SettingItem
        title={t('settings.general.timeDate.title')}
        subtitle={
          <a href='https://momentjs.com/docs/#/displaying/format/' rel='noopener noreferrer' target='_blank'>
            {t('settings.general.timeDate.linkLabel')}
          </a>
        }
      >
        <Zone>
          <ZoneBox>
            <SettingSubItem
              title={t('settings.general.timeDate.timeFormat.title')}
              subtitle={t('settings.general.timeDate.timeFormat.subtitle')}
              component={
                <InputWithSave
                  stateName='timeFormat'
                  settingName='gen:timeFormat'
                  initialValue={getSettingsValue('timeFormat')}
                  width={'60%'}
                />
              }
            />
          </ZoneBox>
          <ZoneBox>
            <SettingSubItem
              title={t('settings.general.timeDate.shortDateFormat.title')}
              subtitle={t('settings.general.timeDate.shortDateFormat.subtitle')}
              component={
                <InputWithSave
                  stateName='shortDateFormat'
                  settingName='gen:shortDateFormat'
                  initialValue={getSettingsValue('shortDateFormat')}
                  width={'60%'}
                />
              }
            />
          </ZoneBox>
          <ZoneBox>
            <SettingSubItem
              title={t('settings.general.timeDate.longDateFormat.title')}
              subtitle={t('settings.general.timeDate.longDateFormat.subtitle')}
              component={
                <InputWithSave
                  stateName='longDateFormat'
                  settingName='gen:longDateFormat'
                  initialValue={getSettingsValue('longDateFormat')}
                  width={'60%'}
                />
              }
            />
          </ZoneBox>
        </Zone>
      </SettingItem>
    </div>
  )
}

GeneralSettings.propTypes = {
  active: PropTypes.bool,
  updateSetting: PropTypes.func.isRequired,
  viewdata: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  viewdata: state.common.viewdata,
  settings: state.settings.settings
})

export default connect(mapStateToProps, { updateSetting })(GeneralSettings)
