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
 *  Updated:    3/2/22 10:58 PM
 *  Copyright (c) 2014-2022. All rights reserved.
 */

import React, { createRef } from 'react'
import PropTypes from 'prop-types'
import { t } from 'helpers/i18n'
import PageTitle from 'components/PageTitle'
import PageContent from 'components/PageContent'
import StepWizard from 'components/StepWizard'

class AccountsImportContainer extends React.Component {
  constructor (props) {
    super(props)

    this.csvRef = createRef()
    this.jsonRef = createRef()
    this.ldapRef = createRef()

    this.csvWizardRef = createRef()
    this.jsonWizardRef = createRef()
    this.ldapWizardRef = createRef()
  }

  selectAccountImport = (event, type) => {
    if (!this.csvRef.current || !this.jsonRef.current || !this.ldapRef.current) return
    if (!this.csvWizardRef.current || !this.jsonWizardRef.current || !this.ldapWizardRef.current) return
    if (event.target.classList.contains('card-disabled')) return

    switch (type) {
      case 'csv':
        // this.csvWizardRef.current.classList.remove('uk-hidden')
        this.csvWizardRef.current.show()
        this.jsonRef.current.classList.add('card-disabled')
        this.ldapRef.current.classList.add('card-disabled')
        break
      case 'json':
        this.jsonWizardRef.current.classList.remove('uk-hidden')
        this.csvRef.current.classList.add('card-disabled')
        this.ldapRef.current.classList.add('card-disabled')
        break
      case 'ldap':
        this.ldapWizardRef.current.classList.remove('uk-hidden')
        this.csvRef.current.classList.add('card-disabled')
        this.jsonRef.current.classList.add('card-disabled')
        break
    }
  }

  resetWizards = () => {
    if (!this.csvRef.current || !this.jsonRef.current || !this.ldapRef.current) return
    if (!this.csvWizardRef.current || !this.jsonWizardRef.current || !this.ldapWizardRef.current) return

    this.csvRef.current.classList.remove('card-disabled')
    this.jsonRef.current.classList.remove('card-disabled')
    this.ldapRef.current.classList.remove('card-disabled')

    this.csvWizardRef.current.hide()
    this.jsonWizardRef.current.classList.add('uk-hidden')
    this.ldapWizardRef.current.classList.add('uk-hidden')
  }

  render () {
    return (
      <>
        <PageTitle title={t('accountsImport.title')} />
        <PageContent>
          <div className='uk-grid uk-grid-medium uk-margin-medium-bottom js-wizard-select-wrapper'>
            <div className='uk-width-1-1 uk-margin-small-bottom'>
              <h3>{t('accountsImport.selectImportType')}</h3>
            </div>
            <div className='uk-width-1-3'>
              <div
                id='csv-import-selector'
                ref={this.csvRef}
                className='panel trupanel nopadding md-bg-color-green md-color-white cursor-pointer'
                style={{ minHeight: 85 }}
                onClick={e => this.selectAccountImport(e, 'csv')}
              >
                <div className='tru-card-content'>
                  <div className='right uk-margin-small-top'>
                    <i className='material-icons font-size-40'>description</i>
                  </div>
                  <h2 className='uk-margin-remove'>
                    <span className='md-color-white uk-margin-small-bottom'>{t('accountsImport.csv')}</span>
                    <span className='md-color-white uk-text-small uk-display-block'>
                      {t('accountsImport.csvDescription')}
                    </span>
                  </h2>
                </div>
              </div>
            </div>
            <div className='uk-width-1-3'>
              <div
                id='json-import-selector'
                ref={this.jsonRef}
                className='panel trupanel nopadding md-bg-color-blue-grey md-color-white cursor-pointer'
                style={{ minHeight: 85 }}
                onClick={e => this.selectAccountImport(e, 'json')}
              >
                <div className='tru-card-content'>
                  <div className='right uk-margin-small-top'>
                    <svg style={{ width: 40, height: 40 }} viewBox='0 0 24 24'>
                      <path
                        fill='#ffffff'
                        d='M8,3A2,2 0 0,0 6,5V9A2,2 0 0,1 4,11H3V13H4A2,2 0 0,1 6,15V19A2,2 0 0,0 8,21H10V19H8V14A2,2 0 0,0 6,12A2,2 0 0,0 8,10V5H10V3M16,3A2,2 0 0,1 18,5V9A2,2 0 0,0 20,11H21V13H20A2,2 0 0,0 18,15V19A2,2 0 0,1 16,21H14V19H16V14A2,2 0 0,1 18,12A2,2 0 0,1 16,10V5H14V3H16Z'
                      />
                    </svg>
                  </div>
                  <h2 className='uk-margin-remove'>
                    <span className='md-color-white uk-margin-small-bottom'>{t('accountsImport.json')}</span>
                    <span className='md-color-white uk-text-small uk-display-block'>
                      {t('accountsImport.jsonDescription')}
                    </span>
                  </h2>
                </div>
              </div>
            </div>
            <div className='uk-width-1-3'>
              <div
                id='ldap-import-selector'
                ref={this.ldapRef}
                className='panel trupanel nopadding md-bg-color-blue md-color-white cursor-pointer'
                style={{ minHeight: 85 }}
                onClick={e => this.selectAccountImport(e, 'ldap')}
              >
                <div className='tru-card-content'>
                  <div className='right uk-margin-small-top'>
                    <i className='material-icons font-size-40'>&#xE875;</i>
                  </div>
                  <h2 className='uk-margin-remove'>
                    <span className='md-color-white uk-margin-small-bottom'>{t('accountsImport.ldap')}</span>
                    <span className='md-color-white uk-text-small uk-display-block'>
                      {t('accountsImport.ldapDescription')}
                    </span>
                  </h2>
                </div>
              </div>
            </div>
          </div>

          <StepWizard
            title={t('accountsImport.csvWizardTitle')}
            subtitle={t('accountsImport.csvWizardSubtitle')}
            ref={this.csvWizardRef}
            onCancelClicked={this.resetWizards}
          />
          <div id='json_wizard_card' ref={this.jsonWizardRef} className='uk-grid uk-margin-small-bottom uk-hidden'>
            <div className='uk-width-1-1'>
              <div
                className='panel trupanel nopadding no-hover-shadow'
                style={{ position: 'relative', minHeight: 265 }}
              >
                <div className='left'>
                  <h6 style={{ padding: '10px 0 0 15px', margin: 0, fontSize: 16 }}>{t('accountsImport.jsonWizardTitle')}</h6>
                  <h5
                    style={{ padding: '0 0 10px 15px', margin: '-2px 0 0 0', fontSize: 12 }}
                    className='uk-text-muted'
                  >
                    {t('accountsImport.jsonWizardSubtitle')}
                  </h5>
                </div>
                <div className='right' style={{ margin: 15 }}>
                  <button className='btn md-btn md-btn-warning js-wizard-cancel' onClick={this.resetWizards}>
                    {t('actions.cancel')}
                  </button>
                </div>
                <hr className='nomargin' />
                <form className='uk-form-stacked' id='wizard_json_form'>
                  <div id='wizard_json'>
                    <h3>{t('accountsImport.fileUpload')}</h3>
                    <section>
                      <h2 className='heading-wiz'>
                        {t('accountsImport.fileUpload')}
                        <span className='sub-heading'>{t('accountsImport.fileUploadDescription')}</span>
                      </h2>
                      <hr className='md-hr' />
                      <div id='json-upload-drop' className='uk-file-upload'>
                        <p className='uk-text'>{t('accountsImport.dropFileToUpload')}</p>
                        <p className='uk-text-muted uk-text-small uk-margin-small-bottom'>{t('accountsImport.or')}</p>
                        <a className='uk-form-file md-btn'>
                          {t('accountsImport.chooseFile')}
                          <input type='file' id='json-upload-select' />
                        </a>
                      </div>

                      <div id='json-progressbar' className='uk-progress uk-active uk-progress-success uk-hidden'>
                        <div className='uk-progress-bar' style={{ width: 0 }} />
                      </div>
                    </section>
                    <h3>{t('accountsImport.reviewUploadedData')}</h3>
                    <section>
                      <h2 className='heading-wiz'>
                        {t('accountsImport.reviewUploadedData')}
                        <span className='sub-heading'>{t('accountsImport.reviewUploadedDataDescription')}</span>
                      </h2>

                      <textarea className='review-list' id='json-review-list' disabled />
                    </section>
                    <h3>{t('accountsImport.importAccounts')}</h3>
                    <section>
                      <h2 className='heading-wiz uk-margin-medium-bottom'>
                        {t('accountsImport.importingAccounts')}
                        <span className='sub-heading'>
                          {t('accountsImport.importingAccountsDescription')}
                          <br />
                          <em>{t('accountsImport.doNotNavigateAway')}</em>
                        </span>
                      </h2>
                      <div
                        id='json-import-status-box'
                        style={{ width: '100%', height: 300, border: '1px solid #ccc', overflow: 'auto', padding: 10 }}
                      >
                        <ul />
                      </div>
                      <br />
                      <div
                        className='js-json-progress uk-progress uk-progress-striped uk-active uk-progress-success'
                        style={{
                          marginBottom: 0,
                          boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0,.06)',
                          background: '#f4f4f4'
                        }}
                      >
                        <div className='uk-progress-bar' style={{ width: 0 }} />
                      </div>
                    </section>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div id='ldap_wizard_card' ref={this.ldapWizardRef} className='uk-grid uk-margin-small-bottom uk-hidden'>
            <div className='uk-width-1-1'>
              <div
                className='panel trupanel nopadding no-hover-shadow'
                style={{ position: 'relative', minHeight: 265 }}
              >
                <div className='left'>
                  <h6 style={{ padding: '10px 0 0 15px', margin: 0, fontSize: 16 }}>{t('accountsImport.ldapWizardTitle')}</h6>
                  <h5
                    style={{ padding: '0 0 10px 15px', margin: '-2px 0 0 0', fontSize: 12 }}
                    className='uk-text-muted'
                  >
                    {t('accountsImport.ldapWizardSubtitle')}
                  </h5>
                </div>
                <div className='right' style={{ margin: 15 }}>
                  <button className='btn md-btn md-btn-warning js-wizard-cancel' onClick={this.resetWizards}>
                    {t('actions.cancel')}
                  </button>
                </div>
                <hr className='nomargin' />
                <div className='card-spinner uk-hidden' style={{ opacity: 0.85 }}>
                  <div className='spinner' />
                </div>
                <form action='#' className='uk-form-stacked' id='wizard_ldap_connection_form'>
                  <div id='wizard_ldap'>
                    <h3>{t('accountsImport.connectionInformation')}</h3>
                    <section>
                      <h2 className='heading-wiz'>
                        {t('accountsImport.connectionInformation')}
                        <span className='sub-heading'>
                          {t('accountsImport.connectionInformationDescription')}
                        </span>
                      </h2>
                      <hr className='md-hr' style={{ marginTop: '14px !important' }} />

                      <div className='uk-grid'>
                        <div className='uk-margin-large-bottom uk-width-1-3'>
                          <label htmlFor='ldap-server'>{t('accountsImport.ldapServer')}</label>
                          <input
                            id='ldap-server'
                            type='text'
                            className='md-input'
                            name='ldap-server'
                            required
                            defaultValue={''}
                          />
                        </div>
                        <div className='uk-margin-large-bottom uk-width-1-3'>
                          <label htmlFor='ldap-bind-dn'>{t('accountsImport.bindDN')}</label>
                          <input type='text' className='md-input' name='ldap-bind-dn' required defaultValue={''} />
                        </div>
                        <div className='uk-margin-large-bottom uk-width-1-3'>
                          <label htmlFor='ldap-password'>{t('accountModal.password')}</label>
                          <input type='password' className='md-input' name='ldap-password' required defaultValue={''} />
                        </div>
                        <div className='uk-margin-large-bottom uk-width-1-2'>
                          <label htmlFor='ldap-search-base'>{t('accountsImport.searchBase')}</label>
                          <input type='text' className='md-input' name='ldap-search-base' required defaultValue={''} />
                        </div>
                        <div className='uk-margin-large-bottom uk-width-1-2'>
                          <label htmlFor='ldap-filter'>{t('accountsImport.searchFilter')}</label>
                          <input
                            type='text'
                            className='md-input'
                            name='ldap-filter'
                            required
                            defaultValue='(&(objectClass=user)(objectCategory=person))'
                          />
                        </div>
                      </div>
                    </section>

                    <h3>{t('accountsImport.verifyConnection')}</h3>
                    <section>
                      <h2 className='heading-wiz'>
                        {t('accountsImport.verifyConnection')}
                        <span id='wizard_ldap_verify_text' className='sub-heading'>
                          {t('accountsImport.verifyConnectionDescription')}
                        </span>
                      </h2>

                      <div
                        id='wizard_ldap_verify_spinner'
                        className='card-spinner uk-hidden'
                        style={{ background: 'none !important', minHeight: 400 }}
                      >
                        <div className='spinner' />
                      </div>

                      <div id='wizard_ldap_verify_icon' className='md-large-icon md-color-red uk-text-center uk-hidden'>
                        <i className='material-icons'>&#xE86C;</i>
                      </div>
                    </section>
                    <h3>{t('accountsImport.reviewAccounts')}</h3>
                    <section>
                      <h2 className='heading-wiz' style={{ marginBottom: 15 }}>
                        {t('accountsImport.reviewAccounts')}
                        <span className='sub-heading'>
                          {t('accountsImport.reviewAccountsDescription')}
                        </span>
                      </h2>

                      <textarea className='review-list' id='ldap-review-list' disabled />
                    </section>

                    <h3>{t('accountsImport.importAccounts')}</h3>
                    <section>
                      <h2 className='heading-wiz uk-margin-medium-bottom'>
                        {t('accountsImport.importingAccounts')}
                        <span className='sub-heading'>
                          {t('accountsImport.importingAccountsDescription')}
                          <br />
                          <em>{t('accountsImport.doNotNavigateAway')}</em>
                        </span>
                      </h2>
                      <div
                        id='ldap-import-status-box'
                        style={{ width: '100%', height: 300, border: '1px solid #ccc', overflow: 'auto', padding: 10 }}
                      >
                        <ul />
                      </div>
                      <br />
                      <div
                        className='js-ldap-progress uk-progress uk-progress-striped uk-active uk-progress-success'
                        style={{
                          marginBottom: 0,
                          boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0,.06)',
                          background: '#f4f4f4'
                        }}
                      >
                        <div className='uk-progress-bar' style={{ width: 0 }} />
                      </div>
                    </section>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </PageContent>
      </>
    )
  }
}

AccountsImportContainer.propTypes = {}

export default AccountsImportContainer
