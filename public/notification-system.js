// Custom Notification System - In-App Messages
class NotificationSystem {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Create notification container
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
        
        // Add styles
        this.addStyles();
    }

    addStyles() {
        const styles = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
            }

            .notification {
                background: white;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 10px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                border-left: 4px solid #3b82f6;
                animation: slideIn 0.3s ease-out;
                position: relative;
                overflow: hidden;
            }

            .notification.success {
                border-left-color: #10b981;
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            }

            .notification.error {
                border-left-color: #ef4444;
                background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            }

            .notification.warning {
                border-left-color: #f59e0b;
                background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
            }

            .notification.info {
                border-left-color: #3b82f6;
                background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            }

            .notification.confirmation {
                border-left-color: #8b5cf6;
                background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
            }

            .notification-header {
                display: flex;
                align-items: center;
                margin-bottom: 8px;
                font-weight: 600;
                color: #1f2937;
            }

            .notification-icon {
                margin-right: 8px;
                font-size: 18px;
            }

            .notification-message {
                color: #4b5563;
                line-height: 1.5;
                margin-bottom: 12px;
            }

            .notification-actions {
                display: flex;
                gap: 8px;
                justify-content: flex-end;
            }

            .notification-btn {
                padding: 6px 12px;
                border: none;
                border-radius: 4px;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s;
                font-weight: 500;
            }

            .notification-btn.primary {
                background: #3b82f6;
                color: white;
            }

            .notification-btn.primary:hover {
                background: #2563eb;
            }

            .notification-btn.secondary {
                background: #e5e7eb;
                color: #374151;
            }

            .notification-btn.secondary:hover {
                background: #d1d5db;
            }

            .notification-btn.danger {
                background: #ef4444;
                color: white;
            }

            .notification-btn.danger:hover {
                background: #dc2626;
            }

            .notification-close {
                position: absolute;
                top: 8px;
                right: 8px;
                background: none;
                border: none;
                font-size: 18px;
                color: #6b7280;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s;
            }

            .notification-close:hover {
                background: rgba(0, 0, 0, 0.1);
                color: #374151;
            }

            .notification-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.3);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.2s ease-out;
            }

            .notification-modal {
                background: white;
                border-radius: 12px;
                padding: 24px;
                max-width: 450px;
                width: 90%;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                animation: scaleIn 0.2s ease-out;
            }

            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes scaleIn {
                from {
                    transform: scale(0.9);
                    opacity: 0;
                }
                to {
                    transform: scale(1);
                    opacity: 1;
                }
            }

            @media (max-width: 640px) {
                .notification-container {
                    left: 10px;
                    right: 10px;
                    max-width: none;
                }
                
                .notification-modal {
                    width: 95%;
                    margin: 10px;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    // Show simple notification
    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            confirmation: '🔔'
        };

        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Information',
            confirmation: 'Confirmation'
        };

        notification.innerHTML = `
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
            <div class="notification-header">
                <span class="notification-icon">${icons[type]}</span>
                <span>${titles[type]}</span>
            </div>
            <div class="notification-message">${message}</div>
        `;

        this.container.appendChild(notification);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, duration);
        }

        return notification;
    }

    // Show confirmation dialog
    async confirm(message, title = 'Confirm Action', options = {}) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'notification-overlay';
            
            const modal = document.createElement('div');
            modal.className = 'notification-modal';
            
            const primaryText = options.primaryText || 'Confirm';
            const secondaryText = options.secondaryText || 'Cancel';
            const type = options.type || 'confirmation';
            
            const icons = {
                delete: '🗑️',
                logout: '🚪',
                save: '💾',
                warning: '⚠️',
                info: 'ℹ️',
                confirmation: '🔔'
            };

            modal.innerHTML = `
                <div class="notification-header">
                    <span class="notification-icon">${icons[type] || '🔔'}</span>
                    <span>${title}</span>
                </div>
                <div class="notification-message">${message}</div>
                <div class="notification-actions">
                    <button class="notification-btn secondary" data-action="cancel">${secondaryText}</button>
                    <button class="notification-btn ${type === 'delete' ? 'danger' : 'primary'}" data-action="confirm">${primaryText}</button>
                </div>
            `;

            overlay.appendChild(modal);
            document.body.appendChild(overlay);

            // Handle button clicks
            const handleAction = (action) => {
                overlay.remove();
                resolve(action === 'confirm');
            };

            modal.querySelector('[data-action="confirm"]').addEventListener('click', () => handleAction('confirm'));
            modal.querySelector('[data-action="cancel"]').addEventListener('click', () => handleAction('cancel'));
            
            // Close on overlay click
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    handleAction('cancel');
                }
            });

            // Close on Escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    handleAction('cancel');
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);
        });
    }

    // Success notification
    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    // Error notification
    error(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }

    // Warning notification
    warning(message, duration = 4000) {
        return this.show(message, 'warning', duration);
    }

    // Info notification
    info(message, duration = 4000) {
        return this.show(message, 'info', duration);
    }

    // Delete confirmation
    async confirmDelete(itemName = 'this item') {
        return this.confirm(
            `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
            'Delete Confirmation',
            {
                type: 'delete',
                primaryText: 'Delete',
                secondaryText: 'Cancel'
            }
        );
    }

    // Logout confirmation
    async confirmLogout() {
        return this.confirm(
            'Are you sure you want to logout? You will need to login again to access your account.',
            'Logout Confirmation',
            {
                type: 'logout',
                primaryText: 'Logout',
                secondaryText: 'Cancel'
            }
        );
    }

    // Save confirmation
    async confirmSave(itemName = 'changes') {
        return this.confirm(
            `Are you sure you want to save ${itemName}?`,
            'Save Confirmation',
            {
                type: 'save',
                primaryText: 'Save',
                secondaryText: 'Cancel'
            }
        );
    }

    // Clear all notifications
    clear() {
        this.container.innerHTML = '';
    }
}

// Create global notification system instance
const notifications = new NotificationSystem();

// Export for use in other scripts
window.notifications = notifications;
