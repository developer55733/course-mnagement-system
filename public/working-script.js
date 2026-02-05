// Working IT Management System Script
const API_BASE_URL = window.location.origin + '/api';
let currentUser = null;

// Mobile Detection
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 767;

// Enhanced Mobile Interactions
if (isMobile) {
    // Add touch feedback
    document.addEventListener('touchstart', function(e) {
        if (e.target.closest('.tab-btn, .btn, .card, tr')) {
            e.target.closest('.tab-btn, .btn, .card, tr').style.transform = 'scale(0.98)';
        }
    });

    document.addEventListener('touchend', function(e) {
        if (e.target.closest('.tab-btn, .btn, .card, tr')) {
            setTimeout(() => {
                e.target.closest('.tab-btn, .btn, .card, tr').style.transform = '';
            }, 150);
        }
    });

    // Haptic feedback for mobile (if supported)
    function triggerHaptic(type = 'light') {
        if ('vibrate' in navigator) {
            switch(type) {
                case 'light':
                    navigator.vibrate(10);
                    break;
                case 'medium':
                    navigator.vibrate(25);
                    break;
                case 'heavy':
                    navigator.vibrate([50, 30, 50]);
                    break;
            }
        }
    }

    // Add swipe gestures for navigation
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            const tabs = ['login', 'register', 'about', 'contact', 'dashboard'];
            const currentTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
            const currentIndex = tabs.indexOf(currentTab);

            if (diff > 0 && currentIndex < tabs.length - 1) {
                // Swipe left - next tab
                switchToTab(tabs[currentIndex + 1]);
                triggerHaptic('light');
            } else if (diff < 0 && currentIndex > 0) {
                // Swipe right - previous tab
                switchToTab(tabs[currentIndex - 1]);
                triggerHaptic('light');
            }
        }
    }

    // Add pull-to-refresh functionality
    let pullStartY = 0;
    let pullEndY = 0;
    let isPulling = false;

    document.addEventListener('touchstart', function(e) {
        if (window.scrollY === 0) {
            pullStartY = e.changedTouches[0].screenY;
            isPulling = true;
        }
    });

    document.addEventListener('touchmove', function(e) {
        if (isPulling) {
            pullEndY = e.changedTouches[0].screenY;
            const pullDistance = pullEndY - pullStartY;
            
            if (pullDistance > 100) {
                document.body.style.transform = `translateY(${Math.min(pullDistance * 0.5, 100)}px)`;
            }
        }
    });

    document.addEventListener('touchend', function(e) {
        if (isPulling) {
            const pullDistance = pullEndY - pullStartY;
            document.body.style.transform = '';
            
            if (pullDistance > 150) {
                triggerHaptic('medium');
                refreshDashboard();
                showMessage('dashboard-message', 'Refreshing data...', false);
                setTimeout(() => {
                    showMessage('dashboard-message', 'Data refreshed!', false);
                }, 1000);
            }
            
            isPulling = false;
        }
    });

    // Add mobile-specific loading states
    function showMobileLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = '<div class="loading"></div> Loading...';
        }
    }

    // Add mobile-specific error handling
    function showMobileError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `<div style="color: #f44336; text-align: center; padding: 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px;"></i><br>
                ${message}<br>
                <button onclick="location.reload()" style="margin-top: 10px; padding: 10px 20px; background: #f44336; color: white; border: none; border-radius: 5px;">
                    Try Again
                </button>
            </div>`;
            triggerHaptic('heavy');
        }
    }

    // Enhanced mobile API calls with loading states
    async function mobileApiCall(endpoint, method = 'GET', data = null, loadingElementId = null) {
        try {
            if (loadingElementId) {
                showMobileLoading(loadingElementId);
            }
            
            const result = await apiCall(endpoint, method, data);
            
            if (loadingElementId) {
                // Clear loading state - actual content will be set by calling function
            }
            
            triggerHaptic('light');
            return result;
        } catch (error) {
            if (loadingElementId) {
                showMobileError(loadingElementId, error.message);
            }
            throw error;
        }
    }

    // Override API calls for mobile
    const originalApiCall = window.apiCall;
    window.apiCall = mobileApiCall;
}

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
            showMessage('login-message', 'Login successful!');
            
            setTimeout(() => {
                switchToTab('dashboard');
                updateDashboard();
            }, 1000);
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('login-message', error.message, true);
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
            showMessage('register-message', 'Registration successful! Please log in.');
            document.getElementById('register-form')?.reset();
            
            setTimeout(() => {
                switchToTab('login');
            }, 1000);
        }
    } catch (error) {
        console.error('Register error:', error);
        showMessage('register-message', error.message, true);
    }
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
        const response = await apiCall('/modules', 'GET', null, isMobile ? 'modules-list' : null);
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
        if (isMobile) {
            showMobileError('modules-list', 'Failed to load modules');
        } else {
            const modulesList = document.getElementById('modules-list');
            if (modulesList) {
                modulesList.innerHTML = '<tr><td colspan="3" style="text-align: center; color: red;">Error loading modules</td></tr>';
            }
        }
    }
}

// Load lecturers
async function loadLecturers() {
    try {
        const response = await apiCall('/lecturers', 'GET', null, isMobile ? 'lecturers-list' : null);
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
        if (isMobile) {
            showMobileError('lecturers-list', 'Failed to load lecturers');
        } else {
            const lecturersList = document.getElementById('lecturers-list');
            if (lecturersList) {
                lecturersList.innerHTML = '<tr><td colspan="3" style="text-align: center; color: red;">Error loading lecturers</td></tr>';
            }
        }
    }
}

// Load timetable
async function loadTimetable() {
    try {
        const response = await apiCall('/timetable', 'GET', null, isMobile ? 'timetable-list' : null);
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
        if (isMobile) {
            showMobileError('timetable-list', 'Failed to load timetable');
        } else {
            const timetableList = document.getElementById('timetable-list');
            if (timetableList) {
                timetableList.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Error loading timetable</td></tr>';
            }
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

// Initialize everything
function initialize() {
    console.log('Initializing application...');
    
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
