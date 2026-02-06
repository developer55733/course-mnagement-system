-- Create live streaming and meeting tables

-- Live Streams Table
CREATE TABLE IF NOT EXISTS live_streams (
    id VARCHAR(8) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    stream_link VARCHAR(500) NOT NULL,
    scheduled_time DATETIME,
    duration INT DEFAULT 60, -- in minutes
    created_by INT,
    status ENUM('scheduled', 'live', 'ended') DEFAULT 'scheduled',
    participants INT DEFAULT 0,
    started_at DATETIME,
    ended_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Live Meetings Table
CREATE TABLE IF NOT EXISTS live_meetings (
    id VARCHAR(8) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    meeting_link VARCHAR(500) NOT NULL,
    scheduled_time DATETIME,
    duration INT DEFAULT 60, -- in minutes
    max_participants INT DEFAULT 100,
    created_by INT,
    status ENUM('scheduled', 'live', 'ended') DEFAULT 'scheduled',
    participants INT DEFAULT 0,
    started_at DATETIME,
    ended_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Stream Participants Table (for tracking who joined)
CREATE TABLE IF NOT EXISTS stream_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stream_id VARCHAR(8),
    user_id INT,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stream_id) REFERENCES live_streams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_stream_user (stream_id, user_id)
);

-- Meeting Participants Table (for tracking who joined)
CREATE TABLE IF NOT EXISTS meeting_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meeting_id VARCHAR(8),
    user_id INT,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meeting_id) REFERENCES live_meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_meeting_user (meeting_id, user_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_streams_status ON live_streams(status);
CREATE INDEX IF NOT EXISTS idx_streams_created_by ON live_streams(created_by);
CREATE INDEX IF NOT EXISTS idx_streams_scheduled ON live_streams(scheduled_time);

CREATE INDEX IF NOT EXISTS idx_meetings_status ON live_meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_created_by ON live_meetings(created_by);
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled ON live_meetings(scheduled_time);

CREATE INDEX IF NOT EXISTS idx_stream_participants_stream ON stream_participants(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_participants_user ON stream_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting ON meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_user ON meeting_participants(user_id);
