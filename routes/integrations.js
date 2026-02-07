const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');

// Integration manager will be injected from server.js
let integrationManager;

// Initialize integration manager
const initIntegrationManager = (manager) => {
    integrationManager = manager;
};

// Middleware to check if integration manager is available
const checkIntegrationManager = (req, res, next) => {
    if (!integrationManager) {
        return res.status(503).json({
            success: false,
            error: 'Integration service not available'
        });
    }
    next();
};

// Get all integrations
router.get('/', adminAuth, async (req, res) => {
    try {
        const result = await integrationManager.getAllIntegrations();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get integration by ID
router.get('/:id', adminAuth, async (req, res) => {
    try {
        const integrationId = parseInt(req.params.id);
        const result = await integrationManager.getIntegrationStatus(integrationId);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Register new integration
router.post('/', adminAuth, async (req, res) => {
    try {
        const integrationData = {
            name: req.body.name,
            type: req.body.type,
            config: req.body.config,
            authType: req.body.authType || 'none',
            authConfig: req.body.authConfig || {},
            syncFrequency: req.body.syncFrequency || 3600
        };

        // Validate required fields
        if (!integrationData.name || !integrationData.type || !integrationData.config) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, type, config'
            });
        }

        // Validate integration type
        const validTypes = ['api', 'webhook', 'database', 'file'];
        if (!validTypes.includes(integrationData.type)) {
            return res.status(400).json({
                success: false,
                error: `Invalid integration type. Must be one of: ${validTypes.join(', ')}`
            });
        }

        // Validate auth type
        const validAuthTypes = ['none', 'api_key', 'bearer', 'basic', 'oauth'];
        if (!validAuthTypes.includes(integrationData.authType)) {
            return res.status(400).json({
                success: false,
                error: `Invalid auth type. Must be one of: ${validAuthTypes.join(', ')}`
            });
        }

        const result = await integrationManager.registerIntegration(integrationData);
        res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Activate integration
router.post('/:id/activate', adminAuth, async (req, res) => {
    try {
        const integrationId = parseInt(req.params.id);
        const result = await integrationManager.activateIntegration(integrationId);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Deactivate integration
router.post('/:id/deactivate', adminAuth, async (req, res) => {
    try {
        const integrationId = parseInt(req.params.id);
        const result = await integrationManager.deactivateIntegration(integrationId);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Test integration
router.post('/:id/test', adminAuth, async (req, res) => {
    try {
        const integrationId = parseInt(req.params.id);
        const testData = req.body.testData || { message: 'Test connection' };
        
        const result = await integrationManager.sendToAPI(integrationId, testData);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Send data to integration
router.post('/:id/send', adminAuth, async (req, res) => {
    try {
        const integrationId = parseInt(req.params.id);
        const data = req.body.data;
        const endpoint = req.body.endpoint;
        
        if (!data) {
            return res.status(400).json({
                success: false,
                error: 'Data is required'
            });
        }

        const result = await integrationManager.sendToAPI(integrationId, data, endpoint);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Trigger webhooks manually
router.post('/webhooks/trigger', adminAuth, async (req, res) => {
    try {
        const eventType = req.body.eventType;
        const data = req.body.data;
        
        if (!eventType || !data) {
            return res.status(400).json({
                success: false,
                error: 'Event type and data are required'
            });
        }

        const result = await integrationManager.triggerWebhooks(eventType, data);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get integration logs
router.get('/:id/logs', adminAuth, async (req, res) => {
    try {
        const integrationId = parseInt(req.params.id);
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        
        const [logs] = await integrationManager.db.query(
            'SELECT * FROM integration_logs WHERE integration_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?',
            [integrationId, limit, offset]
        );
        
        res.json({
            success: true,
            logs,
            pagination: {
                limit,
                offset,
                total: logs.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Add webhook to integration
router.post('/:id/webhooks', adminAuth, async (req, res) => {
    try {
        const integrationId = parseInt(req.params.id);
        const { eventType, endpointUrl, secretKey } = req.body;
        
        if (!eventType || !endpointUrl) {
            return res.status(400).json({
                success: false,
                error: 'Event type and endpoint URL are required'
            });
        }

        // Validate URL
        try {
            new URL(endpointUrl);
        } catch {
            return res.status(400).json({
                success: false,
                error: 'Invalid endpoint URL'
            });
        }

        const [result] = await integrationManager.db.query(
            'INSERT INTO webhooks (integration_id, event_type, endpoint_url, secret_key) VALUES (?, ?, ?, ?)',
            [integrationId, eventType, endpointUrl, secretKey || null]
        );

        // Reload webhooks for this integration
        await integrationManager.loadWebhooksForIntegration(integrationId);

        res.status(201).json({
            success: true,
            webhookId: result.insertId,
            message: 'Webhook added successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get integration health status
router.get('/health/status', adminAuth, async (req, res) => {
    try {
        const integrations = integrationManager.activeIntegrations;
        const totalIntegrations = integrations.size;
        const activeIntegrations = Array.from(integrations.values()).filter(i => i.status === 'active').length;
        
        // Get recent logs for health check
        const [recentLogs] = await integrationManager.db.query(
            'SELECT status, COUNT(*) as count FROM integration_logs WHERE timestamp > DATE_SUB(NOW(), INTERVAL 1 HOUR) GROUP BY status'
        );

        const healthStats = {
            totalIntegrations,
            activeIntegrations,
            inactiveIntegrations: totalIntegrations - activeIntegrations,
            recentActivity: recentLogs.reduce((acc, log) => {
                acc[log.status] = log.count;
                return acc;
            }, {}),
            timestamp: new Date().toISOString()
        };

        res.json({
            success: true,
            health: healthStats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Public webhook endpoint for receiving data
router.post('/webhook/receive/:secret', checkIntegrationManager, async (req, res) => {
    try {
        const secret = req.params.secret;
        const data = req.body;
        
        // Verify webhook secret (you should implement proper secret validation)
        const [webhooks] = await integrationManager.db.query(
            'SELECT * FROM webhooks WHERE secret_key = ? AND active = TRUE',
            [secret]
        );

        if (webhooks.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid webhook secret'
            });
        }

        // Process incoming webhook data
        await integrationManager.logIntegrationEvent(
            webhooks[0].integration_id,
            'incoming',
            'webhook_receive',
            'success',
            data,
            { received: true }
        );

        // Trigger any internal events based on webhook data
        // This is where you would implement custom logic based on the webhook payload

        res.json({
            success: true,
            message: 'Webhook received successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Integration templates for common services
router.get('/templates', adminAuth, async (req, res) => {
    try {
        const templates = {
            slack: {
                name: 'Slack Integration',
                type: 'webhook',
                authType: 'none',
                config: {
                    endpoint: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',
                    method: 'POST'
                },
                description: 'Send notifications to Slack channels'
            },
            discord: {
                name: 'Discord Integration',
                type: 'webhook',
                authType: 'none',
                config: {
                    endpoint: 'https://discord.com/api/webhooks/YOUR/DISCORD/WEBHOOK',
                    method: 'POST'
                },
                description: 'Send notifications to Discord channels'
            },
            google_sheets: {
                name: 'Google Sheets API',
                type: 'api',
                authType: 'bearer',
                config: {
                    endpoint: 'https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}',
                    method: 'POST'
                },
                authConfig: {
                    token: 'YOUR_GOOGLE_ACCESS_TOKEN'
                },
                description: 'Sync data with Google Sheets'
            },
            zapier: {
                name: 'Zapier Integration',
                type: 'webhook',
                authType: 'none',
                config: {
                    endpoint: 'https://hooks.zapier.com/hooks/catch/YOUR/ZAPIER/ID/',
                    method: 'POST'
                },
                description: 'Connect with 5000+ apps via Zapier'
            },
            custom_api: {
                name: 'Custom REST API',
                type: 'api',
                authType: 'api_key',
                config: {
                    endpoint: 'https://your-api.com/endpoint',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                },
                authConfig: {
                    header: 'X-API-Key',
                    key: 'YOUR_API_KEY'
                },
                description: 'Connect with any REST API'
            }
        };

        res.json({
            success: true,
            templates
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = {
    router,
    initIntegrationManager
};
