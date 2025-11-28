# Notification Rules - Phase 3 Documentation

## Overview

The Notification Rules system provides powerful automation capabilities for HelpONE. It allows administrators to create custom rules that automatically trigger actions based on specific events and conditions.

## Features

### Core Components

1. **Rule Engine** - Evaluates conditions and executes actions
2. **Conditions System** - Flexible condition evaluation with 17+ operators
3. **Actions System** - 10+ action types including email, ticket updates, webhooks
4. **REST API** - Complete CRUD operations for rule management
5. **Web Interface** - Visual builder for creating rules
6. **Event Integration** - Automatic triggering based on system events

### Supported Event Types

- **Ticket Events**
  - `ticket-created` - New ticket created
  - `ticket-updated` - Ticket updated
  - `ticket-assigned` - Ticket assigned to user
  - `ticket-closed` - Ticket closed
  - `ticket-reopened` - Ticket reopened
  - `ticket-comment-added` - Comment added to ticket
  - `ticket-status-changed` - Status changed
  - `ticket-priority-changed` - Priority changed

- **SLA Events**
  - `ticket-sla-warning` - SLA deadline approaching
  - `ticket-sla-exceeded` - SLA deadline exceeded

- **User Events**
  - `user-created` - New user created
  - `user-login` - User logged in
  - `password-reset-requested` - Password reset requested

- **Scheduled Events**
  - `scheduled-daily` - Daily schedule
  - `scheduled-weekly` - Weekly schedule
  - `scheduled-monthly` - Monthly schedule

### Condition Operators

#### String Operators
- `equals` - Exact match (case-insensitive)
- `not_equals` - Does not match
- `contains` - Contains substring
- `not_contains` - Does not contain substring
- `starts_with` - Starts with substring
- `ends_with` - Ends with substring
- `matches_regex` - Matches regular expression

#### Numeric/Date Operators
- `greater_than` - Greater than value
- `less_than` - Less than value
- `greater_or_equal` - Greater than or equal
- `less_or_equal` - Less than or equal

#### Array Operators
- `in_list` - Value is in list
- `not_in_list` - Value is not in list

#### Empty Check Operators
- `is_empty` - Field is empty
- `is_not_empty` - Field is not empty

#### Change Detection Operators
- `changed` - Field value changed
- `changed_from` - Changed from specific value
- `changed_to` - Changed to specific value

### Available Actions

#### Email Actions
- `send-email` - Send email notification
- `send-email-calendar` - Send email with calendar attachment

#### Ticket Actions
- `assign-ticket` - Assign ticket to user
- `add-tag` - Add tags to ticket
- `remove-tag` - Remove tags from ticket
- `update-priority` - Change ticket priority
- `update-status` - Change ticket status
- `add-comment` - Add automated comment

#### Notification Actions
- `notify-user` - Send in-app notification to user
- `notify-group` - Send in-app notification to group

#### Integration Actions
- `webhook` - Call external webhook
- `delay` - Wait before executing next action

## Usage

### Creating a Rule via Web UI

1. Navigate to **Settings > Notification Rules**
2. Click **Create New Rule**
3. Fill in basic information:
   - Name (required)
   - Description (optional)
   - Event Type (required)
   - Priority (1-1000, lower = higher priority)
   - Status (active/inactive)
4. Add conditions (optional):
   - Select field (e.g., ticket.priority.name)
   - Select operator (e.g., equals)
   - Enter value (e.g., High)
5. Add actions (at least one required):
   - Select action type
   - Configure action settings
6. Click **Save Rule**

### Creating a Rule via API

```javascript
POST /api/v2/notification-rules

{
  "name": "High Priority Ticket Alert",
  "description": "Send email when high priority ticket is created",
  "eventType": "ticket-created",
  "priority": 100,
  "isActive": true,
  "conditions": [
    {
      "field": "ticket.priority.name",
      "operator": "equals",
      "value": "High",
      "valueType": "string"
    }
  ],
  "actions": [
    {
      "type": "send-email",
      "emailConfig": {
        "templateType": "ticket-created",
        "recipients": "ticket-assignee"
      }
    }
  ]
}
```

### Example Rules

#### 1. Escalate Overdue Tickets

```javascript
{
  "name": "Escalate Overdue Tickets",
  "eventType": "ticket-sla-warning",
  "conditions": [
    {
      "field": "ticket.status.name",
      "operator": "not_equals",
      "value": "Closed"
    }
  ],
  "actions": [
    {
      "type": "update-priority",
      "ticketConfig": {
        "priorityId": "<high-priority-id>"
      }
    },
    {
      "type": "send-email-calendar",
      "emailConfig": {
        "templateType": "ticket-sla-warning",
        "recipients": "ticket-assignee",
        "includeCalendar": true,
        "calendarType": "sla"
      }
    }
  ]
}
```

#### 2. Auto-tag Tickets by Keyword

```javascript
{
  "name": "Tag Password Reset Tickets",
  "eventType": "ticket-created",
  "conditions": [
    {
      "field": "ticket.subject",
      "operator": "contains",
      "value": "password"
    }
  ],
  "actions": [
    {
      "type": "add-tag",
      "ticketConfig": {
        "tags": ["password-reset", "auto-tagged"]
      }
    }
  ]
}
```

#### 3. Notify External System

```javascript
{
  "name": "Send to External CRM",
  "eventType": "ticket-created",
  "conditions": [
    {
      "field": "ticket.priority.name",
      "operator": "equals",
      "value": "Critical"
    }
  ],
  "actions": [
    {
      "type": "webhook",
      "webhookConfig": {
        "url": "https://crm.example.com/api/tickets",
        "method": "POST",
        "headers": {
          "Authorization": "Bearer YOUR_TOKEN",
          "Content-Type": "application/json"
        }
      }
    }
  ]
}
```

#### 4. Multi-Condition Rule

```javascript
{
  "name": "VIP Customer High Priority Alert",
  "eventType": "ticket-created",
  "conditions": [
    {
      "field": "ticket.priority.name",
      "operator": "equals",
      "value": "High"
    },
    {
      "field": "ticket.tags",
      "operator": "contains",
      "value": "vip"
    }
  ],
  "actions": [
    {
      "type": "send-email",
      "emailConfig": {
        "templateType": "ticket-created",
        "recipients": "custom-emails",
        "customRecipients": ["manager@example.com", "support-lead@example.com"]
      }
    },
    {
      "type": "add-comment",
      "ticketConfig": {
        "comment": "⚠️ VIP customer ticket - prioritize response",
        "internalNote": true
      }
    }
  ]
}
```

## API Reference

### Endpoints

#### List Rules
```
GET /api/v2/notification-rules
Query Parameters:
  - isActive: true/false
  - eventType: string
  - createdBy: userId
```

#### Get Single Rule
```
GET /api/v2/notification-rules/:id
```

#### Create Rule
```
POST /api/v2/notification-rules
Body: Rule object (see schema below)
```

#### Update Rule
```
PUT /api/v2/notification-rules/:id
Body: Rule object
```

#### Delete Rule
```
DELETE /api/v2/notification-rules/:id
```

#### Toggle Rule Status
```
POST /api/v2/notification-rules/:id/toggle
```

#### Clone Rule
```
POST /api/v2/notification-rules/:id/clone
Body: { name: "New Rule Name" }
```

#### Test Rule
```
POST /api/v2/notification-rules/:id/test
Body: {
  context: {
    ticket: { ... },
    user: { ... }
  }
}
```

#### Validate Rule
```
POST /api/v2/notification-rules/validate
Body: Rule object
```

#### Get Configuration
```
GET /api/v2/notification-rules/config/fields
GET /api/v2/notification-rules/config/operators?fieldType=string
GET /api/v2/notification-rules/config/actions
GET /api/v2/notification-rules/config/event-types
```

#### Get Statistics
```
GET /api/v2/notification-rules/stats/summary
POST /api/v2/notification-rules/:id/reset-stats
```

### Rule Schema

```javascript
{
  name: String (required),
  description: String,
  isActive: Boolean (default: true),
  priority: Number (default: 100),
  eventType: String (required, enum),

  conditions: [{
    field: String (required),
    operator: String (required, enum),
    value: Mixed,
    valueType: String (enum: string, number, boolean, array, date)
  }],

  conditionGroups: [{
    operator: String (enum: AND, OR),
    conditions: [...]
  }],

  actions: [{
    type: String (required, enum),
    emailConfig: { ... },
    ticketConfig: { ... },
    webhookConfig: { ... },
    delayConfig: { ... }
  }],

  throttle: {
    enabled: Boolean,
    maxExecutions: Number,
    period: Number (minutes),
    perTicket: Boolean,
    perUser: Boolean
  },

  schedule: {
    enabled: Boolean,
    type: String (enum: daily, weekly, monthly, cron),
    time: String (HH:mm),
    dayOfWeek: Number (0-6),
    dayOfMonth: Number (1-31),
    cronExpression: String,
    timezone: String
  }
}
```

## Advanced Features

### Throttling

Prevent rule spam by limiting executions:

```javascript
{
  "throttle": {
    "enabled": true,
    "maxExecutions": 3,
    "period": 60,  // 60 minutes
    "perTicket": true  // Throttle per ticket
  }
}
```

### Condition Groups

Create complex logic with AND/OR groups:

```javascript
{
  "conditionGroups": [
    {
      "operator": "AND",
      "conditions": [
        { "field": "ticket.priority.name", "operator": "equals", "value": "High" },
        { "field": "ticket.status.name", "operator": "equals", "value": "Open" }
      ]
    },
    {
      "operator": "OR",
      "conditions": [
        { "field": "ticket.tags", "operator": "contains", "value": "urgent" },
        { "field": "ticket.tags", "operator": "contains", "value": "critical" }
      ]
    }
  ]
}
```

### Scheduling

Run rules on a schedule:

```javascript
{
  "eventType": "scheduled-daily",
  "schedule": {
    "enabled": true,
    "type": "daily",
    "time": "09:00",
    "timezone": "America/New_York"
  }
}
```

## Testing Rules

### Via Web UI
1. Open rule editor
2. Configure rule
3. Click **Test Rule** button
4. Review validation results

### Via API
```javascript
POST /api/v2/notification-rules/:id/test

{
  "context": {
    "ticket": {
      "uid": 12345,
      "subject": "Test Ticket",
      "priority": { "name": "High" },
      "status": { "name": "Open" },
      "owner": { "email": "user@example.com" }
    },
    "user": {
      "fullname": "John Doe",
      "email": "john@example.com"
    },
    "baseUrl": "https://helpdesk.example.com"
  }
}
```

Response:
```javascript
{
  "success": true,
  "test": {
    "ruleId": "...",
    "ruleName": "Test Rule",
    "conditionsMet": true,
    "conditions": [
      {
        "field": "ticket.priority.name",
        "operator": "equals",
        "expectedValue": "High",
        "actualValue": "High",
        "met": true
      }
    ],
    "actions": [
      {
        "type": "send-email",
        "config": { ... }
      }
    ]
  }
}
```

## Monitoring & Statistics

### View Statistics
```javascript
GET /api/v2/notification-rules/stats/summary

Response:
{
  "stats": [
    {
      "_id": "ticket-created",
      "totalRules": 5,
      "activeRules": 4,
      "totalExecutions": 1250,
      "successfulExecutions": 1200,
      "failedExecutions": 50
    }
  ]
}
```

### Rule Execution Tracking

Each rule tracks:
- Total executions
- Successful executions
- Failed executions
- Skipped executions (throttled)
- Average execution time
- Last execution date
- Last execution status

## Troubleshooting

### Rule Not Triggering

1. **Check if rule is active**
   ```
   GET /api/v2/notification-rules/:id
   ```
   Verify `isActive: true`

2. **Check conditions**
   ```
   POST /api/v2/notification-rules/:id/test
   ```
   Review which conditions are not met

3. **Check throttling**
   - Review `throttle` settings
   - Check `lastExecutedAt` timestamp

4. **Check event integration**
   - Verify events are being emitted
   - Check logs for errors

### Action Failures

1. **Check execution logs**
   - Review `lastExecutionStatus`
   - Check `lastExecutionError`

2. **Email actions**
   - Verify mailer is enabled
   - Check email template exists
   - Verify recipients are valid

3. **Webhook actions**
   - Check webhook URL is accessible
   - Verify authentication credentials
   - Check timeout settings

## Best Practices

### Performance

1. **Use specific conditions** - Narrow down when rules execute
2. **Set appropriate priorities** - Order rules logically
3. **Enable throttling** - Prevent excessive executions
4. **Monitor statistics** - Track rule performance

### Maintainability

1. **Use descriptive names** - Make rules easy to identify
2. **Add descriptions** - Document rule purpose
3. **Group related rules** - Use priority ranges
4. **Test before activating** - Verify rules work as expected

### Security

1. **Validate webhook URLs** - Only call trusted endpoints
2. **Use environment variables** - Store API keys securely
3. **Limit custom recipients** - Restrict who can receive emails
4. **Audit rule changes** - Track who creates/modifies rules

## Integration with Existing System

The notification rules system integrates seamlessly with:

- **Email Templates (Phase 1)** - Uses templates for email actions
- **Calendar Integration (Phase 2)** - Supports calendar attachments
- **Ticket System** - Responds to ticket events
- **Webhook System** - Can trigger external webhooks
- **Event Emitter** - Listens to system events

## Future Enhancements (Phase 4-6)

- **User Preferences** - Per-user notification settings
- **Multi-Provider Support** - SendGrid, Mailgun, etc.
- **Analytics Dashboard** - Visual rule performance metrics
- **Rule Templates** - Pre-built rule configurations
- **A/B Testing** - Test rule effectiveness
- **Machine Learning** - Suggest rules based on patterns

## Support

For issues or questions:
1. Check logs: `/logs/output.log`
2. Review statistics: `GET /api/v2/notification-rules/stats/summary`
3. Test rules: `POST /api/v2/notification-rules/:id/test`
4. Validate configuration: `POST /api/v2/notification-rules/validate`

---

**Version:** 1.0.0
**Last Updated:** 2025-11-27
**Phase:** 3 - Rules and Automation
