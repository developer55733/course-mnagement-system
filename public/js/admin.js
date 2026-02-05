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

  // Logout button handler
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      // Show confirmation dialog
      const isConfirmed = confirm('Are you sure you want to logout from the admin panel?');
      if (!isConfirmed) return;
      
      // Show loading state
      btnLogout.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
      btnLogout.disabled = true;
      
      // Simulate logout process for better UX
      setTimeout(() => {
        // Clear admin secret
        ADMIN_SECRET = '';
        
        // Hide panel and show login card
        panel.style.display = 'none';
        document.getElementById('loginCard').style.display = 'block';
        
        // Hide logout button
        btnLogout.style.display = 'none';
        
        // Clear login form
        secretInput.value = '';
        loginMsg.textContent = '';
        
        // Clear output
        outPre.textContent = 'Use buttons above to perform admin actions.';
        
        // Reset logout button
        btnLogout.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        btnLogout.disabled = false;
        
        // Show success message
        loginMsg.textContent = 'Logged out successfully!';
        loginMsg.style.color = '#28a745';
        setTimeout(() => {
          loginMsg.textContent = '';
          loginMsg.style.color = '';
        }, 3000);
      }, 800); // Simulate logout process
    });
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
})();
