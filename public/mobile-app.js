// Mobile App JavaScript
let currentUser = null;
let currentSection = 'dashboard';

// Initialize mobile app
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Mobile app initializing...');
    
    // Check device and redirect if needed
    const isMobileDevice = checkDeviceAndRedirect();
    if (!isMobileDevice) {
        console.log('🖥️ Not a mobile device, stopping initialization');
        return;
    }
    
    console.log('📱 Mobile device confirmed, continuing initialization...');
    
    // Load current user from session storage
    loadCurrentUser();
    
    // Initialize app
    initializeApp();
    
    console.log('✅ Mobile app initialization complete');
});

// Check if device is mobile and redirect if needed
function checkDeviceAndRedirect() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isSmallScreen = window.innerWidth <= 768;
    
    console.log('🔍 Device check:', {
        isMobile,
        isSmallScreen,
        userAgent: navigator.userAgent,
        pathname: window.location.pathname
    });
    
    // Only redirect to mobile if on mobile device AND small screen
    if (isMobile && isSmallScreen) {
        console.log('📱 Mobile device detected, staying on mobile interface');
        return true;
    }
    
    // If desktop user accesses mobile.html, redirect to main interface
    if (!isMobile && window.location.pathname.includes('mobile.html')) {
        console.log('🖥️ Desktop device detected, redirecting to main interface');
        window.location.href = '/index.html';
        return false;
    }
    
    // If mobile user accesses main interface on mobile device, redirect to mobile
    if (isMobile && !window.location.pathname.includes('mobile.html')) {
        console.log('📱 Mobile device detected, redirecting to mobile interface');
        window.location.href = '/mobile.html';
        return false;
    }
    
    return true;
}

// Load current user from session storage
function loadCurrentUser() {
    console.log('👤 Loading current user from session...');
    
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
            console.log('✅ User loaded from session:', currentUser);
            updateMobileUserInterface();
        } catch (error) {
            console.error('🚨 Error parsing stored user:', error);
            currentUser = null;
        }
    } else {
        console.log('📝 No user in session, using guest mode');
        currentUser = null;
        updateMobileUserInterface();
    }
}

// Update user interface with current user data
function updateMobileUserInterface() {
    console.log('🔄 Updating mobile user interface with:', currentUser);
    
    // Update user avatar
    const userAvatar = document.getElementById('mobile-user-avatar');
    if (userAvatar && currentUser && currentUser.name) {
        const initial = currentUser.name.charAt(0).toUpperCase();
        userAvatar.textContent = initial;
        console.log('✅ Updated user avatar with initial:', initial);
    }
    
    console.log('✅ Mobile user interface updated');
}

// Initialize app
function initializeApp() {
    console.log('🚀 Initializing mobile app...');
    
    // Set initial section
    showSection('dashboard');
    
    // Add interactive handlers
    setTimeout(() => {
        addInteractiveHandlers();
    }, 1000);
    
    console.log('✅ Mobile app initialized');
}

// Add interactive handlers
function addInteractiveHandlers() {
    console.log('🎯 Adding interactive handlers...');
    
    // Add any global interactive handlers here
    console.log('✅ Interactive handlers added');
}

// Show specific section
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    currentSection = sectionName;
    console.log(`📱 Showing section: ${sectionName}`);
}

// Toggle Mobile Menu
function toggleMobileMenu() {
    const menu = document.getElementById('mobileToggleMenu');
    const overlay = document.getElementById('menuOverlay');
    const menuIcon = document.getElementById('menuIcon');
    
    if (menu.style.display === 'none' || menu.style.display === '') {
        menu.style.display = 'block';
        overlay.style.display = 'block';
        menuIcon.className = 'fas fa-times';
    } else {
        menu.style.display = 'none';
        overlay.style.display = 'none';
        menuIcon.className = 'fas fa-bars';
    }
}

// Toggle User Menu (placeholder for future expansion)
function toggleUserMenu() {
    console.log('👤 User menu clicked');
    // Future: Add user dropdown menu functionality
}

// Mobile Login function
async function mobileLogin() {
    const email = document.getElementById('mobile-login-email').value.trim();
    const password = document.getElementById('mobile-login-password').value.trim();
    const messageEl = document.getElementById('mobile-login-message');
    
    if (!email || !password) {
        showMessage('mobile-login-message', 'Please fill in all fields', true);
        return;
    }
    
    try {
        showMessage('mobile-login-message', 'Logging in...', false);
        
        // Simulate login success (replace with real API call)
        setTimeout(() => {
            currentUser = {
                name: email.includes('@') ? email.split('@')[0] : email,
                email: email,
                studentId: email.includes('@') ? 'STU' + Math.random().toString(36).substr(2, 9).toUpperCase() : email.toUpperCase(),
                role: 'student'
            };
            
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateMobileUserInterface();
            showMessage('mobile-login-message', 'Login successful!', false);
            
            setTimeout(() => {
                showSection('dashboard');
            }, 1500);
        }, 1000);
        
    } catch (error) {
        console.error('Mobile login error:', error);
        showMessage('mobile-login-message', 'An error occurred during login. Please try again.', true);
    }
}

// Mobile Register function
async function mobileRegister() {
    const name = document.getElementById('mobile-register-name').value.trim();
    const email = document.getElementById('mobile-register-email').value.trim();
    const studentId = document.getElementById('mobile-register-studentId').value.trim();
    const password = document.getElementById('mobile-register-password').value.trim();
    const confirmPassword = document.getElementById('mobile-register-confirmPassword').value.trim();
    const messageEl = document.getElementById('mobile-register-message');
    
    if (!name || !email || !studentId || !password || !confirmPassword) {
        showMessage('mobile-register-message', 'Please fill in all fields', true);
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('mobile-register-message', 'Passwords do not match', true);
        return;
    }
    
    if (password.length < 6) {
        showMessage('mobile-register-message', 'Password must be at least 6 characters', true);
        return;
    }
    
    try {
        showMessage('mobile-register-message', 'Creating account...', false);
        
        // Simulate registration success (replace with real API call)
        setTimeout(() => {
            showMessage('mobile-register-message', 'Account created successfully! Please login.', false);
            
            // Clear form
            document.getElementById('mobile-register-name').value = '';
            document.getElementById('mobile-register-email').value = '';
            document.getElementById('mobile-register-studentId').value = '';
            document.getElementById('mobile-register-password').value = '';
            document.getElementById('mobile-register-confirmPassword').value = '';
            
            setTimeout(() => {
                showSection('login');
            }, 2000);
        }, 1000);
        
    } catch (error) {
        console.error('Mobile register error:', error);
        showMessage('mobile-register-message', 'An error occurred during registration. Please try again.', true);
    }
}

// Show message helper function
function showMessage(elementId, message, isError = false) {
    const messageEl = document.getElementById(elementId);
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = isError ? 'alert alert-danger' : 'alert alert-info';
        messageEl.style.display = 'block';
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }
}

// Perform Admin Action function
function performAdminAction() {
    console.log('🛡️ Admin action button clicked');
    
    if (!currentUser) {
        alert('Please login first to access admin features');
        showSection('login');
        return;
    }
    
    if (currentUser.role !== 'admin') {
        alert('Admin access required for this action');
        return;
    }
    
    // Perform admin action
    console.log('🔧 Performing admin action...');
    alert('Admin action performed successfully!');
    
    // You can expand this with actual admin functionality
    // For example: open admin panel, perform system maintenance, etc.
}

// Save Settings function
function saveSettings() {
    console.log('💾 Saving settings...');
    alert('Settings saved successfully!');
}

// Edit Profile function
function editProfile() {
    console.log('✏️ Edit profile clicked');
    alert('Profile editing feature coming soon!');
}

// Logout function
function mobileLogout() {
    console.log('🚪 Logging out...');
    
    currentUser = null;
    sessionStorage.removeItem('currentUser');
    updateMobileUserInterface();
    
    // Redirect to login section
    showSection('login');
    
    console.log('✅ Logged out successfully');
}
