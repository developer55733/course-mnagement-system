// Frontend JavaScript for Integration Management
class IntegrationManager {
    constructor() {
        this.integrations = [];
        this.templates = [];
        this.currentIntegration = null;
        this.init();
    }

    async init() {
        await this.loadIntegrations();
        await this.loadTemplates();
        this.setupEventListeners();
        this.renderIntegrations();
    }

    // Load all integrations
    async loadIntegrations() {
        try {
            const response = await fetch('/api/integrations', {
                headers: {
                    'x-admin-secret': localStorage.getItem('adminSecret') || ''
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.integrations = data.integrations || [];
            } else {
                this.showMessage('Failed to load integrations', 'error');
            }
        } catch (error) {
            console.error('Error loading integrations:', error);
            this.showMessage('Error loading integrations', 'error');
        }
    }

    // Load integration templates
    async loadTemplates() {
        try {
            const response = await fetch('/api/integrations/templates', {
                headers: {
                    'x-admin-secret': localStorage.getItem('adminSecret') || ''
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.templates = data.templates || {};
            }
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Add integration button
        document.getElementById('add-integration-btn')?.addEventListener('click', () => {
            this.showIntegrationModal();
        });

        // Template selection
        document.getElementById('integration-template')?.addEventListener('change', (e) => {
            this.applyTemplate(e.target.value);
        });

        // Integration form submission
        document.getElementById('integration-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveIntegration();
        });

        // Test integration button
        document.getElementById('test-integration-btn')?.addEventListener('click', () => {
            this.testIntegration();
        });

        // Activate/Deactivate buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.activate-integration')) {
                this.activateIntegration(e.target.dataset.id);
            } else if (e.target.matches('.deactivate-integration')) {
                this.deactivateIntegration(e.target.dataset.id);
            } else if (e.target.matches('.delete-integration')) {
                this.deleteIntegration(e.target.dataset.id);
            } else if (e.target.matches('.test-integration')) {
                this.testIntegrationById(e.target.dataset.id);
            } else if (e.target.matches('.view-logs')) {
                this.viewLogs(e.target.dataset.id);
            }
        });
    }

    // Render integrations list
    renderIntegrations() {
        const container = document.getElementById('integrations-list');
        if (!container) return;

        if (this.integrations.length === 0) {
            container.innerHTML = `
                <div class="no-integrations">
                    <i class="fas fa-plug"></i>
                    <h3>No Integrations Configured</h3>
                    <p>Connect your course management system with external services</p>
                    <button class="btn btn-primary" onclick="integrationManager.showIntegrationModal()">
                        <i class="fas fa-plus"></i> Add Your First Integration
                    </button>
                </div>
            `;
            return;
        }

        const html = this.integrations.map(integration => `
            <div class="integration-card ${integration.status}">
                <div class="integration-header">
                    <div class="integration-info">
                        <h3>${integration.name}</h3>
                        <span class="integration-type">${integration.type.toUpperCase()}</span>
                        <span class="integration-status status-${integration.status}">
                            ${integration.status}
                        </span>
                    </div>
                    <div class="integration-actions">
                        ${integration.status === 'active' ? 
                            `<button class="btn btn-warning deactivate-integration" data-id="${integration.id}">
                                <i class="fas fa-pause"></i> Deactivate
                            </button>` :
                            `<button class="btn btn-success activate-integration" data-id="${integration.id}">
                                <i class="fas fa-play"></i> Activate
                            </button>`
                        }
                        <button class="btn btn-info test-integration" data-id="${integration.id}">
                            <i class="fas fa-vial"></i> Test
                        </button>
                        <button class="btn btn-secondary view-logs" data-id="${integration.id}">
                            <i class="fas fa-file-alt"></i> Logs
                        </button>
                        <button class="btn btn-danger delete-integration" data-id="${integration.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="integration-details">
                    <p><strong>Auth Type:</strong> ${integration.auth_type}</p>
                    <p><strong>Sync Frequency:</strong> ${integration.sync_frequency}s</p>
                    ${integration.last_sync ? 
                        `<p><strong>Last Sync:</strong> ${new Date(integration.last_sync).toLocaleString()}</p>` : 
                        '<p><strong>Last Sync:</strong> Never</p>'
                    }
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    // Show integration modal
    showIntegrationModal(integration = null) {
        this.currentIntegration = integration;
        const modal = document.getElementById('integration-modal');
        
        if (!modal) return;

        document.getElementById('modal-title').textContent = 
            integration ? 'Edit Integration' : 'Add New Integration';
        
        const form = document.getElementById('integration-form');
        if (integration) {
            form.name.value = integration.name;
            form.type.value = integration.type;
            form.authType.value = integration.auth_type;
            form.syncFrequency.value = integration.sync_frequency;
            
            // Parse and set config
            const config = typeof integration.config === 'string' ? 
                JSON.parse(integration.config) : integration.config;
            document.getElementById('integration-config').value = JSON.stringify(config, null, 2);
            
            // Parse and set auth config
            const authConfig = typeof integration.auth_config === 'string' ? 
                JSON.parse(integration.auth_config) : integration.auth_config;
            document.getElementById('auth-config').value = JSON.stringify(authConfig, null, 2);
        } else {
            form.reset();
            document.getElementById('integration-config').value = '{}';
            document.getElementById('auth-config').value = '{}';
        }

        modal.style.display = 'block';
    }

    // Apply template
    applyTemplate(templateName) {
        if (!templateName || !this.templates[templateName]) return;

        const template = this.templates[templateName];
        const form = document.getElementById('integration-form');
        
        form.name.value = template.name;
        form.type.value = template.type;
        form.authType.value = template.authType;
        form.syncFrequency.value = 3600;
        
        document.getElementById('integration-config').value = JSON.stringify(template.config, null, 2);
        
        if (template.authConfig) {
            document.getElementById('auth-config').value = JSON.stringify(template.authConfig, null, 2);
        }
    }

    // Save integration
    async saveIntegration() {
        const form = document.getElementById('integration-form');
        const formData = new FormData(form);
        
        try {
            const config = JSON.parse(document.getElementById('integration-config').value);
            const authConfig = JSON.parse(document.getElementById('auth-config').value);
            
            const integrationData = {
                name: formData.get('name'),
                type: formData.get('type'),
                config: config,
                authType: formData.get('authType'),
                authConfig: authConfig,
                syncFrequency: parseInt(formData.get('syncFrequency'))
            };

            const url = this.currentIntegration ? 
                `/api/integrations/${this.currentIntegration.id}` : 
                '/api/integrations';
            
            const method = this.currentIntegration ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': localStorage.getItem('adminSecret') || ''
                },
                body: JSON.stringify(integrationData)
            });

            const result = await response.json();
            
            if (result.success) {
                this.showMessage(
                    this.currentIntegration ? 'Integration updated successfully' : 'Integration created successfully',
                    'success'
                );
                this.closeModal();
                await this.loadIntegrations();
                this.renderIntegrations();
            } else {
                this.showMessage(result.error || 'Failed to save integration', 'error');
            }
        } catch (error) {
            console.error('Error saving integration:', error);
            this.showMessage('Error saving integration', 'error');
        }
    }

    // Activate integration
    async activateIntegration(id) {
        try {
            const response = await fetch(`/api/integrations/${id}/activate`, {
                method: 'POST',
                headers: {
                    'x-admin-secret': localStorage.getItem('adminSecret') || ''
                }
            });

            const result = await response.json();
            
            if (result.success) {
                this.showMessage('Integration activated successfully', 'success');
                await this.loadIntegrations();
                this.renderIntegrations();
            } else {
                this.showMessage(result.error || 'Failed to activate integration', 'error');
            }
        } catch (error) {
            console.error('Error activating integration:', error);
            this.showMessage('Error activating integration', 'error');
        }
    }

    // Deactivate integration
    async deactivateIntegration(id) {
        try {
            const response = await fetch(`/api/integrations/${id}/deactivate`, {
                method: 'POST',
                headers: {
                    'x-admin-secret': localStorage.getItem('adminSecret') || ''
                }
            });

            const result = await response.json();
            
            if (result.success) {
                this.showMessage('Integration deactivated successfully', 'success');
                await this.loadIntegrations();
                this.renderIntegrations();
            } else {
                this.showMessage(result.error || 'Failed to deactivate integration', 'error');
            }
        } catch (error) {
            console.error('Error deactivating integration:', error);
            this.showMessage('Error deactivating integration', 'error');
        }
    }

    // Test integration
    async testIntegration() {
        if (!this.currentIntegration) return;

        try {
            const response = await fetch(`/api/integrations/${this.currentIntegration.id}/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': localStorage.getItem('adminSecret') || ''
                },
                body: JSON.stringify({
                    testData: { message: 'Test connection from course management system' }
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.showMessage('Integration test successful!', 'success');
            } else {
                this.showMessage(`Integration test failed: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Error testing integration:', error);
            this.showMessage('Error testing integration', 'error');
        }
    }

    // Test integration by ID
    async testIntegrationById(id) {
        try {
            const response = await fetch(`/api/integrations/${id}/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': localStorage.getItem('adminSecret') || ''
                },
                body: JSON.stringify({
                    testData: { message: 'Test connection from course management system' }
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.showMessage('Integration test successful!', 'success');
            } else {
                this.showMessage(`Integration test failed: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Error testing integration:', error);
            this.showMessage('Error testing integration', 'error');
        }
    }

    // View integration logs
    async viewLogs(id) {
        try {
            const response = await fetch(`/api/integrations/${id}/logs`, {
                headers: {
                    'x-admin-secret': localStorage.getItem('adminSecret') || ''
                }
            });

            const result = await response.json();
            
            if (result.success) {
                this.showLogsModal(result.logs);
            } else {
                this.showMessage('Failed to load logs', 'error');
            }
        } catch (error) {
            console.error('Error loading logs:', error);
            this.showMessage('Error loading logs', 'error');
        }
    }

    // Show logs modal
    showLogsModal(logs) {
        const modal = document.getElementById('logs-modal');
        const container = document.getElementById('logs-container');
        
        if (!modal || !container) return;

        if (logs.length === 0) {
            container.innerHTML = '<p>No logs available</p>';
        } else {
            const html = logs.map(log => `
                <div class="log-entry status-${log.status}">
                    <div class="log-header">
                        <span class="log-event">${log.event_type}</span>
                        <span class="log-direction">${log.direction}</span>
                        <span class="log-status status-${log.status}">${log.status}</span>
                        <span class="log-time">${new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    ${log.request_data ? `
                        <div class="log-data">
                            <strong>Request:</strong>
                            <pre>${JSON.stringify(JSON.parse(log.request_data), null, 2)}</pre>
                        </div>
                    ` : ''}
                    ${log.response_data ? `
                        <div class="log-data">
                            <strong>Response:</strong>
                            <pre>${JSON.stringify(JSON.parse(log.response_data), null, 2)}</pre>
                        </div>
                    ` : ''}
                    ${log.error_message ? `
                        <div class="log-error">
                            <strong>Error:</strong>
                            <p>${log.error_message}</p>
                        </div>
                    ` : ''}
                </div>
            `).join('');
            
            container.innerHTML = html;
        }

        modal.style.display = 'block';
    }

    // Delete integration
    async deleteIntegration(id) {
        if (!confirm('Are you sure you want to delete this integration?')) return;

        try {
            const response = await fetch(`/api/integrations/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-admin-secret': localStorage.getItem('adminSecret') || ''
                }
            });

            const result = await response.json();
            
            if (result.success) {
                this.showMessage('Integration deleted successfully', 'success');
                await this.loadIntegrations();
                this.renderIntegrations();
            } else {
                this.showMessage(result.error || 'Failed to delete integration', 'error');
            }
        } catch (error) {
            console.error('Error deleting integration:', error);
            this.showMessage('Error deleting integration', 'error');
        }
    }

    // Close modal
    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        this.currentIntegration = null;
    }

    // Show message
    showMessage(message, type = 'info') {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        
        // Add to page
        document.body.appendChild(messageEl);
        
        // Remove after 3 seconds
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.integrationManager = new IntegrationManager();
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});
