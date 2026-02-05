(() => {
  const secretInput = document.getElementById('adminSecret');
  const btnLogin = document.getElementById('btnLogin');
  const loginMsg = document.getElementById('loginMsg');
  const panel = document.getElementById('panel');
  const outPre = document.getElementById('outPre');

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

  btnLogin.addEventListener('click', () => {
    const s = secretInput.value.trim();
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
        let html = '<table class="table table-sm"><thead><tr><th>Test</th><th>Module</th><th>Date</th><th>Time</th><th>Venue</th></tr></thead><tbody>';
        res.data.forEach(t => {
          html += `<tr><td>${t.test}</td><td>${t.module}</td><td>${t.date}</td><td>${t.time}</td><td>${t.venue}</td></tr>`;
        });
        html += '</tbody></table>';
        timetableList.innerHTML = html;
      }
    } catch (error) {
      console.error('Error loading timetables:', error);
    }
  }

  // Load timetables on page load
  window.addEventListener('load', loadTimetables);

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
    const saveBtn = document.querySelector('.btn-primary');
    if (saveBtn) {
      saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
      saveBtn.disabled = true;
    }
    
    // Simulate save process
    setTimeout(() => {
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
})();
