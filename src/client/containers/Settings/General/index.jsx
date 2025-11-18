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
import { withTranslation, Trans } from 'react-i18next'
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
      .sort(function (a, b) {
        return a.utc - b.utc
      })
  }

  onTimezoneChange (e) {
    if (e.target.value) this.updateSetting('timezone', 'gen:timezone', e.target.value)
  }

  render () {
    const { active, t, viewdata } = this.props
    const hostUrl = viewdata.get('hosturl')

    const SiteTitle = (
      <InputWithSave
        stateName='siteTitle'
        settingName='gen:sitetitle'
        initialValue={this.getSettingsValue('siteTitle')}
      />
      <SettingItem
        title={t('settings.general.siteUrl.title')}
        subtitle={<div dangerouslySetInnerHTML={siteUrlMarkup} />}
        component={SiteUrl}
      />
    )

    return (
      <div className={active ? 'active' : 'hide'}>
        <SettingItem
          title={t('settings.general.siteTitle.title')}
          subtitle={
            <Trans
              i18nKey='settings.general.siteTitle.subtitle'
              components={{ italic: <i /> }}
              values={{ defaultValue: 'Trudesk' }}
            />
          }
          component={SiteTitle}
        />
        <SettingItem
          title={t('settings.general.siteUrl.title')}
          subtitle={
            <Trans
              i18nKey='settings.general.siteUrl.subtitle'
              components={{ italic: <i /> }}
              values={{ example: hostUrl || '' }}
            />
          }
          component={SiteUrl}
        />
        <SettingItem
          title={t('settings.general.timezone.title')}
          subtitle={t('settings.general.timezone.subtitle')}
          tooltip={t('settings.general.timezone.tooltip')}
          component={Timezone}
        />
        <SettingItem
          title={t('settings.general.timeDateFormat.title')}
          subtitle={
            <a href='https://momentjs.com/docs/#/displaying/format/' rel='noopener noreferrer' target='_blank'>
              {t('settings.general.timeDateFormat.linkText')}
            </a>
          }
        >
          <Zone>
            <ZoneBox>
              <SettingSubItem
                title={t('settings.general.timeFormat.title')}
                subtitle={t('settings.general.timeFormat.subtitle')}
                component={
                  <InputWithSave
                    stateName='timeFormat'
                    settingName='gen:timeFormat'
                    initialValue={this.getSettingsValue('timeFormat')}
                    width={'60%'}
                  />
                }
              />
            </ZoneBox>
            <ZoneBox>
              <SettingSubItem
                title={t('settings.general.shortDateFormat.title')}
                subtitle={t('settings.general.shortDateFormat.subtitle')}
                component={
                  <InputWithSave
                    stateName='shortDateFormat'
                    settingName='gen:shortDateFormat'
                    initialValue={this.getSettingsValue('shortDateFormat')}
                    width={'60%'}
                  />
                }
              />
            </ZoneBox>
            <ZoneBox>
              <SettingSubItem
                title={t('settings.general.longDateFormat.title')}
                subtitle={t('settings.general.longDateFormat.subtitle')}
                component={
                  <InputWithSave
                    stateName='longDateFormat'
                    settingName='gen:longDateFormat'
                    initialValue={this.getSettingsValue('longDateFormat')}
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
}

GeneralSettings.propTypes = {
  active: PropTypes.bool,
  updateSetting: PropTypes.func.isRequired,
  viewdata: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  viewdata: state.common.viewdata,
  settings: state.settings.settings
})

const ConnectedGeneralSettings = connect(mapStateToProps, { updateSetting })(GeneralSettings)

export default withTranslation()(ConnectedGeneralSettings)
