#!/bin/bash

# Course Management System - GitHub Deployment Script
# This script initializes the repository and pushes to GitHub

echo "🚀 Starting GitHub deployment for Course Management System..."

# Initialize git repository
echo "📁 Initializing git repository..."
git init

# Add all files
echo "📦 Adding files to git..."
git add .

# Initial commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit: Course Management System ready for Railway deployment

✅ Features:
- Complete IT Course Management System
- Railway.app optimized configuration
- MySQL database with SSL support
- User authentication (students & admins)
- Course modules, timetables, lecturers management
- Admin dashboard with full CRUD operations
- Responsive frontend with modern UI
- Production-ready with error handling

🔧 Tech Stack:
- Node.js + Express.js backend
- MySQL database with connection pooling
- Handlebars templating
- bcrypt password hashing
- CORS enabled for API access

🚀 Ready for Railway.app deployment!"

# Create main branch
echo "🌿 Creating main branch..."
git branch -M main

# Add remote origin
echo "🔗 Adding remote origin..."
git remote add origin https://github.com/chrispin55/course-management-system.git

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push -u origin main

echo "✅ Successfully deployed to GitHub!"
echo "🌐 Repository: https://github.com/chrispin55/course-management-system"
echo "🚀 Next step: Deploy on Railway.app using this repository!"
