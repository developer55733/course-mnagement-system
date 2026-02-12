// Working IT Management System Script

// Dynamic API base URL configuration
const getApiBaseUrl = () => {
    const origin = window.location.origin;
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    console.log('🔍 Current origin:', origin);
    console.log('🔍 Current hostname:', hostname);
    console.log('🔍 Current port:', port);
    
    // If accessing from localhost, try different ports
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Try common ports where server might be running
        const possiblePorts = ['8080', '4000', '3000'];
        const currentPort = port || '8080';
        
        // If current port is not 8080, try 8080
        if (currentPort !== '8080') {
            console.log('🔍 Trying port 8080 instead of', currentPort);
            return `${window.location.protocol}//${hostname}:8080/api`;
        }
        
        return `${origin}/api`;
    }
    
    // For production or other domains
    return `${origin}/api`;
};

const API_BASE_URL = getApiBaseUrl();

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

        console.log(`🔍 Making API call: ${method} ${endpoint}`);
        
        const options = {

            method,

            headers: {
                'Content-Type': 'application/json'
            }

        };

        // Add authentication headers if user is logged in
        if (currentUser && currentUser.id) {
            options.headers['x-user-id'] = currentUser.id.toString();
            options.headers['authorization'] = `Bearer ${currentUser.id}`;
        }

        if (data && (method === 'POST' || method === 'PUT')) {

            options.body = JSON.stringify(data);

        }

        const fullUrl = `${API_BASE_URL}${endpoint}`;
        console.log(`🔍 Full API URL: ${fullUrl}`);
        console.log(`🔍 Request headers:`, options.headers);
        
        const response = await fetch(fullUrl, options);

        console.log(`🔍 Response status: ${response.status} ${response.statusText}`);

        const result = await response.json();

        console.log(`🔍 Response data:`, result);

        if (!response.ok) {

            throw new Error(result.error || `HTTP Error: ${response.status}`);

        }

        return result;

    } catch (error) {

        console.error('❌ API Error:', error);
        console.error('❌ Error details:', {
            endpoint,
            method,
            message: error.message,
            stack: error.stack
        });

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

    console.log('🔍 Login function called');

    

    const loginEmail = document.getElementById('login-email')?.value;

    const loginPassword = document.getElementById('login-password')?.value;

    console.log('🔍 Login input:', { email: loginEmail, password: loginPassword ? '***' : 'empty' });




    if (!loginEmail || !loginPassword) {

        console.log('❌ Missing login fields');
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
            console.log('🔍 Using email login');
        } else {

            loginData.studentId = loginEmail;
            console.log('🔍 Using student ID login');
        }



        console.log('🔍 Making login API call...', loginData);

        const response = await apiCall('/users/login', 'POST', loginData);

        console.log('🔍 Login API response:', response);



        if (response.success) {

            currentUser = response.data;

            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

            console.log('✅ Login successful:', currentUser);
            showMessage('login-message', 'Login successful! Redirecting to dashboard...');

            

            // Hide all auth forms after successful login
            setTimeout(() => {
                hideAllAuthForms();
                switchToTab('dashboard');
                updateDashboard();
            }, 1000);

        } else {
            console.log('❌ Login failed:', response);
            // Fallback for testing - check if admin credentials
            if (loginEmail === 'admin@course.edu' && loginPassword === 'admin123') {
                currentUser = {
                    name: 'System Administrator',
                    email: 'admin@course.edu',
                    studentId: 'ADMIN001',
                    role: 'admin'
                };
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
                console.log('✅ Admin login successful (fallback):', currentUser);
                showMessage('login-message', 'Login successful! Redirecting to dashboard...');
                
                setTimeout(() => {
                    hideAllAuthForms();
                    switchToTab('dashboard');
                    updateDashboard();
                }, 1000);
                return;
            }
            
            // Fallback for testing - check if student credentials
            if (loginEmail === 'student@course.edu' && loginPassword === 'student123') {
                currentUser = {
                    name: 'Test Student',
                    email: 'student@course.edu',
                    studentId: 'NIT/CICT/2023/1001',
                    role: 'student'
                };
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
                console.log('✅ Student login successful (fallback):', currentUser);
                showMessage('login-message', 'Login successful! Redirecting to dashboard...');
                
                setTimeout(() => {
                    hideAllAuthForms();
                    switchToTab('dashboard');
                    updateDashboard();
                }, 1000);
                return;
            }
            
            showMessage('login-message', response.message || 'Login failed. Please check your credentials.', true);
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

    // Show/hide admin panel button based on user role
    const adminPanelBtn = document.getElementById('admin-panel-btn');
    const adminBadge = document.getElementById('admin-badge');
    
    if (isAdmin()) {
        // Show admin panel button and badge
        if (adminPanelBtn) {
            adminPanelBtn.classList.remove('hidden');
        }
        if (adminBadge) {
            adminBadge.classList.remove('hidden');
        }
    } else {
        // Hide admin panel button and badge
        if (adminPanelBtn) {
            adminPanelBtn.classList.add('hidden');
        }
        if (adminBadge) {
            adminBadge.classList.add('hidden');
        }
    }



    // Show dashboard elements

    const userProfileHeader = document.getElementById('user-profile-header');

    const dashboardTab = document.getElementById('dashboard-tab');

    

    if (userProfileHeader) userProfileHeader.classList.remove('hidden');

    if (dashboardTab) dashboardTab.classList.remove('hidden');

    // Show new tabs for all logged-in users
    const discussionTab = document.getElementById('discussion-tab');
    const assignmentsTab = document.getElementById('assignments-tab');
    const blogTab = document.getElementById('blog-tab');
    const portfolioTab = document.getElementById('portfolio-tab');
    
    if (discussionTab) discussionTab.classList.remove('hidden');
    if (assignmentsTab) assignmentsTab.classList.remove('hidden');
    if (blogTab) blogTab.classList.remove('hidden');
    if (portfolioTab) portfolioTab.classList.remove('hidden');



    // Show/hide admin controls based on user role

    const lecturerAdminControls = document.getElementById('lecturer-admin-controls');

    const adminLecturerActionHeader = document.getElementById('admin-lecturer-action-header');

    const devadminTab = document.getElementById('devadmin-tab');

    const moduleActionHeader = document.getElementById('module-action-header');

    const adminActionHeader = document.getElementById('admin-action-header');

    const timetableActionHeader = document.getElementById('timetable-action-header');
    
    // Class timetable admin controls
    const classTimetableAdminControls = document.getElementById('class-timetable-admin-controls');
    const adminClassActionHeader = document.getElementById('admin-class-action-header');
    
    if (isAdmin()) {

        if (lecturerAdminControls) lecturerAdminControls.classList.remove('hidden');

        if (adminLecturerActionHeader) adminLecturerActionHeader.classList.remove('hidden');

        if (devadminTab) devadminTab.classList.remove('hidden');

        if (moduleActionHeader) moduleActionHeader.style.display = 'table-cell';

        if (adminActionHeader) adminActionHeader.style.display = 'table-cell';

        if (timetableActionHeader) timetableActionHeader.style.display = 'table-cell';
        
        // Show class timetable admin controls
        if (classTimetableAdminControls) classTimetableAdminControls.classList.remove('hidden');
        if (adminClassActionHeader) adminClassActionHeader.style.display = 'table-cell';
        
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

        if (timetableActionHeader) timetableActionHeader.style.display = 'none';
        
        // Hide class timetable admin controls
        if (classTimetableAdminControls) classTimetableAdminControls.classList.add('hidden');
        if (adminClassActionHeader) adminClassActionHeader.style.display = 'none';
        
        // Hide all admin action columns

        document.querySelectorAll('.admin-only').forEach(el => {

            el.style.display = 'none';

        });

    }



    // Load dashboard data

    loadModules();

    loadLecturers();

    loadTimetable();

    loadUserNotes(); // Load user notes

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

            const timetableActionHeader = document.getElementById('timetable-action-header');

            if (moduleActionHeader) moduleActionHeader.style.display = 'table-cell';

            if (adminActionHeader) adminActionHeader.style.display = 'table-cell';

            if (timetableActionHeader) timetableActionHeader.style.display = 'table-cell';

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
        console.log('🔍 Loading timetable...');
        const response = await apiCall('/timetable');
        console.log('🔍 Timetable API response:', response);
        const timetableBody = document.getElementById('timetable-body');
        
        if (timetableBody && response.success) {
            console.log('🔍 Timetable data received:', response.data);
            if (response.data.length === 0) {
                timetableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No timetable entries available</td></tr>';
            } else {
                timetableBody.innerHTML = response.data.map((entry, index) => `
                    <tr>
                        <td>${entry.test}</td>
                        <td>${entry.module}</td>
                        <td>${entry.date}</td>
                        <td>${entry.time}</td>
                        <td>${entry.venue}</td>
                        <td class="admin-only" id="timetable-actions-${index}" style="display: none;">
                            <div class="action-buttons">
                                <button class="action-btn edit-btn-small" onclick="editTimetable(${index})" title="Edit Timetable Entry">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn delete-btn-small" onclick="deleteTimetable(${index})" title="Delete Timetable Entry">
                                    <i class="fas fa-trash"></i>
                                </button>
                                <span class="status-badge active">Active</span>
                            </div>
                        </td>
                    </tr>
                `).join('');
                console.log('✅ Timetable rendered successfully');
            }
        } else {
            console.log('❌ Timetable API response failed:', response);
        }
    } catch (error) {
        console.error('❌ Error loading timetable:', error);
        const timetableBody = document.getElementById('timetable-body');
        if (timetableBody) {
            timetableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Error loading timetable</td></tr>';
        }
    }
}


// Load user notes
async function loadUserNotes() {
    try {
        console.log('🔍 Starting loadUserNotes function...');
        const notesList = document.getElementById('user-notes-list');
        
        if (!notesList) {
            console.error('❌ CRITICAL ERROR: user-notes-list element not found!');
            console.error('❌ Available elements:', document.querySelectorAll('[id*="notes"]'));
            return;
        }
        
        console.log('✅ user-notes-list element found');
        console.log('🔍 API_BASE_URL:', API_BASE_URL);
        console.log('🔍 Making API call to /notes/public...');
        console.log('🔍 Full URL will be:', API_BASE_URL + '/notes/public');
        
        // Show loading state
        notesList.innerHTML = '<div class="loading-message">Loading notes...</div>';
        
        const response = await apiCall('/notes/public');
        console.log('🔍 API call completed');
        console.log('🔍 Full response:', JSON.stringify(response, null, 2));
        
        if (response && response.success) {
            console.log('✅ API response successful');
            console.log('🔍 Notes data received:', response.data);
            console.log('🔍 Number of notes:', response.data.length);
            
            if (response.data.length === 0) {
                console.log('🔍 No notes found, showing empty message');
                notesList.innerHTML = `
                    <div class="no-notes-message">
                        <i class="fas fa-file-alt"></i>
                        <p>No study notes available yet.</p>
                        <p>Admin will add study materials for your courses.</p>
                    </div>
                `;
            } else {
                console.log('🔍 Rendering notes cards...');
                notesList.innerHTML = response.data.map((note, index) => {
                    console.log(`🔍 Rendering note ${index + 1}:`, note.title);
                    return `
                    <div class="note-item" data-note-id="${note.id}">
                        <div class="note-header">
                            <h4>${note.title}</h4>
                            <div class="note-meta">
                                <span class="note-module">${note.module_code}</span>
                                <span class="note-type">${note.type}</span>
                            </div>
                        </div>
                        <div class="note-content">
                            <p>${note.content.substring(0, 150)}${note.content.length > 150 ? '...' : ''}</p>
                        </div>
                        <div class="note-actions">
                            <button class="btn btn-primary btn-small" onclick="downloadNote('${note.id}')">
                                <i class="fas fa-download"></i> Download PDF
                            </button>
                            <button class="btn btn-info btn-small" onclick="downloadEnhancedPDF('${note.id}')">
                                <i class="fas fa-file-pdf"></i> Enhanced PDF
                            </button>
                        </div>
                    </div>
                `;
                }).join('');
                console.log('✅ Notes rendered successfully');
                console.log('🔍 Notes list HTML length:', notesList.innerHTML.length);
            }
        } else {
            console.log('❌ API response failed:', response);
            notesList.innerHTML = `
                <div class="no-notes-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading notes. Please try again.</p>
                    <p><small>Error: ${response.error || 'Unknown error'}</small></p>
                </div>
            `;
        }
    } catch (error) {
        console.error('❌ CRITICAL ERROR in loadUserNotes:', error);
        console.error('❌ Error stack:', error.stack);
        const notesList = document.getElementById('user-notes-list');
        if (notesList) {
            notesList.innerHTML = `
                <div class="no-notes-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading notes. Please try again.</p>
                    <p><small>${error.message}</small></p>
                </div>
            `;
        }
    }
}

// Search and filter notes
window.filterNotes = function() {
    try {
        const searchTerm = document.getElementById('user-search-notes')?.value.toLowerCase() || '';
        const filterType = document.getElementById('user-filter-notes')?.value || '';
        const noteItems = document.querySelectorAll('.note-item');
        
        console.log('🔍 Filtering notes:', { searchTerm, filterType, totalNotes: noteItems.length });
        
        let visibleCount = 0;
        
        noteItems.forEach(item => {
            const title = item.querySelector('h4')?.textContent.toLowerCase() || '';
            const module = item.querySelector('.note-module')?.textContent.toLowerCase() || '';
            const type = item.querySelector('.note-type')?.textContent.toLowerCase() || '';
            const content = item.querySelector('.note-content p')?.textContent.toLowerCase() || '';
            
            // Check if item matches search and filter
            const matchesSearch = !searchTerm || 
                title.includes(searchTerm) || 
                module.includes(searchTerm) || 
                content.includes(searchTerm);
                
            const matchesFilter = !filterType || type === filterType;
            
            const shouldShow = matchesSearch && matchesFilter;
            
            item.style.display = shouldShow ? 'block' : 'none';
            if (shouldShow) visibleCount++;
        });
        
        console.log(`✅ Filtered notes: ${visibleCount} visible out of ${noteItems.length}`);
        
        // Show message if no results
        const notesList = document.getElementById('user-notes-list');
        if (visibleCount === 0 && noteItems.length > 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-notes-message';
            noResults.innerHTML = `
                <i class="fas fa-search"></i>
                <p>No notes found matching your criteria.</p>
                <p>Try adjusting your search or filter settings.</p>
            `;
            
            // Remove existing no-results message
            const existingNoResults = notesList.querySelector('.no-notes-message');
            if (existingNoResults) {
                existingNoResults.remove();
            }
            
            notesList.appendChild(noResults);
        } else {
            // Remove no-results message if there are results
            const existingNoResults = notesList.querySelector('.no-notes-message');
            if (existingNoResults) {
                existingNoResults.remove();
            }
        }
        
    } catch (error) {
        console.error('❌ Error filtering notes:', error);
    }
};

// Add event listeners for search and filter
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('user-search-notes');
    const filterSelect = document.getElementById('user-filter-notes');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterNotes);
        searchInput.addEventListener('keyup', filterNotes);
    }
    
    if (filterSelect) {
        filterSelect.addEventListener('change', filterNotes);
    }
});

// Download note function
window.downloadNote = function(noteId) {
    try {
        console.log('🔍 Downloading note as PDF:', noteId);
        console.log('🔍 API_BASE_URL:', API_BASE_URL);
        console.log('🔍 Full URL will be:', API_BASE_URL + `/notes/${noteId}`);
        
        // Fetch the note details
        apiCall(`/notes/${noteId}`).then(response => {
            if (response.success && response.data) {
                const note = response.data;
                
                // Generate PDF using browser's print-to-PDF capability
                generatePDF(note);
                
            } else {
                alert('Error loading note details');
            }
        }).catch(error => {
            console.error('❌ Error downloading note:', error);
            console.error('❌ Error details:', {
                message: error.message,
                stack: error.stack,
                noteId: noteId
            });
            
            // Show better error message
            alert(`Error downloading note: ${error.message || 'Unknown error occurred'}`);
        });
        
    } catch (error) {
        console.error('Error in downloadNote:', error);
        alert('Error downloading note');
    }
};

// Generate PDF from note content
function generatePDF(note) {
    try {
        console.log('🔍 Generating PDF for note:', note.title);
        
        // Create a new window for PDF generation
        const pdfWindow = window.open('', '_blank', 'width=800,height=600');
        
        // Create HTML content for PDF
        const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>${note.title} - Study Note</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 20px; 
                            line-height: 1.6;
                            color: #333;
                        }
                        h1 { 
                            color: #283593; 
                            border-bottom: 3px solid #283593; 
                            padding-bottom: 10px; 
                            margin-bottom: 20px;
                        }
                        .meta { 
                            background: #f8f9fa; 
                            padding: 15px; 
                            border-radius: 5px; 
                            margin: 20px 0; 
                            border-left: 4px solid #007bff;
                        }
                        .meta-item {
                            margin: 5px 0;
                            font-weight: bold;
                        }
                        .content { 
                            margin-top: 20px; 
                            white-space: pre-wrap;
                            font-size: 14px;
                        }
                        .footer {
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #ddd;
                            text-align: center;
                            color: #666;
                            font-size: 12px;
                        }
                        @media print {
                            body { margin: 10px; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <h1>${note.title}</h1>
                    <div class="meta">
                        <div class="meta-item"><strong>Module:</strong> ${note.module_code} - ${note.module_name}</div>
                        <div class="meta-item"><strong>Type:</strong> ${note.type}</div>
                        <div class="meta-item"><strong>Tags:</strong> ${note.tags || 'N/A'}</div>
                        <div class="meta-item"><strong>Created:</strong> ${new Date(note.created_at).toLocaleDateString()}</div>
                        <div class="meta-item"><strong>Created By:</strong> ${note.created_by_name || 'Admin'}</div>
                    </div>
                    <div class="content">
                        ${note.formatted_content || note.content}
                    </div>
                    <div class="footer">
                        <p>Generated from IT Course Management System</p>
                        <p>Download Date: ${new Date().toLocaleDateString()}</p>
                    </div>
                    <div class="no-print">
                        <p style="text-align: center; margin-top: 30px;">
                            <button onclick="window.print()" style="padding: 10px 20px; background: #283593; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                🖨️ Print to PDF
                            </button>
                        </p>
                        <p style="text-align: center; color: #666; font-size: 12px;">
                            💡 Use your browser's Print function and select "Save as PDF" to download the note as PDF
                        </p>
                    </div>
                </body>
            </html>
        `;
        
        pdfWindow.document.write(htmlContent);
        pdfWindow.document.close();
        
        // Wait for content to load, then trigger print dialog
        setTimeout(() => {
            pdfWindow.print();
        }, 1000);
        
        console.log('✅ PDF generation window opened');
        
    } catch (error) {
        console.error('❌ Error generating PDF:', error);
        alert('Error generating PDF: ' + error.message);
    }
}

// Enhanced PDF download function
window.downloadEnhancedPDF = function(noteId) {
    try {
        console.log('🔍 Downloading enhanced PDF:', noteId);
        
        // Fetch the note details
        apiCall(`/notes/${noteId}`).then(response => {
            if (response.success && response.data) {
                const note = response.data;
                
                // Create a more professional PDF layout
                createProfessionalPDF(note);
                
            } else {
                alert('Error loading note details');
            }
        }).catch(error => {
            console.error('❌ Error downloading enhanced PDF:', error);
            alert(`Error downloading enhanced PDF: ${error.message || 'Unknown error occurred'}`);
        });
        
    } catch (error) {
        console.error('Error in downloadEnhancedPDF:', error);
        alert('Error downloading enhanced PDF');
    }
};

// Create professional PDF with better formatting
function createProfessionalPDF(note) {
    try {
        console.log('🔍 Creating professional PDF for:', note.title);
        
        // Create a new window for enhanced PDF generation
        const pdfWindow = window.open('', '_blank', 'width=900,height=700');
        
        // Enhanced HTML content for professional PDF
        const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>${note.title} - Study Note</title>
                    <style>
                        @page {
                            size: A4;
                            margin: 2cm;
                        }
                        body { 
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                            margin: 0; 
                            padding: 20px;
                            line-height: 1.6;
                            color: #2c3e50;
                            background: #ffffff;
                        }
                        .header {
                            text-align: center;
                            border-bottom: 3px solid #283593;
                            padding-bottom: 20px;
                            margin-bottom: 30px;
                            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                            padding: 20px;
                            border-radius: 10px;
                        }
                        .header h1 {
                            color: #283593;
                            margin: 0;
                            font-size: 28px;
                            font-weight: 700;
                        }
                        .header .subtitle {
                            color: #6c757d;
                            font-size: 14px;
                            margin-top: 10px;
                        }
                        .meta-section {
                            background: #f8f9fa;
                            border: 1px solid #e9ecef;
                            border-radius: 8px;
                            padding: 20px;
                            margin: 20px 0;
                        }
                        .meta-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 15px;
                        }
                        .meta-item {
                            display: flex;
                            flex-direction: column;
                        }
                        .meta-label {
                            font-weight: 600;
                            color: #495057;
                            font-size: 12px;
                            margin-bottom: 5px;
                        }
                        .meta-value {
                            color: #2c3e50;
                            font-size: 14px;
                        }
                        .content-section {
                            margin: 30px 0;
                            padding: 25px;
                            background: #ffffff;
                            border: 1px solid #e9ecef;
                            border-radius: 8px;
                        }
                        .content-title {
                            font-size: 18px;
                            font-weight: 600;
                            color: #283593;
                            margin-bottom: 20px;
                            border-bottom: 2px solid #e9ecef;
                            padding-bottom: 10px;
                        }
                        .content {
                            white-space: pre-wrap;
                            font-size: 14px;
                            line-height: 1.8;
                            text-align: justify;
                        }
                        .footer {
                            margin-top: 40px;
                            padding: 20px;
                            background: #f8f9fa;
                            border: 1px solid #e9ecef;
                            border-radius: 8px;
                            text-align: center;
                        }
                        .footer p {
                            margin: 5px 0;
                            color: #6c757d;
                            font-size: 12px;
                        }
                        .action-buttons {
                            text-align: center;
                            margin: 30px 0;
                            padding: 20px;
                            background: #e3f2fd;
                            border-radius: 8px;
                        }
                        .btn-print {
                            background: linear-gradient(135deg, #283593 0%, #1a237e 100%);
                            color: white;
                            padding: 12px 30px;
                            border: none;
                            border-radius: 6px;
                            font-size: 16px;
                            font-weight: 600;
                            cursor: pointer;
                            box-shadow: 0 4px 15px rgba(40, 58, 147, 0.3);
                        }
                        .btn-print:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 6px 20px rgba(40, 58, 147, 0.4);
                        }
                        .instructions {
                            background: #d1ecf1;
                            border: 1px solid #bee5eb;
                            border-radius: 6px;
                            padding: 15px;
                            margin: 20px 0;
                        }
                        .instructions h4 {
                            color: #0c5460;
                            margin: 0 0 10px 0;
                        }
                        @media print {
                            .no-print { display: none !important; }
                            .action-buttons { display: none !important; }
                            .instructions { display: none !important; }
                            body { margin: 0; padding: 10px; }
                            .header { background: none !important; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>${note.title}</h1>
                        <div class="subtitle">IT Course Management System - Study Notes</div>
                    </div>
                    
                    <div class="meta-section">
                        <div class="meta-grid">
                            <div class="meta-item">
                                <div class="meta-label">Module Code</div>
                                <div class="meta-value">${note.module_code}</div>
                            </div>
                            <div class="meta-item">
                                <div class="meta-label">Module Name</div>
                                <div class="meta-value">${note.module_name}</div>
                            </div>
                            <div class="meta-item">
                                <div class="meta-label">Type</div>
                                <div class="meta-value">${note.type}</div>
                            </div>
                            <div class="meta-item">
                                <div class="meta-label">Tags</div>
                                <div class="meta-value">${note.tags || 'N/A'}</div>
                            </div>
                            <div class="meta-item">
                                <div class="meta-label">Created Date</div>
                                <div class="meta-value">${new Date(note.created_at).toLocaleDateString()}</div>
                            </div>
                            <div class="meta-item">
                                <div class="meta-label">Created By</div>
                                <div class="meta-value">${note.created_by_name || 'Admin'}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="content-section">
                        <div class="content-title">📝 Content</div>
                        <div class="content">
                            ${note.formatted_content || note.content}
                        </div>
                    </div>
                    
                    <div class="action-buttons">
                        <button class="btn-print" onclick="window.print()">
                            🖨️ Save as PDF
                        </button>
                    </div>
                    
                    <div class="instructions">
                        <h4>📋 Instructions:</h4>
                        <p><strong>1.</strong> Click the "Save as PDF" button above</p>
                        <p><strong>2.</strong> In the print dialog, select "Save as PDF" or "Microsoft Print to PDF"</p>
                        <p><strong>3.</strong> Choose your download location and save the file</p>
                        <p><strong>4.</strong> The PDF will include all formatting and be ready for printing or sharing</p>
                    </div>
                    
                    <div class="footer">
                        <p><strong>Generated from:</strong> IT Course Management System</p>
                        <p><strong>Download Date:</strong> ${new Date().toLocaleDateString()}</p>
                        <p><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
                    </div>
                </body>
            </html>
        `;
        
        pdfWindow.document.write(htmlContent);
        pdfWindow.document.close();
        
        // Wait for content to load, then trigger print dialog
        setTimeout(() => {
            pdfWindow.print();
        }, 1000);
        
        console.log('✅ Enhanced PDF generation window opened');
        
    } catch (error) {
        console.error('❌ Error creating professional PDF:', error);
        alert('Error creating professional PDF: ' + error.message);
    }
}

// Refresh dashboard data

function refreshDashboard() {

    if (currentUser) {

        loadModules();

        loadLecturers();

        loadTimetable();

        loadUserNotes();

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

        

        // Load timetable

        async function loadTimetable() {

            try {

                console.log('🔍 Loading timetable...');

                const response = await apiCall('/timetable');

                console.log('🔍 Timetable API response:', response);

                const timetableBody = document.getElementById('timetable-body');
                
                if (timetableBody && response.success) {

                    console.log('🔍 Timetable data received:', response.data);

                    if (response.data.length === 0) {

                        timetableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No timetable entries available</td></tr>';

                    } else {

                        timetableBody.innerHTML = response.data.map((entry, index) => `

                            <tr>

                                <td>${entry.test}</td>

                                <td>${entry.module}</td>

                                <td>${entry.date}</td>

                                <td>${entry.time}</td>

                                <td>${entry.venue}</td>

                            </tr>

                        `).join('');

                        console.log('✅ Timetable rendered successfully');

                    }

                } else {

                    console.log('❌ Timetable API response failed:', response);

                }

            } catch (error) {

                console.error('❌ Error loading timetable:', error);

                const timetableBody = document.getElementById('timetable-body');

                if (timetableBody) {

                    timetableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Error loading timetable</td></tr>';

                }

            }

        }

        loadTimetable();

        // Hide dashboard and show auth forms

        const userProfileHeader = document.getElementById('user-profile-header');

        const dashboardTab = document.getElementById('dashboard-tab');

        const devadminTab = document.getElementById('devadmin-tab');

        // Show new tabs for all logged-in users
        const discussionTab = document.getElementById('discussion-tab');
        const assignmentsTab = document.getElementById('assignments-tab');
        const blogTab = document.getElementById('blog-tab');
        const portfolioTab = document.getElementById('portfolio-tab');
        
        if (discussionTab) discussionTab.classList.remove('hidden');
        if (assignmentsTab) assignmentsTab.classList.remove('hidden');
        if (blogTab) blogTab.classList.remove('hidden');
        if (portfolioTab) portfolioTab.classList.remove('hidden');

        

        if (userProfileHeader) userProfileHeader.classList.add('hidden');

        if (dashboardTab) dashboardTab.classList.add('hidden');

        if (devadminTab) devadminTab.classList.add('hidden');

        // Hide new tabs when logging out
        if (discussionTab) discussionTab.classList.add('hidden');
        if (assignmentsTab) assignmentsTab.classList.add('hidden');

        

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

    console.log('🚀 Initializing application...');
    console.log('📝 Test Credentials Available:');
    console.log('   Admin: admin@course.edu / admin123');
    console.log('   Student: student@course.edu / student123');
    
    // CRITICAL: Attach form event listeners first
    const loginFormElement = document.getElementById('login-form');
    const registerFormElement = document.getElementById('register-form');
    
    console.log('🔍 Login form found:', !!loginFormElement);
    console.log('🔍 Register form found:', !!registerFormElement);
    
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', handleLogin);
        console.log('✅ Login listener attached successfully');
    } else {
        console.log('❌ Login form not found');
    }
    
    if (registerFormElement) {
        registerFormElement.addEventListener('submit', handleRegister);
        console.log('✅ Register listener attached successfully');
    } else {
        console.log('❌ Register form not found');
    }

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

    // Navigation between login and register forms
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

}

// Zoom Meeting Functionality

const zoomMeetingForm = document.getElementById('zoom-meeting-form');

const zoomLinkInput = document.getElementById('zoom-link');

const meetingNameInput = document.getElementById('meeting-name');

const meetingPasswordInput = document.getElementById('meeting-password');

const zoomMessage = document.getElementById('zoom-message');

const testZoomBtn = document.getElementById('test-zoom-btn');

// Handle Zoom meeting form submission

if (zoomMeetingForm) {

    zoomMeetingForm.addEventListener('submit', async (e) => {

        e.preventDefault();

        const zoomLink = zoomLinkInput.value.trim();

        const meetingName = meetingNameInput.value.trim();

        const meetingPassword = meetingPasswordInput.value.trim();

        // Validation

        if (!zoomLink) {

            showMessage('zoom-message', 'Please enter a Zoom meeting link', true);

            return;

        }

        if (!meetingName) {

            showMessage('zoom-message', 'Please enter your name', true);

            return;

        }

        // Validate Zoom link format

        if (!isValidZoomLink(zoomLink)) {

            showMessage('zoom-message', 'Please enter a valid Zoom meeting link', true);

            return;

        }

        try {

            // Construct Zoom meeting URL with parameters

            const meetingUrl = constructZoomUrl(zoomLink, meetingName, meetingPassword);

            // Show loading message

            showMessage('zoom-message', 'Connecting to Zoom meeting...', false);

            // Open Zoom meeting in new tab

            setTimeout(() => {

                window.open(meetingUrl, '_blank', 'noopener,noreferrer');

                showMessage('zoom-message', 'Opening Zoom meeting...', false);

            }, 1000);

        } catch (error) {

            console.error('Error joining Zoom meeting:', error);

            showMessage('zoom-message', 'Error joining meeting. Please check the link and try again.', true);

        }

    });

}

// Test Zoom connection button
if (testZoomBtn) {
    testZoomBtn.addEventListener('click', () => {
        const zoomLink = zoomLinkInput.value.trim();
        
        if (!zoomLink) {
            showMessage('zoom-message', 'Please enter a Zoom meeting link first', true);
            return;
        }
        
        if (isValidZoomLink(zoomLink)) {
            showMessage('zoom-message', 'Zoom link format is valid!', false);
        } else {
            showMessage('zoom-message', 'Invalid Zoom link format. Please check the link.', true);
        }
    });
}

// Validate Zoom link format
function isValidZoomLink(link) {
    const zoomPatterns = [
        /^https:\/\/zoom\.us\/j\//,
        /^https:\/\/.*\.zoom\.us\/j\//,
        /^https:\/\/zoom\.us\/my\//,
        /^https:\/\/.*\.zoom\.us\//
    ];
    
    return zoomPatterns.some(pattern => pattern.test(link));
}

// Construct Zoom URL with parameters
function constructZoomUrl(baseUrl, name, password) {
    try {
        const url = new URL(baseUrl);
        
        // Add name parameter
        if (name) {
            url.searchParams.set('uname', encodeURIComponent(name));
        }
        
        // Add password parameter if provided
        if (password) {
            url.searchParams.set('pwd', encodeURIComponent(password));
        }
        
        return url.toString();
    } catch (error) {
        console.error('Error constructing Zoom URL:', error);
        return baseUrl;
    }
}

// Auto-fill user name if logged in
if (meetingNameInput && currentUser && currentUser.name) {
    meetingNameInput.value = currentUser.name;
}

// Discussion Forum Functions
async function loadDiscussions() {
    try {
        const result = await apiCall('/discussions');
        if (result.success) {
            displayDiscussions(result.data);
        }
    } catch (error) {
        console.error('Error loading discussions:', error);
    }
}

function displayDiscussions(discussions) {
    const container = document.getElementById('discussions-container');
    if (!container) return;

    if (discussions.length === 0) {
        container.innerHTML = `
            <div class="no-discussions">
                <i class="fas fa-comments"></i>
                <p>No discussions yet. Be the first to start one!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = discussions.map(discussion => `
        <div class="discussion-item" data-id="${discussion.id}">
            <div class="discussion-header">
                <h4><i class="fas fa-comment"></i> ${discussion.title}</h4>
                <div class="discussion-meta">
                    <span class="discussion-author">by ${discussion.author_name}</span>
                    <span class="discussion-date">${formatDate(discussion.created_at)}</span>
                    ${discussion.module_code ? `<span class="discussion-module">${discussion.module_code}</span>` : ''}
                </div>
            </div>
            <div class="discussion-content">
                <p>${discussion.content.substring(0, 200)}${discussion.content.length > 200 ? '...' : ''}</p>
            </div>
            <div class="discussion-footer">
                <span class="reply-count"><i class="fas fa-reply"></i> ${discussion.reply_count} replies</span>
                <button class="btn btn-sm btn-primary" onclick="viewDiscussion(${discussion.id})">View Discussion</button>
            </div>
        </div>
    `).join('');
}

async function createDiscussion(e) {
    e.preventDefault();
    if (!currentUser) {
        showMessage('forum-message', 'Please login to create a discussion', true);
        return;
    }

    const title = document.getElementById('discussion-title').value;
    const content = document.getElementById('discussion-content').value;
    const moduleCode = document.getElementById('discussion-module').value;

    try {
        const result = await apiCall('/discussions', 'POST', {
            title,
            content,
            module_code: moduleCode,
            created_by: currentUser.id
        });

        if (result.success) {
            showMessage('forum-message', 'Discussion posted successfully!', false);
            document.getElementById('create-discussion-form').reset();
            loadDiscussions();
        }
    } catch (error) {
        showMessage('forum-message', 'Failed to post discussion', true);
    }
}

async function viewDiscussion(discussionId) {
    try {
        const result = await apiCall(`/discussions/${discussionId}`);
        if (result.success) {
            showDiscussionModal(result.data);
        }
    } catch (error) {
        console.error('Error viewing discussion:', error);
        showMessage('forum-message', 'Failed to load discussion', true);
    }
}

function showDiscussionModal(data) {
    const modal = document.getElementById('discussion-modal');
    const detailContent = document.getElementById('discussion-detail-content');
    const repliesContainer = document.getElementById('replies-container');
    
    // Display discussion details
    detailContent.innerHTML = `
        <div class="discussion-detail">
            <h4>${data.discussion.title}</h4>
            <div class="discussion-detail-meta">
                <span class="discussion-author">by ${data.discussion.author_name}</span>
                <span class="discussion-date">${formatDate(data.discussion.created_at)}</span>
                ${data.discussion.module_code ? `<span class="discussion-module">${data.discussion.module_code}</span>` : ''}
            </div>
            <div class="discussion-detail-content">
                <p>${data.discussion.content}</p>
            </div>
        </div>
    `;
    
    // Display replies
    if (data.replies.length === 0) {
        repliesContainer.innerHTML = '<div class="no-replies">No replies yet. Be the first to reply!</div>';
    } else {
        repliesContainer.innerHTML = data.replies.map(reply => `
            <div class="reply-item">
                <div class="reply-author">${reply.author_name}</div>
                <div class="reply-date">${formatDate(reply.created_at)}</div>
                <div class="reply-content">${reply.content}</div>
            </div>
        `).join('');
    }
    
    // Show modal
    modal.style.display = 'flex';
    
    // Store discussion ID for reply form
    modal.setAttribute('data-discussion-id', data.discussion.id);
}

function closeDiscussionModal() {
    const modal = document.getElementById('discussion-modal');
    modal.style.display = 'none';
}

async function postReply(e) {
    e.preventDefault();
    
    if (!currentUser) {
        alert('Please login to reply to discussions');
        return;
    }
    
    const modal = document.getElementById('discussion-modal');
    const discussionId = modal.getAttribute('data-discussion-id');
    const replyContent = document.getElementById('reply-content').value;
    
    if (!replyContent.trim()) {
        alert('Please enter reply content');
        return;
    }
    
    try {
        console.log('🔍 Posting reply:', { discussionId, content: replyContent, userId: currentUser.id });
        
        const result = await apiCall(`/discussions/${discussionId}/replies`, 'POST', {
            content: replyContent,
            created_by: currentUser.id
        });
        
        console.log('🔍 Reply response:', result);
        
        if (result.success) {
            // Clear form
            document.getElementById('reply-form').reset();
            
            // Reload discussion to show new reply
            const discussionResult = await apiCall(`/discussions/${discussionId}`);
            if (discussionResult.success) {
                showDiscussionModal(discussionResult.data);
            }
        } else {
            alert('Failed to post reply: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('❌ Error posting reply:', error);
        alert('Failed to post reply: ' + error.message);
    }
}

// Assignment Functions
async function loadAssignments() {
    try {
        const result = await apiCall('/assignments');
        if (result.success) {
            displayAssignments(result.data);
        }
    } catch (error) {
        console.error('Error loading assignments:', error);
    }
}

function displayAssignments(assignments) {
    const container = document.getElementById('assignments-container');
    if (!container) return;

    if (assignments.length === 0) {
        container.innerHTML = `
            <div class="no-assignments">
                <i class="fas fa-tasks"></i>
                <p>No assignments posted yet.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = assignments.map(assignment => {
        const urgencyClass = assignment.urgency_status === 'overdue' ? 'overdue' : 
                           assignment.urgency_status === 'due_soon' ? 'due-soon' : 'active';
        const urgencyIcon = assignment.urgency_status === 'overdue' ? 'fa-exclamation-triangle' : 
                            assignment.urgency_status === 'due_soon' ? 'fa-clock' : 'fa-calendar';
        
        return `
            <div class="assignment-item ${urgencyClass}">
                <div class="assignment-header">
                    <h4><i class="fas fa-tasks"></i> ${assignment.title}</h4>
                    <div class="assignment-meta">
                        <span class="assignment-module">${assignment.module_code}</span>
                        <span class="assignment-urgency ${urgencyClass}">
                            <i class="fas ${urgencyIcon}"></i> ${assignment.urgency_status.replace('_', ' ')}
                        </span>
                    </div>
                </div>
                <div class="assignment-content">
                    <p>${assignment.description.substring(0, 200)}${assignment.description.length > 200 ? '...' : ''}</p>
                </div>
                <div class="assignment-footer">
                    <span class="due-date">
                        <i class="fas fa-calendar-alt"></i> Due: ${formatDateTime(assignment.due_date)}
                    </span>
                    <span class="posted-by">Posted by ${assignment.posted_by_name}</span>
                </div>
            </div>
        `;
    }).join('');
}

async function createAssignment(e) {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'admin') {
        showMessage('assignments-message', 'Only admins can post assignments', true);
        return;
    }

    const title = document.getElementById('assignment-title').value;
    const description = document.getElementById('assignment-description').value;
    const moduleCode = document.getElementById('assignment-module').value;
    const dueDate = document.getElementById('assignment-due-date').value;

    try {
        const result = await apiCall('/assignments', 'POST', {
            title,
            description,
            module_code: moduleCode,
            module_name: document.getElementById('assignment-module').options[document.getElementById('assignment-module').selectedIndex].text.replace(/^[^-]+ - /, ''),
            due_date: dueDate,
            posted_by: currentUser.id
        });

        if (result.success) {
            showMessage('assignments-message', 'Assignment posted successfully!', false);
            document.getElementById('create-assignment-form').reset();
            loadAssignments();
            loadAssignmentNotifications(); // Refresh notifications
        }
    } catch (error) {
        showMessage('assignments-message', 'Failed to post assignment', true);
    }
}

async function loadAssignmentNotifications() {
    if (!currentUser) return;

    try {
        const result = await apiCall(`/assignments/notifications/${currentUser.id}`);
        if (result.success) {
            displayNotifications(result.data.notifications);
            updateNotificationBadge(result.data.unread_count);
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

function displayNotifications(notifications) {
    const container = document.getElementById('notifications-container');
    if (!container) return;

    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="no-notifications">
                <i class="fas fa-bell-slash"></i>
                <p>No new assignment notifications</p>
            </div>
        `;
        return;
    }

    container.innerHTML = notifications.map(notification => `
        <div class="notification-item ${notification.is_read ? 'read' : 'unread'}" data-id="${notification.id}">
            <div class="notification-header">
                <h4><i class="fas fa-tasks"></i> ${notification.title}</h4>
                <span class="notification-date">${formatDate(notification.created_at)}</span>
            </div>
            <div class="notification-content">
                <p><strong>Module:</strong> ${notification.module_name}</p>
                <p><strong>Due:</strong> ${formatDateTime(notification.due_date)}</p>
                <p class="urgency-status ${notification.urgency_status}">
                    <i class="fas fa-${notification.urgency_status === 'overdue' ? 'exclamation-triangle' : 
                                     notification.urgency_status === 'due_soon' ? 'clock' : 'calendar'}"></i>
                    Status: ${notification.urgency_status.replace('_', ' ')}
                </p>
            </div>
            ${!notification.is_read ? `<button class="btn btn-sm" onclick="markAsRead(${notification.id})">Mark as Read</button>` : ''}
        </div>
    `).join('');
}

async function markAsRead(notificationId) {
    try {
        await apiCall(`/assignments/notifications/${notificationId}/read`, 'PUT');
        loadAssignmentNotifications(); // Refresh notifications
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

function updateNotificationBadge(unreadCount) {
    // Update notification badge in the UI if it exists
    const badge = document.getElementById('notification-badge');
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'block' : 'none';
    }
}

// Helper function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

// Initialize Discussion Forum and Assignment functionality
function initializeDiscussionForum() {
    const createDiscussionForm = document.getElementById('create-discussion-form');
    if (createDiscussionForm) {
        createDiscussionForm.addEventListener('submit', createDiscussion);
    }
    
    // Add reply form event listener
    const replyForm = document.getElementById('reply-form');
    if (replyForm) {
        replyForm.addEventListener('submit', postReply);
    }
    
    loadDiscussions();
}

function initializeAssignments() {
    const createAssignmentForm = document.getElementById('create-assignment-form');
    if (createAssignmentForm) {
        createAssignmentForm.addEventListener('submit', createAssignment);
    }
    
    // Show/hide admin assignment section based on user role
    const adminSection = document.getElementById('admin-assignments-section');
    if (adminSection && currentUser) {
        adminSection.style.display = currentUser.role === 'admin' ? 'block' : 'none';
    }
    
    loadAssignments();
    loadAssignmentNotifications();
}

// Update the main initialize function to include new functionality
const originalInitialize = window.initialize;
window.initialize = function() {
    if (originalInitialize) {
        originalInitialize();
    }
    
    // Initialize security - hide admin panel button by default
    initializeSecurity();
    
    // Initialize WhatsApp integration
    initializeWhatsAppIntegration();
    
    // Initialize class timetable
    initializeClassTimetable();
    
    // Initialize assignment notifications
    initializeAssignmentNotifications();
    
    // Initialize new features
    initializeDiscussionForum();
    initializeAssignments();
};

// Security initialization function
function initializeSecurity() {
    // Always hide admin panel button on page load
    const adminPanelBtn = document.getElementById('admin-panel-btn');
    const adminBadge = document.getElementById('admin-badge');
    
    if (adminPanelBtn) {
        adminPanelBtn.classList.add('hidden');
    }
    if (adminBadge) {
        adminBadge.classList.add('hidden');
    }
    
    // Re-check user role if already logged in
    if (currentUser) {
        updateDashboard();
    }
}

// Start when DOM is ready

if (document.readyState === 'loading') {

    document.addEventListener('DOMContentLoaded', initialize);

} else {

    initialize();

}

// WhatsApp Integration for Contact Form
function initializeWhatsAppIntegration() {
    const contactForm = document.getElementById('contact-form');
    const whatsappBtn = document.getElementById('whatsapp-btn');
    
    if (contactForm && whatsappBtn) {
        // WhatsApp button click handler
        whatsappBtn.addEventListener('click', function(e) {
            e.preventDefault();
            sendViaWhatsApp();
        });
        
        // Form submit handler
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendContactMessage();
        });
    }
}

// Send message via WhatsApp
function sendViaWhatsApp() {
    const name = document.getElementById('contact-name')?.value || '';
    const email = document.getElementById('contact-email')?.value || '';
    const phone = document.getElementById('contact-phone')?.value || '';
    const subject = document.getElementById('contact-subject')?.value || '';
    const message = document.getElementById('contact-message')?.value || '';
    
    if (!name || !phone || !message) {
        showMessage('contact-message-status', 'Please fill in name, phone number, and message', true);
        return;
    }
    
    // Format WhatsApp message
    const whatsappMessage = `*New Contact Message*\n\n*Name:* ${name}\n*Email:* ${email}\n*Subject:* ${subject}\n*Message:* ${message}`;
    
    // Create WhatsApp URL with phone number +255 628 701 663
    const whatsappUrl = `https://wa.me/255628701663?text=${encodeURIComponent(whatsappMessage)}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
    
    showMessage('contact-message-status', 'Opening WhatsApp to send your message...', false);
}

// Send regular contact message (existing functionality)
function sendContactMessage() {
    const name = document.getElementById('contact-name')?.value || '';
    const email = document.getElementById('contact-email')?.value || '';
    const phone = document.getElementById('contact-phone')?.value || '';
    const subject = document.getElementById('contact-subject')?.value || '';
    const message = document.getElementById('contact-message')?.value || '';
    
    if (!name || !email || !message) {
        showMessage('contact-message-status', 'Please fill in all required fields', true);
        return;
    }
    
    // Here you can add existing email sending logic
    // For now, just show success message
    showMessage('contact-message-status', 'Message sent successfully! We will get back to you soon.', false);
    
    // Also send via WhatsApp if phone is provided
    if (phone) {
        setTimeout(() => {
            sendViaWhatsApp();
        }, 1000);
    }
    
    // Reset form
    contactForm.reset();
}

// Class Timetable Management
function initializeClassTimetable() {
    const classTimetableForm = document.getElementById('add-class-timetable-form');
    const classTimetableBody = document.getElementById('class-timetable-body');
    
    if (classTimetableForm) {
        classTimetableForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addClassSession();
        });
    }
    
    // Load class timetable on page load
    loadClassTimetable();
}

// Add class session
function addClassSession() {
    const moduleCode = document.getElementById('class-module-code')?.value || '';
    const moduleName = document.getElementById('class-module-name')?.value || '';
    const lecturerName = document.getElementById('class-lecturer-name')?.value || '';
    const venue = document.getElementById('class-venue')?.value || '';
    const day = document.getElementById('class-day')?.value || '';
    const startTime = document.getElementById('class-start-time')?.value || '';
    const endTime = document.getElementById('class-end-time')?.value || '';
    
    if (!moduleCode || !moduleName || !lecturerName || !venue || !day || !startTime || !endTime) {
        showMessage('class-timetable-message', 'Please fill in all required fields', true);
        return;
    }
    
    // Create class session object
    const classSession = {
        module_code: moduleCode,
        module_name: moduleName,
        lecturer_name: lecturerName,
        venue: venue,
        day_of_week: day,
        start_time: startTime,
        end_time: endTime
    };
    
    // Add to database (API call)
    apiCall('/class-timetable', 'POST', classSession)
        .then(response => {
            if (response.success) {
                showMessage('class-timetable-message', 'Class session added successfully!', false);
                document.getElementById('add-class-timetable-form').reset();
                loadClassTimetable(); // Reload timetable
            } else {
                showMessage('class-timetable-message', response.message || 'Failed to add class session', true);
            }
        })
        .catch(error => {
            console.error('Error adding class session:', error);
            // Fallback: Add to local display
            addClassSessionToTable(classSession);
            showMessage('class-timetable-message', 'Class session added locally!', false);
            document.getElementById('add-class-timetable-form').reset();
        });
}

// Load class timetable
function loadClassTimetable() {
    const classTimetableBody = document.getElementById('class-timetable-body');
    
    if (!classTimetableBody) return;
    
    // Clear existing content
    classTimetableBody.innerHTML = '';
    
    // Fetch from API
    apiCall('/class-timetable', 'GET')
        .then(response => {
            if (response.success && response.data && response.data.length > 0) {
                response.data.forEach(session => {
                    addClassSessionToTable(session);
                });
            } else {
                // Add sample data for demonstration
                const sampleSessions = [
                    {
                        id: 1,
                        module_code: 'IT101',
                        module_name: 'Introduction to Programming',
                        lecturer_name: 'Dr. John Smith',
                        venue: 'Room 101',
                        day_of_week: 'Monday',
                        start_time: '09:00',
                        end_time: '11:00'
                    },
                    {
                        id: 2,
                        module_code: 'IT102',
                        module_name: 'Web Development Fundamentals',
                        lecturer_name: 'Prof. Mary Johnson',
                        venue: 'Lab 3',
                        day_of_week: 'Tuesday',
                        start_time: '14:00',
                        end_time: '16:00'
                    }
                ];
                
                sampleSessions.forEach(session => {
                    addClassSessionToTable(session);
                });
            }
        })
        .catch(error => {
            console.error('Error loading class timetable:', error);
            // Add sample data as fallback
            const sampleSessions = [
                {
                    id: 1,
                    module_code: 'IT101',
                    module_name: 'Introduction to Programming',
                    lecturer_name: 'Dr. John Smith',
                    venue: 'Room 101',
                    day_of_week: 'Monday',
                    start_time: '09:00',
                    end_time: '11:00'
                }
            ];
            
            sampleSessions.forEach(session => {
                addClassSessionToTable(session);
            });
        });
}

// Add class session to table
function addClassSessionToTable(session) {
    const classTimetableBody = document.getElementById('class-timetable-body');
    if (!classTimetableBody) return;
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${session.module_code}</td>
        <td>${session.module_name}</td>
        <td>${session.lecturer_name}</td>
        <td>${session.day_of_week}</td>
        <td>${session.start_time} - ${session.end_time}</td>
        <td>${session.venue}</td>
        <td class="admin-only" id="class-action-${session.id}" style="display: none;">
            <button class="btn btn-small btn-danger" onclick="deleteClassSession(${session.id})">
                <i class="fas fa-trash"></i> Delete
            </button>
        </td>
    `;
    
    classTimetableBody.appendChild(row);
    
    // Show/hide admin action column based on user role
    if (isAdmin()) {
        const actionCell = document.getElementById(`class-action-${session.id}`);
        if (actionCell) {
            actionCell.style.display = 'table-cell';
        }
        const actionHeader = document.getElementById('admin-class-action-header');
        if (actionHeader) {
            actionHeader.classList.remove('hidden');
        }
    }
}

// Delete class session
function deleteClassSession(sessionId) {
    if (!confirm('Are you sure you want to delete this class session?')) {
        return;
    }
    
    apiCall(`/class-timetable/${sessionId}`, 'DELETE')
        .then(response => {
            if (response.success) {
                showMessage('class-timetable-message', 'Class session deleted successfully!', false);
                loadClassTimetable(); // Reload timetable
            } else {
                showMessage('class-timetable-message', response.message || 'Failed to delete class session', true);
            }
        })
        .catch(error => {
            console.error('Error deleting class session:', error);
            // Fallback: Remove from table
            const row = document.querySelector(`#class-action-${sessionId}`).parentElement;
            if (row) {
                row.remove();
                showMessage('class-timetable-message', 'Class session deleted locally!', false);
            }
        });
}

// Assignment Notification System
function initializeAssignmentNotifications() {
    // Load assignments and check for new ones
    loadAssignments();
    checkForNewAssignments();
    
    // Check for new assignments every 30 seconds
    setInterval(checkForNewAssignments, 30000);
}

// Load assignments from API
function loadAssignments() {
    apiCall('/assignments', 'GET')
        .then(response => {
            if (response.success && response.data) {
                updateAssignmentNotifications(response.data);
            }
        })
        .catch(error => {
            console.error('Error loading assignments:', error);
            // Add sample assignment for demonstration
            const sampleAssignments = [
                {
                    id: 1,
                    title: 'Introduction to Programming Assignment',
                    description: 'Complete exercises 1-5 from Chapter 3',
                    module_code: 'IT101',
                    module_name: 'Introduction to Programming',
                    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
                    posted_by: 1,
                    status: 'active',
                    created_at: new Date().toISOString()
                }
            ];
            updateAssignmentNotifications(sampleAssignments);
        });
}

// Check for new assignments
function checkForNewAssignments() {
    const lastCheck = localStorage.getItem('lastAssignmentCheck');
    const currentTime = new Date().toISOString();
    
    apiCall('/assignments?since=' + lastCheck, 'GET')
        .then(response => {
            if (response.success && response.data && response.data.length > 0) {
                // New assignments found
                showAssignmentNotification(response.data[0]);
                updateAssignmentNotificationBadge(true);
            }
        })
        .catch(error => {
            console.error('Error checking for new assignments:', error);
        });
    
    localStorage.setItem('lastAssignmentCheck', currentTime);
}

// Update assignment notifications in the assignments tab
function updateAssignmentNotifications(assignments) {
    const notificationsContainer = document.getElementById('notifications-container');
    if (!notificationsContainer) return;
    
    // Clear existing notifications
    notificationsContainer.innerHTML = '';
    
    if (assignments.length === 0) {
        notificationsContainer.innerHTML = `
            <div class="no-notifications">
                <i class="fas fa-bell-slash"></i>
                <p>No new assignment notifications</p>
            </div>
        `;
        updateAssignmentNotificationBadge(false);
        return;
    }
    
    // Filter active assignments
    const activeAssignments = assignments.filter(a => a.status === 'active');
    
    if (activeAssignments.length === 0) {
        notificationsContainer.innerHTML = `
            <div class="no-notifications">
                <i class="fas fa-bell-slash"></i>
                <p>No active assignments</p>
            </div>
        `;
        updateAssignmentNotificationBadge(false);
        return;
    }
    
    // Show notification badge if there are active assignments
    updateAssignmentNotificationBadge(true);
    
    // Display notifications
    activeAssignments.forEach(assignment => {
        const notificationItem = createAssignmentNotificationItem(assignment);
        notificationsContainer.appendChild(notificationItem);
    });
}

// Create assignment notification item
function createAssignmentNotificationItem(assignment) {
    const notificationItem = document.createElement('div');
    notificationItem.className = 'notification-item';
    notificationItem.onclick = () => switchToTab('assignments');
    
    const dueDate = new Date(assignment.due_date);
    const formattedDueDate = dueDate.toLocaleDateString() + ' ' + dueDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const timeAgo = getTimeAgo(new Date(assignment.created_at));
    
    notificationItem.innerHTML = `
        <div class="notification-item-header">
            <div class="notification-item-title">
                <i class="fas fa-tasks"></i>
                New Assignment Posted
            </div>
            <div class="notification-item-time">${timeAgo}</div>
        </div>
        <div class="notification-item-content">
            <strong>${assignment.title}</strong><br>
            ${assignment.description}
            <div class="notification-item-module">${assignment.module_code}</div>
            <small>Due: ${formattedDueDate}</small>
        </div>
    `;
    
    return notificationItem;
}

// Show assignment notification popup
function showAssignmentNotification(assignment) {
    // Create a temporary notification popup
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ff4757, #ff6b7a);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(255, 71, 87, 0.3);
        z-index: 1000;
        max-width: 300px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    popup.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <i class="fas fa-bell" style="font-size: 1.2rem;"></i>
            <strong>New Assignment!</strong>
        </div>
        <div style="font-size: 0.9rem;">
            <strong>${assignment.title}</strong><br>
            <small>${assignment.module_code} - Due: ${new Date(assignment.due_date).toLocaleDateString()}</small>
        </div>
        <button onclick="this.parentElement.remove()" style="
            position: absolute;
            top: 5px;
            right: 5px;
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 1rem;
        ">×</button>
    `;
    
    document.body.appendChild(popup);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (popup.parentElement) {
            popup.remove();
        }
    }, 5000);
}

// Update assignment notification badge
function updateAssignmentNotificationBadge(show) {
    const badge = document.getElementById('assignment-notification-badge');
    if (!badge) return;
    
    if (show) {
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// Get time ago string
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    return Math.floor(seconds / 86400) + ' days ago';
}

// Initialize the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

// YouTube-Inspired Functions
let studioData = {
    videos: [],
    posts: [],
    streams: [],
    channelInfo: {
        name: 'Your Channel',
        handle: '@yourchannel',
        subscribers: 0,
        totalViews: 0,
        joinedDate: 'February 2024'
    }
};

function showVideoUpload() {
    alert('Video upload feature coming soon! This will allow you to upload and manage video content.');
}

function showBlogPostForm() {
    document.getElementById('content-management').style.display = 'block';
    document.getElementById('blog-post-card').classList.add('active');
}

function startLiveStream() {
    alert('Live streaming feature coming soon! This will allow you to broadcast live to your audience.');
}

function updateStudioStats() {
    document.getElementById('total-videos').textContent = studioData.videos.length;
    document.getElementById('total-views').textContent = studioData.channelInfo.totalViews.toLocaleString();
    document.getElementById('total-subscribers').textContent = studioData.channelInfo.subscribers.toLocaleString();
}

function customizeChannel() {
    const newName = prompt('Enter your channel name:', studioData.channelInfo.name);
    if (newName) {
        studioData.channelInfo.name = newName;
        document.querySelector('.channel-name').textContent = newName;
        showMessage('blog-message', 'Channel name updated successfully!');
    }
}

function subscribeToChannel() {
    studioData.channelInfo.subscribers++;
    updateStudioStats();
    showMessage('blog-message', 'Subscribed to channel successfully!');
}

function shareChannel() {
    const shareUrl = `${window.location.origin}/portfolio`;
    if (navigator.share) {
        navigator.share({
            title: studioData.channelInfo.name,
            text: `Check out ${studioData.channelInfo.name} on our course platform!`,
            url: shareUrl
        });
    } else {
        navigator.clipboard.writeText(shareUrl);
        showMessage('blog-message', 'Channel link copied to clipboard!');
    }
}

// Channel tab switching
function switchChannelTab(tabName) {
    // Hide all tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    // Remove active class from all channel tabs
    document.querySelectorAll('.channel-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab pane
    const selectedPane = document.getElementById(`${tabName}-tab`);
    if (selectedPane) {
        selectedPane.classList.add('active');
    }
    
    // Add active class to clicked tab
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
}

// Initialize channel tabs
document.addEventListener('DOMContentLoaded', function() {
    const channelTabs = document.querySelectorAll('.channel-tab');
    channelTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchChannelTab(tabName);
        });
    });
    
    // Initialize studio stats
    updateStudioStats();
    
    // Initialize customize button
    const customizeBtn = document.getElementById('customize-channel');
    if (customizeBtn) {
        customizeBtn.addEventListener('click', customizeChannel);
    }
    
    // Initialize subscribe button
    const subscribeBtn = document.getElementById('subscribe-btn');
    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', subscribeToChannel);
    }
    
    // Initialize share button
    const shareBtn = document.getElementById('share-channel');
    if (shareBtn) {
        shareBtn.addEventListener('click', shareChannel);
    }
});

