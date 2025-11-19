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
 *  Updated:    11/19/25
 *  Copyright (c) 2014-2025. All rights reserved.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { observer } from 'mobx-react'
import Input from 'components/Input'
import { makeObservable, observable } from 'mobx'
import { showModal, hideModal } from 'actions/common'
import Button from 'components/Button'
import EnableSwitch from 'components/Settings/EnableSwitch'

import axios from 'axios'
import helpers from 'lib/helpers'

@observer
class ProductBody extends React.Component {
  @observable productName = ''
  @observable productDescription = ''
  @observable productEnabled = true

  constructor (props) {
    super(props)
    makeObservable(this)
  }

  componentDidMount () {
    this.productName = this.props.product.name || ''
    this.productDescription = this.props.product.description || ''
    this.productEnabled = this.props.product.enabled !== undefined ? this.props.product.enabled : true
  }

  componentDidUpdate (prevProps) {
    if (prevProps.product !== this.props.product) {
      this.productName = this.props.product.name || ''
      this.productDescription = this.props.product.description || ''
      this.productEnabled = this.props.product.enabled !== undefined ? this.props.product.enabled : true
    }
  }

  onSaveClicked (e) {
    e.preventDefault()
    const id = this.props.product._id
    const name = this.productName
    const description = this.productDescription
    const enabled = this.productEnabled

    axios
      .put(`/api/v1/products/${id}`, { name, description, enabled })
      .then(res => {
        helpers.UI.showSnackbar('Product updated successfully')
        if (this.props.onUpdate) this.props.onUpdate()
      })
      .catch(err => {
        console.error(err)
        const errorText = err.response?.data?.error || 'Error updating product'
        helpers.UI.showSnackbar(`Error: ${errorText}`, true)
      })
  }

  showDeleteProductModal (e) {
    e.preventDefault()
    this.props.showModal('DELETE_PRODUCT', { product: this.props.product })
  }

  render () {
    return (
      <div>
        <form onSubmit={e => this.onSaveClicked(e)}>
          <div className={'product-general-wrapper'}>
            <h2 className='text-light'>General</h2>
            <hr style={{ margin: '5px 0 25px 0' }} />
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'inline-block', cursor: 'pointer' }}>Product Name</label>
              <Input defaultValue={this.productName} onChange={v => (this.productName = v)} />
            </div>
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'inline-block', cursor: 'pointer' }}>Description</label>
              <Input defaultValue={this.productDescription} onChange={v => (this.productDescription = v)} />
            </div>
          </div>
          <h2 className='text-light mt-25'>Properties</h2>
          <hr style={{ margin: '5px 0 25px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            <h4 className={'uk-width-1-2'} style={{ flexGrow: 1 }}>
              Enabled
            </h4>
            <EnableSwitch
              stateName={`productEnabled_${this.props.product._id}`}
              label={'Yes'}
              checked={this.productEnabled}
              onChange={e => (this.productEnabled = e.target.checked)}
            />
          </div>
          <div className={'uk-margin-large-top'} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button text={'Save Product'} style={'success'} onClick={e => this.onSaveClicked(e)} />
          </div>
        </form>
        <div className={'uk-margin-large-top'} style={{ display: 'block', height: 15 }} />
        <div className={'uk-margin-large-top'}>
          <h2 className='text-light'>Danger Zone</h2>
          <div className='danger-zone'>
            <div className='dz-box uk-clearfix'>
              <div className='uk-float-left'>
                <h5>Delete this product</h5>
                <p>Once you delete a product, there is no going back. Please be certain.</p>
              </div>
              <div className='uk-float-right' style={{ paddingTop: '10px' }}>
                <Button text={'Delete'} small={true} style={'danger'} onClick={e => this.showDeleteProductModal(e)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

ProductBody.propTypes = {
  product: PropTypes.object.isRequired,
  onUpdate: PropTypes.func,
  showModal: PropTypes.func.isRequired,
  hideModal: PropTypes.func.isRequired
}

export default connect(null, { showModal, hideModal })(ProductBody)
