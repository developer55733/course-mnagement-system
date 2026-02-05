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
    
    if (popupName) popupName.textContent = currentUser.name;
    if (popupEmail) popupEmail.textContent = currentUser.email;
    if (popupStudentId) popupStudentId.textContent = currentUser.studentId || 'N/A';

    // Show dashboard elements
    const userProfileHeader = document.getElementById('user-profile-header');
    const dashboardTab = document.getElementById('dashboard-tab');
    
    if (userProfileHeader) userProfileHeader.classList.remove('hidden');
    if (dashboardTab) dashboardTab.classList.remove('hidden');
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
