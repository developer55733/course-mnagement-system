const database = require('../config/database');

class Assignment {
    // Get all assignments (admin only)
    static async getAllAssignments(limit = 20, offset = 0) {
        try {
            const [rows] = await database.query(`
                SELECT a.*, u.name as posted_by_name, u.email as posted_by_email,
                       COUNT(asub.id) as submission_count
                FROM assignments a
                LEFT JOIN users u ON a.posted_by = u.id
                LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id
                GROUP BY a.id
                ORDER BY a.created_at DESC
                LIMIT ? OFFSET ?
            `, [limit, offset]);
            return rows;
        } catch (error) {
            throw new Error('Error fetching assignments: ' + error.message);
        }
    }

    // Get published assignments for students
    static async getPublishedAssignments(limit = 20, offset = 0) {
        try {
            const [rows] = await database.query(`
                SELECT a.*, u.name as posted_by_name,
                       COUNT(asub.id) as submission_count,
                       CASE 
                           WHEN a.due_date < NOW() THEN 'overdue'
                           WHEN a.due_date < DATE_ADD(NOW(), INTERVAL 24 HOUR) THEN 'due_soon'
                           ELSE 'on_time'
                       END as status
                FROM assignments a
                LEFT JOIN users u ON a.posted_by = u.id
                LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id
                WHERE a.is_published = TRUE
                GROUP BY a.id
                ORDER BY a.due_date ASC
                LIMIT ? OFFSET ?
            `, [limit, offset]);
            return rows;
        } catch (error) {
            throw new Error('Error fetching published assignments: ' + error.message);
        }
    }

    // Get assignment by ID
    static async getAssignmentById(assignmentId) {
        try {
            const [rows] = await database.query(`
                SELECT a.*, u.name as posted_by_name, u.email as posted_by_email
                FROM assignments a
                LEFT JOIN users u ON a.posted_by = u.id
                WHERE a.id = ?
            `, [assignmentId]);

            if (rows.length === 0) {
                return null;
            }

            const assignment = rows[0];

            // Get submissions for this assignment
            const [submissionRows] = await database.query(`
                SELECT asub.*, u.name as student_name, u.email as student_email
                FROM assignment_submissions asub
                LEFT JOIN users u ON asub.student_id = u.id
                WHERE asub.assignment_id = ?
                ORDER BY asub.submitted_at DESC
            `, [assignmentId]);

            assignment.submissions = submissionRows;

            return assignment;
        } catch (error) {
            throw new Error('Error fetching assignment: ' + error.message);
        }
    }

    // Create new assignment (admin only)
    static async createAssignment(assignmentData) {
        try {
            const { 
                title, 
                description, 
                moduleCode, 
                postedBy, 
                dueDate, 
                maxMarks = 100, 
                assignmentType = 'other',
                fileAttachment = null,
                isPublished = false 
            } = assignmentData;
            
            const [result] = await database.query(`
                INSERT INTO assignments 
                (title, description, module_code, posted_by, due_date, max_marks, 
                 assignment_type, file_attachment, is_published)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [title, description, moduleCode, postedBy, dueDate, maxMarks, 
                assignmentType, fileAttachment, isPublished]);

            return result.insertId;
        } catch (error) {
            throw new Error('Error creating assignment: ' + error.message);
        }
    }

    // Update assignment (admin only)
    static async updateAssignment(assignmentId, assignmentData) {
        try {
            const { 
                title, 
                description, 
                moduleCode, 
                dueDate, 
                maxMarks, 
                assignmentType,
                fileAttachment,
                isPublished 
            } = assignmentData;
            
            await database.query(`
                UPDATE assignments 
                SET title = ?, description = ?, module_code = ?, due_date = ?, 
                    max_marks = ?, assignment_type = ?, file_attachment = ?, 
                    is_published = ?, updated_at = NOW()
                WHERE id = ?
            `, [title, description, moduleCode, dueDate, maxMarks, 
                assignmentType, fileAttachment, isPublished, assignmentId]);

            return true;
        } catch (error) {
            throw new Error('Error updating assignment: ' + error.message);
        }
    }

    // Delete assignment (admin only)
    static async deleteAssignment(assignmentId) {
        try {
            await database.query('DELETE FROM assignments WHERE id = ?', [assignmentId]);
            return true;
        } catch (error) {
            throw new Error('Error deleting assignment: ' + error.message);
        }
    }

    // Submit assignment
    static async submitAssignment(submissionData) {
        try {
            const { assignmentId, studentId, submissionText, fileAttachment = null } = submissionData;
            
            // Check if already submitted
            const [existing] = await database.query(
                'SELECT id FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?',
                [assignmentId, studentId]
            );

            if (existing.length > 0) {
                // Update existing submission
                await database.query(`
                    UPDATE assignment_submissions 
                    SET submission_text = ?, file_attachment = ?, 
                        submitted_at = NOW(), status = 'submitted'
                    WHERE assignment_id = ? AND student_id = ?
                `, [submissionText, fileAttachment, assignmentId, studentId]);
            } else {
                // Create new submission
                await database.query(`
                    INSERT INTO assignment_submissions 
                    (assignment_id, student_id, submission_text, file_attachment, status)
                    VALUES (?, ?, ?, ?, 'submitted')
                `, [assignmentId, studentId, submissionText, fileAttachment]);
            }

            return true;
        } catch (error) {
            throw new Error('Error submitting assignment: ' + error.message);
        }
    }

    // Grade submission (admin only)
    static async gradeSubmission(submissionId, marks, feedback) {
        try {
            await database.query(`
                UPDATE assignment_submissions 
                SET marks_obtained = ?, feedback = ?, status = 'graded'
                WHERE id = ?
            `, [marks, feedback, submissionId]);

            return true;
        } catch (error) {
            throw new Error('Error grading submission: ' + error.message);
        }
    }

    // Get student's submissions
    static async getStudentSubmissions(studentId, limit = 20, offset = 0) {
        try {
            const [rows] = await database.query(`
                SELECT asub.*, a.title as assignment_title, a.module_code, 
                       a.due_date, a.max_marks, a.assignment_type,
                       CASE 
                           WHEN a.due_date < asub.submitted_at THEN 'late'
                           ELSE 'on_time'
                       END as submission_status
                FROM assignment_submissions asub
                LEFT JOIN assignments a ON asub.assignment_id = a.id
                WHERE asub.student_id = ? AND a.is_published = TRUE
                ORDER BY asub.submitted_at DESC
                LIMIT ? OFFSET ?
            `, [studentId, limit, offset]);
            return rows;
        } catch (error) {
            throw new Error('Error fetching student submissions: ' + error.message);
        }
    }

    // Get assignments by module
    static async getAssignmentsByModule(moduleCode, limit = 20, offset = 0) {
        try {
            const [rows] = await database.query(`
                SELECT a.*, u.name as posted_by_name,
                       COUNT(asub.id) as submission_count
                FROM assignments a
                LEFT JOIN users u ON a.posted_by = u.id
                LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id
                WHERE a.module_code = ? AND a.is_published = TRUE
                GROUP BY a.id
                ORDER BY a.due_date ASC
                LIMIT ? OFFSET ?
            `, [moduleCode, limit, offset]);
            return rows;
        } catch (error) {
            throw new Error('Error fetching module assignments: ' + error.message);
        }
    }

    // Get upcoming assignments (due within 7 days)
    static async getUpcomingAssignments(limit = 10) {
        try {
            const [rows] = await database.query(`
                SELECT a.*, u.name as posted_by_name
                FROM assignments a
                LEFT JOIN users u ON a.posted_by = u.id
                WHERE a.is_published = TRUE AND a.due_date > NOW() 
                  AND a.due_date <= DATE_ADD(NOW(), INTERVAL 7 DAY)
                ORDER BY a.due_date ASC
                LIMIT ?
            `, [limit]);
            return rows;
        } catch (error) {
            throw new Error('Error fetching upcoming assignments: ' + error.message);
        }
    }

    // Get overdue assignments
    static async getOverdueAssignments(limit = 10) {
        try {
            const [rows] = await database.query(`
                SELECT a.*, u.name as posted_by_name,
                       COUNT(asub.id) as submission_count
                FROM assignments a
                LEFT JOIN users u ON a.posted_by = u.id
                LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id
                WHERE a.is_published = TRUE AND a.due_date < NOW()
                GROUP BY a.id
                ORDER BY a.due_date DESC
                LIMIT ?
            `, [limit]);
            return rows;
        } catch (error) {
            throw new Error('Error fetching overdue assignments: ' + error.message);
        }
    }

    // Search assignments
    static async searchAssignments(query, limit = 20, offset = 0) {
        try {
            const [rows] = await database.query(`
                SELECT a.*, u.name as posted_by_name,
                       COUNT(asub.id) as submission_count
                FROM assignments a
                LEFT JOIN users u ON a.posted_by = u.id
                LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id
                WHERE a.is_published = TRUE 
                  AND (a.title LIKE ? OR a.description LIKE ? OR a.module_code LIKE ?)
                GROUP BY a.id
                ORDER BY a.due_date ASC
                LIMIT ? OFFSET ?
            `, [`%${query}%`, `%${query}%`, `%${query}%`, limit, offset]);
            return rows;
        } catch (error) {
            throw new Error('Error searching assignments: ' + error.message);
        }
    }

    // Get assignment statistics
    static async getAssignmentStats() {
        try {
            const [stats] = await database.query(`
                SELECT 
                    COUNT(DISTINCT a.id) as total_assignments,
                    COUNT(DISTINCT CASE WHEN a.is_published = TRUE THEN a.id END) as published_assignments,
                    COUNT(DISTINCT asub.id) as total_submissions,
                    COUNT(DISTINCT CASE WHEN asub.status = 'graded' THEN asub.id END) as graded_submissions,
                    AVG(asub.marks_obtained) as average_marks
                FROM assignments a
                LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id
            `);
            return stats[0];
        } catch (error) {
            throw new Error('Error fetching assignment statistics: ' + error.message);
        }
    }
}

module.exports = Assignment;
