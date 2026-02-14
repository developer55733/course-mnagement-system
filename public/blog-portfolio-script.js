// Blog and Portfolio Management JavaScript - MySQL API Version

// API Configuration
const API_BASE = window.location.origin + '/api';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('Initializing blog and portfolio system...');
        
        // Test API connection
        await testAPIConnection();
        
        // Load data
        await loadBlogPosts();
        await loadPortfolioData();
        updateBlogStats();
        updatePortfolioStats();
        
        console.log('Blog and portfolio system initialized successfully');
    } catch (error) {
        console.error('Failed to initialize application:', error);
        // Fallback to empty state
        initializeEmptyState();
    }
});

// Test API connection
async function testAPIConnection() {
    try {
        const response = await fetch(`${API_BASE}/health`);
        if (!response.ok) {
            throw new Error('API not responding');
        }
        console.log('API connection successful');
        return true;
    } catch (error) {
        console.error('API connection failed:', error);
        throw error;
    }
}

// Fallback initialization
function initializeEmptyState() {
    console.log('Using empty state fallback');
    displayEmptyBlogPosts();
    displayEmptyPortfolio();
}

// Blog Management Functions
async function showCreateForm() {
    const formContainer = document.getElementById('blog-form-container');
    const toggleBtn = document.getElementById('toggle-blog-form');
    
    if (formContainer.style.display === 'none' || formContainer.style.display === '') {
        formContainer.style.display = 'block';
        toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Hide Form';
    } else {
        formContainer.style.display = 'none';
        toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Show Form';
    }
}

function toggleBlogForm() {
    showCreateForm();
}

function clearBlogForm() {
    document.getElementById('create-blog-form').reset();
}

// Fallback functions
function displayEmptyBlogPosts() {
    const postsGrid = document.getElementById('blog-posts-grid');
    if (postsGrid) {
        postsGrid.innerHTML = `
            <div class="no-posts-message">
                <i class="fas fa-newspaper"></i>
                <h3>No blog posts yet</h3>
                <p>Start creating amazing content to share with the world!</p>
                <button class="btn btn-primary" onclick="showCreateForm()">
                    <i class="fas fa-plus"></i> Create Your First Post
                </button>
            </div>
        `;
    }
}

function displayEmptyPortfolio() {
    // Initialize portfolio sections with empty state
    const skillsGrid = document.getElementById('skills-grid');
    const experienceTimeline = document.getElementById('experience-timeline');
    const projectsGrid = document.getElementById('projects-grid');
    
    if (skillsGrid) {
        skillsGrid.innerHTML = `
            <div class="no-skills-message">
                <i class="fas fa-cogs"></i>
                <h3>No skills added yet</h3>
                <p>Add your skills to showcase your expertise!</p>
            </div>
        `;
    }
    
    if (experienceTimeline) {
        experienceTimeline.innerHTML = `
            <div class="no-experience-message">
                <i class="fas fa-briefcase"></i>
                <h3>No experience added yet</h3>
                <p>Add your work experience to build your professional profile!</p>
            </div>
        `;
    }
    
    if (projectsGrid) {
        projectsGrid.innerHTML = `
            <div class="no-projects-message">
                <i class="fas fa-project-diagram"></i>
                <h3>No projects added yet</h3>
                <p>Showcase your amazing work to potential employers!</p>
            </div>
        `;
    }
}

async function saveDraft() {
    try {
        const form = document.getElementById('create-blog-form');
        if (!form) {
            showMessage('blog-message', 'Form not found', 'error');
            return;
        }
        
        const formData = new FormData(form);
        const draftData = {
            title: formData.get('blog-title') || '',
            category: formData.get('blog-category') || '',
            excerpt: formData.get('blog-excerpt') || '',
            content: formData.get('blog-content') || '',
            tags: formData.get('blog-tags') ? formData.get('blog-tags').split(',').map(tag => tag.trim()) : [],
            featured_image: formData.get('blog-featured-image') || '',
            status: 'draft'
        };
        
        if (!draftData.title || !draftData.content) {
            showMessage('blog-message', 'Please fill in at least title and content', 'error');
            return;
        }
        
        // Save to MySQL via API
        const response = await fetch(`${API_BASE}/blogs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(draftData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save draft');
        }
        
        showMessage('blog-message', 'Draft saved successfully!', 'success');
        await loadBlogPosts();
    } catch (error) {
        console.error('Error saving draft:', error);
        showMessage('blog-message', 'Failed to save draft. Please try again.', 'error');
    }
}

async function createBlogPost(e) {
    e.preventDefault();
    
    try {
        // Get current user info
        let currentUser = null;
        if (window.sessionManager && window.sessionManager.isLoggedIn()) {
            currentUser = window.sessionManager.getCurrentUser();
        }
        
        const formData = new FormData(e.target);
        const blogPost = {
            title: formData.get('blog-title') || '',
            category: formData.get('blog-category') || '',
            excerpt: formData.get('blog-excerpt') || '',
            content: formData.get('blog-content') || '',
            tags: formData.get('blog-tags') ? formData.get('blog-tags').split(',').map(tag => tag.trim()) : [],
            featured_image: formData.get('blog-featured-image') || '',
            status: 'published',
            created_by: currentUser ? currentUser.id : 'anonymous',
            created_by_name: currentUser ? currentUser.name : 'Anonymous'
        };
        
        if (!blogPost.title || !blogPost.content) {
            if (window.notifications) {
                window.notifications.warning('Please fill in at least title and content');
            } else {
                showMessage('blog-message', 'Please fill in at least title and content', 'error');
            }
            return;
        }
        
        // Save to MySQL via API
        const response = await fetch(`${API_BASE}/blogs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(blogPost)
        });
        
        if (!response.ok) {
            throw new Error('Failed to publish blog post');
        }
        
        // Update stats
        updateBlogStats();
        
        // Display posts
        await displayBlogPosts();
        
        // Clear form
        e.target.reset();
        
        showMessage('blog-message', 'Blog post published successfully!', 'success');
    } catch (error) {
        console.error('Error creating blog post:', error);
        showMessage('blog-message', 'Failed to publish blog post. Please try again.', 'error');
    }
}

async function displayBlogPosts() {
    try {
        const postsGrid = document.getElementById('blog-posts-grid');
        if (!postsGrid) {
            console.error('Blog posts grid not found');
            return;
        }
        
        // Fetch blogs from MySQL API
        const response = await fetch(`${API_BASE}/blogs`);
        if (!response.ok) {
            throw new Error('Failed to fetch blog posts');
        }
        
        const posts = await response.json();
        
        if (posts.length === 0) {
            displayEmptyBlogPosts();
            return;
        }
        
        postsGrid.innerHTML = posts.map(post => {
            // Check if current user can manage this blog
            const canManage = canCurrentUserManageBlog(post);
            
            return `
            <div class="blog-post-card">
                <div class="blog-post-header">
                    <h4>${post.title || 'Untitled'}</h4>
                    <div class="blog-post-meta">
                        <span class="blog-category">${post.category || 'Uncategorized'}</span>
                        <span class="blog-date">${new Date(post.created_at).toLocaleDateString()}</span>
                        <span class="blog-status ${post.status}">${post.status || 'draft'}</span>
                        ${post.created_by_name ? `<span class="blog-author">By ${post.created_by_name}</span>` : ''}
                    </div>
                </div>
                ${post.featured_image ? `<img src="${post.featured_image}" alt="${post.title}" class="blog-post-image">` : ''}
                <div class="blog-post-excerpt">${post.excerpt || (post.content ? post.content.substring(0, 150) + '...' : 'No excerpt available')}</div>
                <div class="blog-post-footer">
                    <div class="blog-post-stats">
                        <span><i class="fas fa-eye"></i> ${post.views || 0}</span>
                        <span><i class="fas fa-heart"></i> ${post.likes || 0}</span>
                    </div>
                    ${canManage ? `
                    <div class="blog-post-actions">
                        <button class="btn btn-primary" onclick="editBlogPost('${post.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-outline" onclick="deleteBlogPost('${post.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        }).join('');
    } catch (error) {
        console.error('Error displaying blog posts:', error);
        displayEmptyBlogPosts();
    }
}

// Check if current user can manage a blog
function canCurrentUserManageBlog(blog) {
    // Get current user info
    let currentUser = null;
    if (window.sessionManager && window.sessionManager.isLoggedIn()) {
        currentUser = window.sessionManager.getCurrentUser();
    }
    
    // If no user is logged in (demo mode), allow all
    if (!currentUser) return true;
    
    // User can manage if they created the blog
    return blog.created_by === currentUser.id || blog.created_by === 'anonymous';
}

async function updateBlogStats() {
    try {
        const response = await fetch(`${API_BASE}/stats`);
        if (!response.ok) {
            throw new Error('Failed to fetch stats');
        }
        
        const stats = await response.json();
        
        const totalPostsEl = document.getElementById('total-posts');
        const totalViewsEl = document.getElementById('total-views');
        const totalLikesEl = document.getElementById('total-likes');
        
        if (totalPostsEl) totalPostsEl.textContent = stats.totalBlogs || 0;
        if (totalViewsEl) totalViewsEl.textContent = '0'; // Would need to track views in DB
        if (totalLikesEl) totalLikesEl.textContent = '0'; // Would need to track likes in DB
    } catch (error) {
        console.error('Error updating blog stats:', error);
        
        // Set default values
        const totalPostsEl = document.getElementById('total-posts');
        const totalViewsEl = document.getElementById('total-views');
        const totalLikesEl = document.getElementById('total-likes');
        
        if (totalPostsEl) totalPostsEl.textContent = '0';
        if (totalViewsEl) totalViewsEl.textContent = '0';
        if (totalLikesEl) totalLikesEl.textContent = '0';
    }
}

async function loadBlogPosts() {
    await displayBlogPosts();
}

// Message display function
function showMessage(elementId, message, type = 'info') {
    const messageEl = document.getElementById(elementId);
    if (!messageEl) {
        console.error(`Message element ${elementId} not found`);
        return;
    }
    
    messageEl.innerHTML = `
        <div class="alert alert-${type}">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        </div>
    `;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageEl.innerHTML = '';
    }, 5000);
}

// Portfolio Functions
async function loadPortfolioData() {
    try {
        await loadProfile();
        await loadSkills();
        await loadExperience();
        await loadProjects();
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        displayEmptyPortfolio();
    }
}

async function loadProfile() {
    try {
        const response = await fetch(`${API_BASE}/portfolio/profile`);
        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }
        
        const profile = await response.json();
        
        // Update profile display
        const nameEl = document.getElementById('profile-name-display');
        const titleEl = document.getElementById('profile-title-display');
        const bioEl = document.getElementById('profile-bio-display');
        const emailEl = document.getElementById('profile-email-display');
        const phoneEl = document.getElementById('profile-phone-display');
        const locationEl = document.getElementById('profile-location-display');
        
        if (nameEl) nameEl.textContent = profile.name || 'Your Name';
        if (titleEl) titleEl.textContent = profile.title || 'Professional Title';
        if (bioEl) bioEl.textContent = profile.bio || 'Your professional bio and description goes here...';
        if (emailEl) emailEl.textContent = profile.email || 'email@example.com';
        if (phoneEl) phoneEl.textContent = profile.phone || '+1234567890';
        if (locationEl) locationEl.textContent = profile.location || 'City, Country';
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function loadSkills() {
    try {
        const response = await fetch(`${API_BASE}/portfolio/skills`);
        if (!response.ok) {
            throw new Error('Failed to fetch skills');
        }
        
        const skills = await response.json();
        const skillsGrid = document.getElementById('skills-grid');
        
        if (!skillsGrid) return;
        
        if (skills.length === 0) {
            skillsGrid.innerHTML = `
                <div class="no-skills-message">
                    <i class="fas fa-cogs"></i>
                    <h3>No skills added yet</h3>
                    <p>Add your skills to showcase your expertise!</p>
                </div>
            `;
            return;
        }
        
        skillsGrid.innerHTML = skills.map(skill => `
            <div class="skill-item">
                <div class="skill-info">
                    <h4>${skill.name || 'Unknown Skill'}</h4>
                    <span class="skill-level ${skill.level || 'beginner'}">${skill.level || 'Beginner'}</span>
                </div>
                <div class="skill-description">${skill.description || 'No description available'}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading skills:', error);
    }
}

async function loadExperience() {
    try {
        const response = await fetch(`${API_BASE}/portfolio/experience`);
        if (!response.ok) {
            throw new Error('Failed to fetch experience');
        }
        
        const experience = await response.json();
        const experienceTimeline = document.getElementById('experience-timeline');
        
        if (!experienceTimeline) return;
        
        if (experience.length === 0) {
            experienceTimeline.innerHTML = `
                <div class="no-experience-message">
                    <i class="fas fa-briefcase"></i>
                    <h3>No experience added yet</h3>
                    <p>Add your work experience to build your professional profile!</p>
                </div>
            `;
            return;
        }
        
        experienceTimeline.innerHTML = experience.map(exp => `
            <div class="experience-item">
                <div class="experience-header">
                    <h4>${exp.position || 'Position'}</h4>
                    <div class="experience-dates">${exp.start_date || 'Start'} - ${exp.end_date || 'Present'}</div>
                </div>
                <div class="experience-company">${exp.company || 'Company'}</div>
                <div class="experience-description">${exp.description || 'No description available'}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading experience:', error);
    }
}

async function loadProjects() {
    try {
        const response = await fetch(`${API_BASE}/portfolio/projects`);
        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }
        
        const projects = await response.json();
        const projectsGrid = document.getElementById('projects-grid');
        
        if (!projectsGrid) return;
        
        if (projects.length === 0) {
            projectsGrid.innerHTML = `
                <div class="no-projects-message">
                    <i class="fas fa-project-diagram"></i>
                    <h3>No projects added yet</h3>
                    <p>Showcase your amazing work to potential employers!</p>
                </div>
            `;
            return;
        }
        
        projectsGrid.innerHTML = projects.map(project => `
            <div class="project-item">
                <div class="project-header">
                    <h4>${project.name || 'Project Name'}</h4>
                </div>
                ${project.image ? `<img src="${project.image}" alt="${project.name}" class="project-image">` : ''}
                <div class="project-description">${project.description || 'No description available'}</div>
                <div class="project-tech">${project.technologies || 'Technologies'}</div>
                ${project.link ? `<div class="project-link"><a href="${project.link}" target="_blank">View Project</a></div>` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

function updatePortfolioStats() {
    // Update portfolio statistics if needed
    console.log('Portfolio stats updated');
}

// Edit and Delete functions
async function editBlogPost(postId) {
    try {
        // Get current user info
        let currentUser = null;
        if (window.sessionManager && window.sessionManager.isLoggedIn()) {
            currentUser = window.sessionManager.getCurrentUser();
        }
        
        // Fetch blog post data
        const response = await fetch(`${API_BASE}/blogs/${postId}`);
        if (!response.ok) {
            throw new Error('Failed to load blog post');
        }
        
        const post = await response.json();
        
        // Check if current user can manage this blog
        if (!canCurrentUserManageBlog(post)) {
            if (window.notifications) {
                window.notifications.error('You do not have permission to edit this blog');
            } else {
                alert('You do not have permission to edit this blog');
            }
            return;
        }
        
        // Populate form with post data
        const titleEl = document.getElementById('blog-title');
        const categoryEl = document.getElementById('blog-category');
        const excerptEl = document.getElementById('blog-excerpt');
        const contentEl = document.getElementById('blog-content');
        const tagsEl = document.getElementById('blog-tags');
        const imageEl = document.getElementById('blog-featured-image');
        
        if (titleEl) titleEl.value = post.title || '';
        if (categoryEl) categoryEl.value = post.category || '';
        if (excerptEl) excerptEl.value = post.excerpt || '';
        if (contentEl) contentEl.value = post.content || '';
        if (tagsEl) tagsEl.value = post.tags ? post.tags.join(', ') : '';
        if (imageEl) imageEl.value = post.featured_image || '';
        
        // Show form
        showCreateForm();
        
        // Change submit button to update
        const form = document.getElementById('create-blog-form');
        if (form) {
            form.onsubmit = function(e) {
                e.preventDefault();
                updateBlogPost(postId);
            };
        }
    } catch (error) {
        console.error('Error editing blog post:', error);
        showMessage('blog-message', 'Failed to load blog post for editing', 'error');
    }
}

async function updateBlogPost(postId) {
    try {
        // Get current user info
        let currentUser = null;
        if (window.sessionManager && window.sessionManager.isLoggedIn()) {
            currentUser = window.sessionManager.getCurrentUser();
        }
        
        const form = document.getElementById('create-blog-form');
        const formData = new FormData(form);
        
        const updateData = {
            title: formData.get('blog-title') || '',
            category: formData.get('blog-category') || '',
            excerpt: formData.get('blog-excerpt') || '',
            content: formData.get('blog-content') || '',
            tags: formData.get('blog-tags') ? formData.get('blog-tags').split(',').map(tag => tag.trim()) : [],
            featured_image: formData.get('blog-featured-image') || ''
        };
        
        const headers = {
            'Content-Type': 'application/json',
        };
        
        // Add user ID header if user is logged in
        if (currentUser) {
            headers['x-user-id'] = currentUser.id.toString();
        }
        
        const response = await fetch(`${API_BASE}/blogs/${postId}`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update blog post');
        }
        
        showMessage('blog-message', 'Blog post updated successfully!', 'success');
        await loadBlogPosts();
        
        // Reset form to original state
        form.onsubmit = createBlogPost;
        form.reset();
    } catch (error) {
        console.error('Error updating blog post:', error);
        showMessage('blog-message', 'Failed to update blog post', 'error');
    }
}

async function deleteBlogPost(postId) {
    try {
        // Get current user info
        let currentUser = null;
        if (window.sessionManager && window.sessionManager.isLoggedIn()) {
            currentUser = window.sessionManager.getCurrentUser();
        }
        
        // First fetch the blog to check permissions
        const response = await fetch(`${API_BASE}/blogs/${postId}`);
        if (!response.ok) {
            throw new Error('Failed to load blog post');
        }
        
        const post = await response.json();
        
        // Check if current user can manage this blog
        if (!canCurrentUserManageBlog(post)) {
            if (window.notifications) {
                window.notifications.error('You do not have permission to delete this blog');
            } else {
                alert('You do not have permission to delete this blog');
            }
            return;
        }
        
        // Show confirmation dialog
        const confirmed = await new Promise((resolve) => {
            if (window.notifications) {
                window.notifications.confirm('Are you sure you want to delete this blog post?').then(resolve);
            } else {
                resolve(confirm('Are you sure you want to delete this blog post?'));
            }
        });
        
        if (!confirmed) return;
        
        // Prepare headers
        const headers = {};
        
        // Add user ID header if user is logged in
        if (currentUser) {
            headers['x-user-id'] = currentUser.id.toString();
        }
        
        // Proceed with deletion
        const deleteResponse = await fetch(`${API_BASE}/blogs/${postId}`, {
            method: 'DELETE',
            headers: headers
        });
        
        if (!deleteResponse.ok) {
            throw new Error('Failed to delete blog post');
        }
        
        if (window.notifications) {
            window.notifications.success('Blog post deleted successfully!');
        } else {
            showMessage('blog-message', 'Blog post deleted successfully!', 'success');
        }
        await loadBlogPosts();
    } catch (error) {
        console.error('Error deleting blog post:', error);
        if (window.notifications) {
            window.notifications.error('Failed to delete blog post');
        } else {
            showMessage('blog-message', 'Failed to delete blog post', 'error');
        }
    }
}

// Additional portfolio functions can be added here as needed

// Portfolio Form Functions
function showAddSkillForm() {
    const formContainer = document.getElementById('skills-form-container');
    if (formContainer) {
        formContainer.style.display = 'block';
    }
}

function hideSkillForm() {
    const formContainer = document.getElementById('skills-form-container');
    if (formContainer) {
        formContainer.style.display = 'none';
    }
}

async function addSkill(event) {
    event.preventDefault();
    
    try {
        const form = document.getElementById('add-skill-form');
        const formData = new FormData(form);
        
        const skillData = {
            name: formData.get('skill-name') || '',
            level: formData.get('skill-level') || 'beginner',
            category: formData.get('skill-category') || '',
            description: formData.get('skill-description') || ''
        };
        
        if (!skillData.name) {
            showMessage('portfolio-message', 'Please enter skill name', 'error');
            return;
        }
        
        const response = await fetch(`${API_BASE}/portfolio/skills`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(skillData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to add skill');
        }
        
        showMessage('portfolio-message', 'Skill added successfully!', 'success');
        await loadSkills();
        form.reset();
        hideSkillForm();
    } catch (error) {
        console.error('Error adding skill:', error);
        showMessage('portfolio-message', 'Failed to add skill', 'error');
    }
}

function showAddExperienceForm() {
    const formContainer = document.getElementById('experience-form-container');
    if (formContainer) {
        formContainer.style.display = 'block';
    }
}

function hideExperienceForm() {
    const formContainer = document.getElementById('experience-form-container');
    if (formContainer) {
        formContainer.style.display = 'none';
    }
}

async function addExperience(event) {
    event.preventDefault();
    
    try {
        const form = document.getElementById('add-experience-form');
        const formData = new FormData(form);
        
        const experienceData = {
            company: formData.get('exp-company') || '',
            position: formData.get('exp-position') || '',
            start_date: formData.get('exp-start-date') || '',
            end_date: formData.get('exp-end-date') || '',
            description: formData.get('exp-description') || ''
        };
        
        if (!experienceData.company || !experienceData.position) {
            showMessage('portfolio-message', 'Please enter company and position', 'error');
            return;
        }
        
        const response = await fetch(`${API_BASE}/portfolio/experience`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(experienceData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to add experience');
        }
        
        showMessage('portfolio-message', 'Experience added successfully!', 'success');
        await loadExperience();
        form.reset();
        hideExperienceForm();
    } catch (error) {
        console.error('Error adding experience:', error);
        showMessage('portfolio-message', 'Failed to add experience', 'error');
    }
}

function showAddProjectForm() {
    const formContainer = document.getElementById('project-form-container');
    if (formContainer) {
        formContainer.style.display = 'block';
    }
}

function hideProjectForm() {
    const formContainer = document.getElementById('project-form-container');
    if (formContainer) {
        formContainer.style.display = 'none';
    }
}

async function addProject(event) {
    event.preventDefault();
    
    try {
        const form = document.getElementById('add-project-form');
        const formData = new FormData(form);
        
        const projectData = {
            name: formData.get('project-name') || '',
            description: formData.get('project-description') || '',
            technologies: formData.get('project-tech') || '',
            link: formData.get('project-link') || '',
            image: formData.get('project-image') || ''
        };
        
        if (!projectData.name || !projectData.description) {
            showMessage('portfolio-message', 'Please enter project name and description', 'error');
            return;
        }
        
        const response = await fetch(`${API_BASE}/portfolio/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(projectData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to add project');
        }
        
        showMessage('portfolio-message', 'Project added successfully!', 'success');
        await loadProjects();
        form.reset();
        hideProjectForm();
    } catch (error) {
        console.error('Error adding project:', error);
        showMessage('portfolio-message', 'Failed to add project', 'error');
    }
}

function showCVBuilder() {
    const formContainer = document.getElementById('cv-builder-container');
    if (formContainer) {
        formContainer.style.display = 'block';
        
        // Load existing CV data and profile data
        loadCVData();
        loadProfileDataForCV();
        updateCVPreview();
    }
}

async function loadCVData() {
    try {
        const response = await fetch(`${API_BASE}/portfolio/cv`);
        if (response.ok) {
            const cvData = await response.json();
            
            // Populate form fields with existing data
            const summaryField = document.getElementById('cv-summary');
            const educationField = document.getElementById('cv-education');
            const certificationsField = document.getElementById('cv-certifications');
            const languagesField = document.getElementById('cv-languages');
            const referencesField = document.getElementById('cv-references');
            
            if (summaryField) summaryField.value = cvData.summary || '';
            if (educationField) educationField.value = cvData.education ? cvData.education.join('\n') : '';
            if (certificationsField) certificationsField.value = cvData.certifications ? cvData.certifications.join('\n') : '';
            if (languagesField) languagesField.value = cvData.languages ? cvData.languages.join('\n') : '';
            if (referencesField) referencesField.value = cvData.references ? cvData.references.join('\n') : '';
        }
    } catch (error) {
        console.error('Error loading CV data:', error);
    }
}

async function loadProfileDataForCV() {
    try {
        const response = await fetch(`${API_BASE}/portfolio/profile`);
        if (response.ok) {
            const profile = await response.json();
            
            // Update CV preview with profile data
            const namePreview = document.getElementById('cv-name-preview');
            const titlePreview = document.getElementById('cv-title-preview');
            const emailPreview = document.getElementById('cv-email-preview');
            const phonePreview = document.getElementById('cv-phone-preview');
            const locationPreview = document.getElementById('cv-location-preview');
            
            if (namePreview) namePreview.textContent = profile.name || 'Your Name';
            if (titlePreview) titlePreview.textContent = profile.title || 'Professional Title';
            if (emailPreview) emailPreview.textContent = profile.email || 'email@example.com';
            if (phonePreview) phonePreview.textContent = profile.phone || '+1234567890';
            if (locationPreview) locationPreview.textContent = profile.location || 'City, Country';
        }
    } catch (error) {
        console.error('Error loading profile data for CV:', error);
    }
}

function hideCVBuilder() {
    const formContainer = document.getElementById('cv-builder-container');
    if (formContainer) {
        formContainer.style.display = 'none';
    }
}

function updateCVPreview() {
    // Update CV preview with form data and existing portfolio data
    const summary = document.getElementById('cv-summary')?.value || '';
    const education = document.getElementById('cv-education')?.value || '';
    const certifications = document.getElementById('cv-certifications')?.value || '';
    const languages = document.getElementById('cv-languages')?.value || '';
    const references = document.getElementById('cv-references')?.value || '';
    
    // Update summary preview
    const summaryPreview = document.getElementById('cv-summary-preview');
    if (summaryPreview) summaryPreview.textContent = summary || 'Your professional summary will appear here...';
    
    // Update education preview
    const educationPreview = document.getElementById('cv-education-preview');
    if (educationPreview) {
        if (education) {
            const educationLines = education.split('\n').filter(line => line.trim());
            educationPreview.innerHTML = educationLines.map(line => `<p>${line}</p>`).join('');
        } else {
            educationPreview.textContent = 'Education details will appear here...';
        }
    }
    
    // Load and display skills from portfolio
    loadSkillsForCV();
    
    // Load and display experience from portfolio
    loadExperienceForCV();
}

async function loadSkillsForCV() {
    try {
        const response = await fetch(`${API_BASE}/portfolio/skills`);
        if (response.ok) {
            const skills = await response.json();
            const skillsPreview = document.getElementById('cv-skills-preview');
            if (skillsPreview) {
                if (skills.length > 0) {
                    skillsPreview.innerHTML = skills.map(skill => 
                        `<div class="cv-skill-item">
                            <strong>${skill.name}</strong> - ${skill.level}
                            ${skill.description ? `<br><small>${skill.description}</small>` : ''}
                        </div>`
                    ).join('');
                } else {
                    skillsPreview.textContent = 'Skills will be listed here...';
                }
            }
        }
    } catch (error) {
        console.error('Error loading skills for CV:', error);
    }
}

async function loadExperienceForCV() {
    try {
        const response = await fetch(`${API_BASE}/portfolio/experience`);
        if (response.ok) {
            const experience = await response.json();
            const experiencePreview = document.getElementById('cv-experience-preview');
            if (experiencePreview) {
                if (experience.length > 0) {
                    experiencePreview.innerHTML = experience.map(exp => 
                        `<div class="cv-experience-item">
                            <strong>${exp.position}</strong> at ${exp.company}<br>
                            <small>${exp.start_date} - ${exp.end_date || 'Present'}</small><br>
                            ${exp.description}
                        </div>`
                    ).join('');
                } else {
                    experiencePreview.textContent = 'Experience will be listed here...';
                }
            }
        }
    } catch (error) {
        console.error('Error loading experience for CV:', error);
    }
}

async function saveCV(event) {
    event.preventDefault();
    
    try {
        const form = document.getElementById('cv-builder-form');
        const formData = new FormData(form);
        
        const cvData = {
            summary: formData.get('cv-summary') || '',
            education: formData.get('cv-education') ? formData.get('cv-education').split('\n').filter(line => line.trim()) : [],
            certifications: formData.get('cv-certifications') ? formData.get('cv-certifications').split('\n').filter(line => line.trim()) : [],
            languages: formData.get('cv-languages') ? formData.get('cv-languages').split('\n').filter(line => line.trim()) : [],
            references: formData.get('cv-references') ? formData.get('cv-references').split('\n').filter(line => line.trim()) : []
        };
        
        const response = await fetch(`${API_BASE}/portfolio/cv`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cvData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save CV');
        }
        
        showMessage('portfolio-message', 'CV saved successfully!', 'success');
        updateCVPreview();
    } catch (error) {
        console.error('Error saving CV:', error);
        showMessage('portfolio-message', 'Failed to save CV', 'error');
    }
}

function downloadCV() {
    // Generate and download CV as PDF
    const cvContent = generateCVContent();
    
    // Create a temporary blob and download
    const blob = new Blob([cvContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CV.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showMessage('portfolio-message', 'CV downloaded successfully!', 'success');
}

function printCV() {
    // Print CV with optimized styling
    const printContent = generateCVContent();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
    
    showMessage('portfolio-message', 'CV print dialog opened!', 'success');
}

function generateCVContent() {
    const namePreview = document.getElementById('cv-name-preview')?.textContent || 'Your Name';
    const titlePreview = document.getElementById('cv-title-preview')?.textContent || 'Professional Title';
    const emailPreview = document.getElementById('cv-email-preview')?.textContent || 'email@example.com';
    const phonePreview = document.getElementById('cv-phone-preview')?.textContent || '+1234567890';
    const locationPreview = document.getElementById('cv-location-preview')?.textContent || 'City, Country';
    const summaryPreview = document.getElementById('cv-summary-preview')?.textContent || '';
    const educationPreview = document.getElementById('cv-education-preview')?.innerHTML || '';
    const skillsPreview = document.getElementById('cv-skills-preview')?.innerHTML || '';
    const experiencePreview = document.getElementById('cv-experience-preview')?.innerHTML || '';
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>CV - ${namePreview}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                .cv-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .cv-header h1 { margin: 0; font-size: 2.5em; }
                .cv-header p { margin: 5px 0; color: #666; }
                .cv-section { margin-bottom: 30px; }
                .cv-section h3 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                .cv-skill-item, .cv-experience-item { margin-bottom: 10px; }
                @media print { body { margin: 20px; } }
            </style>
        </head>
        <body>
            <div class="cv-header">
                <h1>${namePreview}</h1>
                <p><strong>${titlePreview}</strong></p>
                <p>${emailPreview} | ${phonePreview} | ${locationPreview}</p>
            </div>
            
            <div class="cv-section">
                <h3>Professional Summary</h3>
                <p>${summaryPreview}</p>
            </div>
            
            <div class="cv-section">
                <h3>Skills</h3>
                ${skillsPreview}
            </div>
            
            <div class="cv-section">
                <h3>Experience</h3>
                ${experiencePreview}
            </div>
            
            <div class="cv-section">
                <h3>Education</h3>
                ${educationPreview}
            </div>
        </body>
        </html>
    `;
}

function uploadProfilePicture() {
    // Handle profile picture upload
    showMessage('portfolio-message', 'Profile picture upload feature coming soon!', 'info');
}

async function updateProfile(event) {
    event.preventDefault();
    
    try {
        const form = document.getElementById('edit-profile-form');
        const formData = new FormData(form);
        
        const profileData = {
            name: formData.get('profile-name') || '',
            title: formData.get('profile-title') || '',
            bio: formData.get('profile-bio') || '',
            email: formData.get('profile-email') || '',
            phone: formData.get('profile-phone') || '',
            location: formData.get('profile-location') || '',
            website: formData.get('profile-website') || ''
        };
        
        if (!profileData.name || !profileData.email) {
            showMessage('portfolio-message', 'Please enter name and email', 'error');
            return;
        }
        
        const response = await fetch(`${API_BASE}/portfolio/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update profile');
        }
        
        showMessage('portfolio-message', 'Profile updated successfully!', 'success');
        await loadProfile();
        form.reset();
        hideProfileForm();
    } catch (error) {
        console.error('Error updating profile:', error);
        showMessage('portfolio-message', 'Failed to update profile', 'error');
    }
}

function cancelProfileEdit() {
    const formContainer = document.getElementById('profile-form-container');
    if (formContainer) {
        formContainer.style.display = 'none';
    }
}

function generateCVContent() {
    const profile = portfolioData.profile;
    const skills = portfolioData.skills;
    const experience = portfolioData.experience;
    const projects = portfolioData.projects;
    const cv = portfolioData.cv || {};
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${profile.name} - Professional CV</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                .header { text-align: center; margin-bottom: 30px; }
                .name { font-size: 2.5em; font-weight: bold; margin: 0; }
                .title { font-size: 1.2em; color: #666; margin: 5px 0; }
                .contact { margin: 20px 0; }
                .section { margin: 30px 0; }
                .section h2 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                .skills { display: flex; flex-wrap: wrap; gap: 10px; }
                .skill { background: #f4f4f4; padding: 5px 10px; border-radius: 5px; }
                .experience { margin: 10px 0; }
                .job { background: #f9f9f9; padding: 15px; margin: 10px 0; border-left: 4px solid #333; }
                .projects { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .project { background: #f9f9f9; padding: 15px; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="name">${profile.name}</div>
                <div class="title">${profile.title}</div>
                <div class="contact">
                    ${profile.email} | ${profile.phone} | ${profile.location}
                </div>
            </div>
            
            <div class="section">
                <h2>Professional Summary</h2>
                <p>${cv.summary || 'Experienced professional with a proven track record...'}</p>
            </div>
            
            <div class="section">
                <h2>Skills</h2>
                <div class="skills">
                    ${skills.map(skill => `<span class="skill">${skill.name} (${skill.level})</span>`).join('')}
                </div>
            </div>
            
            <div class="section">
                <h2>Experience</h2>
                <div class="experience">
                    ${experience.map(exp => `
                        <div class="job">
                            <strong>${exp.position}</strong> at ${exp.company}<br>
                            <small>${exp.startDate} - ${exp.endDate || 'Present'}</small><br><br>
                            ${exp.description}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="section">
                <h2>Projects</h2>
                <div class="projects">
                    ${projects.map(project => `
                        <div class="project">
                            <strong>${project.name}</strong><br>
                            <em>Technologies: ${project.tech}</em><br><br>
                            ${project.description}
                            ${project.link ? `<br><a href="${project.link}" target="_blank">View Project</a>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        </body>
        </html>
    `;
}

function updatePortfolioDisplay() {
    // Update skills display
    const skillsGrid = document.getElementById('skills-grid');
    if (portfolioData.skills.length === 0) {
        skillsGrid.innerHTML = `
            <div class="no-skills-message">
                <i class="fas fa-cogs"></i>
                <h3>No skills added yet</h3>
                <p>Add your skills to showcase your expertise!</p>
                <button class="btn btn-primary" onclick="showAddSkillForm()">
                    <i class="fas fa-plus"></i> Add Your First Skill
                </button>
            </div>
        `;
    } else {
        skillsGrid.innerHTML = portfolioData.skills.map(skill => `
            <div class="skill-item">
                <div class="skill-info">
                    <h4>${skill.name}</h4>
                    <span class="skill-level ${skill.level}">${skill.level}</span>
                </div>
                <button class="btn btn-outline" onclick="removeSkill(${skill.id})">
                    <i class="fas fa-times"></i> Remove
                </button>
            </div>
        `).join('');
    }
    
    // Update experience display
    const experienceTimeline = document.getElementById('experience-timeline');
    if (portfolioData.experience.length === 0) {
        experienceTimeline.innerHTML = `
            <div class="no-experience-message">
                <i class="fas fa-briefcase"></i>
                <h3>No experience added yet</h3>
                <p>Add your work experience to build your professional profile!</p>
                <button class="btn btn-primary" onclick="showAddExperienceForm()">
                    <i class="fas fa-plus"></i> Add Your First Experience
                </button>
            </div>
        `;
    } else {
        experienceTimeline.innerHTML = portfolioData.experience.map(exp => `
            <div class="experience-item">
                <div class="experience-header">
                    <h4>${exp.position}</h4>
                    <span class="experience-company">${exp.company}</span>
                </div>
                <div class="experience-dates">
                    ${exp.startDate} - ${exp.endDate || 'Present'}
                </div>
                <div class="experience-description">
                    ${exp.description}
                </div>
                <button class="btn btn-outline" onclick="removeExperience(${exp.id})">
                    <i class="fas fa-times"></i> Remove
                </button>
            </div>
        `).join('');
    }
    
    // Update projects display
    const projectsGrid = document.getElementById('projects-grid');
    if (portfolioData.projects.length === 0) {
        projectsGrid.innerHTML = `
            <div class="no-projects-message">
                <i class="fas fa-project-diagram"></i>
                <h3>No projects added yet</h3>
                <p>Showcase your amazing work to potential employers!</p>
                <button class="btn btn-primary" onclick="showAddProjectForm()">
                    <i class="fas fa-plus"></i> Add Your First Project
                </button>
            </div>
        `;
    } else {
        projectsGrid.innerHTML = portfolioData.projects.map(project => `
            <div class="project-item">
                <div class="project-header">
                    <h4>${project.name}</h4>
                    <span class="project-tech">${project.tech}</span>
                </div>
                <div class="project-description">
                    ${project.description}
                </div>
                ${project.link ? `<div class="project-link">
                    <a href="${project.link}" target="_blank">
                        <i class="fas fa-external-link-alt"></i> View Project
                    </a>
                </div>` : ''}
                ${project.image ? `<img src="${project.image}" alt="${project.name}" class="project-image">` : ''}
                <button class="btn btn-outline" onclick="removeProject(${project.id})">
                    <i class="fas fa-times"></i> Remove
                </button>
            </div>
        `).join('');
    }
    
    // Update portfolio stats
    updatePortfolioStats();
}

function updatePortfolioStats() {
    portfolioData.stats.projects = portfolioData.projects.length;
    
    document.getElementById('portfolio-views').textContent = portfolioData.stats.views || 0;
    document.getElementById('total-projects').textContent = portfolioData.stats.projects;
    document.getElementById('portfolio-rating').textContent = portfolioData.stats.rating || 0;
}

function updateProfileDisplay() {
    const profile = portfolioData.profile;
    document.getElementById('profile-name-display').textContent = profile.name || 'Your Name';
    document.getElementById('profile-title-display').textContent = profile.title || 'Professional Title';
    document.getElementById('profile-bio-display').textContent = profile.bio || 'Your professional bio and description goes here...';
    document.getElementById('profile-email-display').textContent = profile.email || 'email@example.com';
    document.getElementById('profile-phone-display').textContent = profile.phone || '+1234567890';
    document.getElementById('profile-location-display').textContent = profile.location || 'City, Country';
    document.getElementById('profile-avatar-img').src = profile.avatar;
}

function cancelProfileEdit() {
    document.getElementById('profile-form-container').style.display = 'none';
    document.getElementById('profile-display').style.display = 'block';
}

function uploadProfilePicture() {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                portfolioData.profile.avatar = e.target.result;
                updateProfileDisplay();
                
                // Save to localStorage
                localStorage.setItem('portfolioProfile', JSON.stringify(portfolioData.profile));
                
                showMessage('portfolio-message', 'Profile picture updated!', 'success');
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

// Initialize blog and portfolio functionality
document.addEventListener('DOMContentLoaded', async function() {
    // Wait for session manager to initialize
    if (window.sessionManager) {
        await window.sessionManager.init();
    }
    
    // Load saved data from secure session
    let savedBlogPosts = null;
    let savedPortfolioData = null;
    
    if (window.sessionManager) {
        savedBlogPosts = window.sessionManager.getBlogPosts();
        savedPortfolioData = window.sessionManager.getPortfolioData();
    }
    
    if (savedBlogPosts && savedBlogPosts.length > 0) {
        blogPosts = savedBlogPosts;
        displayBlogPosts();
        updateBlogStats();
    }
    
    if (savedPortfolioData && Object.keys(savedPortfolioData).length > 0) {
        portfolioData = savedPortfolioData;
        updatePortfolioDisplay();
        updateProfileDisplay();
    }
    
    // Add event listeners
    const blogForm = document.getElementById('create-blog-form');
    if (blogForm) {
        blogForm.addEventListener('submit', createBlogPost);
    }
    
    const toggleBlogBtn = document.getElementById('toggle-blog-form');
    if (toggleBlogBtn) {
        toggleBlogBtn.addEventListener('click', toggleBlogForm);
    }
    
    const skillForm = document.getElementById('add-skill-form');
    if (skillForm) {
        skillForm.addEventListener('submit', addSkill);
    }
    
    const experienceForm = document.getElementById('add-experience-form');
    if (experienceForm) {
        experienceForm.addEventListener('submit', addExperience);
    }
    
    const projectForm = document.getElementById('add-project-form');
    if (projectForm) {
        projectForm.addEventListener('submit', addProject);
    }
    
    const profileForm = document.getElementById('edit-profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            portfolioData.profile = {
                ...portfolioData.profile,
                name: document.getElementById('profile-name').value,
                title: document.getElementById('profile-title').value,
                bio: document.getElementById('profile-bio').value,
                email: document.getElementById('profile-email').value,
                phone: document.getElementById('profile-phone').value,
                location: document.getElementById('profile-location').value,
                website: document.getElementById('profile-website').value,
                category: document.getElementById('profile-category').value
            };
            
            localStorage.setItem('portfolioProfile', JSON.stringify(portfolioData.profile));
            updateProfileDisplay();
            
            document.getElementById('profile-form-container').style.display = 'none';
            document.getElementById('profile-display').style.display = 'block';
            
            showMessage('portfolio-message', 'Profile updated successfully!', 'success');
        });
    }
    
    const toggleProfileBtn = document.getElementById('toggle-profile-form');
    if (toggleProfileBtn) {
        toggleProfileBtn.addEventListener('click', function() {
            const formContainer = document.getElementById('profile-form-container');
            const profileDisplay = document.getElementById('profile-display');
            
            if (formContainer.style.display === 'none' || formContainer.style.display === '') {
                formContainer.style.display = 'block';
                profileDisplay.style.display = 'none';
                toggleProfileBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Edit Profile';
            } else {
                formContainer.style.display = 'none';
                profileDisplay.style.display = 'block';
                toggleProfileBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Edit Profile';
            }
        });
    }
    
    // Blog search and filter
    const blogSearch = document.getElementById('blog-search');
    const blogCategoryFilter = document.getElementById('blog-filter-category');
    const blogStatusFilter = document.getElementById('blog-filter-status');
    
    if (blogSearch) {
        blogSearch.addEventListener('input', function() {
            filterBlogPosts();
        });
    }
    
    if (blogCategoryFilter) {
        blogCategoryFilter.addEventListener('change', filterBlogPosts);
    }
    
    if (blogStatusFilter) {
        blogStatusFilter.addEventListener('change', filterBlogPosts);
    }
});

function filterBlogPosts() {
    const searchTerm = document.getElementById('blog-search').value.toLowerCase();
    const categoryFilter = document.getElementById('blog-filter-category').value;
    const statusFilter = document.getElementById('blog-filter-status').value;
    
    const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    
    const filteredPosts = posts.filter(post => {
        const matchesSearch = !searchTerm || 
            post.title.toLowerCase().includes(searchTerm) ||
            post.content.toLowerCase().includes(searchTerm) ||
            post.excerpt.toLowerCase().includes(searchTerm);
        
        const matchesCategory = !categoryFilter || post.category === categoryFilter;
        const matchesStatus = !statusFilter || post.status === statusFilter;
        
        return matchesSearch && matchesCategory && matchesStatus;
    });
    
    // Update display
    const postsGrid = document.getElementById('blog-posts-grid');
    if (filteredPosts.length === 0) {
        postsGrid.innerHTML = `
            <div class="no-posts-message">
                <i class="fas fa-search"></i>
                <h3>No posts found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
    } else {
        postsGrid.innerHTML = filteredPosts.map(post => `
            <div class="blog-post-card">
                <div class="blog-post-header">
                    <h4>${post.title}</h4>
                    <div class="blog-post-meta">
                        <span class="blog-category">${post.category}</span>
                        <span class="blog-date">${new Date(post.createdAt).toLocaleDateString()}</span>
                        <span class="blog-status ${post.status}">${post.status}</span>
                    </div>
                </div>
                ${post.featuredImage ? `<img src="${post.featuredImage}" alt="${post.title}" class="blog-post-image">` : ''}
                <div class="blog-post-excerpt">${post.excerpt || post.content.substring(0, 150) + '...'}</div>
                <div class="blog-post-footer">
                    <div class="blog-post-stats">
                        <span><i class="fas fa-eye"></i> ${post.views || 0}</span>
                        <span><i class="fas fa-heart"></i> ${post.likes || 0}</span>
                    </div>
                    <div class="blog-post-actions">
                        <button class="btn btn-primary" onclick="editBlogPost(${post.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-outline" onclick="deleteBlogPost(${post.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function showMessage(elementId, message, type) {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `message ${type}`;
        messageElement.style.display = 'block';
        
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 5000);
    }
}

// Text formatting functions for blog editor
function formatText(command) {
    const textarea = document.getElementById('blog-content');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let formattedText = '';
    
    switch(command) {
        case 'bold':
            formattedText = `**${selectedText}**`;
            break;
        case 'italic':
            formattedText = `*${selectedText}*`;
            break;
        case 'underline':
            formattedText = `__${selectedText}__`;
            break;
        default:
            formattedText = selectedText;
    }
    
    textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
    textarea.focus();
    textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
}

function insertLink() {
    const url = prompt('Enter URL:');
    if (url) {
        const textarea = document.getElementById('blog-content');
        if (!textarea) return;
        
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        const linkText = selectedText || prompt('Enter link text:') || url;
        
        const linkMarkdown = `[${linkText}](${url})`;
        textarea.value = textarea.value.substring(0, start) + linkMarkdown + textarea.value.substring(end);
        textarea.focus();
    }
}

function insertImage() {
    const url = prompt('Enter image URL:');
    if (url) {
        const textarea = document.getElementById('blog-content');
        if (!textarea) return;
        
        const alt = prompt('Enter alt text:') || '';
        const imageMarkdown = `![${alt}](${url})`;
        
        const start = textarea.selectionStart;
        textarea.value = textarea.value.substring(0, start) + imageMarkdown + textarea.value.substring(start);
        textarea.focus();
    }
}

function previewBlogPost() {
    const title = document.getElementById('blog-title')?.value || '';
    const content = document.getElementById('blog-content')?.value || '';
    const excerpt = document.getElementById('blog-excerpt')?.value || '';
    const featuredImage = document.getElementById('blog-featured-image')?.value || '';
    
    if (!title && !content) {
        if (window.notifications) {
            window.notifications.warning('Please add some content to preview');
        } else {
            alert('Please add some content to preview');
        }
        return;
    }
    
    // Create preview modal
    const previewModal = document.createElement('div');
    previewModal.className = 'modal';
    previewModal.style.display = 'block';
    previewModal.innerHTML = `
        <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h3><i class="fas fa-eye"></i> Blog Post Preview</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="blog-preview">
                    ${featuredImage ? `<img src="${featuredImage}" alt="${title}" class="blog-preview-image" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">` : ''}
                    <h1 class="blog-preview-title">${title || 'Untitled'}</h1>
                    ${excerpt ? `<p class="blog-preview-excerpt" style="color: #666; font-style: italic; margin-bottom: 20px;">${excerpt}</p>` : ''}
                    <div class="blog-preview-content" style="line-height: 1.6; white-space: pre-wrap;">${content || 'No content'}</div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="this.closest('.modal').remove()">Close Preview</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(previewModal);
    
    // Close on outside click
    previewModal.addEventListener('click', function(e) {
        if (e.target === previewModal) {
            previewModal.remove();
        }
    });
}

// Make functions globally accessible for HTML onclick handlers
window.createBlogPost = createBlogPost;
window.saveDraft = saveDraft;
window.clearBlogForm = clearBlogForm;
window.editBlogPost = editBlogPost;
window.deleteBlogPost = deleteBlogPost;
window.formatText = formatText;
window.insertLink = insertLink;
window.insertImage = insertImage;
window.toggleBlogForm = toggleBlogForm;
window.previewBlogPost = previewBlogPost;
