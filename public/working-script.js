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

// Smartphone-specific enhancements
function initSmartphoneEnhancements() {
    // Check if on smartphone (max-width: 575px)
    const isSmartphone = window.innerWidth <= 575;
    
    if (isSmartphone) {
        console.log('📱 Smartphone mode activated');
        
        // Add touch feedback for buttons
        addTouchFeedback();
        
        // Add swipe gestures for tabs
        addSwipeGestures();
        
        // Add haptic feedback (if supported)
        addHapticFeedback();
        
        // Optimize scrolling for mobile
        optimizeMobileScrolling();
        
        // Add pull-to-refresh for dashboard
        addPullToRefresh();
    }
}

// Add touch feedback for interactive elements
function addTouchFeedback() {
    const interactiveElements = document.querySelectorAll('.tab-btn, .btn, .card, tr');
    
    interactiveElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        element.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Add swipe gestures for tab navigation
function addSwipeGestures() {
    let touchStartX = 0;
    let touchEndX = 0;
    
    const tabContainer = document.querySelector('.tabs');
    if (!tabContainer) return;
    
    tabContainer.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    tabContainer.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            const tabs = ['login', 'register', 'about', 'contact', 'dashboard'];
            const currentTab = document.querySelector('.tab-btn.active')?.getAttribute('data-tab');
            const currentIndex = tabs.indexOf(currentTab);
            
            if (diff > 0 && currentIndex < tabs.length - 1) {
                // Swipe left - next tab
                switchToTab(tabs[currentIndex + 1]);
            } else if (diff < 0 && currentIndex > 0) {
                // Swipe right - previous tab
                switchToTab(tabs[currentIndex - 1]);
            }
        }
    }
}

// Add haptic feedback for better user experience
function addHapticFeedback() {
    if ('vibrate' in navigator) {
        const buttons = document.querySelectorAll('.btn, .tab-btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                navigator.vibrate(50); // Light vibration for 50ms
            });
        });
        
        // Add stronger feedback for successful actions
        const originalShowMessage = showMessage;
        showMessage = function(elementId, message, isError = false) {
            originalShowMessage(elementId, message, isError);
            if (!isError) {
                navigator.vibrate([100, 50, 100]); // Success vibration pattern
            } else {
                navigator.vibrate(200); // Error vibration
            }
        };
    }
}

// Optimize scrolling for mobile
function optimizeMobileScrolling() {
    // Smooth scrolling for better mobile experience
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Prevent bounce scrolling on iOS
    document.body.addEventListener('touchmove', function(e) {
        if (e.target.closest('.modules-wrapper, .lecturers-wrapper, .timetable-wrapper')) {
            // Allow scrolling within tables
            return;
        }
        e.preventDefault();
    }, { passive: false });
    
    // Add momentum scrolling to tables
    const scrollableElements = document.querySelectorAll('.modules-wrapper, .lecturers-wrapper, .timetable-wrapper');
    scrollableElements.forEach(element => {
        element.style.webkitOverflowScrolling = 'touch';
        element.style.overflowY = 'auto';
    });
}

// Add pull-to-refresh functionality
function addPullToRefresh() {
    let startY = 0;
    let isPulling = false;
    const pullThreshold = 100;
    
    document.addEventListener('touchstart', function(e) {
        if (window.scrollY === 0) {
            startY = e.touches[0].pageY;
            isPulling = true;
        }
    });
    
    document.addEventListener('touchmove', function(e) {
        if (!isPulling) return;
        
        const currentY = e.touches[0].pageY;
        const pullDistance = currentY - startY;
        
        if (pullDistance > 0 && pullDistance < pullThreshold) {
            // Show pull indicator
            showPullIndicator(pullDistance / pullThreshold);
        }
    });
    
    document.addEventListener('touchend', function(e) {
        if (!isPulling) return;
        
        const currentY = e.changedTouches[0].pageY;
        const pullDistance = currentY - startY;
        
        if (pullDistance > pullThreshold) {
            // Trigger refresh
            refreshDashboard();
            showRefreshIndicator();
        }
        
        hidePullIndicator();
        isPulling = false;
    });
}

// Show pull-to-refresh indicator
function showPullIndicator(progress) {
    let indicator = document.getElementById('pull-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'pull-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: -50px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 0.9rem;
            z-index: 1000;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(52,152,219,0.4);
        `;
        document.body.appendChild(indicator);
    }
    
    indicator.style.top = `${-50 + (progress * 60)}px`;
    indicator.innerHTML = progress > 0.8 ? '🔄 Release to refresh' : '📱 Pull to refresh';
}

// Hide pull-to-refresh indicator
function hidePullIndicator() {
    const indicator = document.getElementById('pull-indicator');
    if (indicator) {
        indicator.style.top = '-50px';
    }
}

// Show refresh indicator
function showRefreshIndicator() {
    const indicator = document.getElementById('pull-indicator');
    if (indicator) {
        indicator.innerHTML = '✅ Refreshing...';
        indicator.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
        
        setTimeout(() => {
            hidePullIndicator();
        }, 2000);
    }
}

// Add mobile-specific animations
function addMobileAnimations() {
    // Animate elements as they come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe cards and tables
    const elementsToAnimate = document.querySelectorAll('.card, .modules-wrapper, .lecturers-wrapper, .timetable-wrapper');
    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });
}

// Initialize everything
function initialize() {
    console.log('Initializing application...');
    
    // Initialize smartphone-specific enhancements
    initSmartphoneEnhancements();
    
    // Add mobile animations
    addMobileAnimations();
    
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
