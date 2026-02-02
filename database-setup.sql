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

-- Note: Default passwords for test accounts:
-- Student (john@student.edu): password123
-- Admin (admin@system.edu): admin123
