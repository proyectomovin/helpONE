/**
 * Dynamic Ticket Form Handler
 * Handles dynamic loading of requesters, products, and modules based on group selection
 */

;(function() {
  'use strict'

  // Wait for jQuery and selectize to be available
  $(document).ready(function() {

    /**
     * Initialize dynamic form handlers when create ticket modal is shown
     */
    function initializeDynamicTicketForm() {
      const $groupSelect = $('#group')
      const $requesterSelect = $('#requester')
      const $productSelect = $('#product')
      const $moduleSelect = $('#module')

      if (!$groupSelect.length) {
        // Modal not visible yet, try again
        return
      }

      // Get selectize instances
      let requesterSelectize = $requesterSelect[0] ? $requesterSelect[0].selectize : null
      let productSelectize = $productSelect[0] ? $productSelect[0].selectize : null
      let moduleSelectize = $moduleSelect[0] ? $moduleSelect[0].selectize : null

      // Load products and modules on page load
      loadProducts()
      loadModules()

      /**
       * Handler: Group selection changed
       */
      $groupSelect.on('change', function() {
        const groupId = $(this).val()

        if (groupId) {
          // Load members (requesters) for this group
          loadGroupMembers(groupId)

          // Load products and modules associated with this group
          loadGroupProductsAndModules(groupId)
        } else {
          // Clear requester
          if (requesterSelectize) {
            requesterSelectize.clearOptions()
            requesterSelectize.addOption({ value: '', text: 'Primero seleccione un grupo...' })
          }
        }
      })

      /**
       * Handler: Product selection changed
       */
      $productSelect.on('change', function() {
        const productId = $(this).val()

        if (productId) {
          // Load modules for this product
          loadModulesByProduct(productId)
        } else {
          // Show all modules
          loadModules()
        }
      })

      /**
       * Load all products
       */
      function loadProducts() {
        $.ajax({
          url: '/api/v1/products/enabled',
          method: 'GET',
          success: function(response) {
            if (response.success && response.products) {
              if (productSelectize) {
                productSelectize.clearOptions()
                productSelectize.addOption({ value: '', text: 'Seleccionar producto...' })

                response.products.forEach(function(product) {
                  productSelectize.addOption({
                    value: product._id,
                    text: product.name
                  })
                })

                productSelectize.refreshOptions(false)
              }
            }
          },
          error: function(err) {
            console.error('Error loading products:', err)
          }
        })
      }

      /**
       * Load all modules
       */
      function loadModules() {
        $.ajax({
          url: '/api/v1/modules/enabled',
          method: 'GET',
          success: function(response) {
            if (response.success && response.modules) {
              if (moduleSelectize) {
                moduleSelectize.clearOptions()
                moduleSelectize.addOption({ value: '', text: 'Seleccionar módulo...' })

                response.modules.forEach(function(module) {
                  const text = module.product ?
                    module.name + ' (' + module.product.name + ')' :
                    module.name

                  moduleSelectize.addOption({
                    value: module._id,
                    text: text
                  })
                })

                moduleSelectize.refreshOptions(false)
              }
            }
          },
          error: function(err) {
            console.error('Error loading modules:', err)
          }
        })
      }

      /**
       * Load modules by product
       */
      function loadModulesByProduct(productId) {
        $.ajax({
          url: '/api/v1/modules/product/' + productId,
          method: 'GET',
          success: function(response) {
            if (response.success && response.modules) {
              if (moduleSelectize) {
                moduleSelectize.clearOptions()
                moduleSelectize.addOption({ value: '', text: 'Seleccionar módulo...' })

                response.modules.forEach(function(module) {
                  moduleSelectize.addOption({
                    value: module._id,
                    text: module.name
                  })
                })

                moduleSelectize.refreshOptions(false)
              }
            }
          },
          error: function(err) {
            console.error('Error loading modules:', err)
          }
        })
      }

      /**
       * Load group members (for requester select)
       */
      function loadGroupMembers(groupId) {
        $.ajax({
          url: '/api/v1/groups/' + groupId,
          method: 'GET',
          success: function(response) {
            if (response.success && response.group && response.group.members) {
              if (requesterSelectize) {
                requesterSelectize.clearOptions()
                requesterSelectize.addOption({ value: '', text: 'Seleccionar solicitante...' })

                response.group.members.forEach(function(member) {
                  requesterSelectize.addOption({
                    value: member._id,
                    text: member.fullname + ' (' + member.email + ')'
                  })
                })

                requesterSelectize.refreshOptions(false)
              }
            }
          },
          error: function(err) {
            console.error('Error loading group members:', err)
          }
        })
      }

      /**
       * Load products and modules associated with group
       */
      function loadGroupProductsAndModules(groupId) {
        $.ajax({
          url: '/api/v1/groups/' + groupId,
          method: 'GET',
          success: function(response) {
            if (response.success && response.group) {
              const group = response.group

              // If group has specific products, filter to show only those
              if (group.products && group.products.length > 0) {
                const productIds = group.products.map(p => p._id || p)
                filterProductsByIds(productIds)
              } else {
                // Show all products
                loadProducts()
              }

              // If group has specific modules, filter to show only those
              if (group.modules && group.modules.length > 0) {
                const moduleIds = group.modules.map(m => m._id || m)
                filterModulesByIds(moduleIds)
              } else {
                // Show all modules
                loadModules()
              }
            }
          },
          error: function(err) {
            console.error('Error loading group data:', err)
          }
        })
      }

      /**
       * Filter products by IDs
       */
      function filterProductsByIds(productIds) {
        $.ajax({
          url: '/api/v1/products',
          method: 'GET',
          success: function(response) {
            if (response.success && response.products) {
              if (productSelectize) {
                productSelectize.clearOptions()
                productSelectize.addOption({ value: '', text: 'Seleccionar producto...' })

                const filteredProducts = response.products.filter(function(product) {
                  return productIds.includes(product._id)
                })

                filteredProducts.forEach(function(product) {
                  productSelectize.addOption({
                    value: product._id,
                    text: product.name
                  })
                })

                productSelectize.refreshOptions(false)
              }
            }
          }
        })
      }

      /**
       * Filter modules by IDs
       */
      function filterModulesByIds(moduleIds) {
        $.ajax({
          url: '/api/v1/modules',
          method: 'GET',
          success: function(response) {
            if (response.success && response.modules) {
              if (moduleSelectize) {
                moduleSelectize.clearOptions()
                moduleSelectize.addOption({ value: '', text: 'Seleccionar módulo...' })

                const filteredModules = response.modules.filter(function(module) {
                  return moduleIds.includes(module._id)
                })

                filteredModules.forEach(function(module) {
                  const text = module.product ?
                    module.name + ' (' + module.product.name + ')' :
                    module.name

                  moduleSelectize.addOption({
                    value: module._id,
                    text: text
                  })
                })

                moduleSelectize.refreshOptions(false)
              }
            }
          }
        })
      }
    }

    // Initialize when modal is shown
    $(document).on('click', '[data-uk-modal*="createTicketModal"]', function() {
      setTimeout(initializeDynamicTicketForm, 500)
    })

    // Also try to initialize if modal is already open
    if ($('#createTicketModal').is(':visible')) {
      initializeDynamicTicketForm()
    }
  })
})()
