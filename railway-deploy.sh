#!/bin/bash

# Railway MySQL Database Deployment Script
# This script will automatically set up the news and ads tables on Railway MySQL

echo "🚀 Starting Railway MySQL Database Setup..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (uncomment if not logged in)
# railway login

# Get the MySQL connection URL
echo "📡 Getting MySQL connection details..."
MYSQL_URL=$(railway variables get DATABASE_URL)

if [ -z "$MYSQL_URL" ]; then
    echo "❌ DATABASE_URL not found. Please set up MySQL on Railway first."
    exit 1
fi

echo "✅ MySQL URL found"

# Extract connection details
DB_HOST=$(echo $MYSQL_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $MYSQL_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $MYSQL_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo $MYSQL_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $MYSQL_URL | sed -n 's/.*:\([^@]*\)@.*/\1/p')

echo "🔗 Connecting to MySQL at $DB_HOST:$DB_PORT"

# Create the database setup script for Railway
cat > railway-setup.sql << 'EOF'
-- Railway MySQL Database Setup for News and Ads System
-- This script will automatically create all necessary tables

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
  INDEX idx_created_at (created_at)
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
  INDEX idx_created_at (created_at)
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
  INDEX idx_clicked_at (clicked_at)
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
  INDEX idx_viewed_at (viewed_at)
);

-- Insert sample data for testing
INSERT IGNORE INTO `news` (`title`, `content`, `category`, `priority`) VALUES
('Welcome to Our Platform', 'We are excited to announce the launch of our new course management system with enhanced features.', 'general', 'high'),
('New Course Available', 'Introduction to Web Development is now available for enrollment.', 'academic', 'medium'),
('System Maintenance', 'Scheduled maintenance will occur this weekend.', 'announcements', 'high');

INSERT IGNORE INTO `ads` (`title`, `description`, `video_url`, `redirect_url`, `ad_type`, `position`, `auto_play`) VALUES
('Learn Programming', 'Start your journey to become a professional programmer.', 'https://sample-videos.com/programming-ad.mp4', 'https://example.com/courses', 'video', 'sidebar', TRUE),
('Student Resources', 'Access exclusive study materials and resources.', 'https://sample-videos.com/resources-ad.mp4', 'https://example.com/resources', 'video', 'top', TRUE);

SELECT 'News and Ads database tables created successfully!' as status;
EOF

# Execute the database setup
echo "🗄️ Creating database tables..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < railway-setup.sql

if [ $? -eq 0 ]; then
    echo "✅ Database setup completed successfully!"
    echo "📊 Tables created: news, ads, ad_clicks, ad_views"
    echo "🎯 Sample data inserted for testing"
else
    echo "❌ Database setup failed. Please check your connection details."
    exit 1
fi

# Clean up
rm railway-setup.sql

echo "🎉 Railway MySQL Database Setup Complete!"
echo "🌐 Your news and ads system is now ready for use!"
