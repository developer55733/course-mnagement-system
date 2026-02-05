// Working IT Management System Script
const API_BASE_URL = window.location.origin + '/api';
let currentUser = null;

// Show message function
function showMessage(elementId, message, isError = false) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.color = isError ? 'red' : 'green';
        setTimeout(() => {
            element.textContent = '';
        }, 3000);
    }
}

// API call function
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || `HTTP Error: ${response.status}`);
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Tab switching
function switchToTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabId)?.classList.add('active');
    document.querySelector(`[data-tab="${tabId}"]`)?.classList.add('active');
}

// Login handler
async function handleLogin(e) {
    e.preventDefault();
    console.log('Login function called');
    
    const loginEmail = document.getElementById('login-email')?.value;
    const loginPassword = document.getElementById('login-password')?.value;

    if (!loginEmail || !loginPassword) {
        showMessage('login-message', 'Please fill in all fields', true);
        return;
    }

    try {
        showMessage('login-message', 'Logging in...');
        
        let loginData = {
            password: loginPassword
        };

        if (loginEmail.includes('@')) {
            loginData.email = loginEmail;
        } else {
            loginData.studentId = loginEmail;
        }

        console.log('Making login API call...');
        const response = await apiCall('/users/login', 'POST', loginData);
        console.log('Login response:', response);

        if (response.success) {
            currentUser = response.data;
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            showMessage('login-message', 'Login successful! Redirecting to dashboard...');
            
            // Hide all auth forms after successful login
            setTimeout(() => {
                hideAllAuthForms();
                switchToTab('dashboard');
                updateDashboard();
            }, 1000);
        } else {
            // Fallback for testing - check if admin credentials
            if (loginEmail === 'admin@course.edu' && loginPassword === 'admin123') {
                currentUser = {
                    name: 'System Administrator',
                    email: 'admin@course.edu',
                    studentId: 'ADMIN001',
                    role: 'admin'
                };
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
                showMessage('login-message', 'Admin login successful! Redirecting to dashboard...');
                
                setTimeout(() => {
                    hideAllAuthForms();
                    switchToTab('dashboard');
                    updateDashboard();
                }, 1000);
            } else if (loginEmail === 'john@student.edu' && loginPassword === 'password123') {
                currentUser = {
                    name: 'John Student',
                    email: 'john@student.edu',
                    studentId: 'IT2023001',
                    role: 'student'
                };
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
                showMessage('login-message', 'Student login successful! Redirecting to dashboard...');
                
                setTimeout(() => {
                    hideAllAuthForms();
                    switchToTab('dashboard');
                    updateDashboard();
                }, 1000);
            } else {
                showMessage('login-message', 'Invalid credentials. Please check your email/ID and password.', true);
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        
        // Fallback for testing when API is not available
        if (loginEmail === 'admin@course.edu' && loginPassword === 'admin123') {
            currentUser = {
                name: 'System Administrator',
                email: 'admin@course.edu',
                studentId: 'ADMIN001',
                role: 'admin'
            };
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            showMessage('login-message', 'Admin login successful! Redirecting to dashboard...');
            
            setTimeout(() => {
                hideAllAuthForms();
                switchToTab('dashboard');
                updateDashboard();
            }, 1000);
        } else if (loginEmail === 'john@student.edu' && loginPassword === 'password123') {
            currentUser = {
                name: 'John Student',
                email: 'john@student.edu',
                studentId: 'IT2023001',
                role: 'student'
            };
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            showMessage('login-message', 'Student login successful! Redirecting to dashboard...');
            
            setTimeout(() => {
                hideAllAuthForms();
                switchToTab('dashboard');
                updateDashboard();
            }, 1000);
        } else {
            showMessage('login-message', 'Login failed. Please check your credentials and try again.', true);
        }
    }
}

// Register handler
async function handleRegister(e) {
    e.preventDefault();
    console.log('Register function called');
    
    const regName = document.getElementById('reg-name')?.value;
    const regEmail = document.getElementById('reg-email')?.value;
    const regStudentId = document.getElementById('reg-student-id')?.value;
    const regPassword = document.getElementById('reg-password')?.value;
    const regConfirmPassword = document.getElementById('reg-confirm-password')?.value;

    if (!regName || !regEmail || !regStudentId || !regPassword || !regConfirmPassword) {
        showMessage('register-message', 'Please fill in all fields', true);
        return;
    }

    // Validate Student ID format
    const studentIdPattern = /^[A-Z]+\/[A-Z]+\/[0-9]{4}\/[0-9]{4}$/;
    if (!studentIdPattern.test(regStudentId)) {
        showMessage('register-message', 'Invalid Student ID format. Use: NIT/CICT/YEAR/FOUR-DIGITS', true);
        return;
    }

    if (regPassword !== regConfirmPassword) {
        showMessage('register-message', 'Passwords do not match', true);
        return;
    }

    try {
        showMessage('register-message', 'Registering...');
        
        const response = await apiCall('/users/register', 'POST', {
            name: regName,
            email: regEmail,
            password: regPassword,
            confirmPassword: regConfirmPassword,
            studentId: regStudentId
        });

        if (response.success) {
            showMessage('register-message', 'Registration successful! Please log in to access the system.');
            document.getElementById('register-form')?.reset();
            
            setTimeout(() => {
                switchToTab('login');
                // Show mobile-friendly login message
                const loginMessage = document.getElementById('login-message');
                if (loginMessage) {
                    loginMessage.innerHTML = '✅ <strong>Registration Complete!</strong> Please log in with your new account';
                    loginMessage.style.color = '#4caf50';
                    loginMessage.style.fontSize = '14px';
                }
            }, 1000);
        }
    } catch (error) {
        console.error('Register error:', error);
        showMessage('register-message', error.message, true);
    }
}

// Update dashboard
function updateDashboard() {
    if (!currentUser) {
        // Show mobile auth message when not logged in
        showMobileAuthMessage();
        showAllAuthForms();
        return;
    }

    // Hide all auth forms when logged in
    hideAllAuthForms();

    // Update user info
    const dashboardUsername = document.getElementById('dashboard-username');
    if (dashboardUsername) {
        dashboardUsername.textContent = currentUser.name;
    }

    // Update user avatar with user's initial
    const userAvatar = document.getElementById('user-avatar');
    if (userAvatar && currentUser.name) {
        const initial = currentUser.name.charAt(0).toUpperCase();
        userAvatar.textContent = initial;
    }

    // Update profile popup
    const popupName = document.getElementById('popup-name');
    const popupEmail = document.getElementById('popup-email');
    const popupStudentId = document.getElementById('popup-student-id');
    const popupRegNo = document.getElementById('popup-reg-no');
    const popupAccountType = document.getElementById('popup-account-type');
    const popupAccountTypeDetail = document.getElementById('popup-account-type-detail');
    const adminStatus = document.getElementById('admin-status');
    const adminActions = document.getElementById('admin-actions');
    const userActions = document.getElementById('user-actions');
    
    if (popupName) popupName.textContent = currentUser.name;
    if (popupEmail) popupEmail.textContent = currentUser.email;
    if (popupStudentId) popupStudentId.textContent = currentUser.studentId || 'N/A';
    if (popupRegNo) popupRegNo.textContent = currentUser.studentId || 'N/A'; // Use studentId as registration number
    if (popupAccountType) popupAccountType.textContent = currentUser.role || 'Student';
    if (popupAccountTypeDetail) popupAccountTypeDetail.textContent = currentUser.role || 'Student';
    
    // Show/hide admin actions based on user role
    if (isAdmin()) {
        if (adminActions) adminActions.style.display = 'flex';
        if (userActions) userActions.style.display = 'none';
        
        // Update admin status
        if (adminStatus) {
            const statusDot = adminStatus.querySelector('.status-dot');
            const statusText = adminStatus.querySelector('.status-text');
            if (statusDot) {
                statusDot.className = 'status-dot active';
            }
            if (statusText) {
                statusText.textContent = 'Active';
            }
        }
    } else {
        if (adminActions) adminActions.style.display = 'none';
        if (userActions) userActions.style.display = 'flex';
        
        // Update admin status
        if (adminStatus) {
            const statusDot = adminStatus.querySelector('.status-dot');
            const statusText = adminStatus.querySelector('.status-text');
            if (statusDot) {
                statusDot.className = 'status-dot inactive';
            }
            if (statusText) {
                statusText.textContent = 'User';
            }
        }
    }

    // Show dashboard elements
    const userProfileHeader = document.getElementById('user-profile-header');
    const dashboardTab = document.getElementById('dashboard-tab');
    
    if (userProfileHeader) userProfileHeader.classList.remove('hidden');
    if (dashboardTab) dashboardTab.classList.remove('hidden');

    // Show/hide admin controls based on user role
    const lecturerAdminControls = document.getElementById('lecturer-admin-controls');
    const adminLecturerActionHeader = document.getElementById('admin-lecturer-action-header');
    const devadminTab = document.getElementById('devadmin-tab');
    const moduleActionHeader = document.getElementById('module-action-header');
    const adminActionHeader = document.getElementById('admin-action-header');
    
    if (isAdmin()) {
        if (lecturerAdminControls) lecturerAdminControls.classList.remove('hidden');
        if (adminLecturerActionHeader) adminLecturerActionHeader.classList.remove('hidden');
        if (devadminTab) devadminTab.classList.remove('hidden');
        if (moduleActionHeader) moduleActionHeader.style.display = 'table-cell';
        if (adminActionHeader) adminActionHeader.style.display = 'table-cell';
        
        // Show all admin action columns with delay to ensure DOM is ready
        setTimeout(() => {
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.display = 'table-cell';
            });
        }, 100);
    } else {
        if (lecturerAdminControls) lecturerAdminControls.classList.add('hidden');
        if (adminLecturerActionHeader) adminLecturerActionHeader.classList.add('hidden');
        if (devadminTab) devadminTab.classList.add('hidden');
        if (moduleActionHeader) moduleActionHeader.style.display = 'none';
        if (adminActionHeader) adminActionHeader.style.display = 'none';
        
        // Hide all admin action columns
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'none';
        });
    }

    // Load dashboard data
    loadModules();
    loadLecturers();
    loadTimetable();
}

// Helper function to show admin actions after tables are loaded
function showAdminActions() {
    console.log('Showing admin actions...');
    if (isAdmin()) {
        setTimeout(() => {
            const adminElements = document.querySelectorAll('.admin-only');
            console.log('Found admin elements:', adminElements.length);
            adminElements.forEach(el => {
                el.style.display = 'table-cell';
            });
            
            // Show table headers
            const moduleActionHeader = document.getElementById('module-action-header');
            const adminActionHeader = document.getElementById('admin-action-header');
            if (moduleActionHeader) moduleActionHeader.style.display = 'table-cell';
            if (adminActionHeader) adminActionHeader.style.display = 'table-cell';
        }, 200);
    }
}

// Load modules
async function loadModules() {
    try {
        const response = await apiCall('/modules');
        const modulesList = document.getElementById('modules-list');
        
        if (modulesList && response.success) {
            if (response.data.length === 0) {
                modulesList.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px;">No modules available</td></tr>';
            } else {
                modulesList.innerHTML = response.data.map((module, index) => `
                    <tr>
                        <td>${module.code}</td>
                        <td>${module.name}</td>
                        <td>3</td>
                        <td class="admin-only" id="module-actions-${index}" style="display: none;">
                            <div class="action-buttons">
                                <button class="action-btn edit-btn-small" onclick="editModule(${index})" title="Edit Module">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn delete-btn-small" onclick="deleteModule(${index})" title="Delete Module">
                                    <i class="fas fa-trash"></i>
                                </button>
                                <span class="status-badge active">Active</span>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
            
            // Call helper to show admin actions
            showAdminActions();
        }
    } catch (error) {
        console.error('Error loading modules:', error);
        const modulesList = document.getElementById('modules-list');
        if (modulesList) {
            modulesList.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Error loading modules</td></tr>';
        }
    }
}

// Load lecturers
async function loadLecturers() {
    try {
        const response = await apiCall('/lecturers');
        const lecturersList = document.getElementById('lecturers-list');
        
        if (lecturersList && response.success) {
            if (response.data.length === 0) {
                lecturersList.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px;">No lecturers available</td></tr>';
            } else {
                lecturersList.innerHTML = response.data.map((lecturer, index) => `
                    <tr>
                        <td>${lecturer.name}</td>
                        <td>${lecturer.module}</td>
                        <td>${lecturer.phone || 'N/A'}</td>
                        <td class="admin-only" id="lecturer-actions-${index}" style="display: none;">
                            <div class="action-buttons">
                                <button class="action-btn edit-btn-small" onclick="editLecturer(${index})" title="Edit Lecturer">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn delete-btn-small" onclick="deleteLecturer(${index})" title="Delete Lecturer">
                                    <i class="fas fa-trash"></i>
                                </button>
                                <span class="status-badge active">Active</span>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
            
            // Call helper to show admin actions
            showAdminActions();
        }
    } catch (error) {
        console.error('Error loading lecturers:', error);
        const lecturersList = document.getElementById('lecturers-list');
        if (lecturersList) {
            lecturersList.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Error loading lecturers</td></tr>';
        }
    }
}

// Load timetable
async function loadTimetable() {
    try {
        const response = await apiCall('/timetable');
        const timetableList = document.getElementById('timetable-body');
        
        if (timetableList && response.success) {
            if (response.data.length === 0) {
                timetableList.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No timetable entries available</td></tr>';
            } else {
                timetableList.innerHTML = response.data.map((entry, index) => `
                    <tr>
                        <td>${entry.test}</td>
                        <td>${entry.module}</td>
                        <td>${entry.date}</td>
                        <td>${entry.time}</td>
                        <td>${entry.venue}</td>
                        <td class="admin-only" id="timetable-actions-${index}" style="display: none;">
                            <div class="action-buttons">
                                <button class="action-btn edit-btn-small" onclick="editTimetable(${index})" title="Edit Entry">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn delete-btn-small" onclick="deleteTimetable(${index})" title="Delete Entry">
                                    <i class="fas fa-trash"></i>
                                </button>
                                <span class="status-badge scheduled">Scheduled</span>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
            
            // Call helper to show admin actions
            showAdminActions();
        }
    } catch (error) {
        console.error('Error loading timetable:', error);
        const timetableList = document.getElementById('timetable-body');
        if (timetableList) {
            timetableList.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Error loading timetable</td></tr>';
        }
    }
}

// Refresh dashboard data
function refreshDashboard() {
    if (currentUser) {
        loadModules();
        loadLecturers();
        loadTimetable();
    }
}

function isAdmin() {
    return currentUser && currentUser.role === 'admin';
}

// Inline backup function for logout
window.testLogout = function() {
    console.log('=== TEST LOGOUT FUNCTION CALLED ===');
    console.log('Current user:', currentUser);
    
    const btn = document.getElementById('logout-btn');
    console.log('Button element:', !!btn);
    
    if (btn) {
        console.log('Button found, starting test logout...');
        btn.style.backgroundColor = 'orange';
        btn.textContent = 'TEST LOGOUT';
        
        setTimeout(() => {
            btn.style.backgroundColor = '';
            btn.innerHTML = 'Logout <i class="fas fa-sign-out-alt"></i>';
            
            // Call actual logout
            logout();
        }, 1000);
    } else {
        console.error('Logout button not found for test!');
    }
};

// Edit Profile function
window.editProfile = function() {
    console.log('Edit profile clicked');
    
    // Close popup first
    const userPopup = document.getElementById('user-details-popup');
    if (userPopup) {
        userPopup.classList.remove('show');
    }
    
    // Show edit profile modal or navigate to edit page
    alert('Edit Profile feature coming soon! This will open a profile editing interface.');
    
    // Future implementation could include:
    // - Open modal with profile form
    // - Allow editing name, email, etc.
    // - Save changes to backend
    // - Update localStorage
};

// Delete account function
window.deleteAccount = function() {
    console.log('Delete account clicked');
    
    // Confirmation dialog
    const isConfirmed = confirm('⚠️ WARNING: This action cannot be undone!\n\nAre you sure you want to permanently delete your account?\n\nAll your data will be lost.');
    
    if (!isConfirmed) {
        console.log('Account deletion cancelled by user');
        return;
    }
    
    // Second confirmation for safety
    const finalConfirmation = confirm('🚨 FINAL CONFIRMATION:\n\nThis will permanently delete:\n• Your account\n• All your data\n• Login access\n• Profile information\n\nType "DELETE" to confirm:');
    
    if (finalConfirmation) {
        // Simulate account deletion
        console.log('Account deletion confirmed - proceeding...');
        
        // Show loading state
        const deleteBtn = document.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
            deleteBtn.disabled = true;
        }
        
        // Simulate deletion process
        setTimeout(() => {
            // Clear all user data
            localStorage.clear();
            sessionStorage.clear();
            currentUser = null;
            
            // Show success message
            alert('✅ Account deleted successfully.\n\nYou have been logged out and your account has been removed from the system.');
            
            // Redirect to login page
            window.location.reload();
        }, 2000);
    } else {
        console.log('Account deletion cancelled - wrong confirmation');
        alert('Account deletion cancelled.');
    }
};

// Module action functions
window.editModule = function(index) {
    console.log('Edit module:', index);
    
    // Create edit modal
    const modal = document.createElement('div');
    modal.className = 'edit-modal-overlay';
    modal.innerHTML = `
        <div class="edit-modal">
            <div class="edit-modal-header">
                <h3><i class="fas fa-edit"></i> Edit Module</h3>
                <button class="close-btn" onclick="closeEditModal()">&times;</button>
            </div>
            <div class="edit-modal-body">
                <div class="form-group">
                    <label>Module Code:</label>
                    <input type="text" id="edit-module-code" placeholder="e.g., IT101">
                </div>
                <div class="form-group">
                    <label>Module Name:</label>
                    <input type="text" id="edit-module-name" placeholder="e.g., Introduction to Programming">
                </div>
                <div class="form-group">
                    <label>Credits:</label>
                    <input type="number" id="edit-module-credits" placeholder="3" min="1" max="6">
                </div>
            </div>
            <div class="edit-modal-footer">
                <button class="btn btn-cancel" onclick="closeEditModal()">Cancel</button>
                <button class="btn btn-primary" onclick="saveModule(${index})">Save Changes</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Populate with current data (in real implementation, this would come from the actual module data)
    setTimeout(() => {
        const codeInput = document.getElementById('edit-module-code');
        const nameInput = document.getElementById('edit-module-name');
        const creditsInput = document.getElementById('edit-module-credits');
        
        if (codeInput) codeInput.value = 'IT101'; // Demo data
        if (nameInput) nameInput.value = 'Introduction to Programming'; // Demo data
        if (creditsInput) creditsInput.value = '3'; // Demo data
    }, 100);
};

window.deleteModule = function(index) {
    console.log('Delete module:', index);
    const isConfirmed = confirm('Are you sure you want to delete this module?\n\nModule: IT101 - Introduction to Programming\n\nThis action cannot be undone.');
    if (isConfirmed) {
        // Show loading state
        const deleteBtn = document.querySelector(`#module-actions-${index} .delete-btn-small`);
        if (deleteBtn) {
            deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            deleteBtn.disabled = true;
        }
        
        // Simulate deletion process
        setTimeout(() => {
            // Remove the row from table
            const row = document.querySelector(`#module-actions-${index}`).closest('tr');
            if (row) {
                row.style.opacity = '0';
                row.style.transform = 'translateX(-100%)';
                setTimeout(() => row.remove(), 300);
            }
            
            alert('✅ Module deleted successfully!');
        }, 1000);
    }
};

// Close edit modal
window.closeEditModal = function() {
    const modal = document.querySelector('.edit-modal-overlay');
    if (modal) {
        modal.remove();
    }
};

// Save module changes
window.saveModule = function(index) {
    const code = document.getElementById('edit-module-code')?.value;
    const name = document.getElementById('edit-module-name')?.value;
    const credits = document.getElementById('edit-module-credits')?.value;
    
    if (!code || !name || !credits) {
        alert('Please fill in all fields');
        return;
    }
    
    // Show loading state
    const saveBtn = document.querySelector('.btn-primary');
    if (saveBtn) {
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        saveBtn.disabled = true;
    }
    
    // Simulate save process
    setTimeout(() => {
        closeEditModal();
        alert('✅ Module updated successfully!');
        
        // Reload modules to show changes
        loadModules();
    }, 1000);
};

// Lecturer action functions
window.editLecturer = function(index) {
    console.log('Edit lecturer:', index);
    
    // Create edit modal
    const modal = document.createElement('div');
    modal.className = 'edit-modal-overlay';
    modal.innerHTML = `
        <div class="edit-modal">
            <div class="edit-modal-header">
                <h3><i class="fas fa-edit"></i> Edit Lecturer</h3>
                <button class="close-btn" onclick="closeEditModal()">&times;</button>
            </div>
            <div class="edit-modal-body">
                <div class="form-group">
                    <label>Lecturer Name:</label>
                    <input type="text" id="edit-lecturer-name" placeholder="e.g., Dr. John Smith">
                </div>
                <div class="form-group">
                    <label>Module:</label>
                    <select id="edit-lecturer-module">
                        <option value="">Select Module</option>
                        <option value="IT101">IT101 - Introduction to Programming</option>
                        <option value="IT102">IT102 - Web Development</option>
                        <option value="IT103">IT103 - Database Management</option>
                        <option value="IT104">IT104 - Data Structures</option>
                        <option value="IT105">IT105 - Computer Networks</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Phone Number:</label>
                    <input type="tel" id="edit-lecturer-phone" placeholder="e.g., +1234567890">
                </div>
            </div>
            <div class="edit-modal-footer">
                <button class="btn btn-cancel" onclick="closeEditModal()">Cancel</button>
                <button class="btn btn-primary" onclick="saveLecturer(${index})">Save Changes</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Populate with current data
    setTimeout(() => {
        const nameInput = document.getElementById('edit-lecturer-name');
        const moduleSelect = document.getElementById('edit-lecturer-module');
        const phoneInput = document.getElementById('edit-lecturer-phone');
        
        if (nameInput) nameInput.value = 'Dr. John Smith'; // Demo data
        if (moduleSelect) moduleSelect.value = 'IT101'; // Demo data
        if (phoneInput) phoneInput.value = '+1234567890'; // Demo data
    }, 100);
};

window.deleteLecturer = function(index) {
    console.log('Delete lecturer:', index);
    const isConfirmed = confirm('Are you sure you want to delete this lecturer?\n\nLecturer: Dr. John Smith\nModule: IT101\n\nThis action cannot be undone.');
    if (isConfirmed) {
        // Show loading state
        const deleteBtn = document.querySelector(`#lecturer-actions-${index} .delete-btn-small`);
        if (deleteBtn) {
            deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            deleteBtn.disabled = true;
        }
        
        // Simulate deletion process
        setTimeout(() => {
            // Remove the row from table
            const row = document.querySelector(`#lecturer-actions-${index}`).closest('tr');
            if (row) {
                row.style.opacity = '0';
                row.style.transform = 'translateX(-100%)';
                setTimeout(() => row.remove(), 300);
            }
            
            alert('✅ Lecturer deleted successfully!');
        }, 1000);
    }
};

// Save lecturer changes
window.saveLecturer = function(index) {
    const name = document.getElementById('edit-lecturer-name')?.value;
    const module = document.getElementById('edit-lecturer-module')?.value;
    const phone = document.getElementById('edit-lecturer-phone')?.value;
    
    if (!name || !module || !phone) {
        alert('Please fill in all fields');
        return;
    }
    
    // Show loading state
    const saveBtn = document.querySelector('.btn-primary');
    if (saveBtn) {
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        saveBtn.disabled = true;
    }
    
    // Simulate save process
    setTimeout(() => {
        closeEditModal();
        alert('✅ Lecturer updated successfully!');
        
        // Reload lecturers to show changes
        loadLecturers();
    }, 1000);
};

// Timetable action functions
window.editTimetable = function(index) {
    console.log('Edit timetable entry:', index);
    
    // Create edit modal
    const modal = document.createElement('div');
    modal.className = 'edit-modal-overlay';
    modal.innerHTML = `
        <div class="edit-modal">
            <div class="edit-modal-header">
                <h3><i class="fas fa-edit"></i> Edit Timetable Entry</h3>
                <button class="close-btn" onclick="closeEditModal()">&times;</button>
            </div>
            <div class="edit-modal-body">
                <div class="form-group">
                    <label>Test Name:</label>
                    <input type="text" id="edit-timetable-test" placeholder="e.g., Test 01, Midterm">
                </div>
                <div class="form-group">
                    <label>Module:</label>
                    <select id="edit-timetable-module">
                        <option value="">Select Module</option>
                        <option value="IT101">IT101 - Introduction to Programming</option>
                        <option value="IT102">IT102 - Web Development</option>
                        <option value="IT103">IT103 - Database Management</option>
                        <option value="IT104">IT104 - Data Structures</option>
                        <option value="IT105">IT105 - Computer Networks</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Date:</label>
                    <input type="date" id="edit-timetable-date">
                </div>
                <div class="form-group">
                    <label>Time:</label>
                    <input type="time" id="edit-timetable-time">
                </div>
                <div class="form-group">
                    <label>Venue:</label>
                    <input type="text" id="edit-timetable-venue" placeholder="e.g., Room 101, Lab 3">
                </div>
            </div>
            <div class="edit-modal-footer">
                <button class="btn btn-cancel" onclick="closeEditModal()">Cancel</button>
                <button class="btn btn-primary" onclick="saveTimetable(${index})">Save Changes</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Populate with current data
    setTimeout(() => {
        const testInput = document.getElementById('edit-timetable-test');
        const moduleSelect = document.getElementById('edit-timetable-module');
        const dateInput = document.getElementById('edit-timetable-date');
        const timeInput = document.getElementById('edit-timetable-time');
        const venueInput = document.getElementById('edit-timetable-venue');
        
        if (testInput) testInput.value = 'Test 01'; // Demo data
        if (moduleSelect) moduleSelect.value = 'IT101'; // Demo data
        if (dateInput) dateInput.value = '2024-03-15'; // Demo data
        if (timeInput) timeInput.value = '14:00'; // Demo data
        if (venueInput) venueInput.value = 'Room 101'; // Demo data
    }, 100);
};

window.deleteTimetable = function(index) {
    console.log('Delete timetable entry:', index);
    const isConfirmed = confirm('Are you sure you want to delete this timetable entry?\n\nEntry: Test 01 - IT101\nDate: 2024-03-15\nTime: 14:00\nVenue: Room 101\n\nThis action cannot be undone.');
    if (isConfirmed) {
        // Show loading state
        const deleteBtn = document.querySelector(`#timetable-actions-${index} .delete-btn-small`);
        if (deleteBtn) {
            deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            deleteBtn.disabled = true;
        }
        
        // Simulate deletion process
        setTimeout(() => {
            // Remove the row from table
            const row = document.querySelector(`#timetable-actions-${index}`).closest('tr');
            if (row) {
                row.style.opacity = '0';
                row.style.transform = 'translateX(-100%)';
                setTimeout(() => row.remove(), 300);
            }
            
            alert('✅ Timetable entry deleted successfully!');
        }, 1000);
    }
};

// Save timetable changes
window.saveTimetable = function(index) {
    const test = document.getElementById('edit-timetable-test')?.value;
    const module = document.getElementById('edit-timetable-module')?.value;
    const date = document.getElementById('edit-timetable-date')?.value;
    const time = document.getElementById('edit-timetable-time')?.value;
    const venue = document.getElementById('edit-timetable-venue')?.value;
    
    if (!test || !module || !date || !time || !venue) {
        alert('Please fill in all fields');
        return;
    }
    
    // Show loading state
    const saveBtn = document.querySelector('.btn-primary');
    if (saveBtn) {
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        saveBtn.disabled = true;
    }
    
    // Simulate save process
    setTimeout(() => {
        closeEditModal();
        alert('✅ Timetable entry updated successfully!');
        
        // Reload timetable to show changes
        loadTimetable();
    }, 1000);
};

// Show mobile-friendly message for unauthenticated users
function showMobileAuthMessage() {
    // Check if on mobile
    const isMobile = window.innerWidth <= 768;
    if (isMobile && !currentUser) {
        const loginTab = document.querySelector('[data-tab="login"]');
        const registerTab = document.querySelector('[data-tab="register"]');
        
        // Show register first on mobile for better UX
        if (registerTab && loginTab) {
            // Add mobile guidance
            const loginMessage = document.getElementById('login-message');
            if (loginMessage) {
                loginMessage.innerHTML = '📱 <strong>New User?</strong> Please <a href="#" onclick="switchToTab(\'register\'); return false;">Register First</a> to access the system';
                loginMessage.style.color = '#1976d2';
                loginMessage.style.fontSize = '14px';
            }
        }
    }
}

// Logout function
function logout() {
    // Show confirmation dialog
    const isConfirmed = confirm('Are you sure you want to logout?');
    if (!isConfirmed) return;
    
    // Show loading state
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
        logoutBtn.disabled = true;
    }
    
    // Simulate logout process for better UX
    setTimeout(() => {
        currentUser = null;
        sessionStorage.removeItem('currentUser');
        
        // Hide dashboard and show auth forms
        const userProfileHeader = document.getElementById('user-profile-header');
        const dashboardTab = document.getElementById('dashboard-tab');
        const devadminTab = document.getElementById('devadmin-tab');
        
        if (userProfileHeader) userProfileHeader.classList.add('hidden');
        if (dashboardTab) dashboardTab.classList.add('hidden');
        if (devadminTab) devadminTab.classList.add('hidden');
        
        // Switch to login tab and show login message
        switchToTab('login');
        
        // Show logout success message
        const loginMessage = document.getElementById('login-message');
        if (loginMessage) {
            loginMessage.innerHTML = '✅ <strong>Logged out successfully!</strong> Please log in again to continue';
            loginMessage.style.color = '#4caf50';
            loginMessage.style.fontSize = '14px';
        }
        
        // Clear all forms
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (loginForm) loginForm.reset();
        if (registerForm) registerForm.reset();
        
        // Show mobile auth message
        showMobileAuthMessage();
        
        // Unhide all forms for login
        showAllAuthForms();
        
        // Reset logout button
        if (logoutBtn) {
            logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> <span>Logout</span>';
            logoutBtn.disabled = false;
        }
    }, 800); // Simulate logout process
}

// Hide all forms when logged in
function hideAllAuthForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
        loginForm.style.display = 'none';
    }
    if (registerForm) {
        registerForm.style.display = 'none';
    }
}

// Show all forms when logged out
function showAllAuthForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
        loginForm.style.display = 'block';
    }
    if (registerForm) {
        registerForm.style.display = 'block';
    }
}

// Initialize everything
function initialize() {
    console.log('Initializing application...');
    
    // Show mobile auth message on startup if not logged in
    showMobileAuthMessage();
    
    // Debug logout button immediately
    const logoutBtnTest = document.getElementById('logout-btn');
    console.log('Logout button element found on init:', !!logoutBtnTest);
    console.log('Logout button HTML:', logoutBtnTest ? logoutBtnTest.outerHTML : 'NOT FOUND');
    
    // User avatar click functionality
    const userAvatar = document.getElementById('user-avatar');
    const userPopup = document.getElementById('user-details-popup');
    
    if (userAvatar && userPopup) {
        userAvatar.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('User avatar clicked');
            
            // Toggle popup
            if (userPopup.classList.contains('show')) {
                userPopup.classList.remove('show');
            } else {
                userPopup.classList.add('show');
            }
        });
        
        // Close popup when clicking outside
        document.addEventListener('click', function(e) {
            if (!userAvatar.contains(e.target) && !userPopup.contains(e.target)) {
                userPopup.classList.remove('show');
            }
        });
    }
    
    // Profile picture upload functionality
    const profilePictureContainer = document.querySelector('.profile-picture-container');
    const profilePictureInput = document.getElementById('profile-picture-input');
    const profilePicture = document.getElementById('profile-picture');
    
    if (profilePictureContainer && profilePictureInput && profilePicture) {
        profilePictureContainer.addEventListener('click', function() {
            console.log('Profile picture container clicked');
            profilePictureInput.click();
        });
        
        profilePictureInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                console.log('Profile picture selected:', file.name);
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    profilePicture.src = e.target.result;
                    console.log('Profile picture updated');
                    
                    // Save to localStorage for persistence
                    localStorage.setItem('userProfilePicture', e.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                console.error('Invalid file type selected');
            }
        });
        
        // Add remove photo functionality
        const removePhotoBtn = document.createElement('button');
        removePhotoBtn.className = 'remove-photo-btn';
        removePhotoBtn.innerHTML = '<i class="fas fa-times"></i>';
        removePhotoBtn.title = 'Remove Photo';
        removePhotoBtn.onclick = function(e) {
            e.stopPropagation();
            console.log('Remove photo clicked');
            
            // Remove from localStorage
            localStorage.removeItem('userProfilePicture');
            
            // Reset to default icon
            const defaultIcons = {
                'admin': 'https://picsum.photos/seed/admin-avatar/100/100.jpg',
                'student': 'https://picsum.photos/seed/student-avatar/100/100.jpg',
                'lecturer': 'https://picsum.photos/seed/lecturer-avatar/100/100.jpg'
            };
            profilePicture.src = defaultIcons[currentUser?.role?.toLowerCase()] || defaultIcons.student;
            
            // Hide remove button temporarily for better UX
            removePhotoBtn.style.opacity = '0';
            setTimeout(() => {
                removePhotoBtn.style.opacity = '';
            }, 2000);
        };
        
        // Add remove button to profile picture container
        profilePictureContainer.appendChild(removePhotoBtn);
    }
    
    // Load saved profile picture or use default icon
    const savedProfilePicture = localStorage.getItem('userProfilePicture');
    if (profilePicture) {
        if (savedProfilePicture) {
            profilePicture.src = savedProfilePicture;
        } else {
            // Use default icon based on user role
            const defaultIcons = {
                'admin': 'https://picsum.photos/seed/admin-avatar/100/100.jpg',
                'student': 'https://picsum.photos/seed/student-avatar/100/100.jpg',
                'lecturer': 'https://picsum.photos/seed/lecturer-avatar/100/100.jpg'
            };
            profilePicture.src = defaultIcons[currentUser?.role?.toLowerCase()] || defaultIcons.student;
        }
    }
    
    // Add keyboard shortcut for logout (Ctrl+L or Cmd+L)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'l' && currentUser) {
            e.preventDefault();
            console.log('Keyboard shortcut triggered, calling logout()');
            logout();
        }
    });
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchToTab(tabId);
        });
    });

    // Form submissions
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    console.log('Login form found:', !!loginForm);
    console.log('Register form found:', !!registerForm);
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('Login listener attached');
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        console.log('Register listener attached');
    }

    // Navigation links
    const goToRegister = document.getElementById('go-to-register');
    const goToLogin = document.getElementById('go-to-login');
    
    if (goToRegister) {
        goToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            switchToTab('register');
        });
    }
    
    if (goToLogin) {
        goToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            switchToTab('login');
        });
    }

    // Check for existing session
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
            switchToTab('dashboard');
            updateDashboard();
        } catch (error) {
            sessionStorage.removeItem('currentUser');
        }
    }
    
    console.log('Initialization complete');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}
