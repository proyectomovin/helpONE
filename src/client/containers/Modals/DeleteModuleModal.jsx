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

class DeleteModuleModal extends React.Component {
  constructor (props) {
    super(props)
  }

  onFormSubmit (e) {
    e.preventDefault()
    const moduleId = this.props.module._id

    axios
      .delete(`/api/v1/modules/${moduleId}`)
      .then(res => {
        helpers.UI.showSnackbar(`Module "${this.props.module.name}" deleted successfully`)
        this.props.hideModal()
        // Reload the page to refresh the modules list
        window.location.reload()
      })
      .catch(err => {
        const errorText = err.response?.data?.error || 'Error deleting module'
        helpers.UI.showSnackbar(`Error: ${errorText}`, true)
      })
  }

  render () {
    const { module } = this.props
    const productName = module.product?.name || null
    return (
      <BaseModal {...this.props} options={{ bgclose: false }}>
        <form className={'uk-form-stacked'} onSubmit={e => this.onFormSubmit(e)}>
          <div className='uk-margin-medium-bottom uk-clearfix'>
            <h2>Delete Module</h2>
            <span>Are you sure you want to delete this module?</span>
          </div>
          <div className='uk-margin-medium-bottom uk-clearfix'>
            <div className='z-box'>
              <h4>{module.name}</h4>
              {productName && (
                <p>
                  <strong>Product:</strong> {productName}
                </p>
              )}
              {module.description && <p>{module.description}</p>}
            </div>
          </div>
          <div className='uk-margin-medium-bottom uk-clearfix'>
            <span className='uk-text-danger'>
              WARNING: This will remove the module reference from all associated tickets and groups.
              <br />
              <strong>This action cannot be undone!</strong>
            </span>
          </div>
          <div className='uk-modal-footer uk-text-right'>
            <Button text={'Cancel'} flat={true} waves={true} extraClass={'uk-modal-close'} />
            <Button text={'Delete'} style={'danger'} flat={true} type={'submit'} />
          </div>
        </form>
      </BaseModal>
    )
  }
}

DeleteModuleModal.propTypes = {
  module: PropTypes.object.isRequired,
  hideModal: PropTypes.func.isRequired
}

export default connect(null, { hideModal })(DeleteModuleModal)
