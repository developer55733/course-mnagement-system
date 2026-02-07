const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Notification = require('../models/Notification');
const adminAuth = require('../middleware/adminAuth');

// Get all assignments (admin only)
router.get('/', adminAuth, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        
        const assignments = await Assignment.getAllAssignments(limit, offset);
        res.json({
            success: true,
            assignments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get published assignments (for students)
router.get('/published', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        
        const assignments = await Assignment.getPublishedAssignments(limit, offset);
        res.json({
            success: true,
            assignments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get assignment by ID
router.get('/:assignmentId', async (req, res) => {
    try {
        const assignmentId = parseInt(req.params.assignmentId);
        const assignment = await Assignment.getAssignmentById(assignmentId);
        
        if (!assignment) {
            return res.status(404).json({
                success: false,
                error: 'Assignment not found'
            });
        }
        
        // If assignment is not published, only allow admin or author to view
        if (!assignment.is_published) {
            const isAdmin = req.headers['x-admin-secret'];
            const userId = req.user?.id || 1;
            
            if (!isAdmin && assignment.posted_by !== userId) {
                return res.status(403).json({
                    success: false,
                    error: 'This assignment is not yet published'
                });
            }
        }
        
        res.json({
            success: true,
            assignment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create new assignment (admin only)
router.post('/', adminAuth, async (req, res) => {
    try {
        const { 
            title, 
            description, 
            moduleCode, 
            dueDate, 
            maxMarks = 100, 
            assignmentType = 'other',
            fileAttachment = null,
            isPublished = false 
        } = req.body;
        
        // Validate required fields
        if (!title || !description || !moduleCode || !dueDate) {
            return res.status(400).json({
                success: false,
                error: 'Title, description, module code, and due date are required'
            });
        }
        
        const postedBy = req.user?.id || 1; // Get from authenticated user or default
        
        const assignmentId = await Assignment.createAssignment({
            title,
            description,
            moduleCode,
            postedBy,
            dueDate,
            maxMarks,
            assignmentType,
            fileAttachment,
            isPublished
        });
        
        // If published, create notifications for all students
        if (isPublished) {
            const assignmentData = { id: assignmentId, title, moduleCode, dueDate };
            await Notification.createAssignmentNotification(assignmentData);
        }
        
        res.status(201).json({
            success: true,
            assignmentId,
            message: 'Assignment created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update assignment (admin only)
router.put('/:assignmentId', adminAuth, async (req, res) => {
    try {
        const assignmentId = parseInt(req.params.assignmentId);
        const { 
            title, 
            description, 
            moduleCode, 
            dueDate, 
            maxMarks, 
            assignmentType,
            fileAttachment,
            isPublished 
        } = req.body;
        
        // Check if assignment exists
        const existingAssignment = await Assignment.getAssignmentById(assignmentId);
        if (!existingAssignment) {
            return res.status(404).json({
                success: false,
                error: 'Assignment not found'
            });
        }
        
        await Assignment.updateAssignment(assignmentId, {
            title,
            description,
            moduleCode,
            dueDate,
            maxMarks,
            assignmentType,
            fileAttachment,
            isPublished
        });
        
        // If newly published, create notifications
        if (isPublished && !existingAssignment.is_published) {
            const assignmentData = { 
                id: assignmentId, 
                title, 
                moduleCode, 
                dueDate 
            };
            await Notification.createAssignmentNotification(assignmentData);
        }
        
        res.json({
            success: true,
            message: 'Assignment updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Delete assignment (admin only)
router.delete('/:assignmentId', adminAuth, async (req, res) => {
    try {
        const assignmentId = parseInt(req.params.assignmentId);
        
        await Assignment.deleteAssignment(assignmentId);
        
        res.json({
            success: true,
            message: 'Assignment deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Submit assignment
router.post('/:assignmentId/submit', async (req, res) => {
    try {
        const assignmentId = parseInt(req.params.assignmentId);
        const { submissionText, fileAttachment } = req.body;
        const studentId = req.user?.id || 1;
        
        // Check if assignment exists and is published
        const assignment = await Assignment.getAssignmentById(assignmentId);
        if (!assignment) {
            return res.status(404).json({
                success: false,
                error: 'Assignment not found'
            });
        }
        
        if (!assignment.is_published) {
            return res.status(403).json({
                success: false,
                error: 'This assignment is not yet published'
            });
        }
        
        if (!submissionText && !fileAttachment) {
            return res.status(400).json({
                success: false,
                error: 'Submission text or file attachment is required'
            });
        }
        
        await Assignment.submitAssignment({
            assignmentId,
            studentId,
            submissionText,
            fileAttachment
        });
        
        res.status(201).json({
            success: true,
            message: 'Assignment submitted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Grade submission (admin only)
router.post('/:assignmentId/submissions/:submissionId/grade', adminAuth, async (req, res) => {
    try {
        const submissionId = parseInt(req.params.submissionId);
        const { marks, feedback } = req.body;
        
        if (marks === undefined || marks < 0) {
            return res.status(400).json({
                success: false,
                error: 'Valid marks are required'
            });
        }
        
        // Get submission and assignment details for notification
        const assignment = await Assignment.getAssignmentById(req.params.assignmentId);
        const submission = assignment.submissions.find(s => s.id === submissionId);
        
        if (!submission) {
            return res.status(404).json({
                success: false,
                error: 'Submission not found'
            });
        }
        
        await Assignment.gradeSubmission(submissionId, marks, feedback);
        
        // Create grade notification for student
        await Notification.createGradeNotification({
            ...submission,
            marks_obtained: marks
        }, assignment);
        
        res.json({
            success: true,
            message: 'Submission graded successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get student's submissions
router.get('/student/:studentId/submissions', async (req, res) => {
    try {
        const studentId = parseInt(req.params.studentId);
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        
        const submissions = await Assignment.getStudentSubmissions(studentId, limit, offset);
        res.json({
            success: true,
            submissions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get assignments by module
router.get('/module/:moduleCode', async (req, res) => {
    try {
        const moduleCode = req.params.moduleCode;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        
        const assignments = await Assignment.getAssignmentsByModule(moduleCode, limit, offset);
        res.json({
            success: true,
            assignments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get upcoming assignments
router.get('/upcoming/list', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        const assignments = await Assignment.getUpcomingAssignments(limit);
        res.json({
            success: true,
            assignments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get overdue assignments
router.get('/overdue/list', adminAuth, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        const assignments = await Assignment.getOverdueAssignments(limit);
        res.json({
            success: true,
            assignments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Search assignments
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Search query is required'
            });
        }
        
        const assignments = await Assignment.searchAssignments(query, limit, offset);
        res.json({
            success: true,
            assignments,
            query
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get assignment statistics (admin only)
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const stats = await Assignment.getAssignmentStats();
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Publish/unpublish assignment (admin only)
router.post('/:assignmentId/publish', adminAuth, async (req, res) => {
    try {
        const assignmentId = parseInt(req.params.assignmentId);
        const { isPublished } = req.body;
        
        // Get assignment details for notification
        const assignment = await Assignment.getAssignmentById(assignmentId);
        if (!assignment) {
            return res.status(404).json({
                success: false,
                error: 'Assignment not found'
            });
        }
        
        await Assignment.updateAssignment(assignmentId, { isPublished });
        
        // If newly published, create notifications
        if (isPublished && !assignment.is_published) {
            await Notification.createAssignmentNotification({
                id: assignmentId,
                title: assignment.title,
                moduleCode: assignment.module_code,
                dueDate: assignment.due_date
            });
        }
        
        res.json({
            success: true,
            message: isPublished ? 'Assignment published successfully' : 'Assignment unpublished successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
