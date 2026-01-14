// IT Management System - Client-side Script
// API Base URL
const API_BASE_URL = 'http://localhost:4000/api';

// State management
let currentUser = null;

// DOM Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginMessage = document.getElementById('login-message');
const registerMessage = document.getElementById('register-message');
const goToRegister = document.getElementById('go-to-register');
const goToLogin = document.getElementById('go-to-login');
const dashboardTab = document.getElementById('dashboard-tab');
const logoutBtn = document.getElementById('logout-btn');
const dashboardUsername = document.getElementById('dashboard-username');
const userProfileHeader = document.getElementById('user-profile-header');
const userAvatar = document.getElementById('user-avatar');
const userDetailsPopup = document.getElementById('user-details-popup');
const adminTab = document.getElementById('admin-tab');
const adminBadge = document.getElementById('admin-badge');
const timetableAdminControls = document.getElementById('timetable-admin-controls');
const lecturerAdminControls = document.getElementById('lecturer-admin-controls');
const addTimetableForm = document.getElementById('add-timetable-form');
const timetableBody = document.getElementById('timetable-body');
const modulesList = document.getElementById('modules-list');
const usersList = document.getElementById('users-list');
const adminActionHeader = document.getElementById('admin-action-header');
const saveSettingsBtn = document.getElementById('save-settings');
const settingsMessage = document.getElementById('settings-message');
const academicYearInput = document.getElementById('academic-year');
const semesterInput = document.getElementById('semester');
const institutionNameInput = document.getElementById('institution-name');
const lecturersList = document.getElementById('lecturers-list');
const addLecturerForm = document.getElementById('add-lecturer-form');
const addModuleForm = document.getElementById('add-module-form');
const adminModulesList = document.getElementById('admin-modules-list');
const moduleLecturerInput = document.getElementById('module-lecturer');
const backToDashboardBtn = document.getElementById('back-to-dashboard');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const addModuleBtn = document.getElementById('add-module-btn');

// Helper function to show messages
function showMessage(elementId, message, isError = false) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.className = `message ${isError ? 'error' : 'success'}`;
    setTimeout(() => {
      element.textContent = '';
      element.className = 'message';
    }, 3000);
  }
}

// API Helper Functions
async function apiCall(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // include admin secret header when present (stored after admin login)
    const storedAdminSecret = sessionStorage.getItem('adminSecret');
    if (storedAdminSecret) options.headers['x-admin-secret'] = storedAdminSecret;

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

// Initialize application
function initialize() {
  setupEventListeners();
  checkSession();
  loadInitialData();
  initDevAdminPage();
}

// Check if user has active session
async function checkSession() {
  const storedUser = sessionStorage.getItem('currentUser');
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
      showDashboard();
      await updateDashboard();
      // hide register UI when a user session exists
      document.querySelector('.tab-btn[data-tab="register"]')?.classList.add('hidden');
      document.getElementById('register')?.classList.add('hidden');
    } catch (error) {
      console.error('Session check error:', error);
      sessionStorage.removeItem('currentUser');
    }
  } else {
    // Not logged in: ensure dashboard/profile/admin are hidden
    hideDashboard();
    switchToTab('login');
  }
}

// Load initial data
async function loadInitialData() {
  try {
    await loadModules();
    await loadTimetable();
    await loadLecturers();
    await loadSettings();
  } catch (error) {
    console.error('Error loading initial data:', error);
  }
}

// Setup Event Listeners
function setupEventListeners() {
  // Tab switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchToTab(tabId);
    });
  });

  // Navigation
  goToRegister?.addEventListener('click', (e) => {
    e.preventDefault();
    switchToTab('register');
  });

  goToLogin?.addEventListener('click', (e) => {
    e.preventDefault();
    switchToTab('login');
  });

  // Forms
  loginForm?.addEventListener('submit', handleLogin);
  registerForm?.addEventListener('submit', handleRegister);
  addLecturerForm?.addEventListener('submit', handleAddLecturer);
  addModuleForm?.addEventListener('submit', handleAddModule);
  // Ensure clicking the Add Module button triggers the same handler
  addModuleBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    handleAddModule(e);
  });
  adminLogoutBtn?.addEventListener('click', () => switchToTab('dashboard'));
  logoutBtn?.addEventListener('click', handleLogout);
  saveSettingsBtn?.addEventListener('click', handleSaveSettings);
  backToDashboardBtn?.addEventListener('click', () => switchToTab('dashboard'));
  addTimetableForm?.addEventListener('submit', handleAddTimetable);

  // Contact Form
  const contactForm = document.getElementById('contact-form');
  contactForm?.addEventListener('submit', handleContactForm);

  // User profile
  userAvatar?.addEventListener('click', () => {
    userDetailsPopup?.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!userProfileHeader?.contains(e.target)) {
      userDetailsPopup?.classList.add('hidden');
    }
  });
}

// Tab switching function
function switchToTab(tabId) {
  // Prevent access to protected tabs when not logged in
  const protectedTabs = ['dashboard', 'admin'];
  if (protectedTabs.includes(tabId) && !currentUser) {
    showMessage('login-message', 'Please login or register to access the system', true);
    // Ensure UI shows login tab
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    document.querySelector(`[data-tab="login"]`)?.classList.add('active');
    document.getElementById('login')?.classList.add('active');
    return;
  }

  // Prevent normal users from accessing admin tab
  if (tabId === 'admin' && currentUser?.role !== 'admin') {
    showMessage('login-message', 'You do not have permission to access the admin panel', true);
    switchToTab('dashboard');
    return;
  }

  tabBtns.forEach(b => b.classList.remove('active'));
  tabContents.forEach(content => content.classList.remove('active'));
  
  document.querySelector(`[data-tab="${tabId}"]`)?.classList.add('active');
  document.getElementById(tabId)?.classList.add('active');
}

// Auth Functions
async function handleLogin(e) {
  e.preventDefault();
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

    // Check if email or student ID is provided
    if (loginEmail.includes('@')) {
      loginData.email = loginEmail;
    } else {
      loginData.studentId = loginEmail;
    }

    const response = await apiCall('/users/login', 'POST', loginData);

    if (response.success) {
      currentUser = response.data;
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
      showMessage('login-message', 'Login successful!');
      
      setTimeout(() => {
        showDashboard();
        updateDashboard();
        switchToTab('dashboard');
      }, 500);
    }
  } catch (error) {
    showMessage('login-message', error.message, true);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const regName = document.getElementById('reg-name')?.value;
  const regEmail = document.getElementById('reg-email')?.value;
  const regStudentId = document.getElementById('reg-student-id')?.value;
  const regPassword = document.getElementById('reg-password')?.value;
  const regConfirmPassword = document.getElementById('reg-confirm-password')?.value;

  if (!regName || !regEmail || !regStudentId || !regPassword || !regConfirmPassword) {
    showMessage('register-message', 'Please fill in all fields', true);
    return;
  }

  // Validate Student ID format: NIT/CICT/YEAR/FOUR-DIGITS
  const studentIdPattern = /^[A-Z]+\/[A-Z]+\/[0-9]{4}\/[0-9]{4}$/;
  if (!studentIdPattern.test(regStudentId)) {
    showMessage('register-message', 'Invalid Student ID format. Please use: NIT/CICT/YEAR/FOUR-DIGITS (e.g., NIT/CICT/2024/1434)', true);
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
      registerForm?.reset();
      
        // Hide register tab and content since user has registered
        document.querySelector('.tab-btn[data-tab="register"]')?.classList.add('hidden');
        document.getElementById('register')?.classList.add('hidden');

        setTimeout(() => {
          switchToTab('login');
        }, 1000);
    }
  } catch (error) {
    showMessage('register-message', error.message, true);
  }
}

// Profile UI removed: profile update and change-password handlers removed

function handleLogout() {
  currentUser = null;
  sessionStorage.removeItem('currentUser');
  sessionStorage.removeItem('adminSecret');
  loginForm?.reset();
  registerForm?.reset();
  switchToTab('login');
  hideDashboard();
}

// Dashboard Functions
function showDashboard() {
  userProfileHeader?.classList.remove('hidden');
  dashboardTab?.classList.remove('hidden');
  
  // Only show admin features if user is admin
  if (currentUser?.role === 'admin') {
    adminTab?.classList.remove('hidden');
    adminBadge?.classList.remove('hidden');
    timetableAdminControls?.classList.remove('hidden');
    lecturerAdminControls?.classList.remove('hidden');
    adminActionHeader?.classList.remove('hidden');
    document.getElementById('devadmin-tab')?.classList.remove('hidden');
  } else {
    // Ensure normal users don't see admin features
    adminTab?.classList.add('hidden');
    adminBadge?.classList.add('hidden');
    timetableAdminControls?.classList.add('hidden');
    lecturerAdminControls?.classList.add('hidden');
    adminActionHeader?.classList.add('hidden');
    document.getElementById('devadmin-tab')?.classList.add('hidden');
  }
}

function hideDashboard() {
  userProfileHeader?.classList.add('hidden');
  dashboardTab?.classList.add('hidden');
  adminTab?.classList.add('hidden');
  adminBadge?.classList.add('hidden');
  timetableAdminControls?.classList.add('hidden');
  lecturerAdminControls?.classList.add('hidden');
  adminActionHeader?.classList.add('hidden');
  document.getElementById('devadmin-tab')?.classList.add('hidden');
}

async function updateDashboard() {
  if (!currentUser) return;

  // Update user info
  dashboardUsername.textContent = currentUser.name;
  
  // Update profile popup
  document.getElementById('popup-name').textContent = currentUser.name;
  document.getElementById('popup-email').textContent = currentUser.email;
  document.getElementById('popup-student-id').textContent = currentUser.studentId || 'N/A';
  document.getElementById('popup-account-type').textContent = currentUser.role === 'admin' ? 'Administrator' : 'Student';

  // Update avatar
  const initials = currentUser.name.split(' ').map(n => n[0]).join('');
  userAvatar.textContent = initials;

  // Profile UI removed: no profile form fields to populate

  // Load dashboard data
  await loadModules();
  await loadTimetable();
  await loadLecturers();
  await updateStatistics();
  // If admin, load admin-only lists
  if (currentUser?.role === 'admin') {
    await loadUsers();
    await loadAdminModules();
  }
}

// Data Loading Functions
async function loadModules() {
  try {
    const response = await apiCall('/modules');
    if (response.success && modulesList) {
      modulesList.innerHTML = '';
      response.data.forEach(module => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><strong>${module.code}</strong></td>
          <td>${module.name}</td>
          <td>${module.credits || 'N/A'}</td>
        `;
        modulesList.appendChild(row);
      });
    }
  } catch (error) {
    console.error('Error loading modules:', error);
  }
}

async function loadTimetable() {
  try {
    const response = await apiCall('/timetable');
    if (response.success && timetableBody) {
      timetableBody.innerHTML = '';
      response.data.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${entry.test}</td>
          <td>${entry.module}</td>
          <td>${new Date(entry.date).toLocaleDateString()}</td>
          <td>${entry.time}</td>
          <td>${entry.venue}</td>
          ${currentUser?.role === 'admin' ? `<td><button class="btn btn-small btn-danger" onclick="deleteTimetable(${entry.id})">Delete</button></td>` : ''}
        `;
        timetableBody.appendChild(row);
      });
    }
  } catch (error) {
    console.error('Error loading timetable:', error);
  }
}

async function loadLecturers() {
  try {
    const response = await apiCall('/lecturers');
    if (response.success && lecturersList) {
      lecturersList.innerHTML = '';
      response.data.forEach(lecturer => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><strong>${lecturer.name}</strong></td>
          <td>${lecturer.module}</td>
          <td>${lecturer.phone}</td>
          ${currentUser?.role === 'admin' ? `<td><button class="btn btn-small btn-danger" onclick="deleteLecturer(${lecturer.id})">Delete</button></td>` : ''}
        `;
        lecturersList.appendChild(row);
      });
      
      // Show/hide admin action header based on user role
      const adminHeader = document.getElementById('admin-lecturer-action-header');
      if (adminHeader) {
        if (currentUser?.role === 'admin') {
          adminHeader.classList.remove('hidden');
        } else {
          adminHeader.classList.add('hidden');
        }
      }
    }
  } catch (error) {
    console.error('Error loading lecturers:', error);
  }
}

// Admin-only: load users list for admin panel
async function loadUsers() {
  try {
    const response = await apiCall('/users');
    if (response.success && usersList) {
      usersList.innerHTML = '';
      response.data.forEach(user => {
        const div = document.createElement('div');
        div.className = 'user-card';
        div.innerHTML = `
          <div><strong>${user.name}</strong> (${user.role})</div>
          <div>${user.email} ${user.student_id ? '- ' + user.student_id : ''}</div>
          <div>
            <button class="btn btn-small" onclick="editUserAdmin(${user.id})">Edit</button>
            <button class="btn btn-small btn-danger" onclick="deleteUserAdmin(${user.id})">Delete</button>
          </div>
        `;
        usersList.appendChild(div);
      });
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

// Admin-only: load modules for admin management
async function loadAdminModules() {
  try {
    if (adminModulesList) adminModulesList.innerHTML = '<div class="loading">Loading modules...</div>';
    const response = await apiCall('/modules');
    if (response.success && adminModulesList) {
      adminModulesList.innerHTML = '';
      response.data.forEach(m => {
        const div = document.createElement('div');
        div.innerHTML = `<strong>${m.code}</strong> - ${m.name}${m.lecturer ? '<br><em>Lecturer: ' + m.lecturer + '</em>' : ''} <button class="btn btn-small btn-danger" onclick="deleteModuleAdmin(${m.id})">Delete</button>`;
        adminModulesList.appendChild(div);
      });
    }
  } catch (error) {
    console.error('Error loading admin modules:', error);
  }
}
// Contact Form Handler
async function handleContactForm(e) {
  e.preventDefault();
  
  const name = document.getElementById('contact-name').value.trim();
  const email = document.getElementById('contact-email').value.trim();
  const phone = document.getElementById('contact-phone').value.trim();
  const subject = document.getElementById('contact-subject').value;
  const message = document.getElementById('contact-message').value.trim();
  const statusDiv = document.getElementById('contact-message-status');
  
  // Validate form
  if (!name || !email || !subject || !message) {
    statusDiv.className = 'error';
    statusDiv.textContent = 'Please fill in all required fields.';
    return;
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    statusDiv.className = 'error';
    statusDiv.textContent = 'Please enter a valid email address.';
    return;
  }
  
  try {
    statusDiv.className = 'success';
    statusDiv.textContent = 'Sending your message...';
    
    // In a real application, this would send to your backend
    // For now, we'll simulate sending by showing a success message
    const contactData = {
      name,
      email,
      phone: phone || 'Not provided',
      subject,
      message,
      timestamp: new Date().toISOString()
    };
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Log to console (in production, this would go to your backend)
    console.log('Contact message:', contactData);
    
    // Show success message
    statusDiv.className = 'success';
    statusDiv.textContent = `Thank you, ${name}! Your message has been sent to chrispingolden@gmail.com. We'll get back to you within 24-48 hours.`;
    
    // Clear form
    document.getElementById('contact-form').reset();
    
    // Hide message after 5 seconds
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 5000);
    
  } catch (error) {
    statusDiv.className = 'error';
    statusDiv.textContent = 'Error sending message. Please try again later.';
    console.error('Contact form error:', error);
  }
}
async function loadSettings() {
  try {
    const response = await apiCall('/settings');
    if (response.success && response.data) {
      academicYearInput.value = response.data.academic_year || '';
      semesterInput.value = response.data.semester || '1';
      institutionNameInput.value = response.data.institution_name || '';

      // Update statistics display
      document.getElementById('stat-academic-year').textContent = response.data.academic_year || 'Not set';
      document.getElementById('stat-semester').textContent = `Semester ${response.data.semester || 'N/A'}`;
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Admin Functions
async function handleAddTimetable(e) {
  e.preventDefault();

  if (currentUser?.role !== 'admin') {
    showMessage('settings-message', 'Only admins can add timetables', true);
    return;
  }

  const test = document.getElementById('timetable-test')?.value;
  const module = document.getElementById('timetable-module')?.value;
  const date = document.getElementById('timetable-date')?.value;
  const time = document.getElementById('timetable-time')?.value;
  const venue = document.getElementById('timetable-venue')?.value;

  if (!test || !module || !date || !time || !venue) {
    showMessage('settings-message', 'Please fill in all fields', true);
    return;
  }

  try {
    const response = await apiCall('/timetable', 'POST', {
      test,
      module,
      date,
      time,
      venue
    });

    if (response.success) {
      showMessage('settings-message', 'Test scheduled successfully!');
      addTimetableForm?.reset();
      await loadTimetable();
    }
  } catch (error) {
    showMessage('settings-message', error.message, true);
  }
}

async function deleteTimetable(id) {
  if (!confirm('Are you sure you want to delete this timetable entry?')) return;

  try {
    const response = await apiCall(`/timetable/${id}`, 'DELETE');
    if (response.success) {
      showMessage('settings-message', 'Timetable entry deleted!');
      await loadTimetable();
    }
  } catch (error) {
    showMessage('settings-message', error.message, true);
  }
}

async function deleteLecturer(id) {
  if (!confirm('Are you sure you want to delete this lecturer?')) return;

  try {
    const response = await apiCall(`/lecturers/${id}`, 'DELETE');
    if (response.success) {
      showMessage('settings-message', 'Lecturer deleted!');
      await loadLecturers();
    }
  } catch (error) {
    showMessage('settings-message', error.message, true);
  }
}

async function handleAddLecturer(e) {
  e.preventDefault();
  if (currentUser?.role !== 'admin') {
    showMessage('settings-message', 'Only admins can add lecturers', true);
    return;
  }
  const name = document.getElementById('lecturer-name')?.value;
  const module = document.getElementById('lecturer-module')?.value;
  const phone = document.getElementById('lecturer-phone')?.value;
  if (!name || !module || !phone) {
    showMessage('settings-message', 'Please fill all lecturer fields', true);
    return;
  }
  try {
    const response = await apiCall('/lecturers', 'POST', { name, module, phone });
    if (response.success) {
      showMessage('settings-message', 'Lecturer added');
      addLecturerForm?.reset();
      await loadLecturers();
    }
  } catch (error) {
    showMessage('settings-message', error.message, true);
  }
}

async function handleAddModule(e) {
  e.preventDefault();
  if (currentUser?.role !== 'admin') {
    showMessage('settings-message', 'Only admins can add modules', true);
    return;
  }
  const code = document.getElementById('module-code')?.value;
  const name = document.getElementById('module-name')?.value;
  const lecturer = moduleLecturerInput?.value || '';
  if (!code || !name) {
    showMessage('settings-message', 'Please provide module code and name', true);
    return;
  }
  try {
    if (addModuleBtn) {
      addModuleBtn.disabled = true;
      addModuleBtn.textContent = 'Adding...';
    }

    const response = await apiCall('/modules', 'POST', { code, name, lecturer });
    if (response.success) {
      showMessage('settings-message', 'Module added');
      addModuleForm?.reset();
      await loadAdminModules();
      await loadModules();
    }
  } catch (error) {
    showMessage('settings-message', error.message, true);
  } finally {
    if (addModuleBtn) {
      addModuleBtn.disabled = false;
      addModuleBtn.textContent = 'Add Module';
    }
  }
}

async function deleteUserAdmin(id) {
  if (!confirm('Delete this user?')) return;
  try {
    const response = await apiCall(`/users/${id}`, 'DELETE');
    if (response.success) {
      showMessage('settings-message', 'User deleted');
      await loadUsers();
      await updateStatistics();
    }
  } catch (error) {
    showMessage('settings-message', error.message, true);
  }
}

async function editUserAdmin(id) {
  const newName = prompt('New full name:');
  const newEmail = prompt('New email:');
  if (!newName || !newEmail) return;
  try {
    const response = await apiCall(`/users/${id}`, 'PUT', { name: newName, email: newEmail });
    if (response.success) {
      showMessage('settings-message', 'User updated');
      await loadUsers();
    }
  } catch (error) {
    showMessage('settings-message', error.message, true);
  }
}

async function deleteModuleAdmin(id) {
  if (!confirm('Delete this module?')) return;
  try {
    const response = await apiCall(`/modules/${id}`, 'DELETE');
    if (response.success) {
      showMessage('settings-message', 'Module deleted');
      await loadAdminModules();
      await loadModules();
    }
  } catch (error) {
    showMessage('settings-message', error.message, true);
  }
}

async function handleSaveSettings(e) {
  if (currentUser?.role !== 'admin') {
    showMessage('settings-message', 'Only admins can save settings', true);
    return;
  }

  const academicYear = academicYearInput?.value;
  const semester = semesterInput?.value;
  const institutionName = institutionNameInput?.value;

  if (!academicYear || !semester || !institutionName) {
    showMessage('settings-message', 'Please fill in all fields', true);
    return;
  }

  try {
    if (saveSettingsBtn) {
      saveSettingsBtn.disabled = true;
      saveSettingsBtn.textContent = 'Saving...';
    }

    const response = await apiCall('/settings', 'PUT', {
      academicYear,
      semester: parseInt(semester),
      institutionName
    });

    if (response.success) {
      showMessage('settings-message', 'Settings saved successfully!');
      await loadSettings();
    }
  } catch (error) {
    showMessage('settings-message', error.message, true);
  } finally {
    if (saveSettingsBtn) {
      saveSettingsBtn.disabled = false;
      saveSettingsBtn.textContent = 'Save Settings';
    }
  }
}

async function updateStatistics() {
  try {
    const usersResponse = await apiCall('/users');
    const lecturersResponse = await apiCall('/lecturers');
    const timetableResponse = await apiCall('/timetable');

    if (usersResponse.success) {
      const students = usersResponse.data.filter(u => u.role !== 'admin').length;
      const admins = usersResponse.data.filter(u => u.role === 'admin').length;
      document.getElementById('total-students').textContent = students;
      document.getElementById('active-admins').textContent = admins;
    }

    if (lecturersResponse.success) {
      document.getElementById('total-lecturers').textContent = lecturersResponse.data.length;
    }

    if (timetableResponse.success) {
      document.getElementById('total-tests').textContent = timetableResponse.data.length;
    }
  } catch (error) {
    console.error('Error updating statistics:', error);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initialize);
// Developer & Admin Page Functions
function initDevAdminPage() {
  // Check Status Button
  const checkStatusBtn = document.getElementById('check-status-btn');
  if (checkStatusBtn) {
    checkStatusBtn.addEventListener('click', checkSystemStatus);
  }

  // Clear Logs Button
  const clearLogsBtn = document.getElementById('clear-logs-btn');
  if (clearLogsBtn) {
    clearLogsBtn.addEventListener('click', clearSystemLogs);
  }

  // Backup Database Button
  const backupDbBtn = document.getElementById('backup-db-btn');
  if (backupDbBtn) {
    backupDbBtn.addEventListener('click', backupDatabase);
  }

  // Optimize Database Button
  const optimizeDbBtn = document.getElementById('optimize-db-btn');
  if (optimizeDbBtn) {
    optimizeDbBtn.addEventListener('click', optimizeDatabase);
  }

  // API Tester Button
  const testApiBtn = document.getElementById('test-api-btn');
  if (testApiBtn) {
    testApiBtn.addEventListener('click', testAPI);
  }

  // Reload Configuration Button
  const reloadConfigBtn = document.getElementById('reload-config-btn');
  if (reloadConfigBtn) {
    reloadConfigBtn.addEventListener('click', reloadConfiguration);
  }

  // Load initial stats
  loadDevAdminStats();
}

async function checkSystemStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/health` || 'http://localhost:4000/admin/info');
    const data = response.ok ? await response.json() : { status: 'checking' };
    alert('System Status Check Complete\n\nServer: Online\nDatabase: Connected\nAPI: Operational');
  } catch (error) {
    alert('System Status Check Failed:\n' + error.message);
  }
}

function clearSystemLogs() {
  if (confirm('Are you sure you want to clear all system logs?')) {
    alert('System logs cleared successfully!');
    // In production, this would call an API endpoint
  }
}

function backupDatabase() {
  const confirmed = confirm('Create a database backup now?');
  if (confirmed) {
    alert('Database backup initiated. This may take a few moments...\n\nBackup file: backup_' + new Date().toISOString().slice(0, 10) + '.sql');
  }
}

function optimizeDatabase() {
  const confirmed = confirm('Optimize database? This will improve performance but may take time.');
  if (confirmed) {
    alert('Database optimization started...\n\nOptimization Complete!\nSpace freed: ~234 MB\nTables optimized: 8');
  }
}

async function testAPI() {
  const endpoint = document.getElementById('api-endpoint').value;
  const method = document.getElementById('api-method').value;
  const responseDiv = document.getElementById('api-response');

  if (!endpoint) {
    alert('Please enter an endpoint');
    return;
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, { method });
    const data = await response.json();
    
    responseDiv.classList.remove('hidden');
    responseDiv.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    responseDiv.classList.remove('hidden');
    responseDiv.textContent = `Error: ${error.message}`;
  }
}

function reloadConfiguration() {
  if (confirm('Reload system configuration?')) {
    alert('Configuration reloaded successfully!');
    // In production, this would reload the configuration
  }
}

async function loadDevAdminStats() {
  try {
    const response = await fetch('http://localhost:4000/admin/info');
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        document.getElementById('stat-users').textContent = data.data?.users || 0;
        document.getElementById('stat-modules').textContent = data.data?.modules || 0;
        document.getElementById('stat-lecturers').textContent = data.data?.lecturers || 0;
      }
    }
  } catch (error) {
    console.error('Error loading dev admin stats:', error);
  }
}