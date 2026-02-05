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

// Enhanced login handler with better flow
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const messageEl = document.getElementById('login-message');
    
    if (!email || !password) {
        showMessage('login-message', 'Please fill in all fields', true);
        return;
    }
    
    showLoading('login-message', 'Logging in...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showMessage('login-message', 'Login successful! Redirecting...', false);
            
            // Hide login and register forms, show account details
            setTimeout(() => {
                hideAuthForms();
                showUserAccount();
                switchToTab('dashboard');
                updateDashboard();
            }, 1500);
        } else {
            showMessage('login-message', data.message || 'Login failed', true);
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('login-message', 'Network error. Please try again.', true);
    }
}

// Enhanced register handler with better flow
async function handleRegister(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('register-fullname').value;
    const email = document.getElementById('register-email').value;
    const studentId = document.getElementById('register-student-id').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const messageEl = document.getElementById('register-message');
    
    if (!fullName || !email || !studentId || !password || !confirmPassword) {
        showMessage('register-message', 'Please fill in all fields', true);
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('register-message', 'Passwords do not match', true);
        return;
    }
    
    if (password.length < 6) {
        showMessage('register-message', 'Password must be at least 6 characters', true);
        return;
    }
    
    showLoading('register-message', 'Creating account...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                fullName, 
                email, 
                studentId, 
                password,
                role: 'student'
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showMessage('register-message', 'Registration successful! Redirecting...', false);
            
            // Hide login and register forms, show account details
            setTimeout(() => {
                hideAuthForms();
                showUserAccount();
                switchToTab('dashboard');
                updateDashboard();
            }, 1500);
        } else {
            showMessage('register-message', data.message || 'Registration failed', true);
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('register-message', 'Network error. Please try again.', true);
    }
}

// Hide authentication forms
function hideAuthForms() {
    const loginTab = document.getElementById('login');
    const registerTab = document.getElementById('register');
    const loginTabBtn = document.querySelector('[data-tab="login"]');
    const registerTabBtn = document.querySelector('[data-tab="register"]');
    
    // Hide tabs
    loginTab.style.display = 'none';
    registerTab.style.display = 'none';
    loginTabBtn.style.display = 'none';
    registerTabBtn.style.display = 'none';
    
    // Show login/register switch message
    showAuthSwitchMessage();
}

// Show authentication switch message
function showAuthSwitchMessage() {
    const tabsContainer = document.querySelector('.tabs');
    const existingMessage = document.getElementById('auth-switch-message');
    
    if (!existingMessage) {
        const switchMessage = document.createElement('div');
        switchMessage.id = 'auth-switch-message';
        switchMessage.className = 'auth-switch-message';
        switchMessage.innerHTML = `
            <p>Already have an account? <a href="#" onclick="showLoginForm()">Login here</a></p>
            <p>Don't have an account? <a href="#" onclick="showRegisterForm()">Register here</a></p>
        `;
        tabsContainer.appendChild(switchMessage);
    }
}

// Show login form
function showLoginForm() {
    const loginTab = document.getElementById('login');
    const registerTab = document.getElementById('register');
    const loginTabBtn = document.querySelector('[data-tab="login"]');
    const registerTabBtn = document.querySelector('[data-tab="register"]');
    
    loginTab.style.display = 'block';
    registerTab.style.display = 'none';
    loginTabBtn.style.display = 'block';
    registerTabBtn.style.display = 'block';
    
    switchToTab('login');
    
    // Remove switch message
    const switchMessage = document.getElementById('auth-switch-message');
    if (switchMessage) {
        switchMessage.remove();
    }
}

// Show register form
function showRegisterForm() {
    const loginTab = document.getElementById('login');
    const registerTab = document.getElementById('register');
    const loginTabBtn = document.querySelector('[data-tab="login"]');
    const registerTabBtn = document.querySelector('[data-tab="register"]');
    
    loginTab.style.display = 'block';
    registerTab.style.display = 'block';
    loginTabBtn.style.display = 'block';
    registerTabBtn.style.display = 'block';
    
    switchToTab('register');
    
    // Remove switch message
    const switchMessage = document.getElementById('auth-switch-message');
    if (switchMessage) {
        switchMessage.remove();
    }
}

// Show user account details
function showUserAccount() {
    const dashboardTab = document.getElementById('dashboard');
    const existingAccount = document.getElementById('user-account-details');
    
    if (!existingAccount && currentUser) {
        const accountDetails = document.createElement('div');
        accountDetails.id = 'user-account-details';
        accountDetails.className = 'user-account-details';
        accountDetails.innerHTML = `
            <div class="account-header">
                <h2><i class="fas fa-user-circle"></i> Your Account Details</h2>
                <p class="account-subtitle">View your personal information</p>
            </div>
            <div class="account-info-grid">
                <div class="account-info-item">
                    <label><i class="fas fa-user"></i> Full Name</label>
                    <div class="account-value">${currentUser.fullName}</div>
                </div>
                <div class="account-info-item">
                    <label><i class="fas fa-id-card"></i> Student ID</label>
                    <div class="account-value">${currentUser.studentId}</div>
                </div>
                <div class="account-info-item">
                    <label><i class="fas fa-envelope"></i> Email</label>
                    <div class="account-value">${currentUser.email}</div>
                </div>
                <div class="account-info-item">
                    <label><i class="fas fa-user-tag"></i> Account Type</label>
                    <div class="account-value">${currentUser.role || 'Student'}</div>
                </div>
            </div>
            <div class="account-actions">
                <button class="btn btn-logout" onclick="handleLogout()">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        `;
        
        // Insert at the beginning of dashboard
        dashboardTab.insertBefore(accountDetails, dashboardTab.firstChild);
    }
}

// Enhanced logout handler
function handleLogout() {
    currentUser = null;
    sessionStorage.removeItem('currentUser');
    
    // Show login/register forms again
    const loginTab = document.getElementById('login');
    const registerTab = document.getElementById('register');
    const loginTabBtn = document.querySelector('[data-tab="login"]');
    const registerTabBtn = document.querySelector('[data-tab="register"]');
    
    loginTab.style.display = 'block';
    registerTab.style.display = 'block';
    loginTabBtn.style.display = 'block';
    registerTabBtn.style.display = 'block';
    
    // Remove account details
    const accountDetails = document.getElementById('user-account-details');
    if (accountDetails) {
        accountDetails.remove();
    }
    
    // Remove switch message
    const switchMessage = document.getElementById('auth-switch-message');
    if (switchMessage) {
        switchMessage.remove();
    }
    
    // Clear forms
    document.getElementById('login-form').reset();
    document.getElementById('register-form').reset();
    
    // Switch to login tab
    switchToTab('login');
    
    showMessage('login-message', 'You have been logged out successfully', false);
}

// Update dashboard
function updateDashboard() {
    if (!currentUser) return;

    // Update user info
    const dashboardUsername = document.getElementById('dashboard-username');
    if (dashboardUsername) {
        dashboardUsername.textContent = currentUser.name;
    }

    // Update profile popup
    const popupName = document.getElementById('popup-name');
    const popupEmail = document.getElementById('popup-email');
    const popupStudentId = document.getElementById('popup-student-id');
    const popupAccountType = document.getElementById('popup-account-type');
    
    if (popupName) popupName.textContent = currentUser.name;
    if (popupEmail) popupEmail.textContent = currentUser.email;
    if (popupStudentId) popupStudentId.textContent = currentUser.studentId || 'N/A';
    if (popupAccountType) popupAccountType.textContent = currentUser.role || 'Student';

    // Show dashboard elements
    const userProfileHeader = document.getElementById('user-profile-header');
    const dashboardTab = document.getElementById('dashboard-tab');
    
    if (userProfileHeader) userProfileHeader.classList.remove('hidden');
    if (dashboardTab) dashboardTab.classList.remove('hidden');

    // Show/hide admin controls based on user role
    const lecturerAdminControls = document.getElementById('lecturer-admin-controls');
    const adminLecturerActionHeader = document.getElementById('admin-lecturer-action-header');
    const devadminTab = document.getElementById('devadmin-tab');
    
    if (isAdmin()) {
        if (lecturerAdminControls) lecturerAdminControls.classList.remove('hidden');
        if (adminLecturerActionHeader) adminLecturerActionHeader.classList.remove('hidden');
        if (devadminTab) devadminTab.classList.remove('hidden');
    } else {
        if (lecturerAdminControls) lecturerAdminControls.classList.add('hidden');
        if (adminLecturerActionHeader) adminLecturerActionHeader.classList.add('hidden');
        if (devadminTab) devadminTab.classList.add('hidden');
    }

    // Load dashboard data
    loadModules();
    loadLecturers();
    loadTimetable();
}

// Load modules
async function loadModules() {
    try {
        const response = await apiCall('/modules');
        const modulesList = document.getElementById('modules-list');
        
        if (modulesList && response.success) {
            if (response.data.length === 0) {
                modulesList.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px;">No modules available</td></tr>';
            } else {
                modulesList.innerHTML = response.data.map(module => `
                    <tr>
                        <td>${module.code}</td>
                        <td>${module.name}</td>
                        <td>3</td>
                    </tr>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading modules:', error);
        const modulesList = document.getElementById('modules-list');
        if (modulesList) {
            modulesList.innerHTML = '<tr><td colspan="3" style="text-align: center; color: red;">Error loading modules</td></tr>';
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
                lecturersList.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px;">No lecturers available</td></tr>';
            } else {
                lecturersList.innerHTML = response.data.map(lecturer => `
                    <tr>
                        <td>${lecturer.name}</td>
                        <td>${lecturer.module}</td>
                        <td>${lecturer.phone || 'N/A'}</td>
                    </tr>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading lecturers:', error);
        const lecturersList = document.getElementById('lecturers-list');
        if (lecturersList) {
            lecturersList.innerHTML = '<tr><td colspan="3" style="text-align: center; color: red;">Error loading lecturers</td></tr>';
        }
    }
}

// Load timetable
async function loadTimetable() {
    try {
        const response = await apiCall('/timetable');
        const timetableList = document.getElementById('timetable-list');
        
        if (timetableList && response.success) {
            if (response.data.length === 0) {
                timetableList.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No timetable entries available</td></tr>';
            } else {
                timetableList.innerHTML = response.data.map(entry => `
                    <tr>
                        <td>${entry.test}</td>
                        <td>${entry.module}</td>
                        <td>${entry.date}</td>
                        <td>${entry.time}</td>
                        <td>${entry.venue}</td>
                    </tr>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading timetable:', error);
        const timetableList = document.getElementById('timetable-list');
        if (timetableList) {
            timetableList.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Error loading timetable</td></tr>';
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

// Check if user is admin
function isAdmin() {
    return currentUser && currentUser.role === 'admin';
}

// Check if device is mobile
function isMobile() {
    return window.innerWidth <= 480;
}

// Mobile navigation toggle
function toggleMobileNav() {
    const navToggle = document.getElementById('mobile-nav-toggle');
    const tabs = document.querySelector('.tabs');
    
    if (navToggle && tabs) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            tabs.classList.toggle('mobile-expanded');
        });
    }
}

// Enhanced mobile form interactions
function enhanceMobileForms() {
    if (!isMobile()) return;
    
    // Add touch feedback to form inputs
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('touchstart', () => {
            input.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('touchend', () => {
            input.style.transform = 'scale(1)';
        });
    });
    
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (!isMobile()) return;
            
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Mobile tab switching with animations
function switchToTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
        
        // Add animation for mobile
        if (isMobile()) {
            selectedTab.style.animation = 'none';
            setTimeout(() => {
                selectedTab.style.animation = 'slideInUp 0.4s ease';
            }, 10);
        }
    }
    
    // Activate tab button
    const tabButton = document.querySelector(`[data-tab="${tabId}"]`);
    if (tabButton) {
        tabButton.classList.add('active');
        
        // On mobile, close nav after selection
        if (isMobile()) {
            const navToggle = document.getElementById('mobile-nav-toggle');
            const tabs = document.querySelector('.tabs');
            if (navToggle && tabs) {
                navToggle.classList.remove('active');
                tabs.classList.remove('mobile-expanded');
            }
        }
    }
}

// Show loading state on mobile
function showLoading(elementId, message = 'Loading...') {
    const element = document.getElementById(elementId);
    if (element && isMobile()) {
        element.innerHTML = `<span class="loading"></span>${message}`;
    }
}

// Enhanced mobile message display
function showMessage(elementId, message, isError = false) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.color = isError ? '#e74c3c' : '#27ae60';
        element.style.backgroundColor = isError ? 'rgba(231, 76, 60, 0.1)' : 'rgba(39, 174, 96, 0.1)';
        element.style.border = `2px solid ${isError ? '#e74c3c' : '#27ae60'}`;
        element.style.padding = '12px';
        element.style.borderRadius = '20px';
        element.style.margin = '10px 0';
        
        // Auto-hide on mobile after 3 seconds
        setTimeout(() => {
            element.textContent = '';
            element.style.backgroundColor = '';
            element.style.border = '';
            element.style.padding = '';
            element.style.borderRadius = '';
            element.style.margin = '';
        }, 3000);
    }
}

// Mobile swipe gestures for navigation
function addSwipeGestures() {
    if (!isMobile()) return;
    
    let touchStartX = 0;
    let touchEndX = 0;
    
    const container = document.querySelector('.container');
    
    container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    container.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            const activeTab = document.querySelector('.tab-btn.active');
            const allTabs = Array.from(document.querySelectorAll('.tab-btn:not(.hidden)'));
            const currentIndex = allTabs.indexOf(activeTab);
            
            if (diff > 0 && currentIndex < allTabs.length - 1) {
                // Swipe left - next tab
                const nextTab = allTabs[currentIndex + 1];
                switchToTab(nextTab.getAttribute('data-tab'));
            } else if (diff < 0 && currentIndex > 0) {
                // Swipe right - previous tab
                const prevTab = allTabs[currentIndex - 1];
                switchToTab(prevTab.getAttribute('data-tab'));
            }
        }
    }
}

// Mobile viewport height fix for iOS
function fixMobileViewport() {
    if (!isMobile()) return;
    
    const setViewportHeight = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
}

// Initialize everything
function initialize() {
    console.log('Initializing application...');
    
    // Initialize mobile features first
    toggleMobileNav();
    enhanceMobileForms();
    addSwipeGestures();
    fixMobileViewport();
    
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

    // Check for stored user session
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

    // Add mobile-specific enhancements
    if (isMobile()) {
        console.log('Mobile device detected - enabling mobile features');
        
        // Add mobile-specific event listeners
        document.addEventListener('touchstart', () => {
            document.body.classList.add('touch-active');
        });
        
        document.addEventListener('touchend', () => {
            setTimeout(() => {
                document.body.classList.remove('touch-active');
            }, 100);
        });
        
        // Optimize scrolling for mobile
        document.body.style.scrollBehavior = 'smooth';
        
        // Hide admin access on mobile for security
        const adminAccessBox = document.querySelector('.admin-access-box');
        if (adminAccessBox) {
            adminAccessBox.style.display = 'none';
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
