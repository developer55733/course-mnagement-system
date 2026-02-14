// Secure Session Manager - Railway Database Storage
class SecureSessionManager {
    constructor() {
        this.sessionData = null;
        this.sessionId = null;
        this.isInitialized = false;
    }

    // Initialize session manager
    async init() {
        if (this.isInitialized) return;
        
        try {
            // Try to get existing session
            const response = await fetch('/api/session/get');
            const data = await response.json();
            
            if (data.success) {
                this.sessionData = data.data;
                this.sessionId = this.getSessionIdFromCookie();
                console.log('✅ Session restored from database');
            } else {
                console.log('ℹ️ No active session found');
            }
        } catch (error) {
            console.error('❌ Error initializing session:', error);
        }
        
        this.isInitialized = true;
    }

    // Get session ID from cookie
    getSessionIdFromCookie() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'sessionId') {
                return value;
            }
        }
        return null;
    }

    // Create new session
    async createSession(userId, userData) {
        try {
            const response = await fetch('/api/session/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    userData: userData
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.sessionId = data.sessionId;
                this.sessionData = {
                    userId: userId,
                    userData: userData,
                    expiresAt: data.expiresAt
                };
                console.log('✅ Session created successfully');
                return true;
            } else {
                console.error('❌ Failed to create session:', data.error);
                return false;
            }
        } catch (error) {
            console.error('❌ Error creating session:', error);
            return false;
        }
    }

    // Get current user data
    getCurrentUser() {
        if (!this.sessionData) {
            return null;
        }
        return this.sessionData.userData;
    }

    // Get current user ID
    getCurrentUserId() {
        if (!this.sessionData) {
            return null;
        }
        return this.sessionData.userId;
    }

    // Update session data
    async updateSession(userData) {
        try {
            const response = await fetch('/api/session/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-session-id': this.sessionId
                },
                body: JSON.stringify({
                    userData: userData
                })
            });

            const data = await response.json();
            
            if (data.success) {
                if (this.sessionData) {
                    this.sessionData.userData = userData;
                }
                console.log('✅ Session updated successfully');
                return true;
            } else {
                console.error('❌ Failed to update session:', data.error);
                return false;
            }
        } catch (error) {
            console.error('❌ Error updating session:', error);
            return false;
        }
    }

    // Store user profile picture
    async storeProfilePicture(imageData) {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            currentUser.profilePicture = imageData;
            await this.updateSession(currentUser);
        }
    }

    // Get user profile picture
    getProfilePicture() {
        const currentUser = this.getCurrentUser();
        return currentUser ? currentUser.profilePicture : null;
    }

    // Store blog posts
    async storeBlogPosts(blogPosts) {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            currentUser.blogPosts = blogPosts;
            await this.updateSession(currentUser);
        }
    }

    // Get blog posts
    getBlogPosts() {
        const currentUser = this.getCurrentUser();
        return currentUser ? currentUser.blogPosts || [] : [];
    }

    // Store portfolio data
    async storePortfolioData(portfolioData) {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            currentUser.portfolioData = portfolioData;
            await this.updateSession(currentUser);
        }
    }

    // Get portfolio data
    getPortfolioData() {
        const currentUser = this.getCurrentUser();
        return currentUser ? currentUser.portfolioData || {} : {};
    }

    // Store assignment notifications
    async storeAssignmentNotifications(notifications) {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            currentUser.assignmentNotifications = notifications;
            await this.updateSession(currentUser);
        }
    }

    // Get assignment notifications
    getAssignmentNotifications() {
        const currentUser = this.getCurrentUser();
        return currentUser ? currentUser.assignmentNotifications || [] : [];
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.sessionData !== null && this.sessionId !== null;
    }

    // Destroy session
    async destroySession() {
        try {
            const response = await fetch('/api/session/destroy', {
                method: 'DELETE',
                headers: {
                    'x-session-id': this.sessionId
                }
            });

            const data = await response.json();
            
            if (data.success) {
                this.sessionData = null;
                this.sessionId = null;
                console.log('✅ Session destroyed successfully');
                return true;
            } else {
                console.error('❌ Failed to destroy session:', data.error);
                return false;
            }
        } catch (error) {
            console.error('❌ Error destroying session:', error);
            return false;
        }
    }

    // Get authentication headers for API calls
    getAuthHeaders() {
        const headers = {};
        if (this.sessionId) {
            headers['x-session-id'] = this.sessionId;
        }
        if (this.sessionData && this.sessionData.userId) {
            headers['x-user-id'] = this.sessionData.userId.toString();
        }
        return headers;
    }

    // Clear all localStorage data (migration helper)
    clearLocalStorage() {
        const keysToRemove = [
            'currentUser',
            'userProfilePicture',
            'blogPosts',
            'portfolioData',
            'portfolioProfile',
            'lastAssignmentCheck'
        ];
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });
        
        console.log('🧹 localStorage cleared - migrated to secure database storage');
    }
}

// Create global session manager instance
const sessionManager = new SecureSessionManager();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    await sessionManager.init();
    
    // Clear localStorage after migration
    sessionManager.clearLocalStorage();
});

// Export for use in other scripts
window.sessionManager = sessionManager;
