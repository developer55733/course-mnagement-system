# Railway MySQL Database Setup for News and Ads System

This guide will help you automatically set up the MySQL database on Railway with all necessary tables for the news and ads functionality.

## 🚀 Quick Setup

### Prerequisites
- Railway account
- Railway CLI installed (`npm install -g @railway/cli`)
- MySQL plugin added to your Railway project

### Option 1: Automatic Setup (Recommended)

1. **Login to Railway**
   ```bash
   railway login
   ```

2. **Add MySQL Plugin**
   ```bash
   railway add mysql
   ```

3. **Run Automatic Setup**
   ```bash
   npm run railway-setup
   ```

### Option 2: Manual Setup

1. **Get Database URL**
   ```bash
   railway variables get DATABASE_URL
   ```

2. **Run Database Migration**
   ```bash
   npm run railway-migrate
   ```

## 📊 Database Tables Created

The setup will automatically create these tables:

### 📰 News Table
- **Purpose**: Store news articles and announcements
- **Fields**: id, title, content, category, priority, image_url, is_active, created_by, timestamps
- **Categories**: general, academic, events, announcements
- **Priorities**: low, medium, high

### 📺 Ads Table
- **Purpose**: Store advertisements with video content
- **Fields**: id, title, description, video_url, redirect_url, ad_type, position, auto_play, tracking fields
- **Types**: video, banner, popup
- **Positions**: top, sidebar, bottom, popup

### 📈 Ad Clicks Table
- **Purpose**: Track ad click analytics
- **Fields**: id, ad_id, user_id, ip_address, user_agent, clicked_at
- **Indexes**: Optimized for analytics queries

### 👁️ Ad Views Table
- **Purpose**: Track ad view analytics
- **Fields**: id, ad_id, user_id, ip_address, viewed_at
- **Indexes**: Optimized for analytics queries

## 🎯 Sample Data

The setup includes sample data for testing:
- **3 News Articles**: Welcome message, course announcement, maintenance notice
- **2 Sample Ads**: Programming course ad, student resources ad

## 🔧 Configuration Files

### `railway-database-setup.sql`
- Complete MySQL schema for news and ads system
- Includes indexes for performance optimization
- Sample data for immediate testing

### `railway-deploy.sh`
- Automated deployment script
- Extracts Railway MySQL connection details
- Executes database setup automatically
- Includes error handling and validation

### `railway.toml`
- Railway configuration file
- Environment variables setup
- Build and deployment settings
- Plugin configuration for MySQL

### `package.json` Scripts
- `npm run railway-setup`: Complete automated setup
- `npm run railway-migrate`: Database migration only
- `npm run deploy:railway`: Deploy to Railway

## 🌐 Deployment Process

### Step 1: Prepare Your Project
```bash
# Clone your repository
git clone <your-repo-url>
cd course-mnagement-system

# Install dependencies
npm install
```

### Step 2: Connect to Railway
```bash
# Login to Railway
railway login

# Link your project
railway link

# Add MySQL plugin
railway add mysql
```

### Step 3: Deploy and Setup Database
```bash
# Deploy to Railway
npm run deploy:railway

# Setup database automatically
npm run railway-setup
```

### Step 4: Verify Setup
```bash
# Check database variables
railway variables

# Test database connection
railway variables get DATABASE_URL
```

## 🔍 Verification

After setup, you can verify the tables were created:

1. **Check Railway Dashboard**
   - Go to your Railway project
   - Click on MySQL plugin
   - View "Data" tab to see tables

2. **Test API Endpoints**
   - `GET /api/news` - Should return sample news
   - `GET /api/ads` - Should return sample ads
   - `POST /api/news` - Should create new news
   - `POST /api/ads` - Should create new ad

3. **Check Admin Panel**
   - Visit `/admin`
   - Login with your admin secret
   - Verify news and ads management sections work

## 🛠️ Troubleshooting

### Common Issues

**"DATABASE_URL not found"**
```bash
# Ensure MySQL plugin is added
railway add mysql

# Check if variable exists
railway variables get DATABASE_URL
```

**"Access denied"**
```bash
# Check MySQL credentials
railway variables get MYSQL_USERNAME
railway variables get MYSQL_PASSWORD
```

**"Table already exists"**
- This is normal - the script uses `CREATE TABLE IF NOT EXISTS`
- Existing data will be preserved

**"Connection timeout"**
```bash
# Check Railway status
railway status

# Restart MySQL plugin
railway restart mysql
```

### Manual Database Access

If you need to access the database directly:
```bash
# Get connection details
MYSQL_URL=$(railway variables get DATABASE_URL)

# Connect with MySQL client
mysql -h <host> -P <port> -u <username> -p<password> <database>
```

## 📱 Environment Variables

The setup uses these environment variables:
- `DATABASE_URL`: Full MySQL connection string
- `MYSQL_HOST`: Database host
- `MYSQL_PORT`: Database port (3306)
- `MYSQL_DATABASE`: Database name
- `MYSQL_USERNAME`: Database username
- `MYSQL_PASSWORD`: Database password

## 🎉 Success!

Once completed, your Railway MySQL database will have:
- ✅ Complete news management system
- ✅ Advanced ads management with video support
- ✅ Analytics tracking for views and clicks
- ✅ Sample data for immediate testing
- ✅ Optimized indexes for performance
- ✅ Ready for production use

## 📞 Support

For issues with Railway deployment:
1. Check Railway documentation: https://docs.railway.app/
2. Verify MySQL plugin is properly configured
3. Check environment variables are set correctly
4. Review Railway logs for error messages

Your news and ads system is now ready for Railway deployment! 🚀
