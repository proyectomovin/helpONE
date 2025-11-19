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
import { makeObservable, observable } from 'mobx'
import { hideModal } from 'actions/common'
import BaseModal from './BaseModal'
import Button from 'components/Button'
import EnableSwitch from 'components/Settings/EnableSwitch'
import SingleSelect from 'components/SingleSelect'

import $ from 'jquery'
import axios from 'axios'
import helpers from 'lib/helpers'

@observer
class CreateModuleModal extends React.Component {
  @observable name = ''
  @observable description = ''
  @observable enabled = true
  @observable product = ''
  @observable products = []

  constructor (props) {
    super(props)
    makeObservable(this)
  }

  componentDidMount () {
    helpers.UI.inputs()
    helpers.formvalidator()
    this.loadProducts()
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

  onCreateModuleSubmit (e) {
    e.preventDefault()
    const $form = $(e.target)
    if (!$form.isValid(null, null, false)) return true

    axios
      .post('/api/v1/modules', {
        name: this.name,
        description: this.description,
        enabled: this.enabled,
        product: this.product || null
      })
      .then(res => {
        helpers.UI.showSnackbar(`Módulo "${this.name}" creado exitosamente`)
        this.props.hideModal()
        // Reload the page to refresh the modules list
        window.location.reload()
      })
      .catch(err => {
        const errorText = err.response?.data?.error || 'Error al crear módulo'
        helpers.UI.showSnackbar(`Error: ${errorText}`, true)
      })
  }

  onProductSelectChange (e) {
    this.product = e.target.value
  }

  render () {
    const mappedProducts = [
      { text: 'Ninguno (Módulo Independiente)', value: '' },
      ...this.products.map(p => ({ text: p.name, value: p._id }))
    ]

    return (
      <BaseModal {...this.props}>
        <form className={'uk-form-stacked'} onSubmit={e => this.onCreateModuleSubmit(e)}>
          <div className='uk-margin-medium-bottom uk-clearfix'>
            <h2>Crear Módulo</h2>
          </div>

          <div>
            <div className='uk-clearfix'>
              <div className='z-box uk-grid uk-grid-collapse uk-clearfix'>
                <div className='uk-width-1-1 uk-margin-small-bottom'>
                  <label>Nombre del Módulo</label>
                  <input
                    type='text'
                    className={'md-input'}
                    value={this.name}
                    onChange={e => (this.name = e.target.value)}
                    data-validation='length'
                    data-validation-length='min3'
                    data-validation-error-msg='Nombre inválido (mínimo 3 caracteres)'
                  />
                </div>

                <div className='uk-width-1-1 uk-margin-small-bottom'>
                  <label>Descripción</label>
                  <input
                    type='text'
                    className={'md-input'}
                    value={this.description}
                    onChange={e => (this.description = e.target.value)}
                  />
                </div>

                <div className='uk-width-1-1 uk-margin-small-bottom'>
                  <label>Producto Padre</label>
                  <SingleSelect
                    items={mappedProducts}
                    defaultValue={''}
                    onSelectChange={e => this.onProductSelectChange(e)}
                    width={'100%'}
                    showTextbox={false}
                  />
                </div>

                <div className='uk-width-1-1 uk-margin-small-bottom'>
                  <EnableSwitch
                    stateName={'moduleEnabled'}
                    label={'Habilitado'}
                    checked={this.enabled}
                    onChange={e => (this.enabled = e.target.checked)}
                  />
                </div>
              </div>
              <div className='uk-modal-footer uk-text-right'>
                <Button text={'Cancelar'} type={'button'} extraClass={'uk-modal-close'} flat={true} waves={true} />
                <Button text={'Crear'} type={'submit'} flat={true} waves={true} style={'success'} />
              </div>
            </div>
          </div>
        </form>
      </BaseModal>
    )
  }
}

CreateModuleModal.propTypes = {
  hideModal: PropTypes.func.isRequired
}

export default connect(null, { hideModal })(CreateModuleModal)
