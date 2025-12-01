/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Copyright (c) 2014-2025. All rights reserved.
 */

define(['jquery', 'modules/helpers'], function ($, helpers) {
  var editorPage = {}

  editorPage.init = function (template) {
    if (!template) {
      $('#web-editor').addClass('hide')
      $('#web-editor-invalid-notification').removeClass('hide')
      setTimeout(function () {
        History.pushState(null, null, '/settings/mailer')
      }, 3000)
      return
    }

    // Load GrapeJS
    var grapesjs = window.grapesjs

    if (!grapesjs) {
      helpers.UI.showSnackbar('GrapeJS library not loaded', true)
      return
    }

    // Initialize GrapeJS editor
    var editor = grapesjs.init({
      container: '#web-editor',
      height: '100%',
      width: 'auto',
      plugins: ['gjs-preset-newsletter'],
      pluginsOpts: {
        'gjs-preset-newsletter': {
          modalTitleImport: 'Import template',
          modalLabelImport: 'Paste HTML or CSS here',
          modalLabelExport: 'Copy the code below',
          modalBtnImport: 'Import',
          codeViewerTheme: 'hopscotch',
          importPlaceholder: '<table class="table"><tr><td class="cell">Hello</td></tr></table>',
          cellStyle: {
            'font-size': '12px',
            'font-weight': 300,
            height: '75px',
            margin: 0,
            padding: 0
          }
        }
      },
      storageManager: {
        type: 'remote',
        autosave: false,
        autoload: true,
        urlLoad: '/api/v1/editor/load/' + template,
        urlStore: '/api/v1/editor/save',
        params: { template: template },
        headers: {
          'Content-Type': 'application/json'
        },
        onStore: function (data, editor) {
          var pagesHtml = editor.Pages.getAll().map(function (page) {
            var component = page.getMainComponent()
            return {
              html: editor.getHtml({ component: component }),
              css: editor.getCss({ component: component })
            }
          })

          return {
            template: template,
            'gjs-assets': data['gjs-assets'] || [],
            'gjs-css': data['gjs-css'] || '',
            'gjs-html': data['gjs-html'] || '',
            'gjs-styles': data['gjs-styles'] || [],
            'gjs-components': data['gjs-components'] || [],
            'gjs-fullHtml':
              '<html><head><style>' +
              data['gjs-css'] +
              '</style></head><body>' +
              data['gjs-html'] +
              '</body></html>'
          }
        }
      },
      assetManager: {
        upload: '/api/v1/editor/assets/upload',
        uploadName: 'file',
        assets: [],
        uploadFile: function (e) {
          var files = e.dataTransfer ? e.dataTransfer.files : e.target.files
          var formData = new FormData()
          for (var i = 0; i < files.length; i++) {
            formData.append('file', files[i])
          }

          $.ajax({
            url: '/api/v1/editor/assets/upload',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            crossDomain: false,
            beforeSend: function (xhr) {
              var accessToken = window.localStorage.getItem('accessToken')
              if (accessToken) {
                xhr.setRequestHeader('accesstoken', accessToken)
              }
            },
            success: function (data) {
              if (data.success && data.data) {
                var assetManager = editor.AssetManager
                data.data.forEach(function (url) {
                  assetManager.add({ src: url })
                })
              }
            },
            error: function (err) {
              console.error('Upload error:', err)
              helpers.UI.showSnackbar('Error uploading file', true)
            }
          })
        }
      },
      canvas: {
        styles: [
          'https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css',
          'https://fonts.googleapis.com/css?family=Open+Sans:400,300,700'
        ]
      }
    })

    // Load assets on editor load
    editor.on('load', function () {
      $.ajax({
        url: '/api/v1/editor/assets',
        type: 'GET',
        crossDomain: false,
        beforeSend: function (xhr) {
          var accessToken = window.localStorage.getItem('accessToken')
          if (accessToken) {
            xhr.setRequestHeader('accesstoken', accessToken)
          }
        },
        success: function (data) {
          if (data.success && data.assets) {
            var assetManager = editor.AssetManager
            data.assets.forEach(function (asset) {
              assetManager.add(asset)
            })
          }
        },
        error: function (err) {
          console.error('Error loading assets:', err)
        }
      })
    })

    // Add save button command
    editor.Panels.addButton('options', [
      {
        id: 'save-template',
        className: 'fa fa-floppy-o',
        command: 'save-template',
        attributes: { title: 'Save Template' }
      }
    ])

    editor.Commands.add('save-template', {
      run: function (editor, sender) {
        sender && sender.set('active', 0)
        editor.store(function (res) {
          if (res && res.success !== false) {
            helpers.UI.showSnackbar('Template saved successfully')
          } else {
            helpers.UI.showSnackbar('Error saving template', true)
          }
        })
      }
    })

    // Add back button
    editor.Panels.addButton('options', [
      {
        id: 'back-to-settings',
        className: 'fa fa-arrow-left',
        command: 'back-to-settings',
        attributes: { title: 'Back to Settings' }
      }
    ])

    editor.Commands.add('back-to-settings', {
      run: function (editor, sender) {
        if (confirm('Are you sure you want to leave? Any unsaved changes will be lost.')) {
          History.pushState(null, null, '/settings/mailer')
        }
      }
    })
  }

  return editorPage
})
