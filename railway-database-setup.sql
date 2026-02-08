-- Railway MySQL Database Setup for News and Ads System
-- This script will automatically create all necessary tables for the news and ads functionality

-- Create news table
CREATE TABLE IF NOT EXISTS `news` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `content` TEXT NOT NULL,
  `category` ENUM('general', 'academic', 'events', 'announcements') DEFAULT 'general',
  `priority` ENUM('low', 'medium', 'high') DEFAULT 'medium',
  `image_url` VARCHAR(500),
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_priority (priority),
  INDEX idx_is_active (is_active),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create ads table
CREATE TABLE IF NOT EXISTS `ads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `video_url` VARCHAR(500) NOT NULL,
  `redirect_url` VARCHAR(500) NOT NULL,
  `ad_type` ENUM('video', 'banner', 'popup') DEFAULT 'video',
  `position` ENUM('top', 'sidebar', 'bottom', 'popup') DEFAULT 'sidebar',
  `is_active` BOOLEAN DEFAULT TRUE,
  `auto_play` BOOLEAN DEFAULT TRUE,
  `click_count` INT DEFAULT 0,
  `view_count` INT DEFAULT 0,
  `created_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ad_type (ad_type),
  INDEX idx_position (position),
  INDEX idx_is_active (is_active),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create ad_clicks table for tracking
CREATE TABLE IF NOT EXISTS `ad_clicks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ad_id` INT NOT NULL,
  `user_id` INT,
  `ip_address` VARCHAR(45),
  `user_agent` TEXT,
  `clicked_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ad (ad_id),
  INDEX idx_user (user_id),
  INDEX idx_clicked_at (clicked_at),
  FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create ad_views table for tracking
CREATE TABLE IF NOT EXISTS `ad_views` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ad_id` INT NOT NULL,
  `user_id` INT,
  `ip_address` VARCHAR(45),
  `viewed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ad (ad_id),
  INDEX idx_user (user_id),
  INDEX idx_viewed_at (viewed_at),
  FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert sample data for testing (optional)
INSERT IGNORE INTO `news` (`title`, `content`, `category`, `priority`, `created_by`) VALUES
('Welcome to Our Platform', 'We are excited to announce the launch of our new course management system with enhanced features for students and administrators.', 'general', 'high', 1),
('New Course Available', 'Introduction to Web Development is now available for enrollment. Learn modern web technologies including HTML5, CSS3, and JavaScript.', 'academic', 'medium', 1),
('System Maintenance', 'Scheduled maintenance will occur this weekend. The system will be unavailable from 2 AM to 6 AM on Sunday.', 'announcements', 'high', 1);

INSERT IGNORE INTO `ads` (`title`, `description`, `video_url`, `redirect_url`, `ad_type`, `position`, `auto_play`, `created_by`) VALUES
('Learn Programming', 'Start your journey to become a professional programmer with our comprehensive courses.', 'https://sample-videos.com/programming-ad.mp4', 'https://example.com/courses', 'video', 'sidebar', TRUE, 1),
('Student Resources', 'Access exclusive study materials and resources to enhance your learning experience.', 'https://sample-videos.com/resources-ad.mp4', 'https://example.com/resources', 'video', 'top', TRUE, 1);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS `idx_news_search` ON `news` (`title`, `content`(100));
CREATE INDEX IF NOT EXISTS `idx_ads_active` ON `ads` (`is_active`, `created_at`);
CREATE INDEX IF NOT EXISTS `idx_ad_analytics` ON `ad_clicks` (`ad_id`, `clicked_at`);
CREATE INDEX IF NOT EXISTS `idx_view_analytics` ON `ad_views` (`ad_id`, `viewed_at`);

-- Grant permissions (adjust username as needed)
-- GRANT ALL PRIVILEGES ON course_management.* TO 'railway_user'@'%';
-- FLUSH PRIVILEGES;

-- Success message
SELECT 'News and Ads database tables created successfully!' as status;
