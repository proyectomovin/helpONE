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
import axios from 'axios'
import Editor from '@monaco-editor/react'
import Log from '../../logger'
import helpers from 'lib/helpers'

class EmailTemplateEditor extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      template: null,
      templateContent: '',
      activeTab: 'editor',
      showPreview: false,
      saving: false,
      error: null
    }
    this.editorRef = React.createRef()
  }

  componentDidMount () {
    this.loadTemplate()
  }

  loadTemplate () {
    const templateName = this.props.templateName
    if (!templateName) {
      this.setState({ error: 'No template name provided', loading: false })
      return
    }

    axios
      .get(`/api/v1/editor/load/${templateName}`)
      .then(res => {
        const templateData = res.data
        // Get the template content (HTML/Handlebars)
        const templateContent = templateData.html || templateData['gjs-html'] || ''

        this.setState({
          template: templateData,
          templateContent: templateContent,
          loading: false
        })
      })
      .catch(err => {
        Log.error('Failed to load template', err)
        this.setState({
          error: 'Failed to load template',
          loading: false
        })
        helpers.UI.showSnackbar('Error loading template', true)
      })
  }

  handleEditorChange (value) {
    this.setState({ templateContent: value })
  }

  handleSave () {
    this.setState({ saving: true })
    const { templateContent } = this.state
    const templateName = this.props.templateName

    const data = {
      template: templateName,
      html: templateContent,
      'gjs-html': templateContent
    }

    axios
      .post('/api/v1/editor/save', data)
      .then(() => {
        helpers.UI.showSnackbar('Template saved successfully')
        this.setState({ saving: false })
      })
      .catch(err => {
        Log.error('Failed to save template', err)
        helpers.UI.showSnackbar('Error saving template', true)
        this.setState({ saving: false })
      })
  }

  handleTabChange (tab) {
    this.setState({ activeTab: tab })
  }

  togglePreview () {
    this.setState({ showPreview: !this.state.showPreview })
  }

  getEditorContent () {
    return this.state.templateContent
  }

  getEditorLanguage () {
    return 'html'
  }

  renderPreview () {
    const { templateContent } = this.state
    return (
      <div className='template-preview' style={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '4px' }}>
          <iframe
            srcDoc={templateContent}
            title='Template Preview'
            style={{ width: '100%', minHeight: '600px', border: 'none' }}
          />
        </div>
      </div>
    )
  }

  renderVariablesPanel () {
    const variables = [
      { category: 'Ticket Variables', items: [
        { name: '{{ticket.uid}}', description: 'Ticket unique ID' },
        { name: '{{ticket.subject}}', description: 'Ticket subject' },
        { name: '{{ticket.issue}}', description: 'Ticket issue/description' },
        { name: '{{ticket.date}}', description: 'Ticket creation date' },
        { name: '{{ticket.group.name}}', description: 'Ticket group name' },
        { name: '{{ticket.type.name}}', description: 'Ticket type' },
        { name: '{{ticket.priority.name}}', description: 'Ticket priority' }
      ]},
      { category: 'User Variables', items: [
        { name: '{{ticket.owner.fullname}}', description: 'Ticket owner full name' },
        { name: '{{ticket.owner.email}}', description: 'Ticket owner email' },
        { name: '{{user.fullname}}', description: 'Current user full name' },
        { name: '{{user.email}}', description: 'Current user email' }
      ]},
      { category: 'Comment Variables', items: [
        { name: '{{comment.comment}}', description: 'Comment text' },
        { name: '{{comment.owner.fullname}}', description: 'Comment author name' }
      ]},
      { category: 'System Variables', items: [
        { name: '{{baseUrl}}', description: 'Application base URL' },
        { name: '{{data.ticket.url}}', description: 'Link to ticket' }
      ]}
    ]

    return (
      <div className='variables-panel' style={{ padding: '20px', backgroundColor: '#fff', overflow: 'auto', height: '100%' }}>
        <h4 style={{ marginTop: 0, marginBottom: '20px' }}>Available Handlebars Variables</h4>
        <p style={{ color: '#666', fontSize: '13px', marginBottom: '20px' }}>
          Use these variables in your template. Handlebars syntax supports loops and conditionals.
        </p>
        {variables.map((section, idx) => (
          <div key={idx} style={{ marginBottom: '25px' }}>
            <h5 style={{ marginBottom: '10px', color: '#1976d2' }}>{section.category}</h5>
            <div style={{ fontSize: '13px' }}>
              {section.items.map((v, vIdx) => (
                <div key={vIdx} style={{ marginBottom: '10px', paddingLeft: '10px' }}>
                  <code style={{
                    backgroundColor: '#f5f5f5',
                    padding: '3px 8px',
                    borderRadius: '3px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: '#c7254e'
                  }}>
                    {v.name}
                  </code>
                  <span style={{ marginLeft: '10px', color: '#666' }}>{v.description}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <hr style={{ margin: '20px 0' }} />
        <h5 style={{ marginBottom: '10px' }}>Handlebars Examples:</h5>
        <div style={{ fontSize: '12px', fontFamily: 'monospace', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '3px' }}>
          <div style={{ marginBottom: '5px' }}>Loop: {'{{'} #each ticket.tags {'}}'}</div>
          <div style={{ marginBottom: '5px' }}>Conditional: {'{{'} #if ticket.priority {'}}'}</div>
          <div>Triple braces for HTML: {'{{{'} ticket.issue {'}}}'}</div>
        </div>
      </div>
    )
  }

  render () {
    const { loading, error, activeTab, showPreview, saving } = this.state

    if (loading) {
      return (
        <div className='page-content full-height' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h3>Loading template...</h3>
        </div>
      )
    }

    if (error) {
      return (
        <div className='page-content full-height' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h3 className='uk-text-danger'>{error}</h3>
        </div>
      )
    }

    return (
      <div className='email-template-editor full-height' style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className='editor-header' style={{
          padding: '15px 20px',
          borderBottom: '1px solid #ddd',
          backgroundColor: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ margin: 0 }}>Edit Template: {this.props.templateName}</h3>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className='md-btn md-btn-primary'
              onClick={() => this.togglePreview()}
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <button
              className='md-btn md-btn-success'
              onClick={() => this.handleSave()}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Template'}
            </button>
            <button
              className='md-btn'
              onClick={() => window.history.back()}
            >
              Close
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className='editor-content' style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden'
        }}>
          {/* Left Panel - Editor */}
          <div style={{
            flex: showPreview ? 1 : 2,
            display: 'flex',
            flexDirection: 'column',
            borderRight: showPreview ? '1px solid #ddd' : 'none'
          }}>
            {/* Tabs */}
            <div className='editor-tabs' style={{
              display: 'flex',
              borderBottom: '1px solid #ddd',
              backgroundColor: '#fafafa'
            }}>
              <button
                className={`tab-button ${activeTab === 'editor' ? 'active' : ''}`}
                onClick={() => this.handleTabChange('editor')}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  backgroundColor: activeTab === 'editor' ? '#fff' : 'transparent',
                  borderBottom: activeTab === 'editor' ? '2px solid #1976d2' : 'none',
                  cursor: 'pointer',
                  fontWeight: activeTab === 'editor' ? 'bold' : 'normal'
                }}
              >
                Template Editor
              </button>
              <button
                className={`tab-button ${activeTab === 'variables' ? 'active' : ''}`}
                onClick={() => this.handleTabChange('variables')}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  backgroundColor: activeTab === 'variables' ? '#fff' : 'transparent',
                  borderBottom: activeTab === 'variables' ? '2px solid #1976d2' : 'none',
                  cursor: 'pointer',
                  fontWeight: activeTab === 'variables' ? 'bold' : 'normal'
                }}
              >
                Available Variables
              </button>
            </div>

            {/* Editor Area */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {activeTab === 'variables' ? (
                this.renderVariablesPanel()
              ) : (
                <Editor
                  height='100%'
                  language={this.getEditorLanguage()}
                  value={this.getEditorContent()}
                  onChange={(value) => this.handleEditorChange(value)}
                  theme='vs-light'
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    automaticLayout: true
                  }}
                />
              )}
            </div>
          </div>

          {/* Right Panel - Preview */}
          {showPreview && (
            <div style={{ flex: 1, backgroundColor: '#fff', overflow: 'auto' }}>
              <div style={{
                padding: '10px 15px',
                borderBottom: '1px solid #ddd',
                backgroundColor: '#fafafa',
                fontWeight: 'bold'
              }}>
                Preview
              </div>
              {this.renderPreview()}
            </div>
          )}
        </div>
      </div>
    )
  }
}

EmailTemplateEditor.propTypes = {
  templateName: PropTypes.string.isRequired
}

export default EmailTemplateEditor
