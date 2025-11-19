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
import SingleSelect from 'components/SingleSelect'

import axios from 'axios'
import helpers from 'lib/helpers'

@observer
class ModuleBody extends React.Component {
  @observable moduleName = ''
  @observable moduleDescription = ''
  @observable moduleEnabled = true
  @observable moduleProduct = ''
  @observable products = []

  constructor (props) {
    super(props)
    makeObservable(this)
  }

  componentDidMount () {
    this.moduleName = this.props.module.name || ''
    this.moduleDescription = this.props.module.description || ''
    this.moduleEnabled = this.props.module.enabled !== undefined ? this.props.module.enabled : true
    this.moduleProduct = this.props.module.product?._id || this.props.module.product || ''
    this.loadProducts()
  }

  componentDidUpdate (prevProps) {
    if (prevProps.module !== this.props.module) {
      this.moduleName = this.props.module.name || ''
      this.moduleDescription = this.props.module.description || ''
      this.moduleEnabled = this.props.module.enabled !== undefined ? this.props.module.enabled : true
      this.moduleProduct = this.props.module.product?._id || this.props.module.product || ''
    }
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

  onSaveClicked (e) {
    e.preventDefault()
    const id = this.props.module._id
    const name = this.moduleName
    const description = this.moduleDescription
    const enabled = this.moduleEnabled
    const product = this.moduleProduct || null

    axios
      .put(`/api/v1/modules/${id}`, { name, description, enabled, product })
      .then(res => {
        helpers.UI.showSnackbar('Módulo actualizado exitosamente')
        if (this.props.onUpdate) this.props.onUpdate()
      })
      .catch(err => {
        console.error(err)
        const errorText = err.response?.data?.error || 'Error al actualizar módulo'
        helpers.UI.showSnackbar(`Error: ${errorText}`, true)
      })
  }

  showDeleteModuleModal (e) {
    e.preventDefault()
    this.props.showModal('DELETE_MODULE', { module: this.props.module })
  }

  onProductSelectChange (e) {
    this.moduleProduct = e.target.value
  }

  render () {
    const mappedProducts = [
      { text: 'Ninguno (Módulo Independiente)', value: '' },
      ...this.products.map(p => ({ text: p.name, value: p._id }))
    ]

    return (
      <div>
        <form onSubmit={e => this.onSaveClicked(e)}>
          <div className={'module-general-wrapper'}>
            <h2 className='text-light'>General</h2>
            <hr style={{ margin: '5px 0 25px 0' }} />
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'inline-block', cursor: 'pointer' }}>Nombre del Módulo</label>
              <Input defaultValue={this.moduleName} onChange={v => (this.moduleName = v)} />
            </div>
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'inline-block', cursor: 'pointer' }}>Descripción</label>
              <Input defaultValue={this.moduleDescription} onChange={v => (this.moduleDescription = v)} />
            </div>
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'inline-block', cursor: 'pointer' }}>Producto Padre</label>
              <SingleSelect
                items={mappedProducts}
                defaultValue={this.moduleProduct}
                onSelectChange={e => this.onProductSelectChange(e)}
                width={'100%'}
                showTextbox={false}
              />
            </div>
          </div>
          <h2 className='text-light mt-25'>Propiedades</h2>
          <hr style={{ margin: '5px 0 25px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            <h4 className={'uk-width-1-2'} style={{ flexGrow: 1 }}>
              Habilitado
            </h4>
            <EnableSwitch
              stateName={`moduleEnabled_${this.props.module._id}`}
              label={'Sí'}
              checked={this.moduleEnabled}
              onChange={e => (this.moduleEnabled = e.target.checked)}
            />
          </div>
          <div className={'uk-margin-large-top'} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button text={'Guardar Módulo'} style={'success'} onClick={e => this.onSaveClicked(e)} />
          </div>
        </form>
        <div className={'uk-margin-large-top'} style={{ display: 'block', height: 15 }} />
        <div className={'uk-margin-large-top'}>
          <h2 className='text-light'>Zona Peligrosa</h2>
          <div className='danger-zone'>
            <div className='dz-box uk-clearfix'>
              <div className='uk-float-left'>
                <h5>Eliminar este módulo</h5>
                <p>Una vez que elimines un módulo, no hay vuelta atrás. Por favor, asegúrate.</p>
              </div>
              <div className='uk-float-right' style={{ paddingTop: '10px' }}>
                <Button text={'Eliminar'} small={true} style={'danger'} onClick={e => this.showDeleteModuleModal(e)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

ModuleBody.propTypes = {
  module: PropTypes.object.isRequired,
  onUpdate: PropTypes.func,
  showModal: PropTypes.func.isRequired,
  hideModal: PropTypes.func.isRequired
}

export default connect(null, { showModal, hideModal })(ModuleBody)
