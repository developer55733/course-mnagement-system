// Main Application Script
(() => {
    // Global variables
    let currentUser = null;
    let currentTab = 'login';

    // DOM elements
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const dashboardTab = document.getElementById('dashboard-tab');
    const discussionTab = document.getElementById('discussion-tab');
    const assignmentsTab = document.getElementById('assignments-tab');
    const devadminTab = document.getElementById('devadmin-tab');
    const aboutTab = document.getElementById('about-tab');
    const contactTab = document.getElementById('contact-tab');
    const zoomTab = document.getElementById('zoom-tab');

    // Tab switching functionality
    window.switchToTab = function(tabName) {
        // Hide all tabs
        const allTabs = [loginTab, registerTab, dashboardTab, discussionTab, assignmentsTab, devadminTab, aboutTab, contactTab, zoomTab];
        allTabs.forEach(tab => {
            if (tab) tab.classList.add('hidden');
        });

        // Hide all tab contents
        const allTabContents = document.querySelectorAll('.tab-content');
        allTabContents.forEach(content => {
            content.style.display = 'none';
        });

        // Show selected tab and content
        const selectedTab = document.getElementById(`${tabName}-tab`);
        if (selectedTab) {
            selectedTab.classList.remove('hidden');
        }
        
        const selectedContent = document.getElementById(tabName);
        if (selectedContent) {
            selectedContent.style.display = 'block';
        }

        currentTab = tabName;
    };

    // API call function
    window.apiCall = async (endpoint, method = 'GET', data = null) => {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                }
            };

            if (data && (method === 'POST' || method === 'PUT')) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`/api${endpoint}`, options);
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            return { success: false, error: error.message };
        }
    };

    // Show message function
    window.showMessage = (elementId, message, isError = false) => {
        const messageEl = document.getElementById(elementId);
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = isError ? 'alert alert-danger' : 'alert alert-success';
            messageEl.style.display = 'block';
            
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 5000);
        }
    };

    // Check login status
    window.checkLoginStatus = () => {
        const userStr = sessionStorage.getItem('currentUser');
        if (userStr) {
            try {
                currentUser = JSON.parse(userStr);
                updateUserInterface();
                switchToTab('dashboard');
            } catch (e) {
                console.error('Error parsing user data:', e);
                sessionStorage.removeItem('currentUser');
            }
        } else {
            currentUser = null;
            switchToTab('login');
        }
    };

    // Update user interface
    window.updateUserInterface = () => {
        if (currentUser) {
            // Show user info
            const userNameEl = document.getElementById('user-name');
            const userEmailEl = document.getElementById('user-email');
            const userRoleEl = document.getElementById('user-role');
            const userAvatarEl = document.getElementById('user-avatar');
            
            if (userNameEl) userNameEl.textContent = currentUser.name || 'User';
            if (userEmailEl) userEmailEl.textContent = currentUser.email || 'user@example.com';
            if (userRoleEl) userRoleEl.textContent = currentUser.role || 'Student';
            if (userAvatarEl) {
                const initial = (currentUser.name || 'User').charAt(0).toUpperCase();
                userAvatarEl.textContent = initial;
            }

            // Show dashboard tabs
            if (dashboardTab) dashboardTab.classList.remove('hidden');
            if (discussionTab) discussionTab.classList.remove('hidden');
            if (assignmentsTab) assignmentsTab.classList.remove('hidden');
            if (devadminTab && currentUser.role === 'admin') devadminTab.classList.remove('hidden');

            // Show/hide login register tabs
            if (loginTab) loginTab.classList.add('hidden');
            if (registerTab) registerTab.classList.add('hidden');

            // Show user profile header
            const userProfileHeader = document.getElementById('user-profile-header');
            if (userProfileHeader) userProfileHeader.classList.remove('hidden');
        } else {
            // Hide user info
            const userNameEl = document.getElementById('user-name');
            const userEmailEl = document.getElementById('user-email');
            const userRoleEl = document.getElementById('user-role');
            const userAvatarEl = document.getElementById('user-avatar');
            
            if (userNameEl) userNameEl.textContent = 'User';
            if (userEmailEl) userEmailEl.textContent = 'user@example.com';
            if (userRoleEl) userRoleEl.textContent = 'Student';
            if (userAvatarEl) userAvatarEl.textContent = 'U';

            // Hide dashboard tabs
            if (dashboardTab) dashboardTab.classList.add('hidden');
            if (discussionTab) discussionTab.classList.add('hidden');
            if (assignmentsTab) assignmentsTab.classList.add('hidden');
            if (devadminTab) devadminTab.classList.add('hidden');

            // Show login register tabs
            if (loginTab) loginTab.classList.remove('hidden');
            if (registerTab) registerTab.classList.remove('hidden');

            // Hide user profile header
            const userProfileHeader = document.getElementById('user-profile-header');
            if (userProfileHeader) userProfileHeader.classList.add('hidden');
        }
    };

    // Discussion Forum Functions
    window.loadDiscussions = async () => {
        try {
            const result = await apiCall('/discussions');
            if (result.success) {
                displayDiscussions(result.data);
            } else {
                const container = document.getElementById('discussions-container');
                if (container) {
                    container.innerHTML = '<p class="text-muted">No discussions yet. Be the first to start one!</p>';
                }
            }
        } catch (error) {
            console.error('Error loading discussions:', error);
            showMessage('forum-message', 'Failed to load discussions', true);
        }
    };

    window.displayDiscussions = (discussions) => {
        const container = document.getElementById('discussions-container');
        if (!container) return;

        if (discussions.length === 0) {
            container.innerHTML = '<p class="text-muted">No discussions yet. Be the first to start one!</p>';
            return;
        }

        const discussionsHTML = discussions.map(discussion => `
            <div class="discussion-item" data-id="${discussion.id}">
                <div class="discussion-header">
                    <h4><i class="fas fa-comment"></i> ${discussion.title}</h4>
                    <div class="discussion-meta">
                        <span class="discussion-author">by ${discussion.author_name}</span>
                        <span class="discussion-date">${new Date(discussion.created_at).toLocaleDateString()}</span>
                        ${discussion.module_code ? `<span class="discussion-module">${discussion.module_code}</span>` : ''}
                    </div>
                </div>
                <div class="discussion-content">
                    <p>${discussion.content.substring(0, 200)}${discussion.content.length > 200 ? '...' : ''}</p>
                </div>
                <div class="discussion-footer">
                    <span class="reply-count"><i class="fas fa-reply"></i> ${discussion.reply_count || 0} replies</span>
                    <button class="btn btn-sm btn-primary" onclick="viewDiscussion(${discussion.id})">View Discussion</button>
                </div>
            </div>
        `).join('');

        container.innerHTML = discussionsHTML;
    };

    window.viewDiscussion = async (discussionId) => {
        try {
            const result = await apiCall(`/discussions/${discussionId}`);
            if (result.success) {
                showDiscussionModal(result.data);
            }
        } catch (error) {
            console.error('Error viewing discussion:', error);
            showMessage('forum-message', 'Failed to load discussion', true);
        }
    };

    window.showDiscussionModal = (data) => {
        const modal = document.getElementById('discussion-modal');
        const detailContent = document.getElementById('discussion-detail-content');
        const repliesContainer = document.getElementById('replies-container');
        
        if (!modal || !detailContent || !repliesContainer) return;

        // Display discussion details
        detailContent.innerHTML = `
            <div class="discussion-detail">
                <h4>${data.discussion.title}</h4>
                <div class="discussion-detail-meta">
                    <span class="discussion-author">by ${data.discussion.author_name}</span>
                    <span class="discussion-date">${new Date(data.discussion.created_at).toLocaleDateString()}</span>
                    ${data.discussion.module_code ? `<span class="discussion-module">${data.discussion.module_code}</span>` : ''}
                </div>
                <div class="discussion-detail-content">
                    <p>${data.discussion.content}</p>
                </div>
            </div>
        `;

        // Display replies
        if (data.replies && data.replies.length > 0) {
            repliesContainer.innerHTML = data.replies.map(reply => `
                <div class="reply-item">
                    <div class="reply-header">
                        <strong>${reply.author_name}</strong>
                        <span class="reply-date">${new Date(reply.created_at).toLocaleDateString()}</span>
                    </div>
                    <div class="reply-content">${reply.content}</div>
                </div>
            `).join('');
        } else {
            repliesContainer.innerHTML = '<p class="text-muted">No replies yet.</p>';
        }

        // Show modal
        modal.style.display = 'flex';
    };

    window.closeDiscussionModal = () => {
        const modal = document.getElementById('discussion-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    };

    window.createDiscussion = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            showMessage('forum-message', 'Please login to create a discussion', true);
            return;
        }

        const title = document.getElementById('discussion-title').value;
        const content = document.getElementById('discussion-content').value;
        const moduleCode = document.getElementById('discussion-module').value;

        if (!title || !content) {
            showMessage('forum-message', 'Please fill in title and content', true);
            return;
        }

        try {
            const result = await apiCall('/discussions', 'POST', {
                title,
                content,
                module_code: moduleCode
            });

            if (result.success) {
                showMessage('forum-message', 'Discussion posted successfully!', false);
                document.getElementById('create-discussion-form').reset();
                loadDiscussions();
            } else {
                showMessage('forum-message', 'Failed to post discussion', true);
            }
        } catch (error) {
            console.error('Error creating discussion:', error);
            showMessage('forum-message', 'Failed to post discussion', true);
        }
    };

    // Assignment Functions
    window.loadAssignments = async () => {
        try {
            const result = await apiCall('/assignments');
            if (result.success) {
                displayAssignments(result.data);
            } else {
                const container = document.getElementById('assignments-container');
                if (container) {
                    container.innerHTML = '<p class="text-muted">No assignments posted yet.</p>';
                }
            }
        } catch (error) {
            console.error('Error loading assignments:', error);
            showMessage('assignments-message', 'Failed to load assignments', true);
        }
    };

    window.displayAssignments = (assignments) => {
        const container = document.getElementById('assignments-container');
        if (!container) return;

        if (assignments.length === 0) {
            container.innerHTML = '<p class="text-muted">No assignments posted yet.</p>';
            return;
        }

        const assignmentsHTML = assignments.map(assignment => `
            <div class="assignment-item" data-id="${assignment.id}">
                <div class="assignment-header">
                    <h4><i class="fas fa-tasks"></i> ${assignment.title}</h4>
                    <div class="assignment-meta">
                        <span class="assignment-module">${assignment.module_name}</span>
                        <span class="assignment-due-date">Due: ${new Date(assignment.due_date).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="assignment-content">
                    <p>${assignment.description.substring(0, 150)}${assignment.description.length > 150 ? '...' : ''}</p>
                </div>
                <div class="assignment-footer">
                    <button class="btn btn-sm btn-primary" onclick="viewAssignment(${assignment.id})">View Details</button>
                </div>
            </div>
        `).join('');

        container.innerHTML = assignmentsHTML;
    };

    window.viewAssignment = async (assignmentId) => {
        try {
            const result = await apiCall(`/assignments/${assignmentId}`);
            if (result.success) {
                showAssignmentModal(result.data);
            }
        } catch (error) {
            console.error('Error viewing assignment:', error);
            showMessage('assignments-message', 'Failed to load assignment', true);
        }
    };

    window.showAssignmentModal = (data) => {
        const modal = document.getElementById('assignment-modal');
        const detailContent = document.getElementById('assignment-detail-content');
        
        if (!modal || !detailContent) return;

        // Display assignment details
        detailContent.innerHTML = `
            <div class="assignment-detail">
                <h4>${data.assignment.title}</h4>
                <div class="assignment-detail-meta">
                    <span class="assignment-module">${data.assignment.module_name}</span>
                    <span class="assignment-due-date">Due: ${new Date(data.assignment.due_date).toLocaleDateString()}</span>
                </div>
                <div class="assignment-detail-content">
                    <p>${data.assignment.description}</p>
                </div>
            </div>
        `;

        // Show modal
        modal.style.display = 'flex';
    };

    window.closeAssignmentModal = () => {
        const modal = document.getElementById('assignment-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    };

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', () => {
        checkLoginStatus();
        
        // Tab click handlers
        if (loginTab) loginTab.addEventListener('click', () => switchToTab('login'));
        if (registerTab) registerTab.addEventListener('click', () => switchToTab('register'));
        if (dashboardTab) dashboardTab.addEventListener('click', () => switchToTab('dashboard'));
        if (discussionTab) discussionTab.addEventListener('click', () => { switchToTab('discussion'); loadDiscussions(); });
        if (assignmentsTab) assignmentsTab.addEventListener('click', () => { switchToTab('assignments'); loadAssignments(); });
        if (devadminTab) devadminTab.addEventListener('click', () => switchToTab('devadmin'));
        if (aboutTab) aboutTab.addEventListener('click', () => switchToTab('about'));
        if (contactTab) contactTab.addEventListener('click', () => switchToTab('contact'));
        if (zoomTab) zoomTab.addEventListener('click', () => switchToTab('zoom'));

        // Discussion forum form handler
        const createDiscussionForm = document.getElementById('create-discussion-form');
        if (createDiscussionForm) {
            createDiscussionForm.addEventListener('submit', createDiscussion);
        }

        // Assignment form handler
        const createAssignmentForm = document.getElementById('create-assignment-form');
        if (createAssignmentForm) {
            createAssignmentForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (!currentUser || currentUser.role !== 'admin') {
                    showMessage('assignments-message', 'Only admins can post assignments', true);
                    return;
                }

                const title = document.getElementById('assignment-title').value;
                const description = document.getElementById('assignment-description').value;
                const moduleCode = document.getElementById('assignment-module').value;
                const dueDate = document.getElementById('assignment-due-date').value;

                if (!title || !description || !moduleCode || !dueDate) {
                    showMessage('assignments-message', 'Please fill in all fields', true);
                    return;
                }

                try {
                    const result = await apiCall('/assignments', 'POST', {
                        title,
                        description,
                        module_code: moduleCode,
                        due_date: dueDate
                    });

                    if (result.success) {
                        showMessage('assignments-message', 'Assignment posted successfully!', false);
                        createAssignmentForm.reset();
                        loadAssignments();
                    } else {
                        showMessage('assignments-message', 'Failed to post assignment', true);
                    }
                } catch (error) {
                    console.error('Error creating assignment:', error);
                    showMessage('assignments-message', 'Failed to post assignment', true);
                }
            });
        }
    });
})();
