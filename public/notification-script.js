// Notification System JavaScript
const API_BASE = '/api/notifications';

let notifications = [];
let unreadCount = 0;
let currentUserId = null;

// Initialize notification system
document.addEventListener('DOMContentLoaded', function() {
    // Get current user ID from localStorage
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        currentUserId = user.id;
        
        // Load notifications
        loadNotifications();
        
        // Load notification preferences
        loadNotificationPreferences();
        
        // Start notification polling
        setInterval(checkForNewNotifications, 30000); // Check every 30 seconds
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            const dropdown = document.getElementById('notification-dropdown');
            const bell = document.getElementById('notification-bell');
            
            if (!bell.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }
});

// Load notifications from server
async function loadNotifications() {
    try {
        const response = await fetch(`${API_BASE}/user/${currentUserId}`);
        if (response.ok) {
            notifications = await response.json();
            updateNotificationDisplay();
            updateNotificationBadge();
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

// Toggle notification dropdown
function toggleNotifications() {
    const dropdown = document.getElementById('notification-dropdown');
    dropdown.classList.toggle('show');
    
    // Mark notifications as read when dropdown opens
    if (dropdown.classList.contains('show')) {
        markNotificationsAsRead();
    }
}

// Update notification display
function updateNotificationDisplay() {
    const notificationList = document.getElementById('notification-list');
    
    if (notifications.length === 0) {
        notificationList.innerHTML = '<div class="no-notifications"><i class="fas fa-bell-slash"></i><p>No new notifications</p></div>';
        return;
    }
    
    notificationList.innerHTML = notifications.map(notification => `
        <div class="notification-item ${notification.is_read ? 'read' : 'unread'}" onclick="handleNotificationClick(${notification.id})">
            <div class="notification-title">${notification.title}</div>
            <div class="notification-message">${notification.message}</div>
            <div class="notification-time">
                <i class="fas fa-clock"></i>
                ${formatNotificationTime(notification.created_at)}
                <span class="notification-type ${notification.type}">${notification.type.replace('_', ' ')}</span>
            </div>
        </div>
    `).join('');
}

// Update notification badge
function updateNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    const bell = document.getElementById('notification-bell');
    
    unreadCount = notifications.filter(n => !n.is_read).length;
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.style.display = 'block';
        bell.classList.add('has-notifications');
    } else {
        badge.style.display = 'none';
        bell.classList.remove('has-notifications');
    }
}

// Format notification time
function formatNotificationTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) {
        return 'Just now';
    } else if (diffMins < 60) {
        return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleDateString();
    }
}

// Handle notification click
function handleNotificationClick(notificationId) {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
        // Mark as read
        markAsRead(notificationId);
        
        // Navigate to related content if applicable
        if (notification.related_type && notification.related_id) {
            navigateToContent(notification.related_type, notification.related_id);
        }
    }
}

// Navigate to related content
function navigateToContent(type, id) {
    switch (type) {
        case 'assignment':
            switchToTab('assignments');
            break;
        case 'discussion':
            switchToTab('discussion-forum');
            break;
        case 'blog':
            switchToTab('blog');
            break;
        case 'portfolio':
            switchToTab('portfolio');
            break;
        case 'test':
            switchToTab('dashboard');
            break;
        case 'module':
            switchToTab('dashboard');
            break;
        case 'study_notes':
            switchToTab('dashboard');
            break;
        case 'class_timetable':
            switchToTab('dashboard');
            break;
        default:
            // Stay on current page
            break;
    }
}

// Mark notification as read
async function markAsRead(notificationId) {
    try {
        const response = await fetch(`${API_BASE}/${notificationId}/read`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            // Update local notification
            const notification = notifications.find(n => n.id === notificationId);
            if (notification) {
                notification.is_read = true;
                updateNotificationDisplay();
                updateNotificationBadge();
            }
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

// Mark all notifications as read
async function markAllNotificationsAsRead() {
    try {
        const unreadNotifications = notifications.filter(n => !n.is_read);
        
        for (const notification of unreadNotifications) {
            await markAsRead(notification.id);
        }
        
        // Show success message
        showMessage('All notifications marked as read', 'success');
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        showMessage('Failed to mark notifications as read', 'error');
    }
}

// Mark notifications as read when dropdown opens
async function markNotificationsAsRead() {
    const unreadNotifications = notifications.filter(n => !n.is_read);
    
    for (const notification of unreadNotifications) {
        await markAsRead(notification.id);
    }
}

// Check for new notifications
async function checkForNewNotifications() {
    try {
        const response = await fetch(`${API_BASE}/unread/${currentUserId}`);
        if (response.ok) {
            const data = await response.json();
            const newUnreadCount = data.count;
            
            if (newUnreadCount > unreadCount) {
                // New notifications received
                loadNotifications();
                
                // Show browser notification if permission granted
                if (Notification.permission === 'granted') {
                    showBrowserNotification('New Notification', 'You have new notifications');
                }
            }
        }
    } catch (error) {
        console.error('Error checking for new notifications:', error);
    }
}

// Show browser notification
function showBrowserNotification(title, message) {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body: message,
            icon: '/favicon.ico',
            badge: '/favicon.ico'
        });
    }
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            console.log('Notification permission:', permission);
        });
    }
}

// Create notification for new content
async function createNotificationForNewContent(contentType, contentTitle, contentId, allUsers = true) {
    try {
        const response = await fetch(`${API_BASE}/notify-new-content`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contentType,
                contentTitle,
                contentId,
                createdBy: currentUserId,
                allUsers
            })
        });
        
        if (response.ok) {
            // Refresh notifications
            await loadNotifications();
        }
    } catch (error) {
        console.error('Error creating notification for new content:', error);
    }
}

// Schedule session reminder
async function scheduleSessionReminder(title, description, sessionType, startTime, endTime, relatedId, relatedType, allUsers = false) {
    try {
        const response = await fetch(`${API_BASE}/schedule-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                description,
                sessionType,
                startTime,
                endTime,
                relatedId,
                relatedType,
                allUsers,
                createdBy: currentUserId
            })
        });
        
        if (response.ok) {
            showMessage('Session scheduled successfully', 'success');
        } else {
            showMessage('Failed to schedule session', 'error');
        }
    } catch (error) {
        console.error('Error scheduling session:', error);
        showMessage('Failed to schedule session', 'error');
    }
}

// Update notification preferences
async function updateNotificationPreferences(preferences) {
    try {
        const response = await fetch(`${API_BASE}/preferences/${currentUserId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(preferences)
        });
        
        if (response.ok) {
            showMessage('Notification preferences updated', 'success');
        } else {
            showMessage('Failed to update preferences', 'error');
        }
    } catch (error) {
        console.error('Error updating notification preferences:', error);
        showMessage('Failed to update preferences', 'error');
    }
}

// Show message function (reuse existing one)
function showMessage(message, type = 'info') {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(messageDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
}

// Request notification permission on page load
requestNotificationPermission();

// Save notification preferences
async function saveNotificationPreferences() {
    try {
        const preferences = {
            emailNotifications: document.getElementById('email-notifications').checked,
            sessionReminders: document.getElementById('session-reminders').checked,
            newContentNotifications: document.getElementById('new-content-notifications').checked,
            assignmentNotifications: document.getElementById('assignment-notifications').checked,
            discussionNotifications: document.getElementById('discussion-notifications').checked,
            testNotifications: document.getElementById('test-notifications').checked,
            reminderMinutes: parseInt(document.getElementById('reminder-minutes').value)
        };
        
        await updateNotificationPreferences(preferences);
        showMessage('Notification preferences saved successfully', 'success');
    } catch (error) {
        console.error('Error saving notification preferences:', error);
        showMessage('Failed to save notification preferences', 'error');
    }
}

// Load notification history
async function loadNotificationHistory() {
    try {
        const response = await fetch(`${API_BASE}/user/${currentUserId}`);
        if (response.ok) {
            const allNotifications = await response.json();
            const historyList = document.getElementById('history-list');
            
            if (allNotifications.length === 0) {
                historyList.innerHTML = '<div class="no-notifications"><i class="fas fa-history"></i><p>No notification history</p></div>';
                return;
            }
            
            historyList.innerHTML = allNotifications.map(notification => `
                <div class="notification-item ${notification.is_read ? 'read' : 'unread'}">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">
                        <i class="fas fa-clock"></i>
                        ${formatNotificationTime(notification.created_at)}
                        <span class="notification-type ${notification.type}">${notification.type.replace('_', ' ')}</span>
                    </div>
                </div>
            `).join('');
            
            // Show history, hide preferences
            document.getElementById('notification-history').style.display = 'block';
            document.querySelector('.notification-preferences').style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading notification history:', error);
        showMessage('Failed to load notification history', 'error');
    }
}

// Load notification preferences on page load
async function loadNotificationPreferences() {
    try {
        const response = await fetch(`${API_BASE}/preferences/${currentUserId}`);
        if (response.ok) {
            const preferences = await response.json();
            
            // Update form fields
            if (preferences.email_notifications !== undefined) {
                document.getElementById('email-notifications').checked = preferences.email_notifications;
            }
            if (preferences.session_reminders !== undefined) {
                document.getElementById('session-reminders').checked = preferences.session_reminders;
            }
            if (preferences.new_content_notifications !== undefined) {
                document.getElementById('new-content-notifications').checked = preferences.new_content_notifications;
            }
            if (preferences.assignment_notifications !== undefined) {
                document.getElementById('assignment-notifications').checked = preferences.assignment_notifications;
            }
            if (preferences.discussion_notifications !== undefined) {
                document.getElementById('discussion-notifications').checked = preferences.discussion_notifications;
            }
            if (preferences.test_notifications !== undefined) {
                document.getElementById('test-notifications').checked = preferences.test_notifications;
            }
            if (preferences.reminder_minutes !== undefined) {
                document.getElementById('reminder-minutes').value = preferences.reminder_minutes;
            }
        }
    } catch (error) {
        console.error('Error loading notification preferences:', error);
    }
}

// Auto-refresh notifications every minute
setInterval(() => {
    if (currentUserId) {
        checkForNewNotifications();
    }
}, 60000); // Check every minute
