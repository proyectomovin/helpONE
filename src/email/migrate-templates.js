/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Updated:    2025-11-27
 *  Copyright (c) 2014-2025. All rights reserved.
 */

/**
 * Migration Script: Convert Legacy Handlebars Templates to EmailTemplate Model
 *
 * This script migrates existing email templates from src/mailer/templates/
 * to the new EmailTemplate system in MongoDB.
 *
 * Usage: node src/email/migrate-templates.js
 */

const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const EmailTemplate = require('../models/emailTemplate')
const templateEngine = require('./templates/engine')

// Template mappings
const templateMappings = {
  'new-ticket': {
    type: 'ticket-created',
    subject: 'New Ticket #{{ticket.uid}} - {{ticket.subject}}',
    displayName: 'New Ticket Notification',
    description: 'Sent when a new ticket is created'
  },
  'ticket-comment-added': {
    type: 'ticket-comment-added',
    subject: 'Updated: Ticket #{{ticket.uid}} - {{ticket.subject}}',
    displayName: 'Ticket Comment Added',
    description: 'Sent when a comment is added to a ticket'
  },
  'ticket-updated': {
    type: 'ticket-updated',
    subject: 'Updated: Ticket #{{ticket.uid}} - {{ticket.subject}}',
    displayName: 'Ticket Updated',
    description: 'Sent when a ticket is updated'
  },
  'password-reset': {
    type: 'password-reset',
    subject: 'Password Reset Request',
    displayName: 'Password Reset',
    description: 'Sent when a user requests a password reset'
  },
  'new-password': {
    type: 'new-password',
    subject: 'Your New Password',
    displayName: 'New Password',
    description: 'Sent after password reset with new temporary password'
  },
  'l2auth-reset': {
    type: 'l2auth-reset',
    subject: 'Two-Factor Authentication Reset',
    displayName: '2FA Reset',
    description: 'Sent when user requests 2FA reset'
  },
  'l2auth-cleared': {
    type: 'l2auth-cleared',
    subject: 'Two-Factor Authentication Cleared',
    displayName: '2FA Cleared',
    description: 'Sent when 2FA is successfully removed'
  },
  'public-account-created': {
    type: 'public-account-created',
    subject: 'Your Account Has Been Created',
    displayName: 'Public Account Created',
    description: 'Sent when a new public user account is created'
  }
}

const templatesDir = path.join(__dirname, '../mailer/templates')

/**
 * Read template file content
 */
function readTemplateFile(templateName) {
  const templatePath = path.join(templatesDir, templateName, 'index.handlebars')

  if (!fs.existsSync(templatePath)) {
    console.log(`⚠️  Template file not found: ${templatePath}`)
    return null
  }

  return fs.readFileSync(templatePath, 'utf8')
}

/**
 * Migrate a single template
 */
async function migrateTemplate(templateName) {
  const mapping = templateMappings[templateName]

  if (!mapping) {
    console.log(`⚠️  No mapping found for template: ${templateName}`)
    return false
  }

  console.log(`📧 Migrating template: ${templateName}...`)

  // Read template content
  const htmlContent = readTemplateFile(templateName)

  if (!htmlContent) {
    return false
  }

  // Extract variables from template
  const htmlVariables = templateEngine.extractVariables(htmlContent)
  const subjectVariables = templateEngine.extractVariables(mapping.subject)
  const allVariables = htmlVariables.concat(subjectVariables).filter((value, index, self) => {
    return self.indexOf(value) === index
  })

  // Create slug from template name
  const slug = `legacy-${templateName}`

  // Check if template already exists
  const existingTemplate = await EmailTemplate.findOne({ slug: slug })

  if (existingTemplate) {
    console.log(`  ℹ️  Template already exists: ${slug}`)
    console.log(`  ✅ Skipping migration`)
    return true
  }

  // Create new EmailTemplate
  const emailTemplate = new EmailTemplate({
    name: `Legacy - ${mapping.displayName}`,
    slug: slug,
    displayName: mapping.displayName,
    description: mapping.description,
    type: mapping.type,
    subject: mapping.subject,
    htmlContent: htmlContent,
    variables: allVariables,
    language: 'en',
    isDefault: true,
    isActive: true
  })

  try {
    await emailTemplate.save()
    console.log(`  ✅ Template migrated successfully: ${slug}`)
    console.log(`     Variables extracted: ${allVariables.length}`)
    return true
  } catch (err) {
    console.error(`  ❌ Error migrating template ${templateName}:`, err.message)
    return false
  }
}

/**
 * Migrate all templates
 */
async function migrateAllTemplates() {
  console.log('')
  console.log('🚀 Email Template Migration Script')
  console.log('=' .repeat(60))
  console.log('')

  // Connect to MongoDB
  console.log('📦 Connecting to MongoDB...')

  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/trudesk'
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log('✅ Connected to MongoDB')
    console.log('')
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message)
    process.exit(1)
  }

  // Get list of templates to migrate
  const templates = Object.keys(templateMappings)
  console.log(`📋 Found ${templates.length} templates to migrate:`)
  templates.forEach(t => console.log(`   - ${t}`))
  console.log('')

  // Migrate each template
  let successCount = 0
  let errorCount = 0
  let skippedCount = 0

  for (const templateName of templates) {
    const result = await migrateTemplate(templateName)

    if (result === true) {
      successCount++
    } else if (result === false) {
      errorCount++
    } else {
      skippedCount++
    }

    console.log('')
  }

  // Summary
  console.log('=' .repeat(60))
  console.log('📊 Migration Summary:')
  console.log(`   ✅ Successfully migrated: ${successCount}`)
  console.log(`   ⚠️  Skipped (already exist): ${skippedCount}`)
  console.log(`   ❌ Errors: ${errorCount}`)
  console.log('')

  if (errorCount === 0) {
    console.log('🎉 Migration completed successfully!')
  } else {
    console.log('⚠️  Migration completed with errors')
  }

  console.log('')

  // Close MongoDB connection
  await mongoose.connection.close()
  console.log('📦 MongoDB connection closed')

  process.exit(errorCount > 0 ? 1 : 0)
}

/**
 * Main execution
 */
if (require.main === module) {
  migrateAllTemplates().catch(err => {
    console.error('❌ Fatal error:', err)
    process.exit(1)
  })
}

module.exports = {
  migrateAllTemplates,
  migrateTemplate
}
