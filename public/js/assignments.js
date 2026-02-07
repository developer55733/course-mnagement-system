// Assignment Management JavaScript
class AssignmentManager {
    constructor() {
        this.assignments = [];
        this.currentAssignment = null;
        this.isAdmin = false;
        this.init();
    }

    async init() {
        await this.loadAssignments();
        this.setupEventListeners();
        this.renderAssignments();
        this.checkAdminStatus();
    }

    // Load assignments
    async loadAssignments(filter = 'all') {
        try {
            let url = '/api/assignments/published';
            
            if (this.isAdmin) {
                url = '/api/assignments';
            }

            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
                this.assignments = data.assignments;
                
                // Apply client-side filtering
                if (filter !== 'all') {
                    this.assignments = this.filterAssignments(this.assignments, filter);
                }
            }
        } catch (error) {
            console.error('Error loading assignments:', error);
        }
    }

    // Filter assignments
    filterAssignments(assignments, filter) {
        const now = new Date();
        
        switch (filter) {
            case 'upcoming':
                return assignments.filter(assignment => 
                    new Date(assignment.due_date) > now
                );
            case 'overdue':
                return assignments.filter(assignment => 
                    new Date(assignment.due_date) < now
                );
            case 'submitted':
                // This would need user-specific data
                return assignments; // Placeholder
            default:
                return assignments;
        }
    }

    // Check admin status
    checkAdminStatus() {
        // Check if user is admin (you'd get this from authentication)
        const adminBadge = document.getElementById('admin-badge');
        this.isAdmin = !adminBadge.classList.contains('hidden');
        
        // Show/hide admin-only elements
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = this.isAdmin ? 'block' : 'none';
        });
    }

    // Setup event listeners
    setupEventListeners() {
        // New assignment button (admin only)
        document.getElementById('new-assignment-btn')?.addEventListener('click', () => {
            this.showNewAssignmentModal();
        });

        // Assignment filter
        document.getElementById('assignment-filter')?.addEventListener('change', (e) => {
            this.filterAssignments(e.target.value);
        });

        // Assignment search
        document.getElementById('assignment-search')?.addEventListener('input', (e) => {
            this.searchAssignments(e.target.value);
        });

        // New assignment form
        document.getElementById('new-assignment-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createAssignment();
        });

        // Submission form
        document.getElementById('submission-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitAssignment();
        });

        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModal(btn.closest('.modal'));
            });
        });

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });
    }

    // Render assignments
    renderAssignments() {
        const container = document.getElementById('assignments-list');
        if (!container) return;

        if (this.assignments.length === 0) {
            container.innerHTML = `
                <div class="no-assignments">
                    <i class="fas fa-tasks"></i>
                    <h3>No Assignments</h3>
                    <p>${this.isAdmin ? 'Create your first assignment' : 'No assignments available yet'}</p>
                    ${this.isAdmin ? `
                        <button class="btn btn-primary" onclick="assignmentManager.showNewAssignmentModal()">
                            <i class="fas fa-plus"></i> Create Assignment
                        </button>
                    ` : ''}
                </div>
            `;
            return;
        }

        const html = this.assignments.map(assignment => {
            const dueDate = new Date(assignment.due_date);
            const now = new Date();
            const isOverdue = dueDate < now;
            const isDueSoon = dueDate < new Date(now.getTime() + 24 * 60 * 60 * 1000);
            
            let statusClass = '';
            let statusText = '';
            
            if (isOverdue) {
                statusClass = 'overdue';
                statusText = 'Overdue';
            } else if (isDueSoon) {
                statusClass = 'due-soon';
                statusText = 'Due Soon';
            } else {
                statusClass = 'on-time';
                statusText = 'On Time';
            }

            return `
                <div class="assignment-card ${statusClass}" data-assignment-id="${assignment.id}">
                    <div class="assignment-header">
                        <div class="assignment-title-section">
                            <h3 class="assignment-title">${assignment.title}</h3>
                            <div class="assignment-meta">
                                <span class="assignment-module">
                                    <i class="fas fa-book"></i> ${assignment.module_code}
                                </span>
                                <span class="assignment-type">
                                    <i class="fas fa-tag"></i> ${assignment.assignment_type}
                                </span>
                                <span class="assignment-marks">
                                    <i class="fas fa-star"></i> ${assignment.max_marks} marks
                                </span>
                            </div>
                        </div>
                        <div class="assignment-status ${statusClass}">
                            ${statusText}
                        </div>
                    </div>
                    <div class="assignment-content">
                        <p class="assignment-description">${this.truncateText(assignment.description, 200)}</p>
                    </div>
                    <div class="assignment-footer">
                        <div class="assignment-due">
                            <i class="fas fa-clock"></i> 
                            Due: ${dueDate.toLocaleDateString()} ${dueDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <div class="assignment-actions">
                            ${this.isAdmin ? `
                                <button class="btn btn-sm btn-info" onclick="assignmentManager.viewAssignment(${assignment.id})">
                                    <i class="fas fa-eye"></i> View & Grade
                                </button>
                                <button class="btn btn-sm btn-warning" onclick="assignmentManager.editAssignment(${assignment.id})">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="assignmentManager.deleteAssignment(${assignment.id})">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            ` : `
                                <button class="btn btn-sm btn-primary" onclick="assignmentManager.viewAssignment(${assignment.id})">
                                    <i class="fas fa-arrow-right"></i> View & Submit
                                </button>
                            `}
                        </div>
                    </div>
                    ${assignment.submission_count > 0 ? `
                        <div class="assignment-submissions">
                            <i class="fas fa-users"></i> ${assignment.submission_count} submissions
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    // Show new assignment modal (admin only)
    showNewAssignmentModal() {
        const modal = document.getElementById('new-assignment-modal');
        
        // Set minimum date to today
        const dueDateInput = document.getElementById('assignment-due-date');
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        dueDateInput.min = now.toISOString().slice(0, 16);
        
        modal.style.display = 'block';
    }

    // Create new assignment (admin only)
    async createAssignment() {
        const form = document.getElementById('new-assignment-form');
        const formData = new FormData(form);
        
        try {
            const assignmentData = {
                title: formData.get('title'),
                moduleCode: formData.get('module'),
                description: formData.get('description'),
                dueDate: formData.get('due-date'),
                maxMarks: parseInt(formData.get('marks')),
                assignmentType: formData.get('type'),
                isPublished: formData.get('publish') === 'on'
            };

            const response = await fetch('/api/assignments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': localStorage.getItem('adminSecret') || ''
                },
                body: JSON.stringify(assignmentData)
            });

            const result = await response.json();
            
            if (result.success) {
                this.showMessage('Assignment created successfully!', 'success');
                this.closeModal(modal);
                await this.loadAssignments();
                this.renderAssignments();
                form.reset();
            } else {
                this.showMessage(result.error || 'Failed to create assignment', 'error');
            }
        } catch (error) {
            console.error('Error creating assignment:', error);
            this.showMessage('Error creating assignment', 'error');
        }
    }

    // View assignment details
    async viewAssignment(assignmentId) {
        try {
            const response = await fetch(`/api/assignments/${assignmentId}`);
            const data = await response.json();
            
            if (data.success) {
                this.currentAssignment = data.assignment;
                this.renderAssignmentDetail();
                document.getElementById('assignment-modal').style.display = 'block';
            } else {
                this.showMessage('Assignment not found', 'error');
            }
        } catch (error) {
            console.error('Error loading assignment:', error);
            this.showMessage('Error loading assignment', 'error');
        }
    }

    // Render assignment detail
    renderAssignmentDetail() {
        if (!this.currentAssignment) return;

        const container = document.getElementById('assignment-detail');
        const modalTitle = document.getElementById('modal-assignment-title');
        
        modalTitle.textContent = this.currentAssignment.title;
        
        const dueDate = new Date(this.currentAssignment.due_date);
        const now = new Date();
        const isOverdue = dueDate < now;
        
        container.innerHTML = `
            <div class="assignment-detail-header">
                <div class="assignment-detail-meta">
                    <span class="assignment-module">
                        <i class="fas fa-book"></i> ${this.currentAssignment.module_code}
                    </span>
                    <span class="assignment-type">
                        <i class="fas fa-tag"></i> ${this.currentAssignment.assignment_type}
                    </span>
                    <span class="assignment-marks">
                        <i class="fas fa-star"></i> ${this.currentAssignment.max_marks} marks
                    </span>
                </div>
                <div class="assignment-due-info ${isOverdue ? 'overdue' : ''}">
                    <i class="fas fa-clock"></i> 
                    Due: ${dueDate.toLocaleDateString()} ${dueDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    ${isOverdue ? '<span class="overdue-text">(Overdue)</span>' : ''}
                </div>
            </div>
            <div class="assignment-detail-content">
                <div class="assignment-description-full">
                    ${this.formatContent(this.currentAssignment.description)}
                </div>
                ${this.currentAssignment.file_attachment ? `
                    <div class="assignment-attachment">
                        <i class="fas fa-paperclip"></i> 
                        <a href="${this.currentAssignment.file_attachment}" target="_blank">Download Attachment</a>
                    </div>
                ` : ''}
            </div>
            <div class="assignment-detail-footer">
                <div class="assignment-posted-info">
                    <i class="fas fa-user"></i> Posted by ${this.currentAssignment.posted_by_name}
                    <span class="posted-date">
                        on ${new Date(this.currentAssignment.created_at).toLocaleDateString()}
                    </span>
                </div>
                ${this.currentAssignment.submissions ? `
                    <div class="submission-count">
                        <i class="fas fa-users"></i> ${this.currentAssignment.submissions.length} submissions
                    </div>
                ` : ''}
            </div>
        `;

        // Show/hide appropriate sections based on user role
        const submissionSection = document.getElementById('submission-section');
        const gradingSection = document.getElementById('grading-section');
        
        if (this.isAdmin) {
            submissionSection.style.display = 'none';
            gradingSection.style.display = 'block';
            this.renderGradingSection();
        } else {
            submissionSection.style.display = 'block';
            gradingSection.style.display = 'none';
        }
    }

    // Render grading section (admin only)
    renderGradingSection() {
        if (!this.currentAssignment || !this.currentAssignment.submissions) return;

        const container = document.getElementById('submissions-list');
        
        if (this.currentAssignment.submissions.length === 0) {
            container.innerHTML = '<p>No submissions yet.</p>';
            return;
        }

        const html = this.currentAssignment.submissions.map(submission => `
            <div class="submission-card" data-submission-id="${submission.id}">
                <div class="submission-header">
                    <div class="submission-student">
                        <i class="fas fa-user"></i> ${submission.student_name}
                        <span class="student-email">${submission.student_email}</span>
                    </div>
                    <div class="submission-date">
                        <i class="fas fa-clock"></i> ${new Date(submission.submitted_at).toLocaleString()}
                    </div>
                </div>
                <div class="submission-content">
                    ${submission.submission_text ? `
                        <div class="submission-text">
                            ${this.formatContent(submission.submission_text)}
                        </div>
                    ` : ''}
                    ${submission.file_attachment ? `
                        <div class="submission-attachment">
                            <i class="fas fa-paperclip"></i> 
                            <a href="${submission.file_attachment}" target="_blank">View File</a>
                        </div>
                    ` : ''}
                </div>
                <div class="submission-grading">
                    <div class="grading-inputs">
                        <div class="form-group">
                            <label>Marks (${this.currentAssignment.max_marks}):</label>
                            <input type="number" id="marks-${submission.id}" 
                                   min="0" max="${this.currentAssignment.max_marks}" 
                                   value="${submission.marks_obtained || ''}"
                                   placeholder="Enter marks">
                        </div>
                        <div class="form-group">
                            <label>Feedback:</label>
                            <textarea id="feedback-${submission.id}" 
                                      placeholder="Provide feedback..." 
                                      rows="3">${submission.feedback || ''}</textarea>
                        </div>
                    </div>
                    <div class="grading-actions">
                        <button class="btn btn-primary" onclick="assignmentManager.gradeSubmission(${submission.id})">
                            <i class="fas fa-check"></i> Grade
                        </button>
                        ${submission.status === 'graded' ? `
                            <span class="graded-badge">
                                <i class="fas fa-check-circle"></i> Graded
                            </span>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    // Submit assignment (student)
    async submitAssignment() {
        if (!this.currentAssignment) return;

        const formData = new FormData(document.getElementById('submission-form'));
        const submissionText = formData.get('text');
        const file = formData.get('file');
        
        if (!submissionText && !file) {
            this.showMessage('Please provide submission text or attach a file', 'error');
            return;
        }

        try {
            const submissionData = {
                assignmentId: this.currentAssignment.id,
                submissionText: submissionText || null,
                fileAttachment: file ? file.name : null
            };

            const response = await fetch(`/api/assignments/${this.currentAssignment.id}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submissionData)
            });

            const result = await response.json();
            
            if (result.success) {
                this.showMessage('Assignment submitted successfully!', 'success');
                this.closeModal(document.getElementById('assignment-modal'));
                await this.loadAssignments();
                this.renderAssignments();
            } else {
                this.showMessage(result.error || 'Failed to submit assignment', 'error');
            }
        } catch (error) {
            console.error('Error submitting assignment:', error);
            this.showMessage('Error submitting assignment', 'error');
        }
    }

    // Grade submission (admin only)
    async gradeSubmission(submissionId) {
        const marks = document.getElementById(`marks-${submissionId}`).value;
        const feedback = document.getElementById(`feedback-${submissionId}`).value;
        
        if (!marks || marks < 0) {
            this.showMessage('Please enter valid marks', 'error');
            return;
        }

        try {
            const response = await fetch(`/api/assignments/${this.currentAssignment.id}/submissions/${submissionId}/grade`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': localStorage.getItem('adminSecret') || ''
                },
                body: JSON.stringify({
                    marks: parseInt(marks),
                    feedback: feedback
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.showMessage('Submission graded successfully!', 'success');
                // Reload assignment to show updated grades
                await this.viewAssignment(this.currentAssignment.id);
            } else {
                this.showMessage(result.error || 'Failed to grade submission', 'error');
            }
        } catch (error) {
            console.error('Error grading submission:', error);
            this.showMessage('Error grading submission', 'error');
        }
    }

    // Search assignments
    async searchAssignments(query) {
        if (!query.trim()) {
            await this.loadAssignments();
            this.renderAssignments();
            return;
        }

        try {
            const response = await fetch(`/api/assignments/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            if (data.success) {
                this.assignments = data.assignments;
                this.renderAssignments();
            }
        } catch (error) {
            console.error('Error searching assignments:', error);
        }
    }

    // Close modal
    closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Show message
    showMessage(message, type = 'info') {
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }

    // Utility functions
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    formatContent(content) {
        // Simple formatting - replace newlines with <br>
        return content.replace(/\n/g, '<br>');
    }
}

// Initialize assignment manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.assignmentManager = new AssignmentManager();
});
