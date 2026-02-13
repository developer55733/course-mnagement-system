# MySQL Database Setup (Optional)

## Current Status
Your application currently uses a **client-side localStorage database** that works perfectly for:
- Blog posts (create, edit, delete)
- Portfolio management
- Data persistence
- No server requirements

## MySQL Setup (Only if needed for other features)

### 1. Railway Environment Variables
Set these in your Railway dashboard:

```bash
# Database Configuration
DATABASE_URL=mysql://username:password@host:port/database_name
MYSQL_HOST=host
MYSQL_PORT=3306
MYSQL_USER=username
MYSQL_PASSWORD=password
MYSQL_DATABASE=database_name
```

### 2. Database Initialization
Create this SQL script to set up tables:

```sql
-- blog_portfolio_tables.sql
CREATE TABLE IF NOT EXISTS blogs (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    excerpt TEXT,
    content TEXT,
    tags JSON,
    featured_image VARCHAR(500),
    status ENUM('draft', 'published') DEFAULT 'draft',
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolio_profile (
    id INT PRIMARY KEY DEFAULT 1,
    name VARCHAR(255),
    title VARCHAR(255),
    bio TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    location VARCHAR(255),
    website VARCHAR(500),
    avatar VARCHAR(500),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolio_skills (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    level ENUM('beginner', 'intermediate', 'advanced', 'expert'),
    category VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolio_experience (
    id VARCHAR(255) PRIMARY KEY,
    company VARCHAR(255),
    position VARCHAR(255),
    start_date DATE,
    end_date DATE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolio_projects (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    technologies VARCHAR(500),
    link VARCHAR(500),
    image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Node.js Backend (Optional)
If you want to switch from localStorage to MySQL:

```javascript
// database-mysql.js
const mysql = require('mysql2/promise');

class MySQLDatabase {
    constructor() {
        this.pool = mysql.createPool({
            host: process.env.MYSQL_HOST,
            port: process.env.MYSQL_PORT,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }

    async getBlogs() {
        const [rows] = await this.pool.execute('SELECT * FROM blogs ORDER BY created_at DESC');
        return rows;
    }

    async addBlog(blogData) {
        const [result] = await this.pool.execute(
            'INSERT INTO blogs (id, title, category, excerpt, content, tags, featured_image, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [Date.now().toString(), blogData.title, blogData.category, blogData.excerpt, blogData.content, JSON.stringify(blogData.tags), blogData.featuredImage, blogData.status]
        );
        return { id: result.insertId, ...blogData };
    }

    // Add other CRUD methods...
}
```

## Recommendation
**Stick with the current localStorage database** unless you specifically need:
- Multi-user data sharing
- Server-side data processing
- Complex queries and relationships
- Data backup requirements

The localStorage solution is:
- ✅ Working perfectly
- ✅ No server costs
- ✅ Fast and responsive
- ✅ Easy to maintain
- ✅ Sufficient for single-user portfolio/blog
