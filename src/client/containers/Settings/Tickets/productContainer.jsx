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
import { showModal, hideModal } from 'actions/common'
import SplitSettingsPanel from 'components/Settings/SplitSettingsPanel'
import Button from 'components/Button'
import ProductBody from './productBody'
import axios from 'axios'
import helpers from 'lib/helpers'

@observer
class ProductContainer extends React.Component {
  @observable products = []
  @observable loading = true

  constructor (props) {
    super(props)
    makeObservable(this)
  }

  componentDidMount () {
    this.loadProducts()
  }

  loadProducts () {
    this.loading = true
    axios
      .get('/api/v1/products')
      .then(res => {
        if (res.data.success && res.data.products) {
          this.products = res.data.products
        }
        this.loading = false
      })
      .catch(err => {
        console.error('Error loading products:', err)
        helpers.UI.showSnackbar('Error loading products', true)
        this.loading = false
      })
  }

  onCreateProductClicked (e) {
    e.preventDefault()
    this.props.showModal('CREATE_PRODUCT')
  }

  render () {
    if (this.loading) {
      return (
        <div>
          <h2 className='text-light'>Products</h2>
          <p>Loading...</p>
        </div>
      )
    }

    return (
      <div>
        <SplitSettingsPanel
          title={'Products'}
          subtitle={'Manage products that can be associated with tickets and groups'}
          rightComponent={
            <Button
              text={'Create'}
              style={'success'}
              flat={true}
              waves={true}
              onClick={e => this.onCreateProductClicked(e)}
            />
          }
          menuItems={this.products.map(product => {
            return {
              key: product._id,
              title: product.name,
              content: (
                <div>
                  <h3 style={{ display: 'inline-block' }}>{product.name}</h3>
                  {!product.enabled && (
                    <span
                      style={{
                        display: 'inline-block',
                        marginLeft: 10,
                        padding: '2px 8px',
                        background: '#e53935',
                        color: 'white',
                        borderRadius: 3,
                        fontSize: '11px'
                      }}
                    >
                      DISABLED
                    </span>
                  )}
                </div>
              ),
              bodyComponent: <ProductBody product={product} onUpdate={() => this.loadProducts()} />
            }
          })}
        />
      </div>
    )
  }
}

ProductContainer.propTypes = {
  showModal: PropTypes.func.isRequired,
  hideModal: PropTypes.func.isRequired
}

export default connect(null, { showModal, hideModal })(ProductContainer)
