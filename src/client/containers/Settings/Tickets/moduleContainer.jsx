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
import ModuleBody from './moduleBody'
import axios from 'axios'
import helpers from 'lib/helpers'

@observer
class ModuleContainer extends React.Component {
  @observable modules = []
  @observable loading = true

  constructor (props) {
    super(props)
    makeObservable(this)
  }

  componentDidMount () {
    this.loadModules()
  }

  loadModules () {
    this.loading = true
    axios
      .get('/api/v1/modules')
      .then(res => {
        if (res.data.success && res.data.modules) {
          this.modules = res.data.modules
        }
        this.loading = false
      })
      .catch(err => {
        console.error('Error loading modules:', err)
        helpers.UI.showSnackbar('Error al cargar módulos', true)
        this.loading = false
      })
  }

  onCreateModuleClicked (e) {
    e.preventDefault()
    this.props.showModal('CREATE_MODULE')
  }

  render () {
    if (this.loading) {
      return (
        <div>
          <h2 className='text-light'>Módulos</h2>
          <p>Cargando...</p>
        </div>
      )
    }

    return (
      <div>
        <SplitSettingsPanel
          title={'Módulos'}
          subtitle={'Administrar módulos que se pueden asociar con tickets, productos y grupos'}
          rightComponent={
            <Button
              text={'Crear'}
              style={'success'}
              flat={true}
              waves={true}
              onClick={e => this.onCreateModuleClicked(e)}
            />
          }
          menuItems={this.modules.map(module => {
            const productName = module.product?.name || null
            return {
              key: module._id,
              title: productName ? `${module.name} (${productName})` : module.name,
              content: (
                <div>
                  <h3 style={{ display: 'inline-block' }}>{module.name}</h3>
                  {productName && (
                    <span
                      style={{
                        display: 'inline-block',
                        marginLeft: 10,
                        padding: '2px 8px',
                        background: '#3f51b5',
                        color: 'white',
                        borderRadius: 3,
                        fontSize: '11px'
                      }}
                    >
                      {productName}
                    </span>
                  )}
                  {!module.enabled && (
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
                      DESHABILITADO
                    </span>
                  )}
                </div>
              ),
              bodyComponent: <ModuleBody module={module} onUpdate={() => this.loadModules()} />
            }
          })}
        />
      </div>
    )
  }
}

ModuleContainer.propTypes = {
  showModal: PropTypes.func.isRequired,
  hideModal: PropTypes.func.isRequired
}

export default connect(null, { showModal, hideModal })(ModuleContainer)
