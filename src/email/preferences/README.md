# User Notification Preferences - Phase 4 Documentation

## Overview

The User Notification Preferences system provides granular control over how and when users receive notifications. Users can customize their notification experience through channels, event types, schedules, and filters.

## Features

### Core Components

1. **User Preferences Model** - Individual user notification settings
2. **Preferences Manager** - Business logic for filtering and managing preferences
3. **Digest Queue** - Queue system for batched notifications
4. **Digest Scheduler** - Automated digest delivery
5. **REST API** - Complete CRUD operations for preferences
6. **Web Interface** - User-friendly preferences management

### Notification Channels

- **Email** - with frequency control (immediate, hourly, daily, weekly digests)
- **In-App** - browser notifications with sound/desktop alerts
- **SMS** - for urgent notifications only (optional)
- **Push** - mobile push notifications

### User Controls

1. **Global Settings**
   - Enable/disable all notifications
   - Do Not Disturb mode

2. **Channel Preferences**
   - Enable/disable per channel
   - Frequency control for email (immediate vs digest)
   - Sound/desktop notification toggles

3. **Event Preferences**
   - Choose which events trigger notifications
   - Context-specific filters (only if assigned, only if owner, etc.)

4. **Priority Filters**
   - Minimum priority threshold
   - Only receive High/Critical notifications

5. **Group & Tag Filters**
   - Include/exclude specific groups
   - Include/exclude specific tags

6. **Quiet Hours**
   - Define time periods to pause notifications
   - Option to allow urgent notifications during quiet hours

7. **Out of Office**
   - Set OOO date range
   - Auto-responder message
   - Forward notifications to colleague

8. **Digest Settings**
   - Max items per digest
   - Sort order (date, priority, ticket)
   - Group by ticket option

9. **Batching**
   - Group multiple notifications
   - Configurable batch window

## Usage

### Accessing Preferences

**Web Interface:**
- Navigate to `/settings/notification-preferences`
- Or access from user profile menu

**API:**
```javascript
GET /api/v2/notification-preferences/me
```

### Example Configurations

#### 1. Daily Digest Only

```javascript
{
  "channels": {
    "email": {
      "enabled": true,
      "frequency": "digest-daily",
      "digestTime": "09:00"
    },
    "inApp": {
      "enabled": true
    }
  }
}
```

#### 2. Urgent Only

```javascript
{
  "globalEnabled": true,
  "priorityFilter": {
    "enabled": true,
    "minimumPriority": "High"
  },
  "channels": {
    "email": {
      "enabled": true,
      "frequency": "immediate"
    },
    "sms": {
      "enabled": true,
      "onlyUrgent": true
    }
  }
}
```

#### 3. Work Hours Only

```javascript
{
  "quietHours": {
    "enabled": true,
    "startTime": "18:00",
    "endTime": "08:00",
    "timezone": "America/New_York",
    "allowUrgent": true
  }
}
```

#### 4. Selective Events

```javascript
{
  "eventPreferences": {
    "ticketAssigned": {
      "enabled": true,
      "onlyIfMe": true
    },
    "commentAdded": {
      "enabled": true,
      "onlyIfParticipating": true,
      "excludeOwnComments": true
    },
    "slaWarning": {
      "enabled": true,
      "onlyIfAssigned": true
    }
  }
}
```

#### 5. Out of Office

```javascript
{
  "outOfOffice": {
    "enabled": true,
    "startDate": "2025-12-20T00:00:00Z",
    "endDate": "2025-12-31T23:59:59Z",
    "autoResponder": true,
    "autoResponderMessage": "I'm out of office until Dec 31. For urgent matters, contact support@example.com",
    "forwardTo": "colleague-user-id"
  }
}
```

## API Reference

### Endpoints

#### Get My Preferences
```
GET /api/v2/notification-preferences/me
```

**Response:**
```javascript
{
  "success": true,
  "preferences": {
    "userId": "...",
    "globalEnabled": true,
    "doNotDisturb": false,
    "channels": { ... },
    "eventPreferences": { ... },
    "quietHours": { ... },
    "stats": {
      "totalNotificationsSent": 1250,
      "totalNotificationsSkipped": 45,
      "lastNotificationSent": "2025-11-28T10:30:00Z"
    }
  }
}
```

#### Update My Preferences
```
PUT /api/v2/notification-preferences/me
Content-Type: application/json

{
  "channels": {
    "email": {
      "frequency": "digest-daily"
    }
  }
}
```

#### Reset to Defaults
```
POST /api/v2/notification-preferences/me/reset
```

#### Toggle Do Not Disturb
```
POST /api/v2/users/:userId/notification-preferences/dnd
Content-Type: application/json

{
  "enabled": true
}
```

#### Set Out of Office
```
POST /api/v2/users/:userId/notification-preferences/ooo
Content-Type: application/json

{
  "enabled": true,
  "startDate": "2025-12-20",
  "endDate": "2025-12-31",
  "autoResponder": true,
  "autoResponderMessage": "Out of office..."
}
```

#### Test Preferences
```
POST /api/v2/notification-preferences/test
Content-Type: application/json

{
  "eventType": "ticket-assigned",
  "context": {
    "isUrgent": false,
    "ticket": {
      "priority": { "name": "High" }
    }
  }
}
```

**Response:**
```javascript
{
  "success": true,
  "shouldReceive": true,
  "channels": ["email", "inApp"],
  "message": "You would receive this notification via: email, inApp"
}
```

#### Get Statistics
```
GET /api/v2/users/:userId/notification-preferences/stats
```

#### Export Preferences
```
GET /api/v2/users/:userId/notification-preferences/export
```

Downloads JSON file with all preferences.

#### Import Preferences
```
POST /api/v2/users/:userId/notification-preferences/import
Content-Type: application/json

{... preferences JSON ...}
```

## Digest System

### How It Works

1. **Queueing**: When user has digest frequency enabled, notifications are queued instead of sent immediately
2. **Scheduling**: Cron jobs run at configured times (hourly, daily, weekly)
3. **Aggregation**: Queued notifications are grouped by ticket (optional)
4. **Delivery**: Single digest email sent with all queued notifications
5. **Cleanup**: Processed items cleaned up after 30 days

### Digest Schedule

- **Hourly**: Every hour at :00 minutes
- **Daily**: Every day at 9:00 AM (user time)
- **Weekly**: Every Monday at 9:00 AM (user time)

### Manual Digest Trigger

Administrators can manually trigger digests:

```javascript
var digestScheduler = require('./src/email/digest/scheduler')

digestScheduler.triggerDigestForUser(userId, function(err, result) {
  if (!err) {
    console.log('Digest sent')
  }
})
```

## Integration with Rules Engine

The preferences system is integrated with the notification rules engine (Phase 3). When a rule sends an email notification:

1. **Recipients Resolved**: Rule determines initial recipients
2. **Preferences Checked**: Each recipient's preferences are checked
3. **Filtering Applied**: Recipients are filtered based on:
   - Global enabled status
   - Do Not Disturb mode
   - Event type preferences
   - Priority filters
   - Group/tag filters
   - Quiet hours
   - Out of office status
4. **Frequency Honored**:
   - Immediate: Email sent right away
   - Digest: Added to queue for later delivery
5. **Stats Updated**: Notification counters incremented

### Code Example

```javascript
// In src/email/rules/actions.js
preferencesManager.filterRecipients(recipients, eventType, context, function(err, filteredRecipients) {
  if (!filteredRecipients || filteredRecipients.length === 0) {
    // All recipients filtered out
    return callback(null, { recipientsFiltered: true })
  }

  // Send to filtered recipients
  emailModule.sendTemplateEmail({
    to: filteredRecipients,
    templateType: emailConfig.templateType,
    data: templateData
  }, callback)
})
```

## Preference Hierarchy

When determining if a notification should be sent, checks are performed in this order:

1. **Global Enabled** - If false, skip all notifications
2. **Do Not Disturb** - If true, skip all notifications (unless urgent)
3. **Out of Office** - If active, skip or forward
4. **Quiet Hours** - If in quiet period, skip (unless urgent allowed)
5. **Event Enabled** - Check if this event type is enabled
6. **Priority Filter** - Check if priority meets minimum
7. **Group Filter** - Check if ticket group is allowed
8. **Tag Filter** - Check if ticket tags are allowed
9. **Context Filters** - Apply event-specific filters (onlyIfAssigned, etc.)
10. **Channel Check** - Determine which channels to use
11. **Frequency Check** - Immediate or queue for digest

## Database Schema

### UserNotificationPreferences

```javascript
{
  userId: ObjectId (ref: 'accounts'),
  globalEnabled: Boolean,
  doNotDisturb: Boolean,

  channels: {
    email: {
      enabled: Boolean,
      frequency: String (immediate | digest-hourly | digest-daily | digest-weekly),
      digestTime: String (HH:mm)
    },
    inApp: {
      enabled: Boolean,
      playSound: Boolean,
      showDesktopNotification: Boolean
    },
    sms: {
      enabled: Boolean,
      phoneNumber: String,
      onlyUrgent: Boolean
    },
    push: {
      enabled: Boolean,
      onlyUrgent: Boolean
    }
  },

  eventPreferences: {
    ticketCreated: {
      enabled: Boolean,
      channels: [String],
      onlyIfAssigned: Boolean,
      onlyIfOwner: Boolean
    },
    // ... other events
  },

  priorityFilter: {
    enabled: Boolean,
    minimumPriority: String (Low | Normal | High | Critical)
  },

  groupFilter: {
    enabled: Boolean,
    includedGroups: [ObjectId],
    excludedGroups: [ObjectId]
  },

  tagFilter: {
    enabled: Boolean,
    includedTags: [String],
    excludedTags: [String]
  },

  quietHours: {
    enabled: Boolean,
    startTime: String (HH:mm),
    endTime: String (HH:mm),
    timezone: String,
    allowUrgent: Boolean
  },

  outOfOffice: {
    enabled: Boolean,
    startDate: Date,
    endDate: Date,
    autoResponder: Boolean,
    autoResponderMessage: String,
    forwardTo: ObjectId (ref: 'accounts')
  },

  digestSettings: {
    maxItemsPerDigest: Number,
    groupByTicket: Boolean,
    includeResolved: Boolean,
    sortBy: String (date | priority | ticket)
  },

  batching: {
    enabled: Boolean,
    windowMinutes: Number,
    maxBatchSize: Number
  },

  stats: {
    totalNotificationsSent: Number,
    totalNotificationsSkipped: Number,
    lastNotificationSent: Date,
    lastDigestSent: Date
  }
}
```

### DigestQueue

```javascript
{
  userId: ObjectId (ref: 'accounts'),
  eventType: String,
  data: Mixed,
  ticket: ObjectId (ref: 'tickets'),
  priority: String,
  processed: Boolean,
  processedAt: Date,
  createdAt: Date
}
```

## Best Practices

### For Users

1. **Start Simple** - Enable only essential notifications
2. **Use Digests** - Reduce email overload with daily/weekly digests
3. **Set Quiet Hours** - Maintain work-life balance
4. **Filter by Priority** - Focus on what matters most
5. **Test Changes** - Use the test button to verify preferences
6. **Export Backups** - Save your preferences configuration

### For Administrators

1. **Educate Users** - Provide guidance on preference options
2. **Monitor Digest Performance** - Check digest delivery rates
3. **Clean Up Old Data** - Regularly purge processed digest items
4. **Set Reasonable Defaults** - Configure sensible system defaults
5. **Respect Preferences** - Always honor user settings in custom code

### For Developers

1. **Always Filter** - Use preferencesManager.filterRecipients() for all notifications
2. **Provide Context** - Include full context for proper filtering
3. **Handle Digests** - Queue notifications for digest users
4. **Update Stats** - Increment counters after sending
5. **Test Thoroughly** - Verify preferences work for all scenarios

## Troubleshooting

### User Not Receiving Notifications

1. **Check Global Enabled**
   ```
   GET /api/v2/notification-preferences/me
   ```
   Verify `globalEnabled: true`

2. **Check Do Not Disturb**
   ```
   Verify doNotDisturb: false
   ```

3. **Check Event Preferences**
   ```
   Verify eventPreferences.{eventType}.enabled: true
   ```

4. **Check Quiet Hours**
   - Verify current time is outside quiet hours
   - Or urgent notification allowed

5. **Check Email Frequency**
   - If digest, check digest queue
   - Wait for scheduled digest time

6. **Check Filters**
   - Priority filter
   - Group filter
   - Tag filter

### Digests Not Sending

1. **Check Scheduler**
   ```javascript
   // Verify cron jobs are running
   digestScheduler.init()
   ```

2. **Check Queue**
   ```javascript
   DigestQueue.getPendingForUser(userId, callback)
   ```

3. **Check User Frequency**
   ```javascript
   UserNotificationPreferences.getUsersForDigest('digest-daily', callback)
   ```

4. **Manual Trigger**
   ```javascript
   digestScheduler.triggerDigestForUser(userId, callback)
   ```

### High Skip Rate

If `totalNotificationsSkipped` is very high:

1. **Review Filters** - Filters may be too restrictive
2. **Check Quiet Hours** - Too broad time window
3. **Event Preferences** - Too many events disabled
4. **Priority Filter** - Threshold too high

## Performance Considerations

1. **Digest Queue Growth** - Monitor queue size, implement cleanup
2. **Preference Lookups** - Cached preferences for frequent checks
3. **Filter Complexity** - Keep filter logic efficient
4. **Batch Processing** - Process digests in batches to avoid memory issues
5. **Database Indexes** - Ensure proper indexing on userId, processed, createdAt

## Future Enhancements

Potential improvements for future phases:

1. **Smart Digests** - ML-based notification prioritization
2. **Notification Preview** - Preview digest before sending
3. **A/B Testing** - Test different digest formats
4. **Mobile App Integration** - Native mobile app preferences
5. **Slack/Teams Integration** - Additional notification channels
6. **Advanced Scheduling** - Custom cron expressions
7. **Notification Templates** - Customizable digest templates
8. **Analytics Dashboard** - Visualize notification patterns
9. **Recommendation Engine** - Suggest optimal preferences
10. **Bulk Import/Export** - Team-wide preference management

---

**Version:** 1.0.0
**Last Updated:** 2025-11-28
**Phase:** 4 - User Preferences
