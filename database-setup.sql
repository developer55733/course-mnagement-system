-- IT Management System Database Setup
-- Run this script in Railway MySQL phpMyAdmin to set up the database

-- Note: Railway MySQL automatically provides the database named 'railway'
USE railway;

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

-- Create timetable table (for tests)
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

-- Create class_timetable table (for regular classes)
CREATE TABLE IF NOT EXISTS `class_timetable` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `module_code` VARCHAR(50) NOT NULL,
  `module_name` VARCHAR(100) NOT NULL,
  `lecturer_name` VARCHAR(100) NOT NULL,
  `venue` VARCHAR(100) NOT NULL,
  `day_of_week` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_module_code (module_code),
  INDEX idx_day_of_week (day_of_week),
  INDEX idx_lecturer (lecturer_name)
);

-- Create modules table
CREATE TABLE IF NOT EXISTS `modules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) UNIQUE NOT NULL,
  `name` VARCHAR(100) NOT NULL,
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

-- Create discussion forum table
CREATE TABLE IF NOT EXISTS `discussion_forum` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `module_code` VARCHAR(50),
  `created_by` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_module (module_code),
  INDEX idx_created_by (created_by),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create discussion replies table
CREATE TABLE IF NOT EXISTS `discussion_replies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `discussion_id` INT NOT NULL,
  `content` TEXT NOT NULL,
  `created_by` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_discussion (discussion_id),
  INDEX idx_created_by (created_by),
  FOREIGN KEY (discussion_id) REFERENCES discussion_forum(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS `assignments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `module_code` VARCHAR(50) NOT NULL,
  `module_name` VARCHAR(100) NOT NULL,
  `due_date` DATETIME NOT NULL,
  `posted_by` INT NOT NULL,
  `status` ENUM('active', 'closed') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_module (module_code),
  INDEX idx_due_date (due_date),
  INDEX idx_status (status),
  INDEX idx_posted_by (posted_by),
  FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create assignment notifications table
CREATE TABLE IF NOT EXISTS `assignment_notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `assignment_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_assignment (assignment_id),
  INDEX idx_user (user_id),
  INDEX idx_is_read (is_read),
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default test users
INSERT INTO `users` (`name`, `email`, `student_id`, `password`, `role`) VALUES
('John Smith', 'john@student.edu', 'IT2023001', '$2b$10$c6mYZv1Xleen2fqxaPyGAODQvGl.7BiCQcamQlsLBEJrkhU9wEBcW', 'user'),
('Admin User', 'admin@system.edu', 'ADMIN001', '$2b$10$sqG0niYZXluB1zwBdD4CMO23Tc1VJ5BOh3y8mjHia7l65bENYwEOe', 'admin');

-- Insert default modules
INSERT INTO `modules` (`code`, `name`) VALUES
('IT101', 'Introduction to Programming'),
('IT102', 'Web Development Fundamentals'),
('IT103', 'Database Management Systems'),
('IT104', 'Data Structures & Algorithms'),
('IT105', 'Computer Networks');

-- Insert default lecturers
INSERT INTO `lecturers` (`name`, `module`, `phone`) VALUES
('Prof. James Davidson', 'IT101 - Introduction to Programming', '+1 (555) 123-4567'),
('Dr. Sarah Roberts', 'IT102 - Web Development Fundamentals', '+1 (555) 987-6543'),
('Dr. Michael Johnson', 'IT103 - Database Management Systems', '+1 (555) 456-7890'),
('Prof. Emily White', 'IT104 - Data Structures & Algorithms', '+1 (555) 321-0987'),
('Dr. Robert Brown', 'IT105 - Computer Networks', '+1 (555) 654-3210');

-- Insert default timetable entries
INSERT INTO `timetable` (`test`, `module`, `date`, `time`, `venue`) VALUES
('Test 01', 'IT101', '2024-01-15', '10:00:00', 'Room 101'),
('Test 01', 'IT102', '2024-01-18', '14:00:00', 'Lab 3'),
('Test 02', 'IT101', '2024-02-05', '09:00:00', 'Room 102'),
('Midterm', 'IT103', '2024-02-10', '10:30:00', 'Room 201'),
('Final', 'IT104', '2024-03-20', '13:00:00', 'Hall A');

-- Insert default settings
INSERT INTO `settings` (`academic_year`, `semester`, `institution_name`) VALUES
('2023-2024', 1, 'IT University');

-- Create discussion forum table
CREATE TABLE IF NOT EXISTS `discussion_forum` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `module_code` VARCHAR(50),
  `created_by` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_module (module_code),
  INDEX idx_created_by (created_by),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create discussion replies table
CREATE TABLE IF NOT EXISTS `discussion_replies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `discussion_id` INT NOT NULL,
  `content` TEXT NOT NULL,
  `created_by` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_discussion (discussion_id),
  INDEX idx_created_by (created_by),
  FOREIGN KEY (discussion_id) REFERENCES discussion_forum(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS `assignments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `module_code` VARCHAR(50) NOT NULL,
  `module_name` VARCHAR(100) NOT NULL,
  `due_date` DATETIME NOT NULL,
  `posted_by` INT NOT NULL,
  `status` ENUM('active', 'closed') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_module (module_code),
  INDEX idx_due_date (due_date),
  INDEX idx_status (status),
  INDEX idx_posted_by (posted_by),
  FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create assignment notifications table
CREATE TABLE IF NOT EXISTS `assignment_notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `assignment_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_assignment (assignment_id),
  INDEX idx_user (user_id),
  INDEX idx_is_read (is_read),
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create news table
CREATE TABLE IF NOT EXISTS `news` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `summary` VARCHAR(500),
  `category` ENUM('general', 'academic', 'event', 'announcement', 'urgent') DEFAULT 'general',
  `priority` ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  `image_url` VARCHAR(500),
  `is_featured` BOOLEAN DEFAULT FALSE,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_by` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_priority (priority),
  INDEX idx_is_active (is_active),
  INDEX idx_is_featured (is_featured),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create ads table
CREATE TABLE IF NOT EXISTS `ads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `video_url` VARCHAR(500) NOT NULL,
  `thumbnail_url` VARCHAR(500),
  `redirect_url` VARCHAR(500) NOT NULL,
  `category` ENUM('general', 'education', 'technology', 'career', 'service') DEFAULT 'general',
  `position` ENUM('header', 'sidebar', 'footer', 'content', 'popup') DEFAULT 'sidebar',
  `is_active` BOOLEAN DEFAULT TRUE,
  `is_muted` BOOLEAN DEFAULT FALSE,
  `click_count` INT DEFAULT 0,
  `view_count` INT DEFAULT 0,
  `total_watch_time` INT DEFAULT 0,
  `min_duration` INT DEFAULT 5,
  `max_duration` INT DEFAULT 30,
  `start_date` DATE,
  `end_date` DATE,
  `created_by` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_position (position),
  INDEX idx_is_active (is_active),
  INDEX idx_start_date (start_date),
  INDEX idx_end_date (end_date),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create ad_clicks table for tracking
CREATE TABLE IF NOT EXISTS `ad_clicks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ad_id` INT NOT NULL,
  `user_id` INT,
  `ip_address` VARCHAR(45),
  `user_agent` TEXT,
  `viewport` VARCHAR(20),
  `click_timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ad (ad_id),
  INDEX idx_user (user_id),
  INDEX idx_click_timestamp (click_timestamp),
  FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create ad_views table for detailed view tracking
CREATE TABLE IF NOT EXISTS `ad_views` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ad_id` INT NOT NULL,
  `user_id` INT,
  `ip_address` VARCHAR(45),
  `user_agent` TEXT,
  `viewport` VARCHAR(20),
  `watch_time` INT DEFAULT 0,
  `view_timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ad (ad_id),
  INDEX idx_user (user_id),
  INDEX idx_view_timestamp (view_timestamp),
  FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default news entries
INSERT INTO `news` (`title`, `content`, `summary`, `category`, `priority`, `is_featured`, `created_by`) VALUES
('Welcome to IT Course Management System', 'We are excited to launch our new IT Course Management System. This platform provides comprehensive tools for students and lecturers to manage courses, assignments, and communication effectively.', 'Welcome to our new course management platform with enhanced features for better learning experience.', 'general', 'high', TRUE, 2),
('New Academic Year 2024-2025', 'Registration for the new academic year is now open. Students can register for courses and access study materials through the platform.', 'Registration for 2024-2025 academic year is now open with new courses available.', 'academic', 'high', TRUE, 2),
('System Maintenance Notice', 'Scheduled maintenance will occur this weekend. The system may be temporarily unavailable from 2 AM to 6 AM on Sunday.', 'System maintenance scheduled for this weekend with temporary downtime.', 'urgent', 'urgent', FALSE, 2);

-- Insert default ads entries
INSERT INTO `ads` (`title`, `description`, `video_url`, `thumbnail_url`, `redirect_url`, `category`, `position`, `created_by`) VALUES
('Learn Programming Online', 'Start your journey in programming with our comprehensive online courses. Expert instructors, flexible schedules.', 'https://www.w3schools.com/html/mov_bbb.mp4', 'https://picsum.photos/seed/programming-ad/300/200.jpg', 'https://www.w3schools.com', 'education', 'sidebar', 2),
('Career Opportunities in IT', 'Discover exciting career opportunities in the IT industry. Connect with top employers and find your dream job.', 'https://www.w3schools.com/html/movie.mp4', 'https://picsum.photos/seed/career-ad/300/200.jpg', 'https://www.linkedin.com/jobs', 'career', 'header', 2);

-- Note: Default passwords for test accounts:
-- Student (john@student.edu): password123
-- Admin (admin@system.edu): admin123
