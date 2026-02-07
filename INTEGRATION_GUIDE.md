# Course Management System - Integration Guide

## Overview

Your Course Management System now includes a powerful integration system that allows automatic connections with external services, APIs, and third-party applications. This system enables real-time data synchronization, webhook notifications, and seamless workflow automation.

## Features

### 🔗 **Integration Types**
- **API Integrations**: Connect with REST APIs, send/receive data
- **Webhook Integrations**: Receive real-time notifications from external systems
- **Database Integrations**: Sync with external databases
- **File Integrations**: Exchange files with cloud storage services

### 🔐 **Authentication Support**
- API Key authentication
- Bearer token authentication
- Basic authentication
- OAuth 2.0
- No authentication (for public endpoints)

### ⚡ **Real-time Events**
- User registration/login events
- Module creation and updates
- Timetable changes
- Note uploads
- Lecturer assignments
- System errors and notifications
- Grade publications
- Assignment and test reminders

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

The integration system requires `axios` for HTTP requests, which is already included in your package.json.

### 2. Start the Server

```bash
npm start
```

The integration system will automatically initialize when the server starts.

### 3. Access Integration Management

Navigate to your admin panel and look for the "Integrations" section, or access the API directly:

```
GET /api/integrations
```

## API Endpoints

### Integration Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/integrations` | List all integrations |
| POST | `/api/integrations` | Create new integration |
| GET | `/api/integrations/:id` | Get integration details |
| PUT | `/api/integrations/:id` | Update integration |
| DELETE | `/api/integrations/:id` | Delete integration |
| POST | `/api/integrations/:id/activate` | Activate integration |
| POST | `/api/integrations/:id/deactivate` | Deactivate integration |
| POST | `/api/integrations/:id/test` | Test integration |
| GET | `/api/integrations/:id/logs` | Get integration logs |

### Webhook Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/integrations/:id/webhooks` | Add webhook to integration |
| POST | `/api/integrations/webhooks/trigger` | Manually trigger webhooks |
| POST | `/api/integrations/webhook/receive/:secret` | Receive webhooks |

### Templates and Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/integrations/templates` | Get integration templates |
| GET | `/api/integrations/health/status` | Get system health status |

## Integration Examples

### 1. Slack Notification Integration

Create a Slack integration to receive notifications about system events:

```json
{
  "name": "Slack Notifications",
  "type": "webhook",
  "authType": "none",
  "config": {
    "endpoint": "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK",
    "method": "POST"
  },
  "syncFrequency": 0
}
```

Add webhooks for specific events:
- `user.registered` - New student registration
- `module.created` - New module added
- `system.error` - System errors

### 2. Google Sheets Integration

Sync course data with Google Sheets:

```json
{
  "name": "Google Sheets Sync",
  "type": "api",
  "authType": "bearer",
  "config": {
    "endpoint": "https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    }
  },
  "authConfig": {
    "token": "YOUR_GOOGLE_ACCESS_TOKEN"
  },
  "syncFrequency": 3600
}
```

### 3. Custom API Integration

Connect with your institution's student information system:

```json
{
  "name": "Student Information System",
  "type": "api",
  "authType": "api_key",
  "config": {
    "endpoint": "https://sis.yourinstitution.edu/api/students",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    }
  },
  "authConfig": {
    "header": "X-API-Key",
    "key": "your-api-key-here"
  },
  "syncFrequency": 1800
}
```

## Event Types

The integration system automatically triggers events for various system activities:

### User Events
- `user.registered` - New user registration
- `user.login` - User login activity

### Academic Events
- `module.created` - New module created
- `module.updated` - Module information updated
- `timetable.created` - New test/exam scheduled
- `timetable.updated` - Test/exam details changed
- `note.uploaded` - New study material uploaded
- `lecturer.assigned` - Lecturer assigned to module
- `grade.published` - Grades published to students

### System Events
- `system.error` - System errors and exceptions
- `settings.updated` - System settings changed
- `test.reminder` - Test reminders (automated)
- `assignment.reminder` - Assignment deadline reminders

## Webhook Payload Format

All webhook payloads follow this standard format:

```json
{
  "event": "event.type",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    // Event-specific data
  }
}
```

Example payload for user registration:

```json
{
  "event": "user.registered",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "userId": 123,
    "email": "student@example.com",
    "name": "John Doe",
    "studentId": "IT2024001",
    "registrationDate": "2024-01-15T10:30:00.000Z"
  }
}
```

## Security Considerations

### Authentication
- All integration management endpoints require admin authentication
- Use the `x-admin-secret` header for API access
- Store sensitive credentials securely in the database

### Webhook Security
- Webhook URLs should use HTTPS
- Implement secret key validation for incoming webhooks
- Verify webhook signatures when provided by external services

### Rate Limiting
- Monitor API usage to avoid rate limits
- Implement retry logic for failed requests
- Use appropriate sync frequencies

## Troubleshooting

### Common Issues

1. **Integration Not Working**
   - Check integration status in the admin panel
   - Review integration logs for error messages
   - Verify authentication credentials
   - Test the integration manually

2. **Webhook Not Receiving Data**
   - Verify webhook URL is accessible
   - Check if webhook is active
   - Review webhook logs
   - Test webhook manually

3. **Authentication Failures**
   - Verify API keys and tokens are correct
   - Check token expiration dates
   - Ensure proper authentication type is selected

### Monitoring

Use the health check endpoint to monitor system status:

```bash
curl -H "x-admin-secret: your-secret" \
     https://your-domain.com/api/integrations/health/status
```

## Best Practices

1. **Start Simple**: Begin with basic webhook integrations before moving to complex API sync
2. **Test Thoroughly**: Always test integrations before activating them in production
3. **Monitor Logs**: Regularly check integration logs for issues
4. **Secure Credentials**: Never expose API keys or tokens in frontend code
5. **Handle Errors**: Implement proper error handling in your integration logic
6. **Document Integrations**: Keep records of all external integrations and their purposes

## Support

For integration issues or questions:

1. Check the integration logs for detailed error information
2. Review the API documentation for specific endpoints
3. Test integrations using the built-in test functionality
4. Monitor system health using the health check endpoint

## Advanced Usage

### Custom Event Triggers

You can trigger custom events from your application code:

```javascript
// In your route handlers
const integrationEvents = require('../middleware/integrationEvents');
const events = new integrationEvents(integrationManager);

// Trigger custom event
await events.onCustomEvent({
    type: 'custom.event',
    data: {
        // Your custom data
    }
});
```

### Batch Processing

For large data sets, consider using batch processing:

```json
{
  "name": "Batch Data Sync",
  "type": "api",
  "config": {
    "endpoint": "https://api.example.com/batch",
    "method": "POST",
    "batchSize": 100,
    "batchDelay": 1000
  }
}
```

### Conditional Webhooks

Configure webhooks to trigger only under specific conditions:

```javascript
// In your integration logic
if (data.priority === 'high') {
    await integrationManager.triggerWebhooks('urgent.notification', data);
}
```

This integration system provides a robust foundation for connecting your Course Management System with external services, enabling automation and real-time data synchronization across your educational ecosystem.
