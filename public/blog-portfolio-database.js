// Database Management for Blog and Portfolio System
class BlogPortfolioDB {
    constructor() {
        this.storageKey = 'blogPortfolioDB';
        this.data = null;
        this.init();
    }

    async init() {
        try {
            await this.loadDatabase();
        } catch (error) {
            console.error('Database initialization failed:', error);
            this.data = this.getDefaultData();
            await this.saveDatabase();
        }
    }

    getDefaultData() {
        return {
            blogs: [],
            portfolio: {
                profile: {
                    name: "",
                    title: "",
                    bio: "",
                    email: "",
                    phone: "",
                    location: "",
                    website: "",
                    avatar: ""
                },
                skills: [],
                experience: [],
                projects: [],
                cv: {
                    education: [],
                    certifications: [],
                    languages: [],
                    references: []
                }
            },
            settings: {
                lastUpdated: null,
                version: "1.0.0"
            }
        };
    }

    async loadDatabase() {
        try {
            const storedData = localStorage.getItem(this.storageKey);
            if (storedData) {
                this.data = JSON.parse(storedData);
            } else {
                this.data = this.getDefaultData();
                await this.saveDatabase();
            }
        } catch (error) {
            console.error('Failed to load database from localStorage:', error);
            this.data = this.getDefaultData();
        }
    }

    async saveDatabase() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
            this.data.settings.lastUpdated = new Date().toISOString();
            console.log('Database saved successfully to localStorage');
            return true;
        } catch (error) {
            console.error('Failed to save database:', error);
            return false;
        }
    }

    // Blog Operations
    async getBlogs() {
        return this.data?.blogs || [];
    }

    async addBlog(blogData) {
        if (!this.data) await this.loadDatabase();
        
        // Get current user info
        let currentUser = null;
        if (window.sessionManager && window.sessionManager.isLoggedIn()) {
            currentUser = window.sessionManager.getCurrentUser();
        }
        
        const newBlog = {
            id: Date.now().toString(),
            ...blogData,
            createdBy: currentUser ? currentUser.id : 'anonymous',
            createdByName: currentUser ? currentUser.name : 'Anonymous',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.data.blogs.push(newBlog);
        await this.saveDatabase();
        return newBlog;
    }

    async updateBlog(blogId, updateData) {
        if (!this.data) await this.loadDatabase();
        
        // Check if user can manage this blog
        if (!this.canManageBlog(blogId)) {
            throw new Error('You do not have permission to edit this blog');
        }
        
        const blogIndex = this.data.blogs.findIndex(blog => blog.id === blogId);
        if (blogIndex !== -1) {
            this.data.blogs[blogIndex] = {
                ...this.data.blogs[blogIndex],
                ...updateData,
                updatedAt: new Date().toISOString()
            };
            await this.saveDatabase();
            return this.data.blogs[blogIndex];
        }
        return null;
    }

    async deleteBlog(blogId) {
        if (!this.data) await this.loadDatabase();
        
        // Check if user can manage this blog
        if (!this.canManageBlog(blogId)) {
            throw new Error('You do not have permission to delete this blog');
        }
        
        const blogIndex = this.data.blogs.findIndex(blog => blog.id === blogId);
        if (blogIndex !== -1) {
            const deletedBlog = this.data.blogs[blogIndex];
            this.data.blogs.splice(blogIndex, 1);
            await this.saveDatabase();
            return deletedBlog;
        }
        return null;
    }

    canManageBlog(blogId) {
        const blog = this.data?.blogs?.find(b => b.id === blogId);
        if (!blog) return false;
        
        // Get current user info
        let currentUser = null;
        if (window.sessionManager && window.sessionManager.isLoggedIn()) {
            currentUser = window.sessionManager.getCurrentUser();
        }
        
        // User can manage if they created the blog or if no user is logged in (demo mode)
        if (!currentUser) return true; // Demo mode - allow all
        return blog.createdBy === currentUser.id || blog.createdBy === 'anonymous';
    }

    async getBlogById(blogId) {
        if (!this.data) await this.loadDatabase();
        return this.data.blogs.find(blog => blog.id === blogId) || null;
    }

    // Portfolio Profile Operations
    async getProfile() {
        return this.data?.portfolio?.profile || {};
    }

    async updateProfile(profileData) {
        if (!this.data) await this.loadDatabase();
        
        this.data.portfolio.profile = {
            ...this.data.portfolio.profile,
            ...profileData,
            updatedAt: new Date().toISOString()
        };
        
        await this.saveDatabase();
        return this.data.portfolio.profile;
    }

    // Portfolio Skills Operations
    async getSkills() {
        return this.data?.portfolio?.skills || [];
    }

    async addSkill(skillData) {
        if (!this.data) await this.loadDatabase();
        
        const newSkill = {
            id: Date.now().toString(),
            ...skillData,
            createdAt: new Date().toISOString()
        };
        
        this.data.portfolio.skills.push(newSkill);
        await this.saveDatabase();
        return newSkill;
    }

    async updateSkill(skillId, updateData) {
        if (!this.data) await this.loadDatabase();
        
        const skillIndex = this.data.portfolio.skills.findIndex(skill => skill.id === skillId);
        if (skillIndex !== -1) {
            this.data.portfolio.skills[skillIndex] = {
                ...this.data.portfolio.skills[skillIndex],
                ...updateData
            };
            await this.saveDatabase();
            return this.data.portfolio.skills[skillIndex];
        }
        return null;
    }

    async deleteSkill(skillId) {
        if (!this.data) await this.loadDatabase();
        
        const skillIndex = this.data.portfolio.skills.findIndex(skill => skill.id === skillId);
        if (skillIndex !== -1) {
            const deletedSkill = this.data.portfolio.skills.splice(skillIndex, 1)[0];
            await this.saveDatabase();
            return deletedSkill;
        }
        return null;
    }

    // Portfolio Experience Operations
    async getExperience() {
        return this.data?.portfolio?.experience || [];
    }

    async addExperience(expData) {
        if (!this.data) await this.loadDatabase();
        
        const newExp = {
            id: Date.now().toString(),
            ...expData,
            createdAt: new Date().toISOString()
        };
        
        this.data.portfolio.experience.push(newExp);
        await this.saveDatabase();
        return newExp;
    }

    async updateExperience(expId, updateData) {
        if (!this.data) await this.loadDatabase();
        
        const expIndex = this.data.portfolio.experience.findIndex(exp => exp.id === expId);
        if (expIndex !== -1) {
            this.data.portfolio.experience[expIndex] = {
                ...this.data.portfolio.experience[expIndex],
                ...updateData
            };
            await this.saveDatabase();
            return this.data.portfolio.experience[expIndex];
        }
        return null;
    }

    async deleteExperience(expId) {
        if (!this.data) await this.loadDatabase();
        
        const expIndex = this.data.portfolio.experience.findIndex(exp => exp.id === expId);
        if (expIndex !== -1) {
            const deletedExp = this.data.portfolio.experience.splice(expIndex, 1)[0];
            await this.saveDatabase();
            return deletedExp;
        }
        return null;
    }

    // Portfolio Projects Operations
    async getProjects() {
        return this.data?.portfolio?.projects || [];
    }

    async addProject(projectData) {
        if (!this.data) await this.loadDatabase();
        
        const newProject = {
            id: Date.now().toString(),
            ...projectData,
            createdAt: new Date().toISOString()
        };
        
        this.data.portfolio.projects.push(newProject);
        await this.saveDatabase();
        return newProject;
    }

    async updateProject(projectId, updateData) {
        if (!this.data) await this.loadDatabase();
        
        const projectIndex = this.data.portfolio.projects.findIndex(project => project.id === projectId);
        if (projectIndex !== -1) {
            this.data.portfolio.projects[projectIndex] = {
                ...this.data.portfolio.projects[projectIndex],
                ...updateData
            };
            await this.saveDatabase();
            return this.data.portfolio.projects[projectIndex];
        }
        return null;
    }

    async deleteProject(projectId) {
        if (!this.data) await this.loadDatabase();
        
        const projectIndex = this.data.portfolio.projects.findIndex(project => project.id === projectId);
        if (projectIndex !== -1) {
            const deletedProject = this.data.portfolio.projects.splice(projectIndex, 1)[0];
            await this.saveDatabase();
            return deletedProject;
        }
        return null;
    }

    // CV Operations
    async getCV() {
        return this.data?.portfolio?.cv || {
            education: [],
            certifications: [],
            languages: [],
            references: []
        };
    }

    async updateCV(cvData) {
        if (!this.data) await this.loadDatabase();
        
        this.data.portfolio.cv = {
            ...this.data.portfolio.cv,
            ...cvData,
            updatedAt: new Date().toISOString()
        };
        
        await this.saveDatabase();
        return this.data.portfolio.cv;
    }

    // Utility Methods
    async exportData() {
        if (!this.data) await this.loadDatabase();
        return JSON.stringify(this.data, null, 2);
    }

    async importData(jsonData) {
        try {
            const importedData = JSON.parse(jsonData);
            if (this.validateData(importedData)) {
                this.data = importedData;
                await this.saveDatabase();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Import failed:', error);
            return false;
        }
    }

    validateData(data) {
        return data && 
               typeof data === 'object' &&
               Array.isArray(data.blogs) &&
               data.portfolio &&
               typeof data.portfolio === 'object';
    }

    // Statistics
    async getStats() {
        if (!this.data) await this.loadDatabase();
        
        return {
            totalBlogs: this.data.blogs.length,
            publishedBlogs: this.data.blogs.filter(blog => blog.status === 'published').length,
            draftBlogs: this.data.blogs.filter(blog => blog.status === 'draft').length,
            totalSkills: this.data.portfolio.skills.length,
            totalExperience: this.data.portfolio.experience.length,
            totalProjects: this.data.portfolio.projects.length
        };
    }
}

// Initialize database instance
const blogPortfolioDB = new BlogPortfolioDB();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlogPortfolioDB;
}
