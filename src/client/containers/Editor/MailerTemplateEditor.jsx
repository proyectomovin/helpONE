import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import grapesjs from 'grapesjs'
import grapesjsPresetEmail from 'grapesjsEmail'

import Button from 'components/Button'
import helpers from 'lib/helpers'
import History from 'lib2/history'
import Log from 'logger'

const MailerTemplateEditor = ({ template }) => {
  const editorRef = useRef(null)
  const editorContainerRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const redirectToTemplates = () => History.push('/settings/mailer')

  useEffect(() => {
    let isMounted = true

    const fetchAssets = async editor => {
      try {
        const res = await axios.get('/api/v1/editor/assets')
        if (res.data && res.data.assets) editor.AssetManager.add(res.data.assets)
      } catch (err) {
        helpers.UI.showSnackbar('Unable to load editor assets', true)
        Log.error(err)
      }
    }

    const fetchTemplate = async () => {
      try {
        const res = await axios.get(`/api/v1/editor/load/${template}`)
        if (res.data && res.data.invalid) {
          throw new Error('Invalid template')
        }

        if (!res.data) throw new Error('Unable to load template')

        return res.data
      } catch (err) {
        if (!isMounted) return null
        setError('Unable to load template. Redirecting...')
        helpers.UI.showSnackbar('Unable to load template data', true)
        Log.error(err)
        setTimeout(redirectToTemplates, 2500)
        setLoading(false)
        return null
      }
    }

    const initEditor = async () => {
      setLoading(true)
      const templateData = await fetchTemplate()
      if (!templateData) return

      const editor = grapesjs.init({
        container: editorContainerRef.current,
        height: 'calc(100vh - 160px)',
        storageManager: false,
        assetManager: {
          upload: '/api/v1/editor/assets/upload',
          uploadName: 'file',
          multiUpload: false,
          autoAdd: true,
          embedAsBase64: false
        },
        plugins: [grapesjsPresetEmail],
        pluginsOpts: {
          'gjs-preset-newsletter': {
            modalTitle: 'Email Template Editor'
          }
        }
      })

      editor.loadProjectData(templateData)

      await fetchAssets(editor)

      editorRef.current = editor
      if (isMounted) setLoading(false)
    }

    initEditor()

    return () => {
      isMounted = false
      if (editorRef.current) {
        editorRef.current.destroy()
        editorRef.current = null
      }
    }
  }, [template])

  const onSave = async () => {
    if (!editorRef.current) return

    setSaving(true)
    try {
      const payload = editorRef.current.getProjectData()
      payload.template = template

      await axios.post('/api/v1/editor/save', payload)
      helpers.UI.showSnackbar('Template saved successfully')
    } catch (err) {
      helpers.UI.showSnackbar('Unable to save template', true)
      Log.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={'page-content no-border-top full-height'}>
      <div className={'uk-width-1-1 page-title'}>
        <p className={'left'}>Edit Email Template</p>
        <div className={'right'}>
          <Button text={'Back to Templates'} small={true} onClick={redirectToTemplates} />
          <Button
            text={saving ? 'Saving...' : 'Save Template'}
            small={true}
            style={{ marginLeft: 10 }}
            onClick={onSave}
            disabled={saving || loading || !!error}
          />
        </div>
      </div>
      <div className={'page-wrapper full-height scrollable no-overflow-x'}>
        <div className={'page-wrapper-inner'}>
          <div className={'panel'} style={{ minHeight: '70vh', position: 'relative' }}>
            {error && (
              <div className={'full-height'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h3 className={'uk-text-muted'}>{error}</h3>
              </div>
            )}
            {!error && (
              <>
                {loading && (
                  <div className={'uk-text-center uk-text-muted'} style={{ padding: '40px 0' }}>
                    <p className={'font-light'}>Loading editor...</p>
                  </div>
                )}
                <div id={'web-editor'} ref={editorContainerRef} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

MailerTemplateEditor.propTypes = {
  template: PropTypes.string.isRequired
}

export default MailerTemplateEditor
