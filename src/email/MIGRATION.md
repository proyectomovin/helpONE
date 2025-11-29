# Email Templates Migration Guide

This guide explains how to migrate legacy email templates to the new EmailTemplate system.

## Overview

The migration script converts existing Handlebars templates from `src/mailer/templates/` to the new EmailTemplate model in MongoDB.

## Templates to Migrate

The following 8 templates will be migrated:

1. **new-ticket** → `ticket-created`
2. **ticket-comment-added** → `ticket-comment-added`
3. **ticket-updated** → `ticket-updated`
4. **password-reset** → `password-reset`
5. **new-password** → `new-password`
6. **l2auth-reset** → `l2auth-reset`
7. **l2auth-cleared** → `l2auth-cleared`
8. **public-account-created** → `public-account-created`

## Prerequisites

1. MongoDB must be running
2. Database connection configured in environment variables
3. Application dependencies installed (`npm install`)

## Running the Migration

### Option 1: Direct Execution

```bash
node src/email/migrate-templates.js
```

### Option 2: Using npm script (if configured)

```bash
npm run migrate:email-templates
```

### Option 3: From Node REPL

```javascript
const migrate = require('./src/email/migrate-templates')
migrate.migrateAllTemplates()
```

## What the Script Does

1. **Connects to MongoDB** - Uses connection string from environment
2. **Reads Legacy Templates** - From `src/mailer/templates/*/index.handlebars`
3. **Extracts Variables** - Automatically detects all Handlebars variables
4. **Creates EmailTemplate Records** - Saves to MongoDB
5. **Sets as Default** - Marks migrated templates as default and active
6. **Reports Progress** - Shows detailed console output

## Migration Output Example

```
🚀 Email Template Migration Script
============================================================

📦 Connecting to MongoDB...
✅ Connected to MongoDB

📋 Found 8 templates to migrate:
   - new-ticket
   - ticket-comment-added
   - ticket-updated
   - password-reset
   - new-password
   - l2auth-reset
   - l2auth-cleared
   - public-account-created

📧 Migrating template: new-ticket...
  ✅ Template migrated successfully: legacy-new-ticket
     Variables extracted: 12

📧 Migrating template: ticket-comment-added...
  ✅ Template migrated successfully: legacy-ticket-comment-added
     Variables extracted: 15

...

============================================================
📊 Migration Summary:
   ✅ Successfully migrated: 8
   ⚠️  Skipped (already exist): 0
   ❌ Errors: 0

🎉 Migration completed successfully!

📦 MongoDB connection closed
```

## Post-Migration

After migration, the templates will be available:

1. **In MongoDB** - As EmailTemplate documents
2. **In the Web UI** - At `/settings/email-templates`
3. **Via API** - Through `/api/v2/email-templates`

## Template Structure

Each migrated template will have:

```javascript
{
  name: "Legacy - New Ticket Notification",
  slug: "legacy-new-ticket",
  displayName: "New Ticket Notification",
  description: "Sent when a new ticket is created",
  type: "ticket-created",
  subject: "New Ticket #{{ticket.uid}} - {{ticket.subject}}",
  htmlContent: "<!doctype html>...",
  variables: ["ticket.uid", "ticket.subject", ...],
  language: "en",
  isDefault: true,
  isActive: true
}
```

## Customizing After Migration

Once migrated, you can:

1. **Edit in the Web UI** - Use the visual editor at `/settings/email-templates/editor/:id`
2. **Update via API** - Use `PUT /api/v2/email-templates/:id`
3. **Create Variations** - Clone and modify for different use cases
4. **Change Default** - Mark different templates as default

## Rollback

If needed, you can delete migrated templates:

```javascript
const EmailTemplate = require('./src/models/emailTemplate')

// Delete all legacy templates
EmailTemplate.deleteMany({ slug: /^legacy-/ })
```

## Safe to Re-run

The script checks for existing templates by slug and skips them, so it's safe to run multiple times.

## Troubleshooting

### Connection Error

```
❌ MongoDB connection error: connect ECONNREFUSED
```

**Solution:** Ensure MongoDB is running and connection string is correct

### Template Not Found

```
⚠️  Template file not found: /path/to/template
```

**Solution:** Verify the template exists in `src/mailer/templates/`

### Duplicate Key Error

```
❌ Error: E11000 duplicate key error
```

**Solution:** Template already exists. Delete it first or script will skip it.

## Next Steps

After migration:

1. Test each template using the test email feature
2. Customize templates as needed in the visual editor
3. Update application code to use new templates (if needed)
4. Monitor email sending to ensure everything works

## Support

For issues or questions about migration, check:
- Migration script: `src/email/migrate-templates.js`
- EmailTemplate model: `src/models/emailTemplate.js`
- API documentation: See API endpoints in routes
