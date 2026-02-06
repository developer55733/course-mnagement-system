-- Complete Database Setup for Course Management System
-- This file includes all tables needed for the application

-- Users Table (already exists, included for completeness)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'lecturer', 'student') DEFAULT 'student',
    student_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Modules Table (already exists, included for completeness)
CREATE TABLE IF NOT EXISTS modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    lecturer_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lecturer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Lecturers Table (already exists, included for completeness)
CREATE TABLE IF NOT EXISTS lecturers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    module_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE SET NULL
);

-- Notes Table (already exists, included for completeness)
CREATE TABLE IF NOT EXISTS notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    module_code VARCHAR(20),
    type ENUM('lecture', 'tutorial', 'assignment') DEFAULT 'lecture',
    tags VARCHAR(255),
    visibility ENUM('public', 'private') DEFAULT 'public',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (module_code) REFERENCES modules(code) ON DELETE SET NULL
);

-- Timetable Table (already exists, included for completeness)
CREATE TABLE IF NOT EXISTS timetable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test VARCHAR(255) NOT NULL,
    module_id INT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    venue VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE SET NULL
);

-- Settings Table (already exists, included for completeness)
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    academic_year VARCHAR(20) DEFAULT '2023-2024',
    semester VARCHAR(20) DEFAULT 'First Semester',
    institution_name VARCHAR(255) DEFAULT 'IT Management System',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Live Streams Table
CREATE TABLE IF NOT EXISTS live_streams (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_time DATETIME,
    started_at DATETIME,
    ended_at DATETIME,
    join_link TEXT NOT NULL,
    created_by INT,
    is_public BOOLEAN DEFAULT 1,
    status ENUM('scheduled', 'live', 'ended') DEFAULT 'scheduled',
    participants INT DEFAULT 0,
    max_participants INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Live Meetings Table
CREATE TABLE IF NOT EXISTS live_meetings (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_time DATETIME,
    duration INT DEFAULT 60,
    started_at DATETIME,
    ended_at DATETIME,
    join_link TEXT NOT NULL,
    host_link TEXT NOT NULL,
    created_by INT,
    is_public BOOLEAN DEFAULT 1,
    password_required BOOLEAN DEFAULT 0,
    password VARCHAR(255),
    status ENUM('scheduled', 'live', 'ended') DEFAULT 'scheduled',
    participants INT DEFAULT 0,
    max_participants INT DEFAULT 50,
    recording_enabled BOOLEAN DEFAULT 0,
    chat_enabled BOOLEAN DEFAULT 1,
    screen_share_enabled BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Meeting Participants Table
CREATE TABLE IF NOT EXISTS meeting_participants (
    id VARCHAR(36) PRIMARY KEY,
    meeting_id VARCHAR(36) NOT NULL,
    user_id INT,
    name VARCHAR(255),
    email VARCHAR(255),
    role ENUM('host', 'participant', 'moderator') DEFAULT 'participant',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    left_at DATETIME,
    is_muted BOOLEAN DEFAULT 0,
    is_video_on BOOLEAN DEFAULT 1,
    screen_sharing BOOLEAN DEFAULT 0,
    ip_address VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (meeting_id) REFERENCES live_meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Stream Participants Table
CREATE TABLE IF NOT EXISTS stream_participants (
    id VARCHAR(36) PRIMARY KEY,
    stream_id VARCHAR(36) NOT NULL,
    user_id INT,
    name VARCHAR(255),
    email VARCHAR(255),
    role ENUM('host', 'participant', 'moderator') DEFAULT 'participant',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    left_at DATETIME,
    is_muted BOOLEAN DEFAULT 0,
    is_video_on BOOLEAN DEFAULT 1,
    ip_address VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (stream_id) REFERENCES live_streams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meeting_id VARCHAR(36),
    stream_id VARCHAR(36),
    user_id INT,
    participant_id VARCHAR(36),
    message TEXT NOT NULL,
    message_type ENUM('text', 'file', 'image', 'system') DEFAULT 'text',
    reply_to INT,
    is_deleted BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meeting_id) REFERENCES live_meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (stream_id) REFERENCES live_streams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Recording Sessions Table
CREATE TABLE IF NOT EXISTS recording_sessions (
    id VARCHAR(36) PRIMARY KEY,
    meeting_id VARCHAR(36),
    stream_id VARCHAR(36),
    title VARCHAR(255),
    description TEXT,
    file_path TEXT,
    file_size BIGINT,
    duration INT,
    recording_url TEXT,
    thumbnail_url TEXT,
    status ENUM('recording', 'processing', 'completed', 'failed') DEFAULT 'recording',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (meeting_id) REFERENCES live_meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (stream_id) REFERENCES live_streams(id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_live_streams_status ON live_streams(status);
CREATE INDEX IF NOT EXISTS idx_live_streams_created_by ON live_streams(created_by);
CREATE INDEX IF NOT EXISTS idx_live_streams_created_at ON live_streams(created_at);

CREATE INDEX IF NOT EXISTS idx_live_meetings_status ON live_meetings(status);
CREATE INDEX IF NOT EXISTS idx_live_meetings_created_by ON live_meetings(created_by);
CREATE INDEX IF NOT EXISTS idx_live_meetings_created_at ON live_meetings(created_at);

CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting_id ON meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_user_id ON meeting_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_stream_participants_stream_id ON stream_participants(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_participants_user_id ON stream_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_meeting_id ON chat_messages(meeting_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_stream_id ON chat_messages(stream_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_recording_sessions_meeting_id ON recording_sessions(meeting_id);
CREATE INDEX IF NOT EXISTS idx_recording_sessions_stream_id ON recording_sessions(stream_id);

-- Insert sample data for testing
INSERT IGNORE INTO users (id, name, email, password, role, student_id) VALUES
(1, 'Admin User', 'admin@course.com', 'password123', 'admin', 'ADMIN001'),
(2, 'John Student', 'john@student.edu', 'password123', 'student', 'STU001'),
(3, 'Jane Lecturer', 'jane@lecturer.edu', 'password123', 'lecturer', 'LEC001');

INSERT IGNORE INTO modules (id, code, name, lecturer_id) VALUES
(1, 'IT101', 'Introduction to Programming', 3),
(2, 'IT102', 'Web Development Fundamentals', 3),
(3, 'IT103', 'Database Management Systems', 3);

INSERT IGNORE INTO notes (id, title, content, module_code, type, tags, visibility, created_by) VALUES
(1, 'Introduction to Programming', 'Welcome to the course! This is the first lecture in the Introduction to Programming module.', 'IT101', 'lecture', 'basic', 'public', 1),
(2, 'Web Development Basics', 'Learn HTML, CSS, and JavaScript fundamentals for modern web development.', 'IT102', 'tutorial', 'web-dev', 'public', 1),
(3, 'Database Assignment Guidelines', 'Complete the database assignment with proper normalization and documentation.', 'IT103', 'assignment', 'database', 'public', 1);
