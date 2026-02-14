const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Blog Routes

// Get all blogs
router.get('/blogs', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM blogs ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ error: 'Failed to fetch blogs' });
    }
});

// Create new blog
router.post('/blogs', async (req, res) => {
    try {
        const { title, category, excerpt, content, tags, featured_image, status, created_by, created_by_name } = req.body;
        const id = Date.now().toString();
        
        const [result] = await pool.query(
            'INSERT INTO blogs (id, title, category, excerpt, content, tags, featured_image, status, created_by, created_by_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, title, category || 'other', excerpt, content, JSON.stringify(tags || []), featured_image, status || 'draft', created_by || 'anonymous', created_by_name || 'Anonymous']
        );
        
        res.json({ id, ...req.body, created_at: new Date().toISOString() });
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({ error: 'Failed to create blog' });
    }
});

// Update blog
router.put('/blogs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, excerpt, content, tags, featured_image, status } = req.body;
        
        // First check if blog exists and get ownership info
        const [blogRows] = await pool.query('SELECT created_by FROM blogs WHERE id = ?', [id]);
        if (blogRows.length === 0) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        
        const blog = blogRows[0];
        
        // Check if user can manage this blog (demo mode allows all)
        const userId = req.headers['x-user-id'];
        if (userId && blog.created_by !== userId && blog.created_by !== 'anonymous') {
            return res.status(403).json({ error: 'You do not have permission to edit this blog' });
        }
        
        const [result] = await pool.query(
            'UPDATE blogs SET title = ?, category = ?, excerpt = ?, content = ?, tags = ?, featured_image = ?, status = ? WHERE id = ?',
            [title, category, excerpt, content, JSON.stringify(tags), featured_image, status, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        
        res.json({ id, ...req.body, updated_at: new Date().toISOString() });
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).json({ error: 'Failed to update blog' });
    }
});

// Delete blog
router.delete('/blogs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // First check if blog exists and get ownership info
        const [blogRows] = await pool.query('SELECT created_by FROM blogs WHERE id = ?', [id]);
        if (blogRows.length === 0) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        
        const blog = blogRows[0];
        
        // Check if user can manage this blog (demo mode allows all)
        const userId = req.headers['x-user-id'];
        if (userId && blog.created_by !== userId && blog.created_by !== 'anonymous') {
            return res.status(403).json({ error: 'You do not have permission to delete this blog' });
        }
        
        const [result] = await pool.query('DELETE FROM blogs WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        
        res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({ error: 'Failed to delete blog' });
    }
});

// Get single blog
router.get('/blogs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [rows] = await pool.query('SELECT * FROM blogs WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        
        // Increment views
        await pool.query('UPDATE blogs SET views = views + 1 WHERE id = ?', [id]);
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).json({ error: 'Failed to fetch blog' });
    }
});

// Portfolio Routes

// Get profile
router.get('/portfolio/profile', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM portfolio_profile WHERE id = 1');
        res.json(rows[0] || {});
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Update profile
router.put('/portfolio/profile', async (req, res) => {
    try {
        const profileData = req.body;
        
        await pool.query(
            'INSERT INTO portfolio_profile (id, name, title, bio, email, phone, location, website, avatar) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = ?, title = ?, bio = ?, email = ?, phone = ?, location = ?, website = ?, avatar = ?',
            [profileData.name, profileData.title, profileData.bio, profileData.email, profileData.phone, profileData.location, profileData.website, profileData.avatar, profileData.name, profileData.title, profileData.bio, profileData.email, profileData.phone, profileData.location, profileData.website, profileData.avatar]
        );
        
        res.json({ ...profileData, updated_at: new Date().toISOString() });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Get skills
router.get('/portfolio/skills', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM portfolio_skills ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching skills:', error);
        res.status(500).json({ error: 'Failed to fetch skills' });
    }
});

// Create skill
router.post('/portfolio/skills', async (req, res) => {
    try {
        const { name, level, category, description } = req.body;
        const id = Date.now().toString();
        
        const [result] = await pool.query(
            'INSERT INTO portfolio_skills (id, name, level, category, description) VALUES (?, ?, ?, ?, ?)',
            [id, name, level || 'beginner', category, description]
        );
        
        res.json({ id, ...req.body, created_at: new Date().toISOString() });
    } catch (error) {
        console.error('Error creating skill:', error);
        res.status(500).json({ error: 'Failed to create skill' });
    }
});

// Update skill
router.put('/portfolio/skills/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, level, category, description } = req.body;
        
        const [result] = await pool.query(
            'UPDATE portfolio_skills SET name = ?, level = ?, category = ?, description = ? WHERE id = ?',
            [name, level, category, description, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Skill not found' });
        }
        
        res.json({ id, ...req.body, updated_at: new Date().toISOString() });
    } catch (error) {
        console.error('Error updating skill:', error);
        res.status(500).json({ error: 'Failed to update skill' });
    }
});

// Delete skill
router.delete('/portfolio/skills/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await pool.query('DELETE FROM portfolio_skills WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Skill not found' });
        }
        
        res.json({ message: 'Skill deleted successfully' });
    } catch (error) {
        console.error('Error deleting skill:', error);
        res.status(500).json({ error: 'Failed to delete skill' });
    }
});

// Get experience
router.get('/portfolio/experience', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM portfolio_experience ORDER BY start_date DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching experience:', error);
        res.status(500).json({ error: 'Failed to fetch experience' });
    }
});

// Create experience
router.post('/portfolio/experience', async (req, res) => {
    try {
        const { company, position, start_date, end_date, description } = req.body;
        const id = Date.now().toString();
        
        const [result] = await pool.query(
            'INSERT INTO portfolio_experience (id, company, position, start_date, end_date, description) VALUES (?, ?, ?, ?, ?, ?)',
            [id, company, position, start_date, end_date, description]
        );
        
        res.json({ id, ...req.body, created_at: new Date().toISOString() });
    } catch (error) {
        console.error('Error creating experience:', error);
        res.status(500).json({ error: 'Failed to create experience' });
    }
});

// Update experience
router.put('/portfolio/experience/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { company, position, start_date, end_date, description } = req.body;
        
        const [result] = await pool.query(
            'UPDATE portfolio_experience SET company = ?, position = ?, start_date = ?, end_date = ?, description = ? WHERE id = ?',
            [company, position, start_date, end_date, description, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Experience not found' });
        }
        
        res.json({ id, ...req.body, updated_at: new Date().toISOString() });
    } catch (error) {
        console.error('Error updating experience:', error);
        res.status(500).json({ error: 'Failed to update experience' });
    }
});

// Delete experience
router.delete('/portfolio/experience/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await pool.query('DELETE FROM portfolio_experience WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Experience not found' });
        }
        
        res.json({ message: 'Experience deleted successfully' });
    } catch (error) {
        console.error('Error deleting experience:', error);
        res.status(500).json({ error: 'Failed to delete experience' });
    }
});

// Get projects
router.get('/portfolio/projects', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM portfolio_projects ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// Create project
router.post('/portfolio/projects', async (req, res) => {
    try {
        const { name, description, technologies, link, image, status } = req.body;
        const id = Date.now().toString();
        
        const [result] = await pool.query(
            'INSERT INTO portfolio_projects (id, name, description, technologies, link, image, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, name, description, technologies, link, image, status || 'active']
        );
        
        res.json({ id, ...req.body, created_at: new Date().toISOString() });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// Update project
router.put('/portfolio/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, technologies, link, image, status } = req.body;
        
        const [result] = await pool.query(
            'UPDATE portfolio_projects SET name = ?, description = ?, technologies = ?, link = ?, image = ?, status = ? WHERE id = ?',
            [name, description, technologies, link, image, status, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        res.json({ id, ...req.body, updated_at: new Date().toISOString() });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

// Delete project
router.delete('/portfolio/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await pool.query('DELETE FROM portfolio_projects WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// Get CV
router.get('/portfolio/cv', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM portfolio_cv WHERE id = 1');
        res.json(rows[0] || {});
    } catch (error) {
        console.error('Error fetching CV:', error);
        res.status(500).json({ error: 'Failed to fetch CV' });
    }
});

// Update CV
router.put('/portfolio/cv', async (req, res) => {
    try {
        const cvData = req.body;
        
        await pool.query(
            'INSERT INTO portfolio_cv (id, education, certifications, languages, references, summary) VALUES (1, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE education = ?, certifications = ?, languages = ?, references = ?, summary = ?',
            [JSON.stringify(cvData.education || []), JSON.stringify(cvData.certifications || []), JSON.stringify(cvData.languages || []), JSON.stringify(cvData.references || []), cvData.summary, JSON.stringify(cvData.education || []), JSON.stringify(cvData.certifications || []), JSON.stringify(cvData.languages || []), JSON.stringify(cvData.references || []), cvData.summary]
        );
        
        res.json({ ...cvData, updated_at: new Date().toISOString() });
    } catch (error) {
        console.error('Error updating CV:', error);
        res.status(500).json({ error: 'Failed to update CV' });
    }
});

// Stats endpoint
router.get('/stats', async (req, res) => {
    try {
        const [blogCount] = await pool.query('SELECT COUNT(*) as count FROM blogs');
        const [publishedCount] = await pool.query('SELECT COUNT(*) as count FROM blogs WHERE status = "published"');
        const [skillCount] = await pool.query('SELECT COUNT(*) as count FROM portfolio_skills');
        const [expCount] = await pool.query('SELECT COUNT(*) as count FROM portfolio_experience');
        const [projectCount] = await pool.query('SELECT COUNT(*) as count FROM portfolio_projects');
        
        res.json({
            totalBlogs: blogCount[0].count,
            publishedBlogs: publishedCount[0].count,
            draftBlogs: blogCount[0].count - publishedCount[0].count,
            totalSkills: skillCount[0].count,
            totalExperience: expCount[0].count,
            totalProjects: projectCount[0].count
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

module.exports = router;
