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
 *  Updated:    4/12/19 12:20 AM
 *  Copyright (c) 2014-2019. All rights reserved.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { makeObservable, observable } from 'mobx'
import { observer } from 'mobx-react'

import { fetchAccounts, unloadAccounts } from 'actions/accounts'
import { updateGroup } from 'actions/groups'

import BaseModal from 'containers/Modals/BaseModal'
import MultiSelect from 'components/MultiSelect'
import Button from 'components/Button'

import helpers from 'lib/helpers'
import $ from 'jquery'
import axios from 'axios'
import SpinLoader from 'components/SpinLoader'

@observer
class EditGroupModal extends React.Component {
  @observable name = ''
  @observable rif = ''
  @observable address = ''
  @observable phone = ''
  @observable email = ''
  @observable website = ''
  @observable contactPerson = ''
  @observable products = []
  @observable modules = []

  constructor (props) {
    super(props)
    makeObservable(this)
  }

  componentDidMount () {
    this.props.fetchAccounts({ type: 'customers', limit: -1 })
    this.name = this.props.group.name
    this.rif = this.props.group.rif || ''
    this.address = this.props.group.address || ''
    this.phone = this.props.group.phone || ''
    this.email = this.props.group.email || ''
    this.website = this.props.group.website || ''
    this.contactPerson = this.props.group.contactPerson || ''

    this.loadProducts()
    this.loadModules()

    helpers.UI.inputs()
    helpers.UI.reRenderInputs()
    helpers.formvalidator()
  }

  loadProducts () {
    axios
      .get('/api/v1/products')
      .then(res => {
        if (res.data.success && res.data.products) {
          this.products = res.data.products
        }
      })
      .catch(err => {
        console.error('Error loading products:', err)
      })
  }

  loadModules () {
    axios
      .get('/api/v1/modules')
      .then(res => {
        if (res.data.success && res.data.modules) {
          this.modules = res.data.modules
        }
      })
      .catch(err => {
        console.error('Error loading modules:', err)
      })
  }

  componentDidUpdate () {
    helpers.UI.reRenderInputs()
  }

  componentWillUnmount () {
    this.props.unloadAccounts()
  }

  onFormSubmit (e) {
    e.preventDefault()
    const $form = $(e.target)
    if (!$form.isValid(null, null, false)) return false

    const payload = {
      _id: this.props.group._id,
      name: this.name,
      members: this.membersSelect.getSelected() || [],
      sendMailTo: this.sendMailToSelect.getSelected() || [],
      rif: this.rif,
      address: this.address,
      phone: this.phone,
      email: this.email,
      website: this.website,
      contactPerson: this.contactPerson,
      products: this.productsSelect ? this.productsSelect.getSelected() || [] : [],
      modules: this.modulesSelect ? this.modulesSelect.getSelected() || [] : []
    }

    this.props.updateGroup(payload)
  }

  onInputChange (e) {
    this.name = e.target.value
  }

  render () {
    const mappedAccounts = this.props.accounts
      .map(account => {
        return { text: account.get('fullname'), value: account.get('_id') }
      })
      .toArray()

    const selectedMembers = this.props.group.members.map(member => {
      return member._id
    })
    const selectedSendMailTo = this.props.group.sendMailTo.map(member => {
      return member._id
    })

    const mappedProducts = this.products.map(product => ({
      text: product.name,
      value: product._id
    }))
    const selectedProducts = this.props.group.products
      ? this.props.group.products.map(p => (p._id ? p._id : p))
      : []

    const mappedModules = this.modules.map(module => ({
      text: module.product ? `${module.name} (${module.product.name})` : module.name,
      value: module._id
    }))
    const selectedModules = this.props.group.modules
      ? this.props.group.modules.map(m => (m._id ? m._id : m))
      : []
    return (
      <BaseModal>
        <SpinLoader active={this.props.accountsLoading} />
        <div className={'mb-25'}>
          <h2>Edit Group</h2>
        </div>
        <form className={'uk-form-stacked'} onSubmit={e => this.onFormSubmit(e)}>
          <div className={'uk-margin-medium-bottom'}>
            <label>Group Name</label>
            <input
              type='text'
              className={'md-input'}
              value={this.name}
              onChange={e => this.onInputChange(e)}
              data-validation='length'
              data-validation-length={'min2'}
              data-validation-error-msg={'Please enter a valid Group name. (Must contain 2 characters)'}
            />
          </div>
          <div className={'uk-margin-medium-bottom'}>
            <label style={{ marginBottom: 5 }}>Group Members</label>
            <MultiSelect
              items={mappedAccounts}
              initialSelected={selectedMembers}
              onChange={() => {}}
              ref={r => (this.membersSelect = r)}
            />
          </div>
          <div className={'uk-margin-medium-bottom'}>
            <label style={{ marginBottom: 5 }}>Send Notifications To</label>
            <MultiSelect
              items={mappedAccounts}
              initialSelected={selectedSendMailTo}
              onChange={() => {}}
              ref={r => (this.sendMailToSelect = r)}
            />
          </div>

          <div className={'uk-margin-medium-top'}>
            <h3 style={{ marginBottom: 15 }}>Company Information</h3>
          </div>

          <div className={'uk-margin-medium-bottom'}>
            <label>RIF</label>
            <input
              type='text'
              className={'md-input'}
              value={this.rif}
              onChange={e => (this.rif = e.target.value)}
            />
          </div>

          <div className={'uk-margin-medium-bottom'}>
            <label>Address</label>
            <input
              type='text'
              className={'md-input'}
              value={this.address}
              onChange={e => (this.address = e.target.value)}
            />
          </div>

          <div className={'uk-margin-medium-bottom'}>
            <label>Phone</label>
            <input
              type='text'
              className={'md-input'}
              value={this.phone}
              onChange={e => (this.phone = e.target.value)}
            />
          </div>

          <div className={'uk-margin-medium-bottom'}>
            <label>Email</label>
            <input
              type='email'
              className={'md-input'}
              value={this.email}
              onChange={e => (this.email = e.target.value)}
            />
          </div>

          <div className={'uk-margin-medium-bottom'}>
            <label>Website</label>
            <input
              type='text'
              className={'md-input'}
              value={this.website}
              onChange={e => (this.website = e.target.value)}
            />
          </div>

          <div className={'uk-margin-medium-bottom'}>
            <label>Contact Person</label>
            <input
              type='text'
              className={'md-input'}
              value={this.contactPerson}
              onChange={e => (this.contactPerson = e.target.value)}
            />
          </div>

          <div className={'uk-margin-medium-top'}>
            <h3 style={{ marginBottom: 15 }}>Products & Modules</h3>
          </div>

          <div className={'uk-margin-medium-bottom'}>
            <label style={{ marginBottom: 5 }}>Products</label>
            <MultiSelect
              items={mappedProducts}
              initialSelected={selectedProducts}
              onChange={() => {}}
              ref={r => (this.productsSelect = r)}
            />
          </div>

          <div className={'uk-margin-medium-bottom'}>
            <label style={{ marginBottom: 5 }}>Modules</label>
            <MultiSelect
              items={mappedModules}
              initialSelected={selectedModules}
              onChange={() => {}}
              ref={r => (this.modulesSelect = r)}
            />
          </div>

          <div className='uk-modal-footer uk-text-right'>
            <Button text={'Close'} flat={true} waves={true} extraClass={'uk-modal-close'} />
            <Button text={'Save Group'} flat={true} waves={true} style={'primary'} type={'submit'} />
          </div>
        </form>
      </BaseModal>
    )
  }
}

EditGroupModal.propTypes = {
  group: PropTypes.object.isRequired,
  accounts: PropTypes.object.isRequired,
  updateGroup: PropTypes.func.isRequired,
  fetchAccounts: PropTypes.func.isRequired,
  unloadAccounts: PropTypes.func.isRequired,
  accountsLoading: PropTypes.bool.isRequired
}

const mapStateToProps = state => ({
  accounts: state.accountsState.accounts,
  accountsLoading: state.accountsState.loading
})

export default connect(mapStateToProps, { updateGroup, fetchAccounts, unloadAccounts })(EditGroupModal)
