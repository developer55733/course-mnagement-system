// Integration Events Middleware
// This middleware automatically triggers integrations based on system events

class IntegrationEvents {
    constructor(integrationManager) {
        this.integrationManager = integrationManager;
    }

    // User registration event
    async onUserRegistration(userData) {
        try {
            const eventData = {
                event: 'user_registered',
                timestamp: new Date().toISOString(),
                data: {
                    userId: userData.id,
                    email: userData.email,
                    name: userData.name,
                    studentId: userData.studentId,
                    registrationDate: userData.created_at
                }
            };

            // Trigger webhooks for user registration
            await this.integrationManager.triggerWebhooks('user.registered', eventData);
            
            console.log('🔔 User registration event triggered for integrations');
        } catch (error) {
            console.error('❌ Error triggering user registration event:', error);
        }
    }

    // User login event
    async onUserLogin(userData) {
        try {
            const eventData = {
                event: 'user_login',
                timestamp: new Date().toISOString(),
                data: {
                    userId: userData.id,
                    email: userData.email,
                    name: userData.name,
                    studentId: userData.studentId,
                    loginTime: new Date().toISOString()
                }
            };

            await this.integrationManager.triggerWebhooks('user.login', eventData);
            
            console.log('🔔 User login event triggered for integrations');
        } catch (error) {
            console.error('❌ Error triggering user login event:', error);
        }
    }

    // Module creation event
    async onModuleCreation(moduleData) {
        try {
            const eventData = {
                event: 'module_created',
                timestamp: new Date().toISOString(),
                data: {
                    moduleId: moduleData.id,
                    code: moduleData.code,
                    name: moduleData.name,
                    credits: moduleData.credits,
                    lecturer: moduleData.lecturer
                }
            };

            await this.integrationManager.triggerWebhooks('module.created', eventData);
            
            console.log('🔔 Module creation event triggered for integrations');
        } catch (error) {
            console.error('❌ Error triggering module creation event:', error);
        }
    }

    // Timetable creation event
    async onTimetableCreation(timetableData) {
        try {
            const eventData = {
                event: 'timetable_created',
                timestamp: new Date().toISOString(),
                data: {
                    testId: timetableData.id,
                    testName: timetableData.test,
                    module: timetableData.module,
                    date: timetableData.date,
                    time: timetableData.time,
                    venue: timetableData.venue
                }
            };

            await this.integrationManager.triggerWebhooks('timetable.created', eventData);
            
            console.log('🔔 Timetable creation event triggered for integrations');
        } catch (error) {
            console.error('❌ Error triggering timetable creation event:', error);
        }
    }

    // Note upload event
    async onNoteUpload(noteData) {
        try {
            const eventData = {
                event: 'note_uploaded',
                timestamp: new Date().toISOString(),
                data: {
                    noteId: noteData.id,
                    title: noteData.title,
                    module: noteData.module,
                    type: noteData.type,
                    uploadedBy: noteData.uploaded_by,
                    fileUrl: noteData.file_url
                }
            };

            await this.integrationManager.triggerWebhooks('note.uploaded', eventData);
            
            console.log('🔔 Note upload event triggered for integrations');
        } catch (error) {
            console.error('❌ Error triggering note upload event:', error);
        }
    }

    // Lecturer assignment event
    async onLecturerAssignment(lecturerData) {
        try {
            const eventData = {
                event: 'lecturer_assigned',
                timestamp: new Date().toISOString(),
                data: {
                    lecturerId: lecturerData.id,
                    name: lecturerData.name,
                    module: lecturerData.module,
                    phone: lecturerData.phone,
                    assignmentDate: new Date().toISOString()
                }
            };

            await this.integrationManager.triggerWebhooks('lecturer.assigned', eventData);
            
            console.log('🔔 Lecturer assignment event triggered for integrations');
        } catch (error) {
            console.error('❌ Error triggering lecturer assignment event:', error);
        }
    }

    // System error event
    async onSystemError(errorData) {
        try {
            const eventData = {
                event: 'system_error',
                timestamp: new Date().toISOString(),
                data: {
                    error: errorData.message,
                    stack: errorData.stack,
                    route: errorData.route,
                    method: errorData.method,
                    userId: errorData.userId,
                    severity: errorData.severity || 'medium'
                }
            };

            await this.integrationManager.triggerWebhooks('system.error', eventData);
            
            console.log('🔔 System error event triggered for integrations');
        } catch (error) {
            console.error('❌ Error triggering system error event:', error);
        }
    }

    // Settings update event
    async onSettingsUpdate(settingsData) {
        try {
            const eventData = {
                event: 'settings_updated',
                timestamp: new Date().toISOString(),
                data: {
                    updatedBy: settingsData.updatedBy,
                    changes: settingsData.changes,
                    previousSettings: settingsData.previous,
                    newSettings: settingsData.new
                }
            };

            await this.integrationManager.triggerWebhooks('settings.updated', eventData);
            
            console.log('🔔 Settings update event triggered for integrations');
        } catch (error) {
            console.error('❌ Error triggering settings update event:', error);
        }
    }

    // Test reminder event (can be triggered by cron job)
    async onTestReminder(testData) {
        try {
            const eventData = {
                event: 'test_reminder',
                timestamp: new Date().toISOString(),
                data: {
                    testId: testData.id,
                    testName: testData.test,
                    module: testData.module,
                    date: testData.date,
                    time: testData.time,
                    venue: testData.venue,
                    reminderType: testData.reminderType || '24_hours'
                }
            };

            await this.integrationManager.triggerWebhooks('test.reminder', eventData);
            
            console.log('🔔 Test reminder event triggered for integrations');
        } catch (error) {
            console.error('❌ Error triggering test reminder event:', error);
        }
    }

    // Assignment deadline reminder
    async onAssignmentReminder(assignmentData) {
        try {
            const eventData = {
                event: 'assignment_reminder',
                timestamp: new Date().toISOString(),
                data: {
                    assignmentId: assignmentData.id,
                    title: assignmentData.title,
                    module: assignmentData.module,
                    deadline: assignmentData.deadline,
                    reminderType: assignmentData.reminderType || '24_hours'
                }
            };

            await this.integrationManager.triggerWebhooks('assignment.reminder', eventData);
            
            console.log('🔔 Assignment reminder event triggered for integrations');
        } catch (error) {
            console.error('❌ Error triggering assignment reminder event:', error);
        }
    }

    // Grade publication event
    async onGradePublication(gradeData) {
        try {
            const eventData = {
                event: 'grade_published',
                timestamp: new Date().toISOString(),
                data: {
                    studentId: gradeData.studentId,
                    module: gradeData.module,
                    grade: gradeData.grade,
                    testType: gradeData.testType,
                    publishedBy: gradeData.publishedBy,
                    publicationDate: new Date().toISOString()
                }
            };

            await this.integrationManager.triggerWebhooks('grade.published', eventData);
            
            console.log('🔔 Grade publication event triggered for integrations');
        } catch (error) {
            console.error('❌ Error triggering grade publication event:', error);
        }
    }
}

module.exports = IntegrationEvents;
