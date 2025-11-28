# Multi-Provider Email Support - Phase 5 Documentation

## Overview

The Multi-Provider Email system allows HelpONE to use multiple email service providers (SendGrid, Mailgun, AWS SES, etc.) with automatic failover, load balancing, and intelligent routing.

## Features

### Supported Providers

1. **SMTP** - Standard SMTP server
2. **SendGrid** - SendGrid email service
3. **Mailgun** - Mailgun email service
4. **Amazon SES** - AWS Simple Email Service
5. **Postmark** - Postmark email service
6. **SparkPost** - SparkPost email service

### Core Capabilities

- ✅ **Multiple Providers**: Configure unlimited email providers
- ✅ **Automatic Failover**: Switch to backup provider on failure
- ✅ **Load Balancing**: Distribute emails across providers
- ✅ **Health Monitoring**: Track provider health and performance
- ✅ **Rate Limiting**: Per-provider hourly/daily limits
- ✅ **Smart Routing**: Route emails based on priority, type, domain
- ✅ **Statistics**: Detailed performance metrics per provider
- ✅ **Testing**: Test provider connections before activation

## Configuration

### Adding a Provider

**Via API:**
```javascript
POST /api/v2/email-providers

{
  "name": "SendGrid Production",
  "type": "sendgrid",
  "isActive": true,
  "isPrimary": true,
  "priority": 10,
  "config": {
    "sendgrid": {
      "apiKey": "SG.xxxxxxxxxxxxx",
      "fromEmail": "noreply@example.com",
      "fromName": "Example Support"
    }
  },
  "rateLimit": {
    "enabled": true,
    "maxPerHour": 1000,
    "maxPerDay": 10000
  },
  "failover": {
    "enabled": true,
    "retryAttempts": 3,
    "retryDelay": 1000
  }
}
```

### Provider Types Configuration

#### SMTP
```javascript
{
  "type": "smtp",
  "config": {
    "smtp": {
      "host": "smtp.gmail.com",
      "port": 587,
      "secure": false,
      "auth": {
        "user": "user@gmail.com",
        "pass": "app-password"
      },
      "tls": {
        "rejectUnauthorized": true
      }
    }
  }
}
```

#### SendGrid
```javascript
{
  "type": "sendgrid",
  "config": {
    "sendgrid": {
      "apiKey": "SG.xxxxxxxxxxxxx",
      "fromEmail": "support@example.com",
      "fromName": "Support Team"
    }
  }
}
```

#### Mailgun
```javascript
{
  "type": "mailgun",
  "config": {
    "mailgun": {
      "apiKey": "key-xxxxxxxxxxxxx",
      "domain": "mg.example.com",
      "host": "api.mailgun.net",
      "fromEmail": "support@example.com",
      "fromName": "Support Team"
    }
  }
}
```

#### Amazon SES
```javascript
{
  "type": "ses",
  "config": {
    "ses": {
      "accessKeyId": "AKIAXXXXXXXXXXXXXXXX",
      "secretAccessKey": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "region": "us-east-1",
      "fromEmail": "support@example.com",
      "fromName": "Support Team"
    }
  }
}
```

#### Postmark
```javascript
{
  "type": "postmark",
  "config": {
    "postmark": {
      "serverToken": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "fromEmail": "support@example.com",
      "fromName": "Support Team"
    }
  }
}
```

#### SparkPost
```javascript
{
  "type": "sparkpost",
  "config": {
    "sparkpost": {
      "apiKey": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "endpoint": "https://api.sparkpost.com",
      "fromEmail": "support@example.com",
      "fromName": "Support Team"
    }
  }
}
```

## Smart Routing Rules

### Priority-Based Routing

Configure different providers for different priorities:

```javascript
{
  "name": "High Priority Provider",
  "priority": 1,
  "rules": {
    "onlyFor": {
      "priorities": ["High", "Critical"]
    }
  }
}
```

### Email Type Routing

Route transactional vs marketing emails differently:

```javascript
{
  "name": "Transactional Provider",
  "rules": {
    "onlyFor": {
      "emailTypes": ["transactional"]
    }
  }
}
```

### Domain-Based Routing

Use specific providers for specific domains:

```javascript
{
  "name": "Enterprise Provider",
  "rules": {
    "onlyFor": {
      "domains": ["@enterprise-client.com", "@vip-customer.com"]
    }
  }
}
```

### Exclusion Rules

Exclude providers from specific scenarios:

```javascript
{
  "name": "General Provider",
  "rules": {
    "notFor": {
      "priorities": ["Low"],
      "emailTypes": ["marketing"]
    }
  }
}
```

## Rate Limiting

### Hourly and Daily Limits

```javascript
{
  "rateLimit": {
    "enabled": true,
    "maxPerHour": 500,
    "maxPerDay": 5000
  }
}
```

When limits are reached:
- Provider is automatically skipped
- Next available provider is used
- Counters reset automatically

## Failover Configuration

### Automatic Failover

```javascript
{
  "failover": {
    "enabled": true,
    "fallbackProviderId": "backup-provider-id", // Optional specific fallback
    "retryAttempts": 3,
    "retryDelay": 1000 // milliseconds
  }
}
```

### Failover Flow

1. **Primary Send Fails**
2. **Check Failover Enabled** → If disabled, return error
3. **Check Specific Fallback** → Use if configured
4. **Try Any Healthy Provider** → Priority order
5. **Update Health Status** → Mark failed provider as degraded/unhealthy

### Health Status

- **healthy**: Provider working normally
- **degraded**: Some failures but still functional
- **unhealthy**: Consecutive failures exceeded threshold
- **unknown**: Not yet tested

## Monitoring & Statistics

### Provider Statistics

Each provider tracks:
- Total emails sent
- Total emails failed
- Success rate percentage
- Average response time
- Last sent/failed timestamps
- Hourly/daily counters

### Accessing Statistics

```javascript
// Single provider
GET /api/v2/email-providers/:id

// Overall summary
GET /api/v2/email-providers/stats/summary

Response:
{
  "total": 3,
  "active": 2,
  "healthy": 2,
  "degraded": 0,
  "unhealthy": 0,
  "byType": {
    "sendgrid": 1,
    "mailgun": 1,
    "ses": 1
  },
  "totalSent": 15000,
  "totalFailed": 45,
  "averageSuccessRate": 99.7
}
```

## API Reference

### Endpoints

#### List Providers
```
GET /api/v2/email-providers
Query: ?isActive=true&type=sendgrid
```

#### Get Provider
```
GET /api/v2/email-providers/:id
```

#### Create Provider
```
POST /api/v2/email-providers
Body: Provider configuration
```

#### Update Provider
```
PUT /api/v2/email-providers/:id
Body: Updated fields
```

#### Delete Provider
```
DELETE /api/v2/email-providers/:id
```

#### Toggle Active Status
```
POST /api/v2/email-providers/:id/toggle
```

#### Test Connection
```
POST /api/v2/email-providers/:id/test

Response:
{
  "success": true,
  "test": {
    "success": true,
    "message": "Provider connection successful",
    "provider": "SendGrid Production"
  }
}
```

#### Reset Statistics
```
POST /api/v2/email-providers/:id/reset-stats
```

#### Get Supported Types
```
GET /api/v2/email-providers/types
```

## Usage in Code

### Automatic Provider Selection

The provider manager automatically selects the best provider:

```javascript
var providerManager = require('./src/email/providers/manager')

providerManager.sendMail({
  to: 'user@example.com',
  subject: 'Test Email',
  html: '<h1>Hello World</h1>'
}, {
  priority: 'High',
  emailType: 'transactional',
  recipientDomain: '@example.com'
}, function(err, result) {
  if (err) {
    console.error('Send failed:', err)
  } else {
    console.log('Email sent:', result.messageId)
  }
})
```

### Manual Provider Selection

Use a specific provider:

```javascript
EmailProvider.findById(providerId, function(err, provider) {
  providerManager.sendWithProvider(provider, mailOptions, callback)
})
```

### Test Provider

```javascript
EmailProvider.findById(providerId, function(err, provider) {
  provider.testConnection(function(err, result) {
    if (err) {
      console.error('Test failed:', err)
    } else {
      console.log('Test passed:', result)
    }
  })
})
```

## Integration with Existing System

The provider manager integrates seamlessly with:

### Email Module
```javascript
// src/email/index.js
var providerManager = require('./providers/manager')

emailModule.sendTemplateEmail = function(options, callback) {
  // ... render template ...

  providerManager.sendMail(mailOptions, {
    priority: ticket.priority.name,
    emailType: 'transactional'
  }, callback)
}
```

### Rules Engine (Phase 3)
All email actions automatically use the provider manager.

### User Preferences (Phase 4)
Provider selection respects user preferences and frequency settings.

## Best Practices

### Production Setup

1. **Multiple Providers**: Configure at least 2 providers for redundancy
2. **Set Priorities**: Lower numbers = higher priority (1, 10, 20, 30, etc.)
3. **Enable Failover**: Always enable for production
4. **Configure Rate Limits**: Match your provider plan limits
5. **Monitor Health**: Check provider health regularly
6. **Test Connections**: Test before marking as active

### Provider Priority Strategy

```
Priority 1:  Primary provider (SendGrid)
Priority 10: Secondary provider (Mailgun)
Priority 20: Tertiary provider (AWS SES)
Priority 30: Backup SMTP server
```

### Security

1. **Encrypt Config**: Store API keys encrypted in production
2. **Environment Variables**: Use env vars for sensitive data
3. **Rotate Keys**: Regularly rotate API keys
4. **Audit Access**: Track who modifies provider config
5. **Test Safely**: Use test modes when available

## Troubleshooting

### Provider Not Sending

1. **Check Active Status**
   ```
   GET /api/v2/email-providers/:id
   Verify isActive: true
   ```

2. **Check Health Status**
   ```
   Verify health.status !== 'unhealthy'
   ```

3. **Check Rate Limits**
   ```
   Verify not rate limited
   ```

4. **Test Connection**
   ```
   POST /api/v2/email-providers/:id/test
   ```

### All Providers Failing

1. **Check Configuration**
   - Verify API keys/credentials
   - Check from email addresses
   - Verify domain authentication

2. **Check Network**
   - Firewall rules
   - Outbound connections allowed
   - DNS resolution

3. **Check Provider Status**
   - Visit provider status page
   - Check for service outages

### Poor Performance

1. **Check Response Times**
   - Review stats.averageResponseTime
   - Compare across providers

2. **Check Success Rates**
   - Review stats.successRate
   - Investigate failures

3. **Optimize Routing**
   - Adjust priority values
   - Configure rules for load distribution

## Migration Guide

### From Single Provider

**Step 1**: Keep existing mailer working
```javascript
// Keep your current nodemailer setup active
```

**Step 2**: Create provider in database
```javascript
POST /api/v2/email-providers
// Add your current SMTP as a provider
```

**Step 3**: Test new provider
```javascript
POST /api/v2/email-providers/:id/test
```

**Step 4**: Activate provider
```javascript
POST /api/v2/email-providers/:id/toggle
```

**Step 5**: Update email module
```javascript
// Switch from nodemailer to providerManager
var providerManager = require('./providers/manager')
providerManager.sendMail(mailOptions, callback)
```

### Adding Additional Providers

1. Add new provider via API
2. Set lower priority than primary
3. Test connection
4. Activate
5. Monitor statistics

## Performance Optimization

### Caching

Transports are cached in memory:
- Created once per provider
- Reused for all emails
- Cleared on provider update

### Clear Cache

```javascript
providerManager.clearCache() // Clear all
providerManager.clearCache(providerId) // Clear specific
```

### Load Distribution

Distribute across providers using priorities:

```javascript
// Equal distribution
Provider A: priority 10, maxPerHour: 500
Provider B: priority 10, maxPerHour: 500
Provider C: priority 10, maxPerHour: 500
// Manager will round-robin through rate-limited providers
```

## Dependencies

Required npm packages:

```json
{
  "nodemailer": "^6.9.0",
  "nodemailer-mailgun-transport": "^2.1.5",
  "@aws-sdk/client-ses": "^3.0.0",
  "nodemailer-postmark-transport": "^5.2.1",
  "nodemailer-sparkpost-transport": "^2.1.0"
}
```

Install with:
```bash
npm install nodemailer nodemailer-mailgun-transport @aws-sdk/client-ses nodemailer-postmark-transport nodemailer-sparkpost-transport
```

## Future Enhancements

Potential improvements:

1. **Advanced Load Balancing** - Weighted round-robin
2. **Geographic Routing** - Route by recipient location
3. **Cost Optimization** - Choose cheapest provider
4. **Bulk Sending** - Batch API for providers that support it
5. **Template Caching** - Cache rendered templates
6. **Retry Strategies** - Exponential backoff
7. **Provider Analytics** - Detailed performance dashboards
8. **A/B Testing** - Test provider performance
9. **Smart Fallback** - ML-based provider selection
10. **Multi-Region** - Geographic provider distribution

---

**Version:** 1.0.0
**Last Updated:** 2025-11-28
**Phase:** 5 - Multi-Provider Support
