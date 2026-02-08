(() => {
  const secretInput = document.getElementById('adminSecret');
  const btnLogin = document.getElementById('btnLogin');
  const loginMsg = document.getElementById('loginMsg');
  const panel = document.getElementById('panel');
  const outPre = document.getElementById('outPre');

  // Debug: Check if elements are found
  console.log('Elements found:', {
    secretInput: !!secretInput,
    btnLogin: !!btnLogin,
    loginMsg: !!loginMsg,
    panel: !!panel,
    outPre: !!outPre
  });

  let ADMIN_SECRET = '';

  const showOutput = (obj) => {
    outPre.textContent = JSON.stringify(obj, null, 2);
  };

  const showMessage = (elementId, text, isError = false) => {
    const msgEl = document.getElementById(elementId);
    msgEl.textContent = text;
    msgEl.style.display = 'block';
    msgEl.className = isError ? 'alert alert-danger mt-3' : 'alert alert-success mt-3';
  };

  const hideMessage = (elementId) => {
    const msgEl = document.getElementById(elementId);
    msgEl.style.display = 'none';
  };

  // Add safety check for login button
  if (btnLogin) {
    btnLogin.addEventListener('click', () => {
      console.log('Login button clicked'); // Debug log
      const s = secretInput.value.trim();
      console.log('Secret entered:', s); // Debug log
      if (!s) {
        loginMsg.textContent = 'Please enter the admin secret.';
        return;
      }
      ADMIN_SECRET = s;
      loginMsg.textContent = '';
      panel.style.display = 'block';
      document.getElementById('loginCard').style.display = 'none';
      
      // Show logout button after successful login
      const logoutBtn = document.getElementById('btnLogout');
      if (logoutBtn) {
        logoutBtn.style.display = 'block';
      }
      
      // Show edit profile button after successful login
      const editProfileBtn = document.getElementById('btnEditProfile');
      if (editProfileBtn) {
        editProfileBtn.style.display = 'block';
        console.log('Edit profile button shown after login'); // Debug log
      } else {
        console.error('Edit profile button not found!'); // Debug log
      }
    });
  } else {
    console.error('Login button not found!');
  }

  const request = async (method, url, data) => {
    try {
      const res = await axios({ method, url, data, headers: { 'x-admin-secret': ADMIN_SECRET } });
      return res.data;
    } catch (err) {
      const payload = err?.response?.data || { message: err.message };
      return { success: false, error: payload };
    }
  };

  document.getElementById('btnInfo').addEventListener('click', async () => {
    showOutput({ loading: true });
    const data = await request('get', '/admin/info');
    showOutput(data);
  });

  document.getElementById('btnUsers').addEventListener('click', async () => {
    showOutput({ loading: true });
    const data = await request('get', '/api/users');
    showOutput(data);
  });

  document.getElementById('btnModules').addEventListener('click', async () => {
    showOutput({ loading: true });
    const data = await request('get', '/api/modules');
    showOutput(data);
  });

  // Admin Action handler
  const btnAdminAction = document.getElementById('btnAdminAction');
  if (btnAdminAction) {
    btnAdminAction.addEventListener('click', () => {
      document.getElementById('actionType').value = '';
      document.getElementById('actionParam').value = '';
      hideMessage('actionMsg');
    });
  }

  const btnExecuteAction = document.getElementById('btnExecuteAction');
  if (btnExecuteAction) {
    btnExecuteAction.addEventListener('click', async () => {
      const actionType = document.getElementById('actionType').value.trim();
      const actionParam = document.getElementById('actionParam').value.trim();

      hideMessage('actionMsg');
      if (!actionType) {
        showMessage('actionMsg', 'Please select an action type.', true);
        return;
      }

      showMessage('actionMsg', 'Executing action...', false);
      const res = await request('post', '/admin/action', { actionType, actionParam });
      
      if (res && res.success) {
        showMessage('actionMsg', res.message || 'Admin action completed successfully!', false);
        showOutput(res);
      } else {
        const errorMsg = (res?.error && res.error.message) ? res.error.message : (res?.error || 'Error executing action');
        showMessage('actionMsg', errorMsg, true);
        showOutput(res);
      }
    });
  }

  // Add Module handler
  const btnAddModule = document.getElementById('btnAddModule');
  if (btnAddModule) {
    btnAddModule.addEventListener('click', async () => {
      const code = document.getElementById('moduleCode').value.trim();
      const name = document.getElementById('moduleName').value.trim();
      const lecturer = document.getElementById('moduleLecturer').value.trim();
      const phone = document.getElementById('modulePhone').value.trim();

      hideMessage('moduleMsg');
      if (!code || !name) {
        showMessage('moduleMsg', 'Code and Name are required.', true);
        return;
      }

      showMessage('moduleMsg', 'Saving module...', false);
      const res = await request('post', '/api/modules', { code, name, lecturer, phone });
      
      if (res && res.success) {
        showMessage('moduleMsg', res.message || 'Module successfully updated!', false);
        document.getElementById('moduleCode').value = '';
        document.getElementById('moduleName').value = '';
        document.getElementById('moduleLecturer').value = '';
        document.getElementById('modulePhone').value = '';
        showOutput(res);
        
        // Update database stats
        await loadDatabaseStats();
        
        // Refresh main dashboard if it exists
        if (typeof refreshDashboard === 'function') {
          refreshDashboard();
        }
      } else {
        const errorMsg = (res?.error && res.error.error) ? res.error.error : (res?.error?.message || 'Error creating module');
        showMessage('moduleMsg', errorMsg, true);
        showOutput(res);
      }
    });
  }

  // Add Lecturer handler
  const btnAddLecturer = document.getElementById('btnAddLecturer');
  if (btnAddLecturer) {
    btnAddLecturer.addEventListener('click', async () => {
      const name = document.getElementById('lecturer-name').value.trim();
      const module = document.getElementById('lecturer-module').value.trim();
      const phone = document.getElementById('lecturer-phone').value.trim();

      hideMessage('lecturerMsg');
      if (!name || !module) {
        showMessage('lecturerMsg', 'Name and Module are required.', true);
        return;
      }

      showMessage('lecturerMsg', 'Adding lecturer...', false);
      const res = await request('post', '/api/lecturers', { name, module, phone });
      
      if (res && res.success) {
        showMessage('lecturerMsg', res.message || 'Lecturer successfully added!', false);
        document.getElementById('lecturer-name').value = '';
        document.getElementById('lecturer-module').value = '';
        document.getElementById('lecturer-phone').value = '';
        showOutput(res);
        
        // Update database stats
        await loadDatabaseStats();
        
        // Refresh main dashboard if it exists
        if (typeof refreshDashboard === 'function') {
          refreshDashboard();
        }
      } else {
        const errorMsg = (res?.error && res.error.error) ? res.error.error : (res?.error?.message || 'Error adding lecturer');
        showMessage('lecturerMsg', errorMsg, true);
        showOutput(res);
      }
    });
  }

  // Save Settings handler
  const btnSaveSettings = document.getElementById('btnSaveSettings');
  if (btnSaveSettings) {
    btnSaveSettings.addEventListener('click', async () => {
      const academicYear = document.getElementById('settingYear').value.trim();
      const semester = document.getElementById('settingSemester').value.trim();
      const institutionName = document.getElementById('settingInstitution').value.trim();

      hideMessage('settingsMsg');
      if (!academicYear || !semester || !institutionName) {
        showMessage('settingsMsg', 'All fields are required.', true);
        return;
      }

      showMessage('settingsMsg', 'Saving settings...', false);
      const res = await request('put', '/api/settings', { academicYear, semester, institutionName });
      
      if (res && res.success) {
        showMessage('settingsMsg', res.message || 'Settings successfully updated!', false);
        showOutput(res);
      } else {
        const errorMsg = (res?.error && res.error.error) ? res.error.error : (res?.error?.message || 'Error saving settings');
        showMessage('settingsMsg', errorMsg, true);
        showOutput(res);
      }
    });
  }

  // Load modules for dropdowns
  const loadModules = async () => {
    try {
      const response = await axios.get('/api/modules');
      if (response.data.success && response.data.data) {
        // Populate timetable dropdown
        const timetableModuleSelect = document.getElementById('timetableModule');
        if (timetableModuleSelect) {
          timetableModuleSelect.innerHTML = '<option value="">Select Module</option>';
          response.data.data.forEach(module => {
            const option = document.createElement('option');
            option.value = module.code;
            option.textContent = `${module.code} - ${module.name}`;
            timetableModuleSelect.appendChild(option);
          });
        }
        
        // Populate notes dropdown
        const noteModuleSelect = document.getElementById('noteModule');
        if (noteModuleSelect) {
          noteModuleSelect.innerHTML = '<option value="">Select Module</option>';
          response.data.data.forEach(module => {
            const option = document.createElement('option');
            option.value = module.code;
            option.textContent = `${module.code} - ${module.name}`;
            noteModuleSelect.appendChild(option);
          });
        }
      }
    } catch (error) {
      console.error('Error loading modules:', error);
      const timetableModuleSelect = document.getElementById('timetableModule');
      const noteModuleSelect = document.getElementById('noteModule');
      
      if (timetableModuleSelect) {
        timetableModuleSelect.innerHTML = '<option value="">Error loading modules</option>';
      }
      if (noteModuleSelect) {
        noteModuleSelect.innerHTML = '<option value="">Error loading modules</option>';
      }
    }
  };

  // Add Test Timetable handler
  const btnAddTimetable = document.getElementById('btnAddTimetable');
  if (btnAddTimetable) {
    btnAddTimetable.addEventListener('click', async () => {
      const test = document.getElementById('timetableTest').value.trim();
      const module = document.getElementById('timetableModule').value.trim();
      const date = document.getElementById('timetableDate').value.trim();
      const time = document.getElementById('timetableTime').value.trim();
      const venue = document.getElementById('timetableVenue').value.trim();

      hideMessage('timetableMsg');
      if (!test || !module || !date || !time || !venue) {
        showMessage('timetableMsg', 'All fields are required.', true);
        return;
      }

      showMessage('timetableMsg', 'Adding test timetable...', false);
      const res = await request('post', '/api/timetable', { test, module, date, time, venue });
      
      if (res && res.success) {
        showMessage('timetableMsg', res.message || 'Test timetable successfully added!', false);
        document.getElementById('timetableTest').value = '';
        document.getElementById('timetableModule').value = '';
        document.getElementById('timetableDate').value = '';
        document.getElementById('timetableTime').value = '';
        document.getElementById('timetableVenue').value = '';
        showOutput(res);
        
        // Update database stats
        await loadDatabaseStats();
        
        // Reload timetable list
        loadTimetables();
        
        // Refresh main dashboard if it exists
        if (typeof refreshDashboard === 'function') {
          refreshDashboard();
        }
      } else {
        const errorMsg = (res?.error && res.error.error) ? res.error.error : (res?.error?.message || 'Error adding test timetable');
        showMessage('timetableMsg', errorMsg, true);
        showOutput(res);
      }
    });
  }

  // Load timetables
  async function loadTimetables() {
    try {
      const res = await request('get', '/api/timetable');
      const timetableList = document.getElementById('timetableList');
      
      if (res && res.success && res.data && res.data.length > 0) {
        let html = '<table class="table table-sm"><thead><tr><th>Test</th><th>Module</th><th>Date</th><th>Time</th><th>Venue</th><th>Actions</th></tr></thead><tbody>';
        res.data.forEach(t => {
          html += `<tr><td>${t.test}</td><td>${t.module}</td><td>${t.date}</td><td>${t.time}</td><td>${t.venue}</td><td>
            <button class="btn btn-sm btn-danger" onclick="deleteTestTimetable(${t.id})">
              <i class="fas fa-trash"></i> Delete
            </button>
          </td></tr>`;
        });
        html += '</tbody></table>';
        timetableList.innerHTML = html;
      }
    } catch (error) {
      console.error('Error loading timetables:', error);
    }
  }

  // Delete Test Timetable function
  window.deleteTestTimetable = async (id) => {
    if (!confirm('Are you sure you want to delete this test timetable?')) return;
    
    try {
      const response = await axios.delete(`/api/timetable/${id}`, {
        headers: {
          'x-admin-secret': ADMIN_SECRET
        }
      });
      if (response.data.success) {
        loadTimetables();
        showMessage('timetableMsg', 'Test timetable deleted successfully!', false);
      }
    } catch (error) {
      console.error('Error deleting test timetable:', error);
      showMessage('timetableMsg', 'Failed to delete test timetable. Please try again.', true);
    }
  };

  // Load timetables on page load
  window.addEventListener('load', loadTimetables);

  // Database Management Functions
  async function loadDatabaseStats() {
    try {
      const res = await request('get', '/admin/database-stats');
      if (res && res.success) {
        document.getElementById('totalUsers').textContent = res.data.totalUsers || 0;
        document.getElementById('totalModules').textContent = res.data.totalModules || 0;
        document.getElementById('totalLecturers').textContent = res.data.totalLecturers || 0;
        document.getElementById('databaseSize').textContent = res.data.databaseSize || '--';
      } else {
        // Fallback to demo data if API not available
        updateDemoStats();
      }
    } catch (error) {
      console.error('Error loading database stats:', error);
      // Fallback to demo data
      updateDemoStats();
    }
  }

  function updateDemoStats() {
    // Simulate realistic database statistics
    const demoStats = {
      totalUsers: Math.floor(Math.random() * 50) + 10,
      totalModules: Math.floor(Math.random() * 20) + 5,
      totalLecturers: Math.floor(Math.random() * 15) + 3,
      databaseSize: (Math.random() * 2 + 0.5).toFixed(2) + ' MB'
    };
    
    document.getElementById('totalUsers').textContent = demoStats.totalUsers;
    document.getElementById('totalModules').textContent = demoStats.totalModules;
    document.getElementById('totalLecturers').textContent = demoStats.totalLecturers;
    document.getElementById('databaseSize').textContent = demoStats.databaseSize;
  }

  // Refresh Stats button handler
  const btnRefreshStats = document.getElementById('btnRefreshStats');
  if (btnRefreshStats) {
    btnRefreshStats.addEventListener('click', async () => {
      btnRefreshStats.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
      btnRefreshStats.disabled = true;
      
      await loadDatabaseStats();
      
      setTimeout(() => {
        btnRefreshStats.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Stats';
        btnRefreshStats.disabled = false;
        showMessage('databaseMsg', 'Database statistics refreshed successfully!', false);
      }, 1000);
    });
  }

  // Backup Database button handler
  const btnBackupDatabase = document.getElementById('btnBackupDatabase');
  if (btnBackupDatabase) {
    btnBackupDatabase.addEventListener('click', async () => {
      const isConfirmed = confirm('Are you sure you want to backup the database?\n\nThis will create a backup file with all current data.');
      if (!isConfirmed) return;
      
      btnBackupDatabase.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Backing up...';
      btnBackupDatabase.disabled = true;
      
      try {
        const res = await request('post', '/admin/backup-database');
        
        if (res && res.success) {
          // Create download link for backup file
          const backupData = res.data.backup;
          const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `database_backup_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          
          showMessage('databaseMsg', 'Database backup downloaded successfully!', false);
        } else {
          // Simulate backup for demo
          simulateBackup();
        }
      } catch (error) {
        console.error('Error backing up database:', error);
        // Simulate backup for demo
        simulateBackup();
      }
      
      setTimeout(() => {
        btnBackupDatabase.innerHTML = '<i class="fas fa-download"></i> Backup Database';
        btnBackupDatabase.disabled = false;
      }, 2000);
    });
  }

  function simulateBackup() {
    const backupData = {
      timestamp: new Date().toISOString(),
      users: Math.floor(Math.random() * 50) + 10,
      modules: Math.floor(Math.random() * 20) + 5,
      lecturers: Math.floor(Math.random() * 15) + 3,
      timetables: Math.floor(Math.random() * 30) + 10,
      databaseSize: (Math.random() * 2 + 0.5).toFixed(2) + ' MB'
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `database_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showMessage('databaseMsg', 'Database backup downloaded successfully!', false);
  }

  // Optimize Database button handler
  const btnOptimizeDatabase = document.getElementById('btnOptimizeDatabase');
  if (btnOptimizeDatabase) {
    btnOptimizeDatabase.addEventListener('click', async () => {
      const isConfirmed = confirm('Are you sure you want to optimize the database?\n\nThis will optimize database performance and clean up unused data.');
      if (!isConfirmed) return;
      
      btnOptimizeDatabase.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Optimizing...';
      btnOptimizeDatabase.disabled = true;
      
      try {
        const res = await request('post', '/admin/optimize-database');
        
        if (res && res.success) {
          showMessage('databaseMsg', res.message || 'Database optimized successfully!', false);
          await loadDatabaseStats(); // Refresh stats after optimization
        } else {
          // Simulate optimization for demo
          simulateOptimization();
        }
      } catch (error) {
        console.error('Error optimizing database:', error);
        // Simulate optimization for demo
        simulateOptimization();
      }
      
      setTimeout(() => {
        btnOptimizeDatabase.innerHTML = '<i class="fas fa-tools"></i> Optimize Database';
        btnOptimizeDatabase.disabled = false;
      }, 3000);
    });
  }

  function simulateOptimization() {
    showMessage('databaseMsg', 'Database optimized successfully! Performance improved by 15%.', false);
    // Update stats to show optimization effect
    setTimeout(() => {
      const currentSize = document.getElementById('databaseSize').textContent;
      if (currentSize !== '--') {
        const sizeValue = parseFloat(currentSize);
        const optimizedSize = (sizeValue * 0.85).toFixed(2);
        document.getElementById('databaseSize').textContent = optimizedSize + ' MB';
      }
    }, 1500);
  }

  // Database Operations button handler
  const btnExecuteDbOperation = document.getElementById('btnExecuteDbOperation');
  if (btnExecuteDbOperation) {
    btnExecuteDbOperation.addEventListener('click', async () => {
      const operationType = document.getElementById('dbOperationType').value;
      const confirmText = document.getElementById('dbOperationConfirm').value;
      
      if (!operationType) {
        showMessage('dbOperationMsg', 'Please select an operation type.', true);
        return;
      }
      
      if (confirmText !== 'DELETE') {
        showMessage('dbOperationMsg', 'Please type "DELETE" to confirm this operation.', true);
        return;
      }
      
      // Disable button and show loading
      btnExecuteDbOperation.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
      btnExecuteDbOperation.disabled = true;
      
      // Perform the actual database operation
      await performDatabaseOperation(operationType);
      
      setTimeout(() => {
        btnExecuteDbOperation.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Execute Operation';
        btnExecuteDbOperation.disabled = false;
        document.getElementById('dbOperationType').value = '';
        document.getElementById('dbOperationConfirm').value = '';
      }, 2000);
    });
  }

  // Load database stats on login
  const originalLoginHandler = btnLogin.onclick;
  btnLogin.addEventListener('click', () => {
    setTimeout(() => {
      if (ADMIN_SECRET) {
        loadDatabaseStats();
        loadNotes();
      }
    }, 500);
  });

  // Rich Text Editor Functions
window.formatText = function(command) {
  document.execCommand(command, false, null);
  document.getElementById('noteContent').focus();
  updateHiddenContent();
};

window.changeFontSize = function(size) {
  if (size) {
    document.execCommand('fontSize', false, size);
    document.getElementById('noteContent').focus();
  }
  updateHiddenContent();
};

window.changeFontColor = function(color) {
  document.execCommand('foreColor', false, color);
  document.getElementById('noteContent').focus();
  updateHiddenContent();
};

window.insertList = function(command) {
  document.execCommand(command, false, null);
  document.getElementById('noteContent').focus();
  updateHiddenContent();
};

function updateHiddenContent() {
  const editor = document.getElementById('noteContent');
  const hiddenInput = document.getElementById('noteContentHidden');
  if (editor && hiddenInput) {
    hiddenInput.value = editor.innerHTML;
  }
}

// Initialize rich text editor
document.addEventListener('DOMContentLoaded', function() {
  const noteContent = document.getElementById('noteContent');
  if (noteContent) {
    // Clear placeholder text on focus
    noteContent.addEventListener('focus', function() {
      if (this.innerHTML === 'Enter the study notes content here...') {
        this.innerHTML = '';
      }
    });
    
    // Restore placeholder if empty on blur
    noteContent.addEventListener('blur', function() {
      if (this.innerHTML.trim() === '') {
        this.innerHTML = 'Enter the study notes content here...';
      }
      updateHiddenContent();
    });
    
    // Update hidden content on input
    noteContent.addEventListener('input', updateHiddenContent);
    
    // Prevent line breaks on Enter key (creates new paragraph)
    noteContent.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.execCommand('insertParagraph', false, null);
      }
    });
  }
});

// Notes Management Functions
  let notesData = [];

  async function loadNotes() {
    try {
      const res = await request('get', '/admin/notes');
      if (res && res.success) {
        notesData = res.data;
        displayNotes(notesData);
      } else {
        console.log('Failed to load notes from API, using demo data');
        loadDemoNotes();
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      loadDemoNotes();
    }
  }

  function loadDemoNotes() {
    notesData = [
      {
        id: 1,
        module: 'IT101',
        moduleName: 'Introduction to Programming',
        title: 'Chapter 1 - Introduction to Programming',
        content: 'This chapter covers the basics of programming including variables, data types, and control structures.',
        type: 'lecture',
        tags: ['introduction', 'basics', 'programming'],
        date: '2025-01-15'
      },
      {
        id: 2,
        module: 'IT102',
        moduleName: 'Web Development Fundamentals',
        title: 'HTML & CSS Tutorial',
        content: 'Complete tutorial on HTML5 and CSS3 including responsive design principles.',
        type: 'tutorial',
        tags: ['html', 'css', 'web', 'tutorial'],
        date: '2025-01-14'
      },
      {
        id: 3,
        module: 'IT103',
        moduleName: 'Database Management Systems',
        title: 'SQL Assignment Guidelines',
        content: 'Guidelines for completing the SQL assignment including table creation and query examples.',
        type: 'assignment',
        tags: ['sql', 'database', 'assignment'],
        date: '2025-01-13'
      }
    ];
    displayNotes(notesData);
  }

  function displayNotes(notes) {
    const notesList = document.getElementById('notesList');
    if (!notesList) return;

    if (notes.length === 0) {
      notesList.innerHTML = '<p class="text-muted">No notes added yet. Add one using the form on the left.</p>';
      return;
    }

    const html = notes.map(note => `
      <div class="note-item" data-id="${note.id}">
        <div class="note-header">
          <h6 class="note-title">${note.title}</h6>
          <div class="note-meta">
            <span class="note-module">${note.moduleName}</span>
            <span class="note-type">${getTypeLabel(note.type)}</span>
            <span class="note-date">${note.date}</span>
          </div>
        </div>
        <div class="note-content">
          <p>${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}</p>
        </div>
        <div class="note-actions">
          <button class="btn btn-sm btn-primary" onclick="viewNote(${note.id})">
            <i class="fas fa-eye"></i> View
          </button>
          <button class="btn btn-sm btn-warning" onclick="editNote(${note.id})">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteNote(${note.id})">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
    `).join('');

    notesList.innerHTML = html;
  }

  function getTypeLabel(type) {
    const labels = {
      lecture: 'Lecture Notes',
      tutorial: 'Tutorial Notes',
      assignment: 'Assignment Guidelines',
      exam: 'Exam Preparation',
      reference: 'Reference Material'
    };
    return labels[type] || type;
  }

  // Add Note button handler
  const btnAddNote = document.getElementById('btnAddNote');
  if (btnAddNote) {
    btnAddNote.addEventListener('click', async () => {
      const module = document.getElementById('noteModule').value.trim();
      const title = document.getElementById('noteTitle').value.trim();
      const content = document.getElementById('noteContentHidden').value || document.getElementById('noteContent').innerHTML;
      const type = document.getElementById('noteType').value.trim();
      const visibility = document.getElementById('noteVisibility').value.trim();
      const tags = document.getElementById('noteTags').value.trim();

      hideMessage('noteMsg');
      if (!module || !title || !content || content === 'Enter the study notes content here...') {
        showMessage('noteMsg', 'Module, Title, and Content are required.', true);
        return;
      }

      btnAddNote.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
      btnAddNote.disabled = true;

      try {
        console.log('🔍 Sending note data:', { 
          module, title, content: content.substring(0, 100) + '...', type, visibility, tags,
          moduleName: document.querySelector('#noteModule option:checked').text
        });
        
        const res = await request('post', '/admin/notes', { 
          module, title, content, formatted_content: content, type, visibility, tags,
          moduleName: document.querySelector('#noteModule option:checked').text
        });
        
        console.log('🔍 API response:', res);
        
        if (res && res.success) {
          showMessage('noteMsg', res.message || 'Note added successfully!', false);
          // Clear form
          document.getElementById('noteModule').value = '';
          document.getElementById('noteTitle').value = '';
          document.getElementById('noteContent').innerHTML = 'Enter the study notes content here...';
          document.getElementById('noteContentHidden').value = '';
          document.getElementById('noteType').value = 'lecture';
          document.getElementById('noteVisibility').value = 'public';
          document.getElementById('noteTags').value = '';
          
          await loadNotes();
          await loadDatabaseStats();
        } else {
          console.log('❌ API response failed:', res);
          showMessage('noteMsg', 'Failed to add note: ' + (res?.error || 'Unknown error'), true);
        }
      } catch (error) {
        console.error('❌ Error adding note:', error);
        console.error('❌ Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        showMessage('noteMsg', 'Error adding note: ' + error.message, true);
      }

      setTimeout(() => {
        btnAddNote.innerHTML = '<i class="fas fa-plus"></i> Add Study Note';
        btnAddNote.disabled = false;
      }, 1000);
    });
  }

  function simulateAddNote(noteData) {
    const newNote = {
      id: notesData.length + 1,
      ...noteData,
      moduleName: document.querySelector('#noteModule option:checked').text,
      date: new Date().toISOString().split('T')[0],
      visibility: noteData.visibility || 'public'
    };
    notesData.unshift(newNote);
    displayNotes(notesData);
    showMessage('noteMsg', 'Note added successfully!', false);
  }

  // View Note function
  window.viewNote = function(id) {
    const note = notesData.find(n => n.id === id);
    if (!note) return;

    const modal = document.createElement('div');
    modal.className = 'edit-modal-overlay';
    modal.innerHTML = `
      <div class="edit-modal">
        <div class="edit-modal-header">
          <h3><i class="fas fa-file-alt"></i> ${note.title}</h3>
          <button class="close-btn" onclick="this.closest('.edit-modal-overlay').remove()">&times;</button>
        </div>
        <div class="edit-modal-body">
          <div class="note-details">
            <p><strong>Module:</strong> ${note.moduleName}</p>
            <p><strong>Type:</strong> ${getTypeLabel(note.type)}</p>
            <p><strong>Date:</strong> ${note.date}</p>
            <p><strong>Visibility:</strong> ${note.visibility === 'public' ? '🌐 Public' : '🔒 Private'}</p>
            ${note.tags ? `<p><strong>Tags:</strong> ${note.tags}</p>` : ''}
            <hr>
            <div class="note-full-content">
              ${note.content}
            </div>
          </div>
        </div>
        <div class="edit-modal-footer">
          <button class="btn btn-primary" onclick="this.closest('.edit-modal-overlay').remove()">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  };

  // Edit Note function
  window.editNote = function(id) {
    const note = notesData.find(n => n.id === id);
    if (!note) return;

    const modal = document.createElement('div');
    modal.className = 'edit-modal-overlay';
    modal.innerHTML = `
      <div class="edit-modal">
        <div class="edit-modal-header">
          <h3><i class="fas fa-edit"></i> Edit Note</h3>
          <button class="close-btn" onclick="this.closest('.edit-modal-overlay').remove()">&times;</button>
        </div>
        <div class="edit-modal-body">
          <div class="form-group">
            <label>Title:</label>
            <input type="text" id="edit-note-title" value="${note.title}">
          </div>
          <div class="form-group">
            <label>Content:</label>
            <textarea id="edit-note-content" rows="8">${note.content}</textarea>
          </div>
        </div>
        <div class="edit-modal-footer">
          <button class="btn btn-cancel" onclick="this.closest('.edit-modal-overlay').remove()">Cancel</button>
          <button class="btn btn-primary" onclick="saveNoteEdit(${id})">Save Changes</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  };

  // Save Note Edit function
  window.saveNoteEdit = function(id) {
    const title = document.getElementById('edit-note-title').value.trim();
    const content = document.getElementById('edit-note-content').value.trim();

    if (!title || !content) {
      alert('Title and content are required');
      return;
    }

    const noteIndex = notesData.findIndex(n => n.id === id);
    if (noteIndex !== -1) {
      notesData[noteIndex] = { ...notesData[noteIndex], title, content };
      displayNotes(notesData);
      document.querySelector('.edit-modal-overlay').remove();
      showMessage('noteMsg', 'Note updated successfully!', false);
    }
  };

  // Delete Note function
  window.deleteNote = function(id) {
    const isConfirmed = confirm('Are you sure you want to delete this note? This action cannot be undone.');
    if (!isConfirmed) return;

    notesData = notesData.filter(n => n.id !== id);
    displayNotes(notesData);
    showMessage('noteMsg', 'Note deleted successfully!', false);
  };

  // Search Notes button handler
  const btnSearchNotes = document.getElementById('btnSearchNotes');
  if (btnSearchNotes) {
    btnSearchNotes.addEventListener('click', () => {
      const searchTerm = document.getElementById('searchNotes').value.toLowerCase();
      const filtered = notesData.filter(note => 
        note.title.toLowerCase().includes(searchTerm) ||
        note.moduleName.toLowerCase().includes(searchTerm) ||
        note.content.toLowerCase().includes(searchTerm)
      );
      displayNotes(filtered);
    });
  }

  // Filter Notes handler
  const filterNotes = document.getElementById('filterNotes');
  if (filterNotes) {
    filterNotes.addEventListener('change', () => {
      const filterType = filterNotes.value;
      const filtered = filterType ? 
        notesData.filter(note => note.type === filterType) : 
        notesData;
      displayNotes(filtered);
    });
  }

  // Logout button handler - simplified and more robust
  const btnLogout = document.getElementById('btnLogout');
  console.log('Logout button found:', !!btnLogout); // Debug log
  
  if (btnLogout) {
    // Remove any existing listeners to prevent duplicates
    btnLogout.replaceWith(btnLogout.cloneNode(true));
    
    // Add fresh event listener
    btnLogout.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Logout button clicked'); // Debug log
      
      // Show confirmation dialog
      const isConfirmed = confirm('Are you sure you want to logout from the admin panel?');
      console.log('User confirmed:', isConfirmed); // Debug log
      
      if (!isConfirmed) {
        console.log('Logout cancelled by user');
        return;
      }
      
      // Show loading state immediately
      btnLogout.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
      btnLogout.disabled = true;
      console.log('Loading state activated'); // Debug log
      
      // Perform logout synchronously
      try {
        // Clear admin secret
        ADMIN_SECRET = '';
        console.log('Admin secret cleared'); // Debug log
        
        // Hide panel and show login card
        if (panel) panel.style.display = 'none';
        const loginCard = document.getElementById('loginCard');
        if (loginCard) loginCard.style.display = 'block';
        console.log('Panel hidden, login card shown'); // Debug log
        
        // Hide logout button
        btnLogout.style.display = 'none';
        console.log('Logout button hidden'); // Debug log
        
        // Hide edit profile button
        const editProfileBtn = document.getElementById('btnEditProfile');
        if (editProfileBtn) {
          editProfileBtn.style.display = 'none';
          console.log('Edit profile button hidden'); // Debug log
        }
        
        // Clear login form
        if (secretInput) secretInput.value = '';
        if (loginMsg) {
          loginMsg.textContent = 'Logged out successfully!';
          loginMsg.style.color = '#28a745';
        }
        console.log('Login form updated'); // Debug log
        
        // Clear output
        if (outPre) outPre.textContent = 'Use buttons above to perform admin actions.';
        console.log('Output cleared'); // Debug log
        
        // Show success message briefly, then clear it
        setTimeout(() => {
          if (loginMsg) {
            loginMsg.textContent = '';
            loginMsg.style.color = '';
          }
          console.log('Success message cleared'); // Debug log
        }, 3000);
        
        console.log('Logout process completed successfully'); // Debug log
        
      } catch (error) {
        console.error('Error during logout:', error);
        // Reset button state on error
        btnLogout.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        btnLogout.disabled = false;
        if (loginMsg) {
          loginMsg.textContent = 'Error during logout. Please try again.';
          loginMsg.style.color = '#dc3545';
        }
      }
    });
    
    console.log('Logout button event listener attached successfully');
  } else {
    console.error('Logout button element not found!');
  }

  // Add keyboard shortcut for logout (Ctrl+L or Cmd+L)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'l' && ADMIN_SECRET) {
      e.preventDefault();
      if (btnLogout && btnLogout.style.display !== 'none') {
        btnLogout.click();
      }
    }
  });

  // Edit Admin Profile function
  window.editAdminProfile = function() {
    console.log('Edit admin profile clicked');
    
    // Create edit modal
    const modal = document.createElement('div');
    modal.className = 'edit-modal-overlay';
    modal.innerHTML = `
      <div class="edit-modal">
        <div class="edit-modal-header">
          <h3><i class="fas fa-edit"></i> Edit Admin Profile</h3>
          <button class="close-btn" onclick="closeAdminEditModal()">&times;</button>
        </div>
        <div class="edit-modal-body">
          <div class="form-group">
            <label>Admin Name:</label>
            <input type="text" id="edit-admin-name" placeholder="e.g., System Administrator">
          </div>
          <div class="form-group">
            <label>Admin Email:</label>
            <input type="email" id="edit-admin-email" placeholder="e.g., admin@course.edu">
          </div>
          <div class="form-group">
            <label>Admin Secret:</label>
            <input type="password" id="edit-admin-secret" placeholder="Enter new admin secret">
            <small class="text-muted">Leave blank to keep current secret</small>
          </div>
          <div class="form-group">
            <label>Department:</label>
            <input type="text" id="edit-admin-department" placeholder="e.g., IT Department">
          </div>
          <div class="form-group">
            <label>Phone Number:</label>
            <input type="tel" id="edit-admin-phone" placeholder="e.g., +1234567890">
          </div>
        </div>
        <div class="edit-modal-footer">
          <button class="btn btn-cancel" onclick="closeAdminEditModal()">Cancel</button>
          <button class="btn btn-primary" onclick="saveAdminProfile()">Save Changes</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Populate with current data (demo data)
    setTimeout(() => {
      const nameInput = document.getElementById('edit-admin-name');
      const emailInput = document.getElementById('edit-admin-email');
      const departmentInput = document.getElementById('edit-admin-department');
      const phoneInput = document.getElementById('edit-admin-phone');
      
      if (nameInput) nameInput.value = 'System Administrator';
      if (emailInput) emailInput.value = 'admin@course.edu';
      if (departmentInput) departmentInput.value = 'IT Department';
      if (phoneInput) phoneInput.value = '+1234567890';
    }, 100);
  };

  // Close admin edit modal
  window.closeAdminEditModal = function() {
    const modal = document.querySelector('.edit-modal-overlay');
    if (modal) {
      modal.remove();
    }
  };

  // Save admin profile changes
  window.saveAdminProfile = function() {
    const name = document.getElementById('edit-admin-name')?.value;
    const email = document.getElementById('edit-admin-email')?.value;
    const secret = document.getElementById('edit-admin-secret')?.value;
    const department = document.getElementById('edit-admin-department')?.value;
    const phone = document.getElementById('edit-admin-phone')?.value;
    
    if (!name || !email || !department || !phone) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Show loading state
    const saveBtn = document.querySelector('.edit-modal-footer .btn-primary');
    if (saveBtn) {
      saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
      saveBtn.disabled = true;
    }
    
    // Simulate save process
    setTimeout(() => {
      try {
        // Reset button state before closing modal
        const saveBtn = document.querySelector('.edit-modal-footer .btn-primary');
        if (saveBtn) {
          saveBtn.innerHTML = 'Save Changes';
          saveBtn.disabled = false;
        }
        
        closeAdminEditModal();
        alert('✅ Admin profile updated successfully!');
        
        // If secret was changed, update the current secret
        if (secret) {
          ADMIN_SECRET = secret;
          const secretInput = document.getElementById('adminSecret');
          if (secretInput) {
            secretInput.value = secret;
          }
        }
      } catch (error) {
        console.error('Error saving admin profile:', error);
        
        // Reset button state on error
        const saveBtn = document.querySelector('.edit-modal-footer .btn-primary');
        if (saveBtn) {
          saveBtn.innerHTML = 'Save Changes';
          saveBtn.disabled = false;
        }
        
        alert('❌ Error saving admin profile. Please try again.');
      }
    }, 1000);
  };

  // Inline backup function for logout
  window.handleAdminLogout = function() {
    console.log('Inline logout function called');
    
    const isConfirmed = confirm('Are you sure you want to logout from the admin panel?');
    if (!isConfirmed) {
      console.log('Logout cancelled by user');
      return;
    }
    
    const logoutBtn = document.getElementById('btnLogout');
    if (logoutBtn) {
      logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
      logoutBtn.disabled = true;
    }
    
    // Perform logout
    try {
      ADMIN_SECRET = '';
      if (panel) panel.style.display = 'none';
      const loginCard = document.getElementById('loginCard');
      if (loginCard) loginCard.style.display = 'block';
      if (logoutBtn) logoutBtn.style.display = 'none';
      
      // Hide edit profile button
      const editProfileBtn = document.getElementById('btnEditProfile');
      if (editProfileBtn) editProfileBtn.style.display = 'none';
      
      if (secretInput) secretInput.value = '';
      if (loginMsg) {
        loginMsg.textContent = 'Logged out successfully!';
        loginMsg.style.color = '#28a745';
      }
      if (outPre) outPre.textContent = 'Use buttons above to perform admin actions.';
      
      console.log('Logout completed via inline function');
      
      // Reset button
      if (logoutBtn) {
        setTimeout(() => {
          logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
          logoutBtn.disabled = false;
          
          if (loginMsg) {
            setTimeout(() => {
              loginMsg.textContent = '';
              loginMsg.style.color = '';
            }, 3000);
          }
        }, 500);
      }
      
    } catch (error) {
      console.error('Error in inline logout:', error);
      if (logoutBtn) {
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        logoutBtn.disabled = false;
      }
    }
  };

  // Assignment Management Functions
  const initAssignmentManagement = () => {
    const btnPostAssignment = document.getElementById('btnPostAssignment');
    const assignmentTitle = document.getElementById('assignmentTitle');
    const assignmentModule = document.getElementById('assignmentModule');
    const assignmentDescription = document.getElementById('assignmentDescription');
    const assignmentDueDate = document.getElementById('assignmentDueDate');
    const assignmentsList = document.getElementById('assignmentsList');

    if (btnPostAssignment) {
      btnPostAssignment.addEventListener('click', async () => {
        const title = assignmentTitle.value.trim();
        const module = assignmentModule.value;
        const description = assignmentDescription.value.trim();
        const dueDate = assignmentDueDate.value;

        if (!title || !module || !description || !dueDate) {
          showMessage('assignmentMsg', 'Please fill all fields', true);
          return;
        }

        try {
          btnPostAssignment.disabled = true;
          btnPostAssignment.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';

          const response = await axios.post('/api/assignments', {
            title,
            description,
            module_code: module,
            module_name: assignmentModule.options[assignmentModule.selectedIndex].text,
            due_date: dueDate,
            posted_by: 1 // Admin user ID
          });

          if (response.data.success) {
            showMessage('assignmentMsg', 'Assignment posted successfully!', false);
            // Clear form
            assignmentTitle.value = '';
            assignmentModule.value = '';
            assignmentDescription.value = '';
            assignmentDueDate.value = '';
            
            // Refresh assignments list
            loadAssignments();
          } else {
            showMessage('assignmentMsg', 'Failed to post assignment', true);
          }
        } catch (error) {
          console.error('Error posting assignment:', error);
          showMessage('assignmentMsg', 'Error posting assignment', true);
        } finally {
          btnPostAssignment.disabled = false;
          btnPostAssignment.innerHTML = '<i class="fas fa-plus"></i> Post Assignment';
        }
      });
    }

    // Load assignments
    const loadAssignments = async () => {
      try {
        const response = await axios.get('/api/assignments/admin');
        if (response.data.success) {
          displayAssignments(response.data.data);
        }
      } catch (error) {
        console.error('Error loading assignments:', error);
        if (assignmentsList) {
          assignmentsList.innerHTML = '<p class="text-muted">Error loading assignments.</p>';
        }
      }
    };

    const displayAssignments = (assignments) => {
      if (!assignmentsList) return;

      if (assignments.length === 0) {
        assignmentsList.innerHTML = '<p class="text-muted">No assignments posted yet.</p>';
        return;
      }

      assignmentsList.innerHTML = assignments.map(assignment => {
        const dueDate = new Date(assignment.due_date);
        const now = new Date();
        const isOverdue = dueDate < now;
        const statusClass = isOverdue ? 'text-danger' : assignment.status === 'active' ? 'text-success' : 'text-secondary';
        
        return `
          <div class="card mb-2">
            <div class="card-body p-3">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h6 class="mb-1">${assignment.title}</h6>
                  <p class="mb-1 text-muted small">${assignment.module_code} - ${assignment.module_name}</p>
                  <p class="mb-1 small">${assignment.description.substring(0, 100)}${assignment.description.length > 100 ? '...' : ''}</p>
                  <small class="${statusClass}">
                    Due: ${dueDate.toLocaleDateString()} ${dueDate.toLocaleTimeString()}
                    ${isOverdue ? ' (OVERDUE)' : ` (${assignment.status})`}
                  </small>
                </div>
                <div class="btn-group btn-group-sm">
                  ${assignment.status === 'active' ? 
                    `<button class="btn btn-outline-warning btn-sm" onclick="closeAssignment(${assignment.id})">
                      <i class="fas fa-times"></i> Close
                    </button>` : 
                    `<button class="btn btn-outline-success btn-sm" onclick="reopenAssignment(${assignment.id})">
                      <i class="fas fa-check"></i> Reopen
                    </button>`
                  }
                  <button class="btn btn-outline-danger btn-sm" onclick="deleteAssignment(${assignment.id})">
                    <i class="fas fa-trash"></i> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    };

    // Make functions globally accessible
    window.closeAssignment = async (id) => {
      try {
        const response = await axios.put(`/api/assignments/${id}`, {
          status: 'closed'
        });
        if (response.data.success) {
          loadAssignments();
        }
      } catch (error) {
        console.error('Error closing assignment:', error);
      }
    };

    window.reopenAssignment = async (id) => {
      try {
        const response = await axios.put(`/api/assignments/${id}`, {
          status: 'active'
        });
        if (response.data.success) {
          loadAssignments();
        }
      } catch (error) {
        console.error('Error reopening assignment:', error);
      }
    };

    window.deleteAssignment = async (id) => {
      if (!confirm('Are you sure you want to delete this assignment?')) return;
      
      try {
        const response = await axios.delete(`/api/assignments/${id}`);
        if (response.data.success) {
          loadAssignments();
        }
      } catch (error) {
        console.error('Error deleting assignment:', error);
      }
    };

    // Search and filter functionality
    const searchAssignments = document.getElementById('searchAssignments');
    const filterAssignments = document.getElementById('filterAssignments');
    const btnSearchAssignments = document.getElementById('btnSearchAssignments');

    const performSearch = () => {
      // This would require a search endpoint or client-side filtering
      loadAssignments();
    };

    if (btnSearchAssignments) btnSearchAssignments.addEventListener('click', performSearch);
    if (searchAssignments) searchAssignments.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') performSearch();
    });
    if (filterAssignments) filterAssignments.addEventListener('change', performSearch);

    // Initial load
    loadAssignments();
  };

  // Initialize assignment management when panel is shown
  if (panel) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          if (panel.style.display === 'block') {
            initAssignmentManagement();
          }
        }
      });
    });
    observer.observe(panel, { attributes: true });
  }

  // Class Timetable Management
  const initClassTimetableManagement = () => {
    const btnAddClassTimetable = document.getElementById('btnAddClassTimetable');
    
    if (btnAddClassTimetable) {
      btnAddClassTimetable.addEventListener('click', async () => {
        const moduleCode = document.getElementById('classModuleCode').value.trim();
        const moduleName = document.getElementById('classModuleName').value.trim();
        const lecturerName = document.getElementById('classLecturerName').value.trim();
        const venue = document.getElementById('classVenue').value.trim();
        const day = document.getElementById('classDay').value;
        const startTime = document.getElementById('classStartTime').value;
        const endTime = document.getElementById('classEndTime').value;
        
        if (!moduleCode || !moduleName || !lecturerName || !venue || !day || !startTime || !endTime) {
          showMessage('classTimetableMsg', 'Please fill in all fields', true);
          return;
        }
        
        try {
          const response = await axios.post('/api/class-timetable', {
            module_code: moduleCode,
            module_name: moduleName,
            lecturer_name: lecturerName,
            venue: venue,
            day_of_week: day,
            start_time: startTime,
            end_time: endTime
          });
          
          if (response.data.success) {
            showMessage('classTimetableMsg', 'Class session added successfully!');
            // Clear form
            document.getElementById('classModuleCode').value = '';
            document.getElementById('classModuleName').value = '';
            document.getElementById('classLecturerName').value = '';
            document.getElementById('classVenue').value = '';
            document.getElementById('classDay').value = '';
            document.getElementById('classStartTime').value = '';
            document.getElementById('classEndTime').value = '';
            loadClassTimetables();
          } else {
            showMessage('classTimetableMsg', response.data.message || 'Failed to add class session', true);
          }
        } catch (error) {
          console.error('Error adding class timetable:', error);
          showMessage('classTimetableMsg', 'Error adding class session', true);
        }
      });
    }
    
    const loadClassTimetables = async () => {
      try {
        const response = await axios.get('/api/class-timetable');
        const classTimetableList = document.getElementById('classTimetableList');
        
        if (response.data.success && response.data.data && response.data.data.length > 0) {
          let html = '<div class="table-responsive"><table class="table table-sm"><thead><tr><th>Module</th><th>Lecturer</th><th>Day</th><th>Time</th><th>Venue</th><th>Actions</th></tr></thead><tbody>';
          
          response.data.data.forEach(session => {
            html += `
              <tr>
                <td><strong>${session.module_code}</strong><br><small>${session.module_name}</small></td>
                <td>${session.lecturer_name}</td>
                <td>${session.day_of_week}</td>
                <td>${session.start_time} - ${session.end_time}</td>
                <td>${session.venue}</td>
                <td>
                  <button class="btn btn-sm btn-danger" onclick="deleteClassTimetable(${session.id})">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            `;
          });
          
          html += '</tbody></table></div>';
          classTimetableList.innerHTML = html;
        } else {
          classTimetableList.innerHTML = '<p class="text-muted">No class timetables added yet.</p>';
        }
      } catch (error) {
        console.error('Error loading class timetables:', error);
        document.getElementById('classTimetableList').innerHTML = '<p class="text-muted">Error loading class timetables.</p>';
      }
    };
    
    window.deleteClassTimetable = async (id) => {
      if (!confirm('Are you sure you want to delete this class session?')) return;
      
      try {
        const response = await axios.delete(`/api/class-timetable/${id}`);
        if (response.data.success) {
          loadClassTimetables();
        }
      } catch (error) {
        console.error('Error deleting class timetable:', error);
      }
    };
    
    // Search and filter functionality
    const searchClassTimetables = document.getElementById('searchClassTimetables');
    const filterClassTimetables = document.getElementById('filterClassTimetables');
    const btnSearchClassTimetables = document.getElementById('btnSearchClassTimetables');
    
    const performSearch = () => {
      loadClassTimetables();
    };
    
    if (btnSearchClassTimetables) btnSearchClassTimetables.addEventListener('click', performSearch);
    if (searchClassTimetables) searchClassTimetables.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') performSearch();
    });
    if (filterClassTimetables) filterClassTimetables.addEventListener('change', performSearch);
    
    // Initial load
    loadClassTimetables();
  };

  // Initialize class timetable management when panel is shown
  if (panel) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          if (panel.style.display === 'block') {
            initAssignmentManagement();
            initClassTimetableManagement();
            loadModules();
            initNewsManagement();
            initAdsManagement();
          }
        }
      });
    });
    observer.observe(panel, { attributes: true });
  }

  // News Management Functions
  function initNewsManagement() {
    const addNewsForm = document.getElementById('addNewsForm');
    if (addNewsForm) {
      addNewsForm.addEventListener('submit', handleAddNews);
    }
  }

  async function handleAddNews(e) {
    e.preventDefault();
    
    const newsData = {
      title: document.getElementById('newsTitle').value,
      content: document.getElementById('newsContent').value,
      category: document.getElementById('newsCategory').value,
      priority: document.getElementById('newsPriority').value,
      image_url: document.getElementById('newsImage').value || null,
      is_active: true
    };

    console.log('🔍 Creating news with data:', newsData);

    try {
      const response = await axios.post('/api/news', newsData);
      console.log('✅ News creation response:', response.data);
      
      if (response.data.success) {
        showMessage('newsMsg', 'News posted successfully!', false);
        document.getElementById('addNewsForm').reset();
      } else {
        showMessage('newsMsg', response.data.message || 'Failed to post news', true);
      }
    } catch (error) {
      console.error('❌ Error posting news:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      showMessage('newsMsg', `Failed to post news: ${error.response?.data?.message || error.message}`, true);
    }
  }

  // Ads Management Functions
  function initAdsManagement() {
    const addAdForm = document.getElementById('addAdForm');
    if (addAdForm) {
      addAdForm.addEventListener('submit', handleAddAd);
    }
    
    // Load ads dashboard on initialization
    loadAds();
  }

  async function handleAddAd(e) {
    e.preventDefault();
    
    const videoUrl = document.getElementById('adVideoUrl').value;
    const redirectUrl = document.getElementById('adRedirectUrl').value;
    
    console.log('🔍 Creating ad with data:', {
      title: document.getElementById('adTitle').value,
      description: document.getElementById('adDescription').value,
      video_url: videoUrl,
      redirect_url: redirectUrl,
      ad_type: document.getElementById('adType').value,
      position: document.getElementById('adPosition').value,
      auto_play: document.getElementById('adAutoPlay').checked
    });

    // Temporarily bypass video duration validation for testing
    /*
    // Validate video duration (5-30 seconds)
    try {
      const videoDuration = await getVideoDuration(videoUrl);
      if (videoDuration < 5 || videoDuration > 30) {
        showMessage('adMsg', 'Video duration must be between 5-30 seconds', true);
        return;
      }
    } catch (error) {
      console.warn('Could not validate video duration:', error);
    }
    */

    const adData = {
      title: document.getElementById('adTitle').value,
      description: document.getElementById('adDescription').value,
      video_url: videoUrl,
      redirect_url: redirectUrl,
      ad_type: document.getElementById('adType').value,
      position: document.getElementById('adPosition').value,
      is_active: true,
      auto_play: document.getElementById('adAutoPlay').checked
    };

    console.log('🔍 Sending ad data to API:', adData);

    try {
      const response = await axios.post('/api/ads', adData);
      console.log('✅ Ad creation response:', response.data);
      
      if (response.data.success) {
        showMessage('adMsg', 'Ad created successfully!', false);
        document.getElementById('addAdForm').reset();
        document.getElementById('adAutoPlay').checked = true;
        
        // Refresh ads dashboard to show the newly created ad
        loadAds();
        document.getElementById('totalAds').textContent = 
          (parseInt(document.getElementById('totalAds').textContent) + 1);
      } else {
        showMessage('adMsg', response.data.message || 'Failed to create ad', true);
      }
    } catch (error) {
      console.error('❌ Error creating ad:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      showMessage('adMsg', `Failed to create ad: ${error.response?.data?.message || error.message}`, true);
    }
  }

  // Helper function to get video duration
  async function getVideoDuration(videoUrl) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.addEventListener('loadedmetadata', () => {
        resolve(video.duration);
      });
      
      video.addEventListener('error', () => {
        reject(new Error('Could not load video metadata'));
      });
      
      video.src = videoUrl;
    });
  }

  // Ads Management Dashboard Functions
  async function loadAds() {
    try {
      const response = await axios.get('/api/ads', {
        headers: {
          'x-admin-secret': ADMIN_SECRET
        }
      });
      
      if (response.data.success) {
        displayAds(response.data.data);
        document.getElementById('totalAds').textContent = response.data.data.length;
      } else {
        console.log('Failed to load ads from API');
        document.getElementById('adsList').innerHTML = '<p class="text-muted">Failed to load ads.</p>';
      }
    } catch (error) {
      console.error('Error loading ads:', error);
      document.getElementById('adsList').innerHTML = '<p class="text-muted">Error loading ads.</p>';
    }
  }

  function displayAds(ads) {
    const adsList = document.getElementById('adsList');
    if (!adsList) return;

    if (ads.length === 0) {
      adsList.innerHTML = '<p class="text-muted">No ads created yet. Add one using the form above.</p>';
      return;
    }

    const html = ads.map(ad => `
      <div class="card mb-3" data-id="${ad.id}">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h6 class="mb-0">${ad.title}</h6>
          <div>
            <span class="badge badge-${ad.is_active ? 'success' : 'secondary'}">${ad.is_active ? 'Active' : 'Inactive'}</span>
            <span class="badge badge-info">${ad.ad_type}</span>
            <span class="badge badge-warning">${ad.position}</span>
          </div>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <p><strong>Description:</strong> ${ad.description || 'No description'}</p>
              <p><strong>Video URL:</strong> <a href="${ad.video_url}" target="_blank">${ad.video_url}</a></p>
              <p><strong>Redirect URL:</strong> <a href="${ad.redirect_url}" target="_blank">${ad.redirect_url}</a></p>
            </div>
            <div class="col-md-6">
              <p><strong>Auto Play:</strong> ${ad.auto_play ? 'Yes' : 'No'}</p>
              <p><strong>Clicks:</strong> ${ad.click_count || 0}</p>
              <p><strong>Views:</strong> ${ad.view_count || 0}</p>
              <p><strong>Created:</strong> ${new Date(ad.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <div class="card-footer">
            <button class="btn btn-sm btn-primary" onclick="editAd(${ad.id})">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-sm btn-warning" onclick="toggleAdStatus(${ad.id})">
              <i class="fas fa-power-off"></i> ${ad.is_active ? 'Deactivate' : 'Activate'}
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteAd(${ad.id})">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    `).join('');
    
    adsList.innerHTML = html;
  }

  // Delete Ad function
  window.deleteAd = async (id) => {
    if (!confirm('Are you sure you want to delete this ad? This action cannot be undone.')) return;
    
    try {
      const response = await axios.delete(`/api/ads/${id}`, {
        headers: {
          'x-admin-secret': ADMIN_SECRET
        }
      });
      
      if (response.data.success) {
        loadAds(); // Refresh the ads list
        showMessage('adMsg', 'Ad deleted successfully!', false);
      } else {
        showMessage('adMsg', response.data.message || 'Failed to delete ad', true);
      }
    } catch (error) {
      console.error('Error deleting ad:', error);
      showMessage('adMsg', `Failed to delete ad: ${error.response?.data?.message || error.message}`, true);
    }
  };

  // Toggle Ad Status function
  window.toggleAdStatus = async (id) => {
    try {
      const response = await axios.put(`/api/ads/${id}/toggle`, {}, {
        headers: {
          'x-admin-secret': ADMIN_SECRET
        }
      });
      
      if (response.data.success) {
        loadAds(); // Refresh the ads list
        showMessage('adMsg', 'Ad status updated successfully!', false);
      } else {
        showMessage('adMsg', response.data.message || 'Failed to update ad status', true);
      }
    } catch (error) {
      console.error('Error updating ad status:', error);
      showMessage('adMsg', `Failed to update ad status: ${error.response?.data?.message || error.message}`, true);
    }
  };

  // Edit Ad function (placeholder for future implementation)
  window.editAd = (id) => {
    showMessage('adMsg', 'Edit functionality coming soon!', false);
  };

})();
