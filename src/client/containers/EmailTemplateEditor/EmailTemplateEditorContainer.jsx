/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Author:     Claude Code
 *  Updated:    11/29/25
 *  Copyright (c) 2014-2025. All rights reserved.
 */

import React from 'react'
import PropTypes from 'prop-types'
import EmailTemplateEditor from './index'

class EmailTemplateEditorContainer extends React.Component {
  render () {
    const templateName = this.props.templateName

    if (!templateName) {
      return (
        <div className='page-content full-height' style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h3 className='uk-text-danger'>Error: No template specified</h3>
        </div>
      )
    }

    return (
      <div className='page-content no-border-top full-height'>
        <EmailTemplateEditor templateName={templateName} />
      </div>
    )
  }
}

EmailTemplateEditorContainer.propTypes = {
  templateName: PropTypes.string
}

export default EmailTemplateEditorContainer
