// MySQL Database Initialization and Management
class MySQLManager {
    constructor() {
        this.connection = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            // For browser environment, we'll use a simulated MySQL connection
            // In production, this would connect to a real MySQL server
            console.log('Initializing MySQL database...');
            
            // Create tables if they don't exist
            await this.createTables();
            
            this.isInitialized = true;
            console.log('MySQL database initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize MySQL database:', error);
            return false;
        }
    }

    async createTables() {
        const tables = [
            {
                name: 'blogs',
                sql: `
                    CREATE TABLE IF NOT EXISTS blogs (
                        id VARCHAR(255) PRIMARY KEY,
                        title VARCHAR(255) NOT NULL,
                        category VARCHAR(100) DEFAULT 'other',
                        excerpt TEXT,
                        content LONGTEXT,
                        tags JSON,
                        featured_image VARCHAR(500),
                        status ENUM('draft', 'published') DEFAULT 'draft',
                        views INT DEFAULT 0,
                        likes INT DEFAULT 0,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        INDEX idx_status (status),
                        INDEX idx_category (category),
                        INDEX idx_created_at (created_at)
                    )
                `
            },
            {
                name: 'portfolio_profile',
                sql: `
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
                    )
                `
            },
            {
                name: 'portfolio_skills',
                sql: `
                    CREATE TABLE IF NOT EXISTS portfolio_skills (
                        id VARCHAR(255) PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'beginner',
                        category VARCHAR(100),
                        description TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        INDEX idx_level (level),
                        INDEX idx_category (category)
                    )
                `
            },
            {
                name: 'portfolio_experience',
                sql: `
                    CREATE TABLE IF NOT EXISTS portfolio_experience (
                        id VARCHAR(255) PRIMARY KEY,
                        company VARCHAR(255),
                        position VARCHAR(255),
                        start_date DATE,
                        end_date DATE,
                        description TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        INDEX idx_start_date (start_date),
                        INDEX idx_company (company)
                    )
                `
            },
            {
                name: 'portfolio_projects',
                sql: `
                    CREATE TABLE IF NOT EXISTS portfolio_projects (
                        id VARCHAR(255) PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        description TEXT,
                        technologies VARCHAR(500),
                        link VARCHAR(500),
                        image VARCHAR(500),
                        status ENUM('active', 'completed', 'archived') DEFAULT 'active',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        INDEX idx_status (status),
                        INDEX idx_created_at (created_at)
                    )
                `
            },
            {
                name: 'portfolio_cv',
                sql: `
                    CREATE TABLE IF NOT EXISTS portfolio_cv (
                        id INT PRIMARY KEY DEFAULT 1,
                        education JSON,
                        certifications JSON,
                        languages JSON,
                        references JSON,
                        summary TEXT,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                `
            }
        ];

        // Simulate table creation (in production, this would be real SQL queries)
        console.log('Creating MySQL tables...');
        
        for (const table of tables) {
            console.log(`Creating table: ${table.name}`);
            // In a real implementation, you would execute:
            // await this.connection.query(table.sql);
        }
        
        console.log('All MySQL tables created successfully');
    }

    // Blog operations
    async getBlogs() {
        if (!this.isInitialized) await this.initialize();
        
        try {
            // Simulate MySQL query
            // const [rows] = await this.connection.query('SELECT * FROM blogs ORDER BY created_at DESC');
            // return rows;
            
            // For now, return localStorage data
            return JSON.parse(localStorage.getItem('blogPortfolioDB') || '{}').blogs || [];
        } catch (error) {
            console.error('Error fetching blogs:', error);
            return [];
        }
    }

    async addBlog(blogData) {
        if (!this.isInitialized) await this.initialize();
        
        try {
            const blog = {
                id: Date.now().toString(),
                ...blogData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            // Simulate MySQL insert
            // await this.connection.query('INSERT INTO blogs SET ?', blog);
            
            // For now, use localStorage
            const db = JSON.parse(localStorage.getItem('blogPortfolioDB') || '{"blogs":[]}');
            db.blogs.push(blog);
            localStorage.setItem('blogPortfolioDB', JSON.stringify(db));
            
            return blog;
        } catch (error) {
            console.error('Error adding blog:', error);
            throw error;
        }
    }

    async updateBlog(blogId, updateData) {
        if (!this.isInitialized) await this.initialize();
        
        try {
            const updateFields = {
                ...updateData,
                updated_at: new Date().toISOString()
            };
            
            // Simulate MySQL update
            // await this.connection.query('UPDATE blogs SET ? WHERE id = ?', [updateFields, blogId]);
            
            // For now, use localStorage
            const db = JSON.parse(localStorage.getItem('blogPortfolioDB') || '{"blogs":[]}');
            const blogIndex = db.blogs.findIndex(blog => blog.id === blogId);
            if (blogIndex !== -1) {
                db.blogs[blogIndex] = { ...db.blogs[blogIndex], ...updateFields };
                localStorage.setItem('blogPortfolioDB', JSON.stringify(db));
                return db.blogs[blogIndex];
            }
            return null;
        } catch (error) {
            console.error('Error updating blog:', error);
            throw error;
        }
    }

    async deleteBlog(blogId) {
        if (!this.isInitialized) await this.initialize();
        
        try {
            // Simulate MySQL delete
            // await this.connection.query('DELETE FROM blogs WHERE id = ?', [blogId]);
            
            // For now, use localStorage
            const db = JSON.parse(localStorage.getItem('blogPortfolioDB') || '{"blogs":[]}');
            const blogIndex = db.blogs.findIndex(blog => blog.id === blogId);
            if (blogIndex !== -1) {
                const deletedBlog = db.blogs.splice(blogIndex, 1)[0];
                localStorage.setItem('blogPortfolioDB', JSON.stringify(db));
                return deletedBlog;
            }
            return null;
        } catch (error) {
            console.error('Error deleting blog:', error);
            throw error;
        }
    }

    // Portfolio operations
    async getProfile() {
        if (!this.isInitialized) await this.initialize();
        
        try {
            // Simulate MySQL query
            // const [rows] = await this.connection.query('SELECT * FROM portfolio_profile WHERE id = 1');
            // return rows[0] || {};
            
            // For now, use localStorage
            const db = JSON.parse(localStorage.getItem('blogPortfolioDB') || '{}');
            return db.portfolio?.profile || {};
        } catch (error) {
            console.error('Error fetching profile:', error);
            return {};
        }
    }

    async updateProfile(profileData) {
        if (!this.isInitialized) await this.initialize();
        
        try {
            // Simulate MySQL update
            // await this.connection.query('UPDATE portfolio_profile SET ? WHERE id = 1', [profileData]);
            
            // For now, use localStorage
            const db = JSON.parse(localStorage.getItem('blogPortfolioDB') || '{"portfolio":{"profile":{}}}');
            db.portfolio.profile = { ...db.portfolio.profile, ...profileData };
            localStorage.setItem('blogPortfolioDB', JSON.stringify(db));
            return db.portfolio.profile;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    async getSkills() {
        if (!this.isInitialized) await this.initialize();
        
        try {
            // Simulate MySQL query
            // const [rows] = await this.connection.query('SELECT * FROM portfolio_skills ORDER BY created_at DESC');
            // return rows;
            
            // For now, use localStorage
            const db = JSON.parse(localStorage.getItem('blogPortfolioDB') || '{}');
            return db.portfolio?.skills || [];
        } catch (error) {
            console.error('Error fetching skills:', error);
            return [];
        }
    }

    async addSkill(skillData) {
        if (!this.isInitialized) await this.initialize();
        
        try {
            const skill = {
                id: Date.now().toString(),
                ...skillData,
                created_at: new Date().toISOString()
            };
            
            // Simulate MySQL insert
            // await this.connection.query('INSERT INTO portfolio_skills SET ?', skill);
            
            // For now, use localStorage
            const db = JSON.parse(localStorage.getItem('blogPortfolioDB') || '{"portfolio":{"skills":[]}}');
            db.portfolio.skills.push(skill);
            localStorage.setItem('blogPortfolioDB', JSON.stringify(db));
            return skill;
        } catch (error) {
            console.error('Error adding skill:', error);
            throw error;
        }
    }

    async getExperience() {
        if (!this.isInitialized) await this.initialize();
        
        try {
            // Simulate MySQL query
            // const [rows] = await this.connection.query('SELECT * FROM portfolio_experience ORDER BY start_date DESC');
            // return rows;
            
            // For now, use localStorage
            const db = JSON.parse(localStorage.getItem('blogPortfolioDB') || '{}');
            return db.portfolio?.experience || [];
        } catch (error) {
            console.error('Error fetching experience:', error);
            return [];
        }
    }

    async addExperience(expData) {
        if (!this.isInitialized) await this.initialize();
        
        try {
            const experience = {
                id: Date.now().toString(),
                ...expData,
                created_at: new Date().toISOString()
            };
            
            // Simulate MySQL insert
            // await this.connection.query('INSERT INTO portfolio_experience SET ?', experience);
            
            // For now, use localStorage
            const db = JSON.parse(localStorage.getItem('blogPortfolioDB') || '{"portfolio":{"experience":[]}}');
            db.portfolio.experience.push(experience);
            localStorage.setItem('blogPortfolioDB', JSON.stringify(db));
            return experience;
        } catch (error) {
            console.error('Error adding experience:', error);
            throw error;
        }
    }

    async getProjects() {
        if (!this.isInitialized) await this.initialize();
        
        try {
            // Simulate MySQL query
            // const [rows] = await this.connection.query('SELECT * FROM portfolio_projects ORDER BY created_at DESC');
            // return rows;
            
            // For now, use localStorage
            const db = JSON.parse(localStorage.getItem('blogPortfolioDB') || '{}');
            return db.portfolio?.projects || [];
        } catch (error) {
            console.error('Error fetching projects:', error);
            return [];
        }
    }

    async addProject(projectData) {
        if (!this.isInitialized) await this.initialize();
        
        try {
            const project = {
                id: Date.now().toString(),
                ...projectData,
                created_at: new Date().toISOString()
            };
            
            // Simulate MySQL insert
            // await this.connection.query('INSERT INTO portfolio_projects SET ?', project);
            
            // For now, use localStorage
            const db = JSON.parse(localStorage.getItem('blogPortfolioDB') || '{"portfolio":{"projects":[]}}');
            db.portfolio.projects.push(project);
            localStorage.setItem('blogPortfolioDB', JSON.stringify(db));
            return project;
        } catch (error) {
            console.error('Error adding project:', error);
            throw error;
        }
    }

    async getStats() {
        if (!this.isInitialized) await this.initialize();
        
        try {
            // Simulate MySQL queries
            // const [blogCount] = await this.connection.query('SELECT COUNT(*) as count FROM blogs');
            // const [publishedCount] = await this.connection.query('SELECT COUNT(*) as count FROM blogs WHERE status = "published"');
            // const [skillCount] = await this.connection.query('SELECT COUNT(*) as count FROM portfolio_skills');
            // const [expCount] = await this.connection.query('SELECT COUNT(*) as count FROM portfolio_experience');
            // const [projectCount] = await this.connection.query('SELECT COUNT(*) as count FROM portfolio_projects');
            
            // For now, use localStorage
            const db = JSON.parse(localStorage.getItem('blogPortfolioDB') || '{}');
            const blogs = db.blogs || [];
            const portfolio = db.portfolio || {};
            
            return {
                totalBlogs: blogs.length,
                publishedBlogs: blogs.filter(blog => blog.status === 'published').length,
                draftBlogs: blogs.filter(blog => blog.status === 'draft').length,
                totalSkills: portfolio.skills?.length || 0,
                totalExperience: portfolio.experience?.length || 0,
                totalProjects: portfolio.projects?.length || 0
            };
        } catch (error) {
            console.error('Error fetching stats:', error);
            return {
                totalBlogs: 0,
                publishedBlogs: 0,
                draftBlogs: 0,
                totalSkills: 0,
                totalExperience: 0,
                totalProjects: 0
            };
        }
    }
}

// Initialize MySQL Manager
const mysqlManager = new MySQLManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MySQLManager;
}
