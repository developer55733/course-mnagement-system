-- Complete Database Setup for IT Course Management System
-- Run this script in your MySQL database to set up everything

-- Note: Railway MySQL automatically provides the database named 'railway'
USE railway;

-- =====================================
-- EXISTING TABLES (from original setup)
-- =====================================

-- Create users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) UNIQUE NOT NULL,
  `student_id` VARCHAR(50) UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('user', 'admin') DEFAULT 'user',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_student_id (student_id),
  INDEX idx_role (role)
);

-- Create lecturers table
CREATE TABLE IF NOT EXISTS `lecturers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `module` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_module (module)
);

-- Create timetable table
CREATE TABLE IF NOT EXISTS `timetable` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `test` VARCHAR(100) NOT NULL,
  `module` VARCHAR(100) NOT NULL,
  `date` DATE NOT NULL,
  `time` TIME NOT NULL,
  `venue` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_module (module),
  INDEX idx_date (date)
);

-- Create modules table
CREATE TABLE IF NOT EXISTS `modules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) UNIQUE NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `credits` INT DEFAULT 3,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code)
);

-- Create settings table
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `academic_year` VARCHAR(20),
  `semester` INT,
  `institution_name` VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create notes table
CREATE TABLE IF NOT EXISTS `notes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `formatted_content` TEXT,
  `module_code` VARCHAR(50) NOT NULL,
  `module_name` VARCHAR(100) NOT NULL,
  `type` ENUM('lecture', 'tutorial', 'assignment', 'exam', 'reference') DEFAULT 'lecture',
  `tags` VARCHAR(255),
  `visibility` ENUM('public', 'private') DEFAULT 'public',
  `created_by` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_module (module_code),
  INDEX idx_type (type),
  INDEX idx_visibility (visibility),
  INDEX idx_created_by (created_by),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================
-- NEW TABLES (Forum & Assignments)
-- =====================================

-- Discussion Forum Categories
CREATE TABLE IF NOT EXISTS forum_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'fa-comments',
    color VARCHAR(7) DEFAULT '#007bff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Discussion Forum Posts
CREATE TABLE IF NOT EXISTS forum_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    module_code VARCHAR(50),
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Discussion Forum Replies
CREATE TABLE IF NOT EXISTS forum_replies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    parent_reply_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_reply_id) REFERENCES forum_replies(id) ON DELETE CASCADE
);

-- Assignments
CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    module_code VARCHAR(50) NOT NULL,
    posted_by INT NOT NULL,
    due_date TIMESTAMP NOT NULL,
    max_marks INT DEFAULT 100,
    assignment_type ENUM('essay', 'project', 'quiz', 'presentation', 'coding', 'other') DEFAULT 'other',
    file_attachment VARCHAR(500),
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Assignment Submissions
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    student_id INT NOT NULL,
    submission_text TEXT,
    file_attachment VARCHAR(500),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    marks_obtained INT,
    feedback TEXT,
    status ENUM('not_submitted', 'submitted', 'graded', 'late') DEFAULT 'not_submitted',
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('assignment', 'forum', 'grade', 'system', 'reminder') DEFAULT 'system',
    related_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================
-- SAMPLE DATA INSERTION
-- =====================================

-- Insert test users (passwords are hashed)
INSERT INTO `users` (`name`, `email`, `student_id`, `password`, `role`) VALUES
('John Smith', 'john@student.edu', 'IT2023001', '$2b$10$c6mYZv1Xleen2fqxaPyGAODQvGl.7BiCQcamQlsLBEJrkhU9wEBcW', 'user'),
('Jane Doe', 'jane@student.edu', 'IT2023002', '$2b$10$c6mYZv1Xleen2fqxaPyGAODQvGl.7BiCQcamQlsLBEJrkhU9wEBcW', 'user'),
('Mike Johnson', 'mike@student.edu', 'IT2023003', '$2b$10$c6mYZv1Xleen2fqxaPyGAODQvGl.7BiCQcamQlsLBEJrkhU9wEBcW', 'user'),
('Admin User', 'admin@system.edu', 'ADMIN001', '$2b$10$sqG0niYZXluB1zwBdD4CMO23Tc1VJ5BOh3y8mjHia7l65bENYwEOe', 'admin')
ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email);

-- Insert modules with credits
INSERT INTO `modules` (`code`, `name`, `credits`) VALUES
('IT101', 'Introduction to Programming', 4),
('IT102', 'Web Development Fundamentals', 3),
('IT103', 'Database Management Systems', 4),
('IT104', 'Data Structures & Algorithms', 4),
('IT105', 'Computer Networks', 3),
('IT106', 'Software Engineering', 3),
('IT107', 'Artificial Intelligence', 3)
ON DUPLICATE KEY UPDATE name=VALUES(name), credits=VALUES(credits);

-- Insert lecturers
INSERT INTO `lecturers` (`name`, `module`, `phone`) VALUES
('Prof. James Davidson', 'IT101 - Introduction to Programming', '+1 (555) 123-4567'),
('Dr. Sarah Roberts', 'IT102 - Web Development Fundamentals', '+1 (555) 987-6543'),
('Dr. Michael Johnson', 'IT103 - Database Management Systems', '+1 (555) 456-7890'),
('Prof. Emily White', 'IT104 - Data Structures & Algorithms', '+1 (555) 321-0987'),
('Dr. Robert Brown', 'IT105 - Computer Networks', '+1 (555) 654-3210'),
('Dr. Lisa Chen', 'IT106 - Software Engineering', '+1 (555) 111-2222'),
('Prof. Alex Kumar', 'IT107 - Artificial Intelligence', '+1 (555) 333-4444')
ON DUPLICATE KEY UPDATE name=VALUES(name), phone=VALUES(phone);

-- Insert timetable entries (updated dates)
INSERT INTO `timetable` (`test`, `module`, `date`, `time`, `venue`) VALUES
('Test 01', 'IT101', '2024-02-15', '10:00:00', 'Room 101'),
('Test 01', 'IT102', '2024-02-18', '14:00:00', 'Lab 3'),
('Test 02', 'IT101', '2024-03-05', '09:00:00', 'Room 102'),
('Midterm', 'IT103', '2024-03-10', '10:30:00', 'Room 201'),
('Final', 'IT104', '2024-04-20', '13:00:00', 'Hall A'),
('Quiz 01', 'IT105', '2024-02-22', '11:00:00', 'Lab 2'),
('Test 01', 'IT106', '2024-03-15', '15:00:00', 'Room 105')
ON DUPLICATE KEY UPDATE date=VALUES(date), time=VALUES(time), venue=VALUES(venue);

-- Insert settings
INSERT INTO `settings` (`academic_year`, `semester`, `institution_name`) VALUES
('2023-2024', 1, 'IT University')
ON DUPLICATE KEY UPDATE academic_year=VALUES(academic_year), semester=VALUES(semester);

-- Insert sample study notes
INSERT INTO `notes` (`title`, `content`, `module_code`, `module_name`, `type`, `tags`, `created_by`) VALUES
('Introduction to Variables and Data Types', 'In this lecture, we cover the fundamental concepts of variables and data types in programming. Variables are containers for storing data values. In most programming languages, variables have specific data types that determine what kind of data they can hold.\n\nKey Topics:\n1. What are variables?\n2. Common data types (int, float, string, boolean)\n3. Variable naming conventions\n4. Variable declaration and initialization\n5. Type conversion and casting', 'IT101', 'Introduction to Programming', 'lecture', 'variables, data-types, basics', 1),

('HTML Fundamentals', 'HTML (HyperText Markup Language) is the standard markup language for creating web pages. This lecture covers the basic structure of HTML documents and commonly used tags.\n\nTopics Covered:\n- HTML document structure\n- Head and body sections\n- Common HTML tags (h1-h6, p, div, span)\n- Links and images\n- Lists (ordered and unordered)\n- Forms and input elements', 'IT102', 'Web Development Fundamentals', 'lecture', 'html, web-development, markup', 1),

('Database Normalization', 'Database normalization is the process of organizing the fields and tables of a relational database to minimize redundancy and improve data integrity.\n\nNormalization Forms:\n1. First Normal Form (1NF)\n2. Second Normal Form (2NF)\n3. Third Normal Form (3NF)\n4. Boyce-Codd Normal Form (BCNF)\n\nEach form eliminates certain types of data anomalies.', 'IT103', 'Database Management Systems', 'lecture', 'database, normalization, sql', 1),

('Arrays and Linked Lists', 'Arrays and linked lists are fundamental data structures that store collections of elements.\n\nArrays:\n- Fixed size\n- Random access O(1)\n- Sequential memory allocation\n\nLinked Lists:\n- Dynamic size\n- Sequential access O(n)\n- Non-contiguous memory allocation\n- Singly vs doubly linked lists', 'IT104', 'Data Structures & Algorithms', 'lecture', 'arrays, linked-lists, data-structures', 1),

('OSI Model Overview', 'The OSI (Open Systems Interconnection) model is a conceptual framework that standardizes the functions of a telecommunication or computing system.\n\nSeven Layers:\n1. Physical Layer\n2. Data Link Layer\n3. Network Layer\n4. Transport Layer\n5. Session Layer\n6. Presentation Layer\n7. Application Layer\n\nEach layer serves the layer above it and is served by the layer below it.', 'IT105', 'Computer Networks', 'lecture', 'osi-model, networking, layers', 1),

('Software Development Life Cycle', 'SDLC is a systematic process for building software that ensures quality and correctness. It consists of several phases:\n\n1. Requirements Gathering\n2. System Design\n3. Implementation/Coding\n4. Testing\n5. Deployment\n6. Maintenance\n\nPopular SDLC models: Waterfall, Agile, Spiral, V-Model', 'IT106', 'Software Engineering', 'lecture', 'sdlc, software-development, methodology', 1),

('Introduction to Machine Learning', 'Machine Learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.\n\nMain Types:\n1. Supervised Learning\n2. Unsupervised Learning\n3. Reinforcement Learning\n\nCommon Algorithms: Linear Regression, Decision Trees, Neural Networks', 'IT107', 'Artificial Intelligence', 'lecture', 'machine-learning, ai, algorithms', 1),

('Lab Exercise: Basic HTML Page', 'Create a simple HTML page that includes:\n- A proper HTML5 structure\n- A heading with your name\n- A paragraph about yourself\n- An unordered list of your hobbies\n- A link to your favorite website\n- An image (using a placeholder URL)\n\nSubmit the HTML file by the end of the lab session.', 'IT102', 'Web Development Fundamentals', 'assignment', 'html, lab-exercise', 1),

('Study Guide: Midterm Exam', 'Midterm exam covering topics from weeks 1-6:\n\nIT101: Variables, control structures, functions\nIT103: Database design, SQL basics, normalization\nIT104: Arrays, linked lists, stacks, queues\n\nFormat:\n- Multiple choice questions (40%)\n- Short answer questions (30%)\n- Programming problems (30%)\n\nDuration: 2 hours\nTotal marks: 100', 'various', 'Midterm Preparation', 'exam', 'midterm, exam-preparation, study-guide', 1)
ON DUPLICATE KEY UPDATE title=VALUES(title), content=VALUES(content);

-- Insert forum categories
INSERT INTO forum_categories (name, description, icon, color) VALUES
('General Discussion', 'General topics and announcements', 'fa-bullhorn', '#28a745'),
('Academic Help', 'Get help with your studies', 'fa-question-circle', '#007bff'),
('Module Discussions', 'Discuss specific modules and topics', 'fa-book', '#6f42c1'),
('Technical Support', 'Technical issues and troubleshooting', 'fa-tools', '#fd7e14'),
('Study Groups', 'Form and join study groups', 'fa-users', '#20c997'),
('Announcements', 'Important announcements from staff', 'fa-megaphone', '#dc3545')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- Insert sample forum posts
INSERT INTO forum_posts (category_id, user_id, title, content, module_code) VALUES
(2, 1, 'Help with understanding pointers in C', 'I''m having trouble understanding pointers in C programming. Can someone explain the concept of pointers and how they work? I understand that they store memory addresses, but I''m confused about pointer arithmetic and dereferencing.', 'IT101'),
(3, 2, 'Study group for IT103 Database Management', 'Is anyone interested in forming a study group for the Database Management Systems course? We could meet weekly to review concepts and work on practice problems together. Let me know if you''re interested!', 'IT103'),
(1, 3, 'Welcome to the forum!', 'Hi everyone! Welcome to our course discussion forum. Feel free to ask questions, share resources, and help each other learn. Remember to be respectful and constructive in your discussions.', ''),
(4, 1, 'Issue accessing course materials', 'I''m having trouble accessing some of the course materials on the portal. The download links for the lecture notes aren''t working. Has anyone else experienced this issue?', ''),
(5, 2, 'Looking for study partners for final exams', 'With final exams coming up, I''d like to form a study group. We could focus on IT101 and IT102 initially. Please message me if you''re interested!', '')
ON DUPLICATE KEY UPDATE title=VALUES(title), content=VALUES(content);

-- Insert sample forum replies
INSERT INTO forum_replies (post_id, user_id, content) VALUES
(1, 2, 'Pointers can be tricky! Think of them as variables that store memory addresses. The * operator dereferences a pointer to get the value at that address, while the & operator gets the address of a variable. For pointer arithmetic, when you add 1 to a pointer, it moves to the next memory location of that data type.'),
(1, 3, 'I found this really helpful video that explains pointers with visual diagrams: https://example.com/pointers-tutorial. Also, practicing with simple programs helps a lot.'),
(2, 1, 'Great idea! I''d love to join. How about we meet on Tuesdays at 3 PM in the library?'),
(2, 3, 'Count me in too! I could really use help with SQL queries.'),
(3, 1, 'Thanks for the welcome! This forum looks like a great resource.'),
(4, 2, 'I had the same issue yesterday. Try clearing your browser cache or using a different browser. That worked for me.'),
(5, 1, 'I''m interested! Should we create a group chat to coordinate?')
ON DUPLICATE KEY UPDATE content=VALUES(content);

-- Insert sample assignments
INSERT INTO assignments (title, description, module_code, posted_by, due_date, max_marks, assignment_type, is_published) VALUES
('Programming Assignment 1', 'Create a simple calculator program that can perform basic arithmetic operations (addition, subtraction, multiplication, division). The program should:\n1. Take user input for two numbers\n2. Ask for the operation to perform\n3. Display the result\n4. Handle division by zero\n5. Include proper error handling\n\nSubmit your source code and a brief explanation of your approach.', 'IT101', 1, '2024-02-10 23:59:59', 50, 'coding', TRUE),
('HTML Portfolio Project', 'Create a personal portfolio website using HTML and CSS. The portfolio should include:\n1. A homepage with your introduction\n2. An about page with your background\n3. A projects page showcasing your work\n4. Contact information\n5. Responsive design\n6. Proper semantic HTML structure\n\nUpload your files to a hosting service and submit the link.', 'IT102', 1, '2024-02-15 23:59:59', 100, 'project', TRUE),
('Database Design Exercise', 'Design a database schema for a small library management system. Include:\n1. ER diagram\n2. Table definitions with proper relationships\n3. Sample data for each table\n4. 5 SQL queries to retrieve meaningful information\n\nSubmit your design as a PDF document.', 'IT103', 1, '2024-02-20 23:59:59', 75, 'project', TRUE),
('Algorithm Analysis Essay', 'Write a 1500-word essay comparing Bubble Sort and Quick Sort algorithms. Cover:\n1. Time complexity analysis\n2. Space complexity\n3. Best and worst case scenarios\n4. When to use each algorithm\n5. Real-world applications\n\nSubmit as a PDF with proper citations.', 'IT104', 1, '2024-02-25 23:59:59', 80, 'essay', TRUE)
ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description);

-- =====================================
-- INDEXES FOR PERFORMANCE
-- =====================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_user ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_module ON forum_posts(module_code);
CREATE INDEX IF NOT EXISTS idx_forum_replies_post ON forum_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_user ON forum_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_module ON assignments(module_code);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- =====================================
-- SETUP COMPLETE
-- =====================================

-- Note: Default passwords for test accounts:
-- Student (john@student.edu): password123
-- Student (jane@student.edu): password123  
-- Student (mike@student.edu): password123
-- Admin (admin@system.edu): admin123

-- Sample data has been inserted including:
-- - 4 users (3 students, 1 admin)
-- - 7 modules with credits
-- - 7 lecturers
-- - 7 timetable entries
-- - 10 study notes
-- - 6 forum categories
-- - 5 forum posts with replies
-- - 4 assignments
-- - Settings and notifications tables ready
