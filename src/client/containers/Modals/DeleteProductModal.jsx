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
import { hideModal } from 'actions/common'
import BaseModal from './BaseModal'
import Button from 'components/Button'

import axios from 'axios'
import helpers from 'lib/helpers'

class DeleteProductModal extends React.Component {
  constructor (props) {
    super(props)
  }

  onFormSubmit (e) {
    e.preventDefault()
    const productId = this.props.product._id

    axios
      .delete(`/api/v1/products/${productId}`)
      .then(res => {
        helpers.UI.showSnackbar(`Producto "${this.props.product.name}" eliminado exitosamente`)
        this.props.hideModal()
        // Reload the page to refresh the products list
        window.location.reload()
      })
      .catch(err => {
        const errorText = err.response?.data?.error || 'Error al eliminar producto'
        helpers.UI.showSnackbar(`Error: ${errorText}`, true)
      })
  }

  render () {
    const { product } = this.props
    return (
      <BaseModal {...this.props} options={{ bgclose: false }}>
        <form className={'uk-form-stacked'} onSubmit={e => this.onFormSubmit(e)}>
          <div className='uk-margin-medium-bottom uk-clearfix'>
            <h2>Eliminar Producto</h2>
            <span>¿Estás seguro de que deseas eliminar este producto?</span>
          </div>
          <div className='uk-margin-medium-bottom uk-clearfix'>
            <div className='z-box'>
              <h4>{product.name}</h4>
              {product.description && <p>{product.description}</p>}
            </div>
          </div>
          <div className='uk-margin-medium-bottom uk-clearfix'>
            <span className='uk-text-danger'>
              ADVERTENCIA: Esto eliminará la referencia del producto de todos los tickets, grupos y módulos asociados.
              <br />
              <strong>¡Esta acción no se puede deshacer!</strong>
            </span>
          </div>
          <div className='uk-modal-footer uk-text-right'>
            <Button text={'Cancelar'} flat={true} waves={true} extraClass={'uk-modal-close'} />
            <Button text={'Eliminar'} style={'danger'} flat={true} type={'submit'} />
          </div>
        </form>
      </BaseModal>
    )
  }
}

DeleteProductModal.propTypes = {
  product: PropTypes.object.isRequired,
  hideModal: PropTypes.func.isRequired
}

export default connect(null, { hideModal })(DeleteProductModal)
