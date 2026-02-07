const mysql = require('mysql2/promise');
const crypto = require('crypto');
const axios = require('axios');

class IntegrationManager {
    constructor(database) {
        this.db = database;
        this.activeIntegrations = new Map();
        this.webhookEndpoints = new Map();
    }

    // Initialize integration system
    async initialize() {
        try {
            // Create integrations table if not exists
            await this.createIntegrationsTable();
            await this.createWebhooksTable();
            await this.createIntegrationLogsTable();
            
            // Load active integrations
            await this.loadActiveIntegrations();
            
            console.log('🔗 Integration Manager initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Integration Manager:', error);
            return false;
        }
    }

    // Create database tables for integrations
    async createIntegrationsTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS integrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                type ENUM('api', 'webhook', 'database', 'file') NOT NULL,
                config JSON NOT NULL,
                status ENUM('active', 'inactive', 'error') DEFAULT 'inactive',
                auth_type ENUM('none', 'api_key', 'bearer', 'basic', 'oauth') DEFAULT 'none',
                auth_config JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                last_sync TIMESTAMP NULL,
                sync_frequency INT DEFAULT 3600
            )
        `;
        
        await this.db.query(query);
    }

    async createWebhooksTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS webhooks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                integration_id INT NOT NULL,
                event_type VARCHAR(255) NOT NULL,
                endpoint_url VARCHAR(500) NOT NULL,
                secret_key VARCHAR(255),
                active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (integration_id) REFERENCES integrations(id) ON DELETE CASCADE
            )
        `;
        
        await this.db.query(query);
    }

    async createIntegrationLogsTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS integration_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                integration_id INT NOT NULL,
                event_type VARCHAR(255) NOT NULL,
                direction ENUM('outgoing', 'incoming') NOT NULL,
                status ENUM('success', 'error', 'pending') NOT NULL,
                request_data JSON,
                response_data JSON,
                error_message TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (integration_id) REFERENCES integrations(id) ON DELETE CASCADE
            )
        `;
        
        await this.db.query(query);
    }

    // Load active integrations from database
    async loadActiveIntegrations() {
        try {
            const [rows] = await this.db.query(
                'SELECT * FROM integrations WHERE status = "active"'
            );
            
            for (const integration of rows) {
                this.activeIntegrations.set(integration.id, integration);
                
                // Load webhooks for this integration
                await this.loadWebhooksForIntegration(integration.id);
                
                // Start periodic sync if configured
                if (integration.sync_frequency && integration.sync_frequency > 0) {
                    this.startPeriodicSync(integration);
                }
            }
            
            console.log(`📡 Loaded ${rows.length} active integrations`);
        } catch (error) {
            console.error('❌ Error loading active integrations:', error);
        }
    }

    // Load webhooks for a specific integration
    async loadWebhooksForIntegration(integrationId) {
        try {
            const [rows] = await this.db.query(
                'SELECT * FROM webhooks WHERE integration_id = ? AND active = TRUE',
                [integrationId]
            );
            
            this.webhookEndpoints.set(integrationId, rows);
        } catch (error) {
            console.error(`❌ Error loading webhooks for integration ${integrationId}:`, error);
        }
    }

    // Register a new integration
    async registerIntegration(integrationData) {
        try {
            const {
                name,
                type,
                config,
                authType = 'none',
                authConfig = {},
                syncFrequency = 3600
            } = integrationData;

            const [result] = await this.db.query(
                `INSERT INTO integrations (name, type, config, auth_type, auth_config, sync_frequency)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [name, type, JSON.stringify(config), authType, JSON.stringify(authConfig), syncFrequency]
            );

            const integrationId = result.insertId;
            
            // Load the newly created integration
            const [integration] = await this.db.query(
                'SELECT * FROM integrations WHERE id = ?',
                [integrationId]
            );

            this.activeIntegrations.set(integrationId, integration[0]);
            
            console.log(`✅ Integration "${name}" registered successfully with ID: ${integrationId}`);
            return { success: true, integrationId, message: 'Integration registered successfully' };
        } catch (error) {
            console.error('❌ Error registering integration:', error);
            return { success: false, error: error.message };
        }
    }

    // Activate an integration
    async activateIntegration(integrationId) {
        try {
            await this.db.query(
                'UPDATE integrations SET status = "active" WHERE id = ?',
                [integrationId]
            );

            const [integration] = await this.db.query(
                'SELECT * FROM integrations WHERE id = ?',
                [integrationId]
            );

            if (integration.length > 0) {
                this.activeIntegrations.set(integrationId, integration[0]);
                await this.loadWebhooksForIntegration(integrationId);
                
                if (integration[0].sync_frequency > 0) {
                    this.startPeriodicSync(integration[0]);
                }
            }

            console.log(`✅ Integration ${integrationId} activated`);
            return { success: true, message: 'Integration activated successfully' };
        } catch (error) {
            console.error(`❌ Error activating integration ${integrationId}:`, error);
            return { success: false, error: error.message };
        }
    }

    // Deactivate an integration
    async deactivateIntegration(integrationId) {
        try {
            await this.db.query(
                'UPDATE integrations SET status = "inactive" WHERE id = ?',
                [integrationId]
            );

            this.activeIntegrations.delete(integrationId);
            this.webhookEndpoints.delete(integrationId);

            console.log(`⏸️ Integration ${integrationId} deactivated`);
            return { success: true, message: 'Integration deactivated successfully' };
        } catch (error) {
            console.error(`❌ Error deactivating integration ${integrationId}:`, error);
            return { success: false, error: error.message };
        }
    }

    // Send data to external API
    async sendToAPI(integrationId, data, endpoint = null) {
        try {
            const integration = this.activeIntegrations.get(integrationId);
            if (!integration) {
                throw new Error(`Integration ${integrationId} not found or inactive`);
            }

            const config = JSON.parse(integration.config);
            const authConfig = JSON.parse(integration.auth_config);
            
            let axiosConfig = {
                method: config.method || 'POST',
                url: endpoint || config.endpoint,
                data: data,
                headers: {
                    'Content-Type': 'application/json',
                    ...config.headers
                },
                timeout: config.timeout || 30000
            };

            // Add authentication
            if (integration.auth_type !== 'none') {
                axiosConfig = this.addAuthentication(axiosConfig, integration.auth_type, authConfig);
            }

            const response = await axios(axiosConfig);

            // Log successful request
            await this.logIntegrationEvent(integrationId, 'outgoing', 'api_call', 'success', data, response.data);

            console.log(`📤 API call successful for integration ${integrationId}`);
            return { success: true, data: response.data, status: response.status };

        } catch (error) {
            // Log failed request
            await this.logIntegrationEvent(integrationId, 'outgoing', 'api_call', 'error', data, null, error.message);
            
            console.error(`❌ API call failed for integration ${integrationId}:`, error.message);
            return { success: false, error: error.message };
        }
    }

    // Add authentication to request
    addAuthentication(axiosConfig, authType, authConfig) {
        switch (authType) {
            case 'api_key':
                axiosConfig.headers[authConfig.header || 'X-API-Key'] = authConfig.key;
                break;
            case 'bearer':
                axiosConfig.headers.Authorization = `Bearer ${authConfig.token}`;
                break;
            case 'basic':
                axiosConfig.auth = {
                    username: authConfig.username,
                    password: authConfig.password
                };
                break;
            case 'oauth':
                axiosConfig.headers.Authorization = `Bearer ${authConfig.access_token}`;
                break;
        }
        return axiosConfig;
    }

    // Trigger webhooks for an event
    async triggerWebhooks(eventType, data) {
        const promises = [];

        for (const [integrationId, webhooks] of this.webhookEndpoints) {
            for (const webhook of webhooks) {
                if (webhook.event_type === eventType || webhook.event_type === '*') {
                    promises.push(this.sendWebhook(webhook, data));
                }
            }
        }

        try {
            const results = await Promise.allSettled(promises);
            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;

            console.log(`🪝 Webhooks triggered: ${successful} successful, ${failed} failed`);
            return { successful, failed, total: promises.length };
        } catch (error) {
            console.error('❌ Error triggering webhooks:', error);
            return { successful: 0, failed: promises.length, total: promises.length };
        }
    }

    // Send webhook
    async sendWebhook(webhook, data) {
        try {
            const payload = {
                event: webhook.event_type,
                timestamp: new Date().toISOString(),
                data: data
            };

            const signature = this.generateWebhookSignature(JSON.stringify(payload), webhook.secret_key);

            const response = await axios.post(webhook.endpoint_url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Webhook-Signature': signature,
                    'User-Agent': 'CourseManagementSystem/1.0'
                },
                timeout: 30000
            });

            await this.logIntegrationEvent(webhook.integration_id, 'outgoing', 'webhook', 'success', payload, response.data);
            return { success: true, status: response.status };

        } catch (error) {
            await this.logIntegrationEvent(webhook.integration_id, 'outgoing', 'webhook', 'error', data, null, error.message);
            throw error;
        }
    }

    // Generate webhook signature
    generateWebhookSignature(payload, secret) {
        if (!secret) return '';
        return crypto.createHmac('sha256', secret).update(payload).digest('hex');
    }

    // Start periodic sync for an integration
    startPeriodicSync(integration) {
        const syncInterval = setInterval(async () => {
            try {
                await this.performSync(integration);
            } catch (error) {
                console.error(`❌ Sync failed for integration ${integration.id}:`, error);
            }
        }, integration.sync_frequency * 1000);

        // Store interval reference for cleanup
        integration.syncInterval = syncInterval;
    }

    // Perform sync for an integration
    async performSync(integration) {
        try {
            const config = JSON.parse(integration.config);
            
            if (integration.type === 'api' && config.syncEndpoint) {
                const response = await axios.get(config.syncEndpoint, {
                    headers: config.headers || {},
                    timeout: 30000
                });

                await this.processSyncData(integration.id, response.data);
                await this.updateLastSync(integration.id);
                
                console.log(`🔄 Sync completed for integration ${integration.id}`);
            }
        } catch (error) {
            console.error(`❌ Sync error for integration ${integration.id}:`, error);
            await this.logIntegrationEvent(integration.id, 'outgoing', 'sync', 'error', null, null, error.message);
        }
    }

    // Process synchronized data
    async processSyncData(integrationId, data) {
        // This method should be customized based on your specific integration needs
        console.log(`📊 Processing sync data for integration ${integrationId}:`, data);
        
        // Example: Update local database with synced data
        // await this.updateLocalDatabase(data);
    }

    // Update last sync timestamp
    async updateLastSync(integrationId) {
        await this.db.query(
            'UPDATE integrations SET last_sync = NOW() WHERE id = ?',
            [integrationId]
        );
    }

    // Log integration events
    async logIntegrationEvent(integrationId, direction, eventType, status, requestData, responseData, errorMessage = null) {
        try {
            await this.db.query(
                `INSERT INTO integration_logs 
                 (integration_id, event_type, direction, status, request_data, response_data, error_message)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    integrationId,
                    eventType,
                    direction,
                    status,
                    requestData ? JSON.stringify(requestData) : null,
                    responseData ? JSON.stringify(responseData) : null,
                    errorMessage
                ]
            );
        } catch (error) {
            console.error('❌ Error logging integration event:', error);
        }
    }

    // Get integration status
    async getIntegrationStatus(integrationId) {
        try {
            const [integration] = await this.db.query(
                'SELECT * FROM integrations WHERE id = ?',
                [integrationId]
            );

            if (integration.length === 0) {
                return { success: false, error: 'Integration not found' };
            }

            const [logs] = await this.db.query(
                'SELECT * FROM integration_logs WHERE integration_id = ? ORDER BY timestamp DESC LIMIT 10',
                [integrationId]
            );

            return {
                success: true,
                integration: integration[0],
                recentLogs: logs,
                isActive: this.activeIntegrations.has(integrationId)
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Get all integrations
    async getAllIntegrations() {
        try {
            const [integrations] = await this.db.query('SELECT * FROM integrations ORDER BY created_at DESC');
            return { success: true, integrations };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Cleanup on shutdown
    async shutdown() {
        console.log('🔌 Shutting down Integration Manager...');
        
        for (const [integrationId, integration] of this.activeIntegrations) {
            if (integration.syncInterval) {
                clearInterval(integration.syncInterval);
            }
        }
        
        this.activeIntegrations.clear();
        this.webhookEndpoints.clear();
        
        console.log('✅ Integration Manager shutdown complete');
    }
}

module.exports = IntegrationManager;
